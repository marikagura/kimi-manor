// mucha.js — Art Nouveau SVG ornaments. From the React
// components (MuchaMedallion / MuchaVine / MuchaMosaic / MoonPhaseSvg).
// Pure functions → SVG markup strings. color = hairline, accent = bud/leaf.

// --- Medallion: inner ring + 16 alternating ticks + center bud (viewBox 80) ---
export function medallion({ color = 'currentColor', accent, size = 150 } = {}) {
  const a = accent ?? color;
  let lines = '';
  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2;
    const r1 = 22, r2 = i % 2 === 0 ? 32 : 28;
    lines += `<line x1="${40 + Math.cos(ang) * r1}" y1="${40 + Math.sin(ang) * r1}" x2="${40 + Math.cos(ang) * r2}" y2="${40 + Math.sin(ang) * r2}" stroke="currentColor" stroke-width="0.5"/>`;
  }
  return `<svg viewBox="0 0 80 80" width="${size}" height="${size}" style="color:${color}" aria-hidden>
    <circle cx="40" cy="40" r="18" fill="none" stroke="currentColor" stroke-width="0.6"/>
    <circle cx="40" cy="40" r="14" fill="${a}" opacity="0.15"/>
    ${lines}
    <circle cx="40" cy="40" r="3" fill="${a}"/></svg>`;
}

// --- Vine divider: continuous Q wave + 3 buds + 2 angled leaves (viewBox 300x24) ---
export function vine({ color = 'currentColor', accent } = {}) {
  const a = accent ?? color;
  return `<svg viewBox="0 0 300 24" width="100%" style="color:${color};display:block" aria-hidden preserveAspectRatio="xMidYMid meet">
    <path d="M10 12 Q30 4 50 12 Q70 20 90 12 Q110 4 130 12 Q150 20 170 12 Q190 4 210 12 Q230 20 250 12 Q270 4 290 12" fill="none" stroke="currentColor" stroke-width="0.6"/>
    <g fill="${a}" opacity="0.8"><circle cx="50" cy="12" r="2"/><circle cx="150" cy="12" r="2.5"/><circle cx="250" cy="12" r="2"/></g>
    <g stroke="currentColor" fill="none" stroke-width="0.4" opacity="0.6">
      <ellipse cx="90" cy="12" rx="2" ry="5" transform="rotate(20 90 12)"/>
      <ellipse cx="210" cy="12" rx="2" ry="5" transform="rotate(-20 210 12)"/></g></svg>`;
}

// --- Mosaic corner: 6x6 three-state Byzantine tiles (viewBox 60) ---
export function mosaic({ color = 'currentColor', accent, size = 40 } = {}) {
  const a = accent ?? color;
  let sq = '';
  for (let r = 0; r < 6; r++) for (let q = 0; q < 6; q++) {
    const d = (r + q) % 3;
    const fill = d === 0 ? 'currentColor' : d === 1 ? a : 'none';
    const op = d === 0 ? 0.15 : d === 1 ? 0.3 : 0.6;
    sq += `<rect x="${q * 10}" y="${r * 10}" width="9" height="9" fill="${fill}" stroke="currentColor" stroke-width="0.3" opacity="${op}"/>`;
  }
  return `<svg viewBox="0 0 60 60" width="${size}" height="${size}" style="color:${color}" aria-hidden>${sq}</svg>`;
}

// --- Moon phase disc: two-arc algorithm + gold gradient + glow (viewBox 24) ---
export function moonPhase({ phase = 0.5, size = 60 } = {}) {
  const r = 12, cx = 12, cy = 12;
  const cosVal = Math.cos(2 * Math.PI * phase);
  const rx = Math.abs(cosVal) * r;
  const isWaxing = phase < 0.5;
  const sweepOuter = isWaxing ? 0 : 1;
  const sweepInner = (cosVal >= 0) === isWaxing ? 1 : 0;
  const shadow = `M ${cx},${cy - r} A ${r},${r} 0 0 ${sweepOuter} ${cx},${cy + r} A ${rx},${r} 0 0 ${sweepInner} ${cx},${cy - r} Z`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden
      style="display:inline-block;filter:drop-shadow(0 0 8px rgba(212,154,86,0.32)) drop-shadow(0 0 14px rgba(212,154,86,0.18))">
    <defs><radialGradient id="mphl" cx="38%" cy="36%" r="70%">
      <stop offset="0%" stop-color="#fff6e0"/><stop offset="55%" stop-color="#e4d3ad"/><stop offset="100%" stop-color="#9b7c50"/>
    </radialGradient><radialGradient id="mphc" cx="65%" cy="68%" r="38%">
      <stop offset="0%" stop-color="rgba(120,90,50,0.18)"/><stop offset="100%" stop-color="rgba(120,90,50,0)"/>
    </radialGradient></defs>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#mphl)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#mphc)"/>
    <path d="${shadow}" fill="rgba(14,8,4,0.94)"/></svg>`;
}
