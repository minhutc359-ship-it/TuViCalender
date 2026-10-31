import { KNOWLEDGE, normalizeText, type KnowledgeEntry } from '../knowledge/catalog';
import { solarToLunar, formatLunarDate, getCanChi, getZodiacAnimal } from '../../lib/lunar';
import { analyzeDay, findGoodDaysForEvent, EVENT_TYPES } from '../../lib/goodDays';
import { calculateWesternChart } from '../../lib/astrology';
import { vietnamDateKey } from '../../lib/date';

export interface ChatResponse {
  content: string;
  source: 'local-rule' | 'local-knowledge' | 'online-ai' | 'guided-fallback';
  intent?: string;
  confidence?: number;
  references?: Array<{ id: string; title: string }>;
  actions?: Array<{ label: string; route: string }>;
}
export const SOURCE_LABELS = {
  'local-rule': 'Tính tại máy',
  'local-knowledge': 'Trả lời từ thư viện',
  'online-ai': 'Trả lời bằng AI',
  'guided-fallback': 'Gợi ý trong phạm vi hỗ trợ',
};
const reference = (entry: KnowledgeEntry): ChatResponse => ({
  content: entry.content,
  source: 'local-knowledge',
  intent: entry.id,
  confidence: 1,
  references: [{ id: entry.id, title: entry.source }],
  actions: [
    { label: `Xem ${entry.title}`, route: `/knowledge?id=${encodeURIComponent(entry.id)}` },
  ],
});
const fallback = (): ChatResponse => ({
  content:
    'Thư viện local chưa có câu trả lời chắc chắn cho câu hỏi này. Bạn có thể hỏi “Hôm nay âm lịch ngày mấy?”, “Ngũ hành tương sinh ra sao?”, “The Star ngược là gì?” hoặc mở thư viện để tra cứu. Đây là bộ tra cứu theo quy tắc, chưa phải hội thoại tự do.',
  source: 'guided-fallback',
  confidence: 0,
  actions: [
    { label: 'Tra cứu kiến thức', route: '/knowledge' },
    { label: 'Xem lịch', route: '/calendar' },
    { label: 'Trải bài Tarot', route: '/tarot' },
  ],
});
const validDate = (d: number, m: number, y: number) => {
  const date = new Date(y, m - 1, d, 12);
  return (
    y >= 1900 &&
    y <= 2100 &&
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
};
export function replyLocal(message: string, now = new Date()): ChatResponse {
  const q = normalizeText(message)
    .replace(/\bhn\b/g, 'hom nay')
    .replace(/\bko\b/g, 'khong');
  if (!q || q.length > 4000) return fallback();
  const routes: Array<[RegExp, string, string]> = [
    [/^(mo|xem|toi muon mo) (lich|lich van nien)$/, '/calendar', 'Mở lịch'],
    [/^(mo|xem) ho so$/, '/profile', 'Mở hồ sơ'],
    [/^(mo|xem|boi|rut) (tarot|bai|mot la|1 la)( hom nay)?$/, '/tarot', 'Trải bài Tarot'],
    [/^(mo|tim|xem) (thu vien|kien thuc)$/, '/knowledge', 'Tra cứu kiến thức'],
  ];
  const nav = routes.find(([re]) => re.test(q));
  if (nav)
    return {
      content: `Chọn “${nav[2]}” để tiếp tục.`,
      source: 'local-rule',
      intent: 'navigate',
      actions: [{ label: nav[2], route: nav[1] }],
    };
  const [todayYear, todayMonth, todayDay] = vietnamDateKey(now).split('-').map(Number);
  const eventAliases: Array<[keyof typeof EVENT_TYPES, RegExp]> = [
    ['business', /khai truong/],
    ['wedding', /cuoi hoi|dam cuoi/],
    ['travel', /xuat hanh/],
    ['moving', /nhap trach|chuyen nha/],
    ['vehicle', /mua xe/],
    ['contract', /ky hop dong/],
  ];
  const event = eventAliases.find(([, pattern]) => pattern.test(q));
  if (event && /\b(ngay nao|thang nay|chon ngay|ngay tot)\b/.test(q)) {
    const requested = q.match(/\bthang (\d{1,2})(?: nam (\d{4}))?\b/);
    const m = requested ? +requested[1] : todayMonth,
      y = requested?.[2] ? +requested[2] : todayYear;
    if (m < 1 || m > 12 || y < 1900 || y > 2100)
      return { ...fallback(), content: 'Hãy chọn tháng 1–12 và năm 1900–2100.' };
    const days = findGoodDaysForEvent(y, m, event[0], 31)
      .slice(0, 5)
      .map((day) => day.date.getDate());
    return {
      content: days.length
        ? `Gợi ý truyền thống cho ${EVENT_TYPES[event[0]].name.toLocaleLowerCase('vi')} tháng ${m}/${y}: ${days.map((d) => `${d}/${m}`).join(', ')}. Bảng dùng Hoàng đạo theo tháng âm/chi ngày và hoạt động theo Trực tiết khí xấp xỉ; không bảo đảm kết quả và không thay thế điều kiện thực tế.`
        : `Chưa có ngày phù hợp bộ lọc ${EVENT_TYPES[event[0]].name} trong tháng ${m}/${y}. Xem Lịch để cân nhắc thêm điều kiện thực tế.`,
      source: 'local-rule',
      intent: 'good-days',
      references: [{ id: 'ngay-tot', title: 'Quy tắc lịch truyền thống của AstroAI' }],
      actions: [{ label: 'Xem lịch chi tiết', route: '/calendar' }],
    };
  }
  const dateMatch = message.match(/\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})\b/);
  if (dateMatch && !validDate(+dateMatch[1], +dateMatch[2], +dateMatch[3]))
    return {
      ...fallback(),
      content: 'Ngày chưa hợp lệ. Hãy nhập ngày dương lịch dạng dd/mm/yyyy trong khoảng 1900–2100.',
    };
  const [d, m, y] = dateMatch ? dateMatch.slice(1).map(Number) : [todayDay, todayMonth, todayYear];
  const calculated = (content: string, intent: string): ChatResponse => ({
    content,
    source: 'local-rule',
    intent,
    confidence: 1,
    references: [{ id: 'lich-am', title: 'Lịch Việt Nam UTC+7' }],
    actions: [
      { label: 'Xem phương pháp', route: '/knowledge?id=lich-am' },
      { label: 'Mở lịch', route: '/calendar' },
    ],
  });
  if (
    /\b(hom nay|am lich|lich am)\b/.test(q) &&
    /\b(ngay may|bao nhieu|am lich|lich am)\b/.test(q) &&
    !/\b(thang nhuan|la gi|nghia|tai sao)\b/.test(q)
  )
    return calculated(
      `${d}/${m}/${y} dương lịch là ${formatLunarDate(solarToLunar(d, m, y))} (UTC+7).`,
      'lunar-date',
    );
  if (
    /\b(gio tot|gio hoang dao|gio nao tot|gio nao duoc xem)\b/.test(q) &&
    (/\b(hom nay|nao)\b/.test(q) || dateMatch)
  ) {
    const day = analyzeDay(d, m, y);
    return calculated(
      `Giờ hoàng đạo tham khảo ngày ${d}/${m}/${y}: ${day.luckyHours.join('; ')}. Bảng dân gian theo chi ngày, không bảo đảm kết quả một việc.`,
      'lucky-hours',
    );
  }
  if (dateMatch && /\b(moon|rising|cung moc|cung mat trang|natal)\b/.test(q))
    return {
      ...fallback(),
      content:
        'Phiên bản này chưa tính Moon, Rising hoặc natal chart thiên văn. Có thể tra cung Mặt Trời theo ngày sinh dương lịch, hoặc đọc phương pháp trong thư viện.',
    };
  if (dateMatch && /\b(cung|sun sign)\b/.test(q)) {
    const chart = calculateWesternChart(d, m, y);
    return {
      content: `Sinh ngày ${d}/${m}/${y}: cung Mặt Trời ${chart.sunSignVN} (${chart.sunSign}) theo khoảng ngày phổ biến. Gần ranh giới cung cần dữ liệu thiên văn; chưa tính Moon/Rising.`,
      source: 'local-rule',
      intent: 'sun-sign',
      references: [{ id: `zodiac-${chart.sunSign}`, title: 'Bảng cung Mặt Trời' }],
      actions: [{ label: 'Xem cung', route: `/knowledge?id=zodiac-${chart.sunSign}` }],
    };
  }
  if (/\b(tuoi gi|con giap|can chi|nam sinh)\b/.test(q) || /\bsinh nam\b/.test(q)) {
    const yearMatch = q.match(/\b(19\d{2}|20\d{2}|2100)\b/);
    if (dateMatch) {
      const lunar = solarToLunar(d, m, y);
      return calculated(
        `Ngày sinh ${d}/${m}/${y} thuộc năm âm lịch ${getCanChi(lunar.year)}, chi ${getZodiacAnimal(lunar.year)}. Mệnh nạp âm và Bát tự đầy đủ chưa được engine này xác định.`,
        'birth-year',
      );
    }
    if (yearMatch)
      return calculated(
        `Năm âm lịch ${yearMatch[1]} là ${getCanChi(+yearMatch[1])}, chi ${getZodiacAnimal(+yearMatch[1])}. Nếu sinh trước Tết Nguyên đán của năm dương lịch đó, cần nhập ngày sinh đầy đủ để xác định năm âm; không suy mệnh nạp âm từ Thiên can.`,
        'year-can-chi',
      );
  }
  if (/\b(cung gi|cung nao|moon|rising)\b/.test(q) && /\b(toi|minh|cua toi)\b/.test(q))
    return {
      ...fallback(),
      content:
        'Để tra cung Mặt Trời, hãy gửi ngày sinh dương lịch dạng dd/mm/yyyy. Moon/Rising chưa được tính trong phiên bản này, kể cả khi có đủ hồ sơ sinh.',
    };
  // Full aliases with word boundaries prevent partial matches (e.g. Kim vs Kim Ngưu).
  const normalizedMatches = KNOWLEDGE.filter((entry) =>
    entry.aliases.some((alias) => ` ${q} `.includes(` ${normalizeText(alias)} `)),
  );
  const accented = (v: string) =>
    v
      .toLocaleLowerCase('vi')
      .normalize('NFC')
      .replace(/[^\p{L}\d]+/gu, ' ')
      .trim();
  const exactAccents = normalizedMatches.filter((entry) =>
    entry.aliases.some((alias) => ` ${accented(message)} `.includes(` ${accented(alias)} `)),
  );
  // Càn and Cấn collapse to the same accentless spelling; retain accents when available.
  const matched = exactAccents.length ? exactAccents : normalizedMatches;
  const tarot = matched.filter((e) => e.category === 'tarot' && /-(upright|reversed)$/.test(e.id));
  if (tarot.length) {
    const ids = new Set(tarot.map((e) => e.id.replace(/-(upright|reversed)$/, '')));
    if (ids.size !== 1)
      return {
        ...fallback(),
        content:
          'Hãy tra từng lá theo tên và chiều xuôi/ngược. Để tổng hợp nhiều lá theo vị trí, hãy dùng màn Trải bài.',
      };
    return reference(
      tarot.find((e) => e.id.endsWith(/\b(nguoc|reversed)\b/.test(q) ? '-reversed' : '-upright'))!,
    );
  }
  const specific = matched.filter(
    (e) => !['ngu-hanh', 'can-chi', 'bat-quai', 'ngay-tot', 'tarot-guide'].includes(e.id),
  );
  const entries = specific.length ? specific : matched;
  if (entries.length === 1) return reference(entries[0]);
  if (entries.length > 1)
    return {
      ...fallback(),
      content: 'Có nhiều chủ đề trong câu hỏi. Chọn một mục để xem nội dung local:',
      actions: entries.slice(0, 4).map((e) => ({ label: e.title, route: `/knowledge?id=${e.id}` })),
    };
  return fallback();
}
export async function replyHybrid(
  message: string,
  options: {
    now?: Date;
    aiEnabled?: boolean;
    online?: boolean;
    ai?: (signal: AbortSignal) => Promise<string>;
    timeoutMs?: number;
  } = {},
): Promise<ChatResponse> {
  const local = replyLocal(message, options.now);
  if (local.source !== 'guided-fallback' || !options.aiEnabled || !options.online || !options.ai)
    return local;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const text = await Promise.race([
      options.ai(controller.signal),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error('timeout'));
        }, options.timeoutMs ?? 12000);
      }),
    ]);
    if (!text.trim()) return local;
    return { content: text, source: 'online-ai' };
  } catch {
    return { ...local, content: `AI online hiện chưa sẵn sàng. ${local.content}` };
  } finally {
    clearTimeout(timer);
  }
}
