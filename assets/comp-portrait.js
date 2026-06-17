// comp-portrait.js — "portrait card" panel for cc-gild.
// Faithful vanilla port of the kimi profile card overlay ("原样" — same look):
//   · moon-phase strip (5 phases, gold strokes)
//   · arch-clipped portrait inside a double gold arch + crown dot
//   · slow-breathing gold/sage rose glyph
// Black-gold, Art Nouveau on dark ground. Reuses cc-gild v2.css tokens — no
// hardcoded palette beyond the original SVG's gold/rose accents, which are mapped
// to tokens via currentColor / CSS vars. GENERIC demo content only. Persona: you.
// The portrait is a NEUTRAL placeholder — an inline SVG abstract Mucha-style
// silhouette drawn from tokens. No external photo, no real person, no upload,
// no caption. No novel/story text is copied.
(function (root) {
  root.Comp = root.Comp || {};

  // ---- moon-phase strip: 5 circles, new → first-quarter → full → last → crescent
  // Mirrors the original kc-moon SVG geometry (viewBox 0 0 124 24), gold strokes.
  function moonStrip() {
    var cx = [12, 37, 62, 87, 112];
    var s = '<svg class="cp-moon" viewBox="0 0 124 24" aria-hidden="true">';
    // ring outlines for the four non-full phases
    for (var i = 0; i < 4; i++) {
      s += '<circle cx="' + cx[i] + '" cy="12" r="7" fill="none" ' +
           'stroke="var(--accent)" stroke-opacity=".53" stroke-width=".9"/>';
    }
    // waxing crescent (right lit)
    s += '<path d="M37,5 A7,7 0 0 1 37,19 A2.4,7 0 0 0 37,5 Z" fill="var(--accent)"/>';
    // first quarter (right half lit)
    s += '<path d="M62,5 A7,7 0 0 1 62,19 Z" fill="var(--accent)"/>';
    // waxing gibbous (right lit, slight overlap)
    s += '<path d="M87,5 A7,7 0 0 1 87,19 A2.4,7 0 0 1 87,5 Z" fill="var(--accent)"/>';
    // full moon
    s += '<circle cx="112" cy="12" r="7" fill="var(--accent)"/>';
    s += '</svg>';
    return s;
  }

  // ---- neutral placeholder figure: an abstract Mucha-style silhouette built
  // entirely from tokens (no photo, no real person). A soft head + shoulders
  // bust over a faint gradient ground, framed by the arch below. Drawn in the
  // arch's own viewBox (0 0 240 320) so the clip lines up exactly.
  function placeholderFigure(clipId) {
    return '' +
      // soft radial ground behind the figure
      '<defs>' +
        '<radialGradient id="' + clipId + 'g" cx="50%" cy="38%" r="72%">' +
          '<stop offset="0%" stop-color="var(--accent)" stop-opacity=".16"/>' +
          '<stop offset="55%" stop-color="var(--accent)" stop-opacity=".05"/>' +
          '<stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>' +
        '</radialGradient>' +
      '</defs>' +
      '<rect x="0" y="0" width="240" height="320" fill="url(#' + clipId + 'g)" ' +
        'clip-path="url(#' + clipId + ')"/>' +
      // abstract bust silhouette — head + shoulders, hairline gold stroke, no face
      '<g clip-path="url(#' + clipId + ')" fill="none" ' +
        'stroke="var(--accent)" stroke-opacity=".55" ' +
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        // head (oval)
        '<ellipse cx="120" cy="138" rx="38" ry="46"/>' +
        // shoulders / bust sweep, Art Nouveau curve
        '<path d="M58 312 C60 248 84 206 120 206 C156 206 180 248 182 312"/>' +
        // a single trailing hair/veil curl, sage accent — Mucha flourish
        '<path d="M150 118 C176 132 184 168 168 196" ' +
          'stroke="var(--sage)" stroke-opacity=".5" stroke-width="1.4"/>' +
        '<path d="M90 118 C64 132 56 168 72 196" ' +
          'stroke="var(--sage)" stroke-opacity=".5" stroke-width="1.4"/>' +
      '</g>';
  }

  // ---- arch frame with neutral placeholder figure, double gold arch stroke, crown dot
  // Mirrors the original kc-arch SVG (viewBox 0 0 240 320). A unique clip-path id
  // is generated per mount so multiple cards can coexist on one page.
  function archFrame(clipId) {
    return '<div class="cp-arch">' +
      '<svg viewBox="0 0 240 320" preserveAspectRatio="xMidYMid meet">' +
        '<defs><clipPath id="' + clipId + '">' +
          '<path d="M20 312 V120 A100 100 0 0 1 220 120 V312 Z"/>' +
        '</clipPath></defs>' +
        placeholderFigure(clipId) +
        // inner heavy arch
        '<path d="M20 312 V120 A100 100 0 0 1 220 120 V312" fill="none" ' +
          'stroke="var(--accent)" stroke-width="2.2"/>' +
        // outer hairline arch
        '<path d="M11 312 V118 A109 109 0 0 1 229 118 V312" fill="none" ' +
          'stroke="var(--accent)" stroke-opacity=".4" stroke-width="1.3"/>' +
        // crown dot at apex
        '<circle cx="120" cy="13" r="3.5" fill="var(--accent)"/>' +
      '</svg></div>';
  }

  // ---- breathing rose glyph (three spiral arcs + bud + leaf), gold + sage
  // Mirrors the original kc-rose SVG (viewBox 0 0 40 40).
  function rose() {
    return '<svg class="cp-rose" viewBox="0 0 40 40" fill="none" ' +
        'stroke="var(--rose)" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">' +
      '<path d="M20 20 a3 3 0 1 1 -2.6 -2.7"/>' +
      '<path d="M20 20 a6.5 6.5 0 1 1 -5.6 -5.7"/>' +
      '<path d="M20 20 a10 10 0 1 1 -8.6 -8.7"/>' +
      '<circle cx="20" cy="20" r="2" fill="var(--rose-d)" stroke="none"/>' +
      '<path d="M20.5 30 q-4 3.5 -8.5 2.4" stroke="var(--sage)" stroke-width="1.2"/>' +
    '</svg>';
  }

  function injectCss() {
    if (document.getElementById('comp-portrait-css')) return;
    var st = document.createElement('style');
    st.id = 'comp-portrait-css';
    st.textContent =
      '.cp-wrap{width:150px;margin:6px auto 10px;text-align:center;' +
        "font-family:var(--serif);user-select:none;-webkit-user-select:none}" +
      '.cp-moon{display:block;width:94px;height:18px;margin:0 auto 6px}' +
      '.cp-arch{width:150px;height:200px;margin:0 auto}' +
      '.cp-arch svg{width:100%;height:100%;display:block;overflow:visible}' +
      '.cp-rose{display:block;width:34px;height:34px;margin:9px auto 0;' +
        'transform-origin:50% 50%;animation:cpBreathe 5.5s ease-in-out infinite}' +
      '@keyframes cpBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}' +
      '@media (prefers-reduced-motion:reduce){.cp-rose{animation:none}}';
    document.head.appendChild(st);
  }

  var seq = 0;

  root.Comp.portrait = function (el) {
    injectCss();
    var clipId = 'cpArchClip' + (++seq);

    el.innerHTML =
      '<div class="cp-wrap">' +
        moonStrip() +
        archFrame(clipId) +
        rose() +
      '</div>';
  };
})(window);
