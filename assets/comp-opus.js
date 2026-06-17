// comp-opus.js — "opus score" demo panel for cc-gild.
// Vanilla port of the visual essence of kimi-web OpusSheet (grand-staff score sheet).
// Decorative demo only: a treble + bass grand staff, clefs, time sig, and a phrase
// of gold noteheads (filled + hollow), stems, beams, one slur. GENERIC content.
// Persona: kimi / you. Reuses cc-gild design tokens via CSS vars — no hardcoded colors.
(function (root) {
  root.Comp = root.Comp || {};

  // ----- score geometry (viewBox units) -----
  var W = 360, PAD_L = 56, PAD_R = 16;
  var TREBLE_Y = 14, BASS_Y = 46, GAP = 6, STAFF_H = GAP * 4; // 24
  var NOTE_L = PAD_L + 26, NOTE_R = W - PAD_R - 8;

  // score valence palette → cc-gild tokens (filled noteheads tint by "mood")
  var TINT = ['var(--brooding)', 'var(--calm)', 'var(--warmth)', 'var(--toward)'];

  function staffLines(topY) {
    var s = '';
    for (var i = 0; i < 5; i++) {
      var y = topY + i * GAP;
      s += '<line x1="' + (PAD_L - 2) + '" x2="' + (W - PAD_R + 2) + '" y1="' + y +
           '" y2="' + y + '" stroke="var(--hair)" stroke-width="0.6"/>';
    }
    return s;
  }

  function trebleClef(x, y) {
    var s = (STAFF_H + 10) / 60;
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s.toFixed(3) +
      ')" fill="none" stroke="var(--ink)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M 11 8 C 16 10,16 22,11 26 C 4 30,1 22,5 16 C 10 8,18 12,18 22 ' +
      'C 18 36,8 40,8 50 C 8 56,13 58,16 55 M 11 32 C 12 38,13 44,11 52 C 9 56,5 56,5 52"/>' +
      '<circle cx="9" cy="55" r="2" fill="var(--ink)"/></g>';
  }

  function bassClef(x, y) {
    var s = (STAFF_H - 2) / 36;
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s.toFixed(3) +
      ')" fill="none" stroke="var(--ink)" stroke-width="2.2" stroke-linecap="round">' +
      '<path d="M 4 4 C 12 3,18 9,18 16 C 18 24,10 30,2 30"/>' +
      '<circle cx="22" cy="9" r="1.5" fill="var(--ink)"/>' +
      '<circle cx="22" cy="15" r="1.5" fill="var(--ink)"/></g>';
  }

  function timeSig(topY) {
    var x = PAD_L + 20;
    function t(yy, txt) {
      return '<text x="' + x + '" y="' + yy + '" text-anchor="middle" font-size="10" ' +
        'font-style="italic" font-weight="600" fill="var(--ink)" ' +
        'font-family="var(--serif)">' + txt + '</text>';
    }
    return t(topY + GAP * 1.7, '4') + t(topY + GAP * 3.7, '4');
  }

  // one note: rotated ellipse head (filled or hollow) + stem + optional solo flag
  function note(x, y, opts) {
    var top = opts.top, filled = opts.filled, flag = opts.flag, col = opts.color || 'var(--accent)';
    var stemUp = y > top + STAFF_H / 2;        // below mid-line → stem up
    var sx = x + (stemUp ? 2.4 : -2.4);
    var sy2 = stemUp ? y - GAP * 2.4 : y + GAP * 2.4;
    var rot = 'rotate(-22 ' + x + ' ' + y + ')';
    var head = filled
      ? '<ellipse cx="' + x + '" cy="' + y + '" rx="2.9" ry="2.0" fill="' + col + '" transform="' + rot + '"/>'
      : '<ellipse cx="' + x + '" cy="' + y + '" rx="2.9" ry="2.0" fill="none" stroke="' + col +
        '" stroke-width="1.0" transform="' + rot + '"/>';
    var stem = '<line x1="' + sx + '" x2="' + sx + '" y1="' + y + '" y2="' + sy2 +
      '" stroke="' + col + '" stroke-width="0.7"/>';
    var fl = '';
    if (flag) {
      fl = '<path d="M' + sx + ' ' + sy2 + (stemUp ? ' q 4 1 3 6' : ' q 4 -1 3 -6') +
        '" stroke="' + col + '" stroke-width="0.7" fill="none" stroke-linecap="round"/>';
    }
    return head + stem + fl;
  }

  // arch-shaped demo phrase across the treble staff, with a beamed pair + a slur
  function phrase() {
    var n = 7, out = '', xs = [], ys = [];
    var anchor = TREBLE_Y + STAFF_H * 0.5;
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1);
      var x = NOTE_L + (NOTE_R - NOTE_L) * t;
      var y = anchor - Math.sin(t * Math.PI) * GAP * 2.2;       // arch
      xs.push(x); ys.push(y);
    }
    // beam the middle pair (indices 3,4); render its two stems straight to a beam
    var beamI = [3, 4];
    for (var j = 0; j < n; j++) {
      var col = TINT[j % TINT.length];
      var filled = j !== 1 && j !== 5;                          // two hollow notes
      var inBeam = beamI.indexOf(j) !== -1;
      var flag = !inBeam && filled && (j === 2 || j === 4);     // a couple of solo flags
      if (inBeam) {
        // straight stem up to a common beam height
        var sx = xs[j] + 2.4, by = anchor - GAP * 3.4;
        out += '<ellipse cx="' + xs[j] + '" cy="' + ys[j] + '" rx="2.9" ry="2.0" fill="' + col +
          '" transform="rotate(-22 ' + xs[j] + ' ' + ys[j] + ')"/>' +
          '<line x1="' + sx + '" x2="' + sx + '" y1="' + ys[j] + '" y2="' + by +
          '" stroke="' + col + '" stroke-width="0.7"/>';
      } else {
        out += note(xs[j], ys[j], { top: TREBLE_Y, filled: filled, flag: flag, color: col });
      }
    }
    // beam bar across the pair
    var bxL = xs[beamI[0]] + 2.4, bxR = xs[beamI[1]] + 2.4, byTop = anchor - GAP * 3.4;
    out += '<line x1="' + bxL + '" x2="' + bxR + '" y1="' + byTop + '" y2="' + byTop +
      '" stroke="' + TINT[3] + '" stroke-width="1.6"/>';
    // slur arcing over the last three noteheads
    var s0 = n - 3, s1 = n - 1;
    out += '<path d="M ' + xs[s0] + ' ' + (ys[s0] - 5) + ' Q ' + ((xs[s0] + xs[s1]) / 2) + ' ' +
      (ys[s0] - 13) + ' ' + xs[s1] + ' ' + (ys[s1] - 5) +
      '" fill="none" stroke="var(--accent)" stroke-width="0.8" opacity="0.75"/>';
    return out;
  }

  function svg() {
    var bassH = BASS_Y + STAFF_H;
    var brace = '<path d="M ' + (PAD_L - 8) + ' ' + (TREBLE_Y - 2) +
      ' C ' + (PAD_L - 14) + ' ' + (TREBLE_Y + STAFF_H / 2) + ', ' +
      (PAD_L - 14) + ' ' + (BASS_Y + STAFF_H / 2) + ', ' +
      (PAD_L - 8) + ' ' + (bassH + 2) + '" stroke="var(--accent)" stroke-width="1" fill="none" opacity="0.8"/>';
    var systemBar = '<line x1="' + (PAD_L - 2) + '" x2="' + (PAD_L - 2) + '" y1="' + TREBLE_Y +
      '" y2="' + bassH + '" stroke="var(--hair)" stroke-width="0.8"/>';
    var finalBar = '<line x1="' + (W - PAD_R) + '" x2="' + (W - PAD_R) + '" y1="' + (TREBLE_Y - 2) +
      '" y2="' + (bassH + 2) + '" stroke="var(--hair)" stroke-width="0.6"/>';
    // a few quiet bass noteheads for grand-staff balance
    var bassNotes =
      note(NOTE_L + 30, BASS_Y + GAP * 3, { top: BASS_Y, filled: true, flag: false, color: 'var(--calm)' }) +
      note(NOTE_L + 90, BASS_Y + GAP * 2, { top: BASS_Y, filled: false, flag: false, color: 'var(--warmth)' }) +
      note(NOTE_L + 160, BASS_Y + GAP * 3.4, { top: BASS_Y, filled: true, flag: true, color: 'var(--brooding)' });

    return '<svg width="100%" viewBox="0 0 ' + W + ' ' + (bassH + 12) +
      '" style="display:block;overflow:visible">' +
      staffLines(TREBLE_Y) + staffLines(BASS_Y) + brace + systemBar +
      trebleClef(PAD_L, TREBLE_Y - 3) + bassClef(PAD_L + 2, BASS_Y + 1) +
      timeSig(TREBLE_Y) + timeSig(BASS_Y) +
      phrase() + bassNotes + finalBar +
      '</svg>';
  }

  function injectCss() {
    if (document.getElementById('comp-opus-css')) return;
    var st = document.createElement('style');
    st.id = 'comp-opus-css';
    st.textContent =
      '.opus-wrap{padding:6px 10px 14px}' +
      '.opus-head{display:flex;justify-content:space-between;align-items:flex-start;' +
        'font-family:var(--serif);font-style:italic;color:var(--mute);font-size:9.5px;opacity:.8;padding:0 8px}' +
      '.opus-title{text-align:center;margin:6px 0 12px}' +
      '.opus-title .t{font-family:var(--serif);font-style:italic;font-size:30px;line-height:1;color:var(--ink)}' +
      '.opus-title .o{margin-top:3px;font-family:var(--serif);font-style:italic;font-size:9px;' +
        'letter-spacing:.4em;color:var(--mute);opacity:.7}' +
      '.opus-mv{display:flex;align-items:center;gap:10px;justify-content:center;margin:2px 0 10px}' +
      '.opus-mv .ln{flex:1;max-width:64px;height:0;border-top:0.6px solid var(--accent);opacity:.6}' +
      '.opus-mv .lbl{font-family:var(--serif);font-style:italic;font-size:9.5px;letter-spacing:.12em;color:var(--accent)}' +
      '.opus-foot{text-align:center;margin-top:8px;font-family:var(--serif);font-style:italic;' +
        'font-size:8px;letter-spacing:.4em;color:var(--mute);opacity:.55}';
    document.head.appendChild(st);
  }

  root.Comp.opus = function (el) {
    injectCss();
    el.innerHTML =
      '<div class="opus-wrap">' +
        '<div class="opus-head"><span>various tempi</span>' +
          '<span style="text-align:right;line-height:1.4">kimi<br>' +
          '<span style="opacity:.7">(a demo score —)</span></span></div>' +
        '<div class="opus-title"><div class="t">opus</div><div class="o">O P U S &nbsp; I</div></div>' +
        '<div class="opus-mv"><span class="ln"></span>' +
          '<span class="lbl">I. Andante con moto</span><span class="ln"></span></div>' +
        svg() +
        '<div class="opus-foot">— I —</div>' +
      '</div>';
  };
})(window);
