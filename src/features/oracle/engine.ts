export type OracleLine = 6 | 7 | 8 | 9;

export interface Trigram {
  id: string;
  name: string;
  symbol: string;
  pattern: string;
  image: string;
  element: string;
  direction: string;
  reflection: string;
}

export interface OracleCast {
  id: string;
  createdAt: string;
  question: string;
  lines: OracleLine[];
}

export const TRIGRAMS: Trigram[] = [
  { id: 'qian', name: 'Càn', symbol: '☰', pattern: '111', image: 'Trời', element: 'Kim', direction: 'Tây Bắc', reflection: 'Chủ động có nguyên tắc; dùng sức sáng tạo nhưng đừng ép tiến độ.' },
  { id: 'dui', name: 'Đoài', symbol: '☱', pattern: '110', image: 'Hồ', element: 'Kim', direction: 'Tây', reflection: 'Trao đổi cởi mở; kiểm tra xem sự dễ chịu có đang che khuất điều cần nói.' },
  { id: 'li', name: 'Ly', symbol: '☲', pattern: '101', image: 'Lửa', element: 'Hỏa', direction: 'Nam', reflection: 'Làm rõ điều đang dẫn đường; phân biệt ánh sáng nhất thời với hiểu biết bền vững.' },
  { id: 'zhen', name: 'Chấn', symbol: '☳', pattern: '100', image: 'Sấm', element: 'Mộc', direction: 'Đông', reflection: 'Đón chuyển động mới bằng một bước nhỏ; đừng để bất ngờ biến thành phản ứng vội.' },
  { id: 'xun', name: 'Tốn', symbol: '☴', pattern: '011', image: 'Gió', element: 'Mộc', direction: 'Đông Nam', reflection: 'Tác động bằng sự đều đặn; điều mềm dẻo vẫn cần một hướng đi rõ.' },
  { id: 'kan', name: 'Khảm', symbol: '☵', pattern: '010', image: 'Nước', element: 'Thủy', direction: 'Bắc', reflection: 'Nhận diện rủi ro trước khi đi tiếp; tìm lối qua thay vì phủ nhận độ sâu.' },
  { id: 'gen', name: 'Cấn', symbol: '☶', pattern: '001', image: 'Núi', element: 'Thổ', direction: 'Đông Bắc', reflection: 'Dừng đúng lúc để thấy ranh giới; im lặng hữu ích khi nó giúp quan sát rõ hơn.' },
  { id: 'kun', name: 'Khôn', symbol: '☷', pattern: '000', image: 'Đất', element: 'Thổ', direction: 'Tây Nam', reflection: 'Nuôi dưỡng điều có thể lớn lên; tiếp nhận không có nghĩa là bỏ qua giới hạn.' },
];

const BY_PATTERN = new Map(TRIGRAMS.map((trigram) => [trigram.pattern, trigram]));

export function lineFromByte(byte: number): OracleLine {
  const value = byte % 8;
  if (value === 0) return 6;
  if (value <= 3) return 7;
  if (value <= 6) return 8;
  return 9;
}

export function castOracle(question = '', bytes?: Uint8Array): OracleCast {
  const source = bytes ?? crypto.getRandomValues(new Uint8Array(6));
  if (source.length < 6) throw new RangeError('Cần sáu giá trị để gieo sáu hào.');
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `oracle-${Date.now()}-${source[0]}`,
    createdAt: new Date().toISOString(),
    question: question.trim().slice(0, 300),
    lines: Array.from(source.slice(0, 6), lineFromByte),
  };
}

export function trigramFor(lines: OracleLine[]) {
  if (lines.length !== 3) throw new RangeError('Một quái cần đúng ba hào.');
  const pattern = lines.map((line) => (line === 7 || line === 9 ? '1' : '0')).join('');
  return BY_PATTERN.get(pattern)!;
}

export function changedLines(lines: OracleLine[]) {
  return lines.map((line) => (line === 6 ? 7 : line === 9 ? 8 : line)) as OracleLine[];
}

export function describeCast(cast: OracleCast) {
  if (cast.lines.length !== 6 || cast.lines.some((line) => ![6, 7, 8, 9].includes(line)))
    throw new RangeError('Quẻ cần sáu hào hợp lệ.');
  const lower = trigramFor(cast.lines.slice(0, 3));
  const upper = trigramFor(cast.lines.slice(3, 6));
  const changing = cast.lines.flatMap((line, index) => (line === 6 || line === 9 ? [index + 1] : []));
  const transformed = changedLines(cast.lines);
  const changedLower = trigramFor(transformed.slice(0, 3));
  const changedUpper = trigramFor(transformed.slice(3, 6));
  return { lower, upper, changing, changedLower, changedUpper };
}

export function isOracleCast(value: unknown): value is OracleCast {
  const cast = value as OracleCast;
  return Boolean(
    cast &&
      typeof cast.id === 'string' &&
      typeof cast.createdAt === 'string' &&
      typeof cast.question === 'string' &&
      Array.isArray(cast.lines) &&
      cast.lines.length === 6 &&
      cast.lines.every((line) => [6, 7, 8, 9].includes(line)),
  );
}
