# 충돌(자동 충돌 상자·나무 줄기·끼임 탈출), 모바일 화면과 성능, 소개 문구
import re
def _r(a,b):
    global s
    assert a in s, 'PLAY MISSING: '+a[:70]; s=s.replace(a,b,1)
# 1) 소개 문구: 마지막 단계는 청문회
s=s.replace("마지막 자물쇠는 조사위원회 천막의 보고 상자이고, 원인과 시작점과 대책을 모두 맞혀야 열립니다.","마지막에는 조사위원회 천막에서 청문회가 열립니다. 엉터리 주장이 나올 때마다 모은 증거를 내밀어 뒤집으세요.")
s=s.replace("마지막 자물쇠는 조사위원회 사무실 앞 보고 상자이고, 원인과 시작점과 대책을 모두 맞혀야 열립니다.","마지막에는 조사위원회 사무실 앞에서 청문회가 열립니다. 엉터리 주장이 나올 때마다 모은 증거를 내밀어 뒤집으세요.")
s=s.replace("마지막 보고는 잠수정 해치의 다이얼로 전송하고, 물이 들어온 길과 재료와 교훈을 모두 맞혀야 합니다.","마지막에는 잠수정 해치의 무전으로 원격 청문회가 열립니다. 100년 묵은 주장들을 모은 증거로 뒤집으세요.")
# 2) 모바일 화면
MCSS='''
@media (max-width:640px){
 #btns{left:6px;right:6px;top:6px;gap:4px;padding:4px;justify-content:space-between}
 #btns button,#btns .btnlink{flex:1 1 0;min-width:0;padding:7px 2px;font-size:.74rem;white-space:nowrap;text-align:center}
 #top{top:52px;left:6px;padding:7px 10px;max-width:calc(100vw - 12px)}
 #top .eb{font-size:.66rem} #top h2{font-size:1rem}
 #goal{font-size:.8rem} .inv .chip{font-size:.7rem}
 #dlg{bottom:8px;padding:10px 14px 8px;width:calc(100vw - 12px)} #dtxt{font-size:.95rem}
 .lbl{font-size:.68rem;padding:1px 7px}
 #modal .card,#mcard{max-height:calc(100dvh - 24px);overflow:auto}
}
@media (pointer:coarse){ #stick{width:132px;height:132px;left:16px;bottom:18px} }
'''
_r('</style>',MCSS+'</style>')
_r("renderer.setPixelRatio(Math.min(devicePixelRatio,2));","const MOBILE=matchMedia('(pointer:coarse)').matches; renderer.setPixelRatio(Math.min(devicePixelRatio,MOBILE?1.5:2));")
s=re.sub(r"(\w+)\.shadow\.mapSize\.set\(2048,2048\)", r"\1.shadow.mapSize.set(MOBILE?1024:2048,MOBILE?1024:2048)", s)
_r('<div id="dnext">E 또는 클릭으로 다음 ▶</div>','<div id="dnext">E 또는 클릭으로 다음 ▶</div><script>if(matchMedia("(pointer:coarse)").matches) document.getElementById("dnext").textContent="화면을 탭하면 다음 ▶";</script>')
# 3) 충돌: 원 사슬 벽은 끄고, 장면의 물체에서 충돌 상자를 자동으로 만든다
if 'function wallCol(' in s:
    s=re.sub(r"function wallCol\(x0,z0,x1,z1\)\{[^\n]*\}\n","function wallCol(){} /* 벽은 자동 충돌 상자가 맡는다 */\n",s,count=1)
COL=r'''
/* ===== 자동 충돌 상자 ===== */
const boxCols=[], bGrid=new Map(), BC=4; let bcState=0, bcT=0, stuckT=0, stuckP={x:0,z:0};
const PR=.32;
function floorY(x,z){ if(typeof groundAt==='function'){ const g=groundAt(x,z); if(g!==null&&g!==undefined) return g; } return gh(x,z); }
function buildBoxCols(){
  boxCols.length=0; bGrid.clear();
  const skip=new Set([player.g]); try{ for(const c of npcs) skip.add(c.g); }catch(e){} try{ skip.add(shedDoor); }catch(e){} try{ for(const sp of spots) skip.add(sp.g); }catch(e){}
  scene.updateMatrixWorld(true); const trees=new Set(), v=new T.Vector3();
  scene.traverse(o=>{ if(!o.isMesh||o.isInstancedMesh||!o.geometry) return; const m=o.material; if(!m||(m.transparent&&m.opacity<.95)||m.depthWrite===false) return;
    let tree=null; for(let p=o;p;p=p.parent){ if(skip.has(p)||p.userData.nocol||p.visible===false) return; if(/Tree/.test(p.name||'')) tree=p; }
    const g=o.geometry; if(!g.boundingBox) g.computeBoundingBox(); const b=g.boundingBox; if(!isFinite(b.min.x)) return;
    if(tree){ if(trees.has(tree)) return; trees.add(tree); const tb=new T.Box3().setFromObject(tree), cx=(tb.min.x+tb.max.x)/2, cz=(tb.min.z+tb.max.z)/2; col(cx,cz,.3); return; }
    const e=o.matrixWorld.elements, ax=Math.atan2(e[2],e[0]);
    const ca=Math.cos(ax), sa=Math.sin(ax); let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,y0=1e9,y1=-1e9;
    for(let i=0;i<8;i++){ v.set(i&1?b.max.x:b.min.x, i&2?b.max.y:b.min.y, i&4?b.max.z:b.min.z).applyMatrix4(o.matrixWorld);
      const lx=v.x*ca+v.z*sa, lz=-v.x*sa+v.z*ca; x0=Math.min(x0,lx); x1=Math.max(x1,lx); z0=Math.min(z0,lz); z1=Math.max(z1,lz); y0=Math.min(y0,v.y); y1=Math.max(y1,v.y); }
    const hx=(x1-x0)/2, hz=(z1-z0)/2; if(hx>25||hz>25||hx*hz*4>300) return; if(hx<.04&&hz<.04) return;
    const lcx=(x0+x1)/2, lcz=(z0+z1)/2, cx=lcx*ca-lcz*sa, cz=lcx*sa+lcz*ca, fy=floorY(cx,cz);
    if(y1<fy+.45) return;                 /* 넘어갈 수 있는 낮은 물체 */
    if(Math.abs(y1-fy)<.3&&hx*hz>.2) return; /* 바닥, 계단처럼 밟는 면 */
    { const th=[0,1,2].map(i=>{ const c=Math.hypot(e[i*4],e[i*4+1],e[i*4+2]); return [(i===0?b.max.x-b.min.x:i===1?b.max.y-b.min.y:b.max.z-b.min.z)*c, c?Math.abs(e[i*4+1])/c:0]; }).sort((p,q)=>p[0]-q[0]);
      if(th[0][0]<.25&&th[0][1]>.7&&y0<fy+.3) return; } /* 비스듬한 판자·경사로처럼 밟는 얇은 판 */
    if(y0>fy+2.1) return;                 /* 머리 위 물체 */
    const bx={cx,cz,hx,hz,ca,sa,y0,y1,o}; boxCols.push(bx);
    const r=Math.hypot(hx,hz); for(let gx=Math.floor((cx-r)/BC);gx<=Math.floor((cx+r)/BC);gx++) for(let gz=Math.floor((cz-r)/BC);gz<=Math.floor((cz+r)/BC);gz++){ const k=gx+','+gz; if(!bGrid.has(k)) bGrid.set(k,[]); bGrid.get(k).push(bx); } });
}
function boxHit(px,pz,py){ const L=bGrid.get(Math.floor(px/BC)+','+Math.floor(pz/BC)); if(!L) return false;
  for(const b of L){ if(py+1.6<b.y0||py+.45>b.y1) continue; const dx=px-b.cx, dz=pz-b.cz, lx=dx*b.ca+dz*b.sa, lz=-dx*b.sa+dz*b.ca;
    if(Math.abs(lx)<b.hx+PR&&Math.abs(lz)<b.hz+PR){ const qx=Math.max(-b.hx,Math.min(b.hx,lx)), qz=Math.max(-b.hz,Math.min(b.hz,lz)); if((lx-qx)**2+(lz-qz)**2<PR*PR) return true; } }
  for(const c of colliders) if(Math.hypot(px-c.x,pz-c.z)<c.r+.3) return true; return false; }
function boxPush(dt,moving){
  if(!bcState&&started){ buildBoxCols(); bcState=1; bcT=performance.now(); }
  else if(bcState===1&&performance.now()-bcT>6000){ buildBoxCols(); bcState=2; }
  const py=player.pos.y;
  for(let it=0;it<2;it++){ const L=bGrid.get(Math.floor(player.pos.x/BC)+','+Math.floor(player.pos.z/BC)); if(!L) break;
    for(const b of L){ if(py+1.6<b.y0||py+.45>b.y1) continue; const dx=player.pos.x-b.cx, dz=player.pos.z-b.cz; let lx=dx*b.ca+dz*b.sa, lz=-dx*b.sa+dz*b.ca;
      if(Math.abs(lx)>=b.hx+PR||Math.abs(lz)>=b.hz+PR) continue;
      const qx=Math.max(-b.hx,Math.min(b.hx,lx)), qz=Math.max(-b.hz,Math.min(b.hz,lz)), ex=lx-qx, ez=lz-qz, d2=ex*ex+ez*ez;
      if(d2>=PR*PR) continue;
      if(d2>1e-8){ const d=Math.sqrt(d2), k=(PR-d)/d; lx+=ex*k; lz+=ez*k; }
      else { const ox=b.hx-Math.abs(lx), oz=b.hz-Math.abs(lz); if(ox<oz) lx=Math.sign(lx||1)*(b.hx+PR); else lz=Math.sign(lz||1)*(b.hz+PR); }
      player.pos.x=b.cx+lx*b.ca-lz*b.sa; player.pos.z=b.cz+lx*b.sa+lz*b.ca; } }
  /* 끼임 탈출: 움직이려 하는데 1.5초 동안 거의 못 움직이면 가까운 빈 곳으로 옮긴다 */
  if(moving){ stuckT+=dt; if(stuckT>1.5){ const mv=Math.hypot(player.pos.x-stuckP.x,player.pos.z-stuckP.z); if(mv<.12&&boxHit(player.pos.x,player.pos.z,py)) unstick(); stuckT=0; stuckP.x=player.pos.x; stuckP.z=player.pos.z; } }
  else { stuckT=0; stuckP.x=player.pos.x; stuckP.z=player.pos.z; } }
function unstick(){ for(let r=.6;r<=5;r+=.4) for(let a=0;a<16;a++){ const x=player.pos.x+Math.cos(a/16*6.283)*r, z=player.pos.z+Math.sin(a/16*6.283)*r, y=floorY(x,z);
    if(y===null||y===undefined||Math.abs(y-player.pos.y)>1.2) continue; if(typeof groundAt==='function'&&groundAt(x,z)===null) continue; if(!boxHit(x,z,y)){ player.pos.set(x,y,z); return; } } }
'''
_r("/* ================= 루프 ================= */","/* ================= 루프 ================= */"+COL)
_r("for(const c of colliders){ const dx=player.pos.x-c.x, dz=player.pos.z-c.z, d=Math.hypot(dx,dz), r=c.r+.35; if(d<r&&d>1e-4){ player.pos.x=c.x+dx/d*r; player.pos.z=c.z+dz/d*r; } }",
   "for(const c of colliders){ const dx=player.pos.x-c.x, dz=player.pos.z-c.z, d=Math.hypot(dx,dz), r=c.r+.3; if(d<r&&d>1e-4){ player.pos.x=c.x+dx/d*r; player.pos.z=c.z+dz/d*r; } } boxPush(dt,!paused&&(Math.abs(mx)>.15||Math.abs(mz)>.15));")
