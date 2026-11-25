
/* ================= 청문회: 증거 제시 ================= */
let hearIdx = 0;
function startHearing(){ hearIdx = Math.min(hearIdx, HEAR.rounds.length);
  if(hearIdx===0&&!flags.hearOpen){ flags.hearOpen=true; say(HEAR.open, ()=>hearRound()); } else hearRound(); }
function hearRound(){ const r=HEAR.rounds[hearIdx]; if(!r) return hearEnd(); say(r.claim, ()=>hearPresent()); }
function hearPresent(){ const r=HEAR.rounds[hearIdx];
  const cards=inv.map(k=>`<button type="button" class="ev" data-k="${k}"><b>${ITEMS[k].n}</b><small>${ITEMS[k].d.slice(0,46)}${ITEMS[k].d.length>46?'…':''}</small></button>`).join('');
  openModal(`<div class="eb">청문회 · ${hearIdx+1} / ${HEAR.rounds.length}</div><h2>${r.who}의 주장</h2><blockquote class="claim">“${r.sum}”</blockquote><p>${r.ask||'이 주장을 뒤집을 증거를 내미세요.'}</p><div class="evid" id="evid">${cards||'<p class="src">가진 증거가 없습니다.</p>'}</div><p id="lockmsg" class="src" role="status">틀린 증거를 내밀면 20초가 줄어듭니다.</p><div class="row"><button class="ghost" data-close type="button">증거를 더 찾아오겠소 (잠시 휴정)</button></div>`);
  $('evid').onclick=e=>{ const b=e.target.closest('.ev'); if(!b) return; const k=b.dataset.k; $('modal').hidden=true;
    if(r.ok.includes(k)){ blip(880,.12,'square',.12); blip(1320,.3,'sine',.14,.1); const flash=$('fade'); flash.style.background='#fff'; flash.style.opacity='.85'; setTimeout(()=>{ flash.style.opacity='0'; setTimeout(()=>flash.style.background='',400); },120);
      say([['조사관','이의 있습니다!',420]].concat(r.win[k]||r.win._), ()=>{ hearIdx++; hearRound(); }); }
    else { miss++; timeLeft=Math.max(0,timeLeft-20); hud(); blip(160,.35,'sawtooth',.12);
      say([[r.who,(r.lose&&r.lose[k])||r.no||'그게 이 일과 무슨 상관이오? 다시 생각해 보시오.',r.p||250]], ()=>hearPresent()); } }; }
function hearEnd(){ finished=true; hud(); blip(520,.1); blip(660,.1,'sine',.15,.1); blip(880,.4,'sine',.15,.2); say(HEAR.end, verdict); }
