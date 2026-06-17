// travel-windows.js — 3 versions of the 穿越 casement, each with a different
// ornate window frame (wrought-iron arch / broken pediment / pointed lattice).
// Frame = gold tracery + an opaque "surround" that masks the scene to the opening
// (no clip-path needed: evenodd hole). Scene = Pompeii dusk behind. Click → 开/夜.
(function (root) {
  const G = 'fill="none" stroke="currentColor"';
  const VB = 'viewBox="0 0 168 252" preserveAspectRatio="none"';

  function scenePompeii(){
    const stars=Array.from({length:9},()=>`<circle cx="${(Math.random()*168)|0}" cy="${(Math.random()*70)|0}" r="${(Math.random()*0.7+0.3).toFixed(1)}" opacity="${(Math.random()*0.5+0.3).toFixed(2)}"/>`).join('');
    const flies=Array.from({length:6},()=>`<circle cx="${(Math.random()*168)|0}" cy="${(150+Math.random()*70)|0}" r="${(Math.random()*0.9+0.5).toFixed(1)}" opacity="${(Math.random()*0.5+0.4).toFixed(2)}"/>`).join('');
    return `<svg viewBox="0 0 168 252" preserveAspectRatio="xMidYMid slice" aria-label="庞贝">
      <defs>
        <linearGradient id="tps" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1c33"/><stop offset=".34" stop-color="#6e3f48"/><stop offset=".62" stop-color="#b56a4e"/><stop offset=".84" stop-color="#e0a062"/><stop offset="1" stop-color="#f4cd86"/></linearGradient>
        <radialGradient id="tpsun" cx="62%" cy="92%" r="60%"><stop offset="0" stop-color="#fff0c4" stop-opacity=".95"/><stop offset=".42" stop-color="#ffd591" stop-opacity=".5"/><stop offset="1" stop-color="#ffd591" stop-opacity="0"/></radialGradient>
        <linearGradient id="tpv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c2733"/><stop offset="1" stop-color="#1c1118"/></linearGradient></defs>
      <rect width="168" height="252" fill="url(#tps)"/>
      <circle cx="110" cy="210" r="120" fill="url(#tpsun)"/>
      <g fill="#fff0c4">${stars}</g>
      <g stroke="#3a2228" stroke-width=".7" fill="none" opacity=".55"><path d="M52 56 q3 -3 6 0 q3 -3 6 0"/><path d="M74 64 q2.5 -2.5 5 0 q2.5 -2.5 5 0"/></g>
      <rect y="138" width="168" height="20" fill="#e6a878" opacity=".12"/>
      <path d="M118 172 Q150 118 162 104 Q176 120 200 172 Z" fill="url(#tpv)"/>
      <path d="M150 104 q3 -16 -4 -26 q12 8 9 24" fill="none" stroke="#e6b07a" stroke-width=".7" opacity=".45"/>
      <path d="M0 172 q40 -22 90 -7 q44 14 110 -3 L168 172 L168 174 L0 174Z" fill="#3a2630" opacity=".66"/>
      <g fill="#1f141c" opacity=".82" transform="translate(48 116)"><path d="M-6 8 L40 8 L34 0 L0 0Z"/><rect x="-2" y="9" width="3.4" height="28"/><rect x="7" y="9" width="3.4" height="28"/><rect x="16" y="9" width="3.4" height="28"/><rect x="25" y="9" width="3.4" height="28"/><rect x="34" y="9" width="3.4" height="28"/><rect x="-6" y="37" width="46" height="3.4"/></g>
      <path d="M0 172 L168 172 L168 252 L0 252Z" fill="#160d14"/>
      <g fill="#160d14"><path d="M40 172 q-4 -30 3 -44 q8 14 4 44Z"/><path d="M52 172 q-2 -20 2 -30 q5 11 3 30Z"/></g>
      <g transform="translate(20 110)"><rect x="-7" y="0" width="14" height="62" fill="#120c10"/><g stroke="#d8a86a" stroke-width=".8" opacity=".8"><line x1="-4" y1="5" x2="-4" y2="57"/><line x1="0" y1="5" x2="0" y2="57"/><line x1="4" y1="5" x2="4" y2="57"/></g><path d="M-10 0 q10 -7 20 0" fill="none" stroke="#d8a86a" stroke-width=".9"/><rect x="-10" y="-5" width="20" height="5" fill="#1a1016" stroke="#d8a86a" stroke-width=".5"/></g>
      <g fill="#ffe6a8">${flies}</g></svg>`;
  }

  // each frame returns SVG inner: surround mask (dark, hole=opening) + gold tracery
  const surround = op => `<path class="fw-surround" d="M0 0H168V252H0Z ${op}" fill-rule="evenodd" fill="#0e0a06"/>`;

  function frameIron(){
    const op='M30 96 A54 54 0 0 1 138 96 V204 H30 Z';
    // fine radial muntins in the arch crown (hairline, canon fidelity)
    let fan=''; for(let k=1;k<=7;k++){const a=Math.PI*(k/8);fan+=`<line x1="84" y1="96" x2="${(84-54*Math.cos(a)).toFixed(1)}" y2="${(96-54*Math.sin(a)).toFixed(1)}"/>`;}
    // delicate pearls at muntin crossings (replaces chunky diamond bosses)
    let bos=''; [124,152,180].forEach(y=>{bos+=`<circle cx="64" cy="${y}" r="1.5" fill="currentColor"/><circle cx="104" cy="${y}" r="1.5" fill="currentColor"/>`;});
    return `<svg class="frame" ${VB}>${surround(op)}
      <path d="${op}" ${G} stroke-width="0.9"/><path d="M22 96 A62 62 0 0 1 146 96 V212 H22 Z" ${G} stroke-width="0.8"/>
      <line x1="84" y1="44" x2="84" y2="204" ${G} stroke-width="0.6"/>
      <g ${G} stroke-width="0.5" opacity=".65">${fan}</g>
      <g ${G} stroke-width="0.7"><line x1="64" y1="104" x2="64" y2="204"/><line x1="104" y1="104" x2="104" y2="204"/><line x1="30" y1="150" x2="138" y2="150"/></g>
      <g opacity=".95">${bos}</g>
      <g fill="currentColor" opacity=".9"><circle cx="84" cy="40" r="2.6"/><circle cx="76" cy="46" r="1.6"/><circle cx="92" cy="46" r="1.6"/><circle cx="69" cy="52" r="1.1"/><circle cx="99" cy="52" r="1.1"/></g>
      <g ${G} stroke-width="0.5" opacity=".8"><path d="M70 56 Q60 74 56 96"/><path d="M98 56 Q108 74 112 96"/><path d="M84 44 V40"/></g>
      <g fill="currentColor" opacity=".55"><ellipse cx="36" cy="104" rx="2" ry="5.5" transform="rotate(-32 36 104)"/><ellipse cx="132" cy="104" rx="2" ry="5.5" transform="rotate(32 132 104)"/></g>
      <path d="M16 204 H152 M20 204 V224 H148 V204" ${G} stroke-width="0.9"/>
      <g fill="currentColor" opacity=".7"><circle cx="20" cy="204" r="1.2"/><circle cx="148" cy="204" r="1.2"/></g></svg>`;
  }
  function framePediment(){
    const op='M34 86 H134 V206 H34 Z';
    let h=''; for(let y=120;y<=190;y+=34) h+=`<line x1="34" y1="${y}" x2="134" y2="${y}"/>`;
    return `<svg class="frame" ${VB}>${surround(op)}
      <g ${G} stroke-width="2"><path d="M30 62 Q30 30 70 30 Q60 40 64 50"/><path d="M138 62 Q138 30 98 30 Q108 40 104 50"/></g>
      <g ${G} stroke-width="1.2"><path d="M78 44 q6 -12 12 0 q-2 8 -6 8 q-4 0 -6 -8"/><line x1="84" y1="30" x2="84" y2="18"/></g><circle cx="84" cy="16" r="2.6" fill="currentColor"/>
      <path d="${op}" ${G} stroke-width="1.6"/><path d="M26 70 H142 V214 H26 Z" ${G} stroke-width="2"/>
      <line x1="26" y1="70" x2="142" y2="70" ${G} stroke-width="1.6"/>
      <g ${G} stroke-width="1"><line x1="84" y1="86" x2="84" y2="206"/>${h}</g>
      <path d="M18 214 H150 M22 214 V236 H146 V214" ${G} stroke-width="1.6"/></svg>`;
  }
  function framePointed(){
    const op='M32 100 Q32 54 84 30 Q136 54 136 100 V206 H32 Z';
    let v=''; [56,84,112].forEach(x=>v+=`<line x1="${x}" y1="62" x2="${x}" y2="206"/>`);
    let h=''; for(let y=112;y<=188;y+=24) h+=`<line x1="32" y1="${y}" x2="136" y2="${y}"/>`;
    return `<svg class="frame" ${VB}>${surround(op)}
      <path d="${op}" ${G} stroke-width="1.6"/><path d="M24 102 Q24 48 84 22 Q144 48 144 102 V214 H24 Z" ${G} stroke-width="2"/>
      <g ${G} stroke-width=".95">${v}${h}<path d="M84 30 V100 M32 100 Q60 70 84 64 Q108 70 136 100"/></g>
      <path d="M16 214 H152 M20 214 V232 H148 V214" ${G} stroke-width="1.6"/></svg>`;
  }

  function sceneSky(){
    const stars=Array.from({length:10},()=>`<circle cx="${(Math.random()*168)|0}" cy="${(Math.random()*150)|0}" r="0.6" opacity="${(Math.random()*0.6+0.2).toFixed(2)}"/>`).join('');
    const rain=Array.from({length:40},()=>{const x=(Math.random()*168)|0,y=(Math.random()*200)|0;return `<line x1="${x}" y1="${y}" x2="${x-7}" y2="${y+15}"/>`;}).join('');
    return `<svg viewBox="0 0 168 252" preserveAspectRatio="xMidYMid slice" aria-label="夜雨">
      <defs><linearGradient id="tns" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0d1a"/><stop offset=".55" stop-color="#171528"/><stop offset="1" stop-color="#2a2030"/></linearGradient>
        <radialGradient id="tnm" cx="42%" cy="34%" r="62%"><stop offset="0" stop-color="#fff7e2"/><stop offset=".55" stop-color="#e6d4ac"/><stop offset="1" stop-color="#9a7c50"/></radialGradient></defs>
      <rect width="168" height="252" fill="url(#tns)"/>
      <circle cx="98" cy="62" r="44" fill="#fff3d2" opacity=".12"/>
      <g fill="#fff">${stars}</g>
      <circle cx="98" cy="62" r="22" fill="url(#tnm)"/><path d="M98 40 a22 22 0 0 0 0 44 a16 22 0 0 1 0 -44Z" fill="#0d0f1c" opacity=".32"/>
      <g stroke="rgba(200,212,235,.3)" stroke-width=".8">${rain}</g>
      <g fill="#0b0810"><rect x="0" y="186" width="48" height="66"/><rect x="40" y="150" width="34" height="102"/><path d="M42 150 h30 l-15 -14Z"/><rect x="74" y="194" width="58" height="58"/><rect x="128" y="166" width="22" height="86"/><rect x="146" y="198" width="44" height="54"/></g>
      <g fill="#d8a86a" opacity=".5"><rect x="48" y="164" width="3" height="5"/><rect x="55" y="164" width="3" height="5"/><rect x="84" y="206" width="3" height="5"/></g></svg>`;
  }

  root.TravelWindows = {
    scene: scenePompeii,
    sceneSky: sceneSky,
    frameByKey: k => (root.TravelWindows.frames.find(f=>f.key===k)||root.TravelWindows.frames[0]),
    frames: [
      { key:'iron',     fn:frameIron,     cn:'铁艺 · 拱窗', en:'Wrought-iron Arch' },
      { key:'pediment', fn:framePediment, cn:'山墙 · 断檐冠', en:'Broken Pediment' },
      { key:'pointed',  fn:framePointed,  cn:'尖拱 · 密格',  en:'Pointed Lattice' },
    ],
  };
})(window);
