/* comp-calendar.js — a standalone vanilla month-calendar component.
   Mucha 描金 / Art Nouveau, dark ground + day mode.

   Feature set:
     · 7-col monday-first month grid, prev/next nav, oldstyle day numbers
     · faint moon-phase wash on cells (radial gold) — decorative, kept from v1
     · STRUCTURED EVENTS per day (title + time + type), like DayData.event
       — not a bare text line. A day can hold several; cell shows first + "+N".
     · MED DOSE — the ROSE DOSE control. A day's med is a dose level on the
       7-stage cycle (0 → 0.5 → 1 → 1.5 → 2 → 2.5 → 3), drawn with the
       rose icons (assets/rose-cal-a/b/c.png) masked + recolored by token: stage
       0 = bud outline, then a-style (1-2), b-style stem (3-4), c-style double
       bloom (5-6); odd half-stages render a half-filled (clip) rose. Tap the rose
       in the editor — or the day's med rose in the cell — to cycle the dose.
       NIGHT = gold/rose tint (var(--rose)); DAY = GREEN rose (var(--sage)) via the
       same CSS mask, so the day-mode dose rose reads green, not washed pink.
       GENERIC: a demo "dose" control, NO real medication names.
     · FOX-WRITTEN events — agent "kimi" mirrored google-calendar events, rendered
       with the fox icon assets/fox-bw-sit.png (night-mode invert).
       Read-only in the editor under a "kimi wrote · calendar" header.
     · localStorage persistence (demo key) + a live agenda rail.

   DAY-MODE FIX: every stroke / border / hairline uses var(--cal-hair) / var(--cal-hair),
   never black, never a hardcoded rgba — so the grid goes rose-hairline in day,
   gold-hairline in night, never black.

   GENERIC DEMO content only (persona: kimi = agent, you = user). No real names.
   Reuses cc-gild v2.css :root tokens — never hardcodes palette colors.
   Attaches to window.Comp.calendar. Vanilla — no framework, no build. */
(function (root) {
  root.Comp = root.Comp || {};

  var LS_KEY = "ccgild:cal:demo:v3";       // persisted user-added day data (v3: dose stage)
  var FOX_SRC = "assets/fox-bw-sit.png";   // fox icon
  // rose dose glyphs are pulled in via the
  // .rm-a/.rm-b/.rm-c CSS mask classes (per-stage), not JS constants.
  var WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
  var EN_MONTH = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  var CN_MONTH = ["一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"];

  // event types — generic, parallels 事件 / 用药. Each carries a token-driven
  // marker so colors stay theme-aware (no hardcoded hex).
  var EVENT_TYPES = [
    { key: "event", label: "事件 · event" },
    { key: "note", label: "备忘 · note" }
  ];

  // ---- date helpers (monday-first grid, like the source) -------------------
  function ymd(y, m, d) {
    return y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  }
  function monthPrefix(y, m) { return y + "-" + String(m + 1).padStart(2, "0"); }
  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
  function mondayOffset(y, m) {
    var jsDow = new Date(y, m, 1).getDay();   // 0=Sun..6=Sat
    return (jsDow + 6) % 7;                    // Mon=0..Sun=6
  }
  // moon phase as a 0..1 illumination-ish weight from a known new moon.
  // Used purely as a faint shading wash — not astronomy-grade.
  var SYNODIC = 29.53058867;
  var REF_NEW = Date.UTC(2026, 0, 18, 19, 52) / 86400000; // 2026-01-18 new moon (days)
  function moonWeight(y, m, d) {
    var age = (Date.UTC(y, m, d) / 86400000 - REF_NEW) % SYNODIC;
    if (age < 0) age += SYNODIC;
    var phase = age / SYNODIC;                       // 0=new .. .5=full .. 1=new
    var illum = (1 - Math.cos(phase * 2 * Math.PI)) / 2; // 0 new → 1 full
    return illum;                                    // 0..1
  }

  // theme detection — read <html data-theme>; default night. Used to invert the
  // black fox PNG in night mode (matches: filter invert(1) on night bg).
  function isNight() {
    var t = document.documentElement.getAttribute("data-theme");
    return t !== "day";
  }

  // ---- dose model ---------------------------------
  // 7-stage cycle: stage 0..6 → dose 0 / 0.5 / 1 / 1.5 / 2 / 2.5 / 3.
  // tap cycles 0→1→2→…→6→0. Glyph: stage 0 = bud outline; else a/b/c PNG masked,
  // odd stage = half-filled (clipped) bloom. NO real med name — pure "dose" demo.
  var MAX_STAGE = 6;
  var STAGE_TO_DOSE = [0, 0.5, 1, 1.5, 2, 2.5, 3];
  function doseLabel(stage) {
    var d = STAGE_TO_DOSE[stage] || 0;
    return d === 0 ? "" : String(d);
  }
  // ---- demo data: events the agent "kimi" wrote ⇒ fox marker ---------------
  // keyed YYYY-MM-DD. Generic, no real persona narrative. Mirrors a generic per-day event type
  // shape { time, title, location? } so the editor can render it faithfully.
  function kimiEventsFor(y, m) {
    var mk = function (d, time, title, loc) {
      return { date: ymd(y, m, d), time: time, title: title, location: loc || null };
    };
    return [
      mk(4, "10:00", "weekly digest", "inbox"),
      mk(11, "—", "memory review"),
      mk(18, "18:30", "archive snapshot"),
      mk(18, "21:00", "evening recap"),
      mk(26, "09:15", "inbox sweep")
    ];
  }
  // group fox events by date (a day may hold several, like the source)
  function kimiByDateFor(y, m) {
    var map = {};
    kimiEventsFor(y, m).forEach(function (e) {
      (map[e.date] = map[e.date] || []).push(e);
    });
    return map;
  }

  // ---- localStorage store (user-added day data) ----------------------------
  // shape: { days: { "YYYY-MM-DD": { events:[{title,time,type}], dose:<stage 0..6> } } }
  function clampStage(s) {
    s = parseInt(s, 10);
    if (!isFinite(s) || s < 0) return 0;
    return s > MAX_STAGE ? MAX_STAGE : s;
  }
  function loadStore() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return { days: {} };
      var o = JSON.parse(raw);
      return { days: o.days || {} };
    } catch (e) { return { days: {} }; }
  }
  function saveStore(store) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(store)); } catch (e) {}
  }
  function getDay(store, date) {
    var d = store.days[date];
    return { events: (d && d.events) || [], dose: clampStage(d && d.dose) };
  }
  function setDay(store, date, day) {
    var hasEvents = day.events && day.events.length;
    var dose = clampStage(day.dose);
    if (!hasEvents && dose === 0) { delete store.days[date]; return; }
    store.days[date] = {
      events: (day.events || []).filter(function (e) { return e && e.title; }),
      dose: dose
    };
  }

  // ---- inline ornaments (hairline gold SVG) --------------------------------
  function vine() {
    return '<svg viewBox="0 0 200 16" width="180" height="14" aria-hidden="true">' +
      '<path d="M2 8 Q60 1 100 8 Q140 15 198 8" fill="none" stroke="var(--cal-gold)" stroke-width="0.7"/>' +
      '<ellipse cx="100" cy="8" rx="2.2" ry="1.1" fill="var(--cal-gold)"/>' +
      '<circle cx="40" cy="5.5" r="0.9" fill="var(--cal-gold)"/>' +
      '<circle cx="160" cy="10.5" r="0.9" fill="var(--cal-gold)"/></svg>';
  }
  // gold double-segment with center diamond stake (the "EventLine")
  function eventLine() {
    return '<svg class="cc-cal__line" viewBox="0 0 100 6" preserveAspectRatio="none" aria-hidden="true">' +
      '<line x1="0" y1="3" x2="44" y2="3" stroke="var(--cal-gold)" stroke-width="0.7" opacity="0.85"/>' +
      '<line x1="56" y1="3" x2="100" y2="3" stroke="var(--cal-gold)" stroke-width="0.7" opacity="0.85"/>' +
      '<path d="M50 0 L53 3 L50 6 L47 3 Z" fill="var(--cal-gold)"/></svg>';
  }
  // small top-right vine sprig ("VineSprig")
  function sprig() {
    return '<svg class="cc-cal__sprig" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">' +
      '<path d="M2 14 Q4 10 7 9 Q11 8 13 4" fill="none" stroke="var(--cal-gold)" stroke-width="0.5" stroke-linecap="round"/>' +
      '<ellipse cx="6" cy="9" rx="1.4" ry="0.7" transform="rotate(-30 6 9)" fill="var(--cal-gold)"/>' +
      '<ellipse cx="10" cy="6" rx="1.4" ry="0.7" transform="rotate(-30 10 6)" fill="var(--cal-gold)"/>' +
      '<circle cx="13" cy="4" r="0.6" fill="var(--cal-gold)"/></svg>';
  }
  // the ROSE DOSE glyph. stage 0 = hairline bud outline (no dose); stage 1-6
  // = the rose-cal PNG (a/b/c by stage) masked + recolored by token (rose in
  // night, sage/green in day via the .cc-cal__rose CSS). Odd stages render a
  // half-filled bloom: a 30%-opacity ghost behind + a left-half clipped full layer.
  // `size` px (default 12). Full-bloom full-dose (stage 6) gets a soft halo.
  function roseDose(stage, size) {
    stage = clampStage(stage);
    size = size || 12;
    var box = '<span class="cc-cal__rose" aria-hidden="true" style="width:' + size +
      'px;height:' + size + 'px">';
    if (stage === 0) {
      // bud outline — hairline, no fill (matches the stage-0 SVG)
      return box +
        '<svg width="' + size + '" height="' + size + '" viewBox="0 0 18 18">' +
        '<path d="M9 3 Q12 4 12 7 Q12 9 11 10.5 Q12 11 12 12.5 Q11 14 9 14 Q7 14 6 12.5 Q6 11 7 10.5 Q6 9 6 7 Q6 4 9 3 Z" ' +
        'fill="none" stroke="var(--cal-hair)" stroke-width="0.9"/></svg></span>';
    }
    // RoseStageIcon mapping: stage>=5 → c (double), >=3 → b (stem), else a.
    var rmCls = stage >= 5 ? "rm-c" : stage >= 3 ? "rm-b" : "rm-a";
    var half = (stage % 2) === 1;            // 1/3/5 → half dose
    var halo = stage === MAX_STAGE ? '<span class="rh"></span>' : "";
    var ghost = half ? '<span class="rm ' + rmCls + ' ghost"></span>' : "";
    var front = '<span class="rm ' + rmCls + (half ? " half" : "") + '"></span>';
    return box + halo + ghost + front + '</span>';
  }
  // legend / agenda still want a fixed-dose sample rose — show a full single bloom
  function roseSample() { return roseDose(2, 11); }
  // fox icon — assets/fox-bw-sit.png. night bg is dark → invert the black
  // silhouette to white (mirrors the night filter: invert(1) on night).
  function foxImg(size) {
    size = size || 15;
    var inv = isNight() ? ' style="filter:invert(1)"' : '';
    return '<img class="cc-cal__fox" src="' + FOX_SRC + '" alt="kimi wrote" ' +
      'width="' + size + '" height="' + size + '"' + inv + '>';
  }
  // small diamond used in agenda + legend for user events (legend stake)
  function diamondMini() {
    return '<svg viewBox="0 0 8 8" width="7" height="7" aria-hidden="true">' +
      '<path d="M4 0 L8 4 L4 8 L0 4 Z" fill="var(--cal-gold)"/></svg>';
  }

  function injectCss() {
    if (document.getElementById("comp-calendar-css")) return;
    var s = document.createElement("style");
    s.id = "comp-calendar-css";
    // EVERY border / hairline below is a token (--hair / --hair2) — never black,
    // never a literal rgba — so day mode renders rose-hairline, not black lines.
    s.textContent = [
      // transparent ground — the calendar shows the cc-gild panel through it
      // (day = white-pink, night = dark), NOT an opaque paper card. The
      // ink + sage gridlines still apply on top.
      ".cc-cal{padding:10px 8px 8px;background:transparent;color:var(--cal-ink);font-family:var(--serif)}",
      // ── CalPalette-driven vars. The calendar
      //    has its OWN palette — NOT the cc-gild global gold/rose tokens. night =
      //    NIGHT_PALETTE, day = DAY_PALETTE. Everything calendar-specific (event
      //    line, today, dose rose + dose text, hairlines, weekend, note) reads
      //    these, so day/night match kimi-room exactly.
      ".cc-cal{--cal-page:#080605;--cal-paper:#0e0c0a;--cal-paperhi:#181410;--cal-ink:#ece2cc;--cal-inksoft:rgba(236,226,204,.72);--cal-inkmute:rgba(236,226,204,.4);--cal-gold:#d4af6c;--cal-med:#c8576f;--cal-medtext:#d4af6c;--cal-halo:rgba(200,87,111,.4);--cal-line:#8aa872;--cal-flowmed:#a04d42;--cal-hair:rgba(138,168,114,.3);--cal-cellline:rgba(138,168,114,.11);--cal-today:#d4af6c;--cal-weekend:rgba(200,120,120,.06);--cal-note:#9eb5d2}",
      "[data-theme='day'] .cc-cal{--cal-page:#ebdfd4;--cal-paper:#dccfc2;--cal-paperhi:#e3d3c5;--cal-ink:#1a0e0a;--cal-inksoft:rgba(26,14,10,.7);--cal-inkmute:rgba(26,14,10,.5);--cal-gold:#c89548;--cal-med:#7a8a6a;--cal-medtext:#7a8a6a;--cal-halo:rgba(122,138,106,.32);--cal-line:#7a8a6a;--cal-flowmed:#A42B5E;--cal-hair:rgba(122,138,106,.34);--cal-cellline:rgba(122,138,106,.13);--cal-today:#c89548;--cal-weekend:rgba(168,48,64,.05);--cal-note:#9a7888}",
      ".cc-cal__head{text-align:center;margin-bottom:12px}",
      ".cc-cal__vine{color:var(--cal-gold);opacity:.8;line-height:0}",
      ".cc-cal__yr{font-size:11px;letter-spacing:.5em;color:var(--cal-inkmute);margin-top:6px}",
      ".cc-cal__mo{display:flex;align-items:center;justify-content:center;gap:22px;margin-top:2px}",
      ".cc-cal__mo .m{font-family:var(--serif);font-style:italic;font-size:42px;line-height:1;color:var(--cal-ink)}",
      ".cc-cal__nav{background:none;border:none;color:var(--cal-inkmute);font-size:20px;cursor:pointer;font-family:var(--serif);padding:4px 10px;line-height:1}",
      ".cc-cal__nav:hover{color:var(--cal-gold)}",
      ".cc-cal__cn{font-family:var(--cjk);font-size:13px;color:var(--cal-inkmute);letter-spacing:.18em;margin-top:4px}",
      ".cc-cal__body{display:grid;grid-template-columns:1fr 230px;gap:24px;align-items:start}",
      // weekday header — hairline borders are tokens (rose in day, gold in night)
      ".cc-cal__dow{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;font-family:var(--serif);font-style:italic;font-size:11px;letter-spacing:.2em;color:var(--cal-inkmute);padding:8px 0;border-top:0.6px solid var(--cal-hair);border-bottom:0.6px solid var(--cal-hair)}",
      ".cc-cal__dow .we{color:var(--cal-flowmed)}",
      ".cc-cal__grid{display:grid;grid-template-columns:repeat(7,1fr)}",
      // cell grid lines — var(--cal-hair) so NEVER black in day mode
      // cell gridlines: a consistent 1px (whole device-pixel → renders the SAME on
      // every cell; 0.4px was rounding to 0 on some, 1 on others → uneven) at a
      // very low alpha so the grid reads 接近于无 / modern, not boxy. Today keeps
      // its gold border-left below.
      // day cells are <button>s, pad cells are <div>s. The dark grid lines were the
      // BUTTON UA default border (top/left outset) — my sage rule only set
      // right/bottom, so buttons kept dark UA top/left while the <div> pads stayed
      // clean (that's why day cells != trailing empty cells). appearance:none +
      // border:0 kills the native button frame; then re-add the faint sage
      // right/bottom only, so every cell matches the near-invisible pad look.
      ".cc-cal__cell{position:relative;min-height:96px;-webkit-appearance:none;appearance:none;border:0;border-right:1px solid var(--cal-cellline);border-bottom:1px solid var(--cal-cellline);padding:7px 8px;overflow:hidden;text-align:left;background:transparent;font-family:inherit;color:var(--cal-ink);cursor:pointer;transition:background .2s}",
      ".cc-cal__cell:nth-child(7n){border-right:none}",
      ".cc-cal__cell:hover:not(.pad){background:var(--cal-weekend)}",
      ".cc-cal__cell.pad{cursor:default;background:transparent}",
      ".cc-cal__cell.we{background:var(--cal-weekend)}",
      // today marker — todayBorder gold + paperHi-ish highlight
      ".cc-cal__cell.today{border-left:2px solid var(--cal-today);background:rgba(193,154,86,.10)}",
      ".cc-cal__rowtop{display:flex;align-items:baseline;justify-content:space-between;gap:6px}",
      ".cc-cal__dn{font-family:var(--serif);font-size:20px;color:var(--cal-inksoft);font-feature-settings:'onum' 1;font-variant-numeric:oldstyle-nums;line-height:1}",
      ".cc-cal__cell.today .cc-cal__dn{color:var(--cal-gold);font-style:italic}",
      ".cc-cal__tag{font-family:var(--serif);font-style:italic;font-size:8px;letter-spacing:.15em;text-transform:uppercase;color:var(--cal-gold)}",
      ".cc-cal__sprig{opacity:.5;flex:0 0 auto}",
      // moon-phase wash — gold radial in night (full), shrunk+softened in day so
      // the light-mode grid reads clean (no big blurry washes over the cells).
      ".cc-cal__moon{position:absolute;top:7px;right:26px;width:30px;height:30px;border-radius:50%;pointer-events:none;" +
        "background:radial-gradient(circle at 38% 32%,rgba(193,154,86,var(--mw,.2)),transparent 70%)}",
      "[data-theme='day'] .cc-cal__moon{top:9px;right:24px;width:18px;height:18px;" +
        "background:radial-gradient(circle at 40% 34%,rgba(168,80,94,calc(var(--mw,.2) * 0.5)),transparent 62%)}",
      ".cc-cal__line{width:100%;height:6px;display:block;margin-top:3px}",
      // user structured event line (event row)
      ".cc-cal__evt{font-size:10px;color:var(--cal-inksoft);font-style:italic;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".cc-cal__evt .t{color:var(--cal-gold);font-style:italic;margin-right:4px}",
      ".cc-cal__evt .more{color:var(--cal-inkmute);font-style:normal;margin-left:3px}",
      // fox row (kimi-written) — image marker + time + title (DayCell agent row)
      ".cc-cal__foxrow{display:flex;align-items:center;gap:4px;margin-top:4px;font-size:10px;color:var(--cal-inkmute);font-style:italic}",
      ".cc-cal__foxrow span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".cc-cal__fox{object-fit:contain;flex:0 0 auto}",
      // dose row in a cell — rose in night, green in day (match the glyph tint)
      ".cc-cal__medrow{display:flex;align-items:center;gap:4px;margin-top:4px;font-size:10px;color:var(--cal-medtext);font-style:italic;font-variant-numeric:tabular-nums}",
      ".cc-cal__medrow span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      // ROSE DOSE glyph — masked PNG recolored by token. NIGHT = rose tint,
      // DAY = green (var(--sage)) so the day-mode dose rose reads green, not washed.
      ".cc-cal__rose{position:relative;display:inline-flex;align-items:center;justify-content:center;width:12px;height:12px;flex:0 0 auto;vertical-align:-2px}",
      ".cc-cal__rose svg{position:relative;display:block}",
      // masked rose fill layer — color = p.med (var(--cal-med)). The mask
      // PNG is carried by per-stage .rm-a/.rm-b/.rm-c classes, NOT a CSS var,
      // because WebKit/Safari does not resolve var() inside mask-image (that was
      // why the dose rose showed up blank on Mac).
      ".cc-cal__rose .rm{position:absolute;inset:0;background-color:var(--cal-med);" +
        "-webkit-mask-size:contain;mask-size:contain;-webkit-mask-position:center;mask-position:center;" +
        "-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}",
      ".cc-cal__rose .rm-a{-webkit-mask-image:url('assets/rose-cal-a.png');mask-image:url('assets/rose-cal-a.png')}",
      ".cc-cal__rose .rm-b{-webkit-mask-image:url('assets/rose-cal-b.png');mask-image:url('assets/rose-cal-b.png')}",
      ".cc-cal__rose .rm-c{-webkit-mask-image:url('assets/rose-cal-c.png');mask-image:url('assets/rose-cal-c.png')}",
      // half dose: ghost back layer + left-half-clipped full layer
      ".cc-cal__rose .rm.ghost{opacity:.32}",
      ".cc-cal__rose .rm.half{clip-path:inset(0 50% 0 0)}",
      // halo on full bloom (stage 6) — medHalo
      ".cc-cal__rose .rh{position:absolute;inset:-2px;border-radius:50%;background:radial-gradient(circle,var(--cal-halo) 0%,transparent 80%)}",
      // editor popover, anchored under the clicked cell
      ".cc-cal__pop{position:absolute;z-index:40;width:248px;background:var(--cal-paper);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);border:0.6px solid var(--cal-hair);border-radius:8px;padding:13px 13px 12px;box-shadow:0 12px 34px rgba(0,0,0,.5);font-family:var(--serif)}",
      "[data-theme='day'] .cc-cal__pop{box-shadow:0 12px 30px rgba(74,44,44,.18)}",
      ".cc-cal__pop .ph{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:9px}",
      ".cc-cal__pop .pd{font-style:italic;letter-spacing:.12em;font-size:13px;color:var(--cal-gold)}",
      ".cc-cal__pop .px{background:none;border:none;color:var(--cal-inkmute);font-size:16px;line-height:1;cursor:pointer;font-family:var(--serif)}",
      ".cc-cal__pop label{display:block;font-size:8.5px;letter-spacing:.3em;text-transform:uppercase;color:var(--cal-inkmute);margin:9px 0 5px}",
      ".cc-cal__pop label:first-of-type{margin-top:0}",
      // "kimi wrote" read-only block
      ".cc-cal__kimi{margin-bottom:11px;padding:9px 10px;background:var(--ghost);border:0.6px solid var(--cal-hair);border-radius:6px}",
      ".cc-cal__kimi-h{font-family:var(--serif);font-style:italic;font-size:9px;letter-spacing:.2em;color:var(--cal-gold);margin-bottom:6px}",
      ".cc-cal__kimi-row{display:flex;align-items:flex-start;gap:7px;font-size:11px;color:var(--cal-inksoft);line-height:1.45;margin-bottom:4px}",
      ".cc-cal__kimi-row:last-child{margin-bottom:0}",
      ".cc-cal__kimi-row .kt{font-style:italic;color:var(--cal-gold);margin-right:5px}",
      ".cc-cal__kimi-row .kl{font-size:9.5px;color:var(--cal-inkmute);font-style:italic;margin-left:5px}",
      // structured-event editor rows
      ".cc-cal__evlist{display:flex;flex-direction:column;gap:5px;margin-bottom:6px}",
      ".cc-cal__evrow{display:flex;align-items:center;gap:5px}",
      ".cc-cal__evrow .ico{flex:0 0 auto;line-height:0}",
      ".cc-cal__evrow .meta{flex:1;min-width:0;font-size:11px;color:var(--cal-inksoft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".cc-cal__evrow .meta .t{color:var(--cal-gold);font-style:italic;margin-right:5px}",
      ".cc-cal__evrow .del{background:none;border:none;color:var(--cal-inkmute);cursor:pointer;font-size:13px;line-height:1;padding:0 2px;flex:0 0 auto;font-family:var(--serif)}",
      ".cc-cal__evrow .del:hover{color:var(--rose)}",
      ".cc-cal__addgrid{display:grid;grid-template-columns:52px 1fr;gap:6px}",
      ".cc-cal__pop input,.cc-cal__pop select{width:100%;font-size:12px;padding:6px 8px;border:0.6px solid var(--cal-hair);background:transparent;color:var(--cal-ink);border-radius:4px;font-family:inherit;outline:none}",
      ".cc-cal__pop input:focus,.cc-cal__pop select:focus{border-color:var(--cal-hair)}",
      ".cc-cal__pop select{cursor:pointer}",
      ".cc-cal__pop option{background:var(--void);color:var(--cal-ink)}",
      ".cc-cal__typerow{display:flex;gap:6px;margin-top:6px}",
      ".cc-cal__typebtn{flex:1;font-style:italic;font-size:10px;letter-spacing:.04em;padding:5px 8px;border-radius:99px;border:0.6px solid var(--cal-hair);background:transparent;color:var(--cal-inkmute);cursor:pointer;font-family:inherit;transition:.18s}",
      ".cc-cal__typebtn.on{border-color:var(--cal-gold);background:var(--ghost);color:var(--cal-gold)}",
      ".cc-cal__addbtn{margin-top:7px;width:100%;font-size:10px;letter-spacing:.18em;padding:6px;border:0.6px dashed var(--cal-hair);background:transparent;color:var(--cal-inkmute);cursor:pointer;font-family:inherit;border-radius:4px;font-style:italic;transition:.18s}",
      ".cc-cal__addbtn:hover{border-color:var(--cal-hair);color:var(--cal-gold)}",
      // ROSE DOSE control (tap rose to cycle dose 0→3)
      ".cc-cal__medbox{margin-top:9px}",
      ".cc-cal__dose{display:flex;align-items:center;gap:10px}",
      ".cc-cal__doserose{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;border:none;background:none;cursor:pointer;font-family:inherit;transition:.18s;padding:3px}",
      ".cc-cal__doserose:hover{transform:scale(1.08)}",
      ".cc-cal__doserose.on{filter:drop-shadow(0 0 5px rgba(184,122,130,.55))}",
      "[data-theme='day'] .cc-cal__doserose.on{filter:drop-shadow(0 0 5px rgba(111,138,85,.55))}",
      ".cc-cal__dosemeta{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}",
      ".cc-cal__dosemeta .dv{font-style:italic;font-size:13px;color:var(--cal-medtext);letter-spacing:.04em;font-variant-numeric:tabular-nums}",
      ".cc-cal__dosemeta .dh{font-style:italic;font-size:9px;color:var(--cal-inkmute);letter-spacing:.06em}",
      ".cc-cal__dosereset{flex:0 0 auto;background:none;border:none;color:var(--cal-inkmute);font-size:15px;line-height:1;cursor:pointer;font-family:var(--serif);padding:0 2px}",
      ".cc-cal__dosereset:hover{color:var(--rose)}",
      ".cc-cal__pop .prow{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:12px;padding-top:10px;border-top:0.6px solid var(--cal-hair)}",
      ".cc-cal__pop .save{font-size:10px;letter-spacing:.25em;padding:7px 16px;border:0.6px solid var(--cal-gold);background:var(--ghost);color:var(--cal-gold);cursor:pointer;font-family:inherit;border-radius:4px;font-style:italic}",
      ".cc-cal__pop .save:hover{background:rgba(193,154,86,.18)}",
      // agenda rail — left border is a token
      ".cc-cal__agenda{border-left:0.6px solid var(--cal-hair);padding-left:22px}",
      ".cc-cal__agenda-h{font-family:var(--serif);font-style:italic;font-size:13px;letter-spacing:.2em;color:var(--cal-inkmute);text-transform:uppercase;margin-bottom:4px}",
      ".cc-cal__ai{display:flex;align-items:flex-start;gap:8px;padding:11px 0;border-bottom:0.5px solid var(--cal-hair)}",
      ".cc-cal__ai .mk{flex:0 0 auto;margin-top:2px;line-height:0}",
      ".cc-cal__ai .body{flex:1;min-width:0}",
      ".cc-cal__ai .when{font-family:var(--mono);font-size:11px;color:var(--cal-gold);letter-spacing:.5px}",
      ".cc-cal__ai .lab{font-family:var(--cjk);font-size:13px;margin-top:3px;color:var(--cal-inksoft);line-height:1.4}",
      ".cc-cal__ai .lab.kimi{font-family:var(--serif);font-style:italic}",
      ".cc-cal__empty{padding:11px 0;font-style:italic;font-size:12px;color:var(--cal-inkmute)}",
      // legend — top border token
      ".cc-cal__legend{display:flex;gap:22px;justify-content:center;margin-top:20px;font-family:var(--serif);font-style:italic;font-size:11px;color:var(--cal-inkmute);flex-wrap:wrap;border-top:0.5px solid var(--cal-hair);padding-top:18px}",
      ".cc-cal__legend span{display:inline-flex;align-items:center;gap:6px}",
      ".cc-cal__legend .moondot{width:11px;height:11px;border-radius:50%;background:radial-gradient(circle at 38% 32%,rgba(193,154,86,.42),transparent 70%);border:0.5px solid var(--cal-hair)}",
      ".cc-cal__hint{text-align:center;font-style:italic;font-size:10px;color:var(--cal-inkmute);margin-top:10px;letter-spacing:.04em}",
      // Mobile: stack agenda below the grid. All hairlines come from the source
      // --cal-hair var (set per-theme at the top), so day/night need no overrides.
      "@media(max-width:640px){.cc-cal__body{grid-template-columns:1fr}.cc-cal__agenda{border-left:none;border-top:0.6px solid var(--cal-hair);padding-left:0;padding-top:10px}.cc-cal__pop{width:220px}}"
    ].join("");
    document.head.appendChild(s);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  root.Comp.calendar = function (el) {
    injectCss();

    var now = new Date();
    var state = {
      year: now.getFullYear(),
      month: now.getMonth(),
      store: loadStore(),
      editing: null   // YYYY-MM-DD currently open in the popover
    };

    // demo seed — if the user has no saved data yet, plant a few rose doses in
    // the current month so the rose-cal dose measurement is visible on first open.
    // ephemeral (not persisted); the moment the user edits a day, their data sticks.
    if (!Object.keys(state.store.days).length) {
      state.store.days[ymd(state.year, state.month, 9)]  = { events: [], dose: 4 }; // 2
      state.store.days[ymd(state.year, state.month, 17)] = { events: [], dose: 2 }; // 1
      state.store.days[ymd(state.year, state.month, 23)] = { events: [], dose: 6 }; // 3 (full bloom)
    }

    function nav(delta) {
      var m = state.month + delta, y = state.year;
      while (m < 0) { m += 12; y -= 1; }
      while (m > 11) { m -= 12; y += 1; }
      state.month = m; state.year = y; state.editing = null;
      render();
    }

    // ---- agenda: merge kimi-written + user-stored, sorted, this-month -------
    function buildAgenda() {
      var prefix = monthPrefix(state.year, state.month);
      var items = [];
      kimiEventsFor(state.year, state.month).forEach(function (e) {
        items.push({ date: e.date, time: e.time, label: e.title, kind: "kimi" });
      });
      Object.keys(state.store.days).forEach(function (date) {
        if (date.indexOf(prefix) !== 0) return;
        var day = getDay(state.store, date);
        day.events.forEach(function (ev) {
          items.push({
            date: date,
            time: ev.time || "—",
            label: ev.title,
            kind: ev.type === "note" ? "you-note" : "you"
          });
        });
        if (day.dose > 0) {
          items.push({ date: date, time: "dose", label: doseLabel(day.dose) + " 剂", kind: "med", dose: day.dose });
        }
      });
      items.sort(function (a, b) {
        if (a.date !== b.date) return a.date < b.date ? -1 : 1;
        return (a.time || "") < (b.time || "") ? -1 : 1;
      });
      return items;
    }

    // ---- the editor popover (structured events + med + kimi read-only) -----
    function openEditor(date, cellEl) {
      closeEditor();
      state.editing = date;
      var kimiMap = kimiByDateFor(state.year, state.month);
      var kimiEvents = kimiMap[date] || [];
      var day = getDay(state.store, date);
      // working copy
      var draft = {
        events: day.events.map(function (e) { return { title: e.title, time: e.time || "", type: e.type || "event" }; }),
        dose: day.dose,          // stage 0..6
        newType: "event"
      };

      var pop = document.createElement("div");
      pop.className = "cc-cal__pop";

      function evListHtml() {
        if (!draft.events.length) return "";
        return '<div class="cc-cal__evlist">' + draft.events.map(function (e, i) {
          var ico = e.type === "note"
            ? '<span class="ico">' + diamondMini() + "</span>"
            : '<span class="ico" style="line-height:0">' + diamondMini() + "</span>";
          var t = e.time ? '<span class="t">' + esc(e.time) + "</span>" : "";
          return '<div class="cc-cal__evrow">' + ico +
            '<span class="meta">' + t + esc(e.title) + "</span>" +
            '<button type="button" class="del" data-del="' + i + '" aria-label="remove">×</button></div>';
        }).join("") + "</div>";
      }

      function kimiHtml() {
        if (!kimiEvents.length) return "";
        return '<div class="cc-cal__kimi"><div class="cc-cal__kimi-h">' + foxImg(13) +
          ' &nbsp;kimi wrote · calendar</div>' +
          kimiEvents.map(function (e) {
            var loc = e.location ? '<span class="kl">@ ' + esc(e.location) + "</span>" : "";
            return '<div class="cc-cal__kimi-row"><span class="kt">' + esc(e.time) + "</span>" +
              "<span>" + esc(e.title) + loc + "</span></div>";
          }).join("") + "</div>";
      }

      function typeRowHtml() {
        return '<div class="cc-cal__typerow">' + EVENT_TYPES.map(function (t) {
          return '<button type="button" class="cc-cal__typebtn' + (draft.newType === t.key ? " on" : "") +
            '" data-type="' + t.key + '">' + esc(t.label) + "</button>";
        }).join("") + "</div>";
      }

      // ROSE DOSE control — tap the rose to cycle 0→0.5→1→…→3→0. The glyph grows /
      // half-fills with the a/b/c rose PNGs. A "−" resets to 0. Generic dose
      // demo, no real med name.
      function doseCtrlHtml() {
        var on = draft.dose > 0;
        var lbl = on ? doseLabel(draft.dose) + " 剂" : "tap rose · 加剂量";
        return '<div class="cc-cal__dose">' +
          '<button type="button" class="cc-cal__doserose' + (on ? " on" : "") +
          '" aria-label="cycle dose, current ' + (STAGE_TO_DOSE[draft.dose] || 0) + '">' +
          roseDose(draft.dose, 26) + "</button>" +
          '<div class="cc-cal__dosemeta"><span class="dv">' + esc(lbl) + "</span>" +
          '<span class="dh">tap 玫瑰 +0.5 · max 3</span></div>' +
          (on ? '<button type="button" class="cc-cal__dosereset" aria-label="clear dose">×</button>' : "") +
          "</div>";
      }

      function paint() {
        pop.innerHTML =
          '<div class="ph"><span class="pd">' + esc(date) + '</span>' +
          '<button class="px" aria-label="close">×</button></div>' +
          kimiHtml() +
          '<label>事件 · events</label>' +
          evListHtml() +
          '<div class="cc-cal__addgrid">' +
          '<input type="text" class="etime" placeholder="时间" value="" inputmode="numeric">' +
          '<input type="text" class="etitle" placeholder="add an event">' +
          "</div>" +
          typeRowHtml() +
          '<button type="button" class="cc-cal__addbtn">+ add to day</button>' +
          '<div class="cc-cal__medbox"><label>用药 · dose</label>' +
          doseCtrlHtml() +
          "</div>" +
          '<div class="prow"><button type="button" class="save">SAVE</button></div>';
        wire();
      }

      function wire() {
        var titleInput = pop.querySelector(".etitle");
        var timeInput = pop.querySelector(".etime");

        // type pills
        pop.querySelectorAll(".cc-cal__typebtn").forEach(function (b) {
          b.addEventListener("click", function () {
            draft.newType = b.getAttribute("data-type");
            pop.querySelectorAll(".cc-cal__typebtn").forEach(function (x) {
              x.classList.toggle("on", x === b);
            });
          });
        });

        function addEvent() {
          var title = titleInput.value.trim();
          if (!title) { titleInput.focus(); return; }
          draft.events.push({ title: title, time: timeInput.value.trim(), type: draft.newType });
          paint();
          pop.querySelector(".etitle").focus();
        }
        pop.querySelector(".cc-cal__addbtn").addEventListener("click", addEvent);
        titleInput.addEventListener("keydown", function (e) {
          if (e.key === "Enter") { e.preventDefault(); addEvent(); }
          else if (e.key === "Escape") { closeEditor(); }
        });
        timeInput.addEventListener("keydown", function (e) {
          if (e.key === "Enter") { e.preventDefault(); titleInput.focus(); }
        });

        // delete an existing event row
        pop.querySelectorAll(".del").forEach(function (b) {
          b.addEventListener("click", function () {
            var i = parseInt(b.getAttribute("data-del"), 10);
            draft.events.splice(i, 1);
            paint();
          });
        });

        // rose dose — tap cycles stage 0→…→6→0; reset clears to 0
        var doseRose = pop.querySelector(".cc-cal__doserose");
        if (doseRose) {
          doseRose.addEventListener("click", function () {
            draft.dose = (draft.dose + 1) % (MAX_STAGE + 1);
            paint();
          });
        }
        var doseReset = pop.querySelector(".cc-cal__dosereset");
        if (doseReset) {
          doseReset.addEventListener("click", function () { draft.dose = 0; paint(); });
        }

        pop.querySelector(".px").addEventListener("click", closeEditor);
        pop.querySelector(".save").addEventListener("click", commit);
      }

      function commit() {
        // capture an unsubmitted draft event so a typed-but-not-added line saves
        var titleInput = pop.querySelector(".etitle");
        var timeInput = pop.querySelector(".etime");
        if (titleInput && titleInput.value.trim()) {
          draft.events.push({ title: titleInput.value.trim(), time: timeInput.value.trim(), type: draft.newType });
        }
        setDay(state.store, date, { events: draft.events, dose: draft.dose });
        saveStore(state.store);
        closeEditor();
        render();
      }

      // mount + position
      var wrap = el.querySelector(".cc-cal__gridwrap");
      wrap.appendChild(pop);
      paint();
      var cr = cellEl.getBoundingClientRect();
      var wr = wrap.getBoundingClientRect();
      var left = cr.left - wr.left;
      var top = cr.top - wr.top + cr.height + 4;
      var maxLeft = wrap.clientWidth - pop.offsetWidth - 2;
      if (left > maxLeft) left = Math.max(0, maxLeft);
      pop.style.left = left + "px";
      pop.style.top = top + "px";
      var firstTitle = pop.querySelector(".etitle");
      if (firstTitle) firstTitle.focus();
    }

    function closeEditor() {
      state.editing = null;
      var ex = el.querySelector(".cc-cal__pop");
      if (ex) ex.parentNode.removeChild(ex);
    }

    function render() {
      var y = state.year, m = state.month;
      var off = mondayOffset(y, m);
      var dim = daysInMonth(y, m);
      var todayD = (now.getFullYear() === y && now.getMonth() === m) ? now.getDate() : -1;
      var kimiMap = kimiByDateFor(y, m);

      // build cells
      var cells = "";
      for (var pcell = 0; pcell < off; pcell++) {
        cells += '<div class="cc-cal__cell pad' + (pcell >= 5 ? " we" : "") + '"></div>';
      }
      for (var d = 1; d <= dim; d++) {
        var col = (off + d - 1) % 7;
        var date = ymd(y, m, d);
        var weekend = col >= 5;
        var isToday = d === todayD;
        var cls = "cc-cal__cell" + (weekend ? " we" : "") + (isToday ? " today" : "");

        var inner = "";
        // moon wash — opacity driven by phase via --mw; gradient + size live in CSS
        // so day mode can shrink + soften it (night keeps the fuller gold wash).
        var mw = moonWeight(y, m, d);
        if (mw > 0.12) {
          var op = (0.10 + mw * 0.32).toFixed(3);
          inner += '<span class="cc-cal__moon" style="--mw:' + op + '"></span>';
        }
        // top row: day number (+ today tag) + sprig
        inner += '<div class="cc-cal__rowtop"><span class="cc-cal__dn">' + d + "</span>" +
          (isToday ? '<span class="cc-cal__tag">today</span>' : "") +
          sprig() + "</div>";

        var day = getDay(state.store, date);
        // user structured events — first event on a gold rule, "+N" if more
        if (day.events.length) {
          var first = day.events[0];
          var t = first.time ? '<span class="t">' + esc(first.time) + "</span>" : "";
          var more = day.events.length > 1 ? '<span class="more">+' + (day.events.length - 1) + "</span>" : "";
          inner += eventLine() + '<div class="cc-cal__evt">' + t + esc(first.title) + more + "</div>";
        }
        // med rose — dose glyph + dose label (e.g. "1.5"); tap cell to cycle in editor
        if (day.dose > 0) {
          inner += '<div class="cc-cal__medrow">' + roseDose(day.dose, 13) +
            "<span>" + esc(doseLabel(day.dose)) + "</span></div>";
        }
        // kimi-written (fox) marker — image, first event + "+N"
        var ke = kimiMap[date];
        if (ke && ke.length) {
          var kmore = ke.length > 1 ? " +" + (ke.length - 1) : "";
          inner += '<div class="cc-cal__foxrow">' + foxImg(14) +
            "<span>" + esc(ke[0].time) + " " + esc(ke[0].title) + esc(kmore) + "</span></div>";
        }
        cells += '<button type="button" class="' + cls + '" data-date="' + date + '">' + inner + "</button>";
      }
      // trailing pad to fill last row
      var total = off + dim;
      while (total % 7 !== 0) {
        var tcol = total % 7;
        cells += '<div class="cc-cal__cell pad' + (tcol >= 5 ? " we" : "") + '"></div>';
        total++;
      }

      // weekday header
      var dow = WEEKDAYS.map(function (w, i) {
        return "<span" + (i >= 5 ? ' class="we"' : "") + ">" + w + "</span>";
      }).join("");

      // agenda
      var agenda = buildAgenda();
      var agendaHtml;
      if (agenda.length === 0) {
        agendaHtml = '<div class="cc-cal__empty">nothing scheduled</div>';
      } else {
        agendaHtml = agenda.map(function (a) {
          var mk = a.kind === "kimi" ? foxImg(15)
            : a.kind === "med" ? roseDose(a.dose || 2, 14)
              : '<span style="line-height:0">' + diamondMini() + "</span>";
          var labCls = a.kind === "kimi" ? " kimi" : "";
          var dd = a.date.slice(8);
          var prefix = a.kind === "kimi" ? "kimi · " : a.kind === "med" ? "dose · " : "you · ";
          return '<div class="cc-cal__ai"><span class="mk">' + mk + "</span>" +
            '<div class="body"><div class="when">' + dd + " · " + esc(a.time) + "</div>" +
            '<div class="lab' + labCls + '">' + esc(prefix) + esc(a.label) + "</div></div></div>";
        }).join("");
      }

      el.innerHTML =
        '<div class="cc-cal">' +
          '<div class="cc-cal__head">' +
            '<div class="cc-cal__vine">' + vine() + "</div>" +
            '<div class="cc-cal__yr">' + y + "</div>" +
            '<div class="cc-cal__mo"><button class="cc-cal__nav" data-nav="-1" aria-label="prev month">‹</button>' +
              '<span class="m">' + EN_MONTH[m] + "</span>" +
              '<button class="cc-cal__nav" data-nav="1" aria-label="next month">›</button></div>' +
            '<div class="cc-cal__cn">' + CN_MONTH[m] + " · demo</div>" +
          "</div>" +
          '<div class="cc-cal__body">' +
            '<div class="cc-cal__gridwrap" style="position:relative">' +
              '<div class="cc-cal__dow">' + dow + "</div>" +
              '<div class="cc-cal__grid">' + cells + "</div>" +
            "</div>" +
            '<div class="cc-cal__agenda">' +
              '<div class="cc-cal__agenda-h">Agenda</div>' + agendaHtml +
            "</div>" +
          "</div>" +
          '<div class="cc-cal__legend">' +
            '<span><span class="moondot"></span>moon phase</span>' +
            "<span>" + foxImg(15) + " kimi wrote</span>" +
            "<span>" + roseSample() + " dose</span>" +
            "<span>" + diamondMini() + " event</span>" +
          "</div>" +
          '<div class="cc-cal__hint">click a day to add events (title + time + type) · tap the rose to set a dose (0–3)</div>' +
        "</div>";

      // wire nav
      el.querySelectorAll(".cc-cal__nav").forEach(function (b) {
        b.addEventListener("click", function () { nav(parseInt(b.getAttribute("data-nav"), 10)); });
      });
      // wire cell clicks → editor
      el.querySelectorAll(".cc-cal__cell[data-date]").forEach(function (c) {
        c.addEventListener("click", function () { openEditor(c.getAttribute("data-date"), c); });
      });
    }

    // re-render on theme flip so the fox invert filter updates
    var themeObserver = new MutationObserver(function () {
      if (!el.querySelector(".cc-cal")) return;
      var open = state.editing;
      render();
      // (popover is transient; theme flip closes it — acceptable)
      void open;
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    render();
  };
})(window);
