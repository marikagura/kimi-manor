// Electron main — native window wrapping the cc-gild server.
// Robustness: single-instance lock (a 2nd launch focuses the window instead of
// fighting for the port). 固定端口 7681 (被占则复用) — origin 稳定, localStorage 跨重启不丢。
const { app, BrowserWindow } = require('electron');
const { spawn, execFileSync } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');

if (!app.requestSingleInstanceLock()) { app.quit(); }
else {
  let server = null, win = null, PORT = 0, reusedPort = 0;
  const SERVER = path.join(__dirname, '..', 'server.mjs');

  function spawnServer(port) {
    const useNode = process.env.CCGILD_NODE;
    const cmd = useNode || process.execPath;
    const env = { ...process.env, PORT: String(port) };
    if (!useNode) env.ELECTRON_RUN_AS_NODE = '1';
    server = spawn(cmd, [SERVER], { env, stdio: 'inherit' });
    server.on('exit', () => { server = null; });
    // A failed spawn (bad execPath / ENOENT / EACCES) emits 'error' async; with no listener it
    // throws and crashes the Electron main process. Log + clear so the window degrades instead.
    server.on('error', (e) => { console.error('cc-gild server spawn failed:', e.message); server = null; });
  }
  function waitPort(port, cb, tries = 0) {
    const s = net.connect(port, '127.0.0.1');
    s.once('connect', () => { s.destroy(); cb(); });
    s.once('error', () => { s.destroy(); if (tries < 200) setTimeout(() => waitPort(port, cb, tries + 1), 100); else cb(); });
  }
  function createWindow() {
    win = new BrowserWindow({
      width: 1440, height: 900, minWidth: 980, minHeight: 640,
      backgroundColor: '#0a0807', title: 'cc-gild',
      webPreferences: { contextIsolation: true, preload: path.join(__dirname, 'preload.cjs') },
    });
    waitPort(PORT, () => win.loadURL(`http://localhost:${PORT}/atelier`));
    win.on('closed', () => { win = null; });
  }
  function killServer() {
    if (server) { try { server.kill(); } catch (_) {} server = null; return; }
    // Reuse case: this instance inherited a backend it didn't spawn (server stayed null), so
    // a plain server.kill() no-ops and the reused backend + all its pty/codex/agent children
    // orphan. Find the process listening on the fixed local port and SIGTERM it so quit still
    // tears the backend down. Guarded to the port we deliberately reused.
    if (reusedPort) {
      try {
        const out = execFileSync('lsof', ['-ti', 'tcp:' + reusedPort, '-sTCP:LISTEN'], { encoding: 'utf8' });
        for (const pid of out.split(/\s+/).filter(Boolean)) { try { process.kill(Number(pid), 'SIGTERM'); } catch (_) {} }
      } catch (_) {}
      reusedPort = 0;
    }
  }

  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(() => {
    // 固定端口 → 固定 origin → localStorage(面板位置/主题/对话) 跨重启不丢。
    // (旧版飘端口: 7681 被占就 +1, origin 一变 localStorage 全清 → 每次重开像 reset。)
    // 端口已被占 (上次没清干净的自身 server, 或 dev preview) → 直接复用, 不另起飘端口。
    PORT = Number(process.env.CCGILD_PORT || 7681);
    const probe = net.connect(PORT, '127.0.0.1');
    probe.once('connect', () => { probe.destroy(); console.log('cc-gild → reuse port', PORT); reusedPort = PORT; createWindow(); });
    probe.once('error', () => { probe.destroy(); console.log('cc-gild → spawn port', PORT); spawnServer(PORT); createWindow(); });
  });
  app.on('window-all-closed', () => { killServer(); if (process.platform !== 'darwin') app.quit(); });
  app.on('before-quit', killServer);
}
