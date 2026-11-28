import re
s=open('/tmp/ch3_old.html',encoding='utf-8').read()
b1=open('/home/claude/build_ch1x.py',encoding='utf-8').read()
CSS=re.search(r'CSS="""(.*?)"""',b1,re.S).group(1)
LOOP=re.search(r'LOOP=r"""(.*?)"""',b1,re.S).group(1)
def rep(a,b):
    global s
    assert a in s, 'MISSING: '+a[:90]; s=s.replace(a,b,1)
def between(a,b,new):
    global s
    i=s.index(a); j=s.index(b,i); s=s[:i]+new+s[j:]
R=lambda f: open('/home/claude/'+f,encoding='utf-8').read()
L=(R('ch3x_logic.js')+R('ch3x_hear.js')+R('hearing_core.js')); D=R('case03_data.js'); L=L.replace('/* ================= 게임 상태 ================= */','/* ================= 게임 상태 ================= */\n'+D[D.index('function charpySVG'):D.index('function sonarSVG')])
rep('</title>','</title>\n<script>try{ if(localStorage.getItem("mt-done-2")!=="1") location.replace("index.html#locked-3"); }catch(e){}</script>')
rep('</style>',CSS+'</style>')
rep('<div id="pips" aria-hidden="true"></div>\n  <small>남은 조사 점수 <b id="left"></b> / 8 · 단서 <b id="ncl">0</b>개</small>\n  <div id="goal"></div>',
    '<div class="tline"><span id="timer">15:00</span><small>남은 시간 · 실수 <b id="miss">0</b></small></div>\n  <div id="goal"></div>\n  <div id="inv" class="inv"></div>')
rep('<button class="ghost" id="bNote" type="button">수첩</button>','<button class="ghost" id="bHint" type="button">힌트</button>\n  <button class="ghost" id="bNote" type="button">수첩</button>')
rep('이동 WASD · 달리기 Shift · 점프 Space · 조사·대화 E · 시점 마우스 드래그','이동 WASD · 달리기 Shift · 점프 Space · 조사·사용 E · 수첩 N · 힌트 H · 시점 드래그')
rep('<button id="idone" type="button" disabled>관찰 마치기</button>','<button id="idone" type="button" disabled>세 곳을 모두 보세요</button>')
s=re.sub(r'(<p class="sub">1912년 4월 14일 밤.*?</p>)\n    <p>.*?</p>',
 r'\1\n    <p>해저 3,700 m. 잔해밭과 잠수정 주변을 뒤져 단서와 장비를 찾고, 자물쇠를 풀고, 회수한 리벳의 단면을 직접 들여다보세요. 제한 시간은 15분입니다. 마지막 보고는 잠수정 해치의 다이얼로 전송하고, 물이 들어온 길과 재료와 교훈을 모두 맞혀야 합니다. 이 사건은 지금도 논쟁이 이어지는 사건입니다.</p>',s,count=1,flags=re.S)
between('/* ================= 게임 데이터 ================= */','/* ================= UI ================= */',L.split('function hud(){')[0])
between('/* ================= UI ================= */','/* 대사와 자막 */','/* ================= UI ================= */\nfunction hud(){'+L.split('function hud(){',1)[1])
rep("$('bNote').onclick = showNote; $('bHelp').onclick = showHelp;","$('bNote').onclick = showNote; $('bHelp').onclick = showHelp; $('bHint').onclick = showHint;")
rep('\nfunction worldTick(','\n'+R('ch3x_world.js')+'\nfunction worldTick(')
between('/* 조사 표식 */','/* ================= 입력 ================= */',R('ch3x_objs.js')+'\n')
rep("if(e.code==='KeyE'||e.code==='Enter') interact(); if(e.code==='KeyN') showNote(); });","if(e.code==='KeyE'||e.code==='Enter') interact(); if(e.code==='KeyN') showNote(); if(e.code==='KeyH') showHint(); });")
s=re.sub(r"function interact\(\)\{.*?\n","function interact(){ if(!near||searching||finished&&near.o.id!=='final') return; near.o.act(); }\n",s,count=1)
rep("s:'배는 왜 그렇게 빨리 물에 잠겼을까. 쓸 수 있는 조사 점수는 8점이다.'}","s:'배는 왜 그렇게 빨리 물에 잠겼을까. 제한 시간은 15분이다.'}")
between('/* ================= 파단면 관찰 ================= */','/* ================= 소리',R('ch3x_insp.js'))
rep("m.hidden=false; m.style.left=","m.hidden=!m.dataset.on; m.style.left=")
# 루프: 1화 루프에서 창고·모형 부분을 빼고 2화 소품으로 바꾼다
LOOP=LOOP.replace("  shedRoof.visible=!(insp||inShed(player.pos.x,player.pos.z));\n","")
LOOP=re.sub(r"  if\(shedOpenT>=0.*?\n","",LOOP)
LOOP=re.sub(r"  if\(toolOpenT>=0&&toolOpenT<1\).*?\n","  if(toolOpenT>=0&&toolOpenT<1){ toolOpenT=Math.min(1,toolOpenT+dt*1.5); toolLid.rotation.x=-1.6*(1-Math.pow(1-toolOpenT,3)); toolLid.userData.torch.visible=!has('torch'); }\n",LOOP)
LOOP=re.sub(r"  if\(toolOpenT>=1\).*?\n","",LOOP)
LOOP=LOOP.replace("lensGlint.material.opacity=.4+.6*Math.max(0,Math.sin(t*3)); crankAxle.rotation.x+=flags.crank?dt*1.2:0;","clockGlint.material.opacity=.4+.6*Math.max(0,Math.sin(t*3));")
LOOP=LOOP.replace("let best=2.4;","let best=2.6;")
for bad in['shedRoof','shedOpen','crankAxle','lensGlint','inShed']: assert bad not in LOOP, bad
i=s.index('  /* 표식, 안내 */'); j=s.index("  if(composer) composer.render();",i); s=s[:i]+LOOP+s[j:]
for bad in ['ACTS','BUDGET','showAct(','done.has(','left -=','REPORT','showReport']:
    assert bad not in s, bad
exec(open('/home/claude/patch_cam.py',encoding='utf-8').read())
exec(open('/home/claude/patch_play.py',encoding='utf-8').read())
open('/home/claude/season/ch3.html','w',encoding='utf-8').write(s)
print('ok',len(s))
