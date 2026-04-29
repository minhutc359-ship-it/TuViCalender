import OpenAI from 'openai';
import { getCurrentLunarDate, formatLunarDate, getCanChi, getNguHanh } from './lunar';
import { analyzeDay } from './goodDays';

// OpenAI client configuration
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

export const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // Only for demo - use Edge Function in production
}) : null;

// System prompt for astrology assistant
export const ASTROLOGY_SYSTEM_PROMPT = `Bạn là chuyên gia tử vi và chiêm tinh AI, kết hợp kiến thức phương Đông và phương Tây.

# Kiến thức của bạn:

## Phương Đông:
- Bát tự, Can Chi, Ngũ hành (Kim, Mộc, Thủy, Hỏa, Thổ)
- Tử vi đẩu số
- Phong thủy: Hướng nhà, màu sắc, số may mắn
- Lịch vạn niên: Ngày hoàng đạo, hắc đạo, giờ đẹp
- 12 Trực (Kiến, Trừ, Mãn, Bình, Định, Chấp, Phá, Nguy, Thành, Thâu, Khai, Bế)
- 28 Tú (Giác, Càng, Đê, Phòng, Tâm, Vĩ, Kỉ, ...)

## Phương Tây:
- 12 cung hoàng đạo (Aries, Taurus, Gemini, ...)
- Hành tinh chi phối (Sun, Moon, Mercury, Venus, Mars, ...)
- Aspects (conjunction, opposition, trine, square, ...)

# Cách trả lời:

1. **Ngắn gọn, dễ hiểu** - Tránh thuật ngữ khó, giải thích đơn giản
2. **Cấu trúc rõ ràng** - Dùng emoji, bullet points
3. **Lời khuyên cụ thể** - Đưa ra hành động có thể áp dụng ngay
4. **Kết hợp Đông-Tây** - Nếu phù hợp với câu hỏi
5. **Tích cực, động viên** - Tránh gây lo lắng quá mức

# Format trả lời mẫu:

## Hôm nay (ngày Canh Thìn):

✨ **Vận mệnh tổng quan:** 8/10

🎯 **Nên làm:**
- Ký hợp đồng kinh doanh (giờ Tỵ 9-11h)
- Giao dịch tài chính
- Gặp gỡ đối tác

⚠️ **Nên tránh:**
- Động thổ, xây dựng
- Tranh cãi, kiện tụng

🍀 **Phong thủy:**
- Màu: Trắng, Vàng kim
- Số: 4, 7, 9
- Hướng: Tây, Tây Bắc

💡 **Lời khuyên:** Hôm nay là ngày Kim mạnh, rất tốt cho các quyết định liên quan đến tiền bạc và sự nghiệp. Hãy tự tin!

# Lưu ý:
- Không đưa ra lời khuyên y tế nghiêm trọng
- Không khuyến khích mê tin quá mức
- Luôn nhắc người dùng rằng họ có quyền tự quyết định
`;

export interface ChatContext {
  birthDate?: string;
  birthTime?: string;
  currentDate?: string;
  lunarDate?: string;
  canChi?: string;
  nguHanh?: string;
  dayAnalysis?: any;
}

/**
 * Get current context for chat
 */
export function getCurrentContext(): ChatContext {
  const now = new Date();
  const lunar = getCurrentLunarDate();
  const analysis = analyzeDay(now.getDate(), now.getMonth() + 1, now.getFullYear());

  return {
    currentDate: now.toLocaleDateString('vi-VN'),
    lunarDate: formatLunarDate(lunar),
    canChi: getCanChi(lunar.year),
    nguHanh: getNguHanh(lunar.year),
    dayAnalysis: {
      truc: analysis.truc,
      isHoangDao: analysis.isHoangDao,
      score: analysis.score,
      goodFor: analysis.goodFor,
      luckyHours: analysis.luckyHours
    }
  };
}

/**
 * Build context prompt
 */
function buildContextPrompt(context: ChatContext): string {
  let prompt = `\n\n# Thông tin ngày hiện tại:\n`;

  if (context.currentDate) {
    prompt += `- Dương lịch: ${context.currentDate}\n`;
  }

  if (context.lunarDate) {
    prompt += `- Âm lịch: ${context.lunarDate}\n`;
  }

  if (context.canChi) {
    prompt += `- Can Chi năm: ${context.canChi}\n`;
  }

  if (context.nguHanh) {
    prompt += `- Ngũ hành: ${context.nguHanh}\n`;
  }

  if (context.dayAnalysis) {
    prompt += `- Ngày ${context.dayAnalysis.truc} (${context.dayAnalysis.isHoangDao ? 'Hoàng Đạo' : 'Hắc Đạo'})\n`;
    prompt += `- Điểm số: ${context.dayAnalysis.score}/100\n`;
    prompt += `- Nên làm: ${context.dayAnalysis.goodFor.join(', ')}\n`;
    prompt += `- Giờ tốt: ${context.dayAnalysis.luckyHours.join(', ')}\n`;
  }

  return prompt;
}

/**
 * Chat with AI assistant
 */
export async function chatWithAI(
  userMessage: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[] = [],
  context?: ChatContext
): Promise<string> {
  if (!openai) {
    return 'Vui lòng cấu hình VITE_OPENAI_API_KEY trong file .env để sử dụng AI chat. Xem DEPLOYMENT.md để biết thêm chi tiết.';
  }

  try {
    const currentContext = context || getCurrentContext();
    const contextPrompt = buildContextPrompt(currentContext);

    // Build messages array
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: ASTROLOGY_SYSTEM_PROMPT + contextPrompt
      }
    ];

    // Add chat history (last 10 messages to avoid token limit)
    const recentHistory = chatHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 800
    });

    return response.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';
  } catch (error: any) {
    console.error('OpenAI API error:', error);

    if (error.code === 'invalid_api_key') {
      return '❌ API key không hợp lệ. Vui lòng kiểm tra VITE_OPENAI_API_KEY trong file .env';
    }

    if (error.code === 'insufficient_quota') {
      return '❌ Tài khoản OpenAI đã hết credits. Vui lòng nạp thêm tại platform.openai.com';
    }

    return `Xin lỗi, đã có lỗi xảy ra: ${error.message}`;
  }
}

/**
 * Detect user intent from message
 */
export enum UserIntent {
  DAILY_FORTUNE = 'daily_fortune',
  GOOD_DAY_FINDER = 'good_day_finder',
  COMPATIBILITY = 'compatibility',
  CAREER_ADVICE = 'career_advice',
  LOVE_READING = 'love_reading',
  TAROT = 'tarot',
  GENERAL = 'general'
}

export function detectIntent(message: string): UserIntent {
  const lowerMsg = message.toLowerCase();

  // Daily fortune
  if (/hôm nay|ngày nay|vận mệnh ngày/i.test(lowerMsg)) {
    return UserIntent.DAILY_FORTUNE;
  }

  // Good day finder
  if (/ngày đẹp|ngày tốt|cưới|khai trương|xuất hành|nhập trạch/i.test(lowerMsg)) {
    return UserIntent.GOOD_DAY_FINDER;
  }

  // Compatibility
  if (/hợp tuổi|xem tuổi|tuổi.*hợp/i.test(lowerMsg)) {
    return UserIntent.COMPATIBILITY;
  }

  // Career
  if (/công việc|sự nghiệp|làm ăn|kinh doanh/i.test(lowerMsg)) {
    return UserIntent.CAREER_ADVICE;
  }

  // Love
  if (/tình duyên|tình yêu|yêu đương|người yêu/i.test(lowerMsg)) {
    return UserIntent.LOVE_READING;
  }

  // Tarot
  if (/tarot|bói bài|rút bài/i.test(lowerMsg)) {
    return UserIntent.TAROT;
  }

  return UserIntent.GENERAL;
}

/**
 * Check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!apiKey && apiKey.startsWith('sk-');
}