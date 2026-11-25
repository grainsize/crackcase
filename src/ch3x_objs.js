/* ================= 상호작용 대상 ================= */
const OBJS=[
 {id:'radio', t:'잠수정 무전기', who:'지원선 무전', verb:'교신하기', pos:[30,-30.6], show:()=>true, done:()=>flags.radio,
  act(){ say([['조사관','지원선, 해저 도착. 1912년 기록부터 읽어 주시오.',420],['지원선 · 기록 담당','생존자들은 충돌이 생각보다 가벼웠다고 했습니다. 밤 11시 40분쯤 살짝 덜컥하고, 몇 초 동안 긁히는 소리가 났다고요.',320],
    ['조사관','그런데 배는 세 시간도 못 버텼지. 물이 어디로 들어왔는지 찾아보겠소.',420],['지원선 · 기록 담당','장비함 잠금은 충돌 시각으로 맞춰 두었습니다. 24시간제 네 자리입니다. 시료 집게가 들어 있어요.',320]],
    ()=>{ flags.radio=true; give('log'); }); }},
 {id:'locker', t:'장비함', who:'잠수정 장비함', verb:'자물쇠 풀기', pos:[25.2,-28.6], show:()=>true, done:()=>flags.locker,
  act(){ if(flags.locker) return say([['조사관','이미 비어 있다.',420]]);
    digitLock('잠수정 장비함','네 자리 숫자 자물쇠다. 빙산을 스친 시각, 24시간제로 맞춰 두었다고 했다.',4,'2340',()=>{ flags.locker=true; openToolbox(); setTimeout(()=>{ toolLid.userData.torch.visible=false; give('tongs'); },700); }); }},
 {id:'rivetdig', t:'리벳 이음 강판', who:'잔해밭의 리벳 이음 강판', verb:'진흙 뒤지기', pos:[-9.6,-14.2], show:()=>true, done:()=>has('rivet'),
  act(){ if(has('rivet')) return say([['조사관','리벳은 이미 주웠다. 구멍이 줄지어 비어 있다.',420]]);
    if(!has('tongs')) return say([['조사관','판 가장자리 리벳 구멍이 많이 비어 있다. 진흙 속에 뭔가 반짝이는데, 두꺼운 장갑으로는 집을 수가 없다.',420]]);
    searching={t:0, fin:()=>{ clockGlint.visible=false; clockMesh.visible=false; give('rivet'); }}; paused=true; keys={}; blip(300,.2,'triangle',.06); }},
 {id:'section', t:'시편 상자', who:'잠수정 시편 상자', verb:'리벳 잘라 보기', pos:[34.6,-26.6], show:()=>true, done:()=>flags.section,
  act(){ if(!has('rivet')&&!flags.section) return say([['조사관','작은 절단기와 연마기가 들어 있는 상자다. 자를 시료가 있어야 한다.',420]]); startInspect(); }},
 {id:'sonar', t:'음파 탐지기', who:'선수 오른쪽 음파 탐지기', verb:'옆판 훑기', pos:[11.1,85.4], show:()=>true, done:()=>flags.sonar,
  act(){ if(flags.sonar) return say([['조사관','이미 훑었다. 틈은 앞쪽 여섯 구획에 걸쳐 있었다.',420]]); sonarGame(); }},
 {id:'compart', t:'위치 표지 부표', who:'위치 표지 부표 무전', verb:'교신하기', pos:[-22,12.4], show:()=>true, done:()=>has('compart'),
  act(){ say([['지원선 · 선박 공학자','이 배는 방수 구획 16개로 나뉘어 있었습니다. 앞쪽 네 구획까지는 물이 차도 뜨도록 설계됐지요.',280],
    ['지원선 · 선박 공학자','문제는 칸막이벽이 맨 위 갑판까지 올라가지 않았다는 겁니다. 앞이 가라앉으면 물이 벽을 넘어 다음 칸으로 넘어갑니다.',280]], ()=>give('compart')); }},
 {id:'myth', t:'부표 무전', who:'위치 표지 부표 무전', verb:'교신하기', pos:[-26,-27.6], show:()=>true, done:()=>has('myth'),
  act(){ say([['지원선 · 기자','1912년 신문들은 빙산이 옆구리를 100 m 가까이 길게 찢었다고 썼지요. 다들 그렇게 믿었습니다.',380],['조사관','그 구멍을 직접 본 사람이 있었소?',420],['지원선 · 기자','…없었습니다. 선수부는 수십 년 동안 진흙에 묻혀 있었으니까요.',380]], ()=>give('myth')); }},
 {id:'speed', t:'기관 전령기', who:'잔해밭의 기관 전령기', verb:'살펴보기', pos:[-16.2,-42.2], show:()=>true, done:()=>has('speed'),
  act(){ say([['조사관','선교의 기관 전령기다. 바늘이 전속 전진 근처에 있다.',420],['지원선 · 기록 담당','빙산 경고를 여러 번 받고도 거의 최고 속도로 달리고 있었습니다.',320]], ()=>give('speed')); }},
 {id:'plate', t:'선체 조각', who:'잔해밭의 큰 선체 조각', verb:'가장자리 보기', pos:[5.2,-35.6], show:()=>true, done:()=>has('plate'),
  act(){ say([['조사관','깨진 가장자리가 평평하다. 휘지 않고 단번에 깨졌다.',420]], ()=>give('plate')); }},
 {id:'case', t:'분석 보고함', who:'잠수정 앞 분석 보고함', verb:'자물쇠 풀기', pos:[30.6,-17.2], show:()=>true, done:()=>flags.case,
  act(){ if(flags.case) return say([['조사관','서류는 이미 꺼냈다.',420]]); seqLock(()=>{ flags.case=true; chestOpenT=0; chestLid.userData.lock.visible=false; setTimeout(()=>give(['charpy','chem']),600); }); }},
 {id:'final', t:'원격 청문회', who:'잠수정 해치 무전 단말', verb:'청문회 열기', pos:[26.6,-24], show:()=>true, done:()=>finished,
  act(){ if(finished) return verdict(); if(!flags.section) return say([['지원선 · 조사 책임자','증거 없이 보고할 셈이오? 회수한 시료부터 직접 들여다보시오.',230]]);
    startHearing(); }}
];
const spots = OBJS.map(o=>{ const [x,z]=o.pos, y=gh(x,z), g=new T.Group();
  const m=new T.MeshStandardMaterial({color:0xe2b257,emissive:0xe2a23a,emissiveIntensity:1.6,roughness:.4});
  const d=mesh(new T.OctahedronGeometry(.22),m,0,2.6,0,g); d.castShadow=false; const r=mesh(new T.RingGeometry(.65,.78,32),new T.MeshBasicMaterial({color:0xe2b257,transparent:true,opacity:.75,side:T.DoubleSide,depthWrite:false}),0,.06,0,g); r.rotation.x=-Math.PI/2; r.castShadow=false;
  g.position.set(x,y,z); scene.add(g); const el=document.createElement('div'); el.className='lbl'; $('labels').appendChild(el); return {o,g,d,r,m,el,x,z}; });
