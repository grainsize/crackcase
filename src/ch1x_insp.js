/* ================= 파단면 관찰 (확대경) ================= */
const OBS=[['물결 줄무늬','매끈한 면 위에 물결 같은 줄무늬가 겹겹이 있다. 줄무늬는 모두 한쪽으로 모여드는 동심원처럼 휘어 있다.',[-.045,-.005]],
 ['매끈한 면','단면의 대부분이 어둡고 매끈하다. 맞닿은 두 면이 오래 서로 문질러진 것처럼 닳았다.',[.0,-.085]],
 ['거친 면','반대쪽 가장자리만 밝고 거칠다. 알갱이가 반짝이고 닳은 흔적이 없다.',[.1,.05]]];
const PICK=[['가',[-.121,-.044]],['나',[0,0]],['다',[.07,.095]],['라',[-.02,-.1]]];
const inspPts=OBS.map(o=>new T.Vector3(o[2][0],o[2][1],.003)).concat(PICK.map(p=>new T.Vector3(p[1][0],p[1][1],.003)));
const inspLight=new T.PointLight(0xfff0d8,1.1,3,2); inspLight.visible=false; scene.add(inspLight);
let insp=null;
const mks=OBS.map((o,k)=>[String(k+1),o[0]]).concat(PICK.map(p=>[p[0],'시작점 후보 '+p[0]])).map(([l,a],k)=>{ const b=document.createElement('button'); b.type='button'; b.className='mk'+(k>=3?' pick':''); b.textContent=l; b.hidden=true; b.setAttribute('aria-label',a); b.onclick=()=>inspClick(k); document.body.appendChild(b); return b; });
function inspSet(){ mks.forEach((m,k)=>{ m.dataset.on=(insp&&(insp.phase===1?k<3:k>=3))?'1':''; m.classList.toggle('seen',insp&&k<3&&insp.seen.has(k)); }); }
function inspClick(k){ if(!insp) return;
  if(insp.phase===1&&k<3){ insp.seen.add(k); blip(520+k*90,.14); $('ititle').textContent=(k+1)+'. '+OBS[k][0]; $('itxt').textContent=OBS[k][1];
    if(insp.seen.size===3){ $('idone').disabled=false; $('idone').textContent='시작점 고르기'; } inspSet(); return; }
  if(insp.phase===2&&k>=3){ if(k===3){ flags.origin=true; blip(780,.3); endInspect(); give('sketch'); }
    else { miss++; timeLeft=Math.max(0,timeLeft-15); hud(); blip(160,.35,'sawtooth',.12); $('itxt').textContent=`${PICK[k-3][0]}는 아니다. 줄무늬가 어디로 모여드는지 다시 보자. (15초 줄어듦)`; } } }
function startInspect(){ if(!fracFace) return; insp={phase:flags.origin?2:1,seen:new Set(),mx:0,my:0}; paused=true; keys={}; player.g.visible=false;
  ['top','btns','keys','stick','tbtn','prompt'].forEach(i=>$(i).hidden=true); $('insp').hidden=false; $('vig').hidden=false; inspLight.visible=true;
  $('ititle').textContent='확대경으로 본 파단면'; $('itxt').textContent='번호가 붙은 세 곳을 눌러 살펴보세요. 마우스를 움직이면 보는 각도가 바뀝니다.'; $('idone').disabled=true; $('idone').textContent='세 곳을 모두 보세요';
  if(insp.phase===2) toPick(); inspSet(); }
function toPick(){ insp.phase=2; $('ititle').textContent='균열은 어디에서 시작했을까?'; $('itxt').textContent='가, 나, 다, 라 가운데 균열이 처음 생긴 곳을 누르세요. 틀리면 15초가 줄어듭니다.'; $('idone').disabled=false; $('idone').textContent='나가기'; inspSet(); }
function endInspect(){ if(!insp) return; insp=null; paused=false; player.g.visible=true; $('insp').hidden=true; $('vig').hidden=true; mks.forEach(m=>{ m.hidden=true; m.dataset.on=''; }); inspLight.visible=false;
  ['top','btns','keys','stick','tbtn'].forEach(i=>$(i).hidden=false); canvas.focus(); }
$('idone').onclick = ()=>{ if(insp&&insp.phase===1&&insp.seen.size===3) toPick(); else endInspect(); };
addEventListener('pointermove', e=>{ if(insp){ insp.mx=e.clientX/innerWidth-.5; insp.my=e.clientY/innerHeight-.5; } });

