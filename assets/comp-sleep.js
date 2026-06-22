/* comp-sleep.js — cc-gild demo panel · sleep candles.
   An editable sleep-candles widget (visual essence) / Gothic Candle.
   ~7 lit candles, wax height scales with nightly sleep hours; gold for restful
   nights, sage for short ones. GENERIC DEMO data only. persona kimi / you.
   Reuses cc-gild tokens: --accent --hair --ink --mute --serif --cjk. */
window.Comp = window.Comp || {};

window.Comp.sleep = function (el) {
  // inject component CSS once
  if (!document.getElementById("comp-sleep-css")) {
    var st = document.createElement("style");
    st.id = "comp-sleep-css";
    st.textContent = [
      ".cs-wrap{font-family:var(--serif);padding:4px 2px 2px}",
      ".cs-head{display:flex;align-items:baseline;gap:10px;margin-bottom:6px}",
      ".cs-head .cs-t{font-style:italic;font-size:18px;color:var(--ink);letter-spacing:.02em}",
      ".cs-head .cs-en{font-family:var(--serif);font-style:italic;font-size:10px;letter-spacing:.34em;text-transform:uppercase;color:var(--mute)}",
      ".cs-head .ln{flex:1;height:.6px;background:var(--hair2)}",
      ".cs-chart{display:flex;justify-content:space-around;align-items:flex-end;gap:4px;padding:6px 2px 0}",
      ".cs-day{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1}",
      ".cs-cd{line-height:0;transition:opacity .2s}",
      ".cs-cd:hover{opacity:.82}",
      ".cs-lab{font-family:var(--serif);font-style:italic;font-size:8px;letter-spacing:.06em;color:var(--mute);opacity:.62}",
      ".cs-hrs{font-family:var(--mono);font-size:8.5px;color:var(--accent);font-variant-numeric:normal;opacity:.8}",
      ".cs-foot{display:flex;justify-content:space-between;align-items:baseline;margin-top:12px;padding-top:9px;border-top:.6px solid var(--hair2)}",
      ".cs-foot .avg{font-family:var(--serif);font-style:italic;font-size:13px;color:var(--ink2)}",
      ".cs-foot .avg b{font-family:var(--serif);font-style:normal;font-size:22px;color:var(--accent);font-feature-settings:'onum' 1;margin-right:4px}",
      ".cs-leg{display:flex;gap:13px;font-family:var(--serif);font-style:italic;font-size:10.5px;color:var(--mute)}",
      ".cs-leg span{display:inline-flex;align-items:center;gap:5px}",
      ".cs-leg i{width:7px;height:7px;border-radius:1px}",
    ].join("");
    document.head.appendChild(st);
  }

  // demo data: 7 nights, generic labels, sleep length in hours
  var nights = (window.CC_COMP&&window.CC_COMP.sleep&&window.CC_COMP.sleep.nights) || [
    { label: "Mon", hrs: 7.4 },
    { label: "Tue", hrs: 6.1 },
    { label: "Wed", hrs: 5.2 },
    { label: "Thu", hrs: 8.0 },
    { label: "Fri", hrs: 6.8 },
    { label: "Sat", hrs: 4.6 },
    { label: "Sun", hrs: 7.9 },
  ];
  var SVG_H = 60; // viewbox height
  var MAX_HRS = 9; // wax full at 9h
  var GOOD = 6.5; // >= restful (gold) else short (sage)

  // build one candle as an SVG string; wax height maps hours -> px
  function candle(hrs) {
    var col = hrs >= GOOD ? "var(--accent)" : "var(--sage)";
    var wax = Math.max(11, Math.round((Math.min(hrs, MAX_HRS) / MAX_HRS) * 42));
    var waxTop = SVG_H - 5 - wax; // sit on the holder near bottom
    var flameY = waxTop - 4;
    return [
      '<svg class="cs-cd" width="22" height="' + SVG_H + '" viewBox="0 0 22 ' + SVG_H + '" aria-label="' + hrs + ' hours">',
      // flame: outer gold + inner rose-ish core
      '<ellipse cx="11" cy="' + (flameY - 1) + '" rx="2.1" ry="4" fill="var(--accent)" opacity=".95"/>',
      '<ellipse cx="11" cy="' + flameY + '" rx="0.9" ry="2.3" fill="var(--rose)" opacity=".55"/>',
      // wick
      '<line x1="11" y1="' + (flameY + 2) + '" x2="11" y2="' + (waxTop + 1) + '" stroke="var(--ink)" stroke-width=".8"/>',
      // wax body
      '<rect x="7" y="' + waxTop + '" width="8" height="' + wax + '" rx="1.2" fill="' + col + '" opacity=".26" stroke="' + col + '" stroke-width=".7"/>',
      // a faint drip
      '<path d="M7 ' + (waxTop + 4) + ' Q5.8 ' + (waxTop + 9) + ', 7 ' + (waxTop + 13) + '" stroke="' + col + '" stroke-width=".5" fill="none" opacity=".5"/>',
      // gold holder / base
      '<rect x="5.5" y="' + (SVG_H - 5) + '" width="11" height="2.4" fill="var(--accent-d)"/>',
      '<rect x="3.5" y="' + (SVG_H - 2.6) + '" width="15" height="1.8" rx=".8" fill="var(--accent)"/>',
      "</svg>",
    ].join("");
  }

  var sum = 0;
  var bars = nights
    .map(function (n) {
      sum += n.hrs;
      return (
        '<div class="cs-day">' +
        candle(n.hrs) +
        '<span class="cs-hrs">' + n.hrs.toFixed(1) + "</span>" +
        '<span class="cs-lab">' + n.label + "</span>" +
        "</div>"
      );
    })
    .join("");
  var avg = (sum / nights.length).toFixed(1);

  el.innerHTML =
    '<div class="cs-wrap">' +
    '<div class="cs-head"><span class="cs-t">睡眠</span>' +
    '<span class="cs-en">Sleep · last 7 nights</span><span class="ln"></span></div>' +
    '<div class="cs-chart">' + bars + "</div>" +
    '<div class="cs-foot">' +
    '<span class="avg"><b>' + avg + "</b>avg hrs</span>" +
    '<span class="cs-leg">' +
    '<span><i style="background:var(--accent)"></i>restful</span>' +
    '<span><i style="background:var(--sage)"></i>short</span>' +
    "</span></div>" +
    "</div>";
};
