import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  solarLongitude,
  traditionalSolarMonth,
  approximateFourPillars,
} from '../src/lib/solar-terms';
import { dateToJD, solarToLunar } from '../src/lib/lunar';
import { analyzeDay } from '../src/lib/goodDays';
import { freezeReading, readingResult } from '../src/features/tarot/engine/snapshot';
import { isReadings, type Reading } from '../src/features/tarot/engine/reading';
import { CARD_MAP } from '../src/features/tarot/data/cards';
test('solar model has expected seasonal quadrants and changes the month branch at Lập Xuân rather than Tết', () => {
  assert.ok(Math.abs(solarLongitude(2451545) - 280.38) < 0.1);
  assert.equal(traditionalSolarMonth(1, 2, 2026).branch, 1);
  assert.equal(traditionalSolarMonth(10, 2, 2026).branch, 2);
  assert.equal(traditionalSolarMonth(1, 7, 2026).branch, 6);
  const p = approximateFourPillars(7, 1, 2000, 0);
  assert.deepEqual(p.dayPillar, { can: 'Giáp', chi: 'Tý' });
  assert.deepEqual(p.hourPillar, { can: 'Giáp', chi: 'Tý' });
  assert.deepEqual(approximateFourPillars(10, 2, 2026, 12).yearPillar, { can: 'Bính', chi: 'Ngọ' });
  assert.equal(solarToLunar(10, 2, 2026).year, 2025); // Solar-pillar year and lunar-calendar year are intentionally distinct.
  for (const [d, m, y] of [
    [25, 1, 2020],
    [12, 2, 2021],
    [1, 2, 2022],
    [22, 1, 2023],
    [10, 2, 2024],
    [29, 1, 2025],
    [17, 2, 2026],
    [6, 2, 2027],
  ])
    assert.deepEqual(solarToLunar(d, m, y), { day: 1, month: 1, year: y, isLeap: false });
  assert.equal(analyzeDay(31, 10, 2026).tu.name, 'Chưa kiểm định');
  assert.ok(Number.isFinite(dateToJD(29, 2, 2024)));
});
test('saved interpretation survives content changes and imported snapshots must be complete and match the draw', () => {
  const reading: Reading = {
    id: 'r',
    deckId: 'celestial-v1',
    spreadId: 'daily',
    cards: [{ cardId: 'major-17', reversed: true }],
    createdAt: '2026-10-31T00:00:00Z',
    profileId: 'guest',
    question: '',
    note: '',
  };
  const saved = freezeReading(reading);
  assert.equal(isReadings([saved]), true);
  const before = readingResult(saved);
  const card = CARD_MAP.get('major-17')!,
    old = card.reversed;
  try {
    card.reversed = 'Updated editorial content';
    assert.deepEqual(readingResult(saved), before);
    assert.notEqual(readingResult(reading).cards[0].meaning, before.cards[0].meaning);
  } finally {
    card.reversed = old;
  }
  assert.equal(isReadings([{ ...saved, interpretationSnapshot: { version: 'fake' } }]), false);
  const copy = JSON.parse(JSON.stringify(saved));
  copy.interpretationSnapshot.cards[0].drawn.cardId = 'major-00';
  assert.equal(isReadings([copy]), false);
});
