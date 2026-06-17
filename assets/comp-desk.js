/* comp-desk.js — a frameless "书桌 / desk" scene for cc-gild. A Mucha gilt
   line-art writing desk in light perspective: a sheet of letter paper (text
   lines + a wax seal), a fountain pen, an inkwell, a closed book, and a single
   rose in a bud vase, lit by a soft halo. Decorative demo only — no real content.
   Token-driven (var(--accent)/--hair/--ink/--rose/--sage/--mute) so day/night
   follow the cc-gild theme. Vanilla, no framework. window.Comp.desk(el). */
(function (w) {
  w.Comp = w.Comp || {};

  function injectCss() {
    if (document.getElementById('comp-desk-css')) return;
    var s = document.createElement('style');
    s.id = 'comp-desk-css';
    s.textContent = [
      '.cc-desk{padding:8px 8px 12px;font-family:var(--serif);color:var(--ink);text-align:center}',
      '.cc-desk svg{width:100%;height:auto;max-width:440px;display:block;margin:0 auto;overflow:visible}',
      '.cc-desk__cap{margin-top:8px;font-style:italic;font-size:11px;letter-spacing:.2em;color:var(--mute)}',
      '.cc-desk__cap b{font-family:var(--cjk);font-style:normal;font-weight:500;color:var(--accent);letter-spacing:.12em;margin-right:8px}'
    ].join('');
    document.head.appendChild(s);
  }

  function svg() {
    return '' +
    '<svg viewBox="0 0 360 280" aria-hidden="true">' +
      '<defs>' +
        '<radialGradient id="ccDeskHalo" cx="50%" cy="40%" r="62%">' +
          '<stop offset="0%" stop-color="var(--accent)" stop-opacity="0.12"/>' +
          '<stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>' +
        '</radialGradient>' +
      '</defs>' +
      '<rect x="0" y="0" width="360" height="280" fill="url(#ccDeskHalo)"/>' +

      // ── desk: top trapezoid (light perspective) + front edge thickness ──
      '<g fill="var(--accent)" stroke="var(--accent)" stroke-linejoin="round">' +
        '<path d="M44 190 L80 134 L280 134 L316 190 Z" fill-opacity="0.05" stroke-width="1"/>' +
        '<path d="M44 190 L316 190 L316 199 L44 199 Z" fill-opacity="0.10" stroke-width="0.8"/>' +
        // two front legs (gently turned) + feet
        '<path d="M66 199 Q60 230 64 261 L76 261 Q78 230 82 199 Z" fill-opacity="0.06" stroke-width="0.8"/>' +
        '<path d="M278 199 Q282 230 284 261 L296 261 Q298 230 294 199 Z" fill-opacity="0.06" stroke-width="0.8"/>' +
        '<ellipse cx="70" cy="262" rx="8" ry="2.2" fill-opacity="0.10" stroke="none"/>' +
        '<ellipse cx="290" cy="262" rx="8" ry="2.2" fill-opacity="0.10" stroke="none"/>' +
      '</g>' +

      // ── letter paper (tilted), faint card + ruled text lines + wax seal ──
      '<path d="M102 178 L110 150 L196 156 L188 184 Z" fill="var(--accent)" fill-opacity="0.06" stroke="var(--hair)" stroke-width="0.9"/>' +
      '<g stroke="var(--ink)" stroke-opacity="0.32" stroke-width="0.8" stroke-linecap="round">' +
        '<path d="M118 159 L184 164"/><path d="M116 165 L182 170"/>' +
        '<path d="M114 171 L180 175"/><path d="M113 177 L156 180"/>' +
      '</g>' +
      '<circle cx="180" cy="180" r="3.2" fill="var(--rose)"/>' +

      // ── inkwell (left) ──
      '<path d="M86 184 Q86 172 96 172 Q106 172 106 184 Z" fill="var(--accent)" fill-opacity="0.12" stroke="var(--accent)" stroke-width="0.9"/>' +
      '<path d="M92 172 L92 167 L100 167 L100 172" fill="none" stroke="var(--accent)" stroke-width="0.9"/>' +

      // ── fountain pen lying across the paper ──
      '<path d="M206 149 L158 181" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round" fill="none"/>' +
      '<path d="M158 181 L151 187 L156 180 Z" fill="var(--accent)"/>' +
      '<path d="M199 150 L207 154" stroke="var(--ink)" stroke-opacity="0.6" stroke-width="1.2" stroke-linecap="round"/>' +

      // ── closed book (right) ──
      '<path d="M230 178 L242 153 L300 159 L288 184 Z" fill="var(--accent)" fill-opacity="0.06" stroke="var(--accent)" stroke-width="1" stroke-linejoin="round"/>' +
      '<path d="M230 178 L288 184 L289 189 L231 183 Z" fill="var(--accent)" fill-opacity="0.04" stroke="var(--hair)" stroke-width="0.6"/>' +
      '<path d="M250 165 L284 169" stroke="var(--accent)" stroke-opacity="0.6" stroke-width="0.8" stroke-linecap="round"/>' +
      '<path d="M268 161 L270 176" stroke="var(--rose)" stroke-width="1.3" stroke-linecap="round"/>' +

      // ── bud vase + single rose (rising behind the desk) ──
      '<path d="M246 133 Q242 117 249 111 L255 111 Q262 117 258 133 Z" fill="var(--accent)" fill-opacity="0.06" stroke="var(--accent)" stroke-width="1" stroke-linejoin="round"/>' +
      '<ellipse cx="252" cy="111" rx="5" ry="1.6" fill="none" stroke="var(--accent)" stroke-width="0.9"/>' +
      '<path d="M252 111 L250 90" stroke="var(--sage)" stroke-width="1.3" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="245" cy="100" rx="5.5" ry="2.1" transform="rotate(-35 245 100)" fill="var(--sage)" fill-opacity="0.6"/>' +
      '<circle cx="250" cy="86" r="5.6" fill="var(--rose)" fill-opacity="0.75"/>' +
      '<path d="M250 86 Q245 84 247 80 Q251 78 253 81 Q255 84 250 86 Z" fill="var(--rose)"/>' +
    '</svg>';
  }

  w.Comp.desk = function (el) {
    if (!el) return;
    injectCss();
    el.innerHTML = '<div class="cc-desk">' + svg() +
      '<div class="cc-desk__cap"><b>书桌</b>desk · 暮色</div></div>';
  };
})(window);
