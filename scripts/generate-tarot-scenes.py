"""Original narrative SVG illustrations for AstroAI; no external artwork or fonts bundled."""
from pathlib import Path
import math, random, html
root=Path('public/assets/tarot/celestial-v1')
G='#dfbc7f'; I='#f1dfb8'
def path(d,fill='none',stroke=G,width=3):return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"/>'
def circle(x,y,r,fill=G,stroke='none',w=2):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{w}"/>'
def line(x,y,a,b,color=G,w=3):return path(f'M{x} {y}L{a} {b}',stroke=color,width=w)
def star(x,y,r=18):return path('M'+' '.join(f'{x+math.sin(i*math.pi/4)*(r if i%2==0 else r/3):.1f},{y-math.cos(i*math.pi/4)*(r if i%2==0 else r/3):.1f}' for i in range(8))+'Z',G)
def wand(x,y,angle=0):return f'<g transform="translate({x} {y}) rotate({angle})">'+line(0,-125,0,80,'#b78555',9)+path('M0 -75Q-45 -110 -18 -125Q8 -117 0 -75M0 -25Q47 -75 26 -80Q-5 -75 0 -25','#7b9977',G,2)+'</g>'
def cup(x,y,s=1):return f'<g transform="translate({x} {y}) scale({s})">'+path('M-32 -36H32Q32 12 0 18Q-32 12 -32 -36Z','url(#metal)')+path('M32 -26Q70 -30 35 0M0 18V48M-25 48H25')+'</g>'
def sword(x,y,angle=0,s=1):return f'<g transform="translate({x} {y}) rotate({angle}) scale({s})">'+path('M0 -130L13 -108L7 5H-7L-13 -108Z','#c2cbd7')+line(-25,10,25,10,G,8)+line(0,12,0,50,'#a46e64',9)+circle(0,57,8)+'</g>'
def coin(x,y,s=1):return f'<g transform="translate({x} {y}) scale({s})">'+circle(0,0,29,'url(#metal)',G)+circle(0,0,23,'none','#51483d')+path('M0 -19L11 16L-18 -6H18L-11 16Z','none','#51483d',2)+'</g>'
def person(x,y,s=1,robe='#7d718d',pose='stand'):
 art=circle(0,-92,19,'#d0a487')+path('M-21 -94Q-20 -125 0 -119Q25 -124 23 -85L10 -98Q0 -108 -18 -91Z','#3b3547')
 art+=path('M-19 -67Q0 -78 19 -67L42 64Q1 84 -42 64Z',robe)+path('M-12 -58Q-2 -3 -20 54M12 -58Q4 8 23 61M-31 62Q0 49 32 65','none','#d7bd90',2)
 art+=path('M-17 -64Q-44 -36 -55 -8M17 -64Q38 -31 51 -20','none',robe,20)+circle(-55,-8,7,'#d0a487')+circle(51,-20,7,'#d0a487')
 if pose=='raise':art+=path('M17 -61Q53 -115 61 -164','none',robe,18)+circle(61,-165,7,'#d0a487')
 if pose=='sit':art+=path('M-25 36Q-69 55 -54 90H-18L-4 66L22 91H56Q70 55 25 36Z',robe)
 art+=line(-13,74,-17,93,'#302b39',9)+line(15,74,24,93,'#302b39',9)
 return f'<g transform="translate({x} {y}) scale({s})">{art}</g>'
def animal(x,y,s=1,color='#a7845d'):
 return f'<g transform="translate({x} {y}) scale({s})">'+path('M-57 1Q-32 -40 25 -16L52 -51L82 -43L76 -17L51 -3L35 52H21L21 8L-27 12L-40 54H-55L-45 7Q-90 32 -90 -21',color)+path('M51 -48L60 -68L67 -49M-32 -14Q-49 -61 -65 -52','none',G,3)+circle(69,-39,3,'#131829')+'</g>'
def throne():return path('M255 825V470L280 440L305 470V730H463V470L488 440L513 470V825Z','#293c47')+path('M303 715H465V815H303Z','#4f5260')
def arch(x=384,y=440,w=170):return path(f'M{x-w} 830V{y+150}Q{x-w} {y-130} {x} {y-150}Q{x+w} {y-130} {x+w} {y+150}V830','none','#ae9670',16)
def wings():return path('M360 530Q225 325 171 445Q250 475 296 571M408 530Q543 325 597 445Q520 475 472 571','#b9b7ae')
def boat(x,y,s=1):return f'<g transform="translate({x} {y}) scale({s})">'+path('M-70 0H70L42 30H-43Z','#6a5b57')+path('M0 -110V0M5 -103L58 -13H5Z','#e0d7bf')+'</g>'
def flowers(seed):
 rng=random.Random(seed);return ''.join(line(x,y,x,y-35,'#748b76',3)+circle(x,y-40,10,'#bda0a2')+circle(x,y-40,4,I) for x,y in [(rng.randint(135,630),rng.randint(785,868))for _ in range(10)])
def scene_major(i):
 p=person
 if i==0:return path('M90 790L370 745L460 780L360 930H90Z','#585767')+p(340,650,1.2,'#8a6173','raise')+animal(465,775,.5,'#ddd5be')+wand(265,590,-18)
 if i==1:return p(384,600,1.4,'#8a5265','raise')+path('M245 754H530L510 782H266ZM280 782V870M490 782V870','#6e5b58')+cup(300,736,.5)+sword(470,741,75,.45)+coin(398,737,.55)+line(330,738,430,738)+path('M355 345C310 305 310 390 355 345C410 300 410 390 355 345Z')
 if i==2:return arch()+path('M195 835V390H265V835M503 835V390H573V835','#34404f')+throne()+p(384,655,1.3,'#5b7292','sit')+circle(384,460,23,I)+path('M345 835Q384 780 423 835','#b6ad83')
 if i==3:return flowers(i)+throne()+p(384,650,1.35,'#aa7885','sit')+''.join(star(384+85*math.cos(a),410+40*math.sin(a),8)for a in [j*math.pi/6 for j in range(12)])
 if i==4:return throne()+p(384,650,1.4,'#8c5255','sit')+wand(500,615)+coin(300,685)
 if i==5:return arch()+throne()+p(384,610,1.3,'#ab8a70','sit')+p(260,800,.75,'#5c6d84')+p(505,800,.75,'#776380')+line(490,390,490,690)+line(460,430,520,430)
 if i==6:return wings()+p(384,500,1,'#b6a279')+p(270,750,1.1,'#987a89')+p(510,750,1.1,'#6f8796')+path('M90 700L280 535L384 650L520 540L680 740','#465563')
 if i==7:return path('M250 760V590H520V760Z','#3c4f6c')+p(385,555,1,'#8192ab')+circle(280,780,53,'#273241',G,4)+circle(492,780,53,'#273241',G,4)+animal(210,840,.65,'#d6c9b2')+animal(530,840,.65,'#3e424a')
 if i==8:return flowers(i)+p(385,640,1.3,'#c6b896')+animal(420,790,1.15,'#b88b52')+path('M335 410C290 370 290 460 335 410C385 365 385 460 335 410Z')
 if i==9:return path('M100 870L335 730L425 755L650 900','#576b7c')+p(395,635,1.45,'#576778')+line(500,500,500,840)+path('M245 560V465H305V560Z','#a88755')+star(275,508,20)
 if i==10:return circle(384,620,172,'#353d59',G,7)+circle(384,620,135,'none',G,3)+''.join(line(384,620,384+170*math.cos(a),620+170*math.sin(a))for a in [k*math.pi/4 for k in range(8)])+star(384,620,62)+''.join(cup(x,y,.7) for x,y in [(210,390),(560,390),(200,830),(565,830)])
 if i==11:return throne()+p(384,655,1.3,'#8f6471','sit')+sword(510,600,0,.9)+line(245,545,365,545)+path('M270 545L240 635H300ZM340 545L310 635H370Z','url(#metal)')
 if i==12:return path('M220 830V330H570M190 375H545','none','#817358',24)+f'<g transform="translate(385 680) rotate(180)">{person(0,0,1.2,"#6e8597")}</g>'+line(385,330,385,575)+circle(385,790,38,'none',G)
 if i==13:return animal(395,770,1.7,'#c9d1d0')+p(360,570,1.05,'#424b5f')+path('M500 340V725M500 345H625V470H500Z','#383448')+star(560,409,37)+path('M120 860Q240 750 345 850T650 850','none','#929fb4',9)
 if i==14:return wings()+p(384,650,1.5,'#bfc3bb')+cup(295,620,.8)+cup(490,680,.8)+path('M305 615Q360 640 470 665','none','#98b7bd',9)+flowers(i)
 if i==15:return arch()+p(384,595,1.8,'#52445e')+path('M350 390L290 320L328 422M420 390L480 320L440 422','none',G,7)+p(245,810,.65,'#9c7e76')+p(525,810,.65,'#8f7d88')+path('M260 830Q350 890 380 730Q430 890 510 830','none','#aeb0b7',4)
 if i==16:return path('M270 850L300 400H465L505 850Z','#626174')+path('M290 400L260 345L328 370L384 315L448 370L495 330L475 400','#a48c5e')+path('M510 240L355 505H425L310 720','url(#metal)')+f'<g transform="rotate(-42 200 700)">{p(200,700,.7)}</g>'+f'<g transform="rotate(35 570 710)">{p(570,710,.7)}</g>'
 if i==17:return ''.join(star(384+175*math.cos(k*math.pi/4),445+100*math.sin(k*math.pi/4),18) for k in range(8))+star(384,405,65)+p(350,720,1.1,'#b9938b','sit')+cup(490,760,.7)+path('M490 765Q480 860 595 875M90 870Q225 820 370 877T680 860','none','#a2b8c9',7)
 if i==18:return path('M130 820V470H220V820M550 820V470H640V820','#636578')+path('M427 345A105 105 0 1 0 427 555A85 105 0 0 1 427 345Z','#d4c9aa')+animal(255,810,.7,'#aea18d')+animal(505,810,.7,'#758092')+path('M290 900Q480 780 340 650','none','#baa77b',10)
 if i==19:return circle(384,435,95,'url(#metal)')+''.join(line(384+115*math.cos(a),435+115*math.sin(a),384+145*math.cos(a),435+145*math.sin(a))for a in [k*math.pi/8 for k in range(16)])+animal(390,795,1.4,'#ded6c0')+p(390,650,.9,'#c49b7a','raise')+flowers(i)
 if i==20:return wings()+p(384,510,1,'#bcb0a1')+path('M370 520L530 580L510 630L350 550Z','url(#metal)')+''.join(p(x,820,.8,'#8d9b9e','raise') for x in [230,385,540])+path('M100 875H670','none','#829da9',20)
 return path('M384 330C120 320 130 860 384 880C650 860 650 320 384 330Z','none','#839e86',28)+p(385,610,1.45,'#9d819b','raise')+''.join(star(x,y,35)for x,y in [(170,390),(595,390),(165,835),(600,835)])
def scene_minor(suit,n):
 c={'wands':'#9b6a62','cups':'#7898a3','swords':'#7e839d','pentacles':'#8a946b'}[suit]
 item={'wands':wand,'cups':cup,'swords':sword,'pentacles':coin}[suit]
 if n==1:return path('M220 750Q275 660 360 680L460 640L490 680L380 750L310 800Z','#b7a28e')+item(395,560)
 if n>=11:
  scene=(animal(410,785,1.45,'#b6ab96')+person(380,605,1,c)) if n==12 else (throne()+person(384,650,1.35,c,'sit')) if n>=13 else person(385,690,1.5,c)
  scene+=item(495,550)+flowers(suit+n.__str__())
  if n==13:scene+=animal(250,840,.35,'#30313e')
  if n==14:scene+=path('M300 420L285 370L335 390L384 340L433 390L483 370L468 420Z','url(#metal)')
  return scene
 if suit=='wands':
  if n in [2,3]:return person(385,660,1.3,c)+path('M120 835V750H650V835','#615a68')+''.join(wand(240+j*140,640)for j in range(n))+boat(540,725,.4)
  if n==4:return ''.join(wand(x,650)for x in [195,255,515,575])+path('M185 485Q384 580 585 485','none','#87a083',17)+person(335,760,.75,c)+person(440,760,.75,'#a2a187')
  if n==5:return ''.join(person(210+j*85,740+(j%2)*45,.85,c)+wand(205+j*85,590,(-1)**j*22)for j in range(5))
  if n==6:return animal(390,785,1.6)+person(375,590,1.1,c)+wand(510,550)+circle(510,420,32,'none','#899b73',12)+''.join(person(x,800,.6,'#637389') for x in [175,255,570])
  if n==8:return ''.join(wand(170+(j%4)*125,470+(j//4)*200,45)for j in range(8))
  return person(384,660,1.3,c)+''.join(wand(130+(j%6)*100,810 if n==7 else 530,(j-3)*6 if n==10 else 0)for j in range(n-1))
 if suit=='cups':
  if n==2:return person(270,700,1.15,c)+person(500,700,1.15,'#ad8a93')+cup(338,635,.7)+cup(433,635,.7)+star(384,420,40)
  if n==3:return ''.join(person(x,730,.95,c,'raise')+cup(x+50,540,.6)for x in [245,380,515])+flowers(n)
  if n in [4,5,8]:return person(440 if n!=8 else 570,670,1.2,c,'sit' if n==4 else 'stand')+''.join(cup(180+(j%4)*125,790-(j//4)*150,.8)for j in range(n))
  if n==6:return arch(410,500,120)+person(305,750,.8,c)+person(460,780,.7,'#b1a08e')+''.join(cup(170+j*85,835,.65)for j in range(6))+flowers(n)
  if n==7:return ''.join(cup(220+(j%3)*155,440+(j//3)*135,.8)+star(220+(j%3)*155,385+(j//3)*135,11)for j in range(7))+person(384,825,.9,c)
  return path('M170 540Q384 310 610 540','none','#bea7a2',11)+''.join(cup(170+j*51,565,.6)for j in range(n))+person(330,760,1.1,c,'raise')+person(460,760,1.1,'#b5a28c','sit')
 if suit=='swords':
  if n==2:return person(384,680,1.3,c,'sit')+sword(330,570,-42)+sword(450,570,42)+line(350,565,420,565,'#d0c8b3',13)
  if n==3:return path('M384 760C150 600 265 440 384 535C503 440 618 600 384 760Z','#985f70')+sword(384,590)+sword(310,600,-30)+sword(460,600,30)
  if n==4:return path('M180 790H580V850H180Z','#88775e')+f'<g transform="rotate(-90 380 730)">{person(380,730,1.2,c)}</g>'+''.join(sword(250+j*135,500)for j in range(3))+sword(384,855,90)
  if n==6:return boat(384,820,2)+person(360,680,1,c)+''.join(sword(510+j*13,730)for j in range(6))
  if n==8:return person(384,700,1.2,c)+''.join(sword(170+j*60,640)for j in range(8))+line(350,680,420,680,'#c7bda4',10)
  if n==9:return path('M210 790H550V850H210Z','#66586b')+person(390,690,1.3,c,'sit')+''.join(sword(200+j*44,430+(j%3)*55,90,.7)for j in range(9))
  if n==10:return f'<g transform="rotate(-80 395 790)">{person(395,790,1.3,c)}</g>'+''.join(sword(200+j*37,640,15,.75)for j in range(10))
  return person(300 if n==5 else 450,690,1.3,c)+''.join(sword(190+j*62,700 if j%2 else 560,(j%3-1)*25,.75)for j in range(n))
 if n==2:return person(384,700,1.3,c)+coin(280,610,1.4)+coin(490,630,1.4)+path('M280 610C150 430 600 450 490 630C650 840 140 830 280 610Z','none',G,4)
 if n==3:return arch()+person(350,690,1.2,c)+person(510,770,.9,'#ac8a7d')+''.join(coin(290+j*95,430)for j in range(3))
 if n==4:return person(384,685,1.35,c,'sit')+''.join(coin(x,y,1.1)for x,y in [(384,490),(384,645),(300,825),(470,825)])
 if n==5:return arch(425,420,135)+''.join(coin(340+(j%2)*125,420+(j//2)*95,.8)for j in range(5))+person(250,800,.85,c)+person(520,810,.85,'#9d818b')
 if n==6:return person(385,690,1.3,c)+person(220,795,.8,'#a38b7e','sit')+person(540,795,.8,'#7d819b','sit')+''.join(coin(220+j*66,450,.7)for j in range(6))+path('M290 560H430M310 560L290 620H330ZM410 560L390 620H430Z')
 if n in [7,8]:return person(500,715,1.3,c)+path('M270 850V370','none','#77896e',20)+''.join(coin(240+(j%2)*85,430+(j//2)*105,.8)for j in range(n))
 return flowers(n)+arch(384,460,175)+person(320,700,1.2,c)+(''+person(480,750,.85,'#a99184')if n==10 else '')+''.join(coin(160+(j%5)*112,400+(j//5)*135,.7)for j in range(n))
def frame(name,number,foreground,seed,accent):
 rng=random.Random(str(seed));stars=''.join(circle(rng.randint(105,665),rng.randint(230,550),rng.choice([1,1,2]),'#cfbf9c')for _ in range(54))
 return f'''<svg xmlns="http://www.w3.org/2000/svg" width="768" height="1152" viewBox="0 0 768 1152" role="img" aria-label="{html.escape(name)}"><defs><linearGradient id="sky" x2=".3" y2="1"><stop stop-color="#101a31"/><stop offset=".65" stop-color="{accent}"/><stop offset="1" stop-color="#213c46"/></linearGradient><linearGradient id="metal" x2="1" y2="1"><stop stop-color="#f1dfb6"/><stop offset="1" stop-color="#af8b51"/></linearGradient><clipPath id="scene"><path d="M90 920V335Q90 205 384 190Q678 205 678 335V920Z"/></clipPath></defs><rect width="768" height="1152" rx="28" fill="#0b1427"/><rect x="25" y="25" width="718" height="1102" rx="25" fill="none" stroke="{G}" stroke-width="2"/><rect x="43" y="43" width="682" height="1066" rx="20" fill="none" stroke="{G}" stroke-opacity=".35"/><g clip-path="url(#scene)"><rect x="85" y="185" width="600" height="740" fill="url(#sky)"/>{stars}{circle(555,340,65,'#bbaa83')}{path('M70 725L220 515L360 700L510 500L700 740V930H70Z','#35485c')}{path('M70 810Q210 720 365 820T710 800V950H70Z','#263e49')}{foreground}</g>{path('M90 920V335Q90 205 384 190Q678 205 678 335V920Z','none',G,3)}{star(384,120,25)}{line(115,956,653,956)}<g text-anchor="middle" fill="{I}" font-family="Georgia,serif"><text x="384" y="170" font-size="19" letter-spacing="5">{number}</text><text x="384" y="1008" font-size="{27 if len(name)>19 else 31}">{html.escape(name.upper())}</text><text x="384" y="1055" font-size="13" letter-spacing="5" fill="{G}">ASTROAI · CELESTIAL</text></g></svg>'''
names=['The Fool','The Magician','The High Priestess','The Empress','The Emperor','The Hierophant','The Lovers','The Chariot','Strength','The Hermit','Wheel of Fortune','Justice','The Hanged Man','Death','Temperance','The Devil','The Tower','The Star','The Moon','The Sun','Judgement','The World']
for i,name in enumerate(names):(root/'major'/f'{i:02}.svg').write_text(frame(name,str(i),scene_major(i),i,'#535064'))
ranks=['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King']
for suit,accent in [('wands','#6b464d'),('cups','#3d6672'),('swords','#494f70'),('pentacles','#526658')]:
 for n,rank in enumerate(ranks,1):(root/'minor'/f'{suit}-{n:02}.svg').write_text(frame(f'{rank} of {suit.title()}',str(n),scene_minor(suit,n),f'{suit}{n}',accent))
print('Generated 78 original narrative SVG scenes; three starting concept cards replaced consistently.')
