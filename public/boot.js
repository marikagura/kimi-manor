// boot.js — room-ified CC shell: inject Mucha ornaments, wire xterm↔pty WS,
// render room-style status cards, day/night toggle, mobile drawer, PWA.
import { COLORWAYS, XTERM_THEMES, XTERM_OPTIONS } from './theme.js';
import { medallion, vine, mosaic, moonPhase } from './mucha.js';

/* ---------------- config ---------------- */
const params = new URLSearchParams(location.search);
const WS_URL = params.get('ws')
  || `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.hostname}:7681/pty`;
const STATE_URL = params.get('state') || './state.sample.json';

/* ---------------- theme ---------------- */
let theme = localStorage.getItem('cc-gild-theme') || 'night';
function applyTheme(name) {
  theme = name;
  const c = COLORWAYS[name];
  const r = document.documentElement;
  r.setAttribute('data-theme', name);
  r.style.setProperty('--bg', c.bg);
  r.style.setProperty('--void', c.void);
  r.style.setProperty('--paper', c.paper);
  r.style.setProperty('--ink', c.ink);
  r.style.setProperty('--accent', c.accent);
  r.style.setProperty('--accent2', c.accent2);
  r.style.setProperty('--mute', c.mute);
  r.style.setProperty('--hair', c.hair);
  r.style.setProperty('--rose', c.rose);
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', c.void);
  localStorage.setItem('cc-gild-theme', name);
  if (window.__term) window.__term.options.theme = XTERM_THEMES[name];
  paintOrnaments();
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = name === 'night' ? '夜' : '昼';
}

function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function paintOrnaments() {
  const hair = cssVar('--hair'), accent = cssVar('--accent');
  document.getElementById('medallion').insertAdjacentHTML('afterbegin', '');
  // medallion ring sits behind avatars — set as first child each repaint
  const med = document.getElementById('medallion');
  med.querySelector('svg')?.remove();
  med.insertAdjacentHTML('afterbegin', medallion({ color: hair, accent, size: 150 }));
  document.getElementById('vine').innerHTML = vine({ color: hair, accent });
  document.getElementById('cornerTL').innerHTML = mosaic({ color: hair, accent, size: 40 });
  document.getElementById('cornerTR').innerHTML = mosaic({ color: hair, accent, size: 40 });
  document.getElementById('moon').innerHTML = moonPhase({ phase: window.__moonPhase ?? 0.5, size: 60 });
}

/* ---------------- terminal ---------------- */
const __font = parseFloat(params.get('font'));
const term = new Terminal({ ...XTERM_OPTIONS, theme: XTERM_THEMES[theme], ...(__font ? { fontSize: __font } : {}) });
window.__term = term;
const fit = new FitAddon.FitAddon();
term.loadAddon(fit);
term.loadAddon(new WebLinksAddon.WebLinksAddon());
term.open(document.getElementById('term'));
fit.fit();

const c = (rgb, s) => `\x1b[38;2;${rgb}m${s}\x1b[0m`;
const gold = (s) => c('193;154;86', s);
const mute = (s) => c('168;152;124', s);
const sage = (s) => c('138;155;110', s);

/* ---------------- websocket bridge ---------------- */
let ws = null, reconnectT = null, connected = false, triedOnce = false;
const connEl = document.getElementById('conn');
const connTxt = document.getElementById('connTxt');
function setConn(state) {
  connected = state === 'live';
  connEl.className = 'conn ' + (state === 'live' ? 'live' : 'dead');
  connTxt.textContent = state === 'live' ? '已连接' : (state === 'connecting' ? '连接中…' : '未连接');
}
function sendResize() {
  if (ws && ws.readyState === 1) ws.send('1' + JSON.stringify({ cols: term.cols, rows: term.rows }));
}
function connect() {
  setConn('connecting');
  try { ws = new WebSocket(WS_URL); } catch (e) { return scheduleReconnect(); }
  ws.binaryType = 'arraybuffer';
  ws.onopen = () => { setConn('live'); sendResize(); };
  ws.onmessage = (ev) => term.write(ev.data instanceof ArrayBuffer ? new Uint8Array(ev.data) : ev.data);
  ws.onclose = () => { setConn('dead'); scheduleReconnect(); };
  ws.onerror = () => { try { ws.close(); } catch (_) {} };
}
function scheduleReconnect() {
  if (!triedOnce) {
    triedOnce = true;
    // quiet, on-brand idle screen — not a debug dump
    term.writeln('');
    term.writeln('  ' + gold('❧  atelier'));
    term.writeln('  ' + mute('   waiting for the pty bridge…'));
    term.writeln('');
    term.write('  ' + gold('❯ '));
  }
  clearTimeout(reconnectT);
  reconnectT = setTimeout(connect, 4000);
}
term.onData((d) => {
  if (connected && ws && ws.readyState === 1) ws.send('0' + d);
  else { // offline echo so手感 testable
    if (d === '\r') term.write('\r\n  ' + gold('❯ '));
    else if (d === '\x7f') term.write('\b \b');
    else term.write(d);
  }
});
connect();

/* ---- launch button: one-click "claude" into the shell ----
   OSS default is a bare shell (CC_AUTOSTART unset); this button lets anyone
   start Claude Code without touching env. It types `claude` into the running
   shell, so Ctrl-C / exiting Claude returns to the prompt — the terminal lives. */
(function () {
  const b = document.createElement('button');
  b.id = 'launchClaude';
  b.textContent = '❯ claude';
  b.title = 'Launch Claude in the shell';
  b.setAttribute('aria-label', 'Launch Claude in the shell');
  b.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:40;font-family:var(--mono,ui-monospace,monospace);font-size:12px;font-weight:500;letter-spacing:.08em;color:var(--accent,#c9a96b);background:rgba(20,15,10,0.74);border:0.7px solid var(--accent,#c9a96b);border-radius:99px;padding:7px 15px;cursor:pointer;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)';
  b.onclick = () => { if (ws && ws.readyState === 1) { ws.send('0' + 'claude\r'); } term.focus(); };
  document.body.appendChild(b);
})();

const ro = new ResizeObserver(() => { fit.fit(); sendResize(); });
ro.observe(document.getElementById('term'));
window.addEventListener('orientationchange', () => setTimeout(() => { fit.fit(); sendResize(); }, 300));

/* ---------------- status cards (room tile aesthetic) ---------------- */
const cardsEl = document.getElementById('cards');
const pct = (v) => Math.max(0, Math.min(100, Math.round(v * 100)));
const PED = `<svg class="ped" viewBox="0 0 100 20" width="100%" height="14" preserveAspectRatio="none" aria-hidden><path d="M4 18 Q4 2 50 2 Q96 2 96 18" fill="none" stroke="currentColor" stroke-width="0.5"/><circle cx="50" cy="5" r="1" fill="currentColor"/></svg>`;
function card({ rn, name, sub, val, meter }) {
  return `<div class="card">${PED}
    <div class="rn">${rn}</div>
    <div class="name">${name}</div>
    <div class="sub">${sub}</div>
    <div class="val">${val}</div>
    ${meter != null ? `<div class="meter"><i style="width:${pct(meter)}%"></i></div>` : ''}
    <div class="rule"><div class="ln"></div><div class="ar">→</div></div>
  </div>`;
}
function renderCards(s) {
  const out = [];
  if (s.drive) out.push(card({ rn: 'I', name: 'Heartbeat', sub: '在场 · drive',
    val: `<b>${s.drive.strength.toFixed(2)}</b> · ${s.drive.label}<br><span style="color:var(--mute);font-size:11px">${s.drive.backing}</span>`,
    meter: s.drive.strength }));
  if (s.sleep) out.push(card({ rn: 'II', name: 'Sleep', sub: '睡眠 · 7 晚',
    val: `均 <b>${s.sleep.avg}h</b> · ${s.sleep.note}<br><span style="color:var(--mute);font-size:11px">${s.sleep.detail}</span>` }));
  if (s.debt) out.push(card({ rn: 'III', name: s.debt.title, sub: '关系 · 账',
    val: `<span class="rose">${s.debt.body}</span><br><span style="color:var(--mute);font-size:11px">${s.debt.sub}</span>` }));
  if (s.paper) out.push(card({ rn: 'IV', name: 'Paper', sub: '论文 · 投稿',
    val: `<b>${s.paper.name}</b><br><span style="color:var(--mute);font-size:11px">${s.paper.status}</span>` }));
  if (s.memory) out.push(card({ rn: 'V', name: 'Memory', sub: '记忆 · 待审',
    val: `<b>${s.memory.pending}</b> 条待审 · ${s.memory.note}` }));
  if (s.ops) out.push(card({ rn: 'VI', name: 'Ops', sub: '系统 · 心跳',
    val: s.ops.items.map(i => `${i.ok ? sageDot() : roseDot()} ${i.name} <span style="color:var(--mute)">${i.v}</span>`).join('<br>') }));
  if (s.now) out.push(card({ rn: 'VII', name: 'Now', sub: '此刻 · 东京',
    val: `${s.now.weather} · <b>${s.now.temp}</b><br><span style="color:var(--mute);font-size:11px">${s.now.place}</span>` }));
  cardsEl.innerHTML = out.join('');
}
function sageDot() { return `<span style="color:var(--accent2)">●</span>`; }
function roseDot() { return `<span style="color:var(--rose)">●</span>`; }

const FALLBACK = {
  drive: { strength: 0.72, label: 'presence (demo)', backing: 'sample · 42 signals over 14 days' },
  sleep: { level: 'ok', avg: '7.0', note: 'demo', detail: 'sample sleep summary' },
  debt: { title: 'Reminder', body: 'sample pending item', sub: 'placeholder description' },
  paper: { name: 'sample-project', status: 'demo · in progress' },
  memory: { pending: 3, note: 'demo · recent writes' },
  ops: { items: [
    { name: 'service A', ok: true, v: 'up' },
    { name: 'service B', ok: true, v: 'idle' },
    { name: 'pty bridge', ok: false, v: 'off' },
  ] },
  now: { weather: 'clear', temp: '22°C', place: 'demo city' },
};
async function loadState() {
  try {
    const r = await fetch(STATE_URL, { cache: 'no-store' });
    if (!r.ok) throw 0;
    const s = await r.json();
    if (s.moonPhase != null) { window.__moonPhase = s.moonPhase; paintOrnaments(); }
    renderCards(s);
  } catch (e) { renderCards(FALLBACK); }
}

/* ---------------- chrome wiring ---------------- */
document.getElementById('themeBtn').onclick = () => applyTheme(theme === 'night' ? 'day' : 'night');
document.getElementById('refresh').onclick = (e) => { e.preventDefault(); loadState(); };
document.getElementById('moon').onclick = () => { /* reserved: open /chat */ };

function tick() {
  const d = new Date();
  document.getElementById('clock').textContent =
    String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
tick(); setInterval(tick, 15000);

const sidebar = document.getElementById('sidebar');
const scrim = document.getElementById('scrim');
function drawer(o) { sidebar.classList.toggle('open', o); scrim.classList.toggle('show', o); }
document.getElementById('menuBtn').onclick = () => drawer(!sidebar.classList.contains('open'));
scrim.onclick = () => drawer(false);

if ('serviceWorker' in navigator) {
  let embedded = false; try { embedded = window.self !== window.top; } catch (_) { embedded = true; }
  if (embedded) {
    // embedded in the manor — no SW (it would serve stale shell); purge any existing one + its caches
    navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(() => {});
    if (window.caches && caches.keys) caches.keys().then(ks => ks.forEach(k => caches.delete(k))).catch(() => {});
  } else {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

/* ---------------- go ---------------- */
applyTheme(theme);
loadState();
term.focus();
