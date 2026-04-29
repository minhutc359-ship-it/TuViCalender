import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, AlertCircle } from 'lucide-react';
import { chatWithAI, isOpenAIConfigured } from '../../lib/openai';
import { getCurrentLunarDate, formatLunarDate } from '../../lib/lunar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý AI tử vi của bạn. Bạn muốn hỏi gì về vận mệnh, ngày đẹp, hay chiêm tinh?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured] = useState(isOpenAIConfigured());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get AI response
      const response = await chatWithAI(input, messages);

      const aiResponse: Message = {
        role: 'assistant',
        content: response,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra khi xử lý tin nhắn của bạn. Vui lòng thử lại.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  const quickQuestions = [
    'Hôm nay có may mắn không?',
    'Tháng này cưới ngày nào đẹp?',
    'Tuần này làm ăn có thuận lợi?',
    'Tình duyên tháng này ra sao?',
  ];

  const lunar = getCurrentLunarDate();
  const lunarDateStr = formatLunarDate(lunar);

  return (
    <div className="pb-20 px-4 pt-8 max-w-lg mx-auto relative z-10 h-screen flex flex-col">
      <h1 className="text-2xl mb-2 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
        <Sparkles size={24} className="text-purple-400" />
        AI Thầy Bói
      </h1>
      <p className="text-purple-300/70 text-xs text-center mb-4">{lunarDateStr}</p>

      {/* Configuration Warning */}
      {!isConfigured && (
        <div className="mb-4 bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-3 flex gap-2">
          <AlertCircle size={20} className="text-yellow-400 shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-200">
            <p className="mb-1">⚠️ OpenAI chưa được cấu hình</p>
            <p className="text-yellow-300/80">
              Thêm <code className="bg-yellow-900/50 px-1 rounded">VITE_OPENAI_API_KEY</code> vào file .env để kích hoạt AI.
              Xem DEPLOYMENT.md để biết thêm chi tiết.
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                  : 'bg-purple-900/40 backdrop-blur-sm border border-purple-500/20 text-purple-100'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-purple-900/40 backdrop-blur-sm border border-purple-500/20 rounded-2xl px-4 py-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="mb-4">
          <p className="text-purple-300/70 text-xs mb-2">Câu hỏi gợi ý:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleQuickQuestion(q)}
                className="bg-purple-900/30 hover:bg-purple-900/50 transition-colors rounded-lg px-3 py-2 text-xs text-purple-100 border border-purple-500/20 text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-purple-900/30 backdrop-blur-sm rounded-2xl p-3 border border-purple-500/20 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
          placeholder="Hỏi thầy bói AI..."
          disabled={isLoading}
          className="flex-1 bg-transparent text-purple-100 placeholder-purple-300/50 outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl px-4 py-2 text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
