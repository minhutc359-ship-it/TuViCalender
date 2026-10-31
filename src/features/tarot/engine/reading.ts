import { CARD_MAP } from '../data/cards';
import { getSpread } from '../data/spreads';
import type { SpreadId } from '../data/spreads';
import type { DrawnCard } from './draw';
import { isTopic, type TopicSelection } from '../data/reading-topics';
import type { interpretReading } from './interpretation';
type Interpretation = ReturnType<typeof interpretReading>;
export type ReadingSnapshot = Omit<Interpretation, 'cards'> & {
  cards: Array<Omit<Interpretation['cards'][number], 'card'>>;
};
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
  interpretationSnapshot?: ReadingSnapshot;
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
        (r.interpretationSnapshot === undefined ||
          validSnapshot(r.interpretationSnapshot, r.cards)) &&
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
function validSnapshot(s: any, cards: any): s is ReadingSnapshot {
  const texts = (v: unknown) =>
    Array.isArray(v) &&
    v.length <= 30 &&
    v.every((t) => typeof t === 'string' && t.length <= 12000);
  return (
    !!s &&
    typeof s.version === 'string' &&
    typeof s.topic?.label === 'string' &&
    typeof s.topic?.id === 'string' &&
    typeof s.topicReason === 'string' &&
    typeof s.overview === 'string' &&
    texts(s.patterns) &&
    texts(s.actions) &&
    texts(s.limits) &&
    Array.isArray(cards) &&
    Array.isArray(s.cards) &&
    s.cards.length === cards.length &&
    s.cards.every(
      (c: any, i: number) =>
        c &&
        c.drawn?.cardId === cards[i]?.cardId &&
        c.drawn?.reversed === cards[i]?.reversed &&
        ['position', 'meaning', 'context', 'positionMeaning', 'action', 'reflection'].every(
          (k) => typeof c[k] === 'string' && c[k].length <= 12000,
        ) &&
        texts(c.keywords),
    ) &&
    Array.isArray(s.connections) &&
    s.connections.length <= 10 &&
    s.connections.every(
      (c: any) =>
        c &&
        ['title', 'cards', 'text', 'application'].every(
          (k) => typeof c[k] === 'string' && c[k].length <= 12000,
        ),
    )
  );
}
