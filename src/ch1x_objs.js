/* ================= 상호작용 대상 ================= */
function timetable(){ flags.board=true; hud();
  openModal(`<div class="eb">출발 지점 게시판</div><h2>운행표</h2><p>베르사유 좌안역 → 파리 · 1842년 5월 8일 일요일</p>
   <table class="tt"><tr><th>출발</th><th>비고</th></tr><tr><td>13시 00분</td><td></td></tr><tr><td>15시 00분</td><td></td></tr><tr><td>17시 30분</td><td class="fete">★ 분수 축제 특별 열차</td></tr><tr><td>19시 00분</td><td></td></tr><tr><td>21시 30분</td><td class="fete">★ 분수 축제 특별 열차</td></tr></table>
   <p class="src">5월 초 파리의 해는 저녁 7시 반 무렵에 집니다.</p><div class="row"><button data-close type="button">닫기</button></div>`); }
const OBJS=[
 {id:'witness', t:'다친 승객', who:'다친 승객', verb:'이야기하기', pos:[7.2,-13.6], show:()=>true, done:()=>flags.witness,
  act(){ say([['조사관','어제 그 열차에 타셨지요?',420],['다친 승객','앞에서 세 번째 객차였소. 기관차가 갑자기 앞으로 주저앉았지. 과속도, 충돌도 아니었소.',300],
    ['다친 승객','참, 역장이 부러진 차축을 창고에 넣고 잠갔소. 열쇠는 기관차 옆 공구함에 넣었는데, 그 자물쇠 번호가 우리 열차 출발 시각이라더군.',300],
    ['다친 승객','분수 축제가 끝나자마자, 해 지기 전에 떠난 열차였소.',300]], ()=>{ flags.witness=true; hud(); sub('출발 시각이라. 출발 지점 게시판에 운행표가 있었다.','조사관'); }); }},
 {id:'board', t:'운행표', who:'출발 지점 게시판', verb:'읽기', pos:[4.2,-34.8], show:()=>true, done:()=>flags.board&&(has('key')||flags.shed), act(){ timetable(); }},
 {id:'toolbox', t:'공구함', who:'기관차 공구함', verb:'자물쇠 풀기', pos:[3.4,6.9], show:()=>true, done:()=>has('key')||flags.shed,
  act(){ if(has('key')||flags.shed) return say([['조사관','이미 비어 있다.',420]]);
    digitLock('기관차 공구함','네 자리 숫자 자물쇠가 채워져 있다. 사고 열차의 출발 시각이라고 했다.',4,'1730',()=>{ openToolbox(); setTimeout(()=>give('key'),700); }); }},
 {id:'shed', t:'증거 창고', who:'증거 창고 문', verb:'열기', pos:[-1.9,-6], show:()=>true, done:()=>flags.shed,
  act(){ if(flags.shed) return; if(!has('key')) return say([['조사관','자물쇠가 단단히 채워져 있다. 열쇠가 있어야 한다.',420]]);
    inv=inv.filter(k=>k!=='key'); flags.shed=true; openShed(); hud(); sub('문이 열렸다. 안에 차축 조각과 이상한 모형이 있다.','조사관'); }},
 {id:'engineer', t:'철도 기술자', who:'철도 기술자', verb:'이야기하기', pos:[-6.2,23.4], show:()=>true, done:()=>flags.eng,
  act(){ say([['조사관','차축이 왜 부러졌다고 보십니까?',420],['철도 기술자','뻔한 일이오. 쇠가 오랜 진동에 \'결정화\'돼서 유리처럼 깨진 거요. 단면 한쪽이 반짝이지 않소?',250],['조사관','(이상하다. 쇠는 원래 작은 결정들이 모인 결정질이다. 진동이 쇠를 결정으로 바꿀 수는 없다. 반짝이는 데는 다른 이유가 있을 거다.)',420],
    ['철도 기술자','직접 보고 싶다면 확대경이 있어야 할 거요. 그런데 내 확대경을 어젯밤 불탄 객차 옆에서 떨어뜨렸소. 찾으면 써도 좋소.',250]], ()=>{ flags.eng=true; hud(); }); }},
 {id:'debris', t:'잔해 더미', who:'불탄 객차 옆 잔해 더미', verb:'뒤지기', pos:[-3.3,2.2], show:()=>true, done:()=>has('lens')||flags.origin,
  act(){ if(has('lens')||flags.origin) return say([['조사관','더 나올 것은 없다.',420]]);
    searching={t:0, fin:()=>{ lensGlint.visible=false; give('lens'); }}; paused=true; keys={}; blip(300,.2,'triangle',.06); }},
 {id:'axle', t:'부러진 차축', who:'창고 안 차축 조각', verb:'들여다보기', pos:[-6.1,-7.3], show:()=>flags.shed, done:()=>flags.origin,
  act(){ if(!has('lens')&&!flags.origin) return say([['조사관','그을음과 녹이 덮여 결이 흐릿하다. 확대경으로 가까이 들여다봐야겠다.',420]]); startInspect(); }},
 {id:'crank', t:'회전 굽힘 모형', who:'창고 안 모형', verb:'손잡이 돌리기', pos:[-7.2,-5.4], show:()=>flags.shed, done:()=>flags.crank, act(){ crankGame(); }},
 {id:'clerk', t:'철도 회사 서기', who:'철도 회사 서기', verb:'이야기하기', pos:[9.4,-22.9], show:()=>true, done:()=>flags.clerk,
  act(){ say([['철도 회사 서기','서류함에는 회사 운행 장부와 기술자들 의견서가 들어 있습니다. 그림 자물쇠라 저도 못 엽니다.',330],['철도 회사 서기','부서짐의 순서를 아는 사람만 열 수 있다나요. 차축을 직접 들여다본 사람이라면 알겠지요.',330]], ()=>{ flags.clerk=true; hud(); }); }},
 {id:'chest', t:'서류함', who:'서기 천막의 서류함', verb:'자물쇠 풀기', pos:[9.7,-20.4], show:()=>true, done:()=>flags.chest,
  act(){ if(flags.chest) return say([['조사관','서류는 이미 꺼냈다.',420]]); seqLock(()=>{ flags.chest=true; chestOpenT=0; chestLid.userData.lock.visible=false; setTimeout(()=>give(['ledger','memo']),600); }); }},
 {id:'final', t:'조사 청문회', who:'조사위원회 청문회장', verb:'청문회 열기', pos:[9.6,-30.0], show:()=>true, done:()=>finished,
  act(){ if(finished) return verdict(); if(!flags.origin) return say([['조사위원','증거도 없이 보고할 셈이오? 차축 파단면부터 보고 오시오.',230]]);
    startHearing(); }}
];
const spots = OBJS.map(o=>{ const [x,z]=o.pos, y=gh(x,z), g=new T.Group();
  const m=new T.MeshStandardMaterial({color:0xe2b257,emissive:0xe2a23a,emissiveIntensity:1.6,roughness:.4});
  const d=mesh(new T.OctahedronGeometry(.2),m,0,2.5,0,g); d.castShadow=false; const r=mesh(new T.RingGeometry(.6,.72,32),new T.MeshBasicMaterial({color:0xe2b257,transparent:true,opacity:.7,side:T.DoubleSide,depthWrite:false}),0,.06,0,g); r.rotation.x=-Math.PI/2; r.castShadow=false;
  g.position.set(x,y,z); scene.add(g); const el=document.createElement('div'); el.className='lbl'; $('labels').appendChild(el); return {o,g,d,r,m,el,x,z}; });
