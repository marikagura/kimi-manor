// comp-disc.js — turntable panel for cc-gild.
// A vinyl-disc widget (visual essence only): a vinyl disc
// (concentric grooves + center label) on a felt platter, a brass tonearm, slow
// CSS rotation, and a generic "now playing" line. Uses cc-gild v2.css tokens.
// GENERIC DEMO content only. Attaches to window.Comp.disc(el).
window.Comp = window.Comp || {};

window.Comp.disc = function (el) {
  // ── component-specific CSS (injected once) ──
  if (!document.getElementById('comp-disc-css')) {
    var s = document.createElement('style');
    s.id = 'comp-disc-css';
    s.textContent = [
      '.disc-wrap{padding:18px 20px 28px;font-family:var(--serif);color:var(--ink);text-align:center}',
      '.disc-eyebrow{font-style:italic;font-size:11px;letter-spacing:.42em;color:var(--accent);opacity:.85;text-transform:uppercase}',
      // plinth (turntable body)
      '.disc-plinth{position:relative;width:300px;max-width:100%;height:248px;margin:18px auto 0;',
      '  border:0.8px solid var(--hair);border-radius:3px;',
      '  background:linear-gradient(180deg,rgba(28,22,18,.5),rgba(10,8,6,.35));',
      '  box-shadow:inset 0 2px 14px rgba(0,0,0,.5),0 8px 26px rgba(0,0,0,.4)}',
      '[data-theme="day"] .disc-plinth{background:linear-gradient(180deg,rgba(255,252,250,.6),rgba(238,217,209,.4));',
      '  box-shadow:inset 0 2px 10px rgba(120,70,70,.12),0 8px 22px rgba(120,70,70,.14)}',
      // felt platter
      '.disc-felt{position:absolute;top:24px;left:50%;transform:translateX(-50%);width:200px;height:200px;border-radius:50%;',
      '  background:radial-gradient(circle,rgba(42,28,32,.9),rgba(18,14,12,.9));',
      '  border:0.6px solid var(--hair2);box-shadow:inset 0 0 30px rgba(0,0,0,.55)}',
      '[data-theme="day"] .disc-felt{background:radial-gradient(circle,#d8c8b8,#b89878)}',
      // spinning vinyl
      '.disc-vinyl{position:absolute;top:34px;left:50%;width:180px;height:180px;margin-left:-90px;',
      '  animation:disc-spin 6s linear infinite;transform-origin:50% 50%}',
      '@keyframes disc-spin{to{transform:rotate(360deg)}}',
      '@media (prefers-reduced-motion:reduce){.disc-vinyl{animation:none}}',
      // DAY: white/cream record — recolor the vinyl SVG parts (CSS beats inline fill)
      '[data-theme="day"] .disc-vinyl .dv-body{fill:#f4ece2}',
      '[data-theme="day"] .disc-vinyl .dv-groove{stroke:#c9b59c}',
      '[data-theme="day"] .disc-vinyl .dv-shine{fill:#fff}',
      '[data-theme="day"] .disc-vinyl .dv-label{fill:var(--rose)}',
      '[data-theme="day"] .disc-vinyl .dv-label-ring{stroke:#fff}',
      '[data-theme="day"] .disc-vinyl .dv-text{fill:#fff}',
      '[data-theme="day"] .disc-vinyl .dv-spindle{fill:#cdbba4}',
      '[data-theme="day"] .disc-vinyl .dv-spindle-in{fill:#b89878}',
      // tonearm
      '.disc-arm{position:absolute;top:12px;right:18px;width:120px;height:120px;transform:rotate(-24deg);transform-origin:top right;pointer-events:none}',
      // transport + caption
      '.disc-transport{margin:22px auto 0;display:flex;gap:30px;align-items:center;justify-content:center}',
      '.disc-btn{background:none;border:none;padding:6px;cursor:pointer;line-height:0;color:var(--accent)}',
      '.disc-btn.big{width:50px;height:50px;border-radius:50%;display:grid;place-items:center;',
      '  background:radial-gradient(circle at 35% 35%,#d8bc8a,#7a5a3a);border:1.4px solid #5a3a28;',
      '  box-shadow:0 5px 12px rgba(60,40,24,.35),inset 0 -2px 4px rgba(0,0,0,.35)}',
      '.disc-now{margin-top:24px;font-style:italic;font-size:10px;letter-spacing:.34em;color:var(--accent);opacity:.85;text-transform:uppercase}',
      '.disc-track{margin-top:7px;font-style:italic;font-size:18px;letter-spacing:.02em;color:var(--ink)}',
      '.disc-by{margin-top:3px;font-family:var(--mono);font-size:11px;letter-spacing:.08em;color:var(--mute)}'
    ].join('\n');
    document.head.appendChild(s);
  }

  // ── generic demo "playlist" (persona kimi / user you) ──
  var TRACKS = [
    { t: 'Lacquered Mornings', by: 'side a · 33⅓ rpm · 04:12' },
    { t: 'Gold Leaf', by: 'side a · 33⅓ rpm · 03:47' },
    { t: 'Quiet Negative Space', by: 'side b · 33⅓ rpm · 05:08' },
    { t: 'Hairline', by: 'side b · 33⅓ rpm · 02:55' }
  ];
  var idx = Math.floor(Math.random() * TRACKS.length);

  // ── vinyl disc SVG (concentric grooves + center label) ──
  function vinylSVG() {
    var r = 90, grooves = '';
    for (var i = 0; i < 18; i++) {
      grooves += '<circle class="dv-groove" cx="' + r + '" cy="' + r + '" r="' +
        (r * 0.34 + i * ((r * 0.6) / 18)).toFixed(1) +
        '" fill="none" stroke="#2a2018" stroke-width="0.4" opacity="0.7"/>';
    }
    return '' +
      '<svg viewBox="0 0 180 180" width="180" height="180" aria-hidden="true">' +
        '<defs>' +
          '<radialGradient id="discBody" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="#1a1410"/>' +
            '<stop offset="55%" stop-color="#0a0806"/>' +
            '<stop offset="100%" stop-color="#000"/>' +
          '</radialGradient>' +
          '<radialGradient id="discShine" cx="32%" cy="30%" r="55%">' +
            '<stop offset="0%" stop-color="#fff" stop-opacity="0.16"/>' +
            '<stop offset="55%" stop-color="#fff" stop-opacity="0.05"/>' +
            '<stop offset="100%" stop-color="#000" stop-opacity="0"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<circle class="dv-body" cx="' + r + '" cy="' + r + '" r="' + (r - 0.5) + '" fill="url(#discBody)"/>' +
        grooves +
        '<circle class="dv-shine" cx="' + r + '" cy="' + r + '" r="' + (r - 1) + '" fill="url(#discShine)"/>' +
        // center label
        '<circle class="dv-label" cx="' + r + '" cy="' + r + '" r="' + (r * 0.32) + '" fill="var(--rose)"/>' +
        '<circle class="dv-label-ring" cx="' + r + '" cy="' + r + '" r="' + (r * 0.32) + '" fill="none" stroke="#0a0806" stroke-width="0.5" opacity="0.6"/>' +
        '<circle class="dv-label-ring" cx="' + r + '" cy="' + r + '" r="' + (r * 0.255) + '" fill="none" stroke="#0a0806" stroke-width="0.3" opacity="0.4"/>' +
        '<text class="dv-text" x="' + r + '" y="' + (r - r * 0.14) + '" text-anchor="middle" font-family="Cormorant Garamond,serif" font-style="italic" font-size="' + (r * 0.13) + '" fill="#f5e4c2" letter-spacing="1.2" opacity="0.92">kimi</text>' +
        '<text class="dv-text" x="' + r + '" y="' + (r + r * 0.07) + '" text-anchor="middle" font-family="Cormorant Garamond,serif" font-style="italic" font-size="' + (r * 0.075) + '" fill="#f5e4c2" letter-spacing="1.6" opacity="0.72">SIDE · A</text>' +
        '<text class="dv-text" x="' + r + '" y="' + (r + r * 0.22) + '" text-anchor="middle" font-family="Cormorant Garamond,serif" font-style="italic" font-size="' + (r * 0.064) + '" fill="#f5e4c2" letter-spacing="2.4" opacity="0.6">33⅓ RPM</text>' +
        // spindle
        '<circle class="dv-spindle" cx="' + r + '" cy="' + r + '" r="' + (r * 0.035) + '" fill="#0a0806"/>' +
        '<circle class="dv-spindle-in" cx="' + r + '" cy="' + r + '" r="' + (r * 0.018) + '" fill="#000"/>' +
      '</svg>';
  }

  // ── tonearm SVG (brass pivot + arm + cartridge resting near groove) ──
  function armSVG() {
    return '' +
      '<svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">' +
        '<defs><linearGradient id="armG" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0%" stop-color="#d4b88c"/><stop offset="50%" stop-color="#a8896a"/><stop offset="100%" stop-color="#6e553a"/>' +
        '</linearGradient></defs>' +
        '<line x1="106" y1="14" x2="20" y2="96" stroke="url(#armG)" stroke-width="4" stroke-linecap="round"/>' +
        '<rect x="13" y="90" width="16" height="11" rx="1" transform="rotate(-24 21 95)" fill="#5a1820" stroke="var(--accent)" stroke-width="0.5"/>' +
        '<circle cx="106" cy="14" r="11" fill="none" stroke="#5a3a28" stroke-width="1"/>' +
        '<circle cx="106" cy="14" r="8" fill="var(--accent)" opacity="0.9"/>' +
        '<circle cx="106" cy="14" r="3.4" fill="#3a2818"/>' +
      '</svg>';
  }

  function tri(dir) {
    return dir === 'prev'
      ? '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M18 4 L8 12 L18 20 Z M6 4 L6 20" fill="currentColor"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M6 4 L16 12 L6 20 Z M18 4 L18 20" fill="currentColor"/></svg>';
  }
  var shuffleSVG = '<svg width="20" height="20" viewBox="0 0 26 26">' +
    '<path d="M3 8 L9 8 L13 13 L17 8 L23 8 M17 8 L21 6 M17 8 L21 10" stroke="#1a0e08" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>' +
    '<path d="M3 18 L9 18 L13 13 L17 18 L23 18 M17 18 L21 16 M17 18 L21 20" stroke="#1a0e08" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg>';

  function render() {
    var tk = TRACKS[idx];
    el.innerHTML =
      '<div class="disc-wrap">' +
        '<div class="disc-eyebrow">turntable · shuffle · ' + (idx + 1) + ' / ' + TRACKS.length + '</div>' +
        '<div class="disc-plinth">' +
          '<div class="disc-felt"></div>' +
          '<div class="disc-vinyl">' + vinylSVG() + '</div>' +
          '<div class="disc-arm">' + armSVG() + '</div>' +
        '</div>' +
        '<div class="disc-transport">' +
          '<button class="disc-btn" data-act="prev" aria-label="previous">' + tri('prev') + '</button>' +
          '<button class="disc-btn big" data-act="shuffle" aria-label="shuffle">' + shuffleSVG + '</button>' +
          '<button class="disc-btn" data-act="next" aria-label="next">' + tri('next') + '</button>' +
        '</div>' +
        '<div class="disc-now">◐ now playing</div>' +
        '<div class="disc-track">' + tk.t + '</div>' +
        '<div class="disc-by">' + tk.by + '</div>' +
      '</div>';

    el.querySelectorAll('.disc-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var act = b.getAttribute('data-act');
        if (act === 'next') idx = (idx + 1) % TRACKS.length;
        else if (act === 'prev') idx = (idx - 1 + TRACKS.length) % TRACKS.length;
        else { var n = idx; while (n === idx && TRACKS.length > 1) n = Math.floor(Math.random() * TRACKS.length); idx = n; }
        render();
      });
    });
  }

  render();
};
