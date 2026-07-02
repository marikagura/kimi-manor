// server.mjs — cc-gild backend: static host + terminal/agent bridges + live state.
//
//   Serves ./public (the terminal shell) and ./cc-gild-v7.html at /atelier, plus
//   /assets and /avatars. Everything below is OPTIONAL and degrades gracefully —
//   if a tool isn't installed or a key isn't set, that surface just goes quiet.
//
//   WebSocket bridges:
//     /pty    → a real Claude Code (or shell) PTY            (needs node-pty)
//     /agent  → the Claude Agent SDK · The Salon · Claude seat (needs @anthropic-ai/claude-agent-sdk)
//     /codex  → the Codex CLI       · The Salon · GPT seat     (needs `codex` on PATH)
//     /state  → pushes atelier state (placeholder from state.sample.json; re-pushes on change)
//   HTTP:
//     POST /parlour/voice → text-to-speech for The Parlour — bring your own TTS (see env)
//
// Run on the machine where Claude Code lives:
//   npm install            (ws required; node-pty optional — terminal degrades if absent)
//   node server.mjs        → http://localhost:7681   (atelier: /atelier)
//
// Env — all optional:
//   PORT=7681  CC_CMD="claude"  CC_CWD="/path"  SHELL_FALLBACK=1
//   CCG_SDK=/abs/path/to/sdk.mjs   override the Claude Agent SDK location for /agent
//   CCG_AGENT_CWD=/path            working dir for /agent          (default: CC_CWD)
//   CCG_CWD_ALLOW=~/a,~/b          extra dirs the agent may run in (comma-separated)
//   CODEX_BIN=codex                codex binary for /codex
//   OPENAI_API_KEY=sk-...          enables /parlour/voice via OpenAI TTS
//   CCG_TTS_URL  CCG_TTS_KEY       point /parlour/voice at any OpenAI-compatible TTS endpoint
//   CCG_TTS_MODEL=gpt-4o-mini-tts  CCG_VOICE_CLAUDE=onyx  CCG_VOICE_GPT=cedar
//   ── live state from kimi (optional; else state.sample.json) ──
//   DATABASE_URL=postgres://…      Tier 1: read kimi-room's store_rows directly (npm i pg)
//   KIMI_CORE_URL + KIMI_API_KEY   Tier 2: pull state_snapshot from kimi-core (npm i @modelcontextprotocol/sdk)
//   STATE_REFRESH=60               poll seconds for Tier 1/2 re-push (0 = off)

import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { existsSync, watch, mkdirSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC = join(ROOT, 'public');
const PORT = Number(process.env.PORT || 7681);
const CC_CMD = process.env.CC_CMD || 'claude';
const CC_CWD = process.env.CC_CWD || process.env.HOME || process.cwd();
const _HOME = process.env.HOME || '';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css; charset=utf-8',
};

// root-level files server.mjs may serve (besides ./public). /atelier → the v7 build.
const ROOT_FILES = {
  '/atelier': 'cc-gild-v7.html', '/cc-gild-v7.html': 'cc-gild-v7.html',
  '/state.sample.json': 'state.sample.json',
};

// ── HTTP: static host + /parlour/voice ──────────────────────────────────────
// Host allowlist: the server binds 127.0.0.1, so every legitimate request carries
// a localhost Host header. A foreign Host means DNS rebinding — a browser page on
// evil.example whose DNS re-resolves to 127.0.0.1 reaches us "same-origin" (so no
// Origin header to check) but cannot forge Host. Reject those outright.
function isLocalHost(req) {
  const host = String(req.headers.host || '');
  const name = host.replace(/:\d+$/, '');
  return name === 'localhost' || name === '127.0.0.1' || name === '[::1]';
}

const server = http.createServer(async (req, res) => {
  try {
    if (!isLocalHost(req)) { res.writeHead(403); return res.end('forbidden'); }
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);

    if (p === '/parlour/voice' && req.method === 'POST') return handleVoice(req, res);

    let file;
    if (ROOT_FILES[p]) {
      file = join(ROOT, ROOT_FILES[p]);
    } else if (p.startsWith('/assets/')) {
      file = normalize(join(ROOT, p));
      if (!file.startsWith(join(ROOT, 'assets'))) { res.writeHead(403); return res.end('forbidden'); }
    } else if (p.startsWith('/avatars/')) {
      // optional private photos — gitignored, not in the repo. 404 → the UI keeps its painted letter.
      file = normalize(join(ROOT, p));
      if (!file.startsWith(join(ROOT, 'avatars'))) { res.writeHead(403); return res.end('forbidden'); }
    } else {
      if (p === '/') p = '/index.html';
      file = normalize(join(PUBLIC, p));
      if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end('forbidden'); }
    }

    if (!existsSync(file)) { res.writeHead(404); return res.end('not found'); }
    const body = await readFile(file);
    const ext = extname(file);
    const headers = { 'content-type': MIME[ext] || 'application/octet-stream' };
    // never cache code files — a stale shell makes edits look like they didn't land.
    if (ext === '.html' || ext === '.js' || ext === '.css') headers['cache-control'] = 'no-cache, no-store, must-revalidate';
    res.writeHead(200, headers);
    res.end(body);
  } catch (e) { res.writeHead(500); res.end(String(e)); }
});

// ── /parlour/voice — text-to-speech proxy (bring your own) ───────────────────
// POST {text, who:'claude'|'gpt'} → {audio:<base64 mp3>, zh:<caption>}.
// Defaults to OpenAI's /v1/audio/speech; point CCG_TTS_URL at any compatible endpoint.
// No key set → 503, and the UI simply shows the text with no audio.
const TTS_URL = process.env.CCG_TTS_URL || 'https://api.openai.com/v1/audio/speech';
const TTS_KEY = process.env.CCG_TTS_KEY || process.env.OPENAI_API_KEY || '';
const TTS_MODEL = process.env.CCG_TTS_MODEL || 'gpt-4o-mini-tts';
const TTS_VOICE = { claude: process.env.CCG_VOICE_CLAUDE || 'onyx', gpt: process.env.CCG_VOICE_GPT || 'cedar' };
async function handleVoice(req, res) {
  if (!TTS_KEY) {
    res.writeHead(503, { 'content-type': 'application/json' });
    return res.end('{"error":"no TTS configured — set OPENAI_API_KEY, or CCG_TTS_URL + CCG_TTS_KEY"}');
  }
  // cap the body — this endpoint spends TTS credits and buffers in memory.
  let buf = '';
  for await (const c of req) {
    buf += c;
    if (buf.length > 64 * 1024) { res.writeHead(413, { 'content-type': 'application/json' }); return res.end('{"error":"body too large"}'); }
  }
  let d = {}; try { d = JSON.parse(buf); } catch (_) {}
  const text = String(d.text || '').trim();
  const who = d.who === 'gpt' ? 'gpt' : 'claude';
  if (!text) { res.writeHead(400, { 'content-type': 'application/json' }); return res.end('{"error":"text required"}'); }
  try {
    const r = await fetch(TTS_URL, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + TTS_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: TTS_MODEL, voice: TTS_VOICE[who], input: text, response_format: 'mp3' }),
    });
    if (!r.ok) {
      const t = await r.text();
      res.writeHead(r.status, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: t.slice(0, 300) }));
    }
    const audio = Buffer.from(await r.arrayBuffer()).toString('base64');
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ audio, zh: text }));   // OSS has no translation step → caption = the original text
  } catch (e) {
    res.writeHead(502, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ error: String(e.message) }));
  }
}

// ── /state — live atelier state push ────────────────────────────────────────
// Three tiers, picked by env (all optional → graceful fallback to the placeholder):
//   Tier 2  KIMI_CORE_URL + KIMI_API_KEY  → a running kimi-core (state_snapshot)
//   Tier 1  DATABASE_URL                  → kimi-room's store_rows over pg (no core)
//   Tier 0  (neither)                     → state.sample.json (offline demo)
// The mapped result is partial; the front deep-merges it over the inlined
// placeholder, so any unmapped panel keeps the demo. See STATE-SCHEMA.md.
async function readSample() {
  try { return JSON.parse(await readFile(join(ROOT, 'state.sample.json'), 'utf8')); } catch (_) { return {}; }
}
// Live tiers pull YOUR data (no core: store_rows over pg · core: state_snapshot)
// and hand it to mapToState() — which ships as a stub returning {} (demo). Fill it
// to render your own panels (server-state-from-rows.mjs). A live tier returns a
// PARTIAL state; the front deep-merges it over the inlined demo. No tier → demo.
async function composeState() {
  try {
    if (process.env.KIMI_CORE_URL && process.env.KIMI_API_KEY) {
      const { fetchSnapshot } = await import('./server-state-from-core.mjs');
      const { mapToState } = await import('./server-state-from-rows.mjs');
      const s = mapToState(await fetchSnapshot(process.env.KIMI_CORE_URL, process.env.KIMI_API_KEY));
      if (_wx) s.weather = _wx;
      return s;
    }
    if (process.env.DATABASE_URL) {
      const { fetchRows } = await import('./server-state-from-db.mjs');
      const { mapToState } = await import('./server-state-from-rows.mjs');
      const s = mapToState({ store: await fetchRows(process.env.DATABASE_URL) });
      if (_wx) s.weather = _wx;
      return s;
    }
  } catch (e) {
    console.error('[state] source failed → placeholder:', e && e.message);
  }
  const s = await readSample();
  if (_wx) s.weather = _wx;   // optional live weather (open-meteo) merged over the demo
  return s;
}
const stateWss = new WebSocketServer({ noServer: true });
const pushers = new Set();
stateWss.on('connection', (socket) => {
  const send = async () => { if (socket.readyState === 1) { try { socket.send(JSON.stringify(await composeState())); } catch (_) {} } };
  send();                       // initial snapshot
  pushers.add(send);            // re-push on change
  socket.on('close', () => pushers.delete(send));
  // ws emits 'error' on an abrupt client reset; an unlistened 'error' re-throws and
  // crashes the whole backend (and orphans every child). Swallow + drop the socket.
  socket.on('error', () => { pushers.delete(send); try { socket.close(); } catch (_) {} });
});
// editing state.sample.json pushes to every client (proves the live pipe).
let wt = null;
try { watch(join(ROOT, 'state.sample.json'), () => { clearTimeout(wt); wt = setTimeout(() => pushers.forEach((f) => f()), 120); }); } catch (_) {}
// Tier 1/2 have no file to watch — poll the backend every STATE_REFRESH seconds
// (default 60; set 0 to disable) and re-push to live clients.
const STATE_REFRESH = Number(process.env.STATE_REFRESH || 60);
if (STATE_REFRESH > 0 && (process.env.KIMI_CORE_URL || process.env.DATABASE_URL)) {
  setInterval(() => pushers.forEach((f) => f()), Math.max(5, STATE_REFRESH) * 1000);
}

// ── optional live weather (open-meteo · keyless) ────────────────────────────
// Blank by default — set CCG_WEATHER_LAT / CCG_WEATHER_LNG / CCG_WEATHER_PLACE to your location,
// or set CCG_WEATHER=off to keep the demo. Refreshed every 10 min, merged into state.weather
// and pushed to live clients. No API key required.
const WX_ON = (process.env.CCG_WEATHER || 'on') !== 'off';
const WX_LAT = process.env.CCG_WEATHER_LAT || '';
const WX_LNG = process.env.CCG_WEATHER_LNG || '';
const WX_PLACE = process.env.CCG_WEATHER_PLACE || '';
const WMO = {  // WMO weather code → the shell's icon state + a short caption
  0: { state: 'sun', cond: 'clear sky' }, 1: { state: 'sun', cond: 'mainly clear' },
  2: { state: 'cloud', cond: 'partly cloudy' }, 3: { state: 'cloud', cond: 'overcast' },
  45: { state: 'fog', cond: 'fog' }, 48: { state: 'fog', cond: 'rime fog' },
  51: { state: 'rain', cond: 'light drizzle' }, 53: { state: 'rain', cond: 'drizzle' }, 55: { state: 'rain', cond: 'dense drizzle' },
  56: { state: 'rain', cond: 'freezing drizzle' }, 57: { state: 'rain', cond: 'freezing drizzle' },
  61: { state: 'rain', cond: 'light rain' }, 63: { state: 'rain', cond: 'rain' }, 65: { state: 'rain', cond: 'heavy rain' },
  66: { state: 'rain', cond: 'freezing rain' }, 67: { state: 'rain', cond: 'freezing rain' },
  71: { state: 'snow', cond: 'light snow' }, 73: { state: 'snow', cond: 'snow' }, 75: { state: 'snow', cond: 'heavy snow' },
  77: { state: 'snow', cond: 'snow grains' },
  80: { state: 'rain', cond: 'rain showers' }, 81: { state: 'rain', cond: 'rain showers' }, 82: { state: 'rain', cond: 'violent showers' },
  85: { state: 'snow', cond: 'snow showers' }, 86: { state: 'snow', cond: 'snow showers' },
  95: { state: 'storm', cond: 'thunderstorm' }, 96: { state: 'storm', cond: 'thunderstorm, hail' }, 99: { state: 'storm', cond: 'thunderstorm, hail' },
};
let _wx = null, _wxAt = 0, _wxBusy = false;
async function refreshWeather() {
  if (!WX_ON || _wxBusy || (Date.now() - _wxAt < 600000)) return;
  _wxBusy = true;
  try {
    const u = `https://api.open-meteo.com/v1/forecast?latitude=${WX_LAT}&longitude=${WX_LNG}` +
              `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=ms`;
    const r = await fetch(u);
    if (r.ok) {
      const c = (await r.json()).current || {};
      const m = WMO[c.weather_code] || { state: 'cloud', cond: 'overcast' };
      _wx = {
        state: m.state, moonState: 'moon_full', place: WX_PLACE,
        temp: Math.round(c.temperature_2m) + '°C', cond: m.cond,
        detail: 'humidity ' + Math.round(c.relative_humidity_2m) + '% · wind ' + Math.round(c.wind_speed_10m) + ' m/s',
      };
      pushers.forEach((f) => f());   // refresh any live clients
    }
  } catch (_) {}
  _wxBusy = false; _wxAt = Date.now();
}
if (WX_ON) { refreshWeather(); setInterval(refreshWeather, 600000); }

// ── /pty — Claude Code terminal bridge (node-pty lazy/optional) ──────────────
let _pty = null;
async function getPty() {
  if (_pty !== null) return _pty;
  try { _pty = await import('node-pty'); } catch (_) { _pty = false; }
  return _pty;
}
function pickShell() {
  // Always spawn a real shell → the terminal is a terminal: Ctrl-C interrupts the
  // foreground command and returns to the prompt instead of killing the whole pty.
  // To auto-run a command on open (e.g. claude) INSIDE that shell, set CC_AUTOSTART
  // (default none) — it runs in the shell, so Ctrl-C / exiting it drops back to the prompt.
  return { cmd: process.platform === 'win32' ? 'powershell.exe' : (process.env.SHELL || 'bash'), args: [] };
}
const ptyWss = new WebSocketServer({ noServer: true });
// Track live ptys so a server shutdown (e.g. the desktop shell's quit → SIGTERM) kills the
// shell/claude children too — otherwise each pty orphans and keeps running across quits.
const LIVE_TERMS = new Set();
// Likewise track /codex child processes and /agent AbortControllers so _shutdown can kill/abort
// them. On SIGTERM process.exit runs synchronously, so socket 'close' can't fire in time —
// without this registry the codex/claude children orphan on every mid-run quit.
const LIVE_CODEX = new Set();
const LIVE_AGENTS = new Set();

// ── /agent — Claude Agent SDK bridge (The Salon · Claude seat) ───────────────
// Uses the locally installed @anthropic-ai/claude-agent-sdk (or CCG_SDK), the
// claude_code preset, and your existing `claude` login. Tool calls are surfaced to
// the UI for per-call approval; read-only tools auto-allow under the default policy.
const AGENT_CWD = process.env.CCG_AGENT_CWD || CC_CWD;
const CWD_ALLOW = new Set([
  AGENT_CWD,
  ...(process.env.CCG_CWD_ALLOW || '').split(',').map((s) => s.trim()).filter(Boolean).map((p) => p.replace(/^~/, _HOME)),
]);
function resolveCwd(p) { if (!p) return AGENT_CWD; const abs = String(p).replace(/^~/, _HOME); return CWD_ALLOW.has(abs) ? abs : null; }
let _sdk = null;
async function getSdk() {
  if (_sdk !== null) return _sdk;
  try { _sdk = process.env.CCG_SDK ? await import(process.env.CCG_SDK) : await import('@anthropic-ai/claude-agent-sdk'); }
  catch (e) { console.error('[agent] SDK import failed:', e.message); _sdk = false; }
  return _sdk;
}
const agentWss = new WebSocketServer({ noServer: true });

// ── /codex — Codex CLI bridge (The Salon · GPT seat) ─────────────────────────
// Spawns `codex exec --json` with your own ChatGPT-plan / API auth. Read-only
// sandbox, shell tool off — the seat can read the working dir but not write or run.
const CODEX_BIN = process.env.CODEX_BIN || 'codex';
const SALON_CWD = join(_HOME || process.cwd(), '.cache', 'cc-gild-salon');
try { mkdirSync(SALON_CWD, { recursive: true }); } catch (_) {}
const CODEX_COMMON = [
  '-c', 'model_reasoning_effort="high"',
  '-c', 'approval_policy="never"',
  '-c', 'sandbox_mode="read-only"',
  '-c', 'features.shell_tool=false',
  '--json', '--skip-git-repo-check',
];
const codexWss = new WebSocketServer({ noServer: true });

// one upgrade router — multiple WSS on one http server must share a single 'upgrade'
// handler, or separate {server,path} instances corrupt each other's frames.
server.on('upgrade', (req, sock, head) => {
  let pathname = '/';
  try { pathname = new URL(req.url, 'http://x').pathname; } catch (_) {}
  // only accept WS from the local app: same-origin localhost, or no Origin (electron/cli).
  // a cross-origin page's JS is rejected; combined with the 127.0.0.1 bind + the Host
  // allowlist (kills DNS rebinding), nothing off-box connects. NOTE this is the whole
  // gate — there is no token auth. Do not front this server with a reverse proxy or
  // tunnel: proxies connect from localhost and often strip Origin, which would hand
  // the /pty shell to anyone who reaches the proxy.
  if (!isLocalHost(req)) { try { sock.destroy(); } catch (_) {} return; }
  const origin = req.headers.origin;
  if (origin && origin !== 'http://localhost:' + PORT && origin !== 'http://127.0.0.1:' + PORT) { try { sock.destroy(); } catch (_) {} return; }
  if (pathname === '/state') stateWss.handleUpgrade(req, sock, head, (ws) => stateWss.emit('connection', ws, req));
  else if (pathname === '/pty') ptyWss.handleUpgrade(req, sock, head, (ws) => ptyWss.emit('connection', ws, req));
  else if (pathname === '/agent') agentWss.handleUpgrade(req, sock, head, (ws) => agentWss.emit('connection', ws, req));
  else if (pathname === '/codex') codexWss.handleUpgrade(req, sock, head, (ws) => codexWss.emit('connection', ws, req));
  else sock.destroy();
});

const MAX_TERMS = Number(process.env.CC_MAX_TERMS || 12);

ptyWss.on('connection', async (socket) => {
  // Attach 'error' FIRST, before any await or early return: an unlistened 'error'
  // (abrupt client RST during the async pty import, or on a socket left open by the
  // no-pty degraded path below) re-throws and takes down the whole backend.
  socket.on('error', () => { try { socket.close(); } catch (_) {} });
  // Cap live ptys: every connection is a real shell, and without a ceiling one
  // looping client re-opens the ttys/pty-exhaustion failure this codebase has
  // already been burned by.
  if (LIVE_TERMS.size >= MAX_TERMS) {
    socket.send(`\r\n\x1b[38;2;191;122;74m终端数已达上限（${MAX_TERMS}）。\x1b[0m\r\n` +
                '\x1b[38;2;182;164;140m关掉不用的终端再试；上限可用 CC_MAX_TERMS 调。\x1b[0m\r\n');
    try { socket.close(); } catch (_) {}
    return;
  }
  const pty = await getPty();
  if (!pty) {
    socket.send('\r\n\x1b[38;2;191;122;74m终端桥不可用：node-pty 未安装。\x1b[0m\r\n' +
                '\x1b[38;2;182;164;140mnpm install node-pty 后重启；状态面板与 /state 不受影响。\x1b[0m\r\n');
    return;
  }
  const { cmd, args } = pickShell();
  let term;
  try {
    term = pty.spawn(cmd, args, {
      name: 'xterm-256color', cols: 80, rows: 24, cwd: CC_CWD,
      // UTF-8 locale — a GUI launch (Finder/Dock) inherits no LANG, so the pty falls back
      // to C/POSIX; zsh line-editing and TUI apps then treat multibyte UTF-8 as single
      // bytes (per-byte input echo, mojibake on select-copy). Supply LANG + LC_CTYPE,
      // respecting any value already in the environment.
      env: {
        ...process.env,
        LANG: process.env.LANG || 'en_US.UTF-8',
        LC_CTYPE: process.env.LC_CTYPE || process.env.LANG || 'en_US.UTF-8',
        TERM: 'xterm-256color', COLORTERM: 'truecolor',
      },
    });
  } catch (e) {
    socket.send(`\r\n\x1b[38;2;191;122;74m无法启动 "${cmd}": ${e.message}\x1b[0m\r\n` +
                `\x1b[38;2;182;164;140m试试 SHELL_FALLBACK=1 node server.mjs 先跑个 shell。\x1b[0m\r\n`);
    return;
  }
  LIVE_TERMS.add(term);
  term.onData((d) => { if (socket.readyState === 1) socket.send(d); });
  term.onExit(() => { LIVE_TERMS.delete(term); try { socket.close(); } catch (_) {} });
  // init: ① clean prompt — hide user@host so the terminal never leaks the username/host;
  //       ② clear the entry prompt line; ③ optionally auto-run CC_AUTOSTART (e.g. claude).
  const sh = process.env.SHELL || '';
  const cleanPrompt = /zsh/.test(sh) ? "PROMPT='%~ ❯ '" : (/bash/.test(sh) ? "PS1='\\w \\$ '" : "");
  const autostart = process.env.CC_AUTOSTART || '';
  const initCmd = [cleanPrompt, 'clear', autostart].filter(Boolean).join('; ');
  if (initCmd) setTimeout(() => { try { term.write(initCmd + '\r'); } catch (_) {} }, 400);
  socket.on('message', (raw) => {
    const msg = raw.toString();
    const kind = msg[0], data = msg.slice(1);
    if (kind === '0') term.write(data);
    else if (kind === '1') { try { const { cols, rows } = JSON.parse(data); term.resize(cols, rows); } catch (_) {} }
  });
  socket.on('close', () => { LIVE_TERMS.delete(term); try { term.kill(); } catch (_) {} });
  // An unlistened 'error' (e.g. an abrupt client RST) re-throws and crashes the backend;
  // swallow it and kill this pty.
  socket.on('error', () => { LIVE_TERMS.delete(term); try { term.kill(); } catch (_) {} try { socket.close(); } catch (_) {} });
});

agentWss.on('connection', async (socket) => {
  // Early 'error' guard — before the await and the degraded return below, for the
  // same reason as /pty: an unlistened socket error crashes the whole backend.
  // The full handler (abort + close) is attached further down once state exists.
  socket.on('error', () => { try { socket.close(); } catch (_) {} });
  const sdk = await getSdk();
  if (!sdk || !sdk.query) { try { socket.send(JSON.stringify({ type: 'error', error: 'agent SDK unavailable — npm i @anthropic-ai/claude-agent-sdk (or set CCG_SDK)' })); } catch (_) {} return; }
  let sessionId = null, busy = false, permSeq = 0, curAbort = null;
  const pending = new Map();              // approval id → resolve(allow:boolean)
  const send = (o) => { if (socket.readyState === 1) { try { socket.send(JSON.stringify(o)); } catch (_) {} } };
  const drainPending = () => { for (const [id, r] of pending) { pending.delete(id); r(false); } };
  const setSid = (id) => { if (id && id !== sessionId) { sessionId = id; send({ type: 'session', id }); } else if (id) sessionId = id; };
  socket.on('message', async (raw) => {
    let m; try { m = JSON.parse(raw.toString()); } catch (_) { return; }
    if (!m) return;
    if (m.type === 'permit') { const r = pending.get(m.id); if (r) { pending.delete(m.id); r(!!m.allow); } return; }
    if (m.type === 'interrupt') { if (curAbort) { try { curAbort.abort(); } catch (_) {} } return; }
    if (m.type !== 'say' || busy) return;
    const text = String(m.text || '').trim(); if (!text) return;
    const cwd = resolveCwd(m.cwd);
    if (!cwd) { send({ type: 'error', error: 'cwd not allowed: ' + m.cwd }); return; }
    busy = true;
    const ac = new AbortController(); curAbort = ac;
    LIVE_AGENTS.add(ac);   // register for shutdown so _shutdown can abort an in-flight query
    try {
      const opts = {
        cwd,
        abortController: ac,
        systemPrompt: { type: 'preset', preset: 'claude_code', ...(m.persona ? { append: String(m.persona).slice(0, 2000) } : {}) },
        permissionMode: 'default',
        canUseTool: async (tool, input) => {
          const id = 'p' + (++permSeq);
          send({ type: 'permission', id, tool, input });
          const allow = await new Promise((res) => { pending.set(id, res); });
          return allow ? { behavior: 'allow', updatedInput: input } : { behavior: 'deny', message: 'tool call denied' };
        },
      };
      const resume = m.resume || sessionId;
      if (resume) opts.resume = resume;
      if (m.model && /^claude-[a-z0-9.\-\[\]m]+$/i.test(String(m.model))) opts.model = String(m.model);
      const q = sdk.query({ prompt: text, options: opts });
      for await (const msg of q) {
        if (msg.type === 'assistant' && msg.message && Array.isArray(msg.message.content)) {
          for (const b of msg.message.content) {
            if (b.type === 'text' && b.text) send({ type: 'text', text: b.text });
            else if (b.type === 'tool_use') send({ type: 'tool', id: b.id, name: b.name, input: b.input });
          }
          setSid(msg.session_id);
        } else if (msg.type === 'user' && msg.message && Array.isArray(msg.message.content)) {
          for (const b of msg.message.content) {
            if (b.type === 'tool_result') {
              let c = b.content;
              if (Array.isArray(c)) c = c.map((x) => (x && x.type === 'text') ? x.text : '').join('');
              c = String(c == null ? '' : c);
              if (c.length > 4000) c = c.slice(0, 4000) + '\n…(truncated)';
              send({ type: 'tool_result', id: b.tool_use_id, content: c, is_error: !!b.is_error });
            }
          }
        } else if (msg.type === 'result') {
          setSid(msg.session_id);
          send({ type: 'done' });
        }
      }
    } catch (e) { if (ac && ac.signal.aborted) send({ type: 'done' }); else send({ type: 'error', error: e.message }); }
    finally { busy = false; curAbort = null; LIVE_AGENTS.delete(ac); drainPending(); }
  });
  // An ordinary window/socket close must abort the in-flight query too, or the Agent SDK's
  // claude subprocess runs to completion after the user has gone.
  socket.on('close', () => { if (curAbort) { try { curAbort.abort(); } catch (_) {} } drainPending(); });
  socket.on('error', () => { if (curAbort) { try { curAbort.abort(); } catch (_) {} } try { socket.close(); } catch (_) {} });
});

codexWss.on('connection', (socket) => {
  let busy = false, threadId = null, child = null, interrupted = false;
  const send = (o) => { if (socket.readyState === 1) { try { socket.send(JSON.stringify(o)); } catch (_) {} } };
  socket.on('message', (raw) => {
    let m; try { m = JSON.parse(raw.toString()); } catch (_) { return; }
    if (!m) return;
    if (m.type === 'interrupt') { interrupted = true; if (child) { try { child.kill('SIGTERM'); } catch (_) {} } return; }
    if (m.type !== 'say' || busy) return;
    const text = String(m.text || '').trim(); if (!text) return;
    const resume = m.resume || threadId;
    const mdl = (m.model && /^gpt-[0-9.]+(-mini)?$/.test(String(m.model))) ? ['-c', 'model="' + m.model + '"'] : [];
    const args = resume
      ? ['exec', 'resume', resume, ...CODEX_COMMON, ...mdl, text]
      : ['exec', ...CODEX_COMMON, ...mdl, '-C', SALON_CWD, text];
    busy = true; interrupted = false;
    let errBuf = '', gotText = false, buf = '', reportedError = false;   // reportedError: a spawn 'error' must not also report on 'close'
    try { child = spawn(CODEX_BIN, args, { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env } }); }
    catch (e) { busy = false; send({ type: 'error', error: 'codex failed to start: ' + e.message }); return; }
    LIVE_CODEX.add(child);   // register for shutdown so _shutdown can kill this child
    child.stdout.on('data', (d) => {
      buf += d.toString();
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
        if (!line) continue;
        let o; try { o = JSON.parse(line); } catch (_) { continue; }
        if (o.type === 'thread.started' && o.thread_id) { if (o.thread_id !== threadId) { threadId = o.thread_id; send({ type: 'session', id: threadId }); } }
        else if (o.type === 'item.completed' && o.item) {
          const it = o.item;
          if (it.type === 'agent_message' && it.text) { gotText = true; send({ type: 'text', text: it.text }); }
          else if (it.type !== 'reasoning') { send({ type: 'tool', id: it.id || '', name: it.type || 'item', input: it }); }
        }
      }
    });
    child.stderr.on('data', (d) => { errBuf += d.toString(); if (errBuf.length > 2000) errBuf = errBuf.slice(-2000); });
    child.on('error', (e) => { reportedError = true; busy = false; send({ type: 'error', error: 'codex failed to start: ' + e.message }); });
    child.on('close', (code) => {
      LIVE_CODEX.delete(child);
      // If spawn already emitted 'error' (code===null here), don't report a second
      // contradictory 'codex exited null' line for the same failure.
      if (!reportedError && !interrupted && !gotText && code !== 0) send({ type: 'error', error: 'codex exited ' + code + (errBuf ? ': ' + errBuf.trim().split('\n').slice(-3).join(' ') : '') });
      busy = false; send({ type: 'done' });
    });
  });
  socket.on('close', () => { try { child && child.kill(); } catch (_) {} });
  socket.on('error', () => { try { child && child.kill(); } catch (_) {} try { socket.close(); } catch (_) {} });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  ❧ 描金 shell  →  http://localhost:${PORT}`);
  console.log(`     atelier      →  http://localhost:${PORT}/atelier`);
  console.log(`     /state placeholder · /pty → ${CC_CMD} (cwd: ${CC_CWD}) · /agent · /codex · /parlour/voice\n`);
});

// Clean shutdown — kill every live pty so a quit (SIGTERM/SIGINT) doesn't leave orphaned
// shell/claude processes running. Without this they pile up across restarts.
let _shuttingDown = false;
function _shutdown(code = 0) {
  if (_shuttingDown) return; _shuttingDown = true;
  for (const t of LIVE_TERMS) { try { t.kill(); } catch (_) {} }
  LIVE_TERMS.clear();
  // Reap /codex children and abort /agent queries too, or they orphan alongside the backend.
  for (const c of LIVE_CODEX) { try { c.kill(); } catch (_) {} }
  LIVE_CODEX.clear();
  for (const a of LIVE_AGENTS) { try { a.abort(); } catch (_) {} }
  LIVE_AGENTS.clear();
  process.exit(code);
}
// signal handlers pass the signal name as the first arg — wrap so it can't reach process.exit.
process.on('SIGTERM', () => _shutdown(0));
process.on('SIGINT', () => _shutdown(0));
// An uncaught exception/rejection (e.g. a stray socket 'error' that slipped through) must not
// let the process die bare and orphan every child — run _shutdown to reap pty/codex/agent first.
// non-zero exit on a crash so a supervisor/launcher sees the failure (a clean SIGTERM exits 0).
process.on('uncaughtException', (e) => { try { console.error('[fatal] uncaughtException:', e && e.stack || e); } catch (_) {} _shutdown(1); });
process.on('unhandledRejection', (e) => { try { console.error('[fatal] unhandledRejection:', e && e.stack || e); } catch (_) {} _shutdown(1); });
