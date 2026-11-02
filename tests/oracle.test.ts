import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TRIGRAMS,
  castOracle,
  changedLines,
  describeCast,
  isOracleCast,
  lineFromByte,
  trigramFor,
  type OracleLine,
} from '../src/features/oracle/engine';

test('coin mapping has exact 1/8, 3/8, 3/8, 1/8 probabilities without modulo bias', () => {
  const outcomes = Array.from({ length: 256 }, (_, byte) => lineFromByte(byte));
  assert.equal(outcomes.filter((line) => line === 6).length, 32);
  assert.equal(outcomes.filter((line) => line === 7).length, 96);
  assert.equal(outcomes.filter((line) => line === 8).length, 96);
  assert.equal(outcomes.filter((line) => line === 9).length, 32);
});

test('all eight trigram patterns are unique and bottom-up line order is explicit', () => {
  assert.equal(TRIGRAMS.length, 8);
  assert.equal(new Set(TRIGRAMS.map((item) => item.pattern)).size, 8);
  for (const trigram of TRIGRAMS) {
    const lines = [...trigram.pattern].map((bit) => (bit === '1' ? 7 : 8)) as OracleLine[];
    assert.equal(trigramFor(lines).name, trigram.name);
  }
  assert.equal(trigramFor([7, 8, 8]).name, 'Chấn');
  assert.equal(trigramFor([8, 8, 7]).name, 'Cấn');
});

test('cast is deterministic with supplied bytes, preserves six lines and transforms moving lines', () => {
  const cast = castOracle('  Tôi có thể làm gì?  ', new Uint8Array([0, 1, 4, 7, 2, 5]));
  assert.deepEqual(cast.lines, [6, 7, 8, 9, 7, 8]);
  assert.equal(cast.question, 'Tôi có thể làm gì?');
  assert.deepEqual(changedLines(cast.lines), [7, 7, 8, 8, 7, 8]);
  const result = describeCast(cast);
  assert.deepEqual(result.changing, [1, 4]);
  assert.equal(result.lower.name, 'Khảm');
  assert.equal(result.upper.name, 'Đoài');
  assert.equal(isOracleCast(cast), true);
  assert.equal(isOracleCast({ ...cast, lines: [7, 8] }), false);
  assert.throws(() => castOracle('', new Uint8Array(5)), RangeError);
});
