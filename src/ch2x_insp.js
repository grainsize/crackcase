/* ================= 파단면 관찰 (손전등) ================= */
const OBS=[['V자 무늬','V자 모양 줄무늬가 화살표처럼 줄지어 있다. 모든 V의 꼭짓점이 같은 쪽 끝을 가리킨다.',[-.2,0]],
 ['평평하고 반짝이는 면','면이 평평하고 작은 결정면이 반짝인다. 휘거나 늘어난 흔적이 없다. 깨진 조각을 맞대면 빈틈없이 맞을 것 같다.',[.32,-.015]],
 ['얇은 가장자리','판의 위아래 가장자리에 비스듬히 늘어난 자국(전단 립)이 거의 없다. 강판이 휘지 않고 단번에 갈라졌다.',[.58,.057]]];
const PICK=[['가',[.62,0]],['나',[.15,.02]],['다',[-.3,-.02]],['라',[-.64,0]]], PICK_OK=3;
const INSP_D=.95, INSP_SW=.7, INSP_V=.35;
const inspPts=OBS.map(o=>new T.Vector3(o[2][0],o[2][1],.003)).concat(PICK.map(p=>new T.Vector3(p[1][0],p[1][1],.003)));
const inspLight=new T.PointLight(0xfff0d8,1.3,3,2); inspLight.visible=false; scene.add(inspLight);
let insp=null;
const mks=OBS.map((o,k)=>[String(k+1),o[0]]).concat(PICK.map(p=>[p[0],'시작점 후보 '+p[0]])).map(([l,a],k)=>{ const b=document.createElement('button'); b.type='button'; b.className='mk'+(k>=3?' pick':''); b.textContent=l; b.hidden=true; b.setAttribute('aria-label',a); b.onclick=()=>inspClick(k); document.body.appendChild(b); return b; });
function inspSet(){ mks.forEach((m,k)=>{ m.dataset.on=(insp&&(insp.phase===1?k<3:k>=3))?'1':''; m.classList.toggle('seen',insp&&k<3&&insp.seen.has(k)); }); }
function inspClick(k){ if(!insp) return;
  if(insp.phase===1&&k<3){ insp.seen.add(k); blip(520+k*90,.14); $('ititle').textContent=(k+1)+'. '+OBS[k][0]; $('itxt').textContent=OBS[k][1];
    if(insp.seen.size===3){ $('idone').disabled=false; $('idone').textContent='시작점 고르기'; } inspSet(); return; }
  if(insp.phase===2&&k>=3){ if(k-3===PICK_OK){ flags.origin=true; blip(780,.3); endInspect(); give('sketch'); }
    else { miss++; timeLeft=Math.max(0,timeLeft-15); hud(); blip(160,.35,'sawtooth',.12); $('itxt').textContent=`${PICK[k-3][0]}는 아니다. V자 꼭짓점이 어느 쪽을 가리키는지 다시 보자. (15초 줄어듦)`; } } }
function startInspect(){ if(!fracFace) return; insp={phase:flags.origin?2:1,seen:new Set(),mx:0,my:0}; paused=true; keys={}; player.g.visible=false; if(player.hat) player.hat.visible=false;
  ['top','btns','keys','stick','tbtn','prompt'].forEach(i=>$(i).hidden=true); $('insp').hidden=false; $('vig').hidden=false; inspLight.visible=true;
  $('ititle').textContent='손전등으로 비춘 파단면'; $('itxt').textContent='번호가 붙은 세 곳을 눌러 살펴보세요. 마우스를 움직이면 보는 각도가 바뀝니다.'; $('idone').disabled=true; $('idone').textContent='세 곳을 모두 보세요';
  if(insp.phase===2) toPick(); inspSet(); }
function toPick(){ insp.phase=2; $('ititle').textContent='균열은 어디에서 시작했을까?'; $('itxt').textContent='가, 나, 다, 라 가운데 균열이 처음 생긴 곳을 누르세요. 틀리면 15초가 줄어듭니다.'; $('idone').disabled=false; $('idone').textContent='나가기'; inspSet(); }
function endInspect(){ if(!insp) return; insp=null; paused=false; player.g.visible=true; if(player.hat) player.hat.visible=true; $('insp').hidden=true; $('vig').hidden=true; mks.forEach(m=>{ m.hidden=true; m.dataset.on=''; }); inspLight.visible=false;
  ['top','btns','keys','stick','tbtn'].forEach(i=>$(i).hidden=false); canvas.focus(); }
$('idone').onclick = ()=>{ if(insp&&insp.phase===1&&insp.seen.size===3) toPick(); else endInspect(); };
addEventListener('pointermove', e=>{ if(insp){ insp.mx=e.clientX/innerWidth-.5; insp.my=e.clientY/innerHeight-.5; } });

