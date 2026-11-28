# 휴대폰 조작: 스틱을 민 방향으로 바로 걷기, 카메라는 앞으로 갈 때만 천천히 뒤따름, 휴대폰에서 번짐 효과 끄기
import re
def _rm(a,b):
    global s
    assert a in s, 'MOB MISSING: '+a[:70]; s=s.replace(a,b,1)
s,n=re.subn(r"if\(Math\.abs\(mx\)>\.15\) player\.yaw-=mx\*2\.6\*dt; if\(Math\.abs\(mz\)>\.15\)\{ const n=Math\.min\(1,Math\.abs\(mz\)\); spd=\(mz>0\?\(running\?([\d.]+):([\d.]+)\):[\d.]+\*\.6\)\*n; const sg=Math\.sign\(mz\), dx=Math\.sin\(player\.yaw\)\*sg, dz=Math\.cos\(player\.yaw\)\*sg;",
 lambda m:("joyMode=!fp&&!paused&&Math.hypot(joy.x,joy.y)>.15; "
   "if(joyMode){ const fw=-joy.y, rt=joy.x, cs=Math.cos(camYaw), sn=Math.sin(camYaw); let wx=-sn*fw+cs*rt, wz=-cs*fw-sn*rt; const wl=Math.hypot(wx,wz)||1; wx/=wl; wz/=wl; let d=Math.atan2(wx,wz)-player.yaw; d=Math.atan2(Math.sin(d),Math.cos(d)); player.yaw+=d*Math.min(1,dt*10); } "
   "else if(Math.abs(mx)>.15) player.yaw-=mx*2.6*dt; "
   f"if(joyMode||Math.abs(mz)>.15){{ const n=joyMode?Math.min(1,Math.hypot(joy.x,joy.y)):Math.min(1,Math.abs(mz)); spd=((joyMode||mz>0)?(running?{m.group(1)}:{m.group(2)}):{m.group(2)}*.6)*n; const sg=joyMode?1:Math.sign(mz), dx=Math.sin(player.yaw)*sg, dz=Math.cos(player.yaw)*sg;"), s)
assert n==1, 'mob move'
_rm("let fp=false;","let fp=false, joyMode=false;")
_rm("camYaw+=d*Math.min(1,dt*(Math.abs(mz)>.15?3.2:5)); }","camYaw+=d*Math.min(1,dt*(joyMode?1.1*Math.max(0,-joy.y):(Math.abs(mz)>.15?3.2:5))); }")
_rm("function initPost(){ try{ ","function initPost(){ try{ if(typeof MOBILE!=='undefined'&&MOBILE) return; ")
s=s.replace("왼쪽 아래 스틱을 위아래로 밀어 전진·후진, 좌우로 밀어 방향 돌리기","왼쪽 아래 스틱을 미는 방향으로 걸어갑니다(끝까지 밀면 달리기). 화면을 손가락으로 끌면 둘러볼 수 있습니다")
