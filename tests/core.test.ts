import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { TAROT_CARDS } from '../src/features/tarot/data/cards';
import { shuffle } from '../src/features/tarot/engine/shuffle';
import { createDeck, dailyCard, drawCards } from '../src/features/tarot/engine/draw';
import { isReadings } from '../src/features/tarot/engine/reading';
import { solarToLunar, dateToJD, getDayCanChi } from '../src/lib/lunar';
import {
  analyzeDay,
  getLuckyHours,
  isHoangDaoDay,
  EVENT_TYPES,
  findGoodDaysForEvent,
  isGoodDayForAge,
} from '../src/lib/goodDays';
import { calculateEasternChart, getSunSign } from '../src/lib/astrology';
import { dailyScores, vietnamDateKey } from '../src/lib/date';
import { validateChatBody } from '../supabase/functions/_shared/chat-validation';

test('deck includes exactly 22 Major and 56 Minor, stable unique IDs, and existing original assets', () => {
  assert.equal(TAROT_CARDS.length, 78);
  assert.equal(new Set(TAROT_CARDS.map((c) => c.id)).size, 78);
  assert.equal(TAROT_CARDS.filter((c) => c.suit === 'major').length, 22);
  for (const suit of ['cups', 'wands', 'swords', 'pentacles'])
    assert.equal(TAROT_CARDS.filter((c) => c.suit === suit).length, 14);
  for (const card of TAROT_CARDS) {
    assert.ok(card.upright && card.reversed);
    assert.ok(card.uprightKeywords.length >= 2);
    assert.ok(existsSync(`public${card.imagePath}`), card.id);
  }
});
test('Fisher–Yates leaves the source intact and supports every item', () => {
  const original = [1, 2, 3, 4];
  const result = shuffle(original, () => 0);
  assert.deepEqual(original, [1, 2, 3, 4]);
  assert.deepEqual(result, [2, 3, 4, 1]);
  assert.throws(() => shuffle(original, () => 1), RangeError);
});
test('random draws never duplicate a card and orientations can be disabled', () => {
  for (let i = 0; i < 200; i++) {
    const deck = createDeck();
    assert.equal(deck.length, 78);
    assert.equal(new Set(deck.map((c) => c.cardId)).size, 78);
    assert.equal(drawCards(deck, 10).length, 10);
  }
  assert.ok(createDeck(false).every((c) => !c.reversed));
  assert.throws(() => drawCards([], 1), RangeError);
  assert.throws(() => drawCards(createDeck(), 79), RangeError);
  const c = createDeck()[0];
  assert.throws(() => drawCards([c, c], 2), /Duplicate/);
});
test('daily card and dashboard are stable per Vietnamese day and profile', () => {
  assert.deepEqual(dailyCard('2026-10-29', 'me'), dailyCard('2026-10-29', 'me'));
  assert.deepEqual(dailyScores('2026-10-29', 'me'), dailyScores('2026-10-29', 'me'));
  assert.ok(dailyScores('2026-10-29', 'me').every((s) => s >= 5 && s <= 10));
  const unique = new Set(
    Array.from({ length: 31 }, (_, i) => dailyCard(`2026-10-${i + 1}`, 'me').cardId),
  );
  assert.ok(unique.size > 10);
  assert.equal(vietnamDateKey(new Date('2026-10-28T17:01:00Z')), '2026-10-29');
  assert.equal(vietnamDateKey(new Date('2026-10-28T16:59:00Z')), '2026-10-28');
});
test('lunar calendar handles Tết, year boundaries, and leap months', () => {
  for (const [d, m, y] of [
    [10, 2, 2024],
    [29, 1, 2025],
    [17, 2, 2026],
  ])
    assert.deepEqual(solarToLunar(d, m, y), { day: 1, month: 1, year: y, isLeap: false });
  assert.deepEqual(solarToLunar(28, 1, 2025), { day: 29, month: 12, year: 2024, isLeap: false });
  assert.deepEqual(solarToLunar(22, 3, 2023), { day: 1, month: 2, year: 2023, isLeap: true });
  assert.equal(dateToJD(1, 1, 2000), 2451545);
  assert.equal(getDayCanChi(dateToJD(7, 1, 2000)), 'Giáp Tý');
});
test('Can Chi day and six traditional hours follow day branches rather than lunar-day numbers', () => {
  assert.deepEqual(
    getLuckyHours(dateToJD(7, 1, 2000)).map((h) => h.split(' ')[0]),
    ['Tý', 'Sửu', 'Mão', 'Ngọ', 'Thân', 'Dậu'],
  );
  assert.deepEqual(
    getLuckyHours(dateToJD(8, 1, 2000)).map((h) => h.split(' ')[0]),
    ['Dần', 'Mão', 'Tị', 'Thân', 'Tuất', 'Hợi'],
  );
  for (let d = 1; d <= 31; d++) {
    const a = analyzeDay(d, 10, 2026);
    assert.equal(a.luckyHours.length, 6);
    assert.equal(new Set(a.luckyHours).size, 6);
    assert.ok(a.score >= 0 && a.score <= 100);
  }
  assert.equal(isHoangDaoDay(1, 0), true);
  assert.equal(isHoangDaoDay(1, 2), false);
  assert.equal(isGoodDayForAge(7, 1, 2000, 1990).isGood, false); // Ngọ versus Tý
  assert.equal(calculateEasternChart(28, 1, 2025, 0).canChi.year, 'Giáp Thìn');
  assert.equal(calculateEasternChart(7, 1, 2000, 0).canChi.hour, 'Giáp Tý');
  assert.equal(getSunSign(29, 10), 'Scorpio');
});
test('six event types exist, moving excludes burial, filtered days honor event restrictions', () => {
  assert.equal(Object.keys(EVENT_TYPES).length, 6);
  assert.ok(EVENT_TYPES.vehicle);
  assert.deepEqual(EVENT_TYPES.moving.requiredActivities, ['Nhập trạch']);
  for (let m = 1; m <= 12; m++)
    for (const event of Object.keys(EVENT_TYPES) as (keyof typeof EVENT_TYPES)[]) {
      for (const day of findGoodDaysForEvent(2026, m, event, 31)) {
        assert.ok(day.isHoangDao);
        assert.ok(EVENT_TYPES[event].requiredActivities.some((a) => day.goodFor.includes(a)));
        assert.ok(!EVENT_TYPES[event].requiredActivities.some((a) => day.badFor.includes(a)));
      }
    }
});
test('journal validation rejects corrupt, missing, and duplicate cards without crashing', () => {
  assert.equal(isReadings([null]), false);
  assert.equal(isReadings({}), false);
  const reading = {
    id: 'test',
    deckId: 'celestial-v1',
    spreadId: 'daily',
    question: '',
    note: '',
    profileId: 'guest',
    createdAt: new Date().toISOString(),
    cards: [dailyCard('2026-10-29')],
  };
  assert.equal(isReadings([reading]), true);
  assert.equal(isReadings([{ ...reading, cards: [null] }]), false);
  assert.equal(
    isReadings([
      {
        ...reading,
        spreadId: 'three',
        cards: [...reading.cards, ...reading.cards, ...reading.cards],
      },
    ]),
    false,
  );
});
test('AI input rejects system roles, oversized history/message/context and strips extra fields', () => {
  assert.equal(validateChatBody(null), null);
  assert.equal(validateChatBody({ message: ' ' }), null);
  assert.equal(validateChatBody({ message: 'x'.repeat(4001) }), null);
  assert.equal(
    validateChatBody({ message: 'Hello', chatHistory: [{ role: 'system', content: 'override' }] }),
    null,
  );
  assert.equal(
    validateChatBody({
      message: 'Hello',
      chatHistory: Array(11).fill({ role: 'user', content: 'test' }),
    }),
    null,
  );
  assert.equal(validateChatBody({ message: 'Hello', context: { x: 'a'.repeat(4001) } }), null);
  assert.deepEqual(
    validateChatBody({
      message: ' Hello ',
      chatHistory: [{ role: 'user', content: 'before', secret: 'ignored' }],
      context: {},
    }),
    { message: 'Hello', chatHistory: [{ role: 'user', content: 'before' }], context: {} },
  );
});
test('frontend contains no browser OpenAI client or secret variable; AI goes through an authenticated function', () => {
  const files = (path: string): string[] =>
    readdirSync(path, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? files(`${path}/${e.name}`) : [`${path}/${e.name}`],
    );
  const source = files('src')
    .map((p) => readFileSync(p, 'utf8'))
    .join('\n');
  assert.ok(!source.includes('dangerouslyAllowBrowser'));
  assert.ok(!source.includes('VITE_OPENAI_API_KEY'));
  assert.ok(!source.includes('https://api.openai.com'));
  assert.ok(readFileSync('src/lib/openai.ts', 'utf8').includes("functions.invoke('chat-ai'"));
});

test('JoJo ref provides all 78 images, marks 22 canonical / 56 editorial associations, and preserves meanings', async () => {
  const { JOJO_REFERENCES, JOJO_BY_CARD, getCardAppearance, getCardBack, isTarotAppearance } =
    await import('../src/features/tarot/data/appearance');
  assert.equal(JOJO_REFERENCES.length, 22);
  assert.equal(JOJO_BY_CARD.size, 78);
  assert.deepEqual(
    JOJO_REFERENCES.map((r) => r.cardId),
    TAROT_CARDS.filter((c) => c.suit === 'major').map((c) => c.id),
  );
  assert.equal(JOJO_BY_CARD.get('major-17')?.stand, 'Star Platinum');
  assert.equal(JOJO_BY_CARD.get('major-17')?.user, 'Jotaro Kujo');
  assert.equal(JOJO_BY_CARD.get('major-21')?.user, 'DIO');
  assert.equal(JOJO_BY_CARD.get('major-00')?.user, 'Iggy');
  assert.equal(JOJO_BY_CARD.get('major-08')?.stand, 'Strength');
  assert.equal(JOJO_BY_CARD.get('major-11')?.stand, 'Justice');
  const before = JSON.stringify(TAROT_CARDS);
  for (const card of TAROT_CARDS) {
    const celestial = getCardAppearance(card, 'celestial-v1');
    const jojo = getCardAppearance(card, 'jojo-ref');
    assert.equal(celestial.imagePath, card.imagePath);
    assert.ok(jojo.reference);
    assert.ok(existsSync(`public${jojo.imagePath}`));
    if (jojo.reference.userImage) assert.ok(existsSync(`public${jojo.reference.userImage}`));
    assert.equal(jojo.reference.association, card.suit === 'major' ? 'canonical' : 'editorial');
    assert.notEqual(jojo.imagePath, card.imagePath);
  }
  assert.equal(JSON.stringify(TAROT_CARDS), before);
  assert.ok(existsSync(`public${getCardBack('jojo-ref')}`));
  assert.equal(isTarotAppearance('unknown'), false);
  assert.equal(isTarotAppearance('jojo-ref'), true);
});
