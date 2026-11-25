/* ================= 게임 상태 ================= */
const TIME_LIMIT = 900;
let inv = [], flags = {}, paused = true, started = false, timeLeft = TIME_LIMIT, miss = 0, hints = 0, finished = false, searching = null, timeUpSaid = false;
const $ = id => document.getElementById(id);
const ITEMS = {
  clock:{n:'멈춘 벽시계', d:'선원실 벽에서 떨어진 시계. 유리가 깨졌고, 바늘이 5시 10분에 멈춰 있다. 굉음이 난 시각이다.'},
  torch:{n:'손전등', d:'시험소 기사의 손전등. 새벽 어둠과 서리 속에서도 파단면을 비출 수 있다.'},
  weather:{n:'기상 기록', d:'밤사이 기온이 계속 내려가 새벽 5시 무렵 영하 3도로 가장 추웠다. 전날 낮에는 영상 8도였다. 강물은 4도 안팎.', recon:true},
  path:{n:'균열 경로', d:'균열은 3번 화물창 사각 모서리에서 출발해 갑판을 가로지르고, 양쪽 옆판을 타고 내려가 바닥판 앞에서 멈췄다. 용접선을 따라가지 않고 강판 한가운데를 가로질렀다.'},
  weld:{n:'용접부 메모', d:'용접 비드에 기공과 언더컷이 몇 군데 있다. 그러나 균열은 용접부에서 시작하지 않았고, 용접 이음을 만나도 멈추지 않고 건너갔다.'},
  sketch:{n:'파단면 스케치', d:'V자 무늬의 꼭짓점이 모두 한쪽 끝, 3번 화물창 모서리 쪽을 가리킨다. 면은 평평하게 반짝이고 휜 흔적이 없다. 강판이 늘어나지 않고 단번에 깨졌다.'},
  charpy:{n:'충격 시험 결과', d:'같은 강재가 영상 20도 이상에서는 크게 휘며 충격을 흡수했다. 영상 10도 아래로 내려가자 흡수 에너지가 급격히 줄었고, 0도 아래에서는 휘지 않고 반짝이는 면을 남기며 두 동강 났다.', recon:true},
  tensile:{n:'인장 시험 결과', d:'상온에서 매끈한 봉 시편을 당기면 강도도 늘어남도 정상이다. 이 시험만으로는 강재의 문제가 드러나지 않는다.', recon:true},
  rivet:{n:'리벳공의 말', d:'같은 제철소 강판으로 지은 리벳선은 금이 가도 판 하나에서 멈췄다. 판과 판 사이 이음매가 균열을 끊는다. 용접한 배는 통째로 한 장짜리 강판과 같다.'},
  record:{n:'리벳선 비교 기록', d:'같은 강재로 지은 리벳 이음 선박에서는 선체를 가로지르는 균열이 보고되지 않았다. 용접 선박의 심각한 균열은 대부분 겨울, 찬 바다에서 일어났다.', recon:true},
  design:{n:'설계 검토 메모', d:'화물창 입구의 각진 모서리에 응력이 몰린다. 모서리를 둥글게 깎고, 갑판과 옆판에 균열을 멈출 리벳 띠를 덧대자. 강재는 낮은 온도에서 충격 시험을 해서 고르자.', recon:true}
};
const has = k => inv.includes(k);
function give(k){ const ks=[].concat(k).filter(x=>!has(x)); if(!ks.length) return; inv.push(...ks); hud(); blip(660,.16); blip(990,.3,'sine',.16,.12);
  openModal(`<div class="eb">획득</div>`+ks.map(x=>`<h2>${ITEMS[x].n}${ITEMS[x].recon?'<span class="tag">재구성</span>':''}</h2><p>${ITEMS[x].d}</p>`).join('')+`<div class="row"><button data-close type="button">계속</button></div>`); }
function goalText(){
  if(!flags.witness) return '부두의 당직 선원에게 어젯밤 일을 들어 보세요.';
  if(!has('torch')&&!flags.toolbox) return has('clock') ? '시험소 공구함을 여세요. 번호는 굉음이 난 시각 네 자리입니다.' : '갑판으로 올라가 갈라진 틈 근처에서 선원실 벽시계를 찾으세요.';
  if(!flags.origin) return '갈라진 틈 옆 시편 탁자에서 파단면을 손전등으로 비추고, 균열이 시작된 곳을 짚으세요.';
  if(!flags.charpy) return '시험소의 진자 충격 시험기로 온도를 바꿔 가며 강재를 쳐 보세요.';
  if(!flags.chest) return '갑판 위 조선소 감독 곁의 증거 서류함을 여세요. 균열이 지나간 길을 알아야 합니다.';
  return '부두의 조사위원회 사무실 앞에서 청문회를 여세요. 감독과 제철소의 주장을 증거로 뒤집어야 합니다.'; }
const fmt = s => { s=Math.max(0,Math.ceil(s)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };
function hud(){
  $('timer').textContent = fmt(timeLeft); $('timer').classList.toggle('low', timeLeft<120);
  $('miss').textContent = miss; $('goal').textContent = goalText();
  $('inv').innerHTML = inv.length ? inv.map(k=>`<span class="chip">${ITEMS[k].n}</span>`).join('') : '<span class="chip empty">소지품 없음</span>'; }
function openModal(html){ $('mcard').innerHTML = html; $('modal').hidden = false; paused = true; keys = {}; const b=$('mcard').querySelector('button'); if(b) b.focus(); }
function closeModal(){ $('modal').hidden = true; paused = false; $('gl').focus(); if(pendingPost){ sub(pendingPost,'조사관'); pendingPost=null; } }
$('modal').addEventListener('click', e=>{ if(e.target.dataset.close!==undefined) closeModal(); });
function penalty(sec, msg){ miss++; timeLeft=Math.max(0,timeLeft-sec); hud(); blip(160,.35,'sawtooth',.12); const c=$('mcard'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); if(msg){ const w=$('lockmsg'); if(w) w.textContent=msg; } }
function showNote(){
  openModal(`<div class="eb">조사 수첩</div><h2>소지품과 단서 ${inv.length}개</h2><ul class="clues">`+
    (inv.length?inv.map(k=>`<li><b>${ITEMS[k].n}</b><br>${ITEMS[k].d}</li>`).join(''):'<li>아직 모은 것이 없습니다.</li>')+`</ul><p class="src">지금 할 일: ${goalText()}</p><div class="row"><button data-close type="button">닫기</button></div>`); }
function showHelp(){
  openModal(`<div class="eb">조작법</div><h2>현장을 돌아다니는 방법</h2><p><b>키보드</b>: WASD나 방향키로 이동, Shift 달리기, Space 점프, E 조사·대화·사용, N 수첩, H 힌트.</p><p><b>시점</b>: 화면을 드래그하면 돌아가고 휠로 거리를 조절합니다.</p><p><b>터치</b>: 왼쪽 아래 스틱으로 이동, 오른쪽 아래 버튼으로 점프와 조사.</p><p><b>길</b>: 배 위로는 부두 가운데의 현문 사다리로 올라갑니다. 갈라진 틈과 부두 끝은 조심하세요.</p><p><b>규칙</b>: 제한 시간 15분. 자물쇠를 틀리거나 힌트를 보면 시간이 줄어듭니다. 시간이 다 돼도 계속할 수 있지만 점수가 낮아집니다.</p><p class="src">인물, 소품 3D 모델: Quaternius (CC0). 엔진: three.js. 글꼴: Noto Serif KR, Pretendard (SIL Open Font License 1.1).</p><div class="row"><button data-close type="button">닫기</button></div>`); }
function showHint(){ if(finished) return;
  openModal(`<div class="eb">힌트</div><h2>힌트를 볼까요?</h2><p>힌트를 보면 1분이 줄어듭니다.</p><div class="row"><button id="hYes" type="button">1분 쓰고 보기</button><button class="ghost" data-close type="button">그만두기</button></div>`);
  $('hYes').onclick=()=>{ hints++; timeLeft=Math.max(0,timeLeft-60); hud();
    const H = !flags.witness?'출발 지점 바로 앞, 불 피운 드럼통 옆에 남색 옷의 당직 선원이 서 있습니다.'
      : !has('torch')&&!flags.toolbox&&!has('clock')?'부두 가운데 현문 사다리로 배에 오른 뒤, 선교 옆 갑판을 따라 뱃머리 쪽으로 가세요. 갈라진 틈 바로 앞 잔해 더미에서 무언가 반짝입니다.'
      : !has('torch')&&!flags.toolbox?'멈춘 시계의 시각을 네 자리로 바꾸세요. 5시 10분이면 0510입니다. 공구함은 시험소 천막 옆, 인장 시험기 근처에 있습니다.'
      : !flags.origin?'V자 무늬는 화살표처럼 균열이 출발한 쪽을 가리킵니다. 모든 V의 꼭짓점이 향하는 끝을 고르세요.'
      : !flags.charpy?'따뜻한 온도와 영하의 온도에서 한 번씩 쳐 보세요. 사고 시각 기온은 부두 남쪽 끝 백엽상 옆 항만 관리인이 알고 있습니다.'
      : !flags.chest?'갈라진 선체 옆면을 부두 끝에서 살펴보면 균열이 지나간 길을 알 수 있습니다. 시작점에서 출발해 멈춘 곳까지 차례로 누르세요.'
      : '청문회에서는 상대 주장과 정면으로 부딪치는 증거를 고르세요. 증거가 모자라면 잠시 휴정하고 현장을 더 둘러봐도 됩니다. 수첩(N)에서 모은 단서를 다시 읽어 보세요.';
    openModal(`<div class="eb">힌트</div><h2>${goalText()}</h2><p>${H}</p><div class="row"><button data-close type="button">닫기</button></div>`); }; }

/* 자물쇠 1: 숫자 다이얼 */
function digitLock(title, desc, n, ok, onOpen){
  let v=Array(n).fill(0);
  const draw=()=>{ $('dials').innerHTML=v.map((d,i)=>`<div class="dial"><button type="button" data-i="${i}" data-d="1" aria-label="${i+1}번째 숫자 올리기">▲</button><b>${d}</b><button type="button" data-i="${i}" data-d="-1" aria-label="${i+1}번째 숫자 내리기">▼</button></div>`).join(''); };
  openModal(`<div class="eb">자물쇠</div><h2>${title}</h2><p>${desc}</p><div id="dials" class="dials"></div><p id="lockmsg" class="src" role="status">숫자 키로 바로 입력해도 됩니다.</p><div class="row"><button id="lkOpen" type="button">열어 보기</button><button class="ghost" data-close type="button">물러나기</button></div>`);
  draw(); let cur=0;
  $('dials').onclick=e=>{ const b=e.target.closest('button'); if(!b) return; const i=+b.dataset.i; v[i]=(v[i]+(+b.dataset.d)+10)%10; cur=i; blip(900,.03,'square',.04); draw(); };
  const kd=e=>{ if($('modal').hidden){ removeEventListener('keydown',kd); return; } if(/^Digit\d$/.test(e.code)){ v[cur]=+e.code.slice(5); cur=(cur+1)%n; blip(900,.03,'square',.04); draw(); } };
  addEventListener('keydown',kd);
  $('lkOpen').onclick=()=>{ if(v.join('')===ok){ removeEventListener('keydown',kd); blip(520,.08,'square',.1); blip(780,.25,'sine',.15,.08); closeModal(); onOpen(); } else penalty(20,'철컥. 열리지 않는다. (20초 줄어듦)'); }; }

/* 자물쇠 2: 균열이 지나간 길 */
const SHIP_ICON=k=>{ const hl='#e04a3a', base='<rect width="64" height="64" fill="#3a4148"/>';
  const sec='<path d="M8 14 L56 14 L54 46 Q50 56 32 56 Q14 56 10 46 Z" fill="#6d757b" stroke="#c9ced1" stroke-width="1.2"/>';
  if(k==='hatch') return `<svg viewBox="0 0 64 64">${base}<rect x="10" y="10" width="44" height="44" fill="#6d757b"/><rect x="20" y="20" width="24" height="24" fill="#20262b" stroke="#c9ced1"/><circle cx="20" cy="44" r="5" fill="none" stroke="${hl}" stroke-width="2.5"/></svg>`;
  if(k==='deck') return `<svg viewBox="0 0 64 64">${base}${sec}<path d="M8 14 L56 14" stroke="${hl}" stroke-width="4"/></svg>`;
  if(k==='side') return `<svg viewBox="0 0 64 64">${base}${sec}<path d="M8 14 L10 46 M56 14 L54 46" stroke="${hl}" stroke-width="4"/></svg>`;
  return `<svg viewBox="0 0 64 64">${base}${sec}<path d="M12 50 Q32 60 52 50" stroke="${hl}" stroke-width="4" fill="none" stroke-dasharray="3 3"/></svg>`; };
function seqLock(onOpen){
  const tiles=[['side','옆판'],['bottom','바닥판 앞'],['hatch','화물창 모서리'],['deck','갑판']], ok='hatch,deck,side,bottom'; let pick=[];
  openModal(`<div class="eb">자물쇠</div><h2>증거 서류함</h2><p>위원회가 채운 그림 자물쇠다. 뚜껑에 이렇게 적혀 있다. "균열이 지나간 길을 출발점부터 멈춘 곳까지 차례로 누르시오."</p><div class="tiles" id="tiles">${tiles.map(([k,n])=>`<button type="button" class="tile" data-k="${k}">${SHIP_ICON(k)}<span>${n}</span></button>`).join('')}</div><p id="lockmsg" class="src" role="status">누른 순서: 없음</p><div class="row"><button class="ghost" id="tReset" type="button">다시 누르기</button><button class="ghost" data-close type="button">물러나기</button></div>`);
  const upd=()=>{ $('lockmsg').textContent='누른 순서: '+(pick.length?pick.map(k=>tiles.find(t=>t[0]===k)[1]).join(' → '):'없음'); document.querySelectorAll('.tile').forEach(b=>b.classList.toggle('on',pick.includes(b.dataset.k))); };
  $('tiles').onclick=e=>{ const b=e.target.closest('.tile'); if(!b||pick.includes(b.dataset.k)) return; pick.push(b.dataset.k); blip(600+pick.length*110,.06,'square',.06); upd();
    if(pick.length===4){ if(pick.join()===ok){ blip(780,.3); closeModal(); onOpen(); } else { penalty(20); pick=[]; setTimeout(()=>{ if($('lockmsg')){ upd(); $('lockmsg').textContent='순서가 틀렸다. (20초 줄어듦)'; } },10); } } };
  $('tReset').onclick=()=>{ pick=[]; upd(); }; }

/* 진자 충격 시험 */
const CP=[[-40,4],[-30,5],[-20,6],[-10,9],[0,14],[10,24],[20,42],[30,55],[40,60]];
const cpE=t=>{ for(let i=1;i<CP.length;i++) if(t<=CP[i][0]){ const [a,ea]=CP[i-1],[b,eb]=CP[i]; return ea+(eb-ea)*(t-a)/(b-a); } return 60; };
const CPT=[-30,-20,-10,-3,0,10,20,30];
function charpyGame(){
  let ti=6, busy=false; const done=new Map();
  const look=e=>e<12?'휘지 않고 두 동강. 면이 평평하게 반짝인다.':e<30?'조금 휘다가 깨졌다. 반짝이는 면과 회색 섬유질이 섞여 있다.':'크게 휘어 V자로 접혔다. 끝까지 갈라지지 않았다. 면은 회색 섬유질.';
  const table=()=>[...done.entries()].sort((a,b)=>a[0]-b[0]).map(([t,e])=>`<tr><td>${t>0?'+':''}${t}°C</td><td>${Math.round(e)} J</td><td>${look(e)}</td></tr>`).join('');
  openModal(`<div class="eb">시험소</div><h2>진자 충격 시험기<span class="tag">재구성</span></h2><p>선체에서 떼어 낸 강재에 홈(노치)을 낸 작은 시편이다. 얼음물이나 따뜻한 물에 담가 온도를 맞춘 뒤 진자로 친다. 진자가 덜 올라갈수록 시편이 에너지를 많이 흡수한 것이다.</p>
   <div class="crank"><svg id="cpsvg" viewBox="0 0 200 170" width="210" height="178" aria-label="진자 충격 시험기"><line x1="40" y1="160" x2="160" y2="160" stroke="#c9ced1"/><rect x="92" y="138" width="16" height="10" fill="#9aa1a6" id="cpspec"/><circle cx="100" cy="22" r="4" fill="#e2b257"/><g id="cparm"><line x1="100" y1="22" x2="100" y2="128" stroke="#c9ced1" stroke-width="3"/><circle cx="100" cy="132" r="12" fill="#59646c" stroke="#c9ced1"/></g><text x="100" y="12" font-size="10" text-anchor="middle" fill="#b5b9b8" id="cpE"></text></svg>
   <div><div class="fdial" style="grid-template-columns:4rem auto 4.5rem auto"><span class="fl">온도</span><button type="button" id="cpL" aria-label="온도 내리기">◀</button><b id="cpT"></b><button type="button" id="cpR" aria-label="온도 올리기">▶</button></div><div class="row"><button id="cpGo" type="button">진자 놓기</button></div></div></div>
   <table class="tt"><thead><tr><th>온도</th><th>흡수 에너지</th><th>부러진 모양</th></tr></thead><tbody id="cpTab"><tr><td colspan="3" class="src">아직 친 시편이 없습니다.</td></tr></tbody></table>
   <p id="lockmsg" class="src" role="status">따뜻할 때와 추울 때를 모두 쳐 보세요.</p><div id="cQ"></div><div class="row"><button class="ghost" data-close type="button">물러나기</button></div>`);
  const setT=()=>{ $('cpT').textContent=(CPT[ti]>0?'+':'')+CPT[ti]+'°C'; };
  setT(); $('cpL').onclick=()=>{ if(!busy&&ti>0){ ti--; setT(); blip(900,.03,'square',.04); } }; $('cpR').onclick=()=>{ if(!busy&&ti<CPT.length-1){ ti++; setT(); blip(900,.03,'square',.04); } };
  const arm=$('cparm'); arm.setAttribute('transform','rotate(130 100 22)');
  $('cpGo').onclick=()=>{ if(busy) return; busy=true; const t=CPT[ti], e=cpE(t), up=130*(1-e/70)+10, t0=performance.now(); $('cpspec').setAttribute('fill','#9aa1a6'); $('cpspec').removeAttribute('transform');
    const f=now=>{ const k=(now-t0)/1500; if(!$('cparm')) return;
      let a; if(k<.45){ const u=k/.45; a=130*(1-u*u); } else if(k<1){ const u=(k-.45)/.55; a=-up*Math.sin(u*Math.PI/2); } else a=-up;
      arm.setAttribute('transform',`rotate(${a} 100 22)`);
      if(k>=.45&&!f.hit){ f.hit=true; blip(e<12?1400:260,e<12?.12:.3,e<12?'square':'sawtooth',.14); $('cpspec').setAttribute('fill',e<12?'#d7dde0':'#7d858a'); $('cpspec').setAttribute('transform',e<12?'translate(14 -6) rotate(30 100 143)':'rotate(-25 100 143)'); }
      if(k<1.25) requestAnimationFrame(f); else { busy=false; done.set(t,e); $('cpE').textContent=`${Math.round(e)} J 흡수`; $('cpTab').innerHTML=table();
        const cold=[...done.keys()].some(x=>x<=0), warm=[...done.keys()].some(x=>x>=20);
        $('lockmsg').textContent= cold&&warm ? '두 온도의 차이가 보인다.' : cold ? '이번엔 따뜻한 온도에서도 쳐 보세요.' : '이번엔 영하에서도 쳐 보세요.';
        if(cold&&warm&&!$('cQ').innerHTML) $('cQ').innerHTML=`<fieldset><legend>사고가 난 새벽 기온에서 선체 강판은 어떤 상태였을까?</legend><div class="row"><button type="button" class="ghost" data-a="0">크게 휘며 충격을 흡수하는 질긴 상태</button><button type="button" class="ghost" data-a="1">거의 휘지 않고 유리처럼 깨지는 상태</button><button type="button" class="ghost" data-a="2">온도와 상관없이 늘 같은 상태</button></div></fieldset>`; } };
    requestAnimationFrame(f); };
  $('cQ').onclick=e=>{ const b=e.target.closest('button'); if(!b) return; if(b.dataset.a==='1'){ closeModal(); flags.charpy=true; give('charpy'); } else penalty(10,b.dataset.a==='0'?'사고 시각 기온을 확인하고 그 온도 근처의 결과를 보세요. (10초 줄어듦)':'표의 흡수 에너지를 다시 보세요. (10초 줄어듦)'); }; }

/* 기상 기록 */
function weatherLog(){
  openModal(`<div class="eb">항만 관리인의 백엽상 기록</div><h2>기온 기록<span class="tag">재구성</span></h2><p>1943년 1월, 사고 전날 낮부터 사고 날 아침까지.</p>
   <table class="tt"><tr><th>시각</th><th>기온</th></tr><tr><td>전날 14시</td><td>+8°C</td></tr><tr><td>전날 18시</td><td>+3°C</td></tr><tr><td>전날 22시</td><td>0°C</td></tr><tr><td>00시</td><td>-1°C</td></tr><tr><td>02시</td><td>-2°C</td></tr><tr><td>04시</td><td>-2.5°C</td></tr><tr><td class="fete">05시</td><td class="fete">-3°C (가장 추움)</td></tr><tr><td>06시</td><td>-3°C</td></tr><tr><td>07시</td><td>-2°C</td></tr></table>
   <p class="src">강물 온도는 4도 안팎. 바람 없음, 물결 잔잔.</p><div class="row"><button id="wTake" type="button">수첩에 옮겨 적기</button><button class="ghost" data-close type="button">닫기</button></div>`);
  $('wTake').onclick=()=>{ flags.weather=true; give('weather'); }; }

/* 최종 자물쇠 */
const FINAL=[['원인',['미숙한 용접공의 불량 용접','과적이나 파도 같은 큰 힘이 한 번에 걸렸다','반복 하중으로 균열이 오랫동안 조금씩 자랐다','추위에 취성이 된 강재에서 균열이 순식간에 달렸다'],3],
 ['시작점',['갑판 용접선 한가운데','3번 화물창의 각진 모서리','선저의 용골'],1],
 ['대책',['용접을 금지하고 리벳으로만 짓는다','강판을 두 배로 두껍게 한다','저온 충격 시험으로 강재를 고르고, 모서리를 둥글게 하고, 균열 정지 띠를 덧댄다','용접공을 모두 다시 교육한다'],2]];
function finalLock(){
  const v=[0,0,0];
  const draw=()=>{ $('fdials').innerHTML=FINAL.map(([l,o],i)=>`<div class="fdial"><span class="fl">${l}</span><button type="button" data-i="${i}" data-d="-1" aria-label="${l} 이전">◀</button><b>${o[v[i]]}</b><button type="button" data-i="${i}" data-d="1" aria-label="${l} 다음">▶</button></div>`).join(''); };
  openModal(`<div class="eb">해사위원회 조사위원회</div><h2>보고 상자</h2><p>상자에는 다이얼이 세 줄 달려 있다. 원인, 시작점, 대책이 모두 맞아야 열린다.</p><div id="fdials"></div><p id="lockmsg" class="src" role="status"></p><div class="row"><button id="fOpen" type="button">열어 보기</button><button class="ghost" data-close type="button">더 조사하기</button></div>`);
  draw(); $('fdials').onclick=e=>{ const b=e.target.closest('button'); if(!b) return; const i=+b.dataset.i, n=FINAL[i][1].length; v[i]=(v[i]+(+b.dataset.d)+n)%n; blip(900,.03,'square',.04); draw(); };
  $('fOpen').onclick=()=>{ const right=FINAL.filter((f,i)=>v[i]===f[2]).length; if(right===3){ finished=true; blip(520,.1); blip(660,.1,'sine',.15,.1); blip(880,.4,'sine',.15,.2); verdict(); } else penalty(30,`딸깍, 맞물린 다이얼은 ${right}줄뿐이다. (30초 줄어듦)`); }; }
function verdict(){
  const tl=Math.max(0,timeLeft), score=Math.max(10,Math.min(100,Math.round(60+40*tl/TIME_LIMIT)-miss*4-hints*6));
  try{ const k='mt-score-2'; if(score>(+localStorage.getItem(k)||0)) localStorage.setItem(k,score); localStorage.setItem('mt-done-2','1'); }catch(e){}
  openModal(`<div class="eb">${score>=90?'수석 조사관':score>=70?'조사관':'수습 조사관'}</div><div class="score">${score}<span style="font-size:1rem;color:var(--muted)"> / 100점</span></div>
    <p>걸린 시간 ${fmt(TIME_LIMIT-tl)}${timeLeft<=0?' (제한 시간 초과)':''} · 실수 ${miss}번 · 힌트 ${hints}번</p>
    <div class="fb"><b>원인 · 저온 취성 파괴</b><br>이 강재는 기온이 내려가면 연성에서 취성으로 바뀝니다. 영하의 새벽, 짐도 파도도 없었는데 응력이 몰린 곳에서 생긴 균열이 멈출 곳 없이 선체를 가로질렀습니다. 반짝이는 평평한 면과 V자 무늬가 그 흔적입니다.</div>
    <div class="fb"><b>시작점 · 3번 화물창의 각진 모서리</b><br>각진 모서리에는 응력이 몰립니다. 파단면의 V자 꼭짓점이 모두 그쪽을 가리켰습니다. 용접 결함도 있었지만 균열은 용접부에서 시작하지 않았습니다.</div>
    <div class="fb"><b>대책 · 재료, 설계, 구조를 함께</b><br>낮은 온도에서도 질긴 강재를 충격 시험으로 고르고, 모서리를 둥글게 해 응력집중을 줄이고, 균열이 달리더라도 멈추도록 리벳 띠를 덧댑니다. 용접을 버리거나 판만 두껍게 하는 것은 답이 아닙니다.</div>
    <h3 style="margin-top:16px">실제로는 어떻게 되었나</h3><p>2차 대전 중 미국은 리버티선 2,710척을 지었습니다. 전쟁 중 심각한 취성 파괴가 1,500건 가까이 보고됐고, 리버티선 3척을 포함한 12척이 예고 없이 두 동강 났습니다.</p><p>가장 유명한 사진은 1943년 1월 16일 오리건주 포틀랜드 조선소 의장 안벽에서 갈라진 유조선 셰넥터디호입니다. 잔잔한 날씨에 묶여 있던 배가 굉음과 함께 거의 반으로 갈라졌고, 바닥판만 버텼습니다.</p><p>처음에는 용접이 의심받았습니다. 그러나 케임브리지 대학의 콘스턴스 티퍼는 균열이 용접부가 아니라 강재 자체의 취성에서 비롯했음을 보였습니다. 심각한 균열의 절반 이상이 화물창 모서리에서 시작했다는 분석도 있습니다. 이후 화물창 모서리를 고치고 균열 정지 띠를 덧대는 보강이 이뤄졌습니다.</p><p>이 사고들은 연성-취성 천이온도라는 개념과 오늘날 파괴역학의 출발점이 되었습니다.</p>
    <p class="src"><span class="tag" style="margin:0 6px 0 0">재구성</span>배와 인물, 대사, 자물쇠, 기상 기록, 충격·인장 시험 값은 여러 실제 사례를 바탕으로 게임용으로 만든 것입니다. 자료: <a href="https://en.wikipedia.org/wiki/SS_Schenectady">Wikipedia, SS Schenectady</a> · <a href="https://www.mdpi.com/2078-1547/7/2/20">Challenges 7(2):20, Liberty ship failures</a> · <a href="https://link.springer.com/article/10.1007/s11837-015-1668-1">JOM (2015), 리버티선 리벳 연구</a></p>
    <div class="row"><a class="btnlink" href="ch3.html">다음 사건</a><a class="btnlink ghost" href="index.html">사건 목록</a><button id="again" type="button" class="ghost">처음부터 다시</button></div>`);
  $('again').onclick=()=>location.reload(); }
