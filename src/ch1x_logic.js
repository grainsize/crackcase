/* ================= 게임 상태 ================= */
const TIME_LIMIT = 900;
let inv = [], flags = {}, paused = true, started = false, timeLeft = TIME_LIMIT, miss = 0, hints = 0, finished = false, searching = null, timeUpSaid = false;
const $ = id => document.getElementById(id);
const ITEMS = {
  key:{n:'창고 열쇠', d:'증거 창고 자물쇠에 맞는 쇠 열쇠.'},
  lens:{n:'확대경', d:'기술자가 떨어뜨린 놋쇠 확대경. 렌즈는 멀쩡하다.'},
  sketch:{n:'파단면 스케치', d:'물결 줄무늬가 한 점으로 모인다. 균열은 저널 어깨 모서리의 표면에서 시작해 안으로 자랐고, 남은 단면이 마지막에 한꺼번에 끊어졌다.'},
  ledger:{n:'운행 장부', d:'이 차축은 몇 해 동안 약 3만 km를 문제없이 달렸다. 바퀴가 한 바퀴 돌 때마다 굽힘이 한 번 뒤집히니, 대략 천만 번이다.', recon:true},
  memo:{n:'기술자의 의견서', d:'부러진 차축은 늘 지름이 갑자기 줄어드는 모서리에서 끊어졌다. 모서리를 큰 곡선으로 깎고, 차축이 달린 거리를 적어 두었다가 정해진 거리에서 바꾸자는 의견.', recon:true},
  crank:{n:'회전 굽힘 메모', d:'휘어진 채 도는 축의 표면 한 점은 한 바퀴마다 당겨졌다가 눌린다. 하중은 크지 않아도 끝없이 반복된다.'}
};
const has = k => inv.includes(k);
function give(k){ const ks=[].concat(k).filter(x=>!has(x)); if(!ks.length) return; inv.push(...ks); hud(); blip(660,.16); blip(990,.3,'sine',.16,.12);
  openModal(`<div class="eb">획득</div>`+ks.map(x=>`<h2>${ITEMS[x].n}${ITEMS[x].recon?'<span class="tag">재구성</span>':''}</h2><p>${ITEMS[x].d}</p>`).join('')+`<div class="row"><button data-close type="button">계속</button></div>`); }
function goalText(){
  if(!flags.witness) return '사고를 겪은 사람을 찾아 이야기를 들어 보세요.';
  if(!has('key')&&!flags.shed) return '기관차 옆 공구함에서 창고 열쇠를 꺼내세요. 번호는 사고 열차의 출발 시각입니다.';
  if(!flags.shed) return '열쇠로 증거 창고 문을 여세요.';
  if(!has('lens')) return '파단면을 들여다볼 확대경이 필요합니다. 누가 잃어버렸을까요?';
  if(!flags.origin) return '창고 안 차축의 파단면을 살피고, 균열이 시작된 곳을 짚으세요.';
  if(!flags.chest) return '서기 천막의 서류함을 여세요. 자물쇠 그림에 순서가 있습니다.';
  return '조사위원회 천막의 보고 상자를 여세요. 원인, 시작점, 대책을 모두 맞혀야 열립니다.'; }
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
  openModal(`<div class="eb">조작법</div><h2>현장을 돌아다니는 방법</h2><p><b>키보드</b>: WASD나 방향키로 이동, Shift 달리기, Space 점프, E 조사·대화·사용, N 수첩, H 힌트.</p><p><b>시점</b>: 화면을 드래그하면 돌아가고 휠로 거리를 조절합니다.</p><p><b>터치</b>: 왼쪽 아래 스틱으로 이동, 오른쪽 아래 버튼으로 점프와 조사.</p><p><b>규칙</b>: 제한 시간 15분. 자물쇠를 틀리거나 힌트를 보면 시간이 줄어듭니다. 시간이 다 돼도 계속할 수 있지만 점수가 낮아집니다.</p><p class="src">인물, 나무, 소품 3D 모델: Quaternius (CC0). 엔진: three.js. 글꼴: Noto Serif KR, Pretendard (SIL Open Font License 1.1).</p><div class="row"><button data-close type="button">닫기</button></div>`); }
function showHint(){ if(finished) return;
  openModal(`<div class="eb">힌트</div><h2>힌트를 볼까요?</h2><p>힌트를 보면 1분이 줄어듭니다.</p><div class="row"><button id="hYes" type="button">1분 쓰고 보기</button><button class="ghost" data-close type="button">그만두기</button></div>`);
  $('hYes').onclick=()=>{ hints++; timeLeft=Math.max(0,timeLeft-60); hud();
    const H = !flags.witness?'출발 지점 앞쪽, 팔에 붕대를 감은 승객이 무언가 알고 있습니다.'
      : !has('key')&&!flags.shed?'출발 지점의 운행표에서 분수 축제 직후, 해 지기 전에 떠난 열차를 찾으세요. 그 시각 네 자리가 공구함 번호입니다.'
      : !flags.shed?'증거 창고는 선로 왼쪽, 불탄 객차 뒤편의 나무 창고입니다.'
      : !has('lens')?'철도 기술자가 확대경을 잃어버렸다고 합니다. 불탄 객차 옆 잔해 더미를 뒤져 보세요.'
      : !flags.origin?'물결 줄무늬는 균열이 멈칫거리며 자란 자국입니다. 줄무늬가 동심원처럼 모여드는 한 점을 찾으세요.'
      : !flags.chest?'파괴는 작은 시작점에서 출발해, 줄무늬를 남기며 자라고, 마지막에 거칠게 끊어집니다.'
      : '원인은 수첩의 회전 굽힘과 운행 장부에, 시작점은 파단면 스케치에, 대책은 의견서에 있습니다.';
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
/* 자물쇠 2: 그림 순서 */
const ICON={start:'<svg viewBox="0 0 60 60"><rect width="60" height="60" fill="#59646c"/><circle cx="8" cy="52" r="4" fill="#f1ece2"/><path d="M8 52 L14 46" stroke="#11181d" stroke-width="2"/></svg>',
  grow:'<svg viewBox="0 0 60 60"><rect width="60" height="60" fill="#59646c"/>'+[14,22,30,38,46].map(r=>`<path d="M${8+r} 52 A${r} ${r} 0 0 0 8 ${52-r}" fill="none" stroke="#11181d" stroke-width="2"/>`).join('')+'</svg>',
  final:'<svg viewBox="0 0 60 60"><rect width="60" height="60" fill="#cfd4d2"/>'+Array.from({length:40},(_,i)=>`<rect x="${(i*37)%56}" y="${(i*23)%56}" width="${3+i%4}" height="${3+i%3}" fill="#11181d" opacity=".55" transform="rotate(${i*31} ${(i*37)%56} ${(i*23)%56})"/>`).join('')+'</svg>'};
function seqLock(onOpen){
  const tiles=[['final','거친 알갱이'],['start','작은 점'],['grow','겹친 줄무늬']]; let pick=[];
  openModal(`<div class="eb">자물쇠</div><h2>서류함 그림 자물쇠</h2><p>뚜껑에 이렇게 새겨져 있다. "부서짐에는 순서가 있다. 처음부터 끝까지 차례로 누르시오."</p><div class="tiles" id="tiles">${tiles.map(([k,n])=>`<button type="button" class="tile" data-k="${k}">${ICON[k]}<span>${n}</span></button>`).join('')}</div><p id="lockmsg" class="src" role="status">누른 순서: 없음</p><div class="row"><button class="ghost" id="tReset" type="button">다시 누르기</button><button class="ghost" data-close type="button">물러나기</button></div>`);
  const upd=()=>{ $('lockmsg').textContent='누른 순서: '+(pick.length?pick.map(k=>tiles.find(t=>t[0]===k)[1]).join(' → '):'없음'); document.querySelectorAll('.tile').forEach(b=>b.classList.toggle('on',pick.includes(b.dataset.k))); };
  $('tiles').onclick=e=>{ const b=e.target.closest('.tile'); if(!b||pick.includes(b.dataset.k)) return; pick.push(b.dataset.k); blip(700+pick.length*120,.06,'square',.06); upd();
    if(pick.length===3){ if(pick.join()==='start,grow,final'){ blip(780,.3); closeModal(); onOpen(); } else { penalty(20); pick=[]; setTimeout(()=>{ if($('lockmsg')){ upd(); $('lockmsg').textContent='순서가 틀렸다. (20초 줄어듦)'; } },10); } } };
  $('tReset').onclick=()=>{ pick=[]; upd(); }; }
/* 회전 굽힘 모형 */
function crankGame(){
  openModal(`<div class="eb">창고 안 모형</div><h2>손잡이 달린 차축 모형</h2><p>기술자가 만든 모형이다. 축이 살짝 휜 채로 돌고, 표면의 빨간 점에 걸리는 힘이 바늘로 표시된다.</p>
   <div class="crank"><svg viewBox="0 0 200 200" width="180" height="180" aria-label="회전하는 축의 단면"><circle cx="100" cy="100" r="70" fill="#59646c" stroke="#f1ece2"/><line x1="20" y1="100" x2="180" y2="100" stroke="#f1ece2" stroke-dasharray="4 4" opacity=".4"/><text x="100" y="22" fill="#f29a85" font-size="12" text-anchor="middle">위쪽: 당김(인장)</text><text x="100" y="190" fill="#8fc0ea" font-size="12" text-anchor="middle">아래쪽: 누름(압축)</text><circle id="cdot" cx="100" cy="30" r="8" fill="#e04a3a"/></svg>
   <div class="gauge"><div id="gneedle"></div><span>인장</span><span>압축</span></div></div>
   <p id="lockmsg" class="src" role="status">손잡이를 돌려 보세요.</p><div class="row"><button id="cTurn" type="button">한 바퀴 돌리기</button><button class="ghost" data-close type="button">물러나기</button></div><div id="cQ"></div>`);
  let busy=false, turns=0;
  $('cTurn').onclick=()=>{ if(busy) return; busy=true; let a=0; const t0=performance.now();
    const f=now=>{ a=Math.min(1,(now-t0)/1600)*Math.PI*2; const x=100+70*Math.sin(a), y=100-70*Math.cos(a); const d=$('cdot'); if(!d) return; d.setAttribute('cx',x); d.setAttribute('cy',y);
      $('gneedle').style.transform=`translateY(${-Math.cos(a)*40}px)`; if(Math.abs(Math.sin(a*2))<.05) blip(Math.cos(a)>0?520:300,.04,'triangle',.04);
      if(a<Math.PI*2) requestAnimationFrame(f); else { busy=false; turns++; $('lockmsg').textContent=`${turns}바퀴 돌렸다.`;
        if(turns>=1&&!$('cQ').innerHTML) $('cQ').innerHTML=`<fieldset><legend>한 바퀴 도는 동안 빨간 점은?</legend><div class="row"><button type="button" class="ghost" data-a="0">계속 당겨지기만 한다</button><button type="button" class="ghost" data-a="1">한 번 당겨지고 한 번 눌린다</button><button type="button" class="ghost" data-a="2">아무 힘도 받지 않는다</button></div></fieldset>`; } };
    requestAnimationFrame(f); };
  $('cQ').onclick=e=>{ const b=e.target.closest('button'); if(!b) return; if(b.dataset.a==='1'){ closeModal(); flags.crank=true; give('crank'); } else penalty(10,'다시 돌려 보며 바늘을 보세요. (10초 줄어듦)'); }; }
/* 최종 자물쇠 */
const FINAL=[['원인',['진동 때문에 쇠가 결정질로 변했다','과속으로 한 번에 큰 힘이 걸렸다','처음부터 불량한 쇠였다','반복되는 하중으로 균열이 조금씩 자랐다'],3],
 ['시작점',['차축 중심부의 내부 결함','저널 어깨 모서리의 표면','두 바퀴 사이 한가운데 표면'],1],
 ['대책',['더 단단한 쇠로 바꾼다','속도를 절반으로 줄인다','모서리를 둥글게 깎고, 달린 거리를 적어 정해진 때 바꾼다'],2]];
function finalLock(){
  const v=[0,0,0];
  const draw=()=>{ $('fdials').innerHTML=FINAL.map(([l,o],i)=>`<div class="fdial"><span class="fl">${l}</span><button type="button" data-i="${i}" data-d="-1" aria-label="${l} 이전">◀</button><b>${o[v[i]]}</b><button type="button" data-i="${i}" data-d="1" aria-label="${l} 다음">▶</button></div>`).join(''); };
  openModal(`<div class="eb">조사위원회</div><h2>보고 상자</h2><p>상자에는 다이얼이 세 줄 달려 있다. 원인, 시작점, 대책이 모두 맞아야 열린다.</p><div id="fdials"></div><p id="lockmsg" class="src" role="status"></p><div class="row"><button id="fOpen" type="button">열어 보기</button><button class="ghost" data-close type="button">더 조사하기</button></div>`);
  draw(); $('fdials').onclick=e=>{ const b=e.target.closest('button'); if(!b) return; const i=+b.dataset.i, n=FINAL[i][1].length; v[i]=(v[i]+(+b.dataset.d)+n)%n; blip(900,.03,'square',.04); draw(); };
  $('fOpen').onclick=()=>{ const right=FINAL.filter((f,i)=>v[i]===f[2]).length; if(right===3){ finished=true; blip(520,.1); blip(660,.1,'sine',.15,.1); blip(880,.4,'sine',.15,.2); verdict(); } else penalty(30,`딸깍, 맞물린 다이얼은 ${right}줄뿐이다. (30초 줄어듦)`); }; }
function verdict(){
  const tl=Math.max(0,timeLeft), score=Math.max(10,Math.min(100,Math.round(60+40*tl/TIME_LIMIT)-miss*4-hints*6));
  try{ const k='mt-score-1'; if(score>(+localStorage.getItem(k)||0)) localStorage.setItem(k,score); localStorage.setItem('mt-done-1','1'); }catch(e){}
  openModal(`<div class="eb">${score>=90?'수석 조사관':score>=70?'조사관':'수습 조사관'}</div><div class="score">${score}<span style="font-size:1rem;color:var(--muted)"> / 100점</span></div>
    <p>걸린 시간 ${fmt(TIME_LIMIT-tl)}${timeLeft<=0?' (제한 시간 초과)':''} · 자물쇠 실수 ${miss}번 · 힌트 ${hints}번</p>
    <div class="fb"><b>원인 · 피로</b><br>매끈한 면의 줄무늬는 균열이 오랜 시간 조금씩 자란 흔적이고, 거친 면은 남은 단면이 버티지 못해 한 번에 끊어진 자리입니다.</div>
    <div class="fb"><b>시작점 · 저널 어깨 모서리</b><br>지름이 갑자기 바뀌는 모서리에는 응력이 몰립니다. 회전 굽힘에서는 표면 응력이 가장 크므로 균열은 표면에서 시작해 안으로 자랍니다.</div>
    <div class="fb"><b>대책 · 둥근 모서리와 수명 관리</b><br>모서리를 둥글게 하면 응력집중이 줄고, 달린 거리를 관리하면 균열이 위험한 크기로 자라기 전에 바꿀 수 있습니다.</div>
    <h3 style="margin-top:16px">실제로는 어떻게 되었나</h3><p>당시에는 금속 피로라는 개념이 없었습니다. 많은 기술자가 진동이 쇠를 결정질로 바꾼다고 믿었습니다. 1843년 윌리엄 랭킨은 균열이 저널 목 둘레의 미세한 틈에서 시작해 중심으로 서서히 파고든다고 설명하고, 어깨를 큰 곡선으로 만들라고 제안했습니다.</p><p>프랑스 정부 조사위원회는 차축 수명을 시험으로 정하고 사용 거리를 관리해 교체하라고 권고했습니다. 승객을 객실에 가두는 관행도 사라졌습니다. 1856년부터 1870년까지 아우구스트 뵐러의 차축 시험에서 오늘날의 S-N 곡선이 나왔습니다.</p>
    <p class="src"><span class="tag" style="margin:0 6px 0 0">재구성</span>자물쇠, 소지품, 대사, 운행 장부와 의견서의 내용은 게임을 위해 만든 것입니다. 자료: <a href="https://en.wikipedia.org/wiki/Versailles_rail_accident">Wikipedia, Versailles rail accident</a> · Rankine (1843), Minutes of the Institution of Civil Engineers · Sendeckyj (2006)</p>
    <div class="row"><a class="btnlink" href="ch2.html">다음 사건</a><a class="btnlink ghost" href="index.html">사건 목록</a><button id="again" type="button" class="ghost">처음부터 다시</button></div>`);
  $('again').onclick=()=>location.reload(); }
