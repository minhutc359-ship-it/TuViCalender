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
        recommendation: snapshot.recommendation ?? {
          headline: 'Lời khuyên tham khảo: đối chiếu thông điệp với tình huống thực tế.',
          supports: [snapshot.overview],
          cautions: snapshot.limits.length
            ? snapshot.limits
            : ['Giữ chỗ cho dữ kiện mới; Tarot không bảo đảm kết quả.'],
          steps: snapshot.actions,
          checkIn: 'Ghi lại điều đã thử và xem lại sau khi có thêm dữ kiện thực tế.',
        },
        reflectionPrompts:
          snapshot.reflectionPrompts ?? snapshot.cards.map((item) => item.reflection).slice(0, 3),
        cards: snapshot.cards.map((item) => ({ ...item, card: CARD_MAP.get(item.drawn.cardId)! })),
      }
    : interpretReading(reading);
}
