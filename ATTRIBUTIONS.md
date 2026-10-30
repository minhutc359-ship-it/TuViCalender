This Figma Make file includes components from [shadcn/ui](https://ui.shadcn.com/) used under [MIT license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md).

This Figma Make file includes photos from [Unsplash](https://unsplash.com) used under [license](https://unsplash.com/license).

## AstroAI Celestial Tarot

The Fool, The Magician, The High Priestess and the deck back are the original user-supplied assets in `AstroAI_Celestial_Tarot_Concept` (see its README). The other 19 Major SVG emblems and 56 Minor pip designs extend that vector/color system with original geometric constructions in `scripts/generate-tarot-assets.py`. They do not reproduce the commercial reference images linked in `newSpec.md`.

Vietnamese interpretations in `src/features/tarot/data/` are original editorial text for reflection. Traditional Tarot card names and suit/rank structure are used for identification.

## JoJo ref appearance

`public/assets/tarot/jojo-ref/` contains 78 Stand reference illustrations and 22 character portraits downloaded without modification from JoJo's Bizarre Encyclopedia (JoJo Wiki). These are third-party illustrations from JoJo's Bizarre Adventure, not original AstroAI art and not covered by this project's code license. JoJo characters/artwork belong to their respective rights holders, including Hirohiko Araki / LUCKY LAND COMMUNICATIONS / Shueisha and the anime production rights holders.

Each source page and exact image URL is recorded in `src/features/tarot/data/jojo-stands.json` (22 Major) and `jojo-minor-art.json` (56 Minor). The Major Tarot-to-Stand associations follow [JoJo Wiki: Tarot Cards](https://jojowiki.com/Tarot_Cards). The custom CSS card frames and `card-back.svg` are project-created presentation; the underlying illustrations remain unchanged. `scripts/fetch-jojo-assets.py` and `scripts/fetch-jojo-minor-assets.py` reproduce the downloads and manifests.

The canonical Tarot association is limited to the 22 Major Arcana in Stardust Crusaders. The 56 Minor Arcana illustrations use Stand artwork from other parts with editorial associations selected by this application; they are explicitly labeled as artistic associations and are not claimed as canon. Appearance selection does not change Tarot meanings, card identities, orientations, probabilities, daily cards or saved journal records.

## Interpretation references

The historical comparison source is Arthur Edward Waite, _The Pictorial Key to the Tarot_ (1910), including [Major meanings](https://sacred-texts.com/tarot/pkt/pkt0303.htm), [Minor meanings](https://sacred-texts.com/tarot/pkt/pkt0302.htm) and the [Celtic method](https://sacred-texts.com/tarot/pkt/pkt0307.htm). The Vietnamese text and combinations are original modern editorial adaptations of Rider–Waite–Smith themes, not verbatim translations or a claim that Waite prescribed every application rule. Reversed meanings and conditional advice can differ from Waite's historical divination lists. The app does not establish predictive accuracy.
