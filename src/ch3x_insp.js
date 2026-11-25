/* ================= 리벳 단면 관찰 ================= */
const OBS=[['검은 줄무늬','몸통을 따라 검은 줄무늬가 빽빽하게 늘어서 있다. 연철 속에 섞인 슬래그다. 보통보다 훨씬 많아 보인다.',[-.13,.025]],
 ['꺾이는 결','머리 쪽으로 가면 줄무늬가 거의 직각으로 꺾여 머리 둘레를 따라 돈다. 몸통과 머리의 결이 서로 엇갈린다.',[.16,.075]],
 ['머리 밑 금','몸통과 머리가 만나는 곳 아래쪽에 가느다란 금이 있다. 결이 꺾인 바로 그 자리다.',[.1,-.1]]];
const PICK=[['가',[-.2,-.02]],['나',[.1,-.05]],['다',[.2,.02]],['라',[-.05,.03]]], PICK_OK=1;
const INSP_D=.62, INSP_SW=.35, INSP_V=.22;
const inspPts=OBS.map(o=>new T.Vector3(o[2][0],o[2][1],.003)).concat(PICK.map(p=>new T.Vector3(p[1][0],p[1][1],.003)));
const inspLight=new T.PointLight(0xfff0d8,1.3,3,2); inspLight.visible=false; scene.add(inspLight);
let insp=null;
const mks=OBS.map((o,k)=>[String(k+1),o[0]]).concat(PICK.map(p=>[p[0],'끊어지는 곳 후보 '+p[0]])).map(([l,a],k)=>{ const b=document.createElement('button'); b.type='button'; b.className='mk'+(k>=3?' pick':''); b.textContent=l; b.hidden=true; b.setAttribute('aria-label',a); b.onclick=()=>inspClick(k); document.body.appendChild(b); return b; });
function inspSet(){ mks.forEach((m,k)=>{ m.dataset.on=(insp&&(insp.phase===1?k<3:k>=3))?'1':''; m.classList.toggle('seen',insp&&k<3&&insp.seen.has(k)); }); }
function inspClick(k){ if(!insp) return;
  if(insp.phase===1&&k<3){ insp.seen.add(k); blip(520+k*90,.14); $('ititle').textContent=(k+1)+'. '+OBS[k][0]; $('itxt').textContent=OBS[k][1];
    if(insp.seen.size===3){ $('idone').disabled=false; $('idone').textContent='끊어지는 곳 고르기'; } inspSet(); return; }
  if(insp.phase===2&&k>=3){ if(k-3===PICK_OK){ flags.section=true; blip(780,.3); endInspect(); give('section'); }
    else { miss++; timeLeft=Math.max(0,timeLeft-15); hud(); blip(160,.35,'sawtooth',.12); $('itxt').textContent=`${PICK[k-3][0]}는 아니다. 결이 꺾이고 금이 간 곳을 다시 보자. (15초 줄어듦)`; } } }
function startInspect(){ if(!fracFace) return; insp={phase:flags.section?2:1,seen:new Set(),mx:0,my:0}; paused=true; keys={}; player.g.visible=false; if(player.hat) player.hat.visible=false;
  ['top','btns','keys','stick','tbtn','prompt'].forEach(i=>$(i).hidden=true); $('insp').hidden=false; $('vig').hidden=false; inspLight.visible=true;
  $('ititle').textContent='세로로 잘라 닦은 리벳 단면'; $('itxt').textContent='번호가 붙은 세 곳을 눌러 살펴보세요. 마우스를 움직이면 보는 각도가 바뀝니다.'; $('idone').disabled=true; $('idone').textContent='세 곳을 모두 보세요';
  if(insp.phase===2) toPick(); inspSet(); }
function toPick(){ insp.phase=2; $('ititle').textContent='빙산이 스칠 때 리벳은 어디서 끊어졌을까?'; $('itxt').textContent='가, 나, 다, 라 가운데 리벳이 끊어지는 곳을 누르세요. 틀리면 15초가 줄어듭니다.'; $('idone').disabled=false; $('idone').textContent='나가기'; inspSet(); }
function endInspect(){ if(!insp) return; insp=null; paused=false; player.g.visible=true; if(player.hat) player.hat.visible=true; $('insp').hidden=true; $('vig').hidden=true; mks.forEach(m=>{ m.hidden=true; m.dataset.on=''; }); inspLight.visible=false;
  ['top','btns','keys','stick','tbtn'].forEach(i=>$(i).hidden=false); canvas.focus(); }
$('idone').onclick = ()=>{ if(insp&&insp.phase===1&&insp.seen.size===3) toPick(); else endInspect(); };
addEventListener('pointermove', e=>{ if(insp){ insp.mx=e.clientX/innerWidth-.5; insp.my=e.clientY/innerHeight-.5; } });

