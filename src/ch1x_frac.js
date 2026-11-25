function fracTex(){ const N=1024, c=document.createElement('canvas'); c.width=c.height=N; const x=c.getContext('2d'), R=N/2, S=R/.14;
  const ox=R+(-.1269)*S, oy=R-(-.0462)*S, RF=.205*S;
  x.fillStyle='#2a3036'; x.fillRect(0,0,N,N); x.save(); x.beginPath(); x.arc(R,R,R-2,0,7); x.clip();
  x.fillStyle='#c4c9c8'; x.fillRect(0,0,N,N);
  for(let i=0;i<3400;i++){ const px=rr(0,N), py=rr(0,N); if(Math.hypot(px-ox,py-oy)<RF+6) continue; const z=rr(4,15), g=Math.floor(rr(40,255)); x.fillStyle=`rgba(${g},${g},${Math.min(255,g+8)},${rr(.25,.8)})`; x.beginPath(); for(let k=0;k<4;k++){ const b=k*1.57+rnd(); x.lineTo(px+z*Math.cos(b),py+z*Math.sin(b)); } x.fill(); }
  for(let i=0;i<500;i++){ const px=rr(0,N), py=rr(0,N); if(Math.hypot(px-ox,py-oy)<RF+6) continue; x.fillStyle='rgba(255,255,255,.9)'; x.fillRect(px,py,2,2); }
  const g=x.createRadialGradient(ox,oy,0,ox,oy,RF); g.addColorStop(0,'#3e464c'); g.addColorStop(1,'#596268'); x.fillStyle=g; x.beginPath(); x.arc(ox,oy,RF,0,7); x.fill();
  for(let i=0;i<1200;i++){ const a=rr(0,6.28), r=Math.sqrt(rnd())*RF; x.fillStyle=`rgba(${rnd()<.5?20:150},${rnd()<.5?24:160},${rnd()<.5?28:168},${rr(.04,.1)})`; x.fillRect(ox+Math.cos(a)*r,oy+Math.sin(a)*r,rr(2,8),rr(1,3)); }
  for(let k=1;k<=16;k++){ const r=RF*Math.pow(k/16,.85); x.strokeStyle=`rgba(10,14,18,${.35+.35*(k%3===0)})`; x.lineWidth=k%3===0?3.5:2; x.beginPath(); x.arc(ox,oy,r,0,7); x.stroke();
    x.strokeStyle='rgba(170,180,186,.22)'; x.lineWidth=1.5; x.beginPath(); x.arc(ox,oy,r-4,0,7); x.stroke(); }
  for(let i=0;i<14;i++){ const a=Math.atan2(R-oy,R-ox)+rr(-1.2,1.2); x.strokeStyle='rgba(10,14,18,.5)'; x.lineWidth=2; x.beginPath(); x.moveTo(ox+Math.cos(a)*8,oy+Math.sin(a)*8); x.lineTo(ox+Math.cos(a)*rr(40,90),oy+Math.sin(a)*rr(40,90)); x.stroke(); }
  x.restore(); x.strokeStyle='rgba(8,12,16,.85)'; x.lineWidth=6; x.beginPath(); x.arc(R,R,R-3,0,7); x.stroke();
  const t=new T.CanvasTexture(c); t.encoding=T.sRGBEncoding; t.anisotropy=8; return t; }
