import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router';
import { Send, LogOut, Trash2, Sparkles } from 'lucide-react';
import { chatWithAI, isOpenAIConfigured, type AIMessage } from '../../lib/openai';
import { supabase } from '../../lib/supabase';
import { readStorage, writeStorage } from '../../lib/storage';
import type { Session } from '@supabase/supabase-js';
const welcome: AIMessage = {
  role: 'assistant',
  content:
    'Chào bạn. Đây là một không gian để cùng nhìn lại, đặt câu hỏi và khám phá chiêm tinh, lịch Việt Nam hay thông điệp Tarot. Hôm nay bạn muốn bắt đầu từ đâu?',
};
const validMessages = (value: unknown): value is AIMessage[] =>
  Array.isArray(value) &&
  value.length <= 100 &&
  value.every(
    (m) =>
      m &&
      (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string' &&
      m.content.length <= 12000,
  );
export default function ChatPage() {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([welcome]);
  const [input, setInput] = useState(
    typeof location.state?.prompt === 'string' ? location.state.prompt.slice(0, 4000) : '',
  );
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  const messagesRef = useRef(messages);
  const userIdRef = useRef<string | null>(null);
  const configured = isOpenAIConfigured();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (!configured) return;
    function change(next: Session | null) {
      if (!mounted.current) return;
      setSession(next);
      userIdRef.current = next?.user.id ?? null;
      const history = next
        ? readStorage<AIMessage[]>(`astroai.chat.${next.user.id}.v1`, [welcome], validMessages)
        : [welcome];
      setMessages(history);
      messagesRef.current = history;
    }
    supabase.auth.getSession().then(({ data }) => change(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => change(next));
    return () => data.subscription.unsubscribe();
  }, [configured]);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'instant', block: 'nearest' });
  }, [messages, busy]);
  async function signIn(e: FormEvent) {
    e.preventDefault();
    if (authBusy) return;
    setAuthBusy(true);
    setError('');
    setNotice('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/chat` },
      });
      if (error) throw error;
      setNotice('Kiểm tra email để mở liên kết đăng nhập.');
    } catch {
      setError('Chưa gửi được liên kết. Kiểm tra email hoặc thử lại sau.');
    } finally {
      if (mounted.current) setAuthBusy(false);
    }
  }
  async function send(e: FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || busy || !session) return;
    const owner = session.user.id;
    setBusy(true);
    setError('');
    const history = messagesRef.current;
    const next = [...history, { role: 'user', content } as AIMessage].slice(-100);
    messagesRef.current = next;
    setMessages(next);
    setInput('');
    try {
      const reply = await chatWithAI(
        content,
        history.filter((m) => m !== welcome),
      );
      if (!mounted.current || userIdRef.current !== owner) return;
      const updated = [...next, { role: 'assistant', content: reply } as AIMessage].slice(-100);
      setMessages(updated);
      messagesRef.current = updated;
      if (!writeStorage(`astroai.chat.${owner}.v1`, updated))
        setError('Không thể lưu lịch sử trên trình duyệt.');
    } catch (err) {
      if (mounted.current && userIdRef.current === owner) {
        setError(err instanceof Error ? err.message : 'Chưa nhận được phản hồi.');
        setInput(content);
        setMessages(history);
        messagesRef.current = history;
      }
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  function clear() {
    setMessages([welcome]);
    messagesRef.current = [welcome];
    if (session && !writeStorage(`astroai.chat.${session.user.id}.v1`, [welcome]))
      setError('Không thể xóa lịch sử đã lưu trên trình duyệt.');
  }
  return (
    <div className="chat-layout page-enter">
      <div className="page-heading">
        <div>
          <span className="eyebrow">CÙNG BẠN ĐẶT NHỮNG CÂU HỎI</span>
          <h1>
            Người bạn từ những vì sao<span className="gold">.</span>
          </h1>
          <p>Khám phá những góc nhìn mới cùng trợ lý AstroAI.</p>
        </div>
      </div>
      {!configured ? (
        <div className="content-panel panel" style={{ marginBottom: 20 }}>
          <h3>Trợ lý AI đang chờ được kích hoạt</h3>
          <p>
            Bạn có thể tiếp tục{' '}
            <Link className="text-link" to="/tarot">
              khám phá Tarot
            </Link>{' '}
            hoặc{' '}
            <Link className="text-link" to="/calendar">
              xem lịch Việt Nam
            </Link>
            .
          </p>
        </div>
      ) : !session ? (
        <section className="auth-panel panel">
          <div>
            <h3>Một cuộc trò chuyện của riêng bạn</h3>
            <p>
              Nhận liên kết đăng nhập qua email để bắt đầu. Lịch sử được lưu trên trình duyệt theo
              tài khoản.
            </p>
          </div>
          <form onSubmit={signIn}>
            <input
              type="email"
              required
              autoComplete="email"
              aria-label="Email đăng nhập"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email của bạn"
            />
            <button className="button primary" disabled={authBusy}>
              {authBusy ? 'Đang gửi…' : 'Gửi liên kết'}
            </button>
          </form>
        </section>
      ) : null}
      {notice && (
        <p className="success small" role="status" style={{ marginBottom: 16 }}>
          {notice}
        </p>
      )}
      <section className="chat-panel panel">
        <div className="chat-status">
          <div>
            <Sparkles
              size={13}
              style={{ display: 'inline', marginRight: 7, color: 'var(--gold)' }}
            />
            {session ? session.user.email : 'AstroAI · Góc nhìn để tham khảo'}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="button subtle"
              disabled={busy}
              onClick={clear}
              aria-label="Xóa lịch sử chat"
            >
              <Trash2 size={13} />
            </button>
            {session && (
              <button
                className="button subtle"
                disabled={busy}
                onClick={async () => {
                  await supabase.auth.signOut();
                  setMessages([welcome]);
                }}
              >
                <LogOut size={13} />
                Đăng xuất
              </button>
            )}
          </div>
        </div>
        <div className="chat-messages" aria-live="polite" aria-busy={busy}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role === 'user' ? 'user' : ''}`}>
              {m.role === 'assistant' && <span className="eyebrow">✦ ASTROAI</span>}
              {m.content}
            </div>
          ))}
          {busy && (
            <div className="chat-bubble">
              <span className="loading-dots" aria-label="Đang suy ngẫm">
                •••
              </span>
            </div>
          )}
          <div ref={end} />
        </div>
        {messages.length === 1 && (
          <div className="chat-quick">
            {[
              'Hôm nay có những giờ hoàng đạo nào?',
              'Tôi muốn hiểu thông điệp Tarot',
              'Làm sao để bắt đầu một thói quen mới?',
            ].map((q) => (
              <button key={q} onClick={() => setInput(q)}>
                {q}
              </button>
            ))}
          </div>
        )}
        <form className="chat-input" onSubmit={send}>
          <input
            aria-label="Tin nhắn cho trợ lý"
            maxLength={4000}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              session ? 'Điều gì đang ở trong tâm trí bạn?' : 'Đăng nhập để bắt đầu trò chuyện…'
            }
            disabled={!session || busy}
          />
          <button
            className="button primary"
            type="submit"
            aria-label="Gửi tin nhắn"
            disabled={!session || busy || !input.trim()}
          >
            <Send size={17} />
          </button>
        </form>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
      </section>
      <p className="method-note">
        AI có thể nhầm lẫn. Ngữ cảnh lịch được tính từ ngày Việt Nam và chỉ mang tính tham khảo. Hãy
        kiểm tra lại thông tin trước những quyết định quan trọng.
      </p>
    </div>
  );
}
