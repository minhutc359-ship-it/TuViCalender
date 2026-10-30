import { CARD_MAP } from '../data/cards';
import { getSpread } from '../data/spreads';
import type { SpreadId } from '../data/spreads';
import type { DrawnCard } from './draw';
import { isTopic, type TopicSelection } from '../data/reading-topics';
export interface Reading {
  id: string;
  deckId: 'celestial-v1';
  spreadId: SpreadId;
  question: string;
  cards: DrawnCard[];
  createdAt: string;
  note: string;
  profileId: string;
  topic?: TopicSelection;
}
export const JOURNAL_KEY = 'astroai.tarot-journal.v1';
export function isReadings(value: unknown): value is Reading[] {
  return (
    Array.isArray(value) &&
    value.every(
      (r) =>
        r &&
        typeof r.id === 'string' &&
        r.deckId === 'celestial-v1' &&
        typeof r.question === 'string' &&
        typeof r.note === 'string' &&
        typeof r.profileId === 'string' &&
        (r.topic === undefined || isTopic(r.topic)) &&
        typeof r.createdAt === 'string' &&
        Number.isFinite(Date.parse(r.createdAt)) &&
        ['daily', 'three', 'love', 'career', 'celtic'].includes(r.spreadId) &&
        Array.isArray(r.cards) &&
        r.cards.length === getSpread(r.spreadId).positions.length &&
        r.cards.every(
          (c: DrawnCard) => c && CARD_MAP.has(c.cardId) && typeof c.reversed === 'boolean',
        ) &&
        new Set(r.cards.map((c: DrawnCard) => c.cardId)).size === r.cards.length,
    )
  );
}
