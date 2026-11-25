# 3인칭 어깨 시점: W/S 전후진, A/D 회전, 카메라가 등 뒤를 따라가고 가려지면 앞으로 당겨 옴
import re
def _rep(a,b,cnt=1):
    global s
    assert a in s, 'CAM MISSING: '+a[:70]; s=s.replace(a,b,cnt)
s,n=re.subn(r"if\(ml>\.15\)\{ const n=Math\.min\(1,ml\); spd=\(running\?([\d.]+):([\d.]+)\)\*n; const fx=-Math\.sin\(camYaw\), fz=-Math\.cos\(camYaw\), dx=\(fx\*mz\+\(-fz\)\*mx\)/ml, dz=\(fz\*mz\+fx\*mx\)/ml;",
  lambda m:f"if(Math.abs(mx)>.15) player.yaw-=mx*2.6*dt; if(Math.abs(mz)>.15){{ const n=Math.min(1,Math.abs(mz)); spd=(mz>0?(running?{m.group(1)}:{m.group(2)}):{m.group(2)}*.6)*n; const sg=Math.sign(mz), dx=Math.sin(player.yaw)*sg, dz=Math.cos(player.yaw)*sg;", s)
assert n==1, 'move'
_rep("let d=Math.atan2(dx,dz)-player.yaw; d=Math.atan2(Math.sin(d),Math.cos(d)); player.yaw+=d*Math.min(1,dt*12);","")
_rep("camPitch = .28, camDist = 7.5,","camPitch = .2, camDist = 5.2, lastDrag = -9e9,")
_rep("camYaw -= (e.clientX-drag.x)*.006;","camYaw -= (e.clientX-drag.x)*.006; lastDrag=performance.now();")
_rep("  else if(started){ ","  else if(started){ if(!paused&&performance.now()-lastDrag>1400&&(Math.abs(mx)>.15||Math.abs(mz)>.15)){ let d=(player.yaw+Math.PI)-camYaw; d=Math.atan2(Math.sin(d),Math.cos(d)); camYaw+=d*Math.min(1,dt*(Math.abs(mz)>.15?3.2:5)); } ")
_rep("camPos.lerp(v3,1-Math.pow(.0005,dt));","occlude(v3); camPos.lerp(v3,1-Math.pow(.0005,dt));")
_rep("look.lerp(v3.set(player.pos.x,player.pos.y+1.55,player.pos.z)","look.lerp(v3.set(player.pos.x+Math.sin(player.yaw)*1.6,player.pos.y+1.5,player.pos.z+Math.cos(player.yaw)*1.6)")
OCC=r'''
/* 카메라 가림 방지: 머리에서 카메라까지 사이에 물체가 있으면 그 앞으로 당긴다 */
const _rc=new T.Raycaster(), _hd=new T.Vector3(), _dir=new T.Vector3(); let occl=null, occT=0, occK=1;
function occlude(v){
  if(!occl){ occl=[]; const skip=new Set([player.g]); try{ for(const c of npcs) skip.add(c.g); }catch(e){}
    scene.traverse(o=>{ if(!o.isMesh||o.isInstancedMesh||!o.geometry) return; const m=o.material; if(!m||m.transparent||m.side===T.BackSide) return;
      for(let p=o;p;p=p.parent) if(skip.has(p)) return;
      if(!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); const ws=new T.Vector3(); o.getWorldScale(ws); const r=o.geometry.boundingSphere.radius*Math.max(ws.x,ws.y,ws.z);
      if(r>.45&&r<90) occl.push(o); }); }
  _hd.set(player.pos.x,player.pos.y+1.5,player.pos.z); _dir.subVectors(v,_hd); const L=_dir.length(); if(L<.01) return; _dir.divideScalar(L);
  if(--occT<=0){ occT=2; _rc.set(_hd,_dir); _rc.far=L; _rc.near=.2; const h=_rc.intersectObjects(occl,false)[0]; occK=h?Math.max(.15,(h.distance-.3)/L):Math.min(1,occK+.08); }
  v.copy(_hd).addScaledVector(_dir,L*occK); }
'''
_rep("/* ================= 루프 ================= */","/* ================= 루프 ================= */"+OCC)
# 안내 문구
s=s.replace("이동 WASD · 달리기 Shift","W/S 전진·후진 · A/D 방향 · 달리기 Shift")
s=s.replace("WASD나 방향키로 이동, Shift 달리기","W(↑) 전진, S(↓) 후진, A·D(←·→)로 방향 돌리기, Shift 달리기")
s=s.replace("<b>시점</b>: 화면을 드래그하면 돌아가고 휠로 거리를 조절합니다.","<b>시점</b>: 카메라가 등 뒤에서 따라갑니다. 화면을 드래그하면 둘러볼 수 있고, 다시 움직이면 정면으로 돌아옵니다. 휠로 거리를 조절합니다.")
s=s.replace("왼쪽 아래 스틱으로 이동","왼쪽 아래 스틱을 위아래로 밀어 전진·후진, 좌우로 밀어 방향 돌리기")
