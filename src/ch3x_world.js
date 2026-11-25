/* ===== 방탈출 소품: 잠수정 장비함, 진흙 속 리벳, 분석 보고함, 보고 단말 ===== */
const mLock=M(0xd8b04a,{metalness:.7,roughness:.35});
const toolLid=new T.Group();
{ const g=new T.Group(); onFloor(g,26.0,-29.8,0); g.rotation.y=.5;
  box(1.0,.55,.6,mYel,0,.28,0,g); toolLid.position.set(0,.55,-.3); g.add(toolLid); box(1.02,.07,.62,mYel,0,.035,.31,toolLid);
  const lk=new T.Group(); lk.position.set(0,.38,.31); g.add(lk); box(.18,.13,.05,mLock,0,0,0,lk); for(let i=0;i<4;i++){ const w=cyl(.02,.02,.03,mIron,-.045+i*.03,-.01,.03,lk,8); w.rotation.x=Math.PI/2; } toolLid.userData.lock=lk;
  const tg=new T.Group(); tg.position.set(0,.6,0); g.add(tg); for(const s of[-1,1]){ const a=box(.9,.03,.03,mIron,0,0,s*.03,tg); a.rotation.y=s*.04; } box(.12,.08,.12,mLock,-.45,0,0,tg); tg.visible=false; toolLid.userData.torch=tg;
  col(26.0,-29.8,.65); }
let toolOpenT=-1;
function openToolbox(){ toolOpenT=0; toolLid.userData.lock.visible=false; }
/* 진흙 속 리벳 반짝임 */
const clockGlint=new T.Sprite(new T.SpriteMaterial({map:glowTex('rgba(230,250,255,1)','rgba(230,250,255,0)'),blending:T.AdditiveBlending,depthWrite:false,fog:false}));
const clockMesh=lathe([[.035,0],[.035,.11],[0,.12]],mRustD,0,0,0,scene,8);
{ onFloor(clockMesh,-9.9,-13.2,.04); clockMesh.rotation.set(Math.PI/2,.4,0); clockGlint.position.set(-9.9,seabed(-9.9,-13.2)+.25,-13.2); clockGlint.scale.set(.6,.6,1); scene.add(clockGlint); }
/* 분석 보고함 */
const chestLid=new T.Group();
{ const g=new T.Group(); onFloor(g,32.2,-16.6,0); g.rotation.y=-.3; const mC=M(0x3a4a52,{metalness:.5,roughness:.5});
  box(.7,.36,.46,mC,0,.18,0,g); chestLid.position.set(0,.36,-.23); g.add(chestLid); box(.72,.07,.48,mC,0,.035,.23,chestLid);
  for(const x of[-.27,.27]) box(.03,.37,.47,mLock,x,.18,0,g); const lk=box(.14,.14,.04,mLock,0,.25,.25,g); chestLid.userData.lock=lk;
  const p=box(.45,.02,.32,M(0xe9e0c8),0,.34,0,g); p.castShadow=false; col(32.2,-16.6,.55); }
let chestOpenT=-1;
