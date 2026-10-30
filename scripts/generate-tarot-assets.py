"""Extend the supplied Celestial vector system with symbolic Major and pip Minor cards.
Run from repository root. No downloaded/commercial artwork is used.
"""
from pathlib import Path
from html import escape
import math
import random
import shutil
from PIL import Image

root = Path('public/assets/tarot/celestial-v1')
(root / 'major').mkdir(parents=True, exist_ok=True)
(root / 'minor').mkdir(parents=True, exist_ok=True)
source = Path('AstroAI_Celestial_Tarot_Concept/assets')
for i, name in enumerate(['00_the_fool', '01_the_magician', '02_the_high_priestess']):
    shutil.copyfile(source / (name + '.svg'), root / 'major' / f'{i:02}.svg')
shutil.copyfile(source / 'card_back.svg', root / 'card-back.svg')
Image.open(source / 'card_back.png').convert('RGB').save(root / 'card-back.webp', quality=85)

names = ['The Fool','The Magician','The High Priestess','The Empress','The Emperor','The Hierophant','The Lovers','The Chariot','Strength','The Hermit','Wheel of Fortune','Justice','The Hanged Man','Death','Temperance','The Devil','The Tower','The Star','The Moon','The Sun','Judgement','The World']
# Each Major has a different celestial emblem and composition; first three retain the concept illustrations.
emblems = {
3: '<path d="M290 590Q384 370 478 590Q384 750 290 590Z"/><path d="M384 380V760M280 460Q384 590 488 460M260 650Q384 530 508 650"/><circle cx="384" cy="565" r="42"/>',
4: '<path d="M260 720V450L310 490L384 360L458 490L508 450V720ZM280 740H488M310 620H458"/><circle cx="384" cy="530" r="28"/>',
5: '<path d="M384 340V770M300 410H468M320 470H448M320 740L384 680L448 740"/><circle cx="384" cy="350" r="40"/>',
6: '<path d="M384 700C180 570 270 370 384 490C498 370 588 570 384 700Z"/><circle cx="310" cy="330" r="36"/><circle cx="458" cy="330" r="36"/><path d="M346 330H422"/>',
7: '<path d="M250 650L384 360L518 650ZM290 600H478M270 690H498"/><circle cx="290" cy="710" r="35"/><circle cx="478" cy="710" r="35"/>',
8: '<path d="M384 500C230 300 190 650 384 500C578 350 538 700 384 500Z"/><path d="M280 700Q384 550 488 700Q384 790 280 700Z"/>',
9: '<path d="M320 380H448L480 640H288ZM320 640V700H448V640M384 410V590M340 500H428"/><path d="M384 460L405 500L384 540L363 500Z"/>',
10: '<circle cx="384" cy="550" r="160"/><circle cx="384" cy="550" r="120"/><path d="M384 350V750M184 550H584M245 410L523 690M245 690L523 410"/>',
11: '<path d="M384 360V740M250 450H518M300 740H468M270 450L220 600H320ZM498 450L448 600H548Z"/>',
12: '<path d="M280 360H488M384 360V480L320 600L420 690M384 480L448 570L384 610"/><circle cx="420" cy="740" r="42"/><circle cx="420" cy="740" r="65" opacity=".5"/>',
13: '<path d="M384 730V400M384 490Q240 320 270 550Q300 610 384 600M384 590Q530 390 500 620Q450 680 384 660"/><circle cx="384" cy="370" r="45"/>',
14: '<path d="M250 400H390L360 510H280ZM378 630H518L488 740H408ZM330 510Q330 630 448 630"/><circle cx="384" cy="330" r="40"/>',
15: '<path d="M384 360L550 680H218ZM260 740Q300 570 384 700Q468 570 508 740"/><circle cx="384" cy="540" r="80"/><path d="M330 400L300 340M438 400L468 340"/>',
16: '<path d="M290 740L320 430H448L478 740ZM300 430L280 370L340 400L384 350L428 400L488 370L468 430M420 280L350 520H420L330 700"/>',
17: '<path d="M384 350L425 495L570 550L425 595L384 750L343 595L198 550L343 495Z"/><circle cx="245" cy="360" r="14"/><circle cx="520" cy="740" r="14"/>',
18: '<path d="M425 360A190 190 0 1 0 425 740A145 190 0 0 1 425 360Z"/><path d="M230 800Q310 750 384 800T540 800"/>',
19: '<circle cx="384" cy="550" r="110" fill="#debd81" fill-opacity=".15"/>' + ''.join(f'<path d="M{384+140*math.cos(i*math.pi/8):.1f} {550+140*math.sin(i*math.pi/8):.1f}L{384+200*math.cos(i*math.pi/8):.1f} {550+200*math.sin(i*math.pi/8):.1f}"/>' for i in range(16)),
20: '<path d="M250 450L470 360V640L250 550ZM470 400L530 380V620L470 600M280 700Q384 630 488 700M310 760Q384 710 458 760"/>',
21: '<ellipse cx="384" cy="550" rx="160" ry="230"/><ellipse cx="384" cy="550" rx="135" ry="205"/><path d="M384 390L450 550L384 710L318 550Z"/><circle cx="384" cy="550" r="55"/>',
}

def frame(name, number, art, seed, accent='#776084'):
    rng = random.Random(seed)
    stars = ''.join(f'<circle cx="{rng.randint(85,683)}" cy="{rng.randint(150,920)}" r="{rng.choice([1,1,2])}" opacity="{rng.uniform(.15,.65):.2f}"/>' for _ in range(85))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="768" height="1152" viewBox="0 0 768 1152" role="img" aria-label="{escape(name)}">
<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#10172f"/><stop offset=".5" stop-color="#20204a"/><stop offset="1" stop-color="#080f23"/></linearGradient><radialGradient id="halo"><stop stop-color="{accent}" stop-opacity=".45"/><stop offset="1" stop-color="#20204a" stop-opacity="0"/></radialGradient></defs>
<rect width="768" height="1152" rx="28" fill="#080f23"/><rect x="26" y="26" width="716" height="1100" rx="24" fill="url(#bg)" stroke="#debd81" stroke-width="2"/>
<rect x="45" y="45" width="678" height="1062" rx="95" fill="none" stroke="#debd81" opacity=".7"/><rect x="55" y="55" width="658" height="1042" rx="18" fill="none" stroke="#debd81" opacity=".3"/>
<g fill="#debd81">{stars}</g><circle cx="384" cy="550" r="340" fill="url(#halo)"/>
<g fill="none" stroke="#debd81"><ellipse cx="384" cy="550" rx="250" ry="325" opacity=".25"/><ellipse cx="384" cy="550" rx="220" ry="290" opacity=".15"/><path d="M90 960H678M90 185H678" opacity=".5"/></g>
<g fill="none" stroke="#debd81" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">{art}</g>
<g fill="#f3e5c9" text-anchor="middle" font-family="Georgia,serif"><text x="384" y="130" font-size="27" letter-spacing="8">{number}</text><text x="384" y="1020" font-size="{27 if len(name)>19 else 32}" letter-spacing="2">{escape(name.upper())}</text><text x="384" y="1060" font-size="13" letter-spacing="6" fill="#debd81">ASTROAI · CELESTIAL</text></g></svg>'''

for i in range(3,22):
    (root / 'major' / f'{i:02}.svg').write_text(frame(names[i], str(i), emblems[i], i))

symbols = {
'wands': '<path d="M0 -58V58M0 -36Q-38 -65 -25 -80Q5 -72 0 -36M0 -5Q38 -40 28 -55Q0 -50 0 -5"/>',
'cups': '<path d="M-38 -45H38Q38 20 0 20Q-38 20 -38 -45ZM0 20V60M-28 60H28M38 -35Q78 -35 40 8"/>',
'swords': '<path d="M0 -80L15 -45V25H-15V-45ZM-35 30H35M0 30V65M-12 70H12"/>',
'pentacles': '<circle r="48"/><path d="M0 -38L23 31L-36 -12H36L-23 31Z"/>',
}
ranks=['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King']
for suit, symbol in symbols.items():
    for n, rank in enumerate(ranks,1):
        count = n if n<=10 else 1
        if count == 1: positions=[(384,550)]
        else:
            rows=math.ceil(count/2)
            positions=[(285 if j%2==0 else 483, 300+(j//2)*min(145,490/max(1,rows-1))) for j in range(count)]
            if count%2: positions[-1]=(384,positions[-1][1])
        art=''.join(f'<g transform="translate({x},{y}) scale({1.8 if count==1 else .9})">{symbol}</g>' for x,y in positions)
        if n>10:
            art+='<path d="M290 350L270 280L335 315L384 250L433 315L498 280L478 350Z"/>'
            art+=f'<text x="384" y="795" text-anchor="middle" font-family="Georgia,serif" font-size="36" fill="#debd81" stroke="none">{rank.upper()}</text>'
        path=root / 'minor' / f'{suit}-{n:02}.svg'
        path.write_text(frame(f'{rank} of {suit.title()}', str(n), art, suit+str(n), {'wands':'#a77a57','cups':'#677fac','swords':'#8a92b0','pentacles':'#8a9274'}[suit]))
print('78 fronts and the original concept back are ready.')
