/* ================= 게임 상태 ================= */
const TIME_LIMIT = 900;
let inv = [], flags = {}, paused = true, started = false, timeLeft = TIME_LIMIT, miss = 0, hints = 0, finished = false, searching = null, timeUpSaid = false;
const $ = id => document.getElementById(id);
const ITEMS = {
  log:{n:'생존자 기록', d:'밤 11시 40분, 배의 오른쪽 앞부분이 빙산을 스쳤다. 덜컥하는 가벼운 충격과 몇 초간 긁히는 소리뿐이었다. 바닷물은 영하 2도. 배는 2시간 40분 만에 가라앉았다.'},
  tongs:{n:'시료 집게', d:'잠수정 장비함에서 꺼낸 긴 집게. 진흙 속 작은 시료를 집을 수 있다.'},
  rivet:{n:'머리 잃은 리벳', d:'선수부 이음매 근처 진흙에서 주운 연철 리벳. 머리가 떨어져 나가고 몸통만 남았다.'},
  section:{n:'리벳 단면 스케치', d:'검은 슬래그 줄무늬가 빽빽하고, 머리 밑에서 결이 직각으로 꺾인다. 균열은 바로 그 꺾인 자리에서 났다. 힘을 받으면 머리가 쉽게 떨어질 수밖에 없다.'},
  sonar:{n:'음파 영상', d:'길게 찢긴 구멍은 없다. 판과 판이 겹친 이음매를 따라 좁은 틈 여러 곳이 벌어졌고, 모두 합쳐 약 1.1 m²다. 틈은 앞쪽 여섯 구획에 걸쳐 있다.', recon:true},
  compart:{n:'구획 설계', d:'방수 구획 16개 가운데 앞쪽 네 개까지는 물이 차도 뜨게 설계됐다. 칸막이벽이 맨 위 갑판까지 올라가지 않아, 앞이 가라앉으면 물이 벽을 넘어 다음 구획으로 넘어간다.'},
  myth:{n:'당시 통설', d:'1912년 신문들은 빙산이 옆구리를 100 m 가까이 길게 찢었다고 썼다. 그러나 그 구멍을 직접 본 사람은 없었다.'},
  speed:{n:'항해 기록', d:'빙산 경고를 여러 번 받고도 거의 최고 속도로 달렸다. 부딪힌 이유는 설명하지만, 물이 들어온 방식은 설명하지 못한다.'},
  plate:{n:'판재 파단면', d:'잔해밭 선체 조각의 깨진 가장자리가 평평하고 휜 흔적이 거의 없다. 다만 이 조각은 빙산과 부딪힐 때가 아니라, 침몰하며 선체가 두 동강 날 때 깨진 것이다.', recon:true},
  charpy:{n:'강판 충격 시험', d:'회수한 선체 강판을 영하 2도에서 진자로 쳤더니 흡수 에너지가 약 4 J였다. 얼음물 속에서 강판은 유리처럼 깨진다. 그래도 당시 구할 수 있던 선체 강판 중에서는 좋은 축이었다.', recon:true, f:()=>charpySVG()},
  chem:{n:'리벳 슬래그 분석', d:'연철에는 원래 유리 같은 슬래그가 2~3% 섞여 있고 그 정도면 정상이다. 그런데 일부 리벳은 9% 안팎으로 서너 배나 많아, 슬래그 줄을 따라 쉽게 갈라졌다. 선수와 선미는 손으로 박은 연철 리벳, 가운데는 기계로 박은 강철 리벳이었다.', recon:true}
};
const has = k => inv.includes(k);
function give(k){ const ks=[].concat(k).filter(x=>!has(x)); if(!ks.length) return; inv.push(...ks); hud(); blip(660,.16); blip(990,.3,'sine',.16,.12);
  openModal(`<div class="eb">획득</div>`+ks.map(x=>`<h2>${ITEMS[x].n}${ITEMS[x].recon?'<span class="tag">재구성</span>':''}</h2><p>${ITEMS[x].d}</p>${ITEMS[x].f?ITEMS[x].f():''}`).join('')+`<div class="row"><button data-close type="button">계속</button></div>`); }
function goalText(){
  if(!flags.radio) return '잠수정 옆 무전기로 지원선과 교신하세요.';
  if(!flags.locker) return '잠수정 옆 노란 장비함을 여세요. 번호는 빙산을 스친 시각, 24시간제 네 자리입니다.';
  if(!has('rivet')) return '잔해밭의 리벳 이음 강판 주변 진흙에서 떨어져 나간 리벳을 집게로 주우세요.';
  if(!flags.section) return '잠수정 뒤쪽 시편 상자에서 리벳을 세로로 잘라 단면을 관찰하세요.';
  if(!flags.sonar) return '선수 끝 오른쪽의 음파 탐지기로 진흙에 묻힌 옆판을 훑으세요.';
  if(!flags.case) return '잠수정 앞 분석 보고함을 여세요. 그날 밤 일이 일어난 순서를 알아야 합니다.';
  return '잠수정 해치의 무전 단말로 원격 청문회를 여세요. 100년 묵은 주장들을 증거로 뒤집어야 합니다.'; }
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
  openModal(`<div class="eb">조작법</div><h2>해저를 걷는 방법</h2><p><b>키보드</b>: WASD나 방향키로 이동, Shift 달리기, Space 점프, E 조사·대화·사용, N 수첩, H 힌트.</p><p><b>시점</b>: 화면을 드래그하면 돌아가고 휠로 거리를 조절합니다.</p><p><b>터치</b>: 왼쪽 아래 스틱으로 이동, 오른쪽 아래 버튼으로 점프와 조사.</p><p><b>길</b>: 잠수정과 잔해밭은 선수부 뒤쪽에 있습니다. 선수부 갑판에는 끊어진 뒤쪽 끝에서 뛰어 올라갈 수 있고, 음파 탐지기는 뱃머리 오른쪽 해저에 있습니다.</p><p><b>규칙</b>: 제한 시간 15분. 자물쇠를 틀리거나 힌트를 보면 시간이 줄어듭니다. 시간이 다 돼도 계속할 수 있지만 점수가 낮아집니다.</p><p class="src">3D 모델: Quaternius (CC0). 엔진: three.js. 글꼴: Noto Serif KR, Pretendard (SIL Open Font License 1.1).</p><div class="row"><button data-close type="button">닫기</button></div>`); }
function showHint(){ if(finished) return;
  openModal(`<div class="eb">힌트</div><h2>힌트를 볼까요?</h2><p>힌트를 보면 1분이 줄어듭니다.</p><div class="row"><button id="hYes" type="button">1분 쓰고 보기</button><button class="ghost" data-close type="button">그만두기</button></div>`);
  $('hYes').onclick=()=>{ hints++; timeLeft=Math.max(0,timeLeft-60); hud();
    const H = !flags.radio?'출발 지점 바로 앞, 잠수정 꼬리 쪽 해저에 무전기 표식이 있습니다.'
      : !flags.locker?'밤 11시 40분을 24시간제로 바꾸면 23시 40분, 네 자리로 2340입니다. 장비함은 잠수정 왼쪽 뒤편에 있습니다.'
      : !has('rivet')?'잔해밭에서 리벳 구멍이 줄지어 난 녹슨 강판을 찾으세요. 잠수정에서 선수부 쪽으로 가다 왼쪽입니다. 그 옆 진흙에서 무언가 반짝입니다.'
      : !flags.section?'단면에서 결이 꺾이고 금이 간 곳이 리벳이 끊어지는 자리입니다.'
      : !flags.sonar?'선수부 오른쪽 옆을 따라 뱃머리까지 가세요. 스캔 막대를 끝까지 밀고, 붉은 틈이 있는 마지막 구획 번호를 세세요.'
      : !flags.case?'빙산이 먼저 스쳤고, 그 힘에 리벳 머리가 떨어졌고, 그래서 판 사이가 벌어졌고, 그 틈으로 물이 찼습니다.'
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

/* 자물쇠 2: 그날 밤의 순서 */
const NIGHT_ICON=k=>{ const bg='<rect width="64" height="64" fill="#0c2a33"/>';
  if(k==='ice') return `<svg viewBox="0 0 64 64">${bg}<path d="M14 50 L28 16 L36 28 L42 22 L52 50 Z" fill="#e6f3f7"/><path d="M4 50 H60" stroke="#5fb0c8" stroke-width="2"/><rect x="2" y="42" width="18" height="6" fill="#59646c"/></svg>`;
  if(k==='head') return `<svg viewBox="0 0 64 64">${bg}<rect x="8" y="30" width="48" height="6" fill="#8a5a3a"/><rect x="8" y="38" width="48" height="6" fill="#6e4630"/><rect x="29" y="30" width="6" height="16" fill="#b8b2a8"/><path d="M24 22 Q32 14 40 22 Z" fill="#b8b2a8" transform="rotate(-25 32 20)"/><path d="M42 12 l6 -4 M44 18 l7 0" stroke="#e2b257" stroke-width="2"/></svg>`;
  if(k==='seam') return `<svg viewBox="0 0 64 64">${bg}<rect x="6" y="18" width="24" height="30" fill="#8a5a3a"/><rect x="36" y="16" width="22" height="30" fill="#8a5a3a" transform="rotate(6 47 31)"/><path d="M32 16 L33 50" stroke="#ff6a4a" stroke-width="2.5" stroke-dasharray="3 2"/></svg>`;
  return `<svg viewBox="0 0 64 64">${bg}<rect x="6" y="14" width="52" height="38" fill="none" stroke="#c9ced1"/>${[0,1,2,3,4,5].map(i=>`<line x1="${6+i*8.6}" x2="${6+i*8.6}" y1="14" y2="52" stroke="#c9ced1"/>`).join('')}<rect x="7" y="30" width="43" height="21" fill="#2f86b8" opacity=".8"/></svg>`; };
function seqLock(onOpen){
  const tiles=[['seam','이음매가 벌어짐'],['flood','여섯 구획에 물이 참'],['ice','빙산이 스침'],['head','리벳 머리가 떨어짐']], ok='ice,head,seam,flood'; let pick=[];
  openModal(`<div class="eb">자물쇠</div><h2>분석 보고함</h2><p>지원선 야금학자가 채운 그림 자물쇠다. "그날 밤 일어난 일을 먼저 일어난 것부터 차례로 누르시오."</p><div class="tiles" id="tiles">${tiles.map(([k,n])=>`<button type="button" class="tile" data-k="${k}">${NIGHT_ICON(k)}<span>${n}</span></button>`).join('')}</div><p id="lockmsg" class="src" role="status">누른 순서: 없음</p><div class="row"><button class="ghost" id="tReset" type="button">다시 누르기</button><button class="ghost" data-close type="button">물러나기</button></div>`);
  const upd=()=>{ $('lockmsg').textContent='누른 순서: '+(pick.length?pick.map(k=>tiles.find(t=>t[0]===k)[1]).join(' → '):'없음'); document.querySelectorAll('.tile').forEach(b=>b.classList.toggle('on',pick.includes(b.dataset.k))); };
  $('tiles').onclick=e=>{ const b=e.target.closest('.tile'); if(!b||pick.includes(b.dataset.k)) return; pick.push(b.dataset.k); blip(600+pick.length*110,.06,'square',.06); upd();
    if(pick.length===4){ if(pick.join()===ok){ blip(780,.3); closeModal(); onOpen(); } else { penalty(20); pick=[]; setTimeout(()=>{ if($('lockmsg')){ upd(); $('lockmsg').textContent='순서가 틀렸다. (20초 줄어듦)'; } },10); } } };
  $('tReset').onclick=()=>{ pick=[]; upd(); }; }

/* 음파 탐사 미니게임 */
function sonarGame(){
  const BH=[262,226,190,154,118,82,46], SL=[[268,58,16],[236,86,18],[198,58,20],[164,86,14],[126,58,18],[92,86,16]];
  let base='<rect width="300" height="150" fill="#04141a"/>';
  for(let i=0;i<17;i++) base+=`<line x1="0" x2="300" y1="${10+i*8}" y2="${10+i*8}" stroke="#2a6b66" stroke-opacity=".22"/>`;
  base+='<path d="M10 30 L250 30 Q290 32 292 70 Q290 108 250 112 L10 112 Z" fill="#0f3a3a" stroke="#5fd0b0" stroke-width="1.5"/>';
  for(const y of[58,86]) base+=`<line x1="10" x2="282" y1="${y}" y2="${y}" stroke="#5fd0b0" stroke-opacity=".5"/>`;
  BH.forEach(x=>base+=`<line x1="${x}" x2="${x}" y1="30" y2="112" stroke="#9fe8d8" stroke-width="1.4" stroke-dasharray="4 2"/>`);
  [292,...BH,10].slice(0,-1).forEach((x,i)=>{ const nx=[...BH,10][i]; base+=`<text x="${(x+nx)/2}" y="125" font-size="9" fill="#9fe8d8" text-anchor="middle">${i+1}</text>`; });
  base+='<text x="150" y="141" font-size="8.5" fill="#5fd0b0" text-anchor="middle">숫자: 뱃머리부터 센 방수 구획 번호</text><text x="292" y="22" font-size="8.5" fill="#5fd0b0" text-anchor="end">뱃머리</text><text x="10" y="22" font-size="8.5" fill="#5fd0b0">선미 쪽</text>';
  openModal(`<div class="eb">음파 탐지기</div><h2>진흙 아래 오른쪽 옆판<span class="tag">재구성</span></h2><p>선수 오른쪽 옆판은 진흙에 묻혀 있다. 스캔 막대를 뱃머리에서 선미 쪽으로 밀어 옆판을 훑어 보자.</p>
   <figure class="fig"><svg id="sv" viewBox="0 0 300 150" style="width:100%;max-width:480px" role="img" aria-label="음파 영상">${base}<g id="slits"></g><line id="sweep" x1="292" x2="292" y1="26" y2="116" stroke="#ffe08a" stroke-width="2"/></svg></figure>
   <label class="src" for="sweepR">스캔 위치</label><input id="sweepR" type="range" min="0" max="100" value="0" style="width:100%;max-width:480px;accent-color:#e2b257">
   <p id="lockmsg" class="src" role="status">막대를 끝까지 밀어 보세요.</p><div id="sQ"></div><div class="row"><button class="ghost" data-close type="button">물러나기</button></div>`);
  let far=292, asked=false;
  $('sweepR').oninput=e=>{ const x=292-(+e.target.value)/100*282; $('sweep').setAttribute('x1',x); $('sweep').setAttribute('x2',x); if(x<far){ far=x; blip(1200,.03,'sine',.03); }
    $('slits').innerHTML=SL.filter(s=>s[0]+s[2]>=far).map(([sx,sy,l])=>`<rect x="${sx}" y="${sy-2.5}" width="${l}" height="5" rx="2" fill="#ff6a4a"/>`).join('');
    if(far<20&&!asked){ asked=true; $('lockmsg').textContent='길게 찢어진 곳은 없다. 이음매를 따라 좁은 틈만 줄지어 있다.';
      $('sQ').innerHTML=`<fieldset><legend>붉은 틈은 뱃머리부터 몇 번째 구획까지 걸쳐 있나?</legend><div class="row">${[2,4,6,8].map(n=>`<button type="button" class="ghost" data-a="${n}">${n}번 구획까지</button>`).join('')}</div></fieldset>`; } };
  $('sQ').onclick=e=>{ const b=e.target.closest('button'); if(!b) return; if(b.dataset.a==='6'){ closeModal(); flags.sonar=true; give('sonar'); } else penalty(10,'구획 번호를 다시 세어 보세요. (10초 줄어듦)'); }; }

/* 최종 자물쇠 */
const FINAL=[['물이 들어온 길',['빙산이 옆구리를 100 m 가까이 길게 찢었다','용골이 부러지며 바닥이 갈라졌다','이음매의 리벳 머리가 떨어져 판 사이가 벌어졌다'],2],
 ['재료',['재료에는 아무 문제가 없었다','슬래그 많은 연철 리벳과, 얼음물에서 취성이 된 강판','강판이 당시 기준으로도 불량품이었다'],1],
 ['교훈',['리벳 수를 두 배로 늘린다','배를 더 크고 무겁게 만든다','칸막이를 맨 위 갑판까지 올리고, 저온에서 질긴 재료와 고른 품질의 이음을 쓴다','빙산 경고만 잘 들으면 재료는 상관없다'],2]];
function finalLock(){
  const v=[0,0,0];
  const draw=()=>{ $('fdials').innerHTML=FINAL.map(([l,o],i)=>`<div class="fdial"><span class="fl">${l}</span><button type="button" data-i="${i}" data-d="-1" aria-label="${l} 이전">◀</button><b>${o[v[i]]}</b><button type="button" data-i="${i}" data-d="1" aria-label="${l} 다음">▶</button></div>`).join(''); };
  openModal(`<div class="eb">지원선 조사 책임자</div><h2>보고 다이얼</h2><p>해치 옆 무전 단말에 다이얼이 세 줄 달려 있다. 물이 들어온 길, 재료, 교훈이 모두 맞아야 보고가 전송된다.</p><div id="fdials"></div><p id="lockmsg" class="src" role="status"></p><div class="row"><button id="fOpen" type="button">전송하기</button><button class="ghost" data-close type="button">더 조사하기</button></div>`);
  draw(); $('fdials').onclick=e=>{ const b=e.target.closest('button'); if(!b) return; const i=+b.dataset.i, n=FINAL[i][1].length; v[i]=(v[i]+(+b.dataset.d)+n)%n; blip(900,.03,'square',.04); draw(); };
  $('fOpen').onclick=()=>{ const right=FINAL.filter((f,i)=>v[i]===f[2]).length; if(right===3){ finished=true; blip(520,.1); blip(660,.1,'sine',.15,.1); blip(880,.4,'sine',.15,.2); verdict(); } else penalty(30,`지직, 전송 실패. 맞은 다이얼은 ${right}줄뿐이다. (30초 줄어듦)`); }; }
function verdict(){
  const tl=Math.max(0,timeLeft), score=Math.max(10,Math.min(100,Math.round(60+40*tl/TIME_LIMIT)-miss*4-hints*6));
  try{ const k='mt-score-3'; if(score>(+localStorage.getItem(k)||0)) localStorage.setItem(k,score); localStorage.setItem('mt-done-3','1'); }catch(e){}
  openModal(`<div class="eb">${score>=90?'수석 조사관':score>=70?'조사관':'수습 조사관'}</div><div class="score">${score}<span style="font-size:1rem;color:var(--muted)"> / 100점</span></div>
    <p>걸린 시간 ${fmt(TIME_LIMIT-tl)}${timeLeft<=0?' (제한 시간 초과)':''} · 실수 ${miss}번 · 힌트 ${hints}번</p>
    <div class="fb"><b>물이 들어온 길 · 벌어진 이음매</b><br>빙산은 선체를 길게 찢지 않았습니다. 스치는 힘에 리벳 머리가 떨어지면서 판과 판 사이가 벌어졌고, 그 좁은 틈들이 앞쪽 여섯 구획에 걸쳐 있었습니다.</div>
    <div class="fb"><b>재료 · 리벳과 강판</b><br>선수부의 연철 리벳은 슬래그가 많았고, 머리 밑에서 결이 꺾여 약했습니다. 선체 강판도 영하 2도의 바닷물 속에서는 취성이었습니다. 어느 쪽을 더 탓할지는 지금도 논쟁 중입니다.</div>
    <div class="fb"><b>교훈 · 설계와 재료를 함께</b><br>칸막이를 위 갑판까지 올리고, 낮은 온도에서도 질긴 재료와 고른 품질의 이음을 씁니다. 리벳을 늘리거나 배를 키우는 것은 답이 아닙니다.</div>
    <h3 style="margin-top:16px">실제로는 어떻게 되었나</h3><p>1912년 4월 14일 밤, 타이타닉호는 오른쪽 앞부분이 빙산을 스친 뒤 2시간 40분 만에 가라앉았고, 1,500명 넘는 사람이 목숨을 잃었습니다. 방수 구획 16개 가운데 네 개 넘게 물이 차면 뜰 수 없었는데, 여섯 개가 뚫렸습니다.</p><p>1985년 해저에서 두 동강 난 선체가 발견됐고, 1996년 음파 탐사로 진흙 아래 손상을 처음 들여다봤습니다. 거대한 찢어진 구멍 대신 모두 합쳐 12제곱피트(약 1.1 m²) 정도의 틈이 나왔습니다.</p><p>미국 국립표준기술연구소(NIST)의 팀 포크는 회수한 연철 리벳 일부에 당시 좋은 연철의 보통 함량보다 서너 배 많은 슬래그가 들어 있다고 보고했습니다. 같은 분석에서 선체 강판도 얼음물 온도에서 취성이었습니다. 리벳을 더 탓하는 쪽과 강판을 더 탓하는 쪽의 논쟁은 지금도 이어지지만, 어느 쪽이든 "추위 속에서 재료가 어떻게 깨지는가"라는 같은 질문으로 모입니다.</p><p>사고 뒤 다른 배들은 방수 칸막이를 더 높이 올렸습니다.</p>
    <p class="src"><span class="tag" style="margin:0 6px 0 0">재구성</span>대사, 자물쇠, 음파 영상과 충격 시험 그래프의 모양은 게임용으로 만든 것입니다. 자료: <a href="https://www.nist.gov/node/400756">NIST, Failure of Tiny Rivets May Have Sunk the Titanic</a> · <a href="https://www.nist.gov/node/607356">Foecke, Metallurgy of the RMS Titanic (NISTIR 6118)</a> · <a href="https://link.springer.com/article/10.1007/BF02715155">Leighly 외, RMS Titanic: A metallurgical problem</a></p>
    <div class="row"><a class="btnlink" href="index.html">사건 목록</a><button id="again" type="button" class="ghost">처음부터 다시</button></div>`);
  $('again').onclick=()=>location.reload(); }
