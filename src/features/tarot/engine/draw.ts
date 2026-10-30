import { TAROT_CARDS } from '../data/cards';
import { shuffle, secureRandom, type RandomSource } from './shuffle';
import { stableHash } from '../../../lib/date';
export interface DrawnCard {
  cardId: string;
  reversed: boolean;
}
export function createDeck(allowReversed = true, random: RandomSource = secureRandom): DrawnCard[] {
  return shuffle(TAROT_CARDS, random).map((card) => ({
    cardId: card.id,
    reversed: allowReversed && random() < 0.35,
  }));
}
export function drawCards(deck: readonly DrawnCard[], count: number): DrawnCard[] {
  if (!Number.isInteger(count) || count < 1 || count > deck.length)
    throw new RangeError('Invalid draw count');
  const cards = deck.slice(0, count);
  if (new Set(cards.map((c) => c.cardId)).size !== count) throw new Error('Duplicate cards');
  return cards;
}
export function dailyCard(date: string, profileId = 'guest'): DrawnCard {
  const seed = stableHash(`celestial-v1|${date}|${profileId}`);
  return { cardId: TAROT_CARDS[seed % TAROT_CARDS.length].id, reversed: (seed >>> 8) % 100 < 35 };
}
