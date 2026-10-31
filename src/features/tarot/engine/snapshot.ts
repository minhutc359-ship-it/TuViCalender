import { CARD_MAP } from '../data/cards';
import { interpretReading } from './interpretation';
import type { Reading } from './reading';
export function freezeReading(reading: Reading): Reading {
  if (reading.interpretationSnapshot) return reading;
  const result = interpretReading(reading);
  return {
    ...reading,
    interpretationSnapshot: { ...result, cards: result.cards.map(({ card, ...rest }) => rest) },
  };
}
export function readingResult(reading: Reading) {
  const snapshot = reading.interpretationSnapshot;
  return snapshot
    ? {
        ...snapshot,
        cards: snapshot.cards.map((item) => ({ ...item, card: CARD_MAP.get(item.drawn.cardId)! })),
      }
    : interpretReading(reading);
}
