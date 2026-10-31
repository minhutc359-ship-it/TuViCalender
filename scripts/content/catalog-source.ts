import { TAROT_CARDS } from '../../src/features/tarot/data/cards';
import { BAT_QUAI, ZODIAC_SIGNS, ZODIAC_VN, calculateWesternChart } from '../../src/lib/astrology';
import { THIEN_CAN, DIA_CHI, CAN_TO_NGU_HANH } from '../../src/lib/lunar';
import { TRUC } from '../../src/lib/goodDays';

export interface KnowledgeEntry {
  id: string;
  title: string;
  category: 'eastern' | 'western' | 'tarot' | 'guide';
  aliases: string[];
  content: string;
  source: string;
}
export const KNOWLEDGE_VERSION = 'vi-2026.10.31-1';
export function normalizeText(text: string) {
  return text
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}
const glossary: Array<[string, string, string, string]> = [
  [
    'ngu-hanh',
    'Ngũ hành',
    'ngũ hành|tương sinh|tương khắc',
    'Ngũ hành gồm Mộc, Hỏa, Thổ, Kim, Thủy. Vòng tương sinh: Mộc → Hỏa → Thổ → Kim → Thủy → Mộc. Vòng tương khắc: Mộc → Thổ → Thủy → Hỏa → Kim → Mộc. Đây là mô hình biểu tượng truyền thống, không phải quy luật vật lý.',
  ],
  [
    'bat-quai',
    'Bát quái',
    'bát quái|tám quẻ',
    'Bát quái gồm Càn, Đoài, Ly, Chấn, Tốn, Khảm, Cấn, Khôn. Mỗi quẻ dùng ba hào âm/dương để biểu đạt hình tượng. Ứng dụng trình bày bảng Hậu thiên để tra cứu biểu tượng; chưa lập quẻ dự đoán.',
  ],
  [
    'can-chi',
    'Can Chi',
    'can chi|thiên can|địa chi',
    'Mười Thiên can kết hợp mười hai Địa chi tạo chu kỳ 60 tên. Năm âm lịch có thể khác năm dương lịch trước Tết. Khi hỏi tuổi, hãy cung cấp ngày sinh đầy đủ để tránh gán sai năm.',
  ],
  [
    'bat-tu',
    'Bát tự và giới hạn',
    'bát tự|tứ trụ|bốn trụ',
    'Bát tự dùng Can Chi của năm, tháng, ngày và giờ. Trụ tháng cần xét tiết khí và quy ước của trường phái. Khi đủ giờ sinh tại UTC+7, AstroAI có bảng bốn trụ xấp xỉ theo tháng tiết khí, đổi ngày lúc 00:00. Gần ranh giới tiết khí cần đối chiếu lịch thiên văn. Chưa cung cấp luận mệnh Bát tự chuyên sâu.',
  ],
  [
    'tiet-khi',
    'Tiết khí',
    'tiết khí|lập xuân',
    '24 tiết khí chia chu kỳ chuyển động biểu kiến của Mặt Trời thành các mốc theo kinh độ hoàng đạo. Chúng không trùng cố định với đầu tháng âm. Ứng dụng xác định tiết khí xấp xỉ bằng kinh độ Mặt Trời; không công bố thời điểm chuyển tiết chính xác đến phút.',
  ],
  [
    'lich-am',
    'Lịch âm Việt Nam',
    'âm lịch|lịch âm|lịch âm dương|tháng nhuận',
    'Lịch âm dương Việt Nam dùng múi giờ UTC+7 trong engine hiện tại. Tháng nhuận có thể trùng số tháng với tháng thường; cần giữ cờ tháng nhuận khi lưu ngày. Chưa hỗ trợ tính theo các múi giờ lịch khác.',
  ],
  [
    'gio-tot',
    'Giờ hoàng đạo',
    'giờ hoàng đạo|giờ tốt',
    'Giờ hoàng đạo ở đây là sáu khung giờ theo Địa chi của ngày trong bảng quy tắc dân gian. Đây là thông tin truyền thống tham khảo; hãy ưu tiên lịch trình, sức khỏe và điều kiện thực tế. Hỏi “Hôm nay giờ nào tốt?” để xem bảng ngày hiện tại.',
  ],
  [
    'ngay-tot',
    'Xem ngày cho kế hoạch',
    'ngày tốt|xem ngày|ngày hoàng đạo|hoàng đạo|khai trương',
    'Mở Lịch để chọn tháng, loại sự kiện và xem các yếu tố. Hoàng đạo được phân loại theo tháng âm và chi ngày; Trực dùng tháng tiết khí xấp xỉ; 28 Tú chưa có mốc chu kỳ được kiểm định và không dùng vào điểm. Điểm ngày là quy tắc giải trí. Không coi điểm số là xác suất thành công hoặc cam kết ngày tốt tuyệt đối.',
  ],
  [
    'sun-moon-rising',
    'Sun, Moon và Rising',
    'sun moon rising|sun moon|sun sign|moon sign|rising|cung mọc|cung mặt trăng|cung mặt trời',
    'Sun là vị trí Mặt Trời; Moon là vị trí Mặt Trăng; Rising là điểm hoàng đạo đang mọc ở chân trời theo địa điểm và thời gian sinh. AstroAI chỉ tra cung Mặt Trời bằng khoảng ngày phổ biến, chưa tính Moon/Rising hay lá số thiên văn chính xác.',
  ],
  [
    'natal',
    'Natal chart và 12 nhà',
    'natal chart|lá số|12 nhà|houses',
    'Natal chart mô tả vị trí thiên thể và hệ nhà tại thời điểm, nơi sinh theo quy ước chiêm tinh. Không thể suy ra Moon/Rising hoặc các nhà chỉ từ cung Mặt Trời. AstroAI chưa có ephemeris để tính natal chart đầy đủ.',
  ],
  [
    'tarot-guide',
    'Tarot để tự chiêm nghiệm',
    'tarot|bói bài|thông điệp tarot|câu hỏi tarot',
    'Bộ Tarot có 78 lá: 22 Major Arcana và 56 Minor Arcana, chia bốn chất Gậy, Cốc, Kiếm, Tiền. Có thể hỏi về tình cảm, công việc hoặc điều muốn nhìn lại. Thử “Tôi có thể chủ động thay đổi điều gì?”; lời giải không xác định vận mệnh hay thay thế tư vấn chuyên môn.',
  ],
  [
    'reversed',
    'Lá ngược',
    'lá ngược|bài ngược|xuôi ngược',
    'Lá ngược là một lựa chọn diễn giải, không tự động đồng nghĩa với điều xấu. Nó có thể gợi ý sự cản trở, quá mức hoặc một góc nhìn nội tâm. Bật/tắt lá ngược trước khi xào bài; kết quả được giữ trong nhật ký.',
  ],
  [
    'offline',
    'Dùng AstroAI offline',
    'offline|ngoại tuyến|mất mạng|không có mạng',
    'Vào Cài đặt → Dùng ngoại tuyến, tải đủ dữ liệu và chờ báo sẵn sàng trước khi tắt mạng. Lịch, Tarot, thư viện và tra cứu local hoạt động tại máy; AI online, đăng nhập và nguồn ngoài vẫn cần Internet. Trình duyệt có thể dọn cache.',
  ],
  [
    'privacy',
    'Dữ liệu và sao lưu',
    'sao lưu|backup|dữ liệu|riêng tư',
    'Hồ sơ, nhật ký và các tùy chọn lưu trong IndexedDB tại thiết bị, có chuyển dữ liệu cũ và bản dự phòng tương thích. Dùng Cài đặt → Sao lưu dữ liệu để xuất JSON. Tệp có dữ liệu cá nhân, hãy tự giữ ở nơi phù hợp. Xóa dữ liệu trình duyệt có thể làm mất dữ liệu chưa sao lưu.',
  ],
];
const elementNames = ['Mộc', 'Hỏa', 'Thổ', 'Kim', 'Thủy'];
const colors = ['xanh lá', 'đỏ, cam', 'vàng, nâu', 'trắng, ánh kim', 'đen, xanh dương'];
const elements = elementNames.map((name, i): KnowledgeEntry => ({
  id: `element-${i}`,
  title: `Hành ${name}`,
  category: 'eastern',
  aliases: [`mệnh ${name}`, `hành ${name}`, `${name} hợp màu`, `màu mệnh ${name}`],
  content: `Theo biểu tượng ngũ hành, ${name} thường gắn với ${colors[i]}. ${name} sinh ${elementNames[(i + 1) % 5]} và khắc ${elementNames[(i + 2) % 5]}. Đây là quy ước trang trí truyền thống, không bảo đảm may mắn. Không suy mệnh nạp âm từ Thiên can riêng lẻ.`,
  source: 'AstroAI · Biên soạn biểu tượng ngũ hành v1',
}));
// Use the existing application tables; do not invent a separate calculation engine.
const signDates = [
  [1, 4],
  [1, 5],
  [1, 6],
  [1, 7],
  [1, 8],
  [1, 9],
  [1, 10],
  [1, 11],
  [1, 12],
  [1, 1],
  [1, 2],
  [1, 3],
];
const westernElements: Record<string, string> = {
  Fire: 'Lửa',
  Earth: 'Đất',
  Air: 'Khí',
  Water: 'Nước',
};
export const KNOWLEDGE: KnowledgeEntry[] = [
  ...glossary.map(([id, title, aliases, content]): KnowledgeEntry => ({
    id,
    title,
    aliases: aliases.split('|'),
    content,
    category: ['sun-moon-rising', 'natal'].includes(id)
      ? 'western'
      : ['tarot-guide', 'reversed'].includes(id)
        ? 'tarot'
        : ['offline', 'privacy'].includes(id)
          ? 'guide'
          : 'eastern',
    source: 'AstroAI · Hướng dẫn và giới hạn phương pháp v1',
  })),
  ...elements,
  ...TAROT_CARDS.flatMap((card) =>
    [false, true].map((reversed): KnowledgeEntry => ({
      id: `${card.id}-${reversed ? 'reversed' : 'upright'}`,
      title: `${card.name} · ${reversed ? 'ngược' : 'xuôi'}`,
      category: 'tarot',
      aliases: [card.name, card.nameVi, card.id],
      content: `${card.nameVi}: ${reversed ? card.reversed : card.upright}\nTừ khóa: ${(reversed ? card.reversedKeywords : card.uprightKeywords).join(', ')}. Mang tính chiêm nghiệm, không dự báo chắc chắn.`,
      source: 'AstroAI · Nội dung Tarot RWS tiếng Việt',
    })),
  ),
  ...ZODIAC_SIGNS.map((sign, i): KnowledgeEntry => {
    const chart = calculateWesternChart(...(signDates[i] as [number, number]), 2000);
    return {
      id: `zodiac-${sign}`,
      title: `Cung ${ZODIAC_VN[sign]}`,
      category: 'western',
      aliases: [sign, ZODIAC_VN[sign]],
      content: `${ZODIAC_VN[sign]} (${sign}) thuộc nguyên tố ${westernElements[chart.element]}, tính chất ${chart.quality}, chủ quản ${chart.ruler} theo bảng chiêm tinh của ứng dụng. Đây là biểu tượng truyền thống, không xác định tính cách hay tương lai của mọi người cùng cung.`,
      source: 'AstroAI · Bảng cung Mặt Trời',
    };
  }),
  ...BAT_QUAI.map((quai): KnowledgeEntry => ({
    id: `bagua-${quai.name === 'Cấn' ? 'can-son' : normalizeText(quai.name)}`,
    title: `Quẻ ${quai.name}`,
    category: 'eastern',
    aliases: [`quẻ ${quai.name}`],
    content: `${quai.name}: hình tượng ${quai.meaning}, hành ${quai.element}, hướng ${quai.direction} trong bảng Hậu thiên Bát quái. Chỉ tra cứu biểu tượng, không phải kết quả gieo quẻ.`,
    source: 'AstroAI · Bảng Bát quái',
  })),
  ...DIA_CHI.map((chi, i): KnowledgeEntry => ({
    id: `branch-${i}`,
    title: `Địa chi ${chi}`,
    category: 'eastern',
    aliases: [`tuổi ${chi}`, `chi ${chi}`, `con giáp ${chi}`],
    content: `${chi} là chi thứ ${i + 1} trong chu kỳ 12 Địa chi. Chu kỳ lặp lại mỗi 12 năm; người sinh trước Tết cần đối chiếu ngày âm để xác định chi năm.`,
    source: 'AstroAI · Địa chi',
  })),
  ...THIEN_CAN.map((can, i): KnowledgeEntry => ({
    id: `stem-${i}`,
    title: `Thiên can ${can}`,
    category: 'eastern',
    aliases: [`can ${can}`],
    content: `${can} là Thiên can thứ ${i + 1}, thuộc ${CAN_TO_NGU_HANH[can]} trong bảng ngũ hành của Thiên can. Điều này không đồng nghĩa với mệnh nạp âm của cả năm sinh.`,
    source: 'AstroAI · Thiên can',
  })),
  ...TRUC.map((truc, i): KnowledgeEntry => ({
    id: `truc-${i}`,
    title: `Trực ${truc}`,
    category: 'eastern',
    aliases: [`trực ${truc}`],
    content: `${truc} là một trong 12 Trực (thứ ${i + 1} trong bảng). Trực theo tháng tiết khí tại 12:00 UTC+7, tính từ kinh độ Mặt Trời xấp xỉ. Ngày sát chuyển tiết có thể cần đối chiếu thời điểm cụ thể. Xem Lịch để đọc các hoạt động gợi ý; không dùng riêng Trực để kết luận ngày Hoàng đạo.`,
    source: 'AstroAI · Giới hạn bảng 12 Trực',
  })),
];
export function searchKnowledge(query: string, limit = 20) {
  const q = normalizeText(query);
  if (!q) return KNOWLEDGE.slice(0, limit);
  const words = q.split(' ');
  return KNOWLEDGE.map((entry) => {
    const title = normalizeText([entry.title, ...entry.aliases].join(' '));
    const body = normalizeText(entry.content);
    const tokens = new Set(`${title} ${body}`.split(' '));
    if (!title.includes(q) && !words.every((word) => tokens.has(word))) return { entry, score: 0 };
    const score =
      (title.includes(q) ? 20 : 0) +
      words.reduce(
        (n, w) => n + (title.split(' ').includes(w) ? 3 : body.split(' ').includes(w) ? 1 : 0),
        0,
      );
    return { entry, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.entry);
}
