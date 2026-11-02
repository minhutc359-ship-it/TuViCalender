import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TAROT_CARDS } from '../src/features/tarot/data/cards';
import { CARD_GUIDANCE } from '../src/features/tarot/data/card-guidance.vi';
import { interpretReading } from '../src/features/tarot/engine/interpretation';
import { resolveReadingTopic, READING_TOPICS } from '../src/features/tarot/data/reading-topics';
import { SPREADS } from '../src/features/tarot/data/spreads';
import type { Reading } from '../src/features/tarot/engine/reading';
function reading(cards: string[], extra: Partial<Reading> = {}): Reading {
  return {
    id: 'test',
    deckId: 'celestial-v1',
    spreadId: cards.length === 1 ? 'daily' : 'three',
    question: '',
    createdAt: '2026-10-29T00:00:00Z',
    note: '',
    profileId: 'guest',
    cards: cards.map((cardId) => ({ cardId, reversed: false })),
    ...extra,
  };
}

test('Every card has eight authored context/action fields; all 780 card/orientation/topic combinations work offline', () => {
  assert.equal(Object.keys(CARD_GUIDANCE).length, 78);
  for (const card of TAROT_CARDS) {
    assert.equal(CARD_GUIDANCE[card.id].length, 8);
    assert.ok(CARD_GUIDANCE[card.id].every((s) => typeof s === 'string' && s.length > 15));
    for (const reversed of [false, true])
      for (const topic of READING_TOPICS) {
        const result = interpretReading(
          reading([card.id], { topic: topic.id, cards: [{ cardId: card.id, reversed }] }),
        );
        assert.equal(result.topic.id, topic.id);
        assert.equal(result.cards[0].meaning, reversed ? card.reversed : card.upright);
        assert.ok(result.cards[0].action.length > 20);
        assert.ok(result.cards[0].context.length > 20);
        assert.ok(result.recommendation.headline.includes('Lời khuyên tham khảo'));
        assert.ok(result.recommendation.supports.length > 0);
        assert.ok(result.recommendation.cautions.length > 0);
        assert.ok(result.reflectionPrompts.length > 0);
        assert.ok(!JSON.stringify(result).includes('undefined'));
      }
  }
});
test('Explicit topic wins; keyword inference handles Vietnamese, unaccented words and unknown questions transparently', () => {
  assert.equal(resolveReadingTopic('Có nên đổi công việc?', 'three').id, 'career');
  assert.equal(resolveReadingTopic('moi quan he voi nguoi yeu', 'daily').id, 'love');
  assert.equal(resolveReadingTopic('Tôi cần xem lại ngân sách và thu nhập', 'three').id, 'finance');
  assert.equal(resolveReadingTopic('Công việc', 'career', 'love').id, 'love');
  assert.equal(resolveReadingTopic('', 'love').id, 'love');
  assert.equal(resolveReadingTopic('Ngày mai đi đâu?', 'three').id, 'general');
  assert.equal(resolveReadingTopic('Nói về nỗi băn khoăn', 'three').id, 'general');
});
test('Three of Swords is about hurt, not generic collaboration, and reading changes with domain and reversal', () => {
  const love = interpretReading(reading(['swords-03'], { topic: 'love' }));
  const career = interpretReading(reading(['swords-03'], { topic: 'career' }));
  const reversed = interpretReading(
    reading(['swords-03'], { topic: 'love', cards: [{ cardId: 'swords-03', reversed: true }] }),
  );
  assert.match(love.cards[0].context, /tổn thương/);
  assert.notEqual(love.cards[0].context, career.cards[0].context);
  assert.notEqual(love.cards[0].context, reversed.cards[0].context);
  assert.notEqual(love.cards[0].action, reversed.cards[0].action);
});
test('Positions change the lens; a positive Sun in challenge is not treated as a guaranteed success', () => {
  const result = interpretReading(
    reading(['major-00', 'major-19', 'pentacles-03', 'major-11', 'wands-08'], {
      spreadId: 'career',
      topic: 'career',
    }),
  );
  assert.equal(result.cards[1].role, 'challenge');
  assert.match(result.cards[1].positionMeaning, /đang thiếu|quá mức/);
  assert.equal(result.cards[2].role, 'resource');
  assert.match(result.cards[2].positionMeaning, /huy động/);
  assert.equal(result.actions[0], result.cards[3].action);
});
test('Connections name actual cards, respect reversals and use authored Tower/Star and context-specific action', () => {
  const value = reading(['major-16', 'major-17', 'major-09'], {
    question: 'Tôi nên thay đổi công việc ra sao?',
    cards: [
      { cardId: 'major-16', reversed: true },
      { cardId: 'major-17', reversed: false },
      { cardId: 'major-09', reversed: false },
    ],
  });
  const result = interpretReading(value);
  assert.equal(result.connections.length, 2);
  assert.match(result.connections[0].text, /hồi phục/);
  assert.match(result.connections[0].cards, /ngược/);
  assert.match(result.overview, /công việc/);
  assert.ok(result.connections[0].application.includes(result.cards[0].action));
  assert.deepEqual(result, interpretReading(value));
});
test('Every spread position is covered and conditional outcomes, finance and relationship limitations remain explicit', () => {
  for (const spread of SPREADS) {
    const result = interpretReading(
      reading(
        TAROT_CARDS.slice(0, spread.positions.length).map((c) => c.id),
        { spreadId: spread.id },
      ),
    );
    assert.equal(result.cards.length, spread.positions.length);
    assert.ok(result.cards.every((c) => c.positionMeaning && c.reflection));
    assert.deepEqual(result.recommendation.steps, result.actions);
    assert.ok(result.recommendation.checkIn.length > 30);
    assert.ok(result.reflectionPrompts.length >= 1 && result.reflectionPrompts.length <= 3);
  }
  const finance = interpretReading(reading(['pentacles-01'], { topic: 'finance' }));
  assert.match(finance.limits.join(' '), /lợi nhuận/);
  const love = interpretReading(reading(['cups-02'], { topic: 'love' }));
  assert.match(love.limits.join(' '), /Không thể xác định/);
  const celtic = interpretReading(
    reading(
      TAROT_CARDS.slice(0, 10).map((c) => c.id),
      { spreadId: 'celtic' },
    ),
  );
  assert.match(celtic.cards[9].positionMeaning, /có điều kiện/);
});
test('Reading is deterministic, does not mutate inputs and rejects invalid/duplicate card sets', () => {
  const input = reading(['cups-07', 'swords-02', 'wands-10'], { topic: 'love' }),
    before = JSON.stringify(input);
  assert.deepEqual(interpretReading(input), interpretReading(input));
  assert.equal(JSON.stringify(input), before);
  assert.throws(
    () => interpretReading(reading(['major-00', 'major-00', 'major-01'])),
    /Invalid reading/,
  );
  assert.throws(() => interpretReading(reading(['missing'])), /Invalid reading/);
});
