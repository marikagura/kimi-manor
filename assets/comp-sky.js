/* comp-sky.js — standalone vanilla port of kimi-web SkyView (score/SkyView.tsx).
   Decorative celestial star-map: dark field, scattered hairline stars (3 depth
   layers, slow twinkle), a few gold constellation lines, a crescent moon, and a
   single haloed "pole" star labelled "— now". GENERIC DEMO only.
   Uses cc-gild v2.css tokens (var(--accent)/--hair/--ink/--mute/--serif/--mono). */
(function () {
  window.Comp = window.Comp || {};

  var W = 360, SVG_H = 510, SKY_TOP = 18, SKY_BOT = 478;

  // deterministic LCG so the field is stable across re-renders (no Math.random)
  function rng(seed) {
    var s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  function stars(n, rad, opLo, opHi, r) {
    var out = [];
    for (var k = 0; k < n; k++) {
      out.push({
        x: 8 + r() * (W - 16),
        y: SKY_TOP + r() * (SKY_BOT - SKY_TOP),
        r: rad[0] + r() * (rad[1] - rad[0]),
        o: (opLo + r() * (opHi - opLo)).toFixed(3),
        dur: (4 + r() * 4).toFixed(1),
        delay: (r() * 6).toFixed(1)
      });
    }
    return out;
  }

  function svgStars(arr, fill, glow) {
    return arr.map(function (s) {
      var halo = glow
        ? '<circle cx="' + s.x.toFixed(1) + '" cy="' + s.y.toFixed(1) +
          '" r="' + (s.r + 2).toFixed(1) + '" fill="' + fill + '" opacity="' + (s.o * 0.2).toFixed(3) + '"/>'
        : '';
      return halo +
        '<circle class="cs-tw" cx="' + s.x.toFixed(1) + '" cy="' + s.y.toFixed(1) +
        '" r="' + s.r.toFixed(2) + '" fill="' + fill + '" opacity="' + s.o +
        '" style="--o:' + s.o + ';animation-duration:' + s.dur + 's;animation-delay:' + s.delay + 's"/>';
    }).join('');
  }

  window.Comp.sky = function (el) {
    if (!document.getElementById('comp-sky-css')) {
      var st = document.createElement('style');
      st.id = 'comp-sky-css';
      st.textContent =
        '@keyframes csTwinkle{0%,100%{opacity:var(--o,.4)}50%{opacity:calc(var(--o,.4)*.4)}}' +
        '.cs-tw{animation:csTwinkle ease-in-out infinite}' +
        '.cs-wrap{text-align:center;padding:14px 12px 6px}' +
        '.cs-title{font-family:var(--serif);font-style:italic;font-size:42px;line-height:1;color:var(--ink);letter-spacing:-.01em}' +
        '.cs-sub{margin-top:7px;font-family:var(--serif);font-style:italic;font-size:10px;letter-spacing:.28em;color:var(--mute)}' +
        '.cs-svg{display:block;width:100%;height:auto;overflow:visible;margin-top:10px}';
      document.head.appendChild(st);
    }

    var r = rng(0x5eed);
    var far = stars(170, [0.25, 0.65], 0.07, 0.22, r);
    var mid = stars(60, [0.5, 1.0], 0.14, 0.34, r);
    var close = stars(16, [1.0, 1.7], 0.38, 0.6, r);

    // Constellation nodes — a curving mid-band chain + a faint lower cluster.
    var chain = [
      [60, 250], [104, 214], [142, 238], [184, 196], [228, 224],
      [266, 188], [300, 212]
    ];
    var cluster = [[88, 372], [120, 396], [150, 360], [134, 410], [98, 408]];
    var pole = [W - 50, 168]; // bright haloed star labelled "— now"

    // hairline links: chain spine, a couple of cross-links, cluster mesh, pole tie-in
    var lines = [];
    for (var i = 0; i < chain.length - 1; i++) {
      lines.push([chain[i], chain[i + 1], 'hair']);
    }
    lines.push([chain[1], chain[3], 'hair']);
    lines.push([chain[4], chain[6], 'hair']);
    lines.push([cluster[0], cluster[1], 'mute']);
    lines.push([cluster[1], cluster[3], 'mute']);
    lines.push([cluster[2], cluster[0], 'mute']);
    lines.push([cluster[3], cluster[4], 'mute']);
    lines.push([chain[6], pole, 'gold']); // chain reaches toward the pole

    var lineSvg = lines.map(function (l) {
      var a = l[0], b = l[1], kind = l[2];
      if (kind === 'gold') {
        return '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] +
          '" stroke="var(--accent)" stroke-width="0.5" stroke-dasharray="2.5 3" opacity="0.5"/>';
      }
      var col = kind === 'hair' ? 'var(--accent)' : 'var(--ink)';
      var op = kind === 'hair' ? 0.45 : 0.3;
      var sw = kind === 'hair' ? 0.55 : 0.35;
      return '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] +
        '" stroke="' + col + '" stroke-width="' + sw + '" opacity="' + op + '"/>';
    }).join('');

    // constellation node dots (small gold glints with short cross-arm)
    function node(p, rad) {
      var x = p[0], y = p[1], arm = rad * 2.4;
      return '<g stroke="var(--accent)" stroke-width="0.6" stroke-linecap="round" opacity="0.7">' +
        '<line x1="' + (x - arm) + '" y1="' + y + '" x2="' + (x + arm) + '" y2="' + y + '"/>' +
        '<line x1="' + x + '" y1="' + (y - arm) + '" x2="' + x + '" y2="' + (y + arm) + '"/></g>' +
        '<circle cx="' + x + '" cy="' + y + '" r="' + (rad + 2.5) + '" fill="var(--accent)" opacity="0.12"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="' + rad + '" fill="var(--accent)"/>';
    }
    var nodeSvg = chain.map(function (p) { return node(p, 1.8); }).join('') +
      cluster.map(function (p) { return node(p, 1.4); }).join('');

    // pole star — big halo + glint + "— now" label
    var poleSvg =
      '<circle cx="' + pole[0] + '" cy="' + pole[1] + '" r="46" fill="url(#csPoleHalo)"/>' +
      node(pole, 3.2) +
      '<text x="' + (pole[0] - 9) + '" y="' + (pole[1] + 3) + '" text-anchor="end" ' +
      'fill="var(--accent)" font-size="9" font-style="italic" font-family="var(--serif)" ' +
      'letter-spacing="0.18em">— now</text>';

    // crescent moon top-left — soft gold halo, sliver carved by an offset disc
    var mx = 70, my = 70, mr = 24;
    var moonSvg =
      '<circle cx="' + mx + '" cy="' + my + '" r="' + (mr + 16) + '" fill="url(#csMoonHalo)"/>' +
      '<circle cx="' + mx + '" cy="' + my + '" r="' + mr + '" fill="var(--accent)" opacity="0.9"/>' +
      '<circle cx="' + (mx + 9) + '" cy="' + (my - 4) + '" r="' + mr + '" fill="var(--void)"/>';

    // faint rose nebula behind the lower cluster
    var nebSvg = '<ellipse cx="118" cy="392" rx="86" ry="92" fill="url(#csNebula)"/>';

    el.innerHTML =
      '<div class="cs-wrap">' +
        '<div class="cs-title">her sky</div>' +
        '<div class="cs-sub">MEMORY · 12 · SELF_SCORE · 5</div>' +
      '</div>' +
      '<svg class="cs-svg" viewBox="0 0 ' + W + ' ' + SVG_H + '" role="img" aria-label="celestial star-map">' +
        '<defs>' +
          '<radialGradient id="csPoleHalo" cx="0.5" cy="0.5" r="0.5">' +
            '<stop offset="0" stop-color="var(--accent)" stop-opacity="0.6"/>' +
            '<stop offset="0.45" stop-color="var(--accent)" stop-opacity="0.18"/>' +
            '<stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></radialGradient>' +
          '<radialGradient id="csMoonHalo" cx="0.5" cy="0.5" r="0.5">' +
            '<stop offset="0" stop-color="var(--accent)" stop-opacity="0.4"/>' +
            '<stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></radialGradient>' +
          '<radialGradient id="csNebula" cx="0.5" cy="0.5" r="0.5">' +
            '<stop offset="0" stop-color="var(--toward)" stop-opacity="0.18"/>' +
            '<stop offset="0.55" stop-color="var(--toward)" stop-opacity="0.07"/>' +
            '<stop offset="1" stop-color="var(--toward)" stop-opacity="0"/></radialGradient>' +
        '</defs>' +
        nebSvg +
        svgStars(far, 'var(--ink)', false) +
        svgStars(mid, 'var(--ink)', false) +
        svgStars(close, 'var(--accent)', true) +
        lineSvg +
        nodeSvg +
        moonSvg +
        poleSvg +
        '<text x="118" y="492" text-anchor="middle" fill="var(--toward)" font-size="8" ' +
        'font-style="italic" font-family="var(--serif)" letter-spacing="0.22em" opacity="0.7">— a clouded week —</text>' +
      '</svg>';
  };
})();
