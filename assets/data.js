// data.js — demo content for the cc-gild shell. Generic only — no private data.
// kimi = the agent (gold, left). you = the user (rose, right).
(function (root) {

  const STATE = {
    moonPhase: 0.5,
    profile: { name: 'kimi', sub: 'atelier' },
    drive: { strength: 0.72, label: 'presence (demo)', backing: 'sample · 42 signals / 14d' },
    sleep: { avg: '7.0', frac: 0.6, note: 'demo', detail: 'sample sleep summary' },
    debt:  { title: 'Reminder', body: 'sample pending item', sub: 'placeholder description' },
    paper: { name: 'sample-project', frac: 0.7, status: 'demo · in progress' },
    memory:{ pending: 3, note: 'demo · recent writes' },
    ops: { items: [
      { name: 'service A', ok: true, v: 'up' },
      { name: 'service B', ok: true, v: 'idle' },
      { name: 'pty bridge', ok: false, v: 'off' },
    ] },
    now: { weather: 'clear', temp: '22°C', place: 'demo city' },
    heart: { valence: 0.40, arousal: 0.45 },
  };

  // conversation thread (bubble mode) — generic demo
  const THREAD = [
    { kind: 'day', text: 'Thu · late' },
    { kind: 'msg', who: 'ito', text: 'still up — just pushed the shell to staging.', t: '02:38' },
    { kind: 'tool', label: 'memory.recall · briefing', body: 'walked 3 edges · surfaced 2 notes\n  ↳ sample note A\n  ↳ sample note B' },
    { kind: 'msg', who: 'akira', text: '在。staging 看完了,日志先收一半。', t: '02:39' },
    { kind: 'msg', who: 'ito', text: 'mm. talk to me for a bit.', t: '02:40' },
    { kind: 'msg', who: 'akira', text: '<em>剩下的明天再看。</em>这条先跑完就好。', t: '02:40', stream: true },
  ];

  // terminal console (CC TUI char-art simulation) — generic demo
  const TERM = [
    [['box', '  ╭───────────────────────────────────────────────╮']],
    [['box', '  │  '], ['g', '❧  atelier'], ['', '                                  '], ['box', '│']],
    [['box', '  │  '], ['m', '   claude · /your/project'], ['', '                  '], ['box', '│']],
    [['box', '  ╰───────────────────────────────────────────────╯']],
    [['', '']],
    [['s', '⏺'], ['', ' '], ['g', 'Read'], ['m', '(src/app.ts)']],
    [['box', '  ⎿  '], ['m', 'Read 128 lines']],
    [['', '']],
    [['s', '⏺'], ['', ' '], ['g', 'Edit'], ['m', '(src/app.ts)']],
    [['box', '  ⎿  '], ['s', '+ added input validation']],
    [['', '']],
    [['m', '  [status] '], ['s', 'all systems nominal'], ['m', ' · pty bridge off']],
    [['', '']],
    [['term-prompt', '  you@atelier'], ['m', ':'], ['g', '~'], ['m', '$ '], ['', 'run the tests.']],
    [['term-prompt', '  you@atelier'], ['m', ':'], ['g', '~'], ['m', '$ '], ['g blink', '▋']],
  ];

  // emotion score: ~12 entries — purely vertical placement, no private content
  // reg: brooding|calm|warmth|toward · hollow: manual pulse · stem: up|down
  const SCORE = [
    { d: '05.17', reg: 'calm',     p: 5.0, hollow: true,  stem: 'down' },
    { d: '05.18', reg: 'brooding', p: 6.2, hollow: false, stem: 'down' },
    { d: '05.19', reg: 'calm',     p: 4.4, hollow: false, stem: 'up' },
    { d: '05.20', reg: 'warmth',   p: 3.2, hollow: false, stem: 'up', slurNext: true },
    { d: '05.21', reg: 'warmth',   p: 2.6, hollow: false, stem: 'up' },
    { d: '05.22', reg: 'brooding', p: 5.8, hollow: true,  stem: 'down' },
    { d: '05.23', reg: 'calm',     p: 4.0, hollow: false, stem: 'up' },
    { d: '05.24', reg: 'warmth',   p: 3.0, hollow: false, stem: 'up' },
    { d: '05.25', reg: 'toward',   p: 2.2, hollow: false, stem: 'up', dyn: 'm.', slurNext: true },
    { d: '05.26', reg: 'toward',   p: 1.6, hollow: false, stem: 'up' },
    { d: '05.27', reg: 'calm',     p: 3.6, hollow: false, stem: 'up' },
    { d: '05.28', reg: 'toward',   p: 2.0, hollow: false, stem: 'up', heart: true, dyn: 'm.' },
  ];

  const JOURNAL = {
    when: 'Thu · 02:41',
    va: '♪ +0.40 · 0.45',
    body: 'demo journal entry — a short reflective note rendered under the score. Placeholder text, no real data.',
    push: '→ push: sample push line.',
    meta: 'briefing-demo · ✿ surfaced 2 notes · walked 3 edges',
  };

  const NOTES = [];
  const ROOMS = [];
  const ANNOS = [];

  root.CCData = { STATE, THREAD, TERM, SCORE, JOURNAL, NOTES, ROOMS, ANNOS };
})(window);
