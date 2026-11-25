/* ===== 방탈출 소품: 증거 창고, 운행표, 공구함, 잔해 더미, 서류함, 보고 상자, 회전 굽힘 모형 ===== */
const inShed=(x,z)=>x>-10&&x<-3&&z>-9&&z<-3;
const mPlank=new T.MeshStandardMaterial({map:(()=>{ const c=document.createElement('canvas'); c.width=256; c.height=256; const x=c.getContext('2d'); x.fillStyle='#6a4e33'; x.fillRect(0,0,256,256);
  for(let i=0;i<8;i++){ x.fillStyle=`rgba(${rnd()<.5?30:120},${rnd()<.5?20:80},10,.25)`; x.fillRect(i*32,0,32,256); x.fillStyle='rgba(20,12,6,.7)'; x.fillRect(i*32,0,2,256); }
  for(let i=0;i<900;i++){ x.fillStyle=`rgba(20,12,6,${rr(.05,.2)})`; x.fillRect(rr(0,256),rr(0,256),rr(1,2),rr(6,30)); }
  const t=new T.CanvasTexture(c); t.encoding=T.sRGBEncoding; t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set(2,1); return t; })(), roughness:.95});
function wallCol(x0,z0,x1,z1){ const L=Math.hypot(x1-x0,z1-z0), n=Math.max(1,Math.round(L/.45)); for(let i=0;i<=n;i++) col(x0+(x1-x0)*i/n, z0+(z1-z0)*i/n, .28); }
const shedRoof=new T.Group(), shedDoor=new T.Group(), doorCols=[];
{ const g=new T.Group(); scene.add(g);
  box(.14,2.8,6,mPlank,-10,1.4,-6,g); box(7,2.8,.14,mPlank,-6.5,1.4,-3,g); box(7,2.8,.14,mPlank,-6.5,1.4,-9,g);
  box(.14,2.8,1.9,mPlank,-3,1.4,-8.05,g); box(.14,2.8,1.9,mPlank,-3,1.4,-3.95,g); box(.14,.6,2.2,mPlank,-3,2.5,-6,g);
  for(const [x,z] of[[-10,-3],[-10,-9],[-3,-3],[-3,-9],[-3,-7.1],[-3,-4.9]]) box(.22,3,.22,M(0x3e2c1c),x,1.5,z,g);
  box(.06,.6,.9,M(0x1a1410),-10.02,1.8,-6,g);
  wallCol(-10,-9,-10,-3); wallCol(-10,-3,-3,-3); wallCol(-10,-9,-3,-9); wallCol(-3,-9,-3,-7.1); wallCol(-3,-4.9,-3,-3);
  shedRoof.position.set(-6.5,2.8,-6); g.add(shedRoof); for(const s of[-1,1]){ const r=box(7.8,.12,3.5,M(0x3a332c,{roughness:.9}),0,.62,s*1.6,shedRoof); r.rotation.x=s*.36; }
  shedDoor.position.set(-2.98,0,-7.1); g.add(shedDoor); box(.1,2.3,2.2,mPlank,0,1.15,1.1,shedDoor); for(const y of[.4,1.9]) box(.13,.14,2.1,M(0x3e2c1c),0,y,1.1,shedDoor);
  const d1=box(.14,.6,.08,M(0x3e2c1c),0,1.15,1.1,shedDoor); d1.rotation.x=.9;
  const lk=new T.Group(); lk.position.set(.12,1.15,2.0); shedDoor.add(lk); box(.06,.16,.13,mBrass,0,0,0,lk); mesh(new T.TorusGeometry(.045,.012,6,12,Math.PI),mIron,0,.08,0,lk).rotation.y=Math.PI/2; shedDoor.userData.lock=lk;
  for(const z of[-6.65,-6.2,-5.75,-5.3]){ const c={x:-3,z,r:.3}; colliders.push(c); doorCols.push(c); }
  const lamp=new T.PointLight(0xffc880,1.1,11,2); lamp.position.set(-6.5,2.3,-6); g.add(lamp); const lb=mesh(new T.SphereGeometry(.09,8,6),M(0xfff0c0,{emissive:0xffc860,emissiveIntensity:2}),-6.5,2.3,-6,g); lb.castShadow=false;
  box(1.8,.08,.9,mWood,-8,.95,-4.2,g); for(const a of[-.8,.8])for(const b of[-.35,.35]) box(.07,.95,.07,mWood,-8+a,.47,-4.2+b,g); col(-8,-4.2,.8); col(-8.8,-4.2,.6);
  box(1.6,.08,1,mWood,-8,.95,-7.3,g); }
let shedOpenT=-1;
function openShed(){ shedOpenT=0; doorCols.forEach(c=>{ const i=colliders.indexOf(c); if(i>=0) colliders.splice(i,1); }); if(shedDoor.userData.lock) shedDoor.userData.lock.visible=false; blip(240,.5,'sawtooth',.08); }
/* 회전 굽힘 모형 */
const crankAxle=new T.Group();
{ const g=new T.Group(); g.position.set(-8,1.0,-4.2); scene.add(g); for(const s of[-1,1]){ box(.08,.4,.25,mIron,s*.55,.2,0,g); }
  crankAxle.position.set(0,.4,0); g.add(crankAxle); const a=cyl(.07,.07,1.3,mTyre,0,0,0,crankAxle,16); a.rotation.z=Math.PI/2; const dt=mesh(new T.SphereGeometry(.03,8,6),M(0xe04a3a,{emissive:0x801a10,emissiveIntensity:.6}),0,.07,0,crankAxle);
  const hd=box(.04,.3,.04,mIron,.7,-.12,0,crankAxle); const kn=cyl(.03,.03,.14,mOak,.75,-.26,0,crankAxle,8); kn.rotation.z=Math.PI/2; }
/* 운행표 */
const boardTex=(()=>{ const c=document.createElement('canvas'); c.width=512; c.height=384; const x=c.getContext('2d'); x.fillStyle='#e9e0c8'; x.fillRect(0,0,512,384); x.strokeStyle='#3a2a1a'; x.lineWidth=6; x.strokeRect(8,8,496,368);
  x.fillStyle='#2a1d12'; x.textAlign='center'; x.font='bold 30px serif'; x.fillText('Rive Gauche  →  Paris',256,58); x.font='22px serif'; x.fillText('dimanche 8 mai 1842',256,92);
  x.textAlign='left'; x.font='26px serif'; [['13 h 00',''],['15 h 00',''],['17 h 30','★'],['19 h 00',''],['21 h 30','★']].forEach(([h,s],i)=>{ x.fillText(h,90,148+i*44); if(s){ x.fillStyle='#8a2418'; x.fillText(s+' fête',300,148+i*44); x.fillStyle='#2a1d12'; } });
  const t=new T.CanvasTexture(c); t.encoding=T.sRGBEncoding; return t; })();
{ const g=new T.Group(); g.position.set(4.6,0,-33.6); g.rotation.y=Math.PI*.92; scene.add(g); for(const s of[-1,1]) cyl(.05,.06,2.3,mWood,s*.7,1.15,0,g,8);
  box(1.7,1.3,.06,mWood,0,1.65,0,g); const p=mesh(new T.PlaneGeometry(1.55,1.16),new T.MeshStandardMaterial({map:boardTex,roughness:.9}),0,1.65,.035,g); p.castShadow=false; col(4.6,-33.6,.8); }
/* 공구함 */
const toolLid=new T.Group();
{ const g=new T.Group(); g.position.set(3.9,0,8.2); g.rotation.y=.4; scene.add(g); const mBox=M(0x3c5a4a,{metalness:.4,roughness:.6});
  box(.9,.42,.5,mBox,0,.21,0,g); toolLid.position.set(0,.42,-.25); g.add(toolLid); box(.92,.06,.52,mBox,0,.03,.26,toolLid); box(.3,.04,.06,mIron,0,.08,.26,toolLid);
  const lk=new T.Group(); lk.position.set(0,.3,.27); g.add(lk); box(.16,.12,.05,mBrass,0,0,0,lk); for(let i=0;i<4;i++){ const w=cyl(.02,.02,.03,mIron,-.045+i*.03,-.01,.03,lk,8); w.rotation.x=Math.PI/2; } toolLid.userData.lock=lk;
  const kk=new T.Group(); kk.position.set(.15,.43,0); g.add(kk); mesh(new T.TorusGeometry(.04,.012,6,12),mIron,0,0,0,kk).rotation.x=Math.PI/2; box(.14,.015,.025,mIron,.1,0,0,kk); kk.visible=false; toolLid.userData.key=kk;
  col(3.9,8.2,.6); }
let toolOpenT=-1;
function openToolbox(){ toolOpenT=0; toolLid.userData.lock.visible=false; }
/* 잔해 더미와 확대경 반짝임 */
const lensGlint=new T.Sprite(new T.SpriteMaterial({map:glowTex('rgba(255,250,220,1)','rgba(255,240,200,0)'),blending:T.AdditiveBlending,depthWrite:false}));
{ const g=new T.Group(); g.position.set(-4.6,0,1.4); scene.add(g); for(let i=0;i<16;i++){ const b=box(rr(.6,1.6),rr(.06,.14),rr(.1,.25),rnd()<.6?mChar:mWood,rr(-.6,.6),rr(.05,.5),rr(-.6,.6),g); b.rotation.set(rr(-.5,.5),rr(0,3),rr(-.5,.5)); }
  for(let i=0;i<6;i++) mesh(new T.DodecahedronGeometry(rr(.1,.2),0),M(0x25262a,{flatShading:true}),rr(-.7,.7),.1,rr(-.7,.7),g); lensGlint.position.set(.3,.35,.2); lensGlint.scale.set(.45,.45,1); g.add(lensGlint); col(-4.6,1.4,.9); }
/* 서류함 (서기 천막) */
const chestLid=new T.Group();
{ const g=new T.Group(); g.position.set(.6,.99,-.6); tLog.add(g); const mC=M(0x5a3a22,{roughness:.7}); box(.5,.26,.36,mC,0,.13,0,g); chestLid.position.set(0,.26,-.18); g.add(chestLid); box(.52,.06,.38,mC,0,.03,.18,chestLid);
  for(const x of[-.2,.2]) box(.03,.27,.37,mBrass,x,.13,0,g); const lk=box(.12,.12,.04,mBrass,0,.18,.2,g); chestLid.userData.lock=lk; }
let chestOpenT=-1;
/* 보고 상자 (조사위원회 천막) */
{ const g=new T.Group(); g.position.set(0,.99,-.6); tRep.add(g); box(.7,.3,.45,M(0x2c3a4a,{roughness:.5,metalness:.3}),0,.15,0,g); for(let i=0;i<3;i++){ const d=cyl(.05,.05,.04,mBrass,-.2+i*.2,.2,.24,g,14); d.rotation.x=Math.PI/2; } }
