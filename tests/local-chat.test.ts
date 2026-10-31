import './load-knowledge';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { replyLocal, replyHybrid } from '../src/features/chatbot/engine';
import { KNOWLEDGE, normalizeText, searchKnowledge } from '../src/features/knowledge/catalog';
const now = new Date('2026-10-30T17:30:00Z');

const cases: Array<[string, string]> = [
  ['Hôm nay âm lịch ngày mấy?', 'lunar-date'],
  ['hom nay am lich ngay may', 'lunar-date'],
  ['hn am lich bao nhieu', 'lunar-date'],
  ['Âm lịch ngày 17/02/2026', 'lunar-date'],
  ['Ngày 29/01/2025 âm lịch', 'lunar-date'],
  ['Hôm nay có những giờ hoàng đạo nào?', 'lucky-hours'],
  ['hom nay gio nao tot', 'lucky-hours'],
  ['Giờ tốt ngày 31/10/2026', 'lucky-hours'],
  ['Sinh năm 2000 là tuổi gì?', 'year-can-chi'],
  ['sinh nam 1990 tuoi gi', 'year-can-chi'],
  ['Sinh ngày 28/01/2025 là con giáp gì?', 'birth-year'],
  ['Tôi sinh 29/10/1999 thuộc cung gì?', 'sun-sign'],
  ['Sinh 01/06/2000 cung gì?', 'sun-sign'],
  ['Ngũ hành tương sinh ra sao?', 'ngu-hanh'],
  ['ngu hanh la gi', 'ngu-hanh'],
  ['tương khắc là gì', 'ngu-hanh'],
  ['Mệnh Mộc hợp màu nào?', 'element-0'],
  ['menh Hoa hop mau nao', 'element-1'],
  ['mệnh Thổ', 'element-2'],
  ['mệnh Kim', 'element-3'],
  ['mệnh Thủy', 'element-4'],
  ['Bát quái là gì?', 'bat-quai'],
  ['Giải thích Can Chi', 'can-chi'],
  ['Bát tự có giới hạn nào?', 'bat-tu'],
  ['tứ trụ là gì', 'bat-tu'],
  ['Tiết khí là gì?', 'tiet-khi'],
  ['tháng nhuận là gì', 'lich-am'],
  ['Cung Mặt Trời nói lên điều gì và có giới hạn nào?', 'sun-moon-rising'],
  ['Sun Moon Rising khác nhau thế nào?', 'sun-moon-rising'],
  ['Moon sign là gì', 'sun-moon-rising'],
  ['Natal chart là gì?', 'natal'],
  ['12 nhà là gì', 'natal'],
  ['Tarot có dùng cho công việc được không?', 'tarot-guide'],
  ['Gợi ý một câu hỏi Tarot để nhìn lại bản thân.', 'tarot-guide'],
  ['Lá ngược có xấu không?', 'reversed'],
  ['Dùng offline như thế nào?', 'offline'],
  ['Sao lưu dữ liệu ra sao?', 'privacy'],
  ['Song Tử thuộc nguyên tố nào?', 'zodiac-Gemini'],
  ['Bọ Cạp', 'zodiac-Scorpio'],
  ['cung Ma Ket', 'zodiac-Capricorn'],
  ['quẻ Càn', 'bagua-can'],
  ['quẻ Khảm', 'bagua-kham'],
  ['Thiên can Giáp', 'stem-0'],
  ['tuổi Dần', 'branch-2'],
  ['Trực Thành nghĩa là gì?', 'truc-8'],
  ['truc Khai la gi', 'truc-10'],
  ['Mở lịch', 'navigate'],
  ['xem hồ sơ', 'navigate'],
  ['Bói một lá hôm nay', 'navigate'],
  ['mở thư viện', 'navigate'],
];
// Fixed independent oracle: all 22 Major plus all 56 Minor, named by the public deck convention.
const major = [
  'The Fool',
  'The Magician',
  'The High Priestess',
  'The Empress',
  'The Emperor',
  'The Hierophant',
  'The Lovers',
  'The Chariot',
  'Strength',
  'The Hermit',
  'Wheel of Fortune',
  'Justice',
  'The Hanged Man',
  'Death',
  'Temperance',
  'The Devil',
  'The Tower',
  'The Star',
  'The Moon',
  'The Sun',
  'Judgement',
  'The World',
];
major.forEach((name, i) =>
  cases.push([`${name} ngược là gì?`, `major-${String(i).padStart(2, '0')}-reversed`]),
);
const ranks = [
  'Ace',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Page',
  'Knight',
  'Queen',
  'King',
];
for (const suit of ['Wands', 'Cups', 'Swords', 'Pentacles'])
  for (const [i, rank] of ranks.entries())
    cases.push([
      `Giải nghĩa ${rank} of ${suit}`,
      `${suit.toLowerCase()}-${String(i + 1).padStart(2, '0')}-upright`,
    ]);

test(`golden corpus: ${cases.length} supported Vietnamese, accentless and English-name queries resolve with references`, () => {
  assert.ok(cases.length >= 100);
  for (const [question, intent] of cases) {
    const result = replyLocal(question, now);
    assert.equal(result.intent, intent, question);
    assert.ok(result.content.length > 20, question);
    assert.ok(result.source === 'local-rule' || result.source === 'local-knowledge', question);
    if (intent !== 'navigate') assert.ok(result.references?.length, question);
  }
});
test('Vietnam day, lunar New Year boundary, invalid dates, incomplete birth data and unknown questions', () => {
  assert.match(replyLocal('Hôm nay âm lịch ngày mấy?', now).content, /31\/10\/2026/);
  assert.match(
    replyLocal('Âm lịch 17/02/2026', now).content,
    /1 tháng Giêng|1\/1|01\/01|1 tháng 1/,
  );
  assert.match(replyLocal('Sinh 28/01/2025 con giáp gì', now).content, /Giáp Thìn/);
  for (const date of ['31/02/2000', '29/02/2001', '01/13/2020', '01/01/1800'])
    assert.match(replyLocal(`Sinh ${date} cung gì`, now).content, /chưa hợp lệ/);
  assert.match(replyLocal('Tôi thuộc cung gì?', now).content, /dd\/mm\/yyyy/);
  assert.equal(replyLocal('Tôi sẽ kết hôn ngày nào?', now).source, 'guided-fallback');
  assert.equal(replyLocal('The Star và The Tower kết hợp ra sao?', now).source, 'guided-fallback');
  assert.match(replyLocal('năm 2000 tuổi gì', now).content, /Tết Nguyên đán/);
});
test('knowledge catalog has stable IDs, all card orientations, Vietnamese normalization and searchable sources', () => {
  assert.ok(KNOWLEDGE.length >= 200 && KNOWLEDGE.length <= 300);
  assert.equal(new Set(KNOWLEDGE.map((e) => e.id)).size, KNOWLEDGE.length);
  assert.equal(KNOWLEDGE.filter((e) => /-(upright|reversed)$/.test(e.id)).length, 156);
  assert.equal(normalizeText('  NGŨ HÀNH — ĐÔNG phương! '), 'ngu hanh dong phuong');
  assert.equal(searchKnowledge('The Star')[0].id, 'major-17-upright');
  assert.equal(searchKnowledge('The Star', KNOWLEDGE.length).length, 2);
  assert.ok(KNOWLEDGE.every((e) => e.source && e.content && e.aliases.length));
});
test('local wins without AI; off, offline, missing provider and failed/empty/timed-out upstream return fallback', async () => {
  let requests = 0;
  const ai = async () => {
    requests++;
    return 'AI answer';
  };
  assert.equal(
    (await replyHybrid('ngũ hành là gì', { ai, aiEnabled: true, online: true })).source,
    'local-knowledge',
  );
  for (const options of [
    { aiEnabled: false, online: true, ai },
    { aiEnabled: true, online: false, ai },
    { aiEnabled: true, online: true },
  ])
    assert.equal((await replyHybrid('Hỏi ngoài thư viện', options)).source, 'guided-fallback');
  assert.equal(requests, 0);
  assert.equal(
    (await replyHybrid('Hỏi ngoài thư viện', { aiEnabled: true, online: true, ai })).source,
    'online-ai',
  );
  for (const status of [401, 429, 500])
    assert.equal(
      (
        await replyHybrid('Hỏi ngoài thư viện', {
          aiEnabled: true,
          online: true,
          ai: async () => {
            throw new Error(`${status}`);
          },
        })
      ).source,
      'guided-fallback',
    );
  assert.equal(
    (await replyHybrid('Hỏi ngoài thư viện', { aiEnabled: true, online: true, ai: async () => '' }))
      .source,
    'guided-fallback',
  );
  let aborted = false;
  const timed = await replyHybrid('Hỏi ngoài thư viện', {
    aiEnabled: true,
    online: true,
    timeoutMs: 5,
    ai: (signal) =>
      new Promise(() =>
        signal.addEventListener('abort', () => {
          aborted = true;
        }),
      ),
  });
  assert.equal(timed.source, 'guided-fallback');
  assert.equal(aborted, true);
});

test('every declared lookup group has a supported canonical question and month/event queries use the local engine', () => {
  for (const entry of KNOWLEDGE)
    assert.equal(replyLocal(`${entry.title} là gì?`, now).intent, entry.id, entry.title);
  assert.equal(replyLocal('Tháng này ngày nào phù hợp khai trương?', now).intent, 'good-days');
  assert.match(
    replyLocal('Chọn ngày tốt khai trương tháng 13 năm 2026', now).content,
    /tháng 1–12/,
  );
});
