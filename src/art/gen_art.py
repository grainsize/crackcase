# 4~15화 표지 그림 (SVG). 같은 화풍: 해 질 녘 하늘, 납작한 실루엣, 붉게 빛나는 균열
import math, random, os
OUT='/home/claude/season/img'
W,H=1600,800
def head(sky, glow='#ffb36b'):
    a,b,c=sky
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{a}"/><stop offset=".62" stop-color="{b}"/><stop offset="1" stop-color="{c}"/></linearGradient>
<radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="{glow}" stop-opacity=".9"/><stop offset="1" stop-color="{glow}" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></radialGradient>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .09 0"/></filter>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="soft"><feGaussianBlur stdDeviation="14"/></filter>
<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
</defs>
<rect width="{W}" height="{H}" fill="url(#sky)"/>'''
def tail():
    return f'<rect width="{W}" height="{H}" filter="url(#grain)" opacity=".9"/><rect width="{W}" height="{H}" fill="url(#vig)"/></svg>'
def crack(x,y,ang,L,seed=1,w=5,col='#ff6a3a',branches=3):
    r=random.Random(seed); out=[]
    def seg(x,y,a,L,w,d):
        pts=[(x,y)]; n=max(3,int(L/18))
        for i in range(n):
            a+=r.uniform(-.35,.35); x+=math.cos(a)*L/n; y+=math.sin(a)*L/n; pts.append((x,y))
            if d<branches and r.random()<.18: seg(x,y,a+r.choice([-1,1])*r.uniform(.5,1.1),L*.45,w*.55,d+1)
        out.append(f'<polyline points="{" ".join(f"{p:.1f},{q:.1f}" for p,q in pts)}" fill="none" stroke="{col}" stroke-width="{w:.1f}" stroke-linecap="round" stroke-linejoin="round"/>')
    seg(x,y,ang,L,w,0)
    return f'<g filter="url(#glow)">{"".join(out)}</g>'
def stars(n,seed=2,ymax=380):
    r=random.Random(seed); return ''.join(f'<circle cx="{r.uniform(0,W):.0f}" cy="{r.uniform(0,ymax):.0f}" r="{r.uniform(.6,1.8):.1f}" fill="#fff" opacity="{r.uniform(.3,.9):.2f}"/>' for _ in range(n))
def city(y,seed,col,hmin=60,hmax=200,wmin=50,wmax=130,win='#ffcf7a'):
    r=random.Random(seed); x=-20; s=''
    while x<W:
        w=r.uniform(wmin,wmax); h=r.uniform(hmin,hmax); s+=f'<rect x="{x:.0f}" y="{y-h:.0f}" width="{w:.0f}" height="{h+400:.0f}" fill="{col}"/>'
        if win:
            for wy in range(int(y-h+14),int(y-8),22):
                for wx in range(int(x+8),int(x+w-10),18):
                    if r.random()<.22: s+=f'<rect x="{wx}" y="{wy}" width="7" height="10" fill="{win}" opacity="{r.uniform(.4,.9):.2f}"/>'
        x+=w+r.uniform(0,10)
    return s
def water(y,c1,c2,seed=5,n=60):
    r=random.Random(seed); s=f'<rect x="0" y="{y}" width="{W}" height="{H-y}" fill="{c1}"/>'
    for i in range(n):
        yy=r.uniform(y+6,H); l=r.uniform(40,220); x=r.uniform(-50,W); s+=f'<rect x="{x:.0f}" y="{yy:.0f}" width="{l:.0f}" height="{r.uniform(1.5,3.5):.1f}" fill="{c2}" opacity="{r.uniform(.15,.5):.2f}"/>'
    return s
def inset(cx,cy,R,inner,label):
    return f'''<g><circle cx="{cx}" cy="{cy}" r="{R+10}" fill="#0b1014" opacity=".55"/><clipPath id="ic{cx}"><circle cx="{cx}" cy="{cy}" r="{R}"/></clipPath>
<g clip-path="url(#ic{cx})"><rect x="{cx-R}" y="{cy-R}" width="{2*R}" height="{2*R}" fill="#1a2128"/>{inner}</g>
<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="#e2b257" stroke-width="4"/><text x="{cx}" y="{cy+R+40}" font-family="Pretendard,sans-serif" font-size="26" font-weight="700" fill="#e2b257" text-anchor="middle">{label}</text></g>'''
ART={}
# 04 보스턴 당밀 탱크
s=head(('#2b3a52','#c77a4a','#f0b070'))
s+=f'<circle cx="1200" cy="520" r="260" fill="url(#sun)"/>'+city(560,4,'#2a2320',80,220,win='#ffd18a')
s+='<g fill="#1a1412"><rect x="0" y="300" width="1600" height="16"/>'+''.join(f'<rect x="{x}" y="300" width="14" height="300"/><path d="M{x-30} 316 L{x+7} 360 L{x+44} 316" fill="none" stroke="#1a1412" stroke-width="8"/>' for x in range(60,1600,180))+'</g>'
s+='<g><path d="M520 600 L520 250 Q700 200 880 250 L880 600 Z" fill="#4a3a32"/>'+''.join(f'<path d="M520 {y} Q700 {y-28} 880 {y}" fill="none" stroke="#2c221d" stroke-width="5"/>' for y in range(290,600,52))+''.join(f'<circle cx="{x}" cy="{y}" r="3" fill="#2c221d"/>' for y in range(300,600,52) for x in range(530,880,22))+'</g>'
s+='<path d="M690 600 L720 420 L700 330 L735 250" fill="none" stroke="#ff6a3a" stroke-width="10" filter="url(#glow)"/>'
s+='<path d="M560 600 Q640 470 720 430 Q820 470 1000 560 Q1250 590 1600 600 L1600 800 L0 800 L0 640 Q300 600 560 600 Z" fill="#3a1d0e"/><path d="M640 560 Q720 450 760 445 Q800 520 1000 590 Q760 610 640 560 Z" fill="#6a3416" opacity=".9"/>'
s+='<g fill="#1a1412"><rect x="1080" y="520" width="90" height="40" rx="6" transform="rotate(-18 1120 540)"/><circle cx="1090" cy="572" r="14"/><circle cx="1160" cy="552" r="14"/></g>'+tail(); ART[4]=s
# 05 코멧
s=head(('#0d2238','#2f6a8e','#9ac6d8'),'#fff1c8')+'<circle cx="1300" cy="200" r="220" fill="url(#sun)"/>'+water(640,'#123447','#9fd0e0',5)
s+='<g transform="translate(160 330) rotate(-4)"><path d="M0 60 Q40 20 160 18 L900 14 Q1000 16 1040 40 Q1000 70 900 74 L160 78 Q40 78 0 60 Z" fill="#dfe6ea"/><path d="M60 40 L0 -100 L60 -100 L170 20 Z" fill="#c9d1d6"/><path d="M40 50 L-40 10 L0 10 L100 46 Z" fill="#b9c2c7"/><path d="M420 50 L250 220 L330 220 L560 56 Z" fill="#c2cbd0"/><path d="M420 40 L330 -30 L380 -30 L520 36 Z" fill="#b9c2c7"/>'+''.join(f'<rect x="{x}" y="30" width="22" height="22" fill="#2b3b47"/>' for x in range(200,760,46))+'</g>'
s+=inset(1220,520,170,'<rect x="1150" y="450" width="140" height="140" fill="#2b3b47" stroke="#dfe6ea" stroke-width="14"/>'+crack(1290,450,-.8,160,7,6)+crack(1150,590,2.4,120,8,5),'창문 모서리')
s+=tail(); ART[5]=s
# 06 F-111
s=head(('#1b1430','#7a3e5a','#e68a5a'))+'<circle cx="400" cy="560" r="300" fill="url(#sun)"/>'+'<path d="M0 640 Q400 600 800 630 T1600 620 L1600 800 L0 800 Z" fill="#2a1d24"/>'
s+='<g transform="translate(800 380) rotate(-12)"><path d="M-520 0 L380 -18 Q470 0 380 18 L-520 14 Z" fill="#3a3f48"/><path d="M-60 -6 L-420 -250 L-360 -250 L60 -10 Z" fill="#454b55"/><path d="M-60 10 L-420 260 L-360 262 L60 14 Z" fill="#454b55"/><path d="M-470 0 L-560 -150 L-500 -150 L-420 0 Z" fill="#3a3f48"/><path d="M-450 4 L-560 120 L-510 120 L-420 6 Z" fill="#3a3f48"/><circle cx="-20" cy="0" r="22" fill="#ffb36b" filter="url(#glow)"/></g>'
s+=inset(1280,250,150,'<rect x="1130" y="100" width="300" height="300" fill="#4a505a"/><circle cx="1280" cy="250" r="70" fill="#5b626c" stroke="#2a2e35" stroke-width="10"/><circle cx="1280" cy="250" r="24" fill="#2a2e35"/>'+crack(1215,280,2.6,120,11,5),'날개 회전축 부품')+tail(); ART[6]=s
# 07 실버 브리지
s=head(('#1c2333','#58607a','#c9a17a'))+'<circle cx="800" cy="520" r="280" fill="url(#sun)"/>'+'<path d="M0 470 Q300 420 600 460 T1200 450 T1600 470 L1600 560 L0 560 Z" fill="#2f3440"/>'+water(560,'#2a3340','#c9a17a',9)
tw=[(300,190),(1300,190)]
s+='<g fill="#20242c">'+''.join(f'<rect x="{x-24}" y="{y}" width="48" height="380"/><rect x="{x-60}" y="{y-12}" width="120" height="22"/>' for x,y in tw)+'</g>'
def chain(x0,y0,x1,y1,sag):
    pts=[(x0+(x1-x0)*t, y0+(y1-y0)*t+sag*4*t*(1-t)) for t in [i/24 for i in range(25)]]
    return ''.join(f'<line x1="{a[0]:.0f}" y1="{a[1]:.0f}" x2="{b[0]:.0f}" y2="{b[1]:.0f}" stroke="#2c313b" stroke-width="9"/><circle cx="{b[0]:.0f}" cy="{b[1]:.0f}" r="7" fill="#2c313b"/>' for a,b in zip(pts,pts[1:]))
s+=chain(-40,420,300,190,40)+chain(300,190,1300,190,230)+chain(1300,190,1640,420,40)
s+='<g stroke="#2c313b" stroke-width="4">'+''.join(f'<line x1="{x}" y1="{190+230*4*((x-300)/1000)*(1-(x-300)/1000):.0f}" x2="{x}" y2="520"/>' for x in range(360,1300,60))+'</g>'
s+='<path d="M0 520 L760 520 L760 540 L0 540 Z M900 560 L1600 520 L1600 540 L880 585 Z" fill="#20242c"/><path d="M760 520 L820 640 L800 650 L745 540 Z" fill="#20242c"/>'
s+=crack(300,200,0,30,4,8)+'<circle cx="330" cy="205" r="18" fill="none" stroke="#ff6a3a" stroke-width="5" filter="url(#glow)"/>'+tail(); ART[7]=s
# 08 성수대교
s=head(('#26324a','#7a8aa8','#e9c9a0'),'#ffe0b0')+'<circle cx="1250" cy="330" r="230" fill="url(#sun)"/>'+city(470,8,'#3a4458',60,260,50,110,win='#ffe3a8')+water(500,'#3b4a60','#e9c9a0',8,80)
def truss(x0,x1,y,h=70):
    s=f'<rect x="{x0}" y="{y}" width="{x1-x0}" height="10" fill="#2b3240"/><rect x="{x0}" y="{y-h}" width="{x1-x0}" height="8" fill="#2b3240"/>'
    n=int((x1-x0)/50)
    for i in range(n): a=x0+i*(x1-x0)/n; b=x0+(i+1)*(x1-x0)/n; s+=f'<line x1="{a:.0f}" y1="{y}" x2="{b:.0f}" y2="{y-h}" stroke="#2b3240" stroke-width="5"/><line x1="{b:.0f}" y1="{y}" x2="{b:.0f}" y2="{y-h}" stroke="#2b3240" stroke-width="4"/>'
    return s
s+=truss(-20,650,470)+truss(950,1620,470)
s+='<g fill="#262c38">'+''.join(f'<rect x="{x}" y="470" width="34" height="200"/>' for x in (180,520,1060,1400))+'</g>'
s+='<g transform="rotate(8 800 560)">'+truss(650,950,600)+'</g><path d="M600 620 Q800 600 1000 640" stroke="#cfe" stroke-width="3" opacity=".3" fill="none"/>'
s+=crack(650,470,1.3,60,12,6)+crack(950,470,1.8,60,13,6)+tail(); ART[8]=s
# 09 ICE 에셰데
s=head(('#2a3b46','#7aa0a6','#d9e2cf'),'#fff7d8')+'<path d="M0 520 Q400 470 800 500 T1600 480 L1600 800 L0 800 Z" fill="#3d5a3a"/><path d="M0 600 L1600 560 L1600 610 L0 650 Z" fill="#6c6a62"/>'
s+='<g stroke="#2b2b2b" stroke-width="5">'+''.join(f'<line x1="{x}" y1="{620-x*.025:.0f}" x2="{x+20}" y2="{640-x*.025:.0f}"/>' for x in range(0,1600,40))+'</g>'
s+='<path d="M980 520 L1060 300 L1600 300 L1600 340 L1090 340 L1030 520 Z" fill="#b8b8ae"/><rect x="1100" y="340" width="40" height="230" fill="#9c9c92"/>'
s+='<g transform="translate(-40 0)"><path d="M60 560 L60 440 Q60 400 120 395 L760 380 Q880 380 940 450 Q960 490 950 540 L60 560 Z" fill="#f2f2ee"/><rect x="60" y="500" width="890" height="16" fill="#c8102e"/>'+''.join(f'<rect x="{x}" y="420" width="70" height="40" rx="6" fill="#20262c"/>' for x in range(110,760,95))+'</g>'
s+=inset(1220,560,160,'<circle cx="1220" cy="560" r="130" fill="#3a3f45"/><circle cx="1220" cy="560" r="96" fill="#555b62"/><circle cx="1220" cy="560" r="30" fill="#2a2e33"/>'+crack(1220,432,1.5,40,9,6,branches=0)+crack(1312,560,3.3,30,10,5,branches=0),'바퀴 타이어 안쪽')+tail(); ART[9]=s
# 10 알로하 243
s=head(('#2e6b9a','#79b7d6','#f3e3b8'),'#fff6d0')+'<circle cx="300" cy="220" r="200" fill="url(#sun)"/>'+water(600,'#1d6a86','#cdeef5',6,90)
s+='<path d="M1250 600 Q1350 520 1480 560 L1600 580 L1600 610 L1200 610 Z" fill="#2e4a2a"/>'
s+='<g transform="translate(180 300) rotate(-3)"><path d="M0 70 Q30 20 140 18 L1000 18 Q1110 22 1160 60 Q1110 100 1000 104 L140 104 Q30 104 0 70 Z" fill="#e9ecee"/><path d="M40 60 L-20 -90 L40 -90 L180 22 Z" fill="#d8dcdf"/><path d="M520 90 L380 230 L470 230 L660 92 Z" fill="#cfd4d8"/><rect x="0" y="60" width="1150" height="10" fill="#d23a3a"/>'
s+='<path d="M230 18 L520 18 L520 60 Q470 40 420 58 Q350 30 300 60 Q260 40 230 60 Z" fill="#79b7d6"/>'+crack(230,40,1.6,40,21,4)+crack(520,40,1.4,40,22,4)
s+=''.join(f'<rect x="{x}" y="38" width="16" height="18" rx="3" fill="#2b3b47"/>' for x in list(range(150,220,34))+list(range(540,940,34)))+'<g stroke="#9aa3a8" stroke-width="4">'+''.join(f'<line x1="{x}" y1="60" x2="{x}" y2="40"/>' for x in range(240,520,28))+'</g></g>'+tail(); ART[10]=s
# 11 우스터 수영장
s=head(('#18303a','#2b5866','#3f7d88'),'#bff4ff')
s+='<rect x="0" y="0" width="1600" height="150" fill="#5c6266"/><rect x="0" y="150" width="1600" height="26" fill="#474c50"/>'
s+=water(560,'#1f7f9a','#bff4ff',11,120)+'<rect x="0" y="540" width="1600" height="24" fill="#d9dcd6"/>'+''.join(f'<rect x="{x}" y="564" width="6" height="236" fill="#d9dcd6" opacity=".35"/>' for x in range(0,1600,200))
for i,x in enumerate(range(160,1600,240)):
    if i==3: s+=f'<line x1="{x}" y1="176" x2="{x}" y2="250" stroke="#9aa0a4" stroke-width="10"/>'+crack(x,250,1.57,20,31,6,branches=0)+f'<line x1="{x+10}" y1="290" x2="{x+40}" y2="470" stroke="#9aa0a4" stroke-width="10"/>'
    else: s+=f'<line x1="{x}" y1="176" x2="{x}" y2="420" stroke="#9aa0a4" stroke-width="10"/>'
s+='<path d="M0 420 L760 420 L760 440 L0 440 Z M800 470 L1600 420 L1600 440 L790 492 Z" fill="#6a6f73"/>'
s+=inset(1340,300,140,'<rect x="1270" y="160" width="140" height="300" fill="#6d7378"/><rect x="1320" y="160" width="40" height="300" fill="#9aa0a4"/>'+crack(1320,300,0,40,33,5)+crack(1360,320,3.1,40,34,5),'스테인리스 고정봉')+tail(); ART[11]=s
# 12 베이 브리지 앵커 로드
s=head(('#1b2a44','#4d6a92','#f0a878'))+'<circle cx="1150" cy="560" r="300" fill="url(#sun)"/>'+city(560,12,'#2b3346',100,300,40,90,win='#ffd29a')+water(600,'#2a3a52','#f0a878',12,90)
s+='<path d="M800 120 L770 600 L830 600 Z" fill="#d9dde2"/><g stroke="#d9dde2" stroke-width="3">'+''.join(f'<line x1="800" y1="140" x2="{x}" y2="560"/>' for x in list(range(200,760,60))+list(range(860,1420,60)))+'</g><rect x="0" y="555" width="1600" height="18" fill="#c9ced4"/>'
s+=inset(260,250,160,'<rect x="100" y="320" width="320" height="100" fill="#8b8f93"/>'+''.join(f'<rect x="{x}" y="150" width="22" height="180" fill="#5a5f64"/><rect x="{x-14}" y="290" width="50" height="22" fill="#3c4044"/>' for x in (150,215,280,345))+'<rect x="150" y="96" width="22" height="40" fill="#5a5f64" transform="rotate(-20 160 120)"/>'+crack(150,148,0,26,41,5,branches=0),'끊어진 앵커 로드')+tail(); ART[12]=s
# 13 알렉산더 키엘란
s=head(('#1e2a38','#4a5e72','#8aa0b4'),'#e8f0f8')+'<circle cx="1200" cy="300" r="260" fill="url(#sun)" opacity=".5"/>'+water(560,'#1b2733','#8fa3b5',13,140)
s+='<g transform="rotate(-14 800 500)"><rect x="420" y="300" width="760" height="60" fill="#6a737d"/><rect x="500" y="250" width="200" height="50" fill="#8a939d"/><path d="M900 300 L940 150 L960 150 L940 300 Z" fill="#8a939d"/>'
s+=''.join(f'<rect x="{x}" y="360" width="56" height="300" fill="#7a838d"/>' for x in (460,720,980,1110))+'<line x1="516" y1="480" x2="720" y2="560" stroke="#7a838d" stroke-width="18"/><line x1="776" y1="560" x2="980" y2="480" stroke="#7a838d" stroke-width="18"/>'
s+=crack(1040,520,1.2,50,51,6)+'</g><path d="M1080 560 L1180 700" stroke="#7a838d" stroke-width="56"/>'
s+='<g stroke="#8fa3b5" stroke-width="2" opacity=".35">'+''.join(f'<line x1="{x}" y1="0" x2="{x-80}" y2="560"/>' for x in range(0,1700,37))+'</g>'+tail(); ART[13]=s
# 14 JAL 123
s=head(('#1e2a3a','#5a6a86','#e8b48a'))+'<circle cx="1250" cy="480" r="260" fill="url(#sun)"/>'+'<path d="M0 560 L180 420 L320 520 L520 360 L700 500 L900 400 L1100 540 L1300 430 L1600 560 L1600 800 L0 800 Z" fill="#26323a"/><path d="M0 640 L260 540 L500 610 L760 520 L1000 620 L1300 560 L1600 640 L1600 800 L0 800 Z" fill="#1b2329"/>'
s+='<g transform="translate(220 230) rotate(6)"><path d="M0 70 Q40 10 160 6 L900 6 Q1000 10 1050 40 L1060 70 Q1000 96 900 98 L160 98 Q40 98 0 70 Z" fill="#e8ecee"/><path d="M0 70 Q40 10 160 6 L300 6 Q260 0 220 -20 Q120 -24 60 20 Z" fill="#dfe3e6"/><rect x="0" y="54" width="1060" height="10" fill="#c8102e"/><path d="M500 92 L300 260 L420 262 L700 96 Z" fill="#d3d8dc"/>'
s+='<path d="M980 10 L1000 -20 L1030 -16 L1040 16 Z" fill="#e8ecee"/>'+crack(1000,-14,-1.2,40,61,5)+'</g>'
s+=inset(1400,610,130,'<circle cx="1400" cy="610" r="120" fill="#7a8088"/>'+''.join(f'<line x1="1400" y1="610" x2="{1400+120*math.cos(a):.0f}" y2="{610+120*math.sin(a):.0f}" stroke="#5a6068" stroke-width="5"/>' for a in [i*math.pi/8 for i in range(16)])+'<line x1="1400" y1="490" x2="1400" y2="730" stroke="#3a3f45" stroke-width="10"/>'+crack(1400,510,1.57,200,62,5,branches=1),'뒤쪽 압력 격벽')+tail(); ART[14]=s
# 15 콩코드
s=head(('#2a2440','#8a5a6a','#f2b37a'))+'<circle cx="1300" cy="520" r="240" fill="url(#sun)"/>'+'<rect x="0" y="560" width="1600" height="240" fill="#3a3536"/><g fill="#e8e2d6" opacity=".7">'+''.join(f'<rect x="{x}" y="660" width="60" height="6"/>' for x in range(0,1600,140))+'</g>'
s+='<g transform="translate(240 380) rotate(-8)"><path d="M0 40 L60 30 L1000 24 Q1080 26 1100 40 Q1080 52 1000 54 L60 52 Z" fill="#ecebe6"/><path d="M400 50 L220 120 L860 60 Z" fill="#dcdbd5"/><path d="M60 32 L20 -110 L70 -110 L220 28 Z" fill="#dcdbd5"/>'+''.join(f'<rect x="{x}" y="64" width="44" height="22" fill="#4a4a4a"/>' for x in (430,480,560,610))+'</g>'
s+='<path d="M460 470 Q300 520 60 470 Q240 430 470 450 Z" fill="#ff7a2a" filter="url(#glow)" opacity=".9"/><path d="M460 470 Q340 500 160 480 Q300 450 470 455 Z" fill="#ffe08a" opacity=".8"/>'
s+='<path d="M0 420 Q200 360 420 450" stroke="#2a2a2a" stroke-width="60" opacity=".35" fill="none" filter="url(#soft)"/>'
s+='<rect x="980" y="640" width="160" height="10" fill="#c9c9c9" transform="rotate(-8 1060 645)"/>'+crack(1140,630,0,16,71,3,col='#ffcf7a',branches=0)+tail(); ART[15]=s
os.makedirs(OUT,exist_ok=True)
for n,s in ART.items(): open(f'{OUT}/c{n}.svg','w').write(s)
print('ok',sorted(ART))
