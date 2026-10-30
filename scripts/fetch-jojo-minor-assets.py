"""Fetch 56 JoJo illustrations for an explicitly non-canonical Minor Arcana skin.
Artwork is preserved unchanged. Associations are editorial art choices, not lore or Tarot meanings.
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen
import json
import time

GROUPS = {
'wands': [
 ('Red Hot Chili Pepper','Akira Otoishi','Red_Hot_Chili_Pepper'),
 ('Sticky Fingers','Bruno Bucciarati','Sticky_Fingers'),
 ('Aerosmith','Narancia Ghirga','Aerosmith'),
 ('Burning Down the House','Emporio Alnino','Burning_Down_the_House'),
 ('Bad Company','Keicho Nijimura','Bad_Company'),
 ('Sex Pistols','Guido Mista','Sex_Pistols'),
 ('Spice Girl','Trish Una','Spice_Girl'),
 ('Highway Star','Yuya Fungami','Highway_Star'),
 ('Planet Waves','Viviano Westwood','Planet_Waves'),
 ('Super Fly','Toyohiro Kanedaichi','Super_Fly'),
 ('Echoes','Koichi Hirose','Echoes'),
 ('Horus','Pet Shop','Horus'),
 ('Stone Free','Jolyne Cujoh','Stone_Free'),
 ('Gold Experience Requiem','Giorno Giovanna','Gold_Experience_Requiem'),
],
'cups': [
 ('Crazy Diamond','Josuke Higashikata','Crazy_Diamond'),
 ('Kiss','Ermes Costello','Kiss'),
 ('Pearl Jam','Tonio Trussardi','Pearl_Jam'),
 ('Talking Head','Tiziano','Talking_Head'),
 ('Moody Blues','Leone Abbacchio','Moody_Blues'),
 ('Sethan','Alessi','Sethan'),
 ('Bohemian Rhapsody','Ungalo','Bohemian_Rhapsody'),
 ('Under World','Donatello Versus','Under_World'),
 ('Cinderella','Aya Tsuji','Cinderella'),
 ('Mr.President','Coco Jumbo','Mr.President'),
 ('Foo Fighters','F.F.','Foo_Fighters'),
 ('Diver Down','Narciso Anasui','Diver_Down'),
 ('Love Deluxe','Yukako Yamagishi','Love_Deluxe'),
 ('Weather Report','Weather Report','Weather_Report_(Stand)'),
],
'swords': [
 ('Anubis','Chaka / Khan','Anubis'),
 ('Khnum','Oingo','Khnum'),
 ('Highway to Hell','Thunder McQueen','Highway_to_Hell'),
 ('Man in the Mirror','Illuso','Man_in_the_Mirror'),
 ('Survivor','Guccio','Survivor'),
 ('White Album','Ghiaccio','White_Album'),
 ('Bastet','Mariah','Bastet'),
 ('Enigma','Terunosuke Miyamoto','Enigma'),
 ('Cheap Trick','Masazo Kinoto','Cheap_Trick'),
 ('Notorious B.I.G','Carne','Notorious_B.I.G'),
 ("Heaven's Door",'Rohan Kishibe','Heaven%27s_Door'),
 ('Chariot Requiem','Jean Pierre Polnareff','Chariot_Requiem'),
 ('Whitesnake','Enrico Pucci','Whitesnake'),
 ('King Crimson','Diavolo','King_Crimson'),
],
'pentacles': [
 ('Harvest','Shigekiyo Yangu','Harvest'),
 ('Soft Machine','Mario Zucchero','Soft_Machine'),
 ('Kraft Work','Sale','Kraft_Work'),
 ('Osiris',"Daniel J. D'Arby",'Osiris'),
 ('The Lock','Tamami Kobayashi','The_Lock'),
 ('Gold Experience','Giorno Giovanna','Gold_Experience'),
 ('Green Day','Cioccolata','Green_Day'),
 ('Metallica','Risotto Nero','Metallica'),
 ('Oasis','Secco','Oasis'),
 ('Atum',"Terence T. D'Arby",'Atum'),
 ('Marilyn Manson','Miraschon','Marilyn_Manson'),
 ('Beach Boy','Pesci','Beach_Boy'),
 ('Sky High','Rikiel','Sky_High'),
 ('The Hand','Okuyasu Nijimura','The_Hand'),
]}
ROOT=Path('public/assets/tarot/jojo-ref/minor');ROOT.mkdir(parents=True,exist_ok=True)
CACHE=Path('/tmp/astroai-jojo-pages');CACHE.mkdir(exist_ok=True)
HEADERS={'User-Agent':'AstroAI/2.1 (JoJo reference illustration downloader)'}
class Images(HTMLParser):
 def __init__(self):super().__init__();self.images=[]
 def handle_starttag(self,tag,attrs):
  if tag=='img':
   a=dict(attrs);url=a.get('src',a.get('data-src',''))
   if url.startswith('https://static.jojowiki.com/images/'):self.images.append(url)
def fetch(url):
 for attempt in range(3):
  try:
   with urlopen(Request(url,headers=HEADERS),timeout=40) as r:return r.read()
  except Exception:
   if attempt==2:raise
   time.sleep(1)
def process(item):
 suit,rank,stand,user,page=item
 cached=CACHE/(page+'.html')
 if not cached.exists():cached.write_bytes(fetch('https://jojowiki.com/'+page))
 parser=Images();parser.feed(cached.read_text())
 choices=[u for u in parser.images if 'infobox' in u.lower() and 'anime' in u.lower()]
 if not choices:choices=[u for u in parser.images if 'infobox' in u.lower() and 'manga' in u.lower()]
 if not choices:raise ValueError('No reference illustration: '+page)
 url=choices[0];name=url.split('/')[-2] if '/thumb/' in url else url.split('/')[-1];ext=Path(name).suffix.lower()
 card_id=f'{suit}-{rank:02}';path=ROOT/(card_id+ext)
 if not path.exists():path.write_bytes(fetch(url))
 data=path.read_bytes()
 if not(data.startswith(b'\x89PNG') or data.startswith(b'\xff\xd8') or data[:4]==b'RIFF'):raise ValueError('Invalid image '+card_id)
 print(card_id+': '+stand,flush=True)
 return {'cardId':card_id,'stand':stand,'user':user,'standImage':'/assets/tarot/jojo-ref/minor/'+path.name,'sourceUrl':'https://jojowiki.com/'+page,'standImageSource':url,'accent':{'wands':'#d69a75','cups':'#9ba7e0','swords':'#b7c6db','pentacles':'#b9c990'}[suit],'association':'editorial'}
manifest=Path('src/features/tarot/data/jojo-minor-art.json')
previous=json.loads(manifest.read_text()) if manifest.exists() else []
results={r['cardId']:r for r in previous};errors=[]
items=[(suit,i,stand,user,page) for suit,entries in GROUPS.items() for i,(stand,user,page) in enumerate(entries,1)]
with ThreadPoolExecutor(max_workers=4) as pool:
 pending={pool.submit(process,item):item for item in items}
 for future in as_completed(pending):
  try:
   value=future.result();results[value['cardId']]=value
  except Exception as exc:errors.append(str(exc));print('ERROR: '+str(exc),flush=True)
ordered=[results[f'{suit}-{i:02}'] for suit in GROUPS for i in range(1,15) if f'{suit}-{i:02}' in results]
manifest.write_text(json.dumps(ordered,ensure_ascii=False,indent=2)+'\n')
print(f'Saved {len(ordered)}/56 reference illustrations. All Minor associations are editorial.',flush=True)
if errors:raise SystemExit('\n'.join(errors))
