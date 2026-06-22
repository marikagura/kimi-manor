// mucha.js — Art Nouveau SVG ornaments for cc-gild.
// Art Nouveau ornaments (MuchaMedallion / MuchaVine / MuchaMosaic /
// MoonPhaseSvg) and extended with the descending-gold window furniture
// (pediment, gable, rule, corner-flourish) the OS-desktop shell needs.
// Pure functions -> SVG markup strings. color = hairline, accent = bud/leaf.
(function (root) {
  function medallion({ color = 'currentColor', accent, size = 150 } = {}) {
    const a = accent ?? color;
    let lines = '';
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2;
      const r1 = 22, r2 = i % 2 === 0 ? 32 : 28;
      lines += `<line x1="${40 + Math.cos(ang) * r1}" y1="${40 + Math.sin(ang) * r1}" x2="${40 + Math.cos(ang) * r2}" y2="${40 + Math.sin(ang) * r2}" stroke="currentColor" stroke-width="0.5"/>`;
    }
    return `<svg viewBox="0 0 80 80" width="${size}" height="${size}" style="color:${color}" aria-hidden="true">
      <circle cx="40" cy="40" r="18" fill="none" stroke="currentColor" stroke-width="0.6"/>
      <circle cx="40" cy="40" r="14" fill="${a}" opacity="0.12"/>
      ${lines}
      <circle cx="40" cy="40" r="3" fill="${a}"/></svg>`;
  }

  function vine({ color = 'currentColor', accent } = {}) {
    const a = accent ?? color;
    return `<svg viewBox="0 0 300 24" width="100%" style="color:${color};display:block" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <path d="M10 12 Q30 4 50 12 Q70 20 90 12 Q110 4 130 12 Q150 20 170 12 Q190 4 210 12 Q230 20 250 12 Q270 4 290 12" fill="none" stroke="currentColor" stroke-width="0.6"/>
      <g fill="${a}" opacity="0.8"><circle cx="50" cy="12" r="2"/><circle cx="150" cy="12" r="2.5"/><circle cx="250" cy="12" r="2"/></g>
      <g stroke="currentColor" fill="none" stroke-width="0.4" opacity="0.6">
        <ellipse cx="90" cy="12" rx="2" ry="5" transform="rotate(20 90 12)"/>
        <ellipse cx="210" cy="12" rx="2" ry="5" transform="rotate(-20 210 12)"/></g></svg>`;
  }

  function mosaic({ color = 'currentColor', accent, size = 40 } = {}) {
    const a = accent ?? color;
    let sq = '';
    for (let r = 0; r < 6; r++) for (let q = 0; q < 6; q++) {
      const d = (r + q) % 3;
      const fill = d === 0 ? 'currentColor' : d === 1 ? a : 'none';
      const op = d === 0 ? 0.15 : d === 1 ? 0.3 : 0.6;
      sq += `<rect x="${q * 10}" y="${r * 10}" width="9" height="9" fill="${fill}" stroke="currentColor" stroke-width="0.3" opacity="${op}"/>`;
    }
    return `<svg viewBox="0 0 60 60" width="${size}" height="${size}" style="color:${color}" aria-hidden="true">${sq}</svg>`;
  }

  function moonPhase({ phase = 0.5, size = 60 } = {}) {
    const r = 12, cx = 12, cy = 12;
    const cosVal = Math.cos(2 * Math.PI * phase);
    const rx = Math.abs(cosVal) * r;
    const isWaxing = phase < 0.5;
    const sweepOuter = isWaxing ? 0 : 1;
    const sweepInner = (cosVal >= 0) === isWaxing ? 1 : 0;
    const shadow = `M ${cx},${cy - r} A ${r},${r} 0 0 ${sweepOuter} ${cx},${cy + r} A ${rx},${r} 0 0 ${sweepInner} ${cx},${cy - r} Z`;
    // NIGHT glyph: lunar phase. DAY glyph: a rotating rose bloom (RoseBloomDial),
    // slow 90s rotate + gentle breath. Both are emitted; CSS shows one per theme.
    const moon = `<svg class="mp-moon" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"
        style="display:inline-block;filter:drop-shadow(0 0 8px rgba(212,154,86,0.32)) drop-shadow(0 0 14px rgba(212,154,86,0.18))">
      <defs><radialGradient id="mphl" cx="38%" cy="36%" r="70%">
        <stop offset="0%" stop-color="#fff6e0"/><stop offset="55%" stop-color="#e4d3ad"/><stop offset="100%" stop-color="#9b7c50"/>
      </radialGradient><radialGradient id="mphc" cx="65%" cy="68%" r="38%">
        <stop offset="0%" stop-color="rgba(120,90,50,0.18)"/><stop offset="100%" stop-color="rgba(120,90,50,0)"/>
      </radialGradient></defs>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#mphl)"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#mphc)"/>
      <path d="${shadow}" fill="rgba(14,8,4,0.94)"/></svg>`;
    return moon + roseDial(size);
  }

  // /room day-mode hero — the real RoseBloomDial: a single Mucha-pink rose
  // head (rose-single-pink.png) with slow rotate (90s) + breath (1.0→1.04) + a
  // soft rose halo pulse. Shown ONLY in day mode (see .mp-rose CSS). The breath +
  // halo live on wrapper layers (.mp-rose / .mp-rose-halo) so the image's own
  // 90s rotate and the wrapper's breath don't collide on one transform.
  function roseDial(size = 60) {
    return `<span class="mp-rose" style="position:relative;width:${size}px;height:${size}px;vertical-align:middle">
      <span class="mp-rose-halo" aria-hidden="true"></span>
      <span class="mp-rose-breath"><img class="mp-rose-img" src="assets/rose-single-pink.png" alt="" aria-hidden="true" draggable="false"></span>
    </span>`;
  }

  // Window-header pediment: a low gable arch with a finial dot, drawn into the
  // top edge of each panel so the OS chrome reads as architecture, not a browser.
  function pediment({ color = 'currentColor' } = {}) {
    return `<svg class="ped" viewBox="0 0 200 18" width="100%" height="13" preserveAspectRatio="none" aria-hidden="true" style="color:${color}">
      <path d="M2 17 Q2 3 100 3 Q198 3 198 17" fill="none" stroke="currentColor" stroke-width="0.55"/>
      <circle cx="100" cy="4.4" r="1" fill="currentColor"/>
      <path d="M84 5.5 Q100 1 116 5.5" fill="none" stroke="currentColor" stroke-width="0.45" opacity="0.7"/></svg>`;
  }

  // A taller gable with side spires — for the mobile room hero, echoing the
  // poster-arch (MuchaArch) over the medallion in the room home.
  function arch({ color = 'currentColor', accent } = {}) {
    const a = accent ?? color;
    return `<svg viewBox="0 0 320 120" width="100%" preserveAspectRatio="xMidYMin meet" aria-hidden="true" style="color:${color};display:block">
      <path d="M16 118 L16 40 Q16 14 56 14 L160 8 L264 14 Q304 14 304 40 L304 118" fill="none" stroke="currentColor" stroke-width="0.6"/>
      <path d="M40 30 Q160 -6 280 30" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.7"/>
      <circle cx="160" cy="6" r="2.4" fill="${a}"/>
      <circle cx="120" cy="11" r="1.2" fill="${a}" opacity="0.7"/><circle cx="200" cy="11" r="1.2" fill="${a}" opacity="0.7"/>
      <path d="M16 40 L10 30 M304 40 L310 30" stroke="currentColor" stroke-width="0.5"/>
      <g fill="${a}" opacity="0.55"><circle cx="10" cy="28" r="1.6"/><circle cx="310" cy="28" r="1.6"/></g>
      <path d="M70 22 q-10 -8 -2 -16 M250 22 q10 -8 2 -16" fill="none" stroke="currentColor" stroke-width="0.4" opacity="0.6"/></svg>`;
  }

  // Hairline rule with a centered bud — section divider inside panels.
  function rule({ color = 'currentColor', accent } = {}) {
    const a = accent ?? color;
    return `<svg viewBox="0 0 200 8" width="100%" height="8" preserveAspectRatio="none" aria-hidden="true" style="color:${color};display:block">
      <line x1="6" y1="4" x2="92" y2="4" stroke="currentColor" stroke-width="0.5"/>
      <line x1="108" y1="4" x2="194" y2="4" stroke="currentColor" stroke-width="0.5"/>
      <circle cx="100" cy="4" r="1.8" fill="${a}"/>
      <circle cx="100" cy="4" r="3.4" fill="none" stroke="currentColor" stroke-width="0.4" opacity="0.6"/></svg>`;
  }

  // Small corner flourish for window top-corners (vine curl + leaf).
  function flourish({ color = 'currentColor', accent, size = 22 } = {}) {
    const a = accent ?? color;
    return `<svg viewBox="0 0 30 30" width="${size}" height="${size}" aria-hidden="true" style="color:${color}">
      <path d="M2 28 Q2 6 24 4 Q14 8 12 16 Q18 12 26 14" fill="none" stroke="currentColor" stroke-width="0.5"/>
      <ellipse cx="9" cy="20" rx="1.4" ry="3.6" transform="rotate(40 9 20)" fill="none" stroke="currentColor" stroke-width="0.4" opacity="0.7"/>
      <circle cx="24" cy="4" r="1.4" fill="${a}"/></svg>`;
  }

  root.Mucha = { medallion, vine, mosaic, moonPhase, pediment, arch, rule, flourish };
})(window);
