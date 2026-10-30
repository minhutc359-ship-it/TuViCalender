import { CARD_MAP, type TarotCard, type Suit } from '../data/cards';
import { CARD_GUIDANCE } from '../data/card-guidance.vi';
import { getSpread } from '../data/spreads';
import { SPREAD_ROLES, POSITION_GUIDANCE } from '../data/position-guidance';
import {
  READING_TOPICS,
  resolveReadingTopic,
  normalizeQuestion,
  INTERPRETATION_VERSION,
} from '../data/reading-topics';
import type { Reading } from './reading';

const sentence = (text: string) =>
  text.charAt(0).toLocaleUpperCase('vi') + text.slice(1).replace(/[.!?]+$/, '') + '.';
const SUIT_CONTEXT: Record<Suit, string> = {
  major: 'giá trị, cách nhìn và định hướng',
  wands: 'động lực, sáng tạo và cách hành động',
  cups: 'cảm xúc, nhu cầu và kết nối',
  swords: 'tư duy, giao tiếp và dữ kiện',
  pentacles: 'nguồn lực, công sức và điều kiện thực tế',
};
const SUIT_NAMES: Record<Suit, string> = {
  major: 'Major Arcana',
  wands: 'Gậy',
  cups: 'Cốc',
  swords: 'Kiếm',
  pentacles: 'Tiền',
};
export function guidanceFor(card: TarotCard, reversed: boolean, topic: string) {
  const row = CARD_GUIDANCE[card.id];
  if (!row) throw new Error(`Missing editorial guidance: ${card.id}`);
  const offset = reversed ? 1 : 0;
  const topicOffset = topic === 'love' ? 0 : topic === 'career' ? 2 : topic === 'finance' ? 4 : -1;
  return {
    context:
      topicOffset >= 0
        ? sentence(row[topicOffset + offset])
        : reversed
          ? card.reversed
          : card.upright,
    action: sentence(row[6 + offset]),
  };
}
const PAIR_NOTES: readonly [string, string, string][] = [
  ['major-16', 'major-17', 'điều chỉnh nền tảng cũ và dành chỗ cho việc hồi phục'],
  ['major-06', 'cups-02', 'lựa chọn theo giá trị cần đi cùng đối thoại và sự đáp lại hai chiều'],
  [
    'swords-03',
    'major-17',
    'thừa nhận tổn thương và nuôi lại điểm tựa có thể là hai phần của cùng quá trình',
  ],
  ['major-15', 'swords-08', 'phân biệt ràng buộc thực tế với niềm tin đang làm hẹp lựa chọn'],
  ['major-04', 'major-11', 'cấu trúc hoặc quyền hạn cần đi cùng sự minh bạch và trách nhiệm'],
  [
    'major-09',
    'swords-04',
    'khoảng lặng và nghỉ ngơi cần giúp bạn nhìn rõ, thay vì trở thành cô lập',
  ],
  [
    'pentacles-08',
    'pentacles-03',
    'rèn kỹ năng sẽ có ích hơn khi có tiêu chuẩn và phản hồi từ hợp tác',
  ],
  ['cups-07', 'swords-02', 'nhiều khả năng và sự phân vân cần được thu hẹp bằng tiêu chí cụ thể'],
  ['wands-10', 'swords-04', 'khối lượng đang gánh cần được cân đối với năng lực hồi phục'],
  ['wands-01', 'wands-08', 'cảm hứng cần một nhịp triển khai và cách trao đổi đủ rõ'],
  ['major-18', 'swords-01', 'điều mơ hồ cần được kiểm tra bằng câu hỏi và dữ kiện'],
  [
    'pentacles-05',
    'pentacles-06',
    'nhu cầu được hỗ trợ nên được nối với nguồn giúp đỡ và điều kiện rõ ràng',
  ],
];
export function interpretReading(reading: Reading) {
  const spread = getSpread(reading.spreadId);
  if (
    reading.cards.length !== spread.positions.length ||
    reading.cards.some((c) => !CARD_MAP.has(c.cardId)) ||
    new Set(reading.cards.map((c) => c.cardId)).size !== reading.cards.length
  )
    throw new Error('Invalid reading');
  const resolved = resolveReadingTopic(reading.question, reading.spreadId, reading.topic ?? 'auto');
  const topic = READING_TOPICS.find((t) => t.id === resolved.id)!;
  const cards = reading.cards.map((drawn, index) => {
    const card = CARD_MAP.get(drawn.cardId)!;
    const role = SPREAD_ROLES[reading.spreadId][index];
    const guidance = guidanceFor(card, drawn.reversed, topic.id);
    const lens = POSITION_GUIDANCE[role];
    return {
      card,
      drawn,
      position: spread.positions[index],
      role,
      keywords: drawn.reversed ? card.reversedKeywords : card.uprightKeywords,
      meaning: drawn.reversed ? card.reversed : card.upright,
      context: guidance.context,
      action: guidance.action,
      positionMeaning: lens.lens,
      reflection: lens.question,
    };
  });
  const counts: Record<Suit, number> = { major: 0, wands: 0, cups: 0, swords: 0, pentacles: 0 };
  cards.forEach((c) => counts[c.card.suit]++);
  const patterns: string[] = [];
  if (cards.length > 1) {
    for (const suit of Object.keys(counts) as Suit[])
      if (counts[suit] >= Math.max(2, Math.ceil(cards.length / 2)))
        patterns.push(
          `${counts[suit]}/${cards.length} lá thuộc ${SUIT_NAMES[suit]}: ưu tiên xem ${SUIT_CONTEXT[suit]}. Đây là trọng tâm biểu tượng, không phải dự báo một sự kiện.`,
        );
    const reversed = cards.filter((c) => c.drawn.reversed).length;
    if (reversed > cards.length / 2)
      patterns.push(
        `${reversed}/${cards.length} lá ngược: kiểm tra sự trì hoãn, quá mức hoặc điều hướng vào bên trong theo từng lá; không tự động xem đây là điềm xấu.`,
      );
  }
  const pairs: [number, number][] =
    reading.spreadId === 'daily'
      ? []
      : reading.spreadId === 'career'
        ? [
            [1, 2],
            [3, 4],
          ]
        : reading.spreadId === 'celtic'
          ? [
              [0, 1],
              [2, 3],
              [6, 7],
              [8, 9],
            ]
          : [
              [0, 1],
              [1, 2],
            ];
  const connections = pairs.map(([a, b]) => {
    const first = cards[a],
      second = cards[b];
    const authored = PAIR_NOTES.find(
      ([x, y]) =>
        (x === first.card.id && y === second.card.id) ||
        (y === first.card.id && x === second.card.id),
    );
    const relationship = authored
      ? sentence(authored[2])
      : first.card.suit === second.card.suit
        ? `Hai lá cùng nhấn vào ${SUIT_CONTEXT[first.card.suit]}; xem cách phản ứng ở vị trí đầu có hỗ trợ điều cần làm ở vị trí sau không.`
        : `Đối chiếu ${SUIT_CONTEXT[first.card.suit]} với ${SUIT_CONTEXT[second.card.suit]} thay vì xem hai thông điệp là những dự báo riêng lẻ.`;
    return {
      title: `${first.position} → ${second.position}`,
      cards: `${first.card.nameVi} (${first.drawn.reversed ? 'ngược' : 'xuôi'}) · ${second.card.nameVi} (${second.drawn.reversed ? 'ngược' : 'xuôi'})`,
      text: relationship,
      application: `${first.card.nameVi}: ${first.action} ${second.card.nameVi}: ${second.action}`,
    };
  });
  const focalIndex =
    reading.spreadId === 'three'
      ? 1
      : reading.spreadId === 'love'
        ? 2
        : reading.spreadId === 'career'
          ? 3
          : 0;
  const focal = cards[focalIndex];
  const actionIndices =
    reading.spreadId === 'daily'
      ? [0]
      : reading.spreadId === 'career'
        ? [3, 4, 2]
        : reading.spreadId === 'love'
          ? [2, 0, 1]
          : reading.spreadId === 'celtic'
            ? [0, 1, 9]
            : [1, 2, 0];
  const actions = [...new Set(actionIndices.map((i) => cards[i].action))].slice(0, 3);
  const limits: string[] = [];
  if (topic.id === 'finance')
    limits.push(
      'Không suy ra lợi nhuận, giá, thời điểm giao dịch hoặc quyết định vay/đầu tư từ lá bài. Hãy kiểm tra số liệu, điều khoản và khả năng chịu rủi ro thực tế.',
    );
  if (topic.id === 'love')
    limits.push(
      'Không thể xác định chắc chắn người khác yêu ai, có chung thủy hay sẽ quay lại bằng Tarot. Đối thoại và hành vi thực tế là dữ kiện để kiểm chứng.',
    );
  const normalized = normalizeQuestion(reading.question);
  if (/\b(benh|thuoc|chan doan|mang thai|suc khoe)\b/.test(normalized))
    limits.push(
      'Bộ bài không xác định bệnh, thai kỳ hay cách điều trị. Phần này chỉ hỗ trợ tự suy ngẫm; cần nguồn chăm sóc phù hợp cho câu hỏi sức khỏe.',
    );
  const opening = reading.question.trim()
    ? `Với câu hỏi “${reading.question.trim()}”, ứng dụng đọc theo chủ đề ${topic.label.toLocaleLowerCase('vi')}.`
    : `Trải bài được đọc theo chủ đề ${topic.label.toLocaleLowerCase('vi')}.`;
  return {
    version: INTERPRETATION_VERSION,
    topic,
    topicReason: resolved.reason,
    cards,
    patterns,
    connections,
    actions,
    limits,
    overview: `${opening} Điểm tập trung là ${focal.card.nameVi} (${focal.drawn.reversed ? 'ngược' : 'xuôi'}) ở vị trí ${focal.position.toLocaleLowerCase('vi')}: ${focal.context} Hãy dùng những hành động bên dưới để đối chiếu với tình huống thực tế, thay vì xem đây là câu trả lời chắc chắn.`,
  };
}
