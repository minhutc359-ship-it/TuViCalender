import { CARD_BACK, type TarotCard } from './cards';
import references from './jojo-stands.json';
import minorReferences from './jojo-minor-art.json';

export type TarotAppearanceId = 'celestial-v1' | 'jojo-ref';
export const APPEARANCE_KEY = 'astroai.tarot-appearance.v1';
export const JOJO_MAPPING_SOURCE = 'https://jojowiki.com/Tarot_Cards';
export const JOJO_REFERENCES = references;
export interface JoJoReference {
  cardId: string;
  stand: string;
  user: string;
  standImage: string;
  userImage?: string;
  sourceUrl: string;
  standImageSource: string;
  accent: string;
  association: 'canonical' | 'editorial';
}
export const JOJO_ART_REFERENCES: JoJoReference[] = [
  ...references.map((reference) => ({ ...reference, association: 'canonical' as const })),
  ...minorReferences.map((reference) => ({ ...reference, association: 'editorial' as const })),
];
export const JOJO_BY_CARD = new Map(
  JOJO_ART_REFERENCES.map((reference) => [reference.cardId, reference]),
);

export function isTarotAppearance(value: unknown): value is TarotAppearanceId {
  return value === 'celestial-v1' || value === 'jojo-ref';
}

export function getCardAppearance(card: TarotCard, appearance: TarotAppearanceId) {
  const reference = appearance === 'jojo-ref' ? JOJO_BY_CARD.get(card.id) : undefined;
  return { imagePath: reference?.standImage ?? card.imagePath, reference };
}

export function getCardBack(appearance: TarotAppearanceId) {
  return appearance === 'jojo-ref' ? '/assets/tarot/jojo-ref/card-back.svg' : CARD_BACK;
}
