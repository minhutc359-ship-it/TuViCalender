import { supabase, isSupabaseConfigured } from './supabase';
import { getCurrentLunarDate, formatLunarDate, getCanChi } from './lunar';
import { analyzeDay } from './goodDays';
import { vietnamToday } from './date';
import type { ChatPersona } from './chat-personas';
import type { ChatResponse } from '../features/chatbot/engine';
export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  persona?: ChatPersona;
  response?: ChatResponse;
}
export function getCurrentContext() {
  const now = vietnamToday(),
    lunar = getCurrentLunarDate();
  const day = analyzeDay(now.getDate(), now.getMonth() + 1, now.getFullYear());
  return {
    currentDate: now.toLocaleDateString('vi-VN'),
    lunarDate: formatLunarDate(lunar),
    canChi: getCanChi(lunar.year),
    dayCanChi: day.dayCanChi,
    luckyHours: day.luckyHours,
    method: 'UTC+7; lịch truyền thống tham khảo, Trực theo tiết khí xấp xỉ; 28 Tú chưa kiểm định',
  };
}
export function isOpenAIConfigured() {
  return isSupabaseConfigured();
}
export async function chatWithAI(
  message: string,
  chatHistory: AIMessage[] = [],
  persona: ChatPersona = 'eastern',
  signal?: AbortSignal,
): Promise<string> {
  if (!isSupabaseConfigured())
    throw new Error('Trợ lý AI chưa được kích hoạt. Bạn vẫn có thể khám phá Tarot và lịch.');
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Đăng nhập bằng email để trò chuyện với trợ lý AI.');
  const { data, error } = await supabase.functions.invoke('chat-ai', {
    signal,
    body: { message, chatHistory: chatHistory.slice(-10), context: getCurrentContext(), persona },
  });
  if (error) {
    const response = error.context instanceof Response ? error.context : null;
    if (response?.status === 429)
      throw new Error('Bạn đã đạt hạn mức trò chuyện. Hãy chờ một chút hoặc quay lại ngày mai.');
    if (response?.status === 401)
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    throw new Error('Trợ lý AI đang chưa sẵn sàng. Vui lòng thử lại sau.');
  }
  if (typeof data?.reply !== 'string' || !data.reply.trim())
    throw new Error('Chưa nhận được phản hồi. Vui lòng thử lại.');
  return data.reply;
}
