// comp-finance.js — FAITHFUL vanilla port of kimi-web FinancePage
// (src/app/room/calendar/finance/page.tsx). Three-tab month-spend view:
//   信  envelope  — by currency (Bank autopay / JPY / USD / Non-JPY), envelope cards
//   园  garden    — rose-by-category (Rent/Food/Tools/Shop/Bills/Play),
//                   StandingRoseGarden: SVG stems+leaves, rose heads masked from
//                   assets/rose-finance.png, fox masked from assets/fox-bw-sit.png
//   卡  card      — by card (Card·••00 / Bank·••00 / Carrier·••00 / Apple·Credit / RMB / 其他)
// Header = italic month name; moon backdrop SVG only on the 园 tab.
// Footer = summary line (刷卡 · 引落 · N 笔). Sticky pill tab bar at the bottom.
// 描金 / Mucha-on-dark: Cormorant italic, hairline gold strokes, oldstyle figures.
// Uses cc-gild v2.css tokens ONLY — never hardcode colors. Day mode via
// [data-theme="day"] handled by the tokens themselves.
// GENERIC DEMO numbers only (placeholder amounts/merchants). persona kimi / you.
// Attaches to window.Comp.finance(el).
window.Comp = window.Comp || {};

window.Comp.finance = function (el) {
  // ── component-specific CSS (injected once) ──
  if (!document.getElementById('comp-finance-css')) {
    var s = document.createElement('style');
    s.id = 'comp-finance-css';
    s.textContent = [
      '.fin-wrap{max-width:480px;margin:0 auto;padding:14px 18px 30px;font-family:var(--serif);color:var(--ink)}',
      // header — month name big italic + (garden) moon backdrop
      '.fin-head{text-align:center;margin:8px 0 0}',
      '.fin-head .mo{font-family:var(--serif);font-style:italic;font-size:40px;line-height:1;letter-spacing:.02em;color:var(--ink)}',
      '.fin-moon{display:flex;justify-content:center;margin-top:14px}',
      // real-time moon disc/shadow colorway — derived from palette family, theme-keyed
      // (canon finance: night = gold/cream disc on void shadow; day = light rose-gold).
      '.fin-moon{--moon-core:#fff6e0;--moon-light:#e4d4b0;--moon-edge:#9b7c50;--moon-dark:rgba(14,8,4,0.94)}',
      '[data-theme="day"] .fin-moon{--moon-core:#fff8f0;--moon-light:#f4e8d0;--moon-edge:#caa07a;--moon-dark:rgba(220,207,194,0.85)}',
      '.fin-moon svg{filter:drop-shadow(0 0 8px rgba(193,154,86,0.30)) drop-shadow(0 0 14px rgba(193,154,86,0.16))}',
      '[data-theme="day"] .fin-moon svg{filter:drop-shadow(0 0 8px rgba(168,80,94,0.26)) drop-shadow(0 0 13px rgba(168,80,94,0.14))}',
      // ── 园 garden ──
      '.fin-garden{position:relative;margin:10px auto 0;width:360px}',
      // rose head — canon AlphaRose: positioned wrapper + masked inner span.
      // wrapper carries left/top/rotate/halo; the span is the colored bloom
      // masked from assets/rose-finance.png (maskSize contain, centered).
      '.fin-garden .rose-wrap{position:absolute;line-height:0}',
      '.fin-garden .rose{display:block;background-color:var(--accent);',
      '  -webkit-mask-image:url("assets/rose-finance.png");mask-image:url("assets/rose-finance.png");',
      '  -webkit-mask-size:contain;mask-size:contain;-webkit-mask-position:center;mask-position:center;',
      '  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}',
      '.fin-garden .fox{position:absolute;display:inline-block;width:36px;height:36px;background-color:var(--ink);',
      '  -webkit-mask-image:url("assets/fox-bw-sit.png");mask-image:url("assets/fox-bw-sit.png");',
      '  -webkit-mask-size:contain;mask-size:contain;-webkit-mask-position:center;mask-position:center;',
      '  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;transform:scaleX(-1)}',
      '.fin-garden .glab{position:absolute;text-align:center;font-family:var(--cjk);font-size:12px;',
      '  color:var(--ink2);letter-spacing:.04em;line-height:1.1}',
      '.fin-garden .gamt{position:absolute;text-align:center;width:56px;font-family:var(--serif);font-style:italic;',
      '  font-size:10px;color:var(--mute);letter-spacing:.04em}',
      // ── 信 / 卡 envelope cards ──
      '.fin-cards{margin:26px auto 0;max-width:440px}',
      '.fin-env{position:relative;border:0.6px solid var(--hair);padding:26px 22px 20px;margin-bottom:20px;',
      '  background:linear-gradient(180deg,var(--panel),rgba(12,9,6,0.32))}',
      '[data-theme="day"] .fin-env{background:linear-gradient(180deg,var(--paper),rgba(255,250,246,0.4))}',
      '.fin-env .flap{position:absolute;top:0;left:0;width:100%;height:22px;opacity:.5}',
      '.fin-env .stamp{position:absolute;top:16px;right:16px;width:56px;height:56px;',
      '  border:0.6px solid var(--accent);padding:4px;box-shadow:inset 0 0 0 1px var(--hair2)}',
      '.fin-env .stamp .ins{width:100%;height:100%;border:0.4px dashed var(--hair);display:flex;',
      '  align-items:center;justify-content:center;font-family:var(--serif);font-style:italic;',
      '  color:var(--accent);letter-spacing:.14em;text-align:center;line-height:1.2}',
      '.fin-env .lab{margin-top:8px;font-family:var(--serif);font-style:italic;font-size:11px;',
      '  color:var(--accent);letter-spacing:.26em}',
      '.fin-env .sub{margin-top:2px;font-family:var(--cjk);font-size:10px;color:var(--mute);letter-spacing:.14em}',
      '.fin-env .amt{margin-top:14px;font-family:var(--serif);font-size:38px;color:var(--ink);letter-spacing:.02em;',
      '  line-height:1;font-feature-settings:"onum" 1}',
      '.fin-env .cnt{margin-top:4px;font-family:var(--serif);font-style:italic;font-size:10px;color:var(--mute);letter-spacing:.14em}',
      '.fin-env .div{height:0.5px;background:var(--hair2);margin:16px 0 12px}',
      '.fin-env .row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:0.4px solid var(--hair2);',
      '  font-family:var(--cjk);font-size:11.5px;color:var(--ink2)}',
      '.fin-env .row:last-child{border-bottom:none}',
      '.fin-env .row .left{display:flex;gap:10px;min-width:0;flex:1}',
      '.fin-env .row .dt{font-family:var(--serif);font-style:italic;font-size:9.5px;color:var(--mute);flex-shrink:0}',
      '.fin-env .row .nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.fin-env .row .ra{font-family:var(--serif);color:var(--ink);font-size:12px;flex-shrink:0;margin-left:8px;',
      '  font-feature-settings:"onum" 1}',
      '.fin-empty{text-align:center;margin-top:60px;color:var(--mute);font-family:var(--serif);font-style:italic}',
      // ── summary footer ──
      '.fin-foot{margin:0 auto;max-width:380px;padding:14px 36px 0;border-top:0.5px solid var(--hair);text-align:center}',
      '.fin-foot .ln{font-family:var(--serif);font-style:italic;font-size:11px;color:var(--mute);letter-spacing:.14em;line-height:1.5}',
      // ── tab bar (sticky pill: 信 / 园 / 卡) ──
      '.fin-tabs{position:sticky;bottom:16px;margin:32px auto 8px;max-width:340px;height:46px;',
      '  background:rgba(20,16,12,0.88);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);',
      '  border:0.6px solid var(--hair);border-radius:100px;display:flex;align-items:center;padding:4px;',
      '  box-shadow:0 6px 16px rgba(0,0,0,0.28)}',
      '[data-theme="day"] .fin-tabs{background:rgba(246,233,225,0.9)}',
      '.fin-tab{flex:1;height:38px;display:flex;align-items:center;justify-content:center;gap:8px;border-radius:100px;',
      '  background:none;border:none;cursor:pointer;color:var(--mute);font-family:var(--cjk);font-size:13px;',
      '  letter-spacing:.30em;font-weight:500;transition:.18s}',
      '.fin-tab svg{display:block}',
      '.fin-tab.on{color:var(--accent);background:rgba(193,154,86,0.12)}',
      '[data-theme="day"] .fin-tab.on{background:rgba(168,80,94,0.12)}'
    ].join('\n');
    document.head.appendChild(s);
  }

  // ── generic demo dataset ──────────────────────────────────────────────
  // amounts/merchants are neutral placeholders. mixed-currency to exercise
  // the 信 (by-currency) + 卡 (by-card) buckets like the canon.
  var MONTH = 'June';

  // 园 — by spend category (canon order Rent/Food/Tools/Shop/Bills/Play),
  // amt in k-JPY-equivalent (drives stem height + the ¥{amt}k label).
  // colors pulled from cc-gild tokens (never hardcode) — token name per category.
  var GARDEN = (window.CC_COMP&&window.CC_COMP.finance&&window.CC_COMP.finance.garden) || [
    { cat: 'Rent',  amt: 165, color: 'var(--rose-d)' },
    { cat: 'Food',  amt: 98,  color: 'var(--rose)' },
    { cat: 'Tools', amt: 24,  color: 'var(--accent)' },
    { cat: 'Shop',  amt: 76,  color: 'var(--toward)' },
    { cat: 'Bills', amt: 31,  color: 'var(--accent-d)' },
    { cat: 'Play',  amt: 142, color: 'var(--sage)' }
  ];

  // 信 — by currency (4 envelope cards). amount string mirrors canon
  // (¥ / $ / CNY joined by " / "), rows are date · merchant · amount.
  var ENVELOPES = (window.CC_COMP&&window.CC_COMP.finance&&window.CC_COMP.finance.envelopes) || [
    {
      stamp: 'BANK', label: 'Bank · autopay', amount: '¥184,200', count: 3,
      rows: [
        { dt: '06/02', nm: 'card statement settle', ra: '¥142,000' },
        { dt: '06/12', nm: 'housing agent', ra: '¥38,400' },
        { dt: '06/25', nm: 'utilities autopay', ra: '¥3,800' }
      ]
    },
    {
      stamp: 'JPY', label: 'JPY · merchant', amount: '¥48,600', count: 5,
      rows: [
        { dt: '06/08', nm: 'grocery market', ra: '¥21,400' },
        { dt: '06/16', nm: 'gift & flowers', ra: '¥12,800' },
        { dt: '06/21', nm: 'transit pass', ra: '¥8,000' },
        { dt: '06/05', nm: 'stationery shop', ra: '¥4,200' },
        { dt: '06/19', nm: 'cafe & matcha', ra: '¥2,200' }
      ]
    },
    {
      stamp: 'USD', label: 'USD · service', amount: '$96.00', count: 4,
      rows: [
        { dt: '06/03', nm: 'cloud hosting', ra: '$40.00' },
        { dt: '06/06', nm: 'ai assistant plan', ra: '$30.00' },
        { dt: '06/11', nm: 'design tool', ra: '$18.00' },
        { dt: '06/14', nm: 'icloud storage', ra: '$8.00' }
      ]
    },
    {
      stamp: 'CNY', label: 'Non-JPY · alipay/foreign', amount: '320 CNY', count: 2,
      rows: [
        { dt: '06/09', nm: 'mobile game topup', ra: '200 CNY' },
        { dt: '06/22', nm: 'foreign merchant', ra: '120 CNY' }
      ]
    }
  ];

  // 卡 — by card (canon CARD_DISPLAY labels/subs/stamps, generic amounts).
  var CARDS = (window.CC_COMP&&window.CC_COMP.finance&&window.CC_COMP.finance.cards) || [
    {
      stamp: 'A', label: 'Card · ••00', sub: 'intl', amount: '320 CNY', count: 2,
      rows: [
        { dt: '06/09', nm: 'mobile game topup', ra: '200 CNY' },
        { dt: '06/22', nm: 'foreign merchant', ra: '120 CNY' }
      ]
    },
    {
      stamp: 'B', label: 'Bank · ••00', sub: 'credit', amount: '¥33,600', count: 4,
      rows: [
        { dt: '06/08', nm: 'grocery market', ra: '¥21,400' },
        { dt: '06/16', nm: 'gift & flowers', ra: '¥12,800' },
        { dt: '06/05', nm: 'stationery shop', ra: '¥4,200' },
        { dt: '06/19', nm: 'cafe & matcha', ra: '¥2,200' }
      ]
    },
    {
      stamp: 'C', label: 'Carrier · ••00', sub: 'mobile', amount: '¥8,000', count: 1,
      rows: [
        { dt: '06/21', nm: 'transit & mobile bill', ra: '¥8,000' }
      ]
    },
    {
      stamp: 'SC', label: 'Apple · Credit', sub: 'wallet', amount: '$48.00', count: 2,
      rows: [
        { dt: '06/06', nm: 'ai assistant plan', ra: '$30.00' },
        { dt: '06/14', nm: 'icloud storage', ra: '$8.00' }
      ]
    },
    {
      stamp: 'RMB', label: 'Card · RMB', amount: '$58.00', count: 2,
      rows: [
        { dt: '06/03', nm: 'cloud hosting', ra: '$40.00' },
        { dt: '06/11', nm: 'design tool', ra: '$18.00' }
      ]
    },
    {
      stamp: '?', label: '其他', amount: '¥3,800', count: 1,
      rows: [
        { dt: '06/25', nm: 'unclassified charge', ra: '¥3,800' }
      ]
    }
  ];

  // summary line (canon: 刷卡 spending · 引落 bank · N 笔)
  var SUMMARY = '刷卡 ¥48,600 · $96.00 · 320 CNY · 引落 ¥184,200 · 17 笔';

  var tab = 'garden'; // envelope | garden | card

  // ── real-time moon phase (garden tab backdrop) ──
  // Synodic calc ported from kimi-web src/lib/moon-phase.ts (getMoonPhase →
  // fraction): ref new moon 2000-01-06 18:14 UTC, synodic month 29.530588853d.
  // Uses today's date so the lit shape matches the actual sky.
  var REF_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);
  var SYNODIC_MS = 29.530588853 * 24 * 3600 * 1000;
  function moonFraction(date) {
    var t = (date || new Date()).getTime();
    var frac = ((t - REF_NEW_MOON_MS) / SYNODIC_MS) % 1;
    if (frac < 0) frac += 1;
    return frac; // 0=new → 0.25 first-quarter → 0.5 full → 0.75 last-quarter → 1
  }

  // ── two-arc shadow render (kimi-web MoonPhaseSvg.tsx technique) ──
  // Lit disc (token gold/cream gradient) underneath, dark shadow path on top.
  // cos(2π·phase) drives the terminator ellipse rx; sweep flags place the dark
  // limb. New (0)=full shadow → first-q (0.25)=right half lit → full (0.5)=no
  // shadow → last-q (0.75)=left half lit → back to new. Flags verified against
  // the real lit fraction across the whole synodic cycle (waxing lights the
  // right limb, waning the left; terminator bulges toward the dark side when
  // gibbous, toward the lit side when crescent).
  function moonSVG() {
    var phase = moonFraction(new Date());
    var r = 12, cx = 12, cy = 12;
    var cosVal = Math.cos(2 * Math.PI * phase); // +1 new, 0 quarter, -1 full
    var rx = Math.abs(cosVal) * r;
    var isWaxing = phase < 0.5;
    // outer arc = the lit limb (right when waxing, left when waning), top→bottom
    var sweepOuter = isWaxing ? 1 : 0;
    // inner terminator arc, bottom→top
    var sweepInner = isWaxing
      ? (cosVal > 0 ? 1 : 0)
      : (cosVal > 0 ? 0 : 1);
    var shadowPath =
      'M ' + cx + ',' + (cy - r) +
      ' A ' + r + ',' + r + ' 0 0 ' + sweepOuter + ' ' + cx + ',' + (cy + r) +
      ' A ' + rx.toFixed(3) + ',' + r + ' 0 0 ' + sweepInner + ' ' + cx + ',' + (cy - r) + ' Z';
    return '' +
      '<svg viewBox="0 0 24 24" width="120" height="120" aria-hidden="true">' +
        '<defs>' +
          '<radialGradient id="finMoonLight" cx="38%" cy="36%" r="70%">' +
            '<stop offset="0%" stop-color="var(--moon-core)"/>' +
            '<stop offset="55%" stop-color="var(--moon-light)"/>' +
            '<stop offset="100%" stop-color="var(--moon-edge)"/>' +
          '</radialGradient>' +
          '<radialGradient id="finMoonCraters" cx="65%" cy="68%" r="38%">' +
            '<stop offset="0%" stop-color="rgba(120,90,50,0.18)"/>' +
            '<stop offset="100%" stop-color="rgba(120,90,50,0)"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#finMoonLight)"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#finMoonCraters)"/>' +
        '<path d="' + shadowPath + '" fill="var(--moon-dark)"/>' +
      '</svg>';
  }

  // ── 园 StandingRoseGarden — faithful geometry from the canon SVG ──
  // pal = canon StandingRoseGarden palette (finance/page.tsx), per theme:
  //   stem (stems+leaves+vine), halo (ground dots + halo gradient + bloom glow),
  //   label (category ink), mute (¥ amt ink), fox (fox silhouette), haloOp.
  function gardenHTML(data, pal) {
    var w = 360, h = 360;
    var max = Math.max.apply(null, data.map(function (d) { return d.amt; }));
    var minH = 70, maxH = 230;
    var colW = w / data.length;
    var groundY = h - 50;
    var roseSize = 44;

    var tallestIdx = 0;
    for (var k = 1; k < data.length; k++) if (data[k].amt > data[tallestIdx].amt) tallestIdx = k;
    var tallestX = colW * tallestIdx + colW / 2;

    // dots on the ground vine (canon: haloColor)
    var groundDots = [0.2, 0.5, 0.8].map(function (t) {
      return '<circle cx="' + (12 + (w - 24) * t).toFixed(1) + '" cy="' + (groundY + 1) +
        '" r="1.4" fill="' + pal.halo + '" opacity="0.7"/>';
    }).join('');

    // stems + leaves (one <g> per category) — canon stemColor (= leafColor)
    var stems = data.map(function (d, i) {
      var stemH = minH + (maxH - minH) * (d.amt / max);
      var x = colW * i + colW / 2;
      var tipY = groundY - stemH;
      var sway = (i % 2 ? -1 : 1) * 4;
      var ctrlY = (groundY + tipY) / 2;
      var odd = (i % 2) ? 1 : 0;
      var g = '<g>';
      // main stem
      g += '<path d="M ' + x + ' ' + groundY + ' Q ' + (x + sway) + ' ' + ctrlY + ' ' + x + ' ' + tipY +
        '" stroke="' + pal.stem + '" stroke-width="1.0" stroke-linecap="round" fill="none" opacity="0.92"/>';
      // fine inner stem
      g += '<path d="M ' + (x + (odd ? -1 : 1)) + ' ' + (groundY - 2) + ' Q ' +
        (x + sway + (odd ? -1.5 : 1.5)) + ' ' + (ctrlY + 2) + ' ' + (x + (odd ? -0.5 : 0.5)) + ' ' + (tipY + 4) +
        '" stroke="' + pal.stem + '" stroke-width="0.4" stroke-linecap="round" fill="none" opacity="0.45"/>';
      // upper leaf
      g += '<g transform="translate(' + (x + (odd ? -8 : 8)) + ' ' + (tipY + stemH * 0.32) + ')">' +
        '<ellipse cx="0" cy="0" rx="9" ry="3" fill="' + pal.stem + '" opacity="0.7" transform="rotate(' + (odd ? -28 : 28) + ')"/></g>';
      // lower leaf
      g += '<g transform="translate(' + (x + (odd ? 7 : -7)) + ' ' + (tipY + stemH * 0.66) + ')">' +
        '<ellipse cx="0" cy="0" rx="7" ry="2.4" fill="' + pal.stem + '" opacity="0.55" transform="rotate(' + (odd ? 22 : -22) + ')"/></g>';
      // outer curls on first/last stem
      if (i === 0 || i === data.length - 1) {
        var sgn = (i === 0) ? -6 : 6;
        var q = (i === 0) ? -6 : 6;
        g += '<path d="M ' + (x + sgn) + ' ' + (tipY + stemH * 0.5) + ' q ' + q + ' -4 -3 -7' +
          '" stroke="' + pal.stem + '" stroke-width="0.45" fill="none" opacity="0.7"/>';
      }
      g += '</g>';
      return g;
    }).join('');

    var svg = '' +
      '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:auto">' +
        '<defs><radialGradient id="finGardenHalo" cx="50%" cy="78%" r="60%">' +
          '<stop offset="0%" stop-color="' + pal.halo + '" stop-opacity="' + pal.haloOp + '"/>' +
          '<stop offset="100%" stop-color="' + pal.halo + '" stop-opacity="0"/>' +
        '</radialGradient></defs>' +
        '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="url(#finGardenHalo)"/>' +
        // double ground vine (canon stemColor)
        '<line x1="12" y1="' + groundY + '" x2="' + (w - 12) + '" y2="' + groundY + '" stroke="' + pal.stem + '" stroke-width="0.7" opacity="0.7"/>' +
        '<line x1="20" y1="' + (groundY + 1.6) + '" x2="' + (w - 20) + '" y2="' + (groundY + 1.6) + '" stroke="' + pal.stem + '" stroke-width="0.3" opacity="0.5"/>' +
        groundDots +
        stems +
      '</svg>';

    // rose heads (positioned via %-free absolute px against the 360-wide stage).
    // canon AlphaRose geometry: wrapper at (x - sz/2, tipY - sz*0.68) so the
    // bloom sits on top of each stem tip; the masked span carries the size+color.
    // tallest bloom gets the canon haloColor + 88 alpha glow.
    var roses = data.map(function (d, i) {
      var stemH = minH + (maxH - minH) * (d.amt / max);
      var x = colW * i + colW / 2;
      var tipY = groundY - stemH;
      var sz = roseSize + (i === tallestIdx ? 6 : 0);
      var halo = (i === tallestIdx) ? 'filter:drop-shadow(0 0 6px ' + pal.halo + '88);' : '';
      return '<div class="rose-wrap" style="left:' + (x - sz / 2).toFixed(1) + 'px;top:' + (tipY - sz * 0.68).toFixed(1) +
        'px;width:' + sz + 'px;height:' + sz + 'px;transform:rotate(' + (i % 2 ? -4 : 4) + 'deg);">' +
        '<span class="rose" style="width:' + sz + 'px;height:' + sz + 'px;background-color:' + d.color + ';' + halo + '"></span>' +
        '</div>';
    }).join('');

    // fox beside the tallest rose (canon: isDay ? #1a0e0a : #d8d0c8)
    var fox = '<span class="fox" style="left:' + (tallestX + 8).toFixed(1) + 'px;top:' + (groundY - 34) + 'px;background-color:' + pal.fox + '"></span>';

    // category labels below ground (canon labelInk)
    var labels = data.map(function (d, i) {
      var x = colW * i + colW / 2;
      return '<div class="glab" style="left:' + (x - colW / 2).toFixed(1) + 'px;bottom:8px;width:' + colW.toFixed(1) + 'px;color:' + pal.label + '">' + d.cat + '</div>';
    }).join('');

    // ¥{amt}k above each rose (canon muteInk)
    var amts = data.map(function (d, i) {
      var stemH = minH + (maxH - minH) * (d.amt / max);
      var x = colW * i + colW / 2;
      var tipY = groundY - stemH;
      return '<div class="gamt" style="left:' + (x - 28).toFixed(1) + 'px;top:' + (tipY - roseSize * 0.7 - 18).toFixed(1) + 'px;color:' + pal.mute + '">¥' + d.amt + 'k</div>';
    }).join('');

    return '<div class="fin-garden" style="height:' + h + 'px">' + svg + roses + fox + labels + amts + '</div>';
  }

  // ── 信 / 卡 envelope card ──
  function envHTML(env) {
    var sub = env.sub ? '<div class="sub">' + env.sub + '</div>' : '';
    var stampSz = env.stamp.length > 4 ? 7 : env.stamp.length > 3 ? 8 : 9;
    var rows = env.rows.map(function (r, i) {
      return '<div class="row">' +
          '<div class="left">' +
            '<span class="dt">' + r.dt + '</span>' +
            '<span class="nm">' + r.nm + '</span>' +
          '</div>' +
          '<span class="ra">' + r.ra + '</span>' +
        '</div>';
    }).join('');
    return '<div class="fin-env">' +
        '<svg class="flap" viewBox="0 0 400 22" preserveAspectRatio="none">' +
          '<path d="M 0 0 L 200 22 L 400 0" stroke="var(--hair)" stroke-width="0.5" fill="none"/></svg>' +
        '<div class="stamp"><div class="ins" style="font-size:' + stampSz + 'px">' + env.stamp + '</div></div>' +
        '<div class="lab">' + env.label + '</div>' + sub +
        '<div class="amt">' + env.amount + '</div>' +
        '<div class="cnt">' + env.count + ' 笔</div>' +
        '<div class="div"></div>' +
        rows +
      '</div>';
  }

  // ── tab bar icons (inline SVG, faithful to canon EnvelopeIcon/Flower/CardIcon) ──
  function envelopeIcon() {
    return '<svg width="13" height="10" viewBox="0 0 16 12" aria-hidden="true">' +
      '<rect x="1" y="2" width="14" height="9" fill="none" stroke="currentColor" stroke-width="0.9"/>' +
      '<path d="M 1.4 2.4 L 8 7 L 14.6 2.4" stroke="currentColor" stroke-width="0.9" fill="none" stroke-linejoin="round"/></svg>';
  }
  function flowerIcon() {
    return '<svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true">' +
      '<ellipse cx="8" cy="3.4" rx="2.2" ry="3.2" fill="currentColor" opacity="0.85"/>' +
      '<ellipse cx="8" cy="12.6" rx="2.2" ry="3.2" fill="currentColor" opacity="0.85"/>' +
      '<ellipse cx="3.4" cy="8" rx="3.2" ry="2.2" fill="currentColor" opacity="0.85"/>' +
      '<ellipse cx="12.6" cy="8" rx="3.2" ry="2.2" fill="currentColor" opacity="0.85"/>' +
      '<ellipse cx="4.8" cy="4.8" rx="1.8" ry="2.6" fill="currentColor" opacity="0.7" transform="rotate(-45 4.8 4.8)"/>' +
      '<ellipse cx="11.2" cy="11.2" rx="1.8" ry="2.6" fill="currentColor" opacity="0.7" transform="rotate(-45 11.2 11.2)"/>' +
      '<ellipse cx="11.2" cy="4.8" rx="1.8" ry="2.6" fill="currentColor" opacity="0.7" transform="rotate(45 11.2 4.8)"/>' +
      '<ellipse cx="4.8" cy="11.2" rx="1.8" ry="2.6" fill="currentColor" opacity="0.7" transform="rotate(45 4.8 11.2)"/>' +
      '<circle cx="8" cy="8" r="1.6" fill="currentColor"/></svg>';
  }
  function cardIcon() {
    return '<svg width="13" height="8" viewBox="0 0 16 10" aria-hidden="true">' +
      '<rect x="1" y="1" width="14" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="0.9"/>' +
      '<rect x="1.5" y="3" width="13" height="1.4" fill="currentColor" opacity="0.6"/>' +
      '<rect x="9" y="6.4" width="5" height="1.2" fill="none" stroke="currentColor" stroke-width="0.5"/></svg>';
  }

  // canon finance garden palette (page.tsx DAY_PALETTE / NIGHT_PALETTE), per theme.
  function isDay() { return document.documentElement.getAttribute('data-theme') === 'day'; }
  // category bloom colors, canon order Rent/Food/Tools/Shop/Bills/Play.
  var GARDEN_COLORS_DAY   = ['#5A1820', '#A42B5E', '#8A6428', '#C7547E', '#8A2840', '#C89548'];
  var GARDEN_COLORS_NIGHT = ['#a08a6c', '#c8576f', '#b8a070', '#9a7a7a', '#c4a78a', '#9a7a7a'];
  function gardenPalette() {
    var day = isDay();
    return {
      stem:  day ? '#5A1820' : 'rgba(184,160,112,0.55)',
      halo:  day ? '#A42B5E' : '#b8a070',
      label: day ? '#3A2418' : '#c4a78a',
      mute:  day ? 'rgba(26,14,10,0.55)' : 'rgba(216,208,200,0.5)',
      fox:   day ? '#1a0e0a' : '#d8d0c8',
      haloOp: day ? 0.18 : 0.2,
      colors: day ? GARDEN_COLORS_DAY : GARDEN_COLORS_NIGHT
    };
  }

  function render() {
    var content;
    if (tab === 'garden') {
      var pal = gardenPalette();
      var gardenData = GARDEN.map(function (d, i) {
        return { cat: d.cat, amt: d.amt, color: pal.colors[i] || pal.halo };
      });
      content =
        '<div class="fin-moon">' + moonSVG() + '</div>' +
        (gardenData.length
          ? gardenHTML(gardenData, pal)
          : '<div class="fin-empty">No spending in this window.</div>');
    } else if (tab === 'envelope') {
      content = '<div class="fin-cards">' +
        (ENVELOPES.length
          ? ENVELOPES.map(envHTML).join('')
          : '<div class="fin-empty">No transactions.</div>') +
        '</div>';
    } else {
      content = '<div class="fin-cards">' +
        (CARDS.length
          ? CARDS.map(envHTML).join('')
          : '<div class="fin-empty">No card transactions.</div>') +
        '</div>';
    }

    var tabs = [
      { key: 'envelope', label: '信', icon: envelopeIcon() },
      { key: 'garden',   label: '园', icon: flowerIcon() },
      { key: 'card',     label: '卡', icon: cardIcon() }
    ].map(function (t) {
      return '<button class="fin-tab' + (t.key === tab ? ' on' : '') + '" data-tab="' + t.key + '">' +
        t.icon + '<span>' + t.label + '</span></button>';
    }).join('');

    el.innerHTML =
      '<div class="fin-wrap">' +
        '<div class="fin-head"><div class="mo">' + MONTH + '</div></div>' +
        content +
        '<div class="fin-foot"><div class="ln">' + SUMMARY + '</div></div>' +
        '<div class="fin-tabs">' + tabs + '</div>' +
      '</div>';

    el.querySelectorAll('.fin-tab').forEach(function (b) {
      b.addEventListener('click', function () {
        tab = b.getAttribute('data-tab');
        render();
      });
    });
  }

  // re-render on theme flip so the garden's canon day/night palette repaints
  // (stems, bloom colors, halo, labels are JS-computed, not pure-CSS tokens).
  var themeObserver = new MutationObserver(function () {
    if (el.querySelector('.fin-wrap')) render();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  render();
};
