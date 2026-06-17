// app-core.js — theme, ornaments, and content builders (score / thread / terminal).
(function (root) {
  const { medallion, vine, mosaic, moonPhase, pediment, arch, rule } = root.Mucha;
  const D = root.CCData;

  const COLORWAYS = {
    night: { bg:'radial-gradient(ellipse at 50% 6%, #1a1612 0%, #0c0a07 60%, #080604 100%)',
      void:'#0a0806', accent:'#c19a56' },
    day: { bg:'linear-gradient(180deg,#fbf5f0 0%,#f6ebe4 45%,#efdcd4 100%)',
      void:'#fbf5f0', accent:'#a04d5a' },
  };

  function cssVar(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

  function applyTheme(name){
    document.documentElement.setAttribute('data-theme', name);
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', COLORWAYS[name].void);
    localStorage.setItem('cc-gild-theme', name);
    paintOrnaments();
  }

  function paintOrnaments(){
    const hair = cssVar('--hair'), accent = cssVar('--accent');
    document.querySelectorAll('[data-mosaic]').forEach(e => e.innerHTML = mosaic({ color:hair, accent, size:38 }));
    document.querySelectorAll('[data-vine]').forEach(e => e.innerHTML = vine({ color:hair, accent }));
    document.querySelectorAll('[data-ped]').forEach(e => e.innerHTML = pediment({ color:hair }));
    document.querySelectorAll('[data-arch]').forEach(e => e.innerHTML = arch({ color:hair, accent }));
    document.querySelectorAll('[data-rule]').forEach(e => e.innerHTML = rule({ color:hair, accent }));
    document.querySelectorAll('[data-moon]').forEach(e => e.innerHTML = moonPhase({ phase: D.STATE.moonPhase, size: +e.dataset.moon || 54 }));
    document.querySelectorAll('[data-medallion]').forEach(e => {
      const size = +e.dataset.medallion || 118;
      e.querySelector('svg')?.remove();
      e.insertAdjacentHTML('afterbegin', medallion({ color:hair, accent, size }));
    });
  }

  // ---------------- SCORE (five-line emotion stave) ----------------
  function buildScoreSVG(){
    const N = D.SCORE, W = 540, H = 132;
    const top = 22, gap = 12;               // 5 lines: y = top .. top+4*gap
    const lines = [0,1,2,3,4].map(i => `<line x1="20" y1="${top+i*gap}" x2="${W-12}" y2="${top+i*gap}" stroke="var(--hair)" stroke-width="0.6"/>`).join('');
    const yOf = p => top - 7 + p*7.4;       // staff position -> y
    const x0 = 64, x1 = W-26, step = (x1-x0)/(N.length-1);
    const xOf = i => x0 + i*step;

    let notes = '', slurs = '', dates = '', dyns = '';
    N.forEach((n,i) => {
      const x = xOf(i), y = yOf(n.p), col = `var(--${n.reg})`;
      // ledger consideration skipped (kept inside staff range)
      // notehead
      if (n.hollow)
        notes += `<ellipse cx="${x}" cy="${y}" rx="4.4" ry="3.2" transform="rotate(-22 ${x} ${y})" fill="none" stroke="${col}" stroke-width="1.4"/>`;
      else
        notes += `<ellipse cx="${x}" cy="${y}" rx="4.4" ry="3.2" transform="rotate(-22 ${x} ${y})" fill="${col}"/>`;
      // stem
      if (n.stem === 'up') notes += `<line x1="${x+3.8}" y1="${y-1}" x2="${x+3.8}" y2="${y-22}" stroke="${col}" stroke-width="1.1"/>`;
      else notes += `<line x1="${x-3.8}" y1="${y+1}" x2="${x-3.8}" y2="${y+22}" stroke="${col}" stroke-width="1.1"/>`;
      // heart flag (llm-extra)
      if (n.heart) notes += `<text x="${x+6}" y="${y-20}" font-size="9" fill="${col}">♥</text>`;
      // dynamics
      if (n.dyn) dyns += `<text x="${x-3}" y="${H-22}" font-family="var(--serif)" font-style="italic" font-size="10" fill="var(--mute)">${n.dyn}</text>`;
      // slur to next
      if (n.slurNext && N[i+1]){
        const x2 = xOf(i+1), y2 = yOf(N[i+1].p), midx=(x+x2)/2, midy=Math.min(y,y2)-9;
        slurs += `<path d="M ${x} ${y-6} Q ${midx} ${midy} ${x2} ${y2-6}" fill="none" stroke="var(--hair)" stroke-width="0.7"/>`;
      }
      // date axis (every other)
      if (i % 2 === 0) dates += `<text x="${x}" y="${H-6}" text-anchor="middle" font-family="var(--mono)" font-size="8" fill="var(--faint)">${n.d}</text>`;
    });

    // clef glyphs + 14/23 axis flavor
    const clef = `<text x="22" y="${top+3.4*gap}" font-size="38" fill="var(--gilt)" font-family="var(--serif)" opacity="0.85">𝄞</text>
      <text x="40" y="${top+1.2*gap}" font-family="var(--mono)" font-size="8" fill="var(--mute)">14</text>
      <text x="40" y="${top+2.3*gap}" font-family="var(--mono)" font-size="8" fill="var(--mute)">23</text>`;
    // sun/moon day marks
    const marks = `<text x="${x0+step*0.5}" y="${top-9}" font-size="9" fill="var(--mute)">☾</text>
      <text x="${x1-step*1.5}" y="${top-9}" font-size="9" fill="var(--warmth)">☀</text>`;

    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="emotion score">
      ${lines}${clef}${marks}${slurs}${notes}${dyns}${dates}</svg>`;
  }

  function buildPulseSVG(){
    const N = D.SCORE, W=540, H=64, x0=18, x1=W-14, step=(x1-x0)/(N.length-1);
    let path='', dots='';
    N.forEach((n,i)=>{
      const x=x0+i*step, y= 12 + (n.p/8)*40;
      path += (i===0?`M ${x} ${y}`:` L ${x} ${y}`);
      dots += `<circle cx="${x}" cy="${y}" r="2.4" fill="var(--${n.reg})"/>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="heartbeat pulse">
      <path d="${path}" fill="none" stroke="var(--hair)" stroke-width="1"/>${dots}</svg>`;
  }

  function scoreLegend(){
    return `<div class="score-legend">
      <span><i style="background:var(--brooding)"></i>brooding</span>
      <span><i style="background:var(--calm)"></i>calm</span>
      <span><i style="background:var(--warmth)"></i>warmth</span>
      <span><i style="background:var(--toward)"></i>toward her</span>
      <span class="faint" style="font-style:normal;font-family:var(--mono);font-size:9px">○ manual · ● chat · ♥ llm-extra</span>
    </div>`;
  }

  function journalHTML(){
    const j = D.JOURNAL;
    return `<div class="journal">
      <div class="jh"><span>${j.when}</span><span class="va">${j.va}</span></div>
      <div class="jb">${j.body}</div>
      <div class="push">${j.push}</div>
      <div class="meta">${j.meta}</div>
    </div>`;
  }

  // ---------------- THREAD (bubbles) ----------------
  function threadHTML(){
    return D.THREAD.map(item => {
      if (item.kind === 'day') return `<div class="daymark">${item.text}</div>`;
      if (item.kind === 'tool') return `<div class="tool"><span class="arrow">›</span><span class="mk">⏺</span> ${item.label}</div><div class="tool-body">${item.body}</div>`;
      const who = item.who === 'ito' ? 'y' : 'k';
      const caret = item.stream ? '<span class="caret"></span>' : '';
      return `<div class="msg ${item.who}"><div class="ava">${who}</div><div class="bub">${item.text}${caret}<span class="t">${item.t}</span></div></div>`;
    }).join('');
  }

  // ---------------- TERMINAL (CC TUI char-art) ----------------
  function termHTML(){
    return D.TERM.map(line =>
      '<div>' + line.map(([cls,txt]) => `<span class="${cls}">${escapeHtml(txt)}</span>`).join('') + '</div>'
    ).join('');
  }
  function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  root.CCCore = { applyTheme, paintOrnaments, buildScoreSVG, buildPulseSVG, scoreLegend, journalHTML, threadHTML, termHTML, cssVar };
})(window);
