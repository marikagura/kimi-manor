// v4-app.js — cc-gild v4: full-screen draggable panels + casement windows.
// Reuses Mucha, CCData/CCCore, V2 data/build; adds V4 travel + weather + scenes.
(function (root) {
  const M = root.Mucha, C = root.CCCore, D = root.CCData, V = root.V2, B = root.V2Build, W = root.V4;
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>[...r.querySelectorAll(s)];

  /* ====================== SCENES (SVG) ====================== */
  function scenePompeii(){
    const stars=Array.from({length:10},()=>`<circle cx="${(Math.random()*408)|0}" cy="${(Math.random()*72)|0}" r="${(Math.random()*0.8+0.3).toFixed(1)}" opacity="${(Math.random()*0.5+0.3).toFixed(2)}"/>`).join('');
    const flies=Array.from({length:7},()=>`<circle cx="${(Math.random()*408)|0}" cy="${(126+Math.random()*72)|0}" r="${(Math.random()*1+0.6).toFixed(1)}" opacity="${(Math.random()*0.5+0.4).toFixed(2)}"/>`).join('');
    return `<svg viewBox="0 0 408 220" preserveAspectRatio="xMidYMid slice" aria-label="庞贝黄昏">
      <defs>
        <linearGradient id="psky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2a1c33"/><stop offset=".32" stop-color="#6e3f48"/>
          <stop offset=".6" stop-color="#b56a4e"/><stop offset=".82" stop-color="#e0a062"/><stop offset="1" stop-color="#f4cd86"/></linearGradient>
        <radialGradient id="psun" cx="66%" cy="94%" r="58%">
          <stop offset="0" stop-color="#fff0c4" stop-opacity=".95"/><stop offset=".4" stop-color="#ffd591" stop-opacity=".5"/><stop offset="1" stop-color="#ffd591" stop-opacity="0"/></radialGradient>
        <linearGradient id="pves" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c2733"/><stop offset="1" stop-color="#1c1118"/></linearGradient>
        <linearGradient id="pgrd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241620"/><stop offset="1" stop-color="#0d0710"/></linearGradient>
      </defs>
      <rect width="408" height="220" fill="url(#psky)"/>
      <circle cx="272" cy="198" r="152" fill="url(#psun)"/>
      <g fill="#fff0c4">${stars}</g>
      <g stroke="#3a2228" stroke-width="0.8" fill="none" opacity=".55"><path d="M150 50 q4 -4 8 0 q4 -4 8 0"/><path d="M178 58 q3 -3 6 0 q3 -3 6 0"/></g>
      <rect y="118" width="408" height="26" fill="#e6a878" opacity=".12"/>
      <path d="M284 150 Q330 98 348 86 Q368 100 412 150 Z" fill="url(#pves)"/>
      <path d="M348 86 q4 -18 -4 -30 q15 9 12 27 q6 -2 8 -8" fill="none" stroke="#e6b07a" stroke-width=".8" opacity=".45"/>
      <path d="M0 150 q70 -26 140 -8 q70 18 150 -2 Q330 134 408 148 L408 152 L0 152 Z" fill="#3a2630" opacity=".68"/>
      <g fill="#1f141c" opacity=".82" transform="translate(150 94)"><path d="M-7 9 L47 9 L40 0 L0 0 Z"/><rect x="-2" y="11" width="4" height="34"/><rect x="8" y="11" width="4" height="34"/><rect x="18" y="11" width="4" height="34"/><rect x="28" y="11" width="4" height="34"/><rect x="38" y="11" width="4" height="34"/><rect x="-7" y="45" width="58" height="4"/></g>
      <path d="M0 150 L408 150 L408 220 L0 220 Z" fill="url(#pgrd)"/>
      <g fill="#160d14"><path d="M118 150 q-5 -34 4 -50 q9 16 4 50 Z"/><path d="M132 150 q-3 -22 2 -34 q6 12 3 34 Z"/></g>
      <g transform="translate(40 86)"><rect x="-9" y="0" width="18" height="88" fill="#120c10"/><g stroke="#d8a86a" stroke-width=".9" opacity=".8"><line x1="-6" y1="6" x2="-6" y2="82"/><line x1="-2" y1="6" x2="-2" y2="82"/><line x1="2" y1="6" x2="2" y2="82"/><line x1="6" y1="6" x2="6" y2="82"/></g><path d="M-12 0 q12 -8 24 0" fill="none" stroke="#d8a86a" stroke-width="1"/><rect x="-13" y="-6" width="26" height="6" fill="#1a1016" stroke="#d8a86a" stroke-width=".6"/><rect x="-11" y="82" width="22" height="8" fill="#1a1016" stroke="#d8a86a" stroke-width=".6"/></g>
      <g transform="translate(80 96)"><rect x="-7" y="0" width="14" height="80" fill="#0f0a0e"/><g stroke="#c89a60" stroke-width=".8" opacity=".7"><line x1="-4" y1="6" x2="-4" y2="74"/><line x1="0" y1="6" x2="0" y2="74"/><line x1="4" y1="6" x2="4" y2="74"/></g><path d="M-10 0 q10 -7 20 0" fill="none" stroke="#c89a60" stroke-width=".9"/><rect x="-10" y="-5" width="20" height="5" fill="#171015" stroke="#c89a60" stroke-width=".5"/></g>
      <g transform="translate(362 116)"><rect x="-7" y="0" width="14" height="58" fill="#120c10"/><path d="M-7 0 l5 -9 l4 6 l5 -5" fill="none" stroke="#c89a60" stroke-width=".8"/><g stroke="#c89a60" stroke-width=".7" opacity=".6"><line x1="-3" y1="4" x2="-3" y2="54"/><line x1="2" y1="4" x2="2" y2="54"/></g></g>
      <g fill="#ffe6a8">${flies}</g></svg>`;
  }
  function sceneSky(){
    const stars=Array.from({length:9},()=>`<circle cx="${(Math.random()*408)|0}" cy="${(Math.random()*118)|0}" r="0.6" opacity="${(Math.random()*0.6+0.2).toFixed(2)}"/>`).join('');
    const rain=Array.from({length:56},()=>{const x=(Math.random()*408)|0,y=(Math.random()*162)|0;return `<line x1="${x}" y1="${y}" x2="${x-8}" y2="${y+17}"/>`;}).join('');
    return `<svg viewBox="0 0 408 208" preserveAspectRatio="xMidYMid slice" aria-label="夜雨">
      <defs>
        <linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0d1a"/><stop offset=".55" stop-color="#171528"/><stop offset="1" stop-color="#2a2030"/></linearGradient>
        <radialGradient id="nmoon" cx="40%" cy="36%" r="62%"><stop offset="0" stop-color="#fff7e2"/><stop offset=".55" stop-color="#e6d4ac"/><stop offset="1" stop-color="#9a7c50"/></radialGradient>
        <radialGradient id="nhalo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff3d2" stop-opacity=".38"/><stop offset="1" stop-color="#fff3d2" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="408" height="208" fill="url(#nsky)"/>
      <circle cx="308" cy="56" r="58" fill="url(#nhalo)"/>
      <g fill="#fff">${stars}</g>
      <circle cx="308" cy="56" r="25" fill="url(#nmoon)"/>
      <path d="M308 31 a25 25 0 0 0 0 50 a18 25 0 0 1 0 -50Z" fill="#0d0f1c" opacity=".32"/>
      <g stroke="rgba(200,212,235,.32)" stroke-width=".8">${rain}</g>
      <g fill="#0b0810"><rect x="0" y="156" width="74" height="52"/><rect x="60" y="118" width="40" height="90"/><path d="M62 118 h36 l-18 -16 Z"/><rect x="100" y="162" width="118" height="46"/><rect x="214" y="132" width="36" height="76"/><rect x="248" y="168" width="120" height="40"/><rect x="360" y="148" width="48" height="60"/></g>
      <g fill="#d8a86a" opacity=".55"><rect x="74" y="130" width="3" height="5"/><rect x="82" y="130" width="3" height="5"/><rect x="90" y="138" width="3" height="5"/><rect x="226" y="144" width="3" height="5"/><rect x="232" y="152" width="3" height="5"/></g></svg>`;
  }
  function shutter(dir){
    const gid='shg'+(dir>0?'l':'r');
    return `<svg viewBox="0 0 100 208" preserveAspectRatio="none" style="transform:scaleX(${dir})">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1d150c"/><stop offset="1" stop-color="#0e0a06"/></linearGradient></defs>
      <rect x="0" y="0" width="100" height="208" fill="url(#${gid})"/>
      <rect x="3" y="3" width="94" height="202" fill="none" stroke="currentColor" stroke-width="0.9"/>
      <rect x="7" y="7" width="86" height="194" fill="none" stroke="currentColor" stroke-width="0.5" opacity=".55"/>
      <path d="M14 72 Q14 16 50 14 Q86 16 86 72" fill="rgba(214,180,120,0.05)" stroke="currentColor" stroke-width="0.7"/>
      <g stroke="currentColor" fill="none" stroke-width="0.5" opacity=".85">
        <path d="M50 66 V34 M50 34 Q42 30 40 21 Q48 25 50 34 Q52 25 60 21 Q58 30 50 34"/>
        <path d="M50 66 Q34 58 30 41 M50 66 Q66 58 70 41"/></g>
      <circle cx="50" cy="24" r="2.2" fill="currentColor"/>
      <g stroke="currentColor" stroke-width="0.45" opacity=".5"><line x1="14" y1="72" x2="86" y2="72"/><line x1="50" y1="72" x2="50" y2="150"/><line x1="14" y1="111" x2="86" y2="111"/><rect x="14" y="72" width="72" height="78" fill="none"/></g>
      <rect x="9" y="150" width="82" height="6" fill="currentColor" opacity=".2"/>
      <rect x="16" y="162" width="68" height="38" fill="none" stroke="currentColor" stroke-width="0.5" opacity=".55"/>
      <g transform="translate(50 181)" stroke="currentColor" fill="none" stroke-width="0.5" opacity=".82"><circle r="8" opacity=".5"/><path d="M-4 2 Q0 -6 4 2 Q0 5 -4 2Z"/><path d="M-6 -1 Q0 5 6 -1" opacity=".7"/><path d="M0 -6 Q3 -2 2 1" opacity=".6"/></g>
      <g fill="currentColor" opacity=".7"><rect x="1" y="40" width="6" height="11" rx="1"/><rect x="1" y="157" width="6" height="11" rx="1"/></g>
      <circle cx="90" cy="104" r="2.4" fill="currentColor"/></svg>`;
  }

  /* ====================== souvenir icons ====================== */
  const ICONS = {
    amphora:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8M9 3c0 3-3 3-3 7 0 5 2 8 6 8s6-3 6-8c0-4-3-4-3-7"/><path d="M9 6C6 7 4 9 6 11M15 6c3 1 5 3 3 5"/><path d="M10 21h4"/></svg>`,
    shell:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21C5 21 2 15 4 9 6 4 12 3 12 3s6 1 8 6c2 6-1 12-8 12Z"/><path d="M12 3v18M8 5 9 20M16 5 15 20M5 9h14M4 14h16"/></svg>`,
    feather:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4C9 5 5 12 4 20M20 4c1 8-4 13-12 14M20 4c-2 5-6 7-11 8M9 11c4-1 6-3 7-5M7 15c3-1 5-2 6-4"/><path d="M4 20l3-3"/></svg>`,
    key:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="8" r="4"/><path d="M10 11l9 9M16 17l2-2M19 20l2-2"/></svg>`,
    leaf:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20C3 10 10 3 20 4c1 10-6 17-16 16Z"/><path d="M4 20C8 14 13 10 18 8"/></svg>`,
  };
  const icon = k => ICONS[k] || ICONS.leaf;

  /* ====================== memory-review seal glyphs ======================
   * Wax-seal stamps.
   * Rendered as inline gold-hairline SVG inside the double-ring wax seals.
   * approve = check · edit = pen · reject = cross · defer = back */
  const SEAL = {
    check:`<svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true"><path d="M 3 7.5 L 5.8 10.2 L 11 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    pen:`<svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true"><path d="M 2.5 11.5 L 4.5 11 L 11 4.5 L 9.5 3 L 3 9.5 Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M 8.6 3.9 L 10.1 5.4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    cross:`<svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true"><path d="M 4 4 L 10 10 M 10 4 L 4 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    back:`<svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true"><path d="M 4 7 L 8 7 Q 11 7 11 9.5 L 11 10.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M 6 5 L 4 7 L 6 9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  };

  /* ====================== panel bodies ====================== */
  const FRAME = () => (root.TravelWindows ? root.TravelWindows.frameByKey(root.CC_FRAME||'iron') : null);
  function windowView(sceneSvg, hint, h){
    const fr = FRAME();
    const frameSvg = fr ? fr.fn() : '';
    return `<div class="view-frame fwin"${h?` style="height:${h}px"`:''}>
        <div class="fw-win"><div class="fw-scene">${sceneSvg}</div><div class="fw-veil"></div>${frameSvg}
          <button class="latch" title="开窗"></button></div>
        <button class="reclose" title="闭窗">✕</button>
        <div class="view-hint">${hint}</div>
      </div>`;
  }
  function travelBody(){
    const t = W.TRAVEL, c = t.current;
    const scene = (root.TravelWindows && root.TravelWindows.scene) ? root.TravelWindows.scene() : scenePompeii();
    return `${windowView(scene, 'push the window · see where it went', 248)}
      <div class="sill">
        <div class="jrow"><div class="place">${c.place}<span class="pen">${c.placeEn}</span></div><div class="era">${c.era}</div></div>
        <div class="sub">${c.sub} · out ${c.depart} → back ${c.back}</div>
        <div class="note">${c.note}</div>
      </div>
      <div class="brought">
        <div class="icn">${icon(c.brought.icon)}</div>
        <div><div><span class="bn">${c.brought.name}</span><span class="bw">${c.brought.where}</span></div><div class="bl">${c.brought.line}</div></div>
      </div>
      <div class="shelf-mantel">
        <div class="mh">Brought home · Mantel</div>
        <div class="shelf-row">${t.shelf.map(s=>`<div class="sv"><div class="icn">${icon(s.icon)}</div><div class="sp">${s.name}</div><div class="se">${s.place} · ${s.era}</div></div>`).join('')}</div>
      </div>
      <div class="daemon-note"><span>${t.daemon}</span><span class="nx">${t.next}</span></div>`;
  }
  function weatherBody(){
    const w = W.WEATHER;
    const scene = (root.TravelWindows && root.TravelWindows.sceneSky) ? root.TravelWindows.sceneSky() : sceneSky();
    return `${windowView(scene, '推开窗 · 看外面的天', 200)}
      <div class="wreadout">
        <div class="wtemp">${w.temp}</div>
        <div class="wmeta"><b>${w.cond}</b> · ${w.moon}<br><span class="dim">${w.place}</span><br><span class="dim">${w.detail} · ${w.moonrise}</span></div>
      </div>`;
  }
  function reviewBody(){
    return V.REVIEW.items.slice(0,2).map((it,i)=>{
      const cls=it.speaker==='you'?'her':it.speaker==='kimi'?'kimi':'me';
      let buds=''; for(let k=0;k<5;k++) buds+=M.bud({color:'var(--accent)',filled:k<it.conf,size:13});
      return `<div class="rcard ${cls} ${i>0?'dim':''}" style="padding:16px 16px 13px;margin-bottom:14px">
        <div class="tab" data-cardtab></div>
        <div class="top"><span class="ts">${it.ts}</span><span class="buds">${buds}</span></div>
        <div class="body" style="font-size:13px;line-height:1.65"><span class="who" style="font-size:23px">${it.speaker[0]}</span>${it.body.slice(0,70)}…</div>
        <div class="foot"><span class="pill" style="font-size:11px;padding:4px 12px"><span class="d">·</span>${it.type}</span>
          <div class="acts"><button class="ring seal ok" title="approve" aria-label="approve">${SEAL.check}</button><button class="ring seal edit" title="edit" aria-label="edit">${SEAL.pen}</button><button class="ring seal no" title="reject" aria-label="reject">${SEAL.cross}</button><button class="ring seal back" title="defer" aria-label="defer">${SEAL.back}</button></div></div>
      </div>`;
    }).join('');
  }

  /* ====================== ops panels (GENERIC DEMO) ====================== */
  // tiny hairline-gold connection glyphs
  const CONN_IC = {
    mail:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3.5 7 12 13l8.5-6"/></svg>`,
    chat:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H8l-4 3Z"/><path d="M8 10h8M8 13h5"/></svg>`,
    cloud:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.5A3.5 3.5 0 0 1 17 18Z"/></svg>`,
    cal:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/></svg>`,
    git:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><circle cx="17" cy="9" r="2.4"/><path d="M6 8.4v7.2M17 11.4c0 4-5 1.6-5 4.6"/></svg>`,
    passkey:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M9 12c-3 0-5 2-5 5v1h7"/><path d="M16 11v6M16 13.5h3M16 16h2"/></svg>`,
  };
  const OPS = {
    metrics:[
      {k:'retry',    v:'3',     u:'',    sub:'oldest 6 min',  trend:'up'},
      {k:'errors 7d',v:'12',    u:'',    sub:'-4 vs prior wk',trend:'up'},
      {k:'hit@10',   v:'0.84',  u:'',    sub:'recall, demo',  trend:'up'},
      {k:'memories', v:'1,248', u:'',    sub:'+37 this week',  trend:'up'},
      {k:'cost 7d',  v:'6.20',  u:'$',   sub:'avg 0.89/day',   trend:'down'},
      {k:'sessions', v:'214',   u:'',    sub:'all-time, demo', trend:''},
    ],
    cost:[2,3,5,4,7,3,6],
    conns:[
      {ic:'mail', name:'Mailbox · primary',   sub:'demo@example.com',      st:'ok',  stx:'live'},
      {ic:'chat', name:'Messenger relay',      sub:'bot · 2 channels',      st:'ok',  stx:'live'},
      {ic:'cal',  name:'Calendar sync',        sub:'2 calendars',           st:'ok',  stx:'live'},
      {ic:'cloud',name:'Object storage',       sub:'snapshots · nightly',   st:'warn',stx:'stale'},
      {ic:'git',  name:'Source mirror',        sub:'read-only token',       st:'ok',  stx:'live'},
      {ic:'mail', name:'Mailbox · archive',    sub:'archive@example.com',   st:'off', stx:'paused'},
    ],
    keys:[
      {name:'Laptop · platform',  code:'•••• A1C3', tag:'passkey', sub:'added demo · last used 2d'},
      {name:'Phone · roaming',    code:'•••• 9F2B', tag:'passkey', sub:'added demo · last used 5h'},
      {name:'Hardware token',     code:'•••• 77QX', tag:'security key', sub:'added demo'},
      {name:'Recovery code A',    code:'•••• ABCD', tag:'recovery', sub:'unused'},
      {name:'Recovery code B',    code:'•••• EFGH', tag:'recovery', sub:'unused'},
    ],
  };
  function opsDash(){
    const tiles = OPS.metrics.map(m=>
      `<div class="ops-tile"><div class="ot-k">${m.k}</div>
        <div class="ot-v">${m.v}${m.u?`<span class="u">${m.u}</span>`:''}</div>
        <div class="ot-sub ${m.trend}">${m.sub}</div></div>`).join('');
    const mx=Math.max(...OPS.cost), bars=OPS.cost.map(v=>`<div class="b" style="height:${(v/mx*100).toFixed(0)}%"></div>`).join('');
    const xlab=['mon','tue','wed','thu','fri','sat','sun'].map(d=>`<span>${d}</span>`).join('');
    return `<div class="ops-metrics">${tiles}</div>
      <div class="ops-sec-h">cost · 7 days · demo $</div>
      <div class="ops-bars">${bars}</div><div class="ops-barx">${xlab}</div>`;
  }
  function opsOAuth(){
    const rows = OPS.conns.map(c=>
      `<div class="conn-row"><span class="conn-ic">${CONN_IC[c.ic]||CONN_IC.cloud}</span>
        <div class="conn-main"><div class="conn-name">${c.name}</div><div class="conn-sub">${c.sub}</div></div>
        <span class="conn-st"><span class="st-dot ${c.st==='ok'?'':c.st}"></span>${c.stx}</span></div>`).join('');
    return `<div class="conn-list">${rows}</div>`;
  }
  function opsKeys(){
    const rows = OPS.keys.map(k=>
      `<div class="key-row"><span class="conn-ic">${CONN_IC.passkey}</span>
        <div class="conn-main"><div class="conn-name">${k.name}</div><div class="conn-sub">${k.sub}</div></div>
        <span class="key-code">${k.code}</span><span class="key-tag">${k.tag}</span></div>`).join('');
    return `<div class="key-list">${rows}</div>
      <div class="key-note">demo placeholders only · codes are masked · regenerate before real use</div>`;
  }

  /* ====================== paint ====================== */
  function paint(){
    C.paintOrnaments();
    const accent=C.cssVar('--accent'), hair=C.cssVar('--hair');
    $$('[data-cardtab]').forEach(e=>e.innerHTML=M.cardTab({color:accent}));
    // gilt corner flourishes inside each casement opening
    $$('.view-frame:not(.fwin)').forEach(vf=>{
      if(!$('.crn-fl',vf)){
        vf.insertAdjacentHTML('beforeend',`<span class="crn-fl tl">${M.flourish({color:accent,size:24})}</span><span class="crn-fl tr">${M.flourish({color:accent,size:24})}</span>`);
      }
    });
    // rose boss inside latch
    $$('.latch').forEach(l=>{ const day=document.documentElement.getAttribute('data-theme')==='day'; l.innerHTML = '<img src="assets/'+(day?'rose-window-handle-day.png':'rose-window-handle.png')+'" alt="" style="width:15px;height:42px;object-fit:contain;transform:rotate(20deg);display:block">'; });
  }

  /* ====================== drag ====================== */
  let Z=80;
  function wirePanels(){
    $$('.panel').forEach(p=>{ const h=$('.ph',p); if(!h || h.dataset.wired)return; h.dataset.wired='1';
      let sx,sy,ox,oy,drag=false,chip=null;
      h.addEventListener('pointerdown',e=>{ if(e.target.closest('.latch')||e.target.closest('.reclose')||e.target.closest('.modesw')||e.target.closest('.grip'))return;
        const r=p.getBoundingClientRect();
        if(p.style.position!=='fixed'){p.style.position='fixed';p.style.left=r.left+'px';p.style.top=r.top+'px';p.style.width=r.width+'px';p.style.height=r.height+'px';p.style.margin='0';p.classList.remove('flex');}
        p.style.zIndex=(++Z);drag=true;p.classList.add('dragging');h.setPointerCapture(e.pointerId);
        sx=e.clientX;sy=e.clientY;ox=parseFloat(p.style.left);oy=parseFloat(p.style.top);});
      h.addEventListener('pointermove',e=>{if(!drag)return;p.style.left=(ox+e.clientX-sx)+'px';p.style.top=(oy+e.clientY-sy)+'px';
        const nc=tabChipUnder(e.clientX,e.clientY);
        if(nc!==chip){ if(chip)chip.classList.remove('drop-target'); chip=nc; if(chip)chip.classList.add('drop-target'); }});
      const end=e=>{ if(!drag)return; drag=false;p.classList.remove('dragging');try{h.releasePointerCapture(e.pointerId);}catch(_){}
        if(chip){ const dest=chip.dataset.tab; chip.classList.remove('drop-target');
          if(dest!==activeTab()){ movePanelToTab(p,dest); showTab(dest); } chip=null; } };
      h.addEventListener('pointerup',end);h.addEventListener('pointercancel',end);
    });
  }

  /* ====================== resize (SE handle) ====================== */
  function wireResize(){
    $$('.panel').forEach(p=>{
      if($('.rsz',p)) return;
      const h=document.createElement('div'); h.className='rsz'; p.appendChild(h);
      let sx,sy,sw,sh,rz=false;
      h.addEventListener('pointerdown',e=>{ e.stopPropagation();
        const r=p.getBoundingClientRect();
        if(p.style.position!=='fixed'){p.style.position='fixed';p.style.left=r.left+'px';p.style.top=r.top+'px';p.style.margin='0';p.classList.remove('flex');}
        p.style.width=r.width+'px';p.style.height=r.height+'px';p.style.zIndex=(++Z);
        rz=true;sx=e.clientX;sy=e.clientY;sw=r.width;sh=r.height;h.setPointerCapture(e.pointerId);});
      h.addEventListener('pointermove',e=>{ if(!rz)return; p.style.width=Math.max(220,sw+e.clientX-sx)+'px'; p.style.height=Math.max(120,sh+e.clientY-sy)+'px'; });
      const end=e=>{rz=false;try{h.releasePointerCapture(e.pointerId);}catch(_){}};
      h.addEventListener('pointerup',end);h.addEventListener('pointercancel',end);
    });
  }

  /* ====================== weather pet (frameless hanging svg) ====================== */
  function mountWeatherPet(){
    const el=$('#weather-pet'); if(!el || !root.WeatherOpen) return;
    const w=W.WEATHER, night=document.documentElement.getAttribute('data-theme')!=='day';
    const state=(night && w.moonState) ? w.moonState : (w.state||'sun');
    el.innerHTML=root.WeatherOpen.bare(state);
    const fc=$('#weather-forecast');
    if(fc) fc.innerHTML=`<div class="wf-temp">${w.temp}</div><div class="wf-meta"><b>${w.cond}</b><br>${w.place}<br><span class="dim">${w.detail} · ${w.moonrise}</span></div>`;
  }
  function wireWeatherPet(){
    const el=$('#weather-pet'); if(!el) return;
    el.style.cursor='grab';
    let sx,sy,ox,oy,drag=false,moved=false;
    el.addEventListener('pointerdown',e=>{ drag=true;moved=false;
      const r=el.getBoundingClientRect();
      el.style.right='auto'; el.style.left=r.left+'px'; el.style.top=r.top+'px';
      sx=e.clientX;sy=e.clientY;ox=r.left;oy=r.top; el.setPointerCapture(e.pointerId); el.style.cursor='grabbing'; });
    el.addEventListener('pointermove',e=>{ if(!drag)return; const dx=e.clientX-sx,dy=e.clientY-sy;
      if(Math.abs(dx)+Math.abs(dy)>4) moved=true;
      el.style.left=(ox+dx)+'px'; el.style.top=(oy+dy)+'px'; });
    const end=e=>{ if(!drag)return; drag=false; el.style.cursor='grab'; try{el.releasePointerCapture(e.pointerId);}catch(_){}
      const fc=$('#weather-forecast');
      if(fc && !moved){ const r=el.getBoundingClientRect(); fc.style.right='auto'; fc.style.left=(r.left-60)+'px'; fc.style.top=(r.bottom+8)+'px'; fc.classList.toggle('open'); } };
    el.addEventListener('pointerup',end); el.addEventListener('pointercancel',end);
  }

  /* ====================== frameless floating widgets (radio · portrait) ======
   * Drag mirrors the WORKING #weather-pet: position:fixed in viewport space, so
   * the coordinate base never depends on a shifting offsetParent. On pointerdown
   * we read the element's current bounding rect as the base (bx,by) + the pointer
   * start (sx,sy) and setPointerCapture; on pointermove the new top-left is just
   * bx+(clientX-sx), by+(clientY-sy) — pure viewport math, no double-counted
   * workspace offset (the previous bug). Then we CLAMP into the viewport so the
   * widget can never leave the screen. Drag is skipped when the pointer lands on
   * an interactive control (radio buttons) so play/prev/next still work; those
   * controls also stopPropagation themselves. */
  function wireFloat(el, init){
    if(!el || el.dataset.floatWired) return; el.dataset.floatWired='1';
    // give a sane on-screen start position in fixed/viewport coords, clearing any
    // template left/right/top so the math has a single stable origin.
    el.style.position='fixed';
    el.style.right='auto'; el.style.bottom='auto';
    el.style.left=(init&&init.left!=null?init.left:120)+'px';
    el.style.top =(init&&init.top !=null?init.top :120)+'px';
    el.style.cursor='grab';
    let sx,sy,bx,by,drag=false;
    function clamp(){
      const r=el.getBoundingClientRect();
      const maxL=Math.max(0, innerWidth  - r.width);
      const maxT=Math.max(0, innerHeight - r.height);
      let l=parseFloat(el.style.left)||0, t=parseFloat(el.style.top)||0;
      if(l<0)l=0; if(l>maxL)l=maxL; if(t<0)t=0; if(t>maxT)t=maxT;
      el.style.left=l+'px'; el.style.top=t+'px';
    }
    el.addEventListener('pointerdown',e=>{
      if(e.target.closest('button,a,input,textarea,select')) return; // let controls work
      const r=el.getBoundingClientRect();
      bx=r.left; by=r.top; sx=e.clientX; sy=e.clientY;   // base rect + pointer start (viewport)
      drag=true; el.classList.add('dragging'); el.style.cursor='grabbing';
      try{el.setPointerCapture(e.pointerId);}catch(_){}
    });
    el.addEventListener('pointermove',e=>{ if(!drag)return;
      el.style.left=(bx+e.clientX-sx)+'px'; el.style.top=(by+e.clientY-sy)+'px'; clamp(); });
    const end=e=>{ if(!drag)return; drag=false; el.classList.remove('dragging'); el.style.cursor='grab';
      try{el.releasePointerCapture(e.pointerId);}catch(_){} clamp(); };
    el.addEventListener('pointerup',end); el.addEventListener('pointercancel',end);
    // keep on-screen if the window is resized smaller than the widget's position
    window.addEventListener('resize',clamp);
  }
  function wireFloats(){
    wireFloat($('#comp-radio'),   {left: innerWidth-260, top: 120});
    wireFloat($('#comp-portrait'),{left: 40,             top: 132});
  }

  /* ====================== convo + composer ====================== */
  function setMode(m){ $$('.convo').forEach(c=>{c.classList.remove('mode-bubble','mode-term');c.classList.add('mode-'+m);});
    $$('.modesw button').forEach(b=>b.classList.toggle('on',b.dataset.mode===m)); }
  function wireConvo(){
    $$('.composer').forEach(c=>{
      const ta=$('textarea',c),send=$('.send',c),mic=$('.mic',c),thread=c.closest('.convo').querySelector('.thread');
      const grow=()=>{ta.style.height='auto';ta.style.height=Math.min(96,ta.scrollHeight)+'px';};
      ta.addEventListener('input',grow);
      const doSend=()=>{const v=ta.value.trim();if(!v)return;
        thread.insertAdjacentHTML('beforeend',`<div class="msg you"><div class="ava">u</div><div class="bub">${v.replace(/</g,'&lt;')}<span class="t">now</span></div></div>`);
        ta.value='';grow();thread.scrollTop=thread.scrollHeight;
        setTimeout(()=>{thread.insertAdjacentHTML('beforeend',`<div class="msg kimi"><div class="ava">k</div><div class="bub">在。<span class="caret"></span><span class="t">now</span></div></div>`);thread.scrollTop=thread.scrollHeight;},700);};
      send.onclick=doSend;ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();doSend();}});
      mic.onclick=()=>mic.classList.toggle('rec');
    });
    $$('.modesw button').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
  }

  /* ====================== workspace tabs ====================== */
  const TABS = ['atelier','ops','cabinet','alcove'];
  function activeTab(){ return $('.ws.on')?.dataset.tab || 'atelier'; }
  function showTab(name){
    if(!TABS.includes(name)) name='atelier';
    $$('.ws').forEach(w=>w.classList.toggle('on', w.dataset.tab===name));
    $$('.tabs .tab').forEach(t=>t.classList.toggle('on', t.dataset.tab===name));
    try{ localStorage.setItem('cc-gild-tab', name); }catch(_){}
    const brand=$('.menubar .brand .mk'); if(brand) brand.textContent='// '+name;
    document.title='cc-gild v5 · '+name;
  }
  function wireTabs(){
    $$('.tabs .tab').forEach(t=>t.addEventListener('click',()=>showTab(t.dataset.tab)));
    showTab(localStorage.getItem('cc-gild-tab')||'atelier');
  }

  /* ====================== mount comp panels ====================== */
  function mountComps(){
    const map=['calendar','sky','opus','sleep','disc','study','finance','radio','portrait','desk'];
    map.forEach(name=>{
      const el=$('#comp-'+name);
      if(el && root.Comp && typeof root.Comp[name]==='function'){
        try{ root.Comp[name](el); }catch(err){ console.error('comp '+name+' failed',err); }
      }
    });
  }

  /* ====================== drag panel → tab chip ====================== */
  // Called from within wirePanels' pointer handlers. Tracks the chip under the
  // pointer during a titlebar drag; on release, moves the panel into that tab.
  function tabChipUnder(x,y){
    const elu=document.elementFromPoint(x,y);
    return elu ? elu.closest('.tabs .tab') : null;
  }
  function movePanelToTab(panel, tabName){
    const ws=$(`.ws[data-tab="${tabName}"]`); if(!ws) return;
    // pick a column to drop into (prefer center, fall back to first .col)
    const target = ws.querySelector('.col.center') || ws.querySelector('.col') || ws.querySelector('.grid') || ws;
    // reset any fixed positioning so it flows into the column again
    panel.style.position=''; panel.style.left=''; panel.style.top='';
    panel.style.width=''; panel.style.height=''; panel.style.margin=''; panel.style.zIndex='';
    target.appendChild(panel);
  }

  /* ====================== data render (re-runnable) ====================== */
  function renderData(){
    const pn=$('#pf-name'); if(pn) pn.textContent=D.STATE.profile.name;
    const ps=$('#pf-sub'); if(ps) ps.textContent=D.STATE.profile.sub;
    $('#v4-score').innerHTML=`<div class="score">${C.buildScoreSVG()}</div>${C.scoreLegend()}`;
    $('#thread').innerHTML=C.threadHTML();
    $('#convo-term').innerHTML=C.termHTML();
    $('#travel-body').innerHTML=travelBody();
    mountWeatherPet();
    $('#review-body').innerHTML=reviewBody();
    const tstat=$('#tstat'); if(tstat) tstat.textContent=W.TRAVEL.status;
    // ops panels (read local demo OPS for now — contract reserved in state schema)
    const od=$('#ops-dash'); if(od) od.innerHTML=opsDash();
    const oa=$('#ops-oauth'); if(oa) oa.innerHTML=opsOAuth();
    const ok=$('#ops-keys'); if(ok) ok.innerHTML=opsKeys();
  }

  /* ====================== real-data seam ======================
   * Public build ships the inlined placeholder (data.js / v4-data.js / v2-data.js).
   * With NO ?state=, nothing is fetched — the demo renders as-is (open-source safe,
   * works under file://). A private deploy passes ?state=<endpoint> (or sets
   * localStorage 'cc-gild-state-url') to fetch real data shaped per STATE-SCHEMA.md;
   * the placeholder is always the fallback. ?events=<sse-url> subscribes for
   * push-on-change reactivity (re-fetch + re-render the rooms). Schema: STATE-SCHEMA.md. */
  const PARAMS = new URLSearchParams(location.search);
  const STATE_URL  = PARAMS.get('state')  || localStorage.getItem('cc-gild-state-url')  || '';
  function applyState(s){
    if(!s || typeof s!=='object') return;
    if(s.moonPhase!=null) D.STATE.moonPhase=s.moonPhase;
    if(s.profile) Object.assign(D.STATE.profile, s.profile);
    if(Array.isArray(s.score))  D.SCORE.splice(0, D.SCORE.length, ...s.score);
    if(Array.isArray(s.thread)) D.THREAD.splice(0, D.THREAD.length, ...s.thread);
    if(Array.isArray(s.term))   D.TERM.splice(0, D.TERM.length, ...s.term);
    if(s.travel)  Object.assign(W.TRAVEL,  s.travel);
    if(s.weather) Object.assign(W.WEATHER, s.weather);
    if(s.review && Array.isArray(s.review.items)) V.REVIEW.items = s.review.items;
    // ops dashboard (metrics / cost / conns / keys)
    if(s.ops){ ['metrics','cost','conns','keys'].forEach(k=>{ if(s.ops[k]!=null) OPS[k]=s.ops[k]; }); }
    // cabinet/alcove comps with a real source: sleep / study / finance.
    // each comp reads window.CC_COMP.<name>.<field> at mount, falling back to its demo.
    // decorative comps (disc/radio/sky/opus/portrait/desk) + stateful calendar stay demo.
    if(s.comps){ root.CC_COMP=root.CC_COMP||{};
      Object.keys(s.comps).forEach(k=>{ root.CC_COMP[k]=Object.assign(root.CC_COMP[k]||{}, s.comps[k]); }); }
  }
  async function loadData(){
    if(!STATE_URL) return;                       // demo: keep inlined placeholder
    try{
      const r = await fetch(STATE_URL, {cache:'no-store'});
      if(!r.ok) throw 0;
      applyState(await r.json());
      renderData(); mountComps(); paint();
    }catch(e){ /* any failure → keep placeholder, never blank */ }
  }
  // live state over WebSocket — the real-time path when served by server.mjs.
  // server pushes the initial snapshot + re-pushes on change (DB events in Stage 2).
  // Default to same-host /state; override with ?statews=. Under file:// or when no
  // server answers, this no-ops and the inlined placeholder (or ?state=) stands.
  function applyAndRender(s){ applyState(s); renderData(); mountComps(); paint(); }
  function connectStateWS(){
    let url = PARAMS.get('statews');
    if(!url){
      if(location.protocol==='file:') return;
      url = (location.protocol==='https:'?'wss':'ws')+'://'+location.host+'/state';
    }
    try{
      const ws = new WebSocket(url);
      ws.onmessage = ev => { try{ applyAndRender(JSON.parse(ev.data)); }catch(e){} };
      ws.onerror   = () => { try{ ws.close(); }catch(_){} };
      root.__ccStateWS = ws;
    }catch(e){}
  }

  /* ====================== init ====================== */
  function init(){
    C.applyTheme(localStorage.getItem('cc-gild-theme')||'night');
    renderData();
    // mount the 9 comp panels into cabinet / alcove
    mountComps();
    wireTabs();
    paint(); wirePanels(); wireResize(); wireConvo(); wireWeatherPet(); wireFloats(); setMode('bubble');
    loadData(); connectStateWS();    // real-data seam: ?state= HTTP (one-shot) · /state WS (live push)

    // casement open/close
    document.addEventListener('click',e=>{
      if(e.target.closest('.latch')){e.target.closest('.casement').classList.add('open');syncWinBtn();return;}
      if(e.target.closest('.reclose')){e.target.closest('.casement').classList.remove('open');syncWinBtn();return;}
      const vf=e.target.closest('.view-frame'); if(vf&&!vf.closest('.casement').classList.contains('open')&&!e.target.closest('.latch')){vf.closest('.casement').classList.add('open');syncWinBtn();return;}
      if(e.target.closest('.tool')){e.target.closest('.tool').classList.toggle('open');}
      const ring=e.target.closest('.ring'); if(ring){const card=ring.closest('.rcard'); if(card){card.style.transition='.3s';card.style.opacity='.25';}}
    });

    // 开窗 master switch
    const ws=$('#winsw');
    ws.onclick=()=>{ const anyClosed=$$('.casement').some(c=>!c.classList.contains('open'));
      $$('.casement').forEach(c=>c.classList.toggle('open',anyClosed)); syncWinBtn(); };
    function syncWinBtn(){ const allOpen=$$('.casement').every(c=>c.classList.contains('open'));
      ws.querySelector('.tx').textContent=allOpen?'闭窗':'开窗'; ws.querySelector('.ic').textContent=allOpen?'▤':'⊟'; }
    root.__syncWinBtn=syncWinBtn;

    // theme
    $$('[data-theme-toggle]').forEach(b=>b.onclick=()=>{const next=document.documentElement.getAttribute('data-theme')==='night'?'day':'night';
      C.applyTheme(next);$('#v4-score').innerHTML=`<div class="score">${C.buildScoreSVG()}</div>${C.scoreLegend()}`;paint();mountWeatherPet();b.textContent=next==='night'?'夜':'昼';});
    $$('[data-theme-toggle]').forEach(b=>b.textContent=(localStorage.getItem('cc-gild-theme')||'night')==='night'?'夜':'昼');

    // clock
    const clock=()=>{const d=new Date();const t=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');$$('[data-clock]').forEach(e=>e.textContent=t);};
    clock();setInterval(clock,15000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})(window);
