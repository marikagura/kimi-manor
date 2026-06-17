// weather-open.js — expanded Art-Nouveau weather charms for cc-gild.
// Builds on the 焰章 flame language but adds: open (un-ringed) presentation,
// true MOON PHASES (new→full→waning), and a WIND family (breeze/gale/typhoon).
// Each glyph can be shown framed (焰章) or open (开焰). Reuses page anim classes.
(function (root) {
  const C = 60, Y = 112, f = n => (+n).toFixed(1);

  function petal(cx, cy, a, r1, r2, w, fill, op){
    const ax=Math.cos(a), ay=Math.sin(a), px=-ay, py=ax, rm=(r1+r2)/2;
    const bx=cx+ax*r1, by=cy+ay*r1, tx=cx+ax*r2, ty=cy+ay*r2;
    return `<path d="M${f(bx)} ${f(by)} Q${f(cx+ax*rm+px*w)} ${f(cy+ay*rm+py*w)} ${f(tx)} ${f(ty)} Q${f(cx+ax*rm-px*w)} ${f(cy+ay*rm-py*w)} ${f(bx)} ${f(by)} Z" fill="${fill}"${op?` opacity="${op}"`:''}/>`;
  }
  function pearls(cx, cy, r, n, rr=0.8){ let s=''; for(let k=0;k<n;k++){const a=k*2*Math.PI/n;s+=`<circle cx="${f(cx+Math.cos(a)*r)}" cy="${f(cy+Math.sin(a)*r)}" r="${rr}" fill="currentColor"/>`;} return s; }
  function spark(x, y, r, col, d){ return `<g class="tw" style="--d:${d||0}s">${petal(x,y,-Math.PI/2,0,r,r*0.4,col)}${petal(x,y,0,0,r,r*0.4,col)}${petal(x,y,Math.PI/2,0,r,r*0.4,col)}${petal(x,y,Math.PI,0,r,r*0.4,col)}</g>`; }
  function rose(cx, cy, r, col){ return `<g style="color:${col}" stroke="currentColor" fill="none" stroke-width="1.1"><circle cx="${cx}" cy="${cy}" r="${r}" opacity=".5"/><path d="M${cx-r*0.5} ${cy+r*0.25} Q${cx} ${cy-r*0.8} ${cx+r*0.5} ${cy+r*0.25} Q${cx} ${cy+r*0.6} ${cx-r*0.5} ${cy+r*0.25} Z"/><path d="M${cx-r*0.7} ${cy-r*0.1} Q${cx} ${cy+r*0.7} ${cx+r*0.7} ${cy-r*0.1}" opacity=".7"/></g>`; }
  function leaf(cx, cy, a, len, col){ const ax=Math.cos(a), ay=Math.sin(a), px=-ay, py=ax, tx=cx+ax*len, ty=cy+ay*len; return `<path d="M${f(cx)} ${f(cy)} Q${f(cx+ax*len*0.5+px*len*0.4)} ${f(cy+ay*len*0.5+py*len*0.4)} ${f(tx)} ${f(ty)} Q${f(cx+ax*len*0.5-px*len*0.4)} ${f(cy+ay*len*0.5-py*len*0.4)} ${f(cx)} ${f(cy)} Z" fill="none" stroke="${col}" stroke-width="1"/>`; }
  function scrollCloud(cx, cy, col){ return `<path d="M${cx-24} ${cy+6} q-8 0 -8 -7 q0 -7 8 -7 q-1 -7 7 -9 q-9 -6 -16 2 M${cx-24} ${cy-8} q1 -11 14 -11 q11 0 13 10 q8 -3 13 4 q10 0 10 9 q0 9 -10 9 q4 7 -3 10 q-7 2 -9 -4" fill="none" stroke="${col}" stroke-width="1.3" stroke-linecap="round"/>`; }

  /* ---------- sun ---------- */
  function gSun(t='#e6c98a'){
    let rays=''; for(let k=0;k<16;k++){const a=k*Math.PI/8; rays+=petal(C,Y,a,17,k%2?33:27,2.4,t,k%2?.92:.7);}
    let core=''; for(let k=0;k<8;k++){core+=petal(C,Y,k*Math.PI/4,2,12,3.4,t,.55);}
    return `<g style="color:${t}"><g class="spin" style="transform-origin:${C}px ${Y}px">${rays}</g><g opacity=".85">${pearls(C,Y,15,16)}</g>${core}<circle cx="${C}" cy="${Y}" r="4.5" fill="${t}"/><circle class="pulse" cx="${C}" cy="${Y}" r="38" fill="${t}" opacity=".06" style="transform-origin:${C}px ${Y}px"/></g>`;
  }

  /* ---------- moon phases (true illumination) ---------- */
  // phase 0=new, .25=first quarter, .5=full, .75=last quarter, 1=new
  function gMoon(phase, t='#e6d4ac'){
    const R=20, cx=C, cy=Y;
    const cosV=Math.cos(2*Math.PI*phase), rx=Math.abs(cosV)*R, waxing=phase<0.5;
    const so=waxing?0:1, si=((cosV>=0)===waxing)?1:0;
    const shadow=`M ${cx} ${cy-R} A ${R} ${R} 0 0 ${so} ${cx} ${cy+R} A ${rx} ${R} 0 0 ${si} ${cx} ${cy-R} Z`;
    const isNew=phase<0.04||phase>0.96;
    let st=''; [[34,84,0],[88,92,0.5],[40,142,1],[86,138,0.3]].forEach((p,i)=>{st+=spark(p[0],p[1],3.4,t,p[2]);});
    const vine=`<path d="M${cx-20} ${cy+20} Q${cx-28} ${cy+6} ${cx-18} ${cy-4}" fill="none" stroke="${t}" stroke-width="0.9" opacity=".55"/>${rose(cx-20,cy+22,4.5,t)}`;
    return `<g style="color:${t}">
      <circle class="pulse" cx="${cx}" cy="${cy}" r="${R+6}" fill="${t}" opacity="${isNew?0.03:0.09}" style="transform-origin:${cx}px ${cy}px"/>
      ${isNew?`<circle cx="${cx}" cy="${cy}" r="${R}" fill="${t}" opacity=".05"/>`:`<circle cx="${cx}" cy="${cy}" r="${R}" fill="${t}" opacity=".9"/><path d="${shadow}" fill="#0c0906"/>`}
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="currentColor" stroke-width="1.3"/>
      <g opacity=".7">${pearls(cx,cy,R+4,28,0.6)}</g>
      ${vine}${st}</g>`;
  }

  /* ---------- rain / snow / cloud / storm / fog / frost ---------- */
  function gRain(t='#9bb6cc'){ let dr=''; for(let i=0;i<4;i++){const x=C-15+i*10;dr+=`<g class="drop" style="--d:${i*0.3}s">${petal(x,Y+14,Math.PI/2,0,7,2,t)}</g>`;} return `<g>${scrollCloud(C,Y-10,'#aebccb')}<g style="color:${t}">${dr}</g></g>`; }
  function gSnow(t='#cdd8e2'){ let arms=''; for(let k=0;k<6;k++){const a=k*Math.PI/3;arms+=petal(C,Y,a,0,20,2.2,t,.9);arms+=`<line x1="${f(C+Math.cos(a)*12)}" y1="${f(Y+Math.sin(a)*12)}" x2="${f(C+Math.cos(a-0.4)*17)}" y2="${f(Y+Math.sin(a-0.4)*17)}" stroke="${t}" stroke-width="0.9"/><line x1="${f(C+Math.cos(a)*12)}" y1="${f(Y+Math.sin(a)*12)}" x2="${f(C+Math.cos(a+0.4)*17)}" y2="${f(Y+Math.sin(a+0.4)*17)}" stroke="${t}" stroke-width="0.9"/>`;} return `<g class="spin" style="transform-origin:${C}px ${Y}px;color:${t}">${arms}<circle cx="${C}" cy="${Y}" r="3.5" fill="${t}"/></g>`; }
  function gCloud(){ return `<g class="drift">${scrollCloud(C,Y,'#c9c2b0')}</g>`; }
  function gStorm(t='#e6c98a'){ let dr=''; for(let i=0;i<3;i++){dr+=`<g class="drop" style="--d:${i*0.3}s">${petal(C-12+i*8,Y+16,Math.PI/2,0,6,1.8,'#8f9ec0')}</g>`;} return `<g>${scrollCloud(C,Y-10,'#a99fc0')}<path class="flash" d="M${C+3} ${Y+2} L${C-7} ${Y+16} L${C} ${Y+16} L${C-5} ${Y+30} L${C+12} ${Y+10} L${C+4} ${Y+10} Z" fill="${t}"/>${dr}</g>`; }
  function gFog(){ let ln=''; for(let i=0;i<4;i++){const y=Y-14+i*10;ln+=`<path class="fog" style="--d:${i*0.6}s" d="M${C-26} ${y} q8 -5 16 0 q8 5 16 0 q8 -5 14 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="${0.9-i*0.12}"/>`;} return `<g style="color:#b6ada0">${ln}</g>`; }
  function gFrost(t='#bcd0d8'){ let arms=''; for(let k=0;k<6;k++){const a=-Math.PI/2+k*Math.PI/3;arms+=`<line x1="${C}" y1="${Y}" x2="${f(C+Math.cos(a)*20)}" y2="${f(Y+Math.sin(a)*20)}" stroke="${t}" stroke-width="1"/>${petal(C+Math.cos(a)*20,Y+Math.sin(a)*20,a,0,4,1.4,t)}`;} return `<g>${arms}${spark(C,Y,5,t,0)}</g>`; }

  /* ---------- winds: breeze / gale / typhoon ---------- */
  function whip(cx, cy, len, curl, col, sw){ return `<path d="M${cx} ${cy} q${len*0.5} -6 ${len} -1 q${curl} 5 ${curl*0.3} ${curl} q-${curl*0.6} 4 -${curl*0.8} -2" fill="none" stroke="${col}" stroke-width="${sw||1.4}" stroke-linecap="round"/>`; }
  function gBreeze(t='#9bb08a'){ return `<g class="drift" style="color:${t}">${whip(28,Y-10,42,8,t,1.3)}${whip(28,Y+6,52,9,t,1.4)}<g class="leaf" style="transform-origin:88px ${Y-2}px">${petal(88,Y-4,Math.PI*0.2,0,8,3,t)}</g></g>`; }
  function gGale(t='#8a9b7a'){ let leaves=''; [[86,Y-18,0.1],[92,Y+2,0.5],[80,Y+18,0.8]].forEach((p,i)=>{leaves+=`<g class="leaf" style="--d:${p[2]}s;transform-origin:${p[0]}px ${p[1]}px">${petal(p[0],p[1],Math.PI*0.15,0,9,3.2,t)}</g>`;}); return `<g class="drift" style="color:${t};animation-duration:2.6s">${whip(22,Y-22,58,12,t,1.5)}${whip(20,Y-6,66,13,t,1.6)}${whip(24,Y+12,60,12,t,1.5)}${leaves}</g>`; }
  function spiral(cx, cy, turns, rmax, col, sw){ let d=`M ${cx} ${cy}`; const steps=Math.round(turns*26); for(let i=1;i<=steps;i++){const tt=i/steps, r=rmax*tt, ang=tt*turns*2*Math.PI; d+=` L${f(cx+r*Math.cos(ang))} ${f(cy+r*Math.sin(ang))}`;} return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw||1.4}" stroke-linecap="round"/>`; }
  function gTyphoon(t='#8fb0b4'){
    let pet=''; for(let k=0;k<3;k++){const a=k*2*Math.PI/3, r=30; pet+=petal(C+Math.cos(a)*r,Y+Math.sin(a)*r,a+1.4,0,9,3,t,.85);}
    return `<g style="color:${t}"><g class="spin-fast" style="transform-origin:${C}px ${Y}px">${spiral(C,Y,2.4,30,t,1.5)}${spiral(C,Y,2.4,30,t,1.1).replace('M '+C,'M '+C)}<g transform="rotate(180 ${C} ${Y})">${spiral(C,Y,2.4,26,t,1.2)}</g>${pet}</g><circle cx="${C}" cy="${Y}" r="5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="${C}" cy="${Y}" r="2" fill="${t}"/></g>`;
  }

  const TINT = { sun:'#e6c98a',rain:'#9bb6cc',snow:'#cdd8e2',cloud:'#c9c2b0',storm:'#e6c98a',fog:'#b6ada0',frost:'#bcd0d8',breeze:'#9bb08a',gale:'#8a9b7a',typhoon:'#8fb0b4' };
  const PHASE = { new:0.0, cres:0.14, first:0.25, gib:0.37, full:0.5, last:0.75, wane:0.88 };

  function glyph(state){
    if (state.indexOf('moon_')===0) return gMoon(PHASE[state.slice(5)] ?? 0.5);
    switch(state){
      case 'sun':return gSun(); case 'rain':return gRain(); case 'snow':return gSnow();
      case 'cloud':return gCloud(); case 'storm':return gStorm(); case 'fog':return gFog(); case 'frost':return gFrost();
      case 'breeze':return gBreeze(); case 'gale':return gGale(); case 'typhoon':return gTyphoon();
      default:return gSun();
    }
  }

  function mount(inner){
    return `<svg viewBox="0 0 120 190" class="pet" aria-hidden="true">
      <circle cx="60" cy="11" r="5.5" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="60" cy="11" r="1.7" fill="currentColor"/>
      <path d="M55 12 Q49 11 47 5 Q53 7 56 12" fill="none" stroke="currentColor" stroke-width="0.8" opacity=".8"/><path d="M65 12 Q71 11 73 5 Q67 7 64 12" fill="none" stroke="currentColor" stroke-width="0.8" opacity=".8"/>
      <g class="sway"><line x1="60" y1="15" x2="60" y2="50" stroke="currentColor" stroke-width="0.9" opacity=".7"/>
        <path d="M57 50 Q60 47 63 50 Q60 58 57 50 Z" fill="currentColor" opacity=".7"/><line x1="60" y1="56" x2="60" y2="66" stroke="currentColor" stroke-width="0.8" opacity=".6"/>
        ${inner}</g></svg>`;
  }

  // framed 焰章 (ring + pearls + rose crown)
  function flame(state){
    return mount(`<g style="color:var(--accent)">${glyph(state)}
      <circle cx="${C}" cy="${Y}" r="42" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".7"/>
      <circle cx="${C}" cy="${Y}" r="45" fill="none" stroke="currentColor" stroke-width="0.5" opacity=".4"/>
      <g opacity=".6">${pearls(C,Y,42,32,0.7)}</g>${rose(C,72,5.5,'var(--accent)')}
      ${leaf(52,76,Math.PI*0.85,9,'var(--accent)')}${leaf(68,76,Math.PI*0.15,9,'var(--accent)')}</g>`);
  }
  // open 开焰 (no ring — airy, like the vine)
  function open(state){
    return mount(`<g style="color:var(--accent)">${glyph(state)}
      <path d="M40 150 Q60 144 80 150" fill="none" stroke="currentColor" stroke-width="0.7" opacity=".5"/>
      ${rose(60,154,4.5,'var(--accent)')}${leaf(50,152,Math.PI*0.9,8,'var(--accent)')}${leaf(70,152,Math.PI*0.1,8,'var(--accent)')}</g>`);
  }

  // bare glyph — no thread, no sway, just the weather motif (keeps its own anim)
  function bare(state){
    return `<svg viewBox="16 68 88 88" class="pet" aria-hidden="true"><g style="color:var(--accent)">${glyph(state)}</g></svg>`;
  }

  root.WeatherOpen = {
    flame, open, glyph, bare,
    phases: [{k:'moon_new',cn:'新月',en:'New'},{k:'moon_cres',cn:'蛾眉月',en:'Crescent'},{k:'moon_first',cn:'上弦',en:'First Qtr'},{k:'moon_gib',cn:'盈凸',en:'Gibbous'},{k:'moon_full',cn:'满月',en:'Full'},{k:'moon_last',cn:'下弦',en:'Last Qtr'},{k:'moon_wane',cn:'残月',en:'Waning'}],
    winds:  [{k:'breeze',cn:'微风',en:'Breeze'},{k:'gale',cn:'大风',en:'Gale'},{k:'typhoon',cn:'台风',en:'Typhoon'}],
    skies:  [{k:'sun',cn:'晴',en:'Clear'},{k:'cloud',cn:'多云',en:'Cloud'},{k:'rain',cn:'雨',en:'Rain'},{k:'storm',cn:'雷雨',en:'Storm'},{k:'snow',cn:'雪',en:'Snow'},{k:'fog',cn:'雾',en:'Fog'},{k:'frost',cn:'霜',en:'Frost'}],
  };
})(window);
