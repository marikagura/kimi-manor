// mucha-v2.js — extra Art Nouveau ornaments for the v2 modules.
// Extends window.Mucha (base set lives in mucha.js). Room ornaments:
// rose flourishes, confidence seed-buds, sitting fox glyph, event diamond,
// the centered header rule, and the framed-card pediment tab.
(function (root) {
  const M = root.Mucha || (root.Mucha = {});

  // Rose flourish on a curved stem + leaf — flanks page titles (memory.review).
  // dir: 1 right-facing, -1 left-facing.
  M.rose = function ({ color = 'currentColor', accent, size = 40, dir = 1 } = {}) {
    const a = accent ?? color;
    return `<svg viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true"
      style="color:${color};transform:scaleX(${dir})">
      <path d="M6 38 Q4 24 14 16" fill="none" stroke="currentColor" stroke-width="0.7"/>
      <path d="M9 27 Q3 25 2 19 Q8 21 10 26" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.8"/>
      <g transform="translate(15 11)" stroke="${a}" fill="none" stroke-width="0.7">
        <circle cx="0" cy="0" r="6.4" opacity="0.5"/>
        <path d="M-3.4 1.6 Q0 -4.6 3.4 1.6 Q0 4.2 -3.4 1.6 Z"/>
        <path d="M-4.8 -1 Q0 4 4.8 -1" opacity="0.7"/>
        <path d="M0 -5 Q3 -2 2.4 1.4" opacity="0.6"/>
      </g></svg>`;
  };

  // Confidence seed-bud — almond w/ inner seed. filled = scored, hollow = empty.
  M.bud = function ({ color = 'currentColor', filled = true, size = 15 } = {}) {
    if (filled)
      return `<svg viewBox="0 0 16 18" width="${size}" height="${size*18/16}" aria-hidden="true" style="color:${color}">
        <path d="M8 1 Q14 7 8 17 Q2 7 8 1 Z" fill="currentColor" opacity="0.92"/>
        <path d="M8 4 Q11 8 8 14 Q5 8 8 4 Z" fill="#0a0806" opacity="0.55"/></svg>`;
    return `<svg viewBox="0 0 16 18" width="${size}" height="${size*18/16}" aria-hidden="true" style="color:${color}">
      <path d="M8 1 Q14 7 8 17 Q2 7 8 1 Z" fill="none" stroke="currentColor" stroke-width="0.9" opacity="0.6"/></svg>`;
  };

  // Sitting fox — minimal line glyph (calendar event marker, room motif).
  M.fox = function ({ color = 'currentColor', size = 22 } = {}) {
    return `<svg viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true" style="color:${color}">
      <path d="M9 7 L12 14 M23 7 L20 14" stroke="currentColor" stroke-width="1" fill="none"/>
      <path d="M12 13 Q9 18 11 25 Q16 27 21 25 Q23 18 20 13 Q16 11 12 13 Z" fill="none" stroke="currentColor" stroke-width="1"/>
      <path d="M20 24 Q28 23 27 16 Q24 19 21 19" fill="none" stroke="currentColor" stroke-width="0.9"/>
      <circle cx="14" cy="18" r="0.8" fill="currentColor"/><circle cx="18" cy="18" r="0.8" fill="currentColor"/>
      <path d="M15 21 Q16 22 17 21" stroke="currentColor" stroke-width="0.7" fill="none"/></svg>`;
  };

  // Event diamond on a rule — calendar legend / timeline node.
  M.diamond = function ({ color = 'currentColor', size = 16 } = {}) {
    return `<svg viewBox="0 0 24 12" width="${size*2}" height="${size}" aria-hidden="true" style="color:${color}">
      <line x1="0" y1="6" x2="9" y2="6" stroke="currentColor" stroke-width="0.7"/>
      <line x1="15" y1="6" x2="24" y2="6" stroke="currentColor" stroke-width="0.7"/>
      <path d="M12 2 L15 6 L12 10 L9 6 Z" fill="currentColor"/></svg>`;
  };

  // Centered header rule: hairline — node ◎ — hairline (under titles).
  M.headerRule = function ({ color = 'currentColor', accent } = {}) {
    const a = accent ?? color;
    return `<svg viewBox="0 0 400 16" width="100%" height="16" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style="color:${color};display:block">
      <line x1="60" y1="8" x2="186" y2="8" stroke="currentColor" stroke-width="0.6"/>
      <line x1="214" y1="8" x2="340" y2="8" stroke="currentColor" stroke-width="0.6"/>
      <circle cx="200" cy="8" r="3.4" fill="none" stroke="${a}" stroke-width="0.7"/>
      <circle cx="200" cy="8" r="1.2" fill="${a}"/>
      <circle cx="186" cy="8" r="0.9" fill="currentColor" opacity="0.6"/>
      <circle cx="214" cy="8" r="0.9" fill="currentColor" opacity="0.6"/></svg>`;
  };

  // Framed-card pediment tab — small bracket w/ node centered on a card's top edge.
  M.cardTab = function ({ color = 'currentColor' } = {}) {
    return `<svg viewBox="0 0 120 16" width="120" height="16" aria-hidden="true" style="color:${color};display:block">
      <path d="M2 15 L2 6 Q2 3 12 3 L48 3 Q56 3 58 1 M118 15 L118 6 Q118 3 108 3 L72 3 Q64 3 62 1" fill="none" stroke="currentColor" stroke-width="0.7"/>
      <circle cx="60" cy="2.5" r="2.6" fill="none" stroke="currentColor" stroke-width="0.7"/>
      <circle cx="60" cy="2.5" r="0.9" fill="currentColor"/></svg>`;
  };
})(window);
