export type ChatPersona = 'eastern' | 'western';
export const isChatPersona = (v: unknown): v is ChatPersona => v === 'eastern' || v === 'western';
export const CHAT_PERSONAS = {
  eastern: {
    name: 'AI Đông phương',
    icon: 'Càn',
    subtitle: 'Lịch Việt · Can Chi · Ngũ hành',
    welcome:
      'Chào bạn. Cùng nhìn lại nhịp sống qua lịch Việt Nam, Can Chi và những hình tượng phương Đông. Bạn đang muốn sắp xếp một kế hoạch hay tìm một góc nhìn cho hôm nay?',
    prompts: [
      { icon: 'compass', text: 'Hôm nay có những giờ hoàng đạo nào?' },
      { icon: 'Mộc', text: 'Giải thích ngũ hành theo cách dễ hiểu.' },
      { icon: 'Càn', text: 'Tôi nên lưu ý gì khi xem ngày cho một kế hoạch?' },
    ],
  },
  western: {
    name: 'AI Tây phương',
    icon: 'star',
    subtitle: 'Tarot · Zodiac · Tự chiêm nghiệm',
    welcome:
      'Chào bạn. Cùng khám phá những câu hỏi qua Tarot và vòng hoàng đạo. Chúng ta có thể bắt đầu từ một lá bài, một biểu tượng hoặc điều bạn đang muốn hiểu rõ hơn về chính mình.',
    prompts: [
      { icon: 'star', text: 'Tôi muốn hiểu thông điệp Tarot.' },
      { icon: 'Sun', text: 'Cung Mặt Trời nói lên điều gì và có giới hạn nào?' },
      { icon: 'Moon', text: 'Gợi ý một câu hỏi Tarot để nhìn lại bản thân.' },
    ],
  },
} as const;
