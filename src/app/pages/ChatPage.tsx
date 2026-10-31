import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router';
import { Send, LogOut, Trash2, Sparkles } from 'lucide-react';
import { chatWithAI, isOpenAIConfigured, type AIMessage } from '../../lib/openai';
import { supabase } from '../../lib/supabase';
import { readStorage, writeStorage, useStoredState } from '../../lib/storage';
import { CHAT_PERSONAS, isChatPersona, type ChatPersona } from '../../lib/chat-personas';
import { AstroSymbol } from '../components/astro/AstroSymbol';
import { validMessages } from '../../features/chatbot/messages';
import { loadKnowledge } from '../../features/knowledge/catalog';
import { deviceStorage } from '../../offline/db';
import { replyHybrid, SOURCE_LABELS } from '../../features/chatbot/engine';
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
  const [messages, setMessages] = useState<AIMessage[]>(() =>
    readStorage('astroai.chat.local.v1', [welcomeFor(persona)], validMessages),
  );
  const [aiEnabled, setAIEnabled] = useStoredState(
    'astroai.chat-ai-enabled.v1',
    false,
    (v): v is boolean => typeof v === 'boolean',
  );
  const [saveHistory, setSaveHistory] = useStoredState(
    'astroai.chat-save.v1',
    true,
    (v): v is boolean => typeof v === 'boolean',
  );
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
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
      const history = readStorage<AIMessage[]>(
        next ? `astroai.chat.${next.user.id}.v1` : 'astroai.chat.local.v1',
        [welcomeFor(personaRef.current)],
        validMessages,
      );
      setMessages(history);
      messagesRef.current = history;
    }
    supabase.auth
      .getSession()
      .then(({ data }) => change(data.session))
      .catch(() => {
        if (mounted.current) setNotice('Chưa đọc được phiên AI. Tra cứu local vẫn sẵn sàng.');
      });
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
    if (!content || busy) return;
    const owner = session?.user.id ?? null;
    setBusy(true);
    setError('');
    const history = messagesRef.current;
    const next = [...history, { role: 'user', content } as AIMessage].slice(-100);
    messagesRef.current = next;
    setMessages(next);
    setInput('');
    try {
      await loadKnowledge();
      const response = await replyHybrid(content, {
        aiEnabled: aiEnabled && configured && !!session,
        online,
        ai: (signal) =>
          chatWithAI(
            content,
            history.filter((m) => !isWelcome(m)),
            persona,
            signal,
          ),
      });
      if (!mounted.current || userIdRef.current !== owner) return;
      const updated = [
        ...next,
        { role: 'assistant', content: response.content, response, persona } as AIMessage,
      ].slice(-100);
      setMessages(updated);
      messagesRef.current = updated;
      if (
        saveHistory &&
        !writeStorage(owner ? `astroai.chat.${owner}.v1` : 'astroai.chat.local.v1', updated)
      )
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
    if (
      !writeStorage(session ? `astroai.chat.${session.user.id}.v1` : 'astroai.chat.local.v1', [
        welcomeFor(persona),
      ])
    )
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
          <h3>Thư viện local đã sẵn sàng</h3>
          <p>
            Tra cứu ngay trong ô chat, không cần đăng nhập hoặc kết nối AI. Bạn cũng có thể{' '}
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
              Tra cứu local không cần đăng nhập. Đăng nhập qua email nếu muốn bật AI online; chỉ câu
              hỏi và lịch sử chat gần đây được gửi khi thư viện chưa đủ nội dung.
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
      <div className="local-chat-options panel">
        <label>
          <input
            type="checkbox"
            checked={aiEnabled}
            onChange={(e) => setAIEnabled(e.target.checked)}
          />{' '}
          Cho phép AI online khi local chưa có câu trả lời
        </label>
        <label>
          <input
            type="checkbox"
            checked={saveHistory}
            onChange={(e) => {
              setSaveHistory(e.target.checked);
              if (!e.target.checked) {
                try {
                  deviceStorage.removeItem(
                    session ? `astroai.chat.${session.user.id}.v1` : 'astroai.chat.local.v1',
                  );
                } catch {
                  setError('Chưa xóa được lịch sử đã lưu.');
                }
              }
            }}
          />{' '}
          Lưu lịch sử chat trên thiết bị
        </label>
        {aiEnabled && (!configured || !session) && (
          <p className="small muted">
            AI online cần cấu hình và đăng nhập. Tra cứu local vẫn hoạt động.
          </p>
        )}
      </div>
      <section className="chat-panel panel">
        <div className="chat-status">
          <div>
            <Sparkles
              size={13}
              style={{ display: 'inline', marginRight: 7, color: 'var(--gold)' }}
            />
            {voice.name} · {online ? 'Local sẵn sàng' : 'Đang offline · Local sẵn sàng'}
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
              {m.response && (
                <div className="chat-answer-meta">
                  <small className="chat-source">{SOURCE_LABELS[m.response.source]}</small>
                  {m.response.references?.map((ref) => (
                    <small key={ref.id}>Nguồn: {ref.title}</small>
                  ))}
                  <div className="chat-answer-actions">
                    {m.response.actions?.map((action) => (
                      <Link key={action.route} className="button subtle" to={action.route}>
                        {action.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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
        <p className="small muted" style={{ padding: '0 20px' }}>
          <Link className="text-link" to="/knowledge">
            Tra cứu thư viện Đông–Tây và Tarot
          </Link>
        </p>
        <form className="chat-input" onSubmit={send}>
          <input
            aria-label="Tin nhắn cho trợ lý"
            maxLength={4000}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'Hỏi về lịch, cung hoàng đạo, ngũ hành hoặc một lá Tarot…'}
            disabled={busy}
          />
          <button
            className="button primary"
            type="submit"
            aria-label="Gửi tin nhắn"
            disabled={busy || !input.trim()}
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
        Local dùng quy tắc và nội dung biên soạn sẵn; AI online chỉ hoạt động khi bạn cho phép.
        Nguồn được ghi ở từng câu trả lời. Nội dung truyền thống/chiêm nghiệm không thay thế tư vấn
        chuyên môn.
      </p>
    </div>
  );
}
