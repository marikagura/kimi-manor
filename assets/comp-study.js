/* comp-study.js — STUDY panel: a bookshelf of spines + desk-row list.
   Vanilla, no framework, no build. Attaches to window.Comp.study(el).
   Ports the visual essence of a study room (bookshelf + WRITING/READING
   rows) into cc-gild. Reuses v2.css tokens — no hardcoded colors.
   GENERIC DEMO content only. Persona: kimi / you. */
(function (w) {
  w.Comp = w.Comp || {};

  // Generic demo books — varied muted spine tints (all token-derived gold/sage/rose),
  // varied heights for a hand-shelved look. Neutral titles only.
  var BOOKS = (window.CC_COMP&&window.CC_COMP.study&&window.CC_COMP.study.books) || [
    { t: "Vol. I",   c: "linear-gradient(180deg,#6f5a36,#4a3c22)", h: 168 },
    { t: "Vol. II",  c: "linear-gradient(180deg,#5a6048,#3a3e2e)", h: 150 },
    { t: "Essays",   c: "linear-gradient(180deg,#7a5258,#4e343a)", h: 174 },
    { t: "Notes",    c: "linear-gradient(180deg,#4f5a66,#323a44)", h: 138 },
    { t: "Vol. III", c: "linear-gradient(180deg,#6f5a36,#4a3c22)", h: 160 },
    { t: "Poems",    c: "linear-gradient(180deg,#7a5258,#4e343a)", h: 146 },
    { t: "Vol. IV",  c: "linear-gradient(180deg,#5a6048,#3a3e2e)", h: 178 },
    { t: "Drafts",   c: "linear-gradient(180deg,#4f5a66,#323a44)", h: 132 }
  ];

  // Generic desk rows — writing / reading.
  var ROWS = (window.CC_COMP&&window.CC_COMP.study&&window.CC_COMP.study.rows) || [
    { eyebrow: "WRITING", title: "Publications", sub: "papers · catalogue →" },
    { eyebrow: "READING", title: "Short pieces", sub: "12 entries · notes + excerpts →" },
    { eyebrow: "CONCEPTS", title: "Reference shelf", sub: "8 anchors · methods + glossary →" }
  ];

  function injectCss() {
    if (document.getElementById("comp-study-css")) return;
    var s = document.createElement("style");
    s.id = "comp-study-css";
    // Token-based; mirrors v2.css .shelf/.book/.deskrow but namespaced so the
    // panel is self-sufficient even if base study CSS isn't on the page.
    s.textContent = [
      ".cs-head{text-align:center;padding:6px 0 2px}",
      ".cs-head .cn{font-family:var(--cjk,serif);font-weight:500;font-size:26px;letter-spacing:.06em;color:var(--ink,#f3e6cd)}",
      ".cs-head .en{font-family:var(--serif,serif);font-style:italic;font-size:11px;color:var(--mute,#999);margin-top:3px;letter-spacing:.3em;text-transform:uppercase}",
      ".cs-eyebrow{font-family:var(--serif,serif);font-size:9px;letter-spacing:.32em;text-transform:uppercase;color:var(--accent,#c19a56);margin:22px 0 10px;display:flex;align-items:center;gap:12px}",
      ".cs-eyebrow .ln{flex:1;height:.6px;background:var(--hair2,rgba(193,154,86,.18))}",
      ".cs-shelf{display:flex;align-items:flex-end;gap:5px;justify-content:center;padding:18px 0 12px;min-height:184px;flex-wrap:wrap}",
      ".cs-shelf .baseline{height:.9px;background:var(--hair,rgba(193,154,86,.38));margin:0 auto;width:92%}",
      ".cs-book{width:34px;border-radius:3px 3px 1px 1px;display:flex;align-items:center;justify-content:center;",
      "  writing-mode:vertical-rl;text-orientation:mixed;font-family:var(--cjk,serif);font-size:12px;",
      "  color:rgba(255,250,240,.92);letter-spacing:.14em;padding:13px 0;cursor:pointer;flex:0 0 auto;",
      "  transition:transform .18s ease;",
      "  box-shadow:inset 1.5px 0 rgba(255,255,255,.14),inset -2px 0 rgba(0,0,0,.38),0 8px 20px -10px #000}",
      ".cs-book:hover{transform:translateY(-4px)}",
      ".cs-note{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:12px;color:var(--mute,#999);margin-top:4px}",
      ".cs-deskrow{border-left:2px solid var(--accent,#c19a56);",
      "  background:linear-gradient(90deg,rgba(40,30,18,.5),rgba(20,15,9,.15));",
      "  border-radius:0 9px 9px 0;padding:18px 22px;margin-top:10px;display:flex;align-items:center;",
      "  justify-content:space-between;cursor:pointer;transition:background .18s ease}",
      ".cs-deskrow:hover{background:linear-gradient(90deg,rgba(54,40,22,.6),rgba(24,18,11,.22))}",
      ".cs-deskrow .t{font-family:var(--cjk,serif);font-weight:500;font-size:21px;color:var(--ink,#f3e6cd);letter-spacing:.02em}",
      ".cs-deskrow .sub{font-family:var(--serif,serif);font-style:italic;font-size:12px;color:var(--mute,#999);margin-top:4px}",
      ".cs-deskrow .ar{font-family:var(--serif,serif);font-size:22px;color:var(--accent,#c19a56);font-style:italic}",
      '[data-theme="day"] .cs-book{color:#fbf4ef}',
      // DAY: WRITING/READING/DESK rows → light rose paper, not grey-black
      '[data-theme="day"] .cs-deskrow{background:linear-gradient(90deg,rgba(168,80,94,.10),rgba(255,250,246,.30))}',
      '[data-theme="day"] .cs-deskrow:hover{background:linear-gradient(90deg,rgba(168,80,94,.16),rgba(255,250,246,.45))}'
    ].join("");
    document.head.appendChild(s);
  }

  function esc(x) { return String(x).replace(/[&<>]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
  }); }

  w.Comp.study = function (el) {
    if (!el) return;
    injectCss();

    var spines = BOOKS.map(function (b) {
      return '<div class="cs-book" style="background:' + b.c + ';height:' + b.h + 'px">' +
             esc(b.t) + "</div>";
    }).join("");

    var writing = ROWS.filter(function (r) { return r.eyebrow === "WRITING"; });
    var rest = ROWS.filter(function (r) { return r.eyebrow !== "WRITING"; });

    function row(r) {
      return '<div class="cs-deskrow">' +
               "<div><div class=\"t\">" + esc(r.title) + "</div>" +
               '<div class="sub">' + esc(r.sub) + "</div></div>" +
               '<span class="ar">→</span></div>';
    }

    el.innerHTML =
      '<div class="cs-head"><div class="cn">书桌</div><div class="en">desk</div></div>' +

      '<div class="cs-eyebrow">· WRITING<span class="ln"></span></div>' +
      writing.map(row).join("") +

      '<div class="cs-eyebrow">· READING — bookshelf<span class="ln"></span></div>' +
      '<div class="cs-shelf">' + spines + "</div>" +
      '<div class="baseline"></div>' +
      '<div class="cs-note">' + BOOKS.length + " volumes · 2 in progress (poetry + paper)</div>" +

      '<div class="cs-eyebrow">· DESK<span class="ln"></span></div>' +
      rest.map(row).join("");
  };
})(window);
