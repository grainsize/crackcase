# 탭(클릭)해서 이동 + 길 찾기 + 쿼터뷰 카메라 + 가리는 물체 반투명 + NPC 경로 보정
# 빌드 스크립트에서 NAV_B=(x0,x1,z0,z1) 를 정한 뒤 실행한다
import re
def _t(a,b):
    global s
    assert a in s, 'TAP MISSING: '+a[:80]; s=s.replace(a,b,1)
_x0,_x1,_z0,_z1=NAV_B
TAP=r'''
/* ===== 탭해서 이동: 길 찾기 격자 ===== */
const QV=true;
const NAV={x0:%X0%,z0:%Z0%,cs:.4,nx:Math.ceil((%X1%-(%X0%))/.4),nz:Math.ceil((%Z1%-(%Z0%))/.4),w:null,dirty:true};
function navBuild(){ const N=NAV; N.w=new Uint8Array(N.nx*N.nz);
  for(let j=0;j<N.nz;j++) for(let i=0;i<N.nx;i++){ const x=N.x0+(i+.5)*N.cs, z=N.z0+(j+.5)*N.cs; let ok=1;
    if(typeof groundAt==='function'&&(groundAt(x,z)===null||groundAt(x,z)===undefined)) ok=0;
    else { const y=floorY(x,z); if(boxHit(x,z,y)) ok=0; else { const a=floorY(x+N.cs,z), b=floorY(x,z+N.cs); if(Math.abs(a-y)>.38||Math.abs(b-y)>.38) ok=0; } }
    N.w[j*N.nx+i]=ok; } N.dirty=false; }
const navCell=(x,z)=>[Math.floor((x-NAV.x0)/NAV.cs),Math.floor((z-NAV.z0)/NAV.cs)];
const navOK=(i,j)=>i>=0&&j>=0&&i<NAV.nx&&j<NAV.nz&&NAV.w[j*NAV.nx+i]===1;
const navXZ=(i,j)=>[NAV.x0+(i+.5)*NAV.cs,NAV.z0+(j+.5)*NAV.cs];
function navNearest(i,j){ if(navOK(i,j)) return [i,j]; for(let r=1;r<30;r++){ let best=null,bd=1e9; for(let a=-r;a<=r;a++) for(const [di,dj] of [[a,-r],[a,r],[-r,a],[r,a]]) if(navOK(i+di,j+dj)){ const d=di*di+dj*dj; if(d<bd){ bd=d; best=[i+di,j+dj]; } } if(best) return best; } return null; }
function navLine(x0,z0,x1,z1){ const L=Math.hypot(x1-x0,z1-z0), n=Math.max(1,Math.ceil(L/(NAV.cs*.4))); for(let k=0;k<=n;k++){ const c=navCell(x0+(x1-x0)*k/n,z0+(z1-z0)*k/n); if(!navOK(c[0],c[1])) return false; } return true; }
function navPath(sx,sz,tx,tz){ if(NAV.dirty) navBuild(); const s0=navNearest(...navCell(sx,sz)), t0=navNearest(...navCell(tx,tz)); if(!s0||!t0) return null;
  const nx=NAV.nx, S=s0[1]*nx+s0[0], G=t0[1]*nx+t0[0]; if(S===G) return [navXZ(...t0)];
  const g=new Float32Array(nx*NAV.nz).fill(1e9), from=new Int32Array(nx*NAV.nz).fill(-1), closed=new Uint8Array(nx*NAV.nz); const h=[]; // 이진 힙 [f,idx]
  const push=(f,i)=>{ h.push([f,i]); let k=h.length-1; while(k>0){ const p=(k-1)>>1; if(h[p][0]<=h[k][0]) break; [h[p],h[k]]=[h[k],h[p]]; k=p; } };
  const pop=()=>{ const top=h[0], last=h.pop(); if(h.length){ h[0]=last; let k=0; for(;;){ const l=2*k+1, r=l+1; let m=k; if(l<h.length&&h[l][0]<h[m][0]) m=l; if(r<h.length&&h[r][0]<h[m][0]) m=r; if(m===k) break; [h[m],h[k]]=[h[k],h[m]]; k=m; } } return top; };
  const H=(i)=>{ const dx=Math.abs(i%nx-t0[0]), dz=Math.abs(((i/nx)|0)-t0[1]); return (dx+dz)+(1.414-2)*Math.min(dx,dz); };
  g[S]=0; push(H(S),S); let it=0, found=false;
  while(h.length&&it++<250000){ const [,c]=pop(); if(closed[c]) continue; if(c===G){ found=true; break; } closed[c]=1; const ci=c%nx, cj=(c/nx)|0;
    for(let di=-1;di<=1;di++) for(let dj=-1;dj<=1;dj++){ if(!di&&!dj) continue; const ni=ci+di, nj=cj+dj; if(!navOK(ni,nj)) continue; if(di&&dj&&(!navOK(ci+di,cj)||!navOK(ci,cj+dj))) continue;
      const n=nj*nx+ni, ng=g[c]+(di&&dj?1.414:1); if(ng<g[n]){ g[n]=ng; from[n]=c; push(ng+H(n),n); } } }
  if(!found) return null; const cells=[]; for(let c=G;c!==-1;c=from[c]) cells.push(navXZ(c%nx,(c/nx)|0)); cells.reverse();
  const out=[]; let ax=sx, az=sz, k=0; while(k<cells.length-1){ let far=k+1; for(let m=cells.length-1;m>k+1;m--) if(navLine(ax,az,cells[m][0],cells[m][1])){ far=m; break; } out.push(cells[far]); ax=cells[far][0]; az=cells[far][1]; k=far; }
  if(!out.length) out.push(cells[cells.length-1]); return out; }
/* 목적지 표시 */
const tapMark=new T.Mesh(new T.RingGeometry(.22,.34,28),new T.MeshBasicMaterial({color:0xe2b257,transparent:true,opacity:.95,depthWrite:false,side:T.DoubleSide})); tapMark.rotation.x=-Math.PI/2; tapMark.visible=false; scene.add(tapMark);
let PATH=null;
function goTo(x,z,spot){ const p=navPath(player.pos.x,player.pos.z,x,z); if(!p){ if(spot) { near=spot; interact(); } return; }
  const e=p[p.length-1]; let len=0, px=player.pos.x, pz=player.pos.z; for(const q of p){ len+=Math.hypot(q[0]-px,q[1]-pz); px=q[0]; pz=q[1]; }
  PATH={pts:p,i:0,spot:spot||null,len,chk:0,cx:player.pos.x,cz:player.pos.z,retry:0,tx:x,tz:z}; tapMark.position.set(e[0],floorY(e[0],e[1])+.06,e[1]); tapMark.visible=true; tapMark.scale.set(1.6,1.6,1); }
function pathStep(dt){ if(!PATH) return null;
  if(Math.hypot(joy.x,joy.y)>.15||keys.KeyW||keys.KeyA||keys.KeyS||keys.KeyD||keys.ArrowUp||keys.ArrowDown||keys.ArrowLeft||keys.ArrowRight){ PATH=null; tapMark.visible=false; return null; }
  const P=PATH; if(P.spot){ const ds=Math.hypot(P.spot.x-player.pos.x,P.spot.z-player.pos.z); if(ds<1.25){ arrive(); return null; } }
  let q=P.pts[P.i], dx=q[0]-player.pos.x, dz=q[1]-player.pos.z, d=Math.hypot(dx,dz);
  while(d<.28){ P.i++; if(P.i>=P.pts.length){ arrive(); return null; } q=P.pts[P.i]; dx=q[0]-player.pos.x; dz=q[1]-player.pos.z; d=Math.hypot(dx,dz); }
  P.chk+=dt; if(P.chk>1.2){ const mv=Math.hypot(player.pos.x-P.cx,player.pos.z-P.cz); P.chk=0; P.cx=player.pos.x; P.cz=player.pos.z; if(mv<.15){ if(P.retry++<1){ const sp=P.spot, tx=P.tx, tz=P.tz; NAV.dirty=true; goTo(tx,tz,sp); return null; } PATH=null; tapMark.visible=false; return null; } }
  let rem=d; for(let k=P.i+1;k<P.pts.length;k++) rem+=Math.hypot(P.pts[k][0]-P.pts[k-1][0],P.pts[k][1]-P.pts[k-1][1]);
  const last=P.i===P.pts.length-1; return [dx/d,dz/d, last?Math.min(1,.3+d*.7):1, rem>9]; }
function arrive(){ const s=PATH&&PATH.spot; PATH=null; tapMark.visible=false; if(s){ player.yaw=Math.atan2(s.x-player.pos.x,s.z-player.pos.z); near=s; if(!paused&&!dq) interact(); } }
/* 탭·클릭 처리 */
let tapDown=null; const _ray=new T.Raycaster(), _ndc=new T.Vector2();
canvas.addEventListener('pointerdown',e=>{ tapDown={x:e.clientX,y:e.clientY,t:performance.now()}; });
canvas.addEventListener('pointerup',e=>{ const d=tapDown; tapDown=null; if(!d||!started||paused||insp||cine||dq||fp) return; if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>12||performance.now()-d.t>600) return; onTap(e.clientX,e.clientY); });
function onTap(cx,cy){ let best=null, bd=64;
  for(const s of spots){ if(!s.o.show()) continue; for(const hy of [0,1.2,2.5]){ v3.set(s.x,s.g.position.y+hy,s.z).project(camera); if(v3.z>1) continue; const sx=(v3.x+1)/2*innerWidth, sy=(1-v3.y)/2*innerHeight, dd=Math.hypot(sx-cx,sy-cy); if(dd<bd){ bd=dd; best=s; } } }
  if(best){ blip(700,.06,'sine',.06); goTo(best.x,best.z,best); return; }
  _ndc.set(cx/innerWidth*2-1,-(cy/innerHeight)*2+1); _ray.setFromCamera(_ndc,camera);
  const hits=_ray.intersectObjects(scene.children,true).filter(h=>h.object.isMesh&&h.object.visible&&h.object!==tapMark&&!(h.object.material&&h.object.material.depthWrite===false));
  let p=null; for(const h of hits){ let skip=false; for(let o=h.object;o;o=o.parent) if(o===player.g){ skip=true; break; } if(!skip){ p=h.point; break; } }
  if(!p) return; blip(520,.05,'sine',.05); goTo(p.x,p.z,null); }
/* NPC가 벽을 뚫지 않도록 경로를 길 찾기로 다시 잇는다 */
let npcFixed=false;
function fixNpcPaths(){ if(npcFixed) return; npcFixed=true; try{ for(const c of npcs){ if(!c.path||c.path.length<2) continue; const out=[];
  const f0=navNearest(...navCell(c.path[0][0],c.path[0][1])); if(f0) out.push(navXZ(...f0)); let bad=false; for(let k=0;k<c.path.length&&!bad;k++){ const a=out.length?out[out.length-1]:c.path[k], b=c.path[(k+1)%c.path.length], p=navPath(a[0],a[1],b[0],b[1]); if(p) out.push(...p); else bad=true; }
  if(bad){ c.path=null; c.spd=0; continue; } if(out.length) { c.path=out; c.i=0; const s0=navNearest(...navCell(c.g.position.x,c.g.position.z)); if(s0){ const [x,z]=navXZ(...s0); c.g.position.x=x; c.g.position.z=z; } } } }catch(e){ console.warn('npc path',e); } }
function navAfterBuild(){ NAV.dirty=true; if(bcState===2){ navBuild(); fixNpcPaths(); } }
/* 쿼터뷰 카메라 */
let qvYaw=Math.PI, qvT=Math.PI, qvD=12;
function qvRot(k){ qvT+=k*Math.PI/2; blip(600,.05,'sine',.05); }
function quarterCam(dt){ if(!player.g.visible) player.g.visible=true; let d=qvT-qvYaw; qvYaw+=d*Math.min(1,dt*5); camYaw=qvYaw;
  const inS=(typeof inShed==='function')&&inShed(player.pos.x,player.pos.z), D=inS?Math.min(qvD,9):qvD, P=inS?1.05:.9;
  v3.set(player.pos.x+Math.sin(qvYaw)*Math.cos(P)*D, player.pos.y+1+Math.sin(P)*D, player.pos.z+Math.cos(qvYaw)*Math.cos(P)*D);
  const k=1-Math.pow(.003,dt); camPos.lerp(v3,k); look.lerp(v3.set(player.pos.x,player.pos.y+.9,player.pos.z),k); fadeOccluders(); }
/* 카메라와 주인공 사이를 가리는 물체는 반투명하게 */
const fadeMats=new Map(), faded=new Set(); let fadeList=null, fadeT=0;
function fadeOccluders(){
  if(!fadeList){ fadeList=[]; const skip=new Set([player.g,tapMark]); try{ for(const c of npcs) skip.add(c.g); }catch(e){} try{ for(const sp of spots) skip.add(sp.g); }catch(e){}
    scene.updateMatrixWorld(true); const ws=new T.Vector3();
    scene.traverse(o=>{ if(!o.isMesh||!o.geometry||Array.isArray(o.material)||!o.material||o.material.depthWrite===false) return; for(let p=o;p;p=p.parent) if(skip.has(p)) return;
      if(!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); o.getWorldScale(ws); const r=o.geometry.boundingSphere.radius*Math.max(ws.x,ws.y,ws.z); if(r>.4&&r<45) fadeList.push(o); }); }
  if(--fadeT>0) return; fadeT=3;
  const hits=new Set(); for(const hy of [.5,1.3]){ _hd.set(player.pos.x,player.pos.y+hy,player.pos.z); _dir.subVectors(camPos,_hd); const L=_dir.length(); if(L<.1) continue; _dir.divideScalar(L); _rc.set(_hd,_dir); _rc.near=.25; _rc.far=L; for(const h of _rc.intersectObjects(fadeList,false)) hits.add(h.object); }
  for(const o of [...faded]) if(!hits.has(o)){ o.material=o.userData.fadeOrig; faded.delete(o); }
  for(const o of hits) if(!faded.has(o)){ o.userData.fadeOrig=o.material; let fm=fadeMats.get(o.material); if(!fm){ fm=o.material.clone(); fm.transparent=true; fm.opacity=.18; fm.depthWrite=false; fadeMats.set(o.material,fm); } o.material=fm; faded.add(o); } }
addEventListener('keydown',e=>{ if(!started||paused) return; if(e.code==='KeyQ') qvRot(-1); if(e.code==='KeyE'&&false) qvRot(1); if(e.code==='KeyR') qvRot(1); });
'''.replace('%X0%',str(_x0)).replace('%X1%',str(_x1)).replace('%Z0%',str(_z0)).replace('%Z1%',str(_z1))

# 1화 배치 손질: 창고 문 앞 잔해를 옆으로, 창고 안을 지나던 일꾼 경로를 바깥으로
s=s.replace("[-.6,.9,-6.5,-.12,-.2,.05]","[1.7,.9,-5.4,-.12,-.2,.05]")
s=s.replace("for(let i=0;i<11;i++){ const z=-13.5-i*5.5","for(let i=0;i<11;i++){ const z=-16.5-i*5.5")
s=s.replace("npc(W(0x7a6a52),-4,-8,0,[[-4.2,-8],[-4.5,6],[-7.5,6],[-7.5,-8]],3.4)","npc(W(0x7a6a52),-1.8,-11,0,[[-1.8,-11],[-1.8,6],[-7.5,6],[-7.5,-1.2],[-1.8,-1.2]],3.4)")
_t("/* ================= 루프 ================= */","/* ================= 루프 ================= */"+TAP)
# 이동: 길 따라가기와 키보드(카메라 기준) 입력
_t("const ml=Math.hypot(mx,mz), running=","const pv=(!paused&&!fp)?pathStep(dt):null; const ml=Math.hypot(mx,mz), running=(pv&&pv[3])||")
_t("joyMode=!fp&&!paused&&Math.hypot(joy.x,joy.y)>.15; if(joyMode){ const fw=-joy.y, rt=joy.x, cs=Math.cos(camYaw), sn=Math.sin(camYaw); let wx=-sn*fw+cs*rt, wz=-cs*fw-sn*rt;",
   "const kx=QV?((keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)):0, kz=QV?((keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)):0, jx=joy.x+kx, jy=joy.y-kz; joyMode=!fp&&!paused&&(Math.hypot(jx,jy)>.15||!!pv); if(joyMode){ const fw=-jy, rt=jx, cs=Math.cos(camYaw), sn=Math.sin(camYaw); let wx=pv?pv[0]:-sn*fw+cs*rt, wz=pv?pv[1]:-cs*fw-sn*rt;")
_t("const n=joyMode?Math.min(1,Math.hypot(joy.x,joy.y)):","const n=joyMode?(pv?pv[2]:Math.min(1,Math.hypot(jx,jy))):")
_t("  else if(started&&fp){","  else if(started&&QV&&!fp){ quarterCam(dt); }\n  else if(started&&fp){")
_t("if(fp) player.yaw -= (e.clientX-drag.x)*.006; else camYaw -= (e.clientX-drag.x)*.006;","if(QV&&!fp){ drag.x=e.clientX; drag.y=e.clientY; return; } if(fp) player.yaw -= (e.clientX-drag.x)*.006; else camYaw -= (e.clientX-drag.x)*.006;")
_t("canvas.addEventListener('wheel', e=>{ camDist=","canvas.addEventListener('wheel', e=>{ qvD=Math.max(7,Math.min(18,qvD+e.deltaY*.01)); camDist=")
_t("if(!bcState&&started){ buildBoxCols(); bcState=1; bcT=performance.now(); }","if(!bcState&&started){ buildBoxCols(); bcState=1; bcT=performance.now(); navAfterBuild(); }")
_t("else if(bcState===1&&performance.now()-bcT>6000){ buildBoxCols(); bcState=2; }","else if(bcState===1&&performance.now()-bcT>6000){ buildBoxCols(); bcState=2; navAfterBuild(); }")
if 'function openShed(){ ' in s: _t('function openShed(){ ','function openShed(){ NAV.dirty=true; ')
# 화면: 스틱 대신 회전 버튼, 안내 문구
_t('<div id="tbtn" hidden><button id="tJump" type="button">점프</button><button id="tAct" type="button">조사</button></div>',
   '<div id="tbtn" hidden><button id="tJump" type="button" hidden>점프</button><button id="tRotL" type="button" aria-label="시점 왼쪽으로 돌리기">⟲</button><button id="tRotR" type="button" aria-label="시점 오른쪽으로 돌리기">⟳</button><button id="tAct" type="button">조사</button></div>')
_t('</style>','''#stick{display:none!important}
#tbtn{display:flex!important}
@media (pointer:fine){ #tbtn{right:14px;bottom:14px;gap:8px} #tbtn button{width:46px;height:46px;font-size:1.05rem} #tbtn #tAct{display:none} }
#tbtn #tRotL,#tbtn #tRotR{background:var(--glass);color:var(--ink);border:1px solid var(--brass);font-size:1.4rem}
</style>''')
_t("$('tJump').addEventListener('pointerdown',","$('tRotL').onclick=()=>qvRot(-1); $('tRotR').onclick=()=>qvRot(1); $('tJump').addEventListener('pointerdown',")
s=re.sub(r'<div class="hud" id="keys" hidden>[^<]*</div>','<div class="hud" id="keys" hidden>클릭: 그곳으로 이동 · 사람·물건 클릭: 다가가서 조사 · WASD 직접 이동 · Q/R 시점 돌리기 · 휠 확대 · N 수첩 · H 힌트</div>',s,count=1)
s=re.sub(r"<p><b>키보드</b>:.*?</p><p><b>시점</b>:.*?</p><p><b>터치</b>:.*?</p>",
 "<p><b>이동</b>: 가고 싶은 곳을 탭(클릭)하면 주인공이 알아서 길을 찾아 걸어갑니다. 사람이나 물건(노란 표식)을 탭하면 그 앞까지 가서 바로 조사하거나 말을 겁니다.</p><p><b>시점</b>: 카메라는 비스듬히 위에서 따라갑니다. ⟲ ⟳ 버튼(키보드 Q/R)으로 90도씩 돌리고, 마우스 휠로 확대합니다. 건물 안에 들어가면 앞쪽 벽이 반투명해집니다.</p><p><b>키보드</b>: WASD나 방향키로 직접 걸을 수도 있습니다. E 조사·대화, N 수첩, H 힌트.</p>",s,count=1,flags=re.S)
