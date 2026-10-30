import { MINOR_MEANINGS } from './card-meanings.vi';
export type Suit = 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';
export interface TarotCard {
  id: string;
  number: number;
  name: string;
  nameVi: string;
  suit: Suit;
  imagePath: string;
  uprightKeywords: string[];
  reversedKeywords: string[];
  upright: string;
  reversed: string;
  symbol: string;
}
const root = '/assets/tarot/celestial-v1';
// Original Vietnamese editorial text. Meanings are reflective prompts, not predictions.
const major = [
  [
    'The Fool',
    'Khởi đầu',
    'Tự do,Khám phá,Niềm tin',
    'Vội vàng,Thiếu chuẩn bị',
    'Đón nhận một khởi đầu mới bằng sự tò mò. Hãy bước một bước nhỏ và chuẩn bị nền tảng trước khi đi xa.',
    'Bạn có thể đang hành động quá vội hoặc sợ thay đổi. Kiểm tra rủi ro thực tế trước bước tiếp theo.',
    '☀',
  ],
  [
    'The Magician',
    'Kiến tạo',
    'Chủ động,Kỹ năng,Tập trung',
    'Phân tán,Tiềm năng bị bỏ quên',
    'Bạn đã có những công cụ cần thiết. Chọn một mục tiêu rõ ràng và biến ý tưởng thành một hành động cụ thể.',
    'Năng lượng đang bị chia nhỏ. Hãy nhìn lại nguồn lực và tránh hứa nhiều hơn khả năng thực hiện.',
    '∞',
  ],
  [
    'The High Priestess',
    'Trực giác',
    'Lắng nghe,Bí ẩn,Nội tâm',
    'Nhiễu loạn,Bỏ qua cảm nhận',
    'Dành một khoảng lặng để nghe chính mình. Có những điều cần thời gian và quan sát trước khi có thể gọi tên.',
    'Quá nhiều ý kiến có thể làm bạn mất kết nối với bản thân. Phân biệt cảm nhận, giả định và sự thật.',
    '☾',
  ],
  [
    'The Empress',
    'Nuôi dưỡng',
    'Sáng tạo,Chăm sóc,Trù phú',
    'Cạn kiệt,Phụ thuộc',
    'Chăm sóc điều bạn muốn phát triển bằng sự kiên nhẫn, từ một ý tưởng đến một mối quan hệ.',
    'Bạn cũng cần được chăm sóc. Đặt giới hạn và dành thời gian hồi phục thay vì cho đi liên tục.',
    '❀',
  ],
  [
    'The Emperor',
    'Nền tảng',
    'Cấu trúc,Trách nhiệm,Ổn định',
    'Cứng nhắc,Kiểm soát',
    'Một kế hoạch rõ ràng và giới hạn lành mạnh giúp bạn xây dựng sự ổn định lâu dài.',
    'Hãy xem lại quy tắc nào còn hữu ích. Sự linh hoạt có thể giúp bạn tiến xa hơn việc kiểm soát mọi thứ.',
    '♜',
  ],
  [
    'The Hierophant',
    'Minh triết',
    'Học hỏi,Truyền thống,Dẫn dắt',
    'Khuôn mẫu,Niềm tin cũ',
    'Tìm một người hướng dẫn hoặc hệ thống kiến thức đáng tin. Hiểu nguyên tắc trước khi tự tìm con đường riêng.',
    'Một khuôn mẫu quen thuộc có thể không còn phù hợp. Xem lại niềm tin bằng trải nghiệm của chính bạn.',
    '✥',
  ],
  [
    'The Lovers',
    'Kết nối',
    'Đồng điệu,Lựa chọn,Giá trị',
    'Bất đồng,Thiếu cân bằng',
    'Lựa chọn phù hợp bắt đầu từ giá trị của bạn. Một cuộc trò chuyện chân thành có thể tạo nên sự kết nối.',
    'Nhìn thẳng vào điều đang lệch nhịp. Hãy trao đổi nhu cầu và mong đợi thay vì đoán suy nghĩ của nhau.',
    '♡',
  ],
  [
    'The Chariot',
    'Tiến bước',
    'Ý chí,Định hướng,Quyết tâm',
    'Mất phương hướng,Ép buộc',
    'Giữ mục tiêu trong tầm nhìn, điều hòa những mong muốn trái chiều và tiến từng bước có chủ đích.',
    'Dừng lại để chỉnh hướng. Đi nhanh sẽ ít ý nghĩa nếu bạn chưa biết điều mình thực sự muốn.',
    '➶',
  ],
  [
    'Strength',
    'Nội lực',
    'Can đảm,Kiên nhẫn,Dịu dàng',
    'Tự nghi ngờ,Kiệt sức',
    'Sức mạnh có thể đến từ sự bình tĩnh. Đối xử tử tế với bản thân khi đối diện một thử thách.',
    'Hạ kỳ vọng về việc phải luôn mạnh mẽ. Một khoảng nghỉ hoặc sự hỗ trợ là điều đáng đón nhận.',
    '♌',
  ],
  [
    'The Hermit',
    'Soi chiếu',
    'Chiêm nghiệm,Tĩnh lặng,Tự hiểu',
    'Cô lập,Thu mình',
    'Tạm rời nhịp vội để nhìn lại điều quan trọng. Viết xuống câu hỏi mà bạn muốn tự trả lời.',
    'Khoảng lặng hữu ích khác với việc cắt đứt kết nối. Hãy tìm một người bạn tin để chia sẻ.',
    '✧',
  ],
  [
    'Wheel of Fortune',
    'Chuyển vận',
    'Chu kỳ,Thay đổi,Cơ hội',
    'Kháng cự,Lặp lại',
    'Mọi chu kỳ đều chuyển động. Tập trung vào phần bạn có thể chủ động khi hoàn cảnh thay đổi.',
    'Nhận diện một vòng lặp cũ và thử một phản ứng mới. Bạn không cần kiểm soát mọi biến động.',
    '☸',
  ],
  [
    'Justice',
    'Cân bằng',
    'Công bằng,Trung thực,Hệ quả',
    'Thiên lệch,Né tránh',
    'Xem xét sự việc từ nhiều phía. Quyết định dựa trên thông tin rõ ràng và trách nhiệm với lựa chọn của mình.',
    'Kiểm tra những giả định đang dẫn dắt bạn. Có một sự thật hoặc trách nhiệm nào đang bị né tránh?',
    '⚖',
  ],
  [
    'The Hanged Man',
    'Góc nhìn mới',
    'Tạm dừng,Buông bỏ,Đổi góc nhìn',
    'Trì hoãn,Bế tắc',
    'Một khoảng dừng có thể mở ra cách nhìn khác. Thử đặt mình vào vị trí của người đối diện.',
    'Phân biệt chờ đợi có mục đích với trì hoãn. Chọn một việc nhỏ giúp bạn thoát khỏi thế đứng yên.',
    '⌁',
  ],
  [
    'Death',
    'Chuyển hóa',
    'Khép lại,Đổi mới,Chuyển tiếp',
    'Níu giữ,Sợ thay đổi',
    'Một giai đoạn khép lại để tạo không gian cho điều mới. Lá bài nói về sự chuyển đổi, không dự báo cái chết.',
    'Bạn có thể đang níu một điều đã hoàn thành vai trò. Buông từng phần nhỏ sẽ dễ hơn thay đổi tất cả cùng lúc.',
    '❋',
  ],
  [
    'Temperance',
    'Điều hòa',
    'Hài hòa,Chừng mực,Hợp nhất',
    'Quá mức,Mất nhịp',
    'Tìm nhịp điệu vừa sức. Kết hợp những điều khác biệt bằng thử nghiệm nhỏ và điều chỉnh đều đặn.',
    'Lịch sinh hoạt hoặc kỳ vọng đang mất cân đối. Bắt đầu bằng việc giảm một điều đang quá tải.',
    '⚱',
  ],
  [
    'The Devil',
    'Ràng buộc',
    'Thói quen,Ham muốn,Nhận diện',
    'Giải phóng,Tự chủ',
    'Nhận diện một thói quen hoặc ràng buộc đang giới hạn bạn. Việc gọi tên nó là bước đầu lấy lại quyền lựa chọn.',
    'Bạn có cơ hội nới lỏng một ràng buộc cũ. Tìm sự hỗ trợ thực tế và ghi nhận từng bước tiến.',
    '♑',
  ],
  [
    'The Tower',
    'Thức tỉnh',
    'Biến chuyển,Sự thật,Tái thiết',
    'Kháng cự,Lo ngại',
    'Một giả định có thể cần thay đổi. Ưu tiên điều ổn định và xây lại từ những gì đã được kiểm chứng.',
    'Bạn có đang trì hoãn một thay đổi cần thiết? Điều chỉnh có kế hoạch giúp giảm cảm giác bị động.',
    'ϟ',
  ],
  [
    'The Star',
    'Hy vọng',
    'Hồi phục,Niềm tin,Cảm hứng',
    'Nản lòng,Mất kết nối',
    'Cho mình không gian hồi phục. Một nguồn cảm hứng nhỏ có thể giúp bạn kết nối lại với điều muốn hướng đến.',
    'Hy vọng đôi khi bắt đầu từ việc rất bình thường. Chọn một hoạt động nuôi dưỡng bạn hôm nay.',
    '☆',
  ],
  [
    'The Moon',
    'Tiềm thức',
    'Cảm xúc,Mơ hồ,Tưởng tượng',
    'Sáng tỏ,Đối diện',
    'Đừng vội kết luận khi thông tin còn thiếu. Ghi nhận cảm xúc rồi tìm thêm bằng chứng trước quyết định.',
    'Một điều chưa rõ đang dần được gọi tên. Tách nỗi lo khỏi những gì bạn thực sự biết.',
    '☾',
  ],
  [
    'The Sun',
    'Rạng rỡ',
    'Niềm vui,Rõ ràng,Sinh lực',
    'Chậm lại,Kỳ vọng',
    'Ghi nhận điều đang diễn ra tốt đẹp và chia sẻ niềm vui. Sự rõ ràng giúp bạn bước tiếp nhẹ nhàng hơn.',
    'Niềm vui không cần hoàn hảo. Giảm một kỳ vọng và để bản thân tận hưởng những tiến bộ nhỏ.',
    '☀',
  ],
  [
    'Judgement',
    'Tiếng gọi',
    'Nhìn lại,Thức tỉnh,Đổi hướng',
    'Tự phán xét,Chần chừ',
    'Nhìn lại hành trình bằng lòng cảm thông. Bài học cũ có thể giúp bạn chọn một hướng đi có ý nghĩa hơn.',
    'Bớt khắt khe với quá khứ. Một quyết định chưa cần hoàn hảo để trở thành điểm khởi đầu tốt.',
    '♬',
  ],
  [
    'The World',
    'Viên mãn',
    'Hoàn thành,Kết nối,Trọn vẹn',
    'Dang dở,Thiếu khép lại',
    'Dừng lại để ghi nhận một chặng đường. Hoàn tất điều còn lại và mang theo bài học cho chu kỳ tiếp theo.',
    'Một việc nhỏ chưa kết thúc có thể chiếm nhiều tâm trí. Hãy khép lại hoặc chủ động quyết định buông nó.',
    '◎',
  ],
];

const suits = [
  { id: 'wands', en: 'Wands', vi: 'Gậy', symbol: '♧' },
  { id: 'cups', en: 'Cups', vi: 'Cốc', symbol: '♜' },
  { id: 'swords', en: 'Swords', vi: 'Kiếm', symbol: '✦' },
  { id: 'pentacles', en: 'Pentacles', vi: 'Tiền', symbol: '✵' },
] as const;
const ranks = [
  ['Ace', 'Át'],
  ['Two', 'Hai'],
  ['Three', 'Ba'],
  ['Four', 'Bốn'],
  ['Five', 'Năm'],
  ['Six', 'Sáu'],
  ['Seven', 'Bảy'],
  ['Eight', 'Tám'],
  ['Nine', 'Chín'],
  ['Ten', 'Mười'],
  ['Page', 'Tiểu đồng'],
  ['Knight', 'Kỵ sĩ'],
  ['Queen', 'Hoàng hậu'],
  ['King', 'Nhà vua'],
];

export const TAROT_CARDS: TarotCard[] = [
  ...major.map(([name, nameVi, up, down, upright, reversed, symbol], number) => ({
    id: `major-${String(number).padStart(2, '0')}`,
    number,
    name,
    nameVi,
    suit: 'major' as const,
    imagePath: `${root}/major/${String(number).padStart(2, '0')}.svg`,
    uprightKeywords: up.split(','),
    reversedKeywords: down.split(','),
    upright,
    reversed,
    symbol,
  })),
  ...suits.flatMap((suit) =>
    ranks.map(([rank, vi], index) => ({
      id: `${suit.id}-${String(index + 1).padStart(2, '0')}`,
      number: index + 1,
      name: `${rank} of ${suit.en}`,
      nameVi: `${vi} ${suit.vi}`,
      suit: suit.id,
      imagePath: `${root}/minor/${suit.id}-${String(index + 1).padStart(2, '0')}.svg`,
      uprightKeywords: MINOR_MEANINGS[suit.id][index][0].split(','),
      reversedKeywords: MINOR_MEANINGS[suit.id][index][1].split(','),
      upright: MINOR_MEANINGS[suit.id][index][2],
      reversed: MINOR_MEANINGS[suit.id][index][3],
      symbol: suit.symbol,
    })),
  ),
];
export const CARD_BACK = `${root}/card-back.svg`;
export const CARD_MAP = new Map(TAROT_CARDS.map((card) => [card.id, card]));
