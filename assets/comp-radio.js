// comp-radio.js — radio / now-playing player for cc-gild.
// A reader radio widget (vanilla): a black-gold
// Art Nouveau player card with a spinning vinyl disc, tonearm, orbiting gold
// pip, now-playing track line, breathing progress bar, live timer, and
// play / prev / next transport over REAL streaming stations.
//
// TWO COLORWAYS: NIGHT is black-gold (default) — the panel scopes its own
// dark custom-properties on .radio-comp seeded from cc-gild v2.css :root tokens
// (--accent / --hair / --ink / --rose) where the gold aligns. DAY is a
// rose-gothic light variant — under [data-theme="day"] the scoped --r-* vars are
// reassigned to the day palette (light paper card, rose/gold accents) and the
// hardcoded-dark surfaces are overridden, seeded from the day tokens
// (--warmth / --rose / --ink / --hair). Player behavior is identical in both.
//
// Station NAMES + stream URLs are preserved exactly from the source.
// No book / song / novel text is referenced. Attaches to window.Comp.radio(el).
window.Comp = window.Comp || {};

window.Comp.radio = function (el) {
  // ── component-specific CSS (injected once) ──
  if (!document.getElementById('comp-radio-css')) {
    var s = document.createElement('style');
    s.id = 'comp-radio-css';
    s.textContent = [
      // NIGHT palette (default). Scoped dark custom-properties seeded from
      // cc-gild tokens where the gold aligns. These vars live ONLY on
      // .radio-comp and shadow any inherited ones; the DAY block below
      // reassigns them for [data-theme="day"].
      '.radio-comp{',
      '  --r-gold:var(--accent,#c19a56);--r-gold-2:#c9a86a;--r-gold-bright:#e8d199;--r-gold-dim:#6b5630;',
      '  --r-gold-faint:rgba(193,154,86,.16);--r-gold-line:var(--hair,rgba(193,154,86,.38));--r-gold-glow:rgba(232,209,153,.55);',
      '  --r-rose-2:var(--rose,#b87a82);--r-cream:var(--ink,#f3e6cd);--r-muted:#8a7a5c;--r-muted-2:#62553c;',
      '  position:relative;width:180px;margin:0 auto;',
      '  font-family:var(--serif,"Cormorant Garamond",serif);color:var(--r-cream);user-select:none;-webkit-user-select:none;}',
      // DAY colorway — rose-gothic light variant (light paper card, rose/gold
      // accents). Reassigns the scoped --r-* vars to the day palette and
      // overrides the dark surfaces below. Seeds from cc-gild day tokens where
      // they align (--accent rose, --rose, --ink, --hair).
      '[data-theme="day"] .radio-comp{',
      '  --r-gold:var(--warmth,#b07a2e);--r-gold-2:#a8505e;--r-gold-bright:#c46f78;--r-gold-dim:#caa6ad;',
      '  --r-gold-faint:rgba(168,80,94,.12);--r-gold-line:var(--hair,rgba(168,80,94,.30));--r-gold-glow:rgba(196,111,120,.5);',
      '  --r-rose-2:var(--rose,#a8505e);--r-cream:var(--ink,#4a2c2c);--r-muted:#8a6a5e;--r-muted-2:#a98a80;}',
      '.radio-comp .kr-card{position:relative;padding:14px 16px 15px;border:1px solid var(--r-gold-line);border-radius:3px;',
      '  background:linear-gradient(180deg,rgba(26,19,8,.96),rgba(10,8,5,.97));',
      '  box-shadow:0 18px 46px -18px #000,inset 0 0 30px rgba(0,0,0,.4);}',
      // DAY surface overrides — light rose paper card + soft rose shadow.
      '[data-theme="day"] .radio-comp .kr-card{',
      '  background:linear-gradient(180deg,rgba(255,252,250,.94),rgba(247,233,225,.96));',
      '  box-shadow:0 16px 40px -20px rgba(122,46,60,.4),inset 0 0 30px rgba(168,80,94,.06);}',
      // day vinyl center hub reads light instead of near-black.
      '[data-theme="day"] .radio-comp .kd-vinyl circle[fill="#0b0806"]{fill:#f6e9e1;}',
      '.radio-comp .kr-corner{position:absolute;width:24px;height:24px;opacity:.7;pointer-events:none;}',
      '.radio-comp .kr-corner.tl{top:3px;left:3px;} .radio-comp .kr-corner.tr{top:3px;right:3px;transform:scaleX(-1);}',
      '.radio-comp .kr-corner.bl{bottom:3px;left:3px;transform:scaleY(-1);} .radio-comp .kr-corner.br{bottom:3px;right:3px;transform:scale(-1);}',
      '.radio-comp svg .ln{fill:none;stroke:var(--r-gold-2);stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round;}',
      '.radio-comp .kr-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;}',
      '.radio-comp .cap{font-family:var(--serif,"Cormorant Garamond",serif);font-style:italic;letter-spacing:.16em;text-transform:uppercase;color:var(--r-gold);font-size:10px;white-space:nowrap;}',
      '.radio-comp .rd-on{font-family:var(--serif,"Cormorant Garamond",serif);font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:var(--r-rose-2);}',
      '.radio-comp .player{position:relative;width:94px;height:94px;margin:8px auto 10px;}',
      '.radio-comp .disc{width:100%;height:100%;display:block;}',
      '.radio-comp .kd-vinyl.spin{animation:r-spin 8s linear infinite;transform-origin:center;}',
      '@keyframes r-spin{to{transform:rotate(360deg)}}',
      '.radio-comp .tonearm{position:absolute;right:8px;top:6px;width:2px;height:44px;background:linear-gradient(180deg,var(--r-gold-2),var(--r-gold-dim));transform-origin:top right;transform:rotate(26deg);border-radius:2px;}',
      '.radio-comp .tonearm::after{content:"";position:absolute;right:-2px;top:-4px;width:6px;height:6px;border-radius:50%;background:var(--r-gold-2);box-shadow:0 0 5px var(--r-gold-glow);}',
      '.radio-comp .track{text-align:center;display:flex;flex-direction:column;gap:2px;}',
      '.radio-comp .tr-title{font-family:var(--serif,"Cormorant Garamond",serif);font-size:16px;color:var(--r-cream);letter-spacing:.04em;}',
      '.radio-comp .tr-sub{font-family:var(--serif,"Cormorant Garamond",serif);font-size:11px;color:var(--r-muted);}',
      '.radio-comp .tr-sub.it{font-style:italic;}',
      '.radio-comp .rd-bar{position:relative;height:2px;margin:12px 4px 5px;background:var(--r-gold-faint);overflow:hidden;}',
      '.radio-comp .rd-fill{position:absolute;inset:0;background:linear-gradient(90deg,var(--r-gold-dim),var(--r-gold-2));opacity:.4;}',
      '.radio-comp .rd-glow{position:absolute;top:0;bottom:0;left:-38%;width:38%;background:linear-gradient(90deg,transparent,var(--r-gold-bright),transparent);box-shadow:0 0 8px var(--r-gold-glow);opacity:0;}',
      '.radio-comp .rd-time{display:flex;justify-content:space-between;font-family:var(--serif,"Cormorant Garamond",serif);font-style:italic;font-size:9px;letter-spacing:.1em;color:var(--r-muted-2);}',
      '.radio-comp .rd-ctrl{display:flex;justify-content:center;align-items:center;gap:12px;margin-top:10px;}',
      '.radio-comp .rd-ctrl button{background:none;border:none;cursor:pointer;width:26px;height:26px;display:grid;place-items:center;opacity:.72;transition:.2s;padding:0;}',
      '.radio-comp .rd-ctrl button svg{width:16px;height:16px;}',
      '.radio-comp .rd-ctrl button svg .ln{fill:var(--r-gold-2);stroke:var(--r-gold-2);}',
      '.radio-comp .rd-ctrl button:hover{opacity:1;}',
      '.radio-comp .rd-ctrl button:hover svg .ln{fill:var(--r-gold-bright);stroke:var(--r-gold-bright);}',
      '.radio-comp .rd-play{width:34px !important;height:34px !important;border:1px solid var(--r-gold-line) !important;border-radius:50%;}',
      '@keyframes r-orbit{to{transform:rotate(360deg)}}',
      '@keyframes r-scan{0%{left:-38%}100%{left:100%}}',
      '@keyframes r-breathe{0%,100%{opacity:.55}50%{opacity:1}}',
      '.radio-comp .kr-orbit{position:absolute;inset:0;pointer-events:none;animation:r-orbit 6s linear infinite;animation-play-state:paused;}',
      '.radio-comp.kr-playing .kr-orbit{animation-play-state:running;}',
      '.radio-comp .kr-pip{position:absolute;top:6px;left:50%;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:var(--r-gold-bright);box-shadow:0 0 7px var(--r-gold-glow);}',
      '.radio-comp.kr-playing .rd-glow{animation:r-scan 16s linear infinite;}',
      '.radio-comp.kr-playing .rd-on{animation:r-breathe 2.4s ease-in-out infinite;}',
      '@media (prefers-reduced-motion:reduce){.radio-comp .kd-vinyl.spin,.radio-comp .kr-orbit,.radio-comp.kr-playing .rd-glow,.radio-comp.kr-playing .rd-on{animation:none}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  // ── station list (names + stream URLs preserved EXACTLY from the source) ──
  var STATIONS = [
    { n: 'Groove Salad',     g: 'lo-fi · chill',      u: 'https://ice1.somafm.com/groovesalad-128-mp3' },
    { n: 'Amsterdam Trance', g: 'trance · vocal',     u: 'https://strm112.1.fm/atr_mobile_mp3' },
    { n: 'Goa / Psy',        g: 'trance · psy',       u: 'https://strm112.1.fm/goa_mobile_mp3' },
    { n: 'The Trip',         g: 'trance · downtempo', u: 'https://ice1.somafm.com/thetrip-128-mp3' },
    { n: 'Drone Zone',       g: '清冷 · ambient',     u: 'https://ice1.somafm.com/dronezone-128-mp3' },
    { n: 'RauteMusik',       g: 'trance · 电子',       u: 'https://rautemusik-de-hz-fal-stream14.radiohost.de/trance' },
    { n: 'Venice Classic',   g: '古典 · classical',   u: 'https://uk2.streamingpulse.com/ssl/vcr1' },
    { n: 'Calm Classical',   g: '古典 · 静谧',        u: 'https://streams.calmradio.com/api/39/128/stream' },
    { n: '青espresso 古风',  g: '古风 · 国风',        u: 'https://lhttp.qingting.fm/live/4915/64k.mp3' },
    { n: 'Pop Radio TW',     g: '华语 · C-pop',       u: 'https://stream.rcs.revma.com/aw9uqyxy2tzuv' }
  ];

  // ── inline vinyl-disc SVG (concentric grooves + moon-gold center label) ──
  var discSVG =
    '<svg class="disc kd-vinyl" viewBox="0 0 64 64" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="r-ggold" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="var(--r-gold-2)"/>' +
          '<stop offset="100%" stop-color="var(--r-gold-dim)"/>' +
        '</linearGradient>' +
        '<radialGradient id="r-gmoon" cx="38%" cy="34%" r="62%">' +
          '<stop offset="0%" stop-color="var(--r-gold-bright)"/>' +
          '<stop offset="100%" stop-color="var(--r-gold-dim)"/>' +
        '</radialGradient>' +
      '</defs>' +
      '<g fill="none" stroke="url(#r-ggold)" stroke-width="1">' +
        '<circle cx="32" cy="32" r="29"/>' +
        '<circle cx="32" cy="32" r="22" stroke="var(--r-gold-line)"/>' +
        '<circle cx="32" cy="32" r="15" stroke="var(--r-gold-line)"/>' +
        '<circle cx="32" cy="32" r="9" stroke="url(#r-ggold)"/>' +
      '</g>' +
      '<circle cx="32" cy="32" r="9" fill="url(#r-gmoon)"/>' +
      '<circle cx="32" cy="32" r="2" fill="#0b0806"/>' +
    '</svg>';

  // ── inline corner filigree SVG (Art Nouveau, mirrored via CSS transforms) ──
  function cornerSVG(pos) {
    return '<svg class="kr-corner ' + pos + '" viewBox="0 0 80 80" aria-hidden="true">' +
      '<g fill="none" stroke="var(--r-gold-2)" stroke-width="1" stroke-linecap="round">' +
        '<path d="M6 6c0 22 8 34 30 34"/>' +
        '<path d="M6 6c22 0 34 8 34 30"/>' +
        '<path d="M6 18c0 12 6 18 16 19M18 6c12 0 18 6 19 16"/>' +
        '<circle cx="9.5" cy="9.5" r="2.2"/>' +
        '<path d="M40 38c5 1 7-1 7-5M38 40c1 5-1 7-5 7"/>' +
        '<path d="M48 33a3 3 0 1 0 .1 0M33 48a3 3 0 1 0 .1 0" stroke-width=".8"/>' +
      '</g></svg>';
  }

  // ── transport glyphs ──
  var playPath  = '<path d="M9 6l9 6-9 6z" class="ln"/>';
  var pausePath = '<path d="M9 6v12M15 6v12" class="ln"/>';
  var prevSVG   = '<svg viewBox="0 0 24 24"><path d="M16 6v12M16 12L8 6v12z" class="ln"/></svg>';
  var nextSVG   = '<svg viewBox="0 0 24 24"><path d="M8 6v12M8 12l8-6v12z" class="ln"/></svg>';

  el.classList.add('radio-comp');
  el.innerHTML =
    '<div class="kr-card">' +
      cornerSVG('tl') + cornerSVG('tr') + cornerSVG('bl') + cornerSVG('br') +
      '<div class="kr-head"><span class="cap">radio · 电台</span><span class="rd-on">on air</span></div>' +
      '<div class="player">' + discSVG +
        '<div class="kr-orbit"><span class="kr-pip"></span></div>' +
        '<div class="tonearm"></div>' +
      '</div>' +
      '<div class="track">' +
        '<span class="tr-title kr-name">moon edition</span>' +
        '<span class="tr-sub it kr-genre">lo-fi</span>' +
      '</div>' +
      '<div class="rd-bar"><span class="rd-fill"></span><span class="rd-glow"></span></div>' +
      '<div class="rd-time"><span>0:00</span><span>live</span></div>' +
      '<div class="rd-ctrl">' +
        '<button class="kr-prev" title="上一台" aria-label="previous station">' + prevSVG + '</button>' +
        '<button class="rd-play kr-play" title="播放/暂停" aria-label="play/pause"><svg viewBox="0 0 24 24">' + pausePath + '</svg></button>' +
        '<button class="kr-next" title="下一台" aria-label="next station">' + nextSVG + '</button>' +
      '</div>' +
    '</div>';

  // ── play / pause + station switching + real stream + transport feel ──
  // (spinning disc, orbiting pip, breathing progress, live timer, on-air glow)
  var disc    = el.querySelector('.kd-vinyl');
  var btn     = el.querySelector('.kr-play');
  var nameEl  = el.querySelector('.kr-name');
  var genreEl = el.querySelector('.kr-genre');
  var tEl     = el.querySelectorAll('.rd-time span');
  var prev    = el.querySelector('.kr-prev');
  var next    = el.querySelector('.kr-next');

  var idx = 0;
  try { var s = parseInt(localStorage.getItem('ccGildRadioStation'), 10); if (s >= 0 && s < STATIONS.length) idx = s; } catch (e) {}

  var audio = new Audio();
  audio.preload = 'none';
  var playing = false, secs = 0, timer = null;

  function fmt(n) { var m = Math.floor(n / 60), x = n % 60; return m + ':' + (x < 10 ? '0' : '') + x; }

  function label() {
    var st = STATIONS[idx];
    if (nameEl)  nameEl.textContent  = st.n;
    if (genreEl) genreEl.textContent = st.g;
  }

  function setUI() {
    el.classList.toggle('kr-playing', playing);
    if (disc) disc.classList.toggle('spin', playing);
    if (btn)  btn.querySelector('svg').innerHTML = playing ? pausePath : playPath;
    if (tEl[1]) tEl[1].textContent = playing ? 'live' : '—';
    if (playing) {
      if (!timer) timer = setInterval(function () { secs++; if (tEl[0]) tEl[0].textContent = fmt(secs); }, 1000);
    } else if (timer) {
      clearInterval(timer); timer = null;
    }
  }

  function load(play) {
    audio.src = STATIONS[idx].u;
    label();
    secs = 0;
    if (tEl[0]) tEl[0].textContent = '0:00';
    try { localStorage.setItem('ccGildRadioStation', idx); } catch (e) {}
    if (play) { var p = audio.play(); if (p && p.catch) p.catch(function () {}); }
  }

  function go(d) { idx = (idx + d + STATIONS.length) % STATIONS.length; load(playing); }

  audio.addEventListener('playing', function () { playing = true;  setUI(); });
  audio.addEventListener('pause',   function () { playing = false; setUI(); });

  audio.src = STATIONS[idx].u;
  label();

  if (btn) btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (playing) { audio.pause(); return; }
    var p = audio.play();
    if (p && p.catch) p.catch(function () {
      playing = true; setUI();
      if (genreEl) genreEl.textContent = '连接失败 · 换台试试';
    });
  });
  if (prev) prev.addEventListener('click', function (e) { e.stopPropagation(); go(-1); });
  if (next) next.addEventListener('click', function (e) { e.stopPropagation(); go(1); });

  if (tEl[0]) tEl[0].textContent = '0:00';
  setUI();
};
