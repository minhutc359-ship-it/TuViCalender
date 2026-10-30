"""Fetch the 22 Stardust Crusaders Tarot Stand illustrations, preserving source images.

Uses JoJo Wiki's character reference illustrations, not generated artwork.
No image manipulation or inference of Minor Arcana associations.
Run from repository root. Source/attribution metadata is committed with the assets.
"""
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen
import json

REFERENCES = [
    ('The Fool', 'Iggy', 'The_Fool', 'IggyAv.png', '#c8b88b'),
    ("Magician's Red", 'Muhammad Avdol', "Magician%27s_Red", 'AvdolAv.png', '#e27961'),
    ('High Priestess', 'Midler', 'High_Priestess', 'MidlerAv.png', '#91b7d5'),
    ('Empress', 'Nena', 'Empress', 'NenaAv.png', '#dd85a2'),
    ('Emperor', 'Hol Horse', 'Emperor', 'HolHorseAv.png', '#be9d6f'),
    ('Hierophant Green', 'Noriaki Kakyoin', 'Hierophant_Green', 'KakyoinAv.png', '#76c8a5'),
    ('Lovers', 'Steely Dan', 'Lovers', 'SteelyDanAv.png', '#ce9fc1'),
    ('Silver Chariot', 'Jean Pierre Polnareff', 'Silver_Chariot', 'PolnareffAv.png', '#bbc8e0'),
    ('Strength', 'Forever', 'Strength', 'ForeverAv.png', '#b79b72'),
    ('Hermit Purple', 'Joseph Joestar', 'Hermit_Purple', 'OldJosephAv.png', '#b68ad9'),
    ('Wheel of Fortune', 'ZZ', 'Wheel_of_Fortune', 'ZZAv.png', '#cc7c73'),
    ('Justice', 'Enya the Hag', 'Justice', 'EnyaAv.png', '#8ec1b1'),
    ('Hanged Man', 'J. Geil', 'Hanged_Man', 'GeilAv.png', '#c4ae88'),
    ('Death Thirteen', 'Mannish Boy', 'Death_Thirteen', 'MannishBoyAv.png', '#d38eb5'),
    ('Yellow Temperance', 'Rubber Soul', 'Yellow_Temperance', 'RubberSoulAv.png', '#dfc971'),
    ('Ebony Devil', 'Devo the Cursed', 'Ebony_Devil', 'DevoAv.png', '#9bb586'),
    ('Tower of Gray', 'Gray Fly', 'Tower_of_Gray', 'GrayFlyAv.png', '#bd93d2'),
    ('Star Platinum', 'Jotaro Kujo', 'Star_Platinum', 'JotaroAv.png', '#b596e1'),
    ('Dark Blue Moon', 'Imposter Captain Tennille', 'Dark_Blue_Moon', 'TennilleAv.png', '#7cadd9'),
    ('Sun', 'Arabia Fats', 'Sun', 'ArabiaFatsAv.png', '#e8b273'),
    ('Judgement', 'Cameo', 'Judgement', 'CameoAv.png', '#b6c17c'),
    ('The World', 'DIO', 'The_World', 'DIOAv.png', '#e6cb7b'),
]
ROOT = Path('public/assets/tarot/jojo-ref')
ROOT.mkdir(parents=True, exist_ok=True)
CACHE = Path('/tmp/astroai-jojo-pages')
CACHE.mkdir(exist_ok=True)
HEADERS = {'User-Agent': 'AstroAI/2.0 (Tarot character reference asset fetcher)'}

class Images(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
    def handle_starttag(self, tag, attrs):
        if tag == 'img':
            a = dict(attrs)
            src = a.get('src', a.get('data-src', ''))
            if src.startswith('https://static.jojowiki.com/images/'):
                self.images.append(src)

def fetch(url):
    with urlopen(Request(url, headers=HEADERS), timeout=40) as response:
        return response.read()

def get_page(page):
    path = CACHE / (page + '.html')
    if not path.exists(): path.write_bytes(fetch('https://jojowiki.com/' + page))
    return path.read_text()

def image_name(url):
    # The file before the thumbnail width suffix is stable across thumb sizes.
    return url.split('/')[-2] if '/thumb/' in url else url.split('/')[-1]

def save_image(url, filename):
    path = ROOT / filename
    if not path.exists(): path.write_bytes(fetch(url))
    data = path.read_bytes()
    if not (data.startswith(b'\x89PNG') or data.startswith(b'\xff\xd8') or data[:4] == b'RIFF'):
        raise ValueError('Response is not an image: ' + url)
    return '/assets/tarot/jojo-ref/' + filename

# Fetch owner avatar URLs from the mapping reference page, no guessed URLs.
tarot_path = Path('/tmp/astroai-jojo-tarot.html')
tarot_html = tarot_path.read_text() if tarot_path.exists() else get_page('Tarot_Cards')
parser = Images(); parser.feed(tarot_html)
avatars = {image_name(url): url for url in parser.images}

def process(item):
    index, (stand, user, page, avatar, color) = item
    parser = Images(); parser.feed(get_page(page))
    choices = [u for u in parser.images if 'infobox' in u.lower() and 'anime' in u.lower()]
    # Star Platinum has infoboxes for Parts 3/4/6. Explicitly select SC.
    if page == 'Star_Platinum': choices = [u for u in choices if '_SC_' in u]
    if not choices:
        raise RuntimeError('Missing anime infobox illustration for ' + page)
    image = choices[0]
    ext = Path(image_name(image)).suffix.lower()
    owner = avatars.get(avatar)
    if not owner: raise RuntimeError('Missing owner avatar for ' + user)
    result = {
        'cardId': f'major-{index:02}', 'stand': stand, 'user': user,
        'standImage': save_image(image, f'major-{index:02}{ext}'),
        'userImage': save_image(owner, f'user-{index:02}.png'),
        'sourceUrl': 'https://jojowiki.com/' + page,
        'standImageSource': image, 'userImageSource': owner, 'accent': color,
    }
    print(f'{index:02}: {stand} / {user}', flush=True)
    return result

results = []
with ThreadPoolExecutor(max_workers=4) as executor:
    for result in executor.map(process, enumerate(REFERENCES)): results.append(result)
manifest = Path('src/features/tarot/data/jojo-stands.json')
manifest.write_text(json.dumps(results, ensure_ascii=False, indent=2) + '\n')
print('Saved 22 Stand illustrations, 22 user portraits and source manifest.', flush=True)
