import re
s=open('/home/claude/case01/index.html',encoding='utf-8').read()
def rep(a,b):
    global s
    assert a in s, 'MISSING: '+a[:90]; s=s.replace(a,b,1)
def between(a,b,new):
    global s
    i=s.index(a); j=s.index(b,i); s=s[:i]+new+s[j:]
R=lambda f: open('/home/claude/'+f,encoding='utf-8').read()
CSS=""".claim{margin:10px 0;padding:12px 14px;border-left:3px solid #e04a3a;background:rgba(224,74,58,.08);font-family:'Noto Serif KR',serif;font-size:1.05rem}
.evid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:10px 0}
.ev{display:flex;flex-direction:column;gap:4px;text-align:left;padding:10px;border-radius:6px;border:1px solid var(--line);background:rgba(255,255,255,.04);color:inherit;font:inherit;cursor:pointer}
.ev:hover,.ev:focus-visible{border-color:var(--brass);background:rgba(226,178,87,.12)}
.ev b{color:var(--brass);font-size:.92rem}.ev small{color:var(--muted);font-size:.76rem;line-height:1.35}
#fade{transition:opacity .35s}
.btnlink{display:inline-block;font:inherit;font-weight:600;text-decoration:none;border-radius:4px;border:1px solid var(--brass);background:var(--brass);color:#1b1408;padding:8px 16px}
.btnlink.ghost{background:transparent;color:var(--brass)}
#btns .btnlink{padding:6px 12px}
.tline{display:flex;align-items:baseline;gap:10px;margin:6px 0 2px}
#timer{font-family:var(--display);font-weight:900;font-size:1.7rem;font-variant-numeric:tabular-nums;color:var(--brass)}
#timer.low{color:var(--bad)}
.inv{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px}
.chip{font-size:.75rem;padding:2px 8px;border-radius:99px;background:rgba(226,178,87,.16);border:1px solid rgba(226,178,87,.5)}
.chip.empty{background:none;border-color:var(--line);color:var(--muted)}
.dials{display:flex;gap:10px;justify-content:center;margin:14px 0}
.dial{display:flex;flex-direction:column;align-items:center;gap:4px;background:#0c1116;border:1px solid var(--line);border-radius:6px;padding:6px}
.dial b{font-family:var(--display);font-size:2.2rem;width:2.2rem;text-align:center;font-variant-numeric:tabular-nums}
.dial button,.fdial button{padding:2px 12px;background:transparent;color:var(--brass)}
.fdial{display:grid;grid-template-columns:4.2rem auto 1fr auto;gap:8px;align-items:center;margin:8px 0;background:#0c1116;border:1px solid var(--line);border-radius:6px;padding:8px}
.fdial b{font-weight:600;text-align:center;font-size:.95rem}
.fl{color:var(--brass);font-weight:700;font-size:.85rem}
.tiles{display:flex;gap:12px;justify-content:center;margin:14px 0;flex-wrap:wrap}
.tile{display:flex;flex-direction:column;align-items:center;gap:6px;background:#0c1116;color:var(--ink);border:2px solid var(--line);padding:8px}
.tile svg{width:76px;height:76px;border-radius:4px}
.tile.on{border-color:var(--brass);opacity:.6}
.crank{display:flex;gap:18px;align-items:center;justify-content:center;margin:10px 0}
.gauge{position:relative;width:46px;height:120px;border:1px solid var(--line);border-radius:4px;display:flex;flex-direction:column;justify-content:space-between;align-items:center;font-size:.72rem;padding:4px 0;color:var(--muted)}
.gauge span:first-of-type{color:var(--bad)} .gauge span:last-of-type{color:var(--blue)}
#gneedle{position:absolute;left:4px;right:4px;top:58px;height:3px;background:var(--brass);transition:none}
.tt{border-collapse:collapse;width:100%;margin:8px 0}
.tt td,.tt th{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;font-variant-numeric:tabular-nums}
.fete{color:var(--bad)}
.mk.pick{background:#8fc0ea;color:#0b1014}
.bar{display:inline-block;width:120px;height:8px;border:1px solid var(--line);border-radius:4px;margin-left:8px;vertical-align:middle}
.bar i{display:block;height:100%;background:var(--brass)}
@keyframes shake{0%,100%{transform:none}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
.shake{animation:shake .35s}
@media (prefers-reduced-motion:reduce){.shake{animation:none}}
"""
rep('</style>',CSS+'</style>')
rep('<div id="pips" aria-hidden="true"></div>\n  <small>남은 조사 점수 <b id="left"></b> / 8 · 단서 <b id="ncl">0</b>개</small>\n  <div id="goal"></div>',
    '<div class="tline"><span id="timer">15:00</span><small>남은 시간 · 실수 <b id="miss">0</b></small></div>\n  <div id="goal"></div>\n  <div id="inv" class="inv"></div>')
rep('<button class="ghost" id="bNote" type="button">수첩</button>','<a class="btnlink ghost" href="index.html">목록</a>\n  <button class="ghost" id="bHint" type="button">힌트</button>\n  <button class="ghost" id="bNote" type="button">수첩</button>')
rep('이동 WASD · 달리기 Shift · 점프 Space · 조사·대화 E · 시점 마우스 드래그','이동 WASD · 달리기 Shift · 점프 Space · 조사·사용 E · 수첩 N · 힌트 H · 시점 드래그')
rep('<button id="idone" type="button" disabled>관찰 마치기</button>','<button id="idone" type="button" disabled>세 곳을 모두 보세요</button>')
s=re.sub(r'<p class="sub">1842년 5월 8일.*?</p>\n    <p>.*?</p>\n    <div class="row"><button id="bStart" type="button">현장으로 들어가기</button></div>',
 '<p class="sub">1842년 5월 8일, 파리로 돌아가던 열차의 선두 기관차 차축이 부러졌습니다. 다음 날 새벽, 당신은 정부 조사위원회의 조사관으로 현장에 도착했습니다.</p>\n    <p>현장 곳곳을 뒤져 단서와 물건을 찾고, 자물쇠를 풀고, 부러진 차축을 직접 들여다보세요. 제한 시간은 15분입니다. 마지막 자물쇠는 조사위원회 천막의 보고 상자이고, 원인과 시작점과 대책을 모두 맞혀야 열립니다.</p>\n    <div class="row"><button id="bStart" type="button">현장으로 들어가기</button><a class="btnlink ghost" href="index.html">사건 목록</a></div>',s,count=1,flags=re.S)
between('/* ================= 게임 데이터 ================= */','/* ================= UI ================= */',(R('ch1x_logic.js')+R('ch1x_hear.js')+R('hearing_core.js')).split('function hud(){')[0])
between('/* ================= UI ================= */','/* 대사와 자막 */','/* ================= UI ================= */\nfunction hud(){'+(R('ch1x_logic.js')+R('ch1x_hear.js')+R('hearing_core.js')).split('function hud(){',1)[1])
rep("$('bNote').onclick = showNote; $('bHelp').onclick = showHelp;","$('bNote').onclick = showNote; $('bHelp').onclick = showHelp; $('bHint').onclick = showHint;")
between('function fracTex(){','{ const g=new T.Group(); box(.5,.9,.5,mWood,0,.45,-.5,g);',R('ch1x_frac.js'))
rep("g.position.set(6.6,0,22.6); g.rotation.y=-1.9; scene.add(g); col(6.6,22.6,1.1); }","g.position.set(-8,0,-7.3); g.rotation.y=-Math.PI/2; scene.add(g); }")
i=s.index('const tLog=tent('); j=s.index('\n',s.index('\n',i)+1)+1
s=s[:j]+R('ch1x_world.js')+s[j:]
between('/* 조사 표식 */','/* ================= 입력 ================= */',R('ch1x_objs.js')+'\n')
rep("if(e.code==='KeyE'||e.code==='Enter') interact(); if(e.code==='KeyN') showNote(); });","if(e.code==='KeyE'||e.code==='Enter') interact(); if(e.code==='KeyN') showNote(); if(e.code==='KeyH') showHint(); });")
s=re.sub(r"function interact\(\)\{.*?\n","function interact(){ if(!near||searching||finished&&near.o.id!=='final') return; near.o.act(); }\n",s,count=1)
s=s.replace("$('tAct').onclick=()=>{ if(dq) advance(); else if(!paused) interact(); }; }","$('tAct').onclick=()=>{ if(dq) advance(); else if(!paused) interact(); }; }",1)
# cinematic
rep("{d:5.5, p0:[11.2,1.9,24.2], p1:[8.75,1.3,23.33], l0:[7.55,1.12,22.92], l1:[7.55,1.12,22.92], s:'선두 기관차의 앞 차축이 부러져 있었다.'}",
    "{d:5.5, p0:[1.6,2.6,-10.5], p1:[.2,2.1,-8.2], l0:[-3,1.3,-6], l1:[-3,1.2,-6], s:'부러진 차축 조각은 역장이 증거 창고에 넣고 자물쇠를 채웠다.'}")
rep("s:'조사위원회는 당신에게 원인을 밝히라고 했다. 쓸 수 있는 조사 점수는 8점이다.'}","s:'제한 시간은 15분. 열쇠를 찾고, 자물쇠를 풀고, 원인을 밝혀라.'}")
between('/* ================= 파단면 관찰 ================= */','/* ================= 소리',R('ch1x_insp.js'))
# loop: markers, camera, spots, timer, animations
rep("m.hidden=false; m.style.left=","m.hidden=!m.dataset.on; m.style.left=")
rep("else if(started){ const cp=Math.cos(camPitch); v3.set(player.pos.x+Math.sin(camYaw)*cp*camDist, player.pos.y+1.7+Math.sin(camPitch)*camDist, player.pos.z+Math.cos(camYaw)*cp*camDist);",
    "else if(started){ const inS=inShed(player.pos.x,player.pos.z), cP=inS?Math.max(camPitch,1.0):camPitch, cD=inS?Math.min(camDist,6):camDist; const cp=Math.cos(cP); v3.set(player.pos.x+Math.sin(camYaw)*cp*cD, player.pos.y+1.7+Math.sin(cP)*cD, player.pos.z+Math.cos(camYaw)*cp*cD);")
i=s.index('  /* 표식, 안내 */'); j=s.index("  if(composer) composer.render();",i)
LOOP=r"""  /* 표식, 안내, 시간 (시간은 실제 흐른 시간으로 잰다) */
  const nowT=performance.now(), rdt=Math.min(1,(nowT-(tick.lastT||nowT))/1000); tick.lastT=nowT;
  shedRoof.visible=!(insp||inShed(player.pos.x,player.pos.z));
  if(shedOpenT>=0&&shedOpenT<1){ shedOpenT=Math.min(1,shedOpenT+dt*1.2); shedDoor.rotation.y=1.45*(1-Math.pow(1-shedOpenT,3)); }
  if(toolOpenT>=0&&toolOpenT<1){ toolOpenT=Math.min(1,toolOpenT+dt*1.5); toolLid.rotation.x=-1.6*(1-Math.pow(1-toolOpenT,3)); toolLid.userData.key.visible=!has('key')&&!flags.shed; }
  if(toolOpenT>=1) toolLid.userData.key.visible=!has('key')&&!flags.shed;
  if(chestOpenT>=0&&chestOpenT<1){ chestOpenT=Math.min(1,chestOpenT+dt*1.5); chestLid.rotation.x=-1.5*(1-Math.pow(1-chestOpenT,3)); }
  lensGlint.material.opacity=.4+.6*Math.max(0,Math.sin(t*3)); crankAxle.rotation.x+=flags.crank?dt*1.2:0;
  if(searching){ searching.t+=rdt; if(searching.t>=1.4){ const f=searching.fin; searching=null; paused=false; f(); } }
  if(started&&!cine&&!finished){ timeLeft-=rdt; if(timeLeft<=0){ timeLeft=0; if(!timeUpSaid){ timeUpSaid=true; sub('제한 시간이 지났다. 계속 조사할 수 있지만 점수가 깎인다.'); } } const sec=Math.ceil(timeLeft); if(sec!==tick.sec){ tick.sec=sec; $('timer').textContent=fmt(timeLeft); $('timer').classList.toggle('low',timeLeft<120); } }
  near=null; let best=2.4;
  for(const s of spots){ const o=s.o, vis=o.show(), isDone=o.done(); s.g.visible=vis&&!isDone;
    s.d.position.y=2.5+Math.sin(t*2+s.x)*.12; s.d.rotation.y=t*1.5; s.r.scale.setScalar(1+Math.sin(t*3+s.z)*.06);
    const d=Math.hypot(player.pos.x-s.x,player.pos.z-s.z); if(vis&&d<best){ best=d; near=s; }
    v3.set(s.x,s.g.position.y+3.0,s.z).project(camera); const show=vis&&started&&!cine&&!insp&&v3.z<1&&d<(isDone?10:34)&&Math.abs(v3.x)<1.05&&Math.abs(v3.y)<1.05;
    s.el.hidden=!show; if(show){ s.el.style.left=((v3.x+1)/2*innerWidth)+'px'; s.el.style.top=((1-v3.y)/2*innerHeight)+'px'; s.el.className='lbl'+(isDone?' done':''); s.el.textContent=(isDone?'✓ ':'')+o.t; } }
  const pr=$('prompt'); if(searching){ pr.hidden=false; pr.innerHTML=`뒤지는 중<span class="bar"><i style="width:${Math.min(100,searching.t/1.4*100)}%"></i></span>`; }
  else if(near&&!paused){ pr.hidden=false; pr.innerHTML=`<kbd>E</kbd>${near.o.who} · ${near.o.verb}`; } else pr.hidden=true;
"""
s=s[:i]+LOOP+s[j:]
rep("\nhud(); tick();","\nhud(); tick();")
for bad in ['ACTS','BUDGET','showAct(','done.has(','left -=']:
    assert bad not in s, bad
exec(open('/home/claude/patch_cam.py',encoding='utf-8').read())
exec(open('/home/claude/patch_play.py',encoding='utf-8').read())
open('/home/claude/season/ch1.html','w',encoding='utf-8').write(s)
print('ok',len(s))
