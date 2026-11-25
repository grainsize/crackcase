/* ================= 상호작용 대상 ================= */
const OBJS=[
 {id:'witness', t:'당직 선원', who:'당직 선원', verb:'이야기하기', pos:[13.2,-34.4], show:()=>true, done:()=>flags.witness,
  act(){ say([['조사관','어젯밤 당직이었다고 들었소. 무슨 일이 있었소?',420],['당직 선원','배는 부두에 가만히 묶여 있었습니다. 짐도 없고 바람도 없고 물도 잔잔했어요. 그런데 새벽에 대포 쏘는 것 같은 소리가 한 번 났습니다.',300],
    ['당직 선원','삐걱거림 같은 예고는 전혀 없었어요. 갑판엔 서리가 하얗게 앉아 있었고요. 그 소리에 선원실 벽시계가 떨어져 갈라진 틈 쪽 갑판으로 굴러갔습니다.',300],
    ['당직 선원','참, 시험소 기사가 손전등을 공구함에 넣어 두고 갔어요. 번호는 그 굉음이 난 시각으로 바꿨다는데, 정확히 몇 시였는지는 저도 모릅니다.',300]],
    ()=>{ flags.witness=true; hud(); sub('굉음이 난 시각. 떨어진 벽시계가 알고 있겠다.','조사관'); }); }},
 {id:'harbor', t:'항만 관리인', who:'항만 관리인', verb:'기온 기록 보기', pos:[16.6,-49.2], show:()=>true, done:()=>flags.weather,
  act(){ if(flags.weather) return weatherLog(); say([['조사관','어젯밤 기온 기록을 볼 수 있겠소?',420],['항만 관리인','백엽상 온도계는 매일 밤 적어 둡니다. 어젯밤은 유난히 추웠지요.',330]], weatherLog); }},
 {id:'tech', t:'시험소 기사', who:'시험소 기사', verb:'이야기하기', pos:[25.4,-12.6], show:()=>true, done:()=>flags.tech,
  act(){ say([['시험소 기사','선체에서 떼어 낸 강판으로 시편을 만들어 두었습니다. 상온에서 당겨 보면 아무 문제가 없어요.',330],
    ['시험소 기사','그런데 홈을 낸 시편을 진자로 쳐 보면 이야기가 달라질지도 모릅니다. 온도를 바꿔 가며 직접 쳐 보세요.',330],
    ['시험소 기사','아, 손전등은 공구함에 있어요. 번호는 오늘 새벽 일을 잊지 말자고 그 시각으로 바꿨습니다.',330]], ()=>{ flags.tech=true; hud(); }); }},
 {id:'debris', t:'갑판 잔해', who:'갈라진 틈 앞 잔해 더미', verb:'뒤지기', pos:[-1.7,6.7], show:()=>true, done:()=>has('clock')||flags.toolbox,
  act(){ if(has('clock')||flags.toolbox) return say([['조사관','더 나올 것은 없다.',420]]);
    searching={t:0, fin:()=>{ clockGlint.visible=false; clockMesh.visible=false; give('clock'); }}; paused=true; keys={}; blip(300,.2,'triangle',.06); }},
 {id:'toolbox', t:'시험소 공구함', who:'시험소 공구함', verb:'자물쇠 풀기', pos:[27.9,-15.2], show:()=>true, done:()=>flags.toolbox,
  act(){ if(flags.toolbox) return say([['조사관','이미 비어 있다.',420]]);
    digitLock('시험소 공구함','네 자리 숫자 자물쇠다. 굉음이 난 시각으로 바꿔 두었다고 했다.',4,'0510',()=>{ flags.toolbox=true; openToolbox(); setTimeout(()=>{ toolLid.userData.torch.visible=false; give('torch'); },700); }); }},
 {id:'specimen', t:'파단면 시편', who:'균열 시작부에서 잘라 온 시편', verb:'비춰 보기', pos:[14.7,13.2], show:()=>true, done:()=>flags.origin,
  act(){ if(!has('torch')&&!flags.origin) return say([['조사관','너무 어둡고 서리까지 껴서 아무것도 안 보인다. 불빛이 있어야겠다.',420]]); startInspect(); }},
 {id:'path', t:'갈라진 옆면', who:'부두 끝에서 본 선체 옆면', verb:'균열 따라가기', pos:[10.4,8.4], show:()=>true, done:()=>has('path'),
  act(){ if(has('path')) return say([['조사관','균열 경로는 이미 적어 두었다.',420]]);
    say([['조사관','갈라진 옆면을 위에서 아래로 따라가 보자.',420],['조사관','갑판의 화물창 모서리에서 시작해 갑판을 건너고, 옆판을 타고 내려가 바닥판 앞에서 멈췄다. 용접선과는 상관없이 판 한가운데를 가로질렀다.',420]], ()=>give('path')); }},
 {id:'weld', t:'용접 이음', who:'균열 옆 갑판 용접 이음', verb:'살펴보기', pos:[-5.4,7.6], show:()=>true, done:()=>has('weld'),
  act(){ if(has('weld')) return say([['조사관','용접부는 이미 보았다.',420]]);
    say([['조사관','용접 비드에 구멍과 패인 자국이 몇 군데 있다. 급하게 지은 배다.',420],['조사관','그런데 균열은 여기서 시작하지 않았다. 용접 이음을 만나고도 멈추지 않고 그대로 건너갔다.',420]], ()=>give('weld')); }},
 {id:'charpy', t:'충격 시험기', who:'시험소의 진자 충격 시험기', verb:'시험하기', pos:[26.2,-9.4], show:()=>true, done:()=>flags.charpy, act(){ charpyGame(); }},
 {id:'tensile', t:'인장 시험기', who:'시험소의 인장 시험기', verb:'시험하기', pos:[26.2,-17.8], show:()=>true, done:()=>has('tensile'),
  act(){ if(has('tensile')) return say([['조사관','상온 인장 시험은 이미 했다.',420]]);
    searching={t:0, fin:()=>give('tensile')}; paused=true; keys={}; blip(220,.4,'sawtooth',.05); }},
 {id:'rivet', t:'늙은 리벳공', who:'은퇴한 리벳공', verb:'이야기하기', pos:[17.6,25.4], show:()=>true, done:()=>has('rivet'),
  act(){ say([['조사관','예전에 리벳으로 배를 만드셨다고요?',420],['늙은 리벳공','사십 년을 했지. 같은 제철소 강판으로 지은 리벳선도 겨울 바다를 다니지만, 이렇게 두 동강 났다는 얘긴 못 들었네.',220],
    ['늙은 리벳공','금이 가도 판 하나에서 멈춰. 판과 판 사이 이음매에서 끊기거든. 용접한 배는 통째로 한 장짜리 강판이나 마찬가지야.',220]], ()=>give('rivet')); }},
 {id:'boss', t:'조선소 감독', who:'조선소 감독', verb:'이야기하기', pos:[5.4,-11.6], show:()=>true, done:()=>flags.boss,
  act(){ say([['조선소 감독','뻔하지 않소. 몇 주 배운 용접공들이 대충 붙인 탓이오. 다 갈아 치워야 하오.',250],['조사관','균열이 어디서 시작했는지는 확인하셨습니까?',420],
    ['조선소 감독','…그건 위원회가 볼 일이오. 내 옆 서류함에 리벳선 기록과 설계 검토서가 있소. 위원회가 균열이 지나간 길을 아는 사람만 열 수 있게 잠가 두었다더군.',250]], ()=>{ flags.boss=true; hud(); }); }},
 {id:'chest', t:'증거 서류함', who:'증거 서류함', verb:'자물쇠 풀기', pos:[2.6,-12.4], show:()=>true, done:()=>flags.chest,
  act(){ if(flags.chest) return say([['조사관','서류는 이미 꺼냈다.',420]]); seqLock(()=>{ flags.chest=true; chestOpenT=0; chestLid.userData.lock.visible=false; setTimeout(()=>give(['record','design']),600); }); }},
 {id:'final', t:'보고 상자', who:'조사위원회 보고 상자', verb:'다이얼 맞추기', pos:[22.2,-31.4], show:()=>true, done:()=>finished,
  act(){ if(finished) return verdict(); if(!flags.origin) return say([['조사위원','증거도 없이 보고할 셈이오? 균열 시작부의 파단면부터 보고 오시오.',230]]);
    say([['조사위원','결론이 났소? 상자의 다이얼을 맞추면 보고서가 접수되오.',230]], finalLock); }}
];
const spots = OBJS.map(o=>{ const [x,z]=o.pos, y=gh(x,z), g=new T.Group();
  const m=new T.MeshStandardMaterial({color:0xe2b257,emissive:0xe2a23a,emissiveIntensity:1.6,roughness:.4});
  const d=mesh(new T.OctahedronGeometry(.2),m,0,2.5,0,g); d.castShadow=false; const r=mesh(new T.RingGeometry(.6,.72,32),new T.MeshBasicMaterial({color:0xe2b257,transparent:true,opacity:.7,side:T.DoubleSide,depthWrite:false}),0,.06,0,g); r.rotation.x=-Math.PI/2; r.castShadow=false;
  g.position.set(x,y,z); scene.add(g); const el=document.createElement('div'); el.className='lbl'; $('labels').appendChild(el); return {o,g,d,r,m,el,x,z}; });
