export const READING_TOPICS = [
  { id: 'general', label: 'Tổng quan', domain: 'general' },
  { id: 'love', label: 'Tình cảm & kết nối', domain: 'love' },
  { id: 'career', label: 'Công việc & học tập', domain: 'career' },
  { id: 'finance', label: 'Tài chính & nguồn lực', domain: 'finance' },
  { id: 'self', label: 'Hiểu mình & phát triển', domain: 'general' },
] as const;
export type ReadingTopic = (typeof READING_TOPICS)[number]['id'];
export type TopicSelection = ReadingTopic | 'auto';
export const INTERPRETATION_VERSION = 'rws-vi-2';
export const READING_SOURCES = [
  {
    label: 'A. E. Waite · The Pictorial Key to the Tarot — Major Arcana',
    url: 'https://sacred-texts.com/tarot/pkt/pkt0303.htm',
  },
  {
    label: 'A. E. Waite · Hình tượng và ý nghĩa Minor Arcana',
    url: 'https://sacred-texts.com/tarot/pkt/pkt0302.htm',
  },
  {
    label: 'A. E. Waite · Celtic Cross (nguồn lịch sử; ứng dụng dùng biến thể)',
    url: 'https://sacred-texts.com/tarot/pkt/pkt0307.htm',
  },
] as const;
export function isTopic(value: unknown): value is TopicSelection {
  return value === 'auto' || READING_TOPICS.some((topic) => topic.id === value);
}
export function normalizeQuestion(value: string) {
  return value.toLocaleLowerCase('vi').normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd');
}
export function resolveReadingTopic(
  question: string,
  spreadId: string,
  selection: TopicSelection = 'auto',
) {
  if (selection !== 'auto') return { id: selection, reason: 'Bạn chọn chủ đề' };
  const normalized = normalizeQuestion(question);
  const patterns: [ReadingTopic, RegExp][] = [
    [
      'finance',
      /\b(tai chinh|tien|dau tu|thu nhap|vay|tra no|ngan sach|chi tieu|tiet kiem|tai san|co phieu|coin)\b/,
    ],
    [
      'love',
      /\b(tinh yeu|tinh cam|yeu duong|nguoi yeu|nguoi ay|hon nhan|hen ho|chia tay|vo chong|ket noi|ban doi|cuoi)\b/,
    ],
    [
      'career',
      /\b(cong viec|su nghiep|nghe nghiep|doi viec|nghi viec|hoc tap|thi cu|du an|dong nghiep|sep|phong van|kinh doanh)\b/,
    ],
    ['self', /\b(ban than|phat trien|thoi quen|tu tin|dong luc|hieu minh|cam xuc)\b/],
  ];
  const match = patterns.find(([, pattern]) => pattern.test(normalized));
  if (match) return { id: match[0], reason: 'Gợi ý từ từ khóa trong câu hỏi' };
  if (spreadId === 'love' || spreadId === 'career')
    return { id: spreadId as ReadingTopic, reason: 'Theo kiểu trải bạn chọn' };
  return { id: 'general' as ReadingTopic, reason: 'Chưa có từ khóa rõ; dùng góc nhìn tổng quan' };
}
