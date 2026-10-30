import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router';
import { Send, LogOut, Trash2, Sparkles } from 'lucide-react';
import { chatWithAI, isOpenAIConfigured, type AIMessage } from '../../lib/openai';
import { supabase } from '../../lib/supabase';
import { readStorage, writeStorage, useStoredState } from '../../lib/storage';
import { CHAT_PERSONAS, isChatPersona, type ChatPersona } from '../../lib/chat-personas';
import { AstroSymbol } from '../components/astro/AstroSymbol';
import type { Session } from '@supabase/supabase-js';
const welcome: AIMessage = {
  role: 'assistant',
  content:
    'Chào bạn. Đây là một không gian để cùng nhìn lại, đặt câu hỏi và khám phá chiêm tinh, lịch Việt Nam hay thông điệp Tarot. Hôm nay bạn muốn bắt đầu từ đâu?',
};
const welcomeFor = (persona: ChatPersona): AIMessage => ({
  role: 'assistant',
  content: CHAT_PERSONAS[persona].welcome,
  persona,
});
const isWelcome = (m: AIMessage) =>
  m.role === 'assistant' &&
  (m.content === welcome.content ||
    m.content === CHAT_PERSONAS.eastern.welcome ||
    m.content === CHAT_PERSONAS.western.welcome);
const validMessages = (value: unknown): value is AIMessage[] =>
  Array.isArray(value) &&
  value.length <= 100 &&
  value.every(
    (m) =>
      m &&
      (m.role === 'user' || m.role === 'assistant') &&
      (m.persona === undefined || isChatPersona(m.persona)) &&
      typeof m.content === 'string' &&
      m.content.length <= 12000,
  );
export default function ChatPage() {
  const location = useLocation();
  const [persona, setPersona, personaStorageError] = useStoredState<ChatPersona>(
    'astroai.chat-persona.v1',
    location.state?.prompt ? 'western' : 'eastern',
    isChatPersona,
  );
  const personaRef = useRef(persona);
  const voice = CHAT_PERSONAS[persona];
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([welcomeFor(persona)]);
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
        ? readStorage<AIMessage[]>(
            `astroai.chat.${next.user.id}.v1`,
            [welcomeFor(personaRef.current)],
            validMessages,
          )
        : [welcomeFor(personaRef.current)];
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
        history.filter((m) => !isWelcome(m)),
        persona,
      );
      if (!mounted.current || userIdRef.current !== owner) return;
      const updated = [...next, { role: 'assistant', content: reply, persona } as AIMessage].slice(
        -100,
      );
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
  function changePersona(next: ChatPersona) {
    if (busy) return;
    setPersona(next);
    personaRef.current = next;
    if (messagesRef.current.length === 1 && isWelcome(messagesRef.current[0])) {
      const opening = [welcomeFor(next)];
      setMessages(opening);
      messagesRef.current = opening;
    }
  }
  function clear() {
    setMessages([welcomeFor(persona)]);
    messagesRef.current = [welcomeFor(persona)];
    if (session && !writeStorage(`astroai.chat.${session.user.id}.v1`, [welcomeFor(persona)]))
      setError('Không thể xóa lịch sử đã lưu trên trình duyệt.');
  }
  return (
    <div className={`chat-layout page-enter persona-${persona}`}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">CÙNG BẠN ĐẶT NHỮNG CÂU HỎI</span>
          <h1>
            Người bạn từ những vì sao<span className="gold">.</span>
          </h1>
          <p>Khám phá những góc nhìn mới cùng trợ lý AstroAI.</p>
        </div>
      </div>
      <div className="persona-options" aria-label="Góc nhìn trợ lý AI">
        {(['eastern', 'western'] as const).map((id) => (
          <button
            key={id}
            className={`persona-option panel persona-${id} ${persona === id ? 'selected' : ''}`}
            aria-pressed={persona === id}
            disabled={busy}
            onClick={() => changePersona(id)}
          >
            <span className="persona-avatar">
              <AstroSymbol name={CHAT_PERSONAS[id].icon} size={36} />
            </span>
            <span>
              <strong>{CHAT_PERSONAS[id].name}</strong>
              <small>{CHAT_PERSONAS[id].subtitle}</small>
            </span>
            <i aria-hidden="true" />
          </button>
        ))}
      </div>
      {personaStorageError && (
        <p className="error-message" role="alert">
          Không thể lưu góc nhìn. Lựa chọn chỉ áp dụng trong phiên hiện tại.
        </p>
      )}
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
            {voice.name} · {session ? session.user.email : 'Góc nhìn để tham khảo'}
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
                  setMessages([welcomeFor(persona)]);
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
            <div
              key={i}
              className={`chat-bubble ${m.role === 'user' ? 'user' : `voice-${m.persona ?? 'neutral'}`}`}
            >
              {m.role === 'assistant' && (
                <span className="eyebrow">
                  <AstroSymbol
                    name={m.persona ? CHAT_PERSONAS[m.persona].icon : 'fusion'}
                    size={15}
                  />
                  {m.persona ? CHAT_PERSONAS[m.persona].name : 'ASTROAI'}
                </span>
              )}
              {m.content}
            </div>
          ))}
          {busy && (
            <div className="chat-bubble">
              <span className="constellation-loader" role="status" aria-label="Đang suy ngẫm">
                <svg viewBox="0 0 100 30" aria-hidden="true">
                  <path d="M5 20 30 6 55 24 78 5 95 17" />
                  {[
                    [5, 20],
                    [30, 6],
                    [55, 24],
                    [78, 5],
                    [95, 17],
                  ].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="2.5" />
                  ))}
                </svg>
                <small>Đang kết nối những góc nhìn…</small>
              </span>
            </div>
          )}
          <div ref={end} />
        </div>
        {messages.length === 1 && (
          <div className="chat-quick">
            {voice.prompts.map((q) => (
              <button key={q.text} onClick={() => setInput(q.text)}>
                <AstroSymbol name={q.icon} size={22} />
                <span>{q.text}</span>
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
