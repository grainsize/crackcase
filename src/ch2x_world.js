/* ===== 방탈출 소품: 갑판 잔해와 멈춘 시계, 시험소 공구함, 증거 서류함, 보고 상자 ===== */
/* 갑판 잔해 더미와 시계 반짝임 */
const clockGlint=new T.Sprite(new T.SpriteMaterial({map:glowTex('rgba(255,250,220,1)','rgba(255,240,200,0)'),blending:T.AdditiveBlending,depthWrite:false}));
const clockMesh=new T.Group();
{ const x0=-1.7, z0=7.9, g=new T.Group(); g.position.set(x0,gh(x0,z0),z0); scene.add(g);
  for(let i=0;i<12;i++){ const b=box(rr(.5,1.4),rr(.04,.1),rr(.1,.3),rnd()<.5?mRust:mIron,rr(-.6,.6),rr(.04,.3),rr(-.5,.5),g); b.rotation.set(rr(-.4,.4),rr(0,3),rr(-.4,.4)); }
  for(let i=0;i<5;i++){ const p=box(rr(.3,.6),.02,rr(.3,.5),M(0xc9ced1,{roughness:.3}),rr(-.6,.6),.03,rr(-.5,.5),g); p.rotation.y=rr(0,3); p.castShadow=false; }
  clockMesh.position.set(.35,.08,.15); clockMesh.rotation.set(-1.35,0,.4); g.add(clockMesh);
  cyl(.17,.17,.05,M(0x5a3a22),0,0,0,clockMesh,20).rotation.x=Math.PI/2; const fc=mesh(new T.CircleGeometry(.14,20),M(0xf2ecd8),0,0,.027,clockMesh); fc.castShadow=false;
  box(.012,.09,.006,M(0x111111),0,.035,.03,clockMesh); const mh=box(.01,.12,.006,M(0x111111),0,0,.032,clockMesh); mh.geometry.translate(0,.06,0); mh.position.y=0; mh.rotation.z=-Math.PI*2*10/60;
  clockGlint.position.set(.35,.3,.15); clockGlint.scale.set(.5,.5,1); g.add(clockGlint); col(x0,z0,.9); }
/* 시험소 공구함 */
const toolLid=new T.Group();
{ const g=new T.Group(); g.position.set(28.9,PIER,-15.4); g.rotation.y=-Math.PI/2; scene.add(g); const mBox=M(0x3c5a4a,{metalness:.4,roughness:.6});
  box(.9,.42,.5,mBox,0,.21,0,g); toolLid.position.set(0,.42,-.25); g.add(toolLid); box(.92,.06,.52,mBox,0,.03,.26,toolLid); box(.3,.04,.06,mIron,0,.08,.26,toolLid);
  const lk=new T.Group(); lk.position.set(0,.3,.27); g.add(lk); box(.16,.12,.05,mBrass,0,0,0,lk); for(let i=0;i<4;i++){ const w=cyl(.02,.02,.03,mIron,-.045+i*.03,-.01,.03,lk,8); w.rotation.x=Math.PI/2; } toolLid.userData.lock=lk;
  const tc=new T.Group(); tc.position.set(.1,.46,0); g.add(tc); const b=cyl(.05,.06,.3,M(0x2a2a2a,{metalness:.5,roughness:.4}),0,0,0,tc,12); b.rotation.z=Math.PI/2; cyl(.075,.06,.06,mBrass,.17,0,0,tc,12).rotation.z=Math.PI/2; tc.visible=false; toolLid.userData.torch=tc;
  col(28.9,-15.4,.6); }
let toolOpenT=-1;
function openToolbox(){ toolOpenT=0; toolLid.userData.lock.visible=false; }
/* 증거 서류함 (갑판 위, 감독 곁) */
const chestLid=new T.Group();
{ const x0=2.6, z0=-13.6, g=new T.Group(); g.position.set(x0,gh(x0,z0),z0); scene.add(g); const mC=M(0x5a3a22,{roughness:.7});
  box(.62,.32,.42,mC,0,.16,0,g); chestLid.position.set(0,.32,-.21); g.add(chestLid); box(.64,.07,.44,mC,0,.035,.21,chestLid);
  for(const x of[-.24,.24]) box(.03,.33,.43,mBrass,x,.16,0,g); const lk=box(.14,.14,.04,mBrass,0,.22,.23,g); chestLid.userData.lock=lk;
  const p=box(.4,.02,.3,M(0xe9e0c8),0,.3,0,g); p.castShadow=false; col(x0,z0,.5); }
let chestOpenT=-1;
/* 보고 상자 (조사위원회 사무실 앞) */
{ const x0=22.8, z0=-32.9, g=new T.Group(); g.position.set(x0,PIER,z0); scene.add(g); box(.8,.8,.8,mWood,0,.4,0,g);
  box(.7,.3,.45,M(0x2c3a4a,{roughness:.5,metalness:.3}),0,.95,0,g); for(let i=0;i<3;i++){ const d=cyl(.05,.05,.04,mBrass,-.2+i*.2,1.0,.24,g,14); d.rotation.x=Math.PI/2; } col(x0,z0,.6); }
