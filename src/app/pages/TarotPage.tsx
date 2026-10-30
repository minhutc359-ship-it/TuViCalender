import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import {
  Sparkles,
  ArrowUpRight,
  BookOpen,
  RotateCcw,
  Check,
  Bookmark,
  Search,
  Trash2,
  ArrowLeft,
  Settings,
} from 'lucide-react';
import { TAROT_CARDS, CARD_MAP, type TarotCard, type Suit } from '../../features/tarot/data/cards';
import { SPREADS, getSpread, type SpreadId } from '../../features/tarot/data/spreads';
import { useTarotSession } from '../../features/tarot/hooks/useTarotSession';
import { TarotCard3D } from '../../features/tarot/components/TarotCard3D';
import { TarotDeck } from '../../features/tarot/components/TarotDeck';
import { TarotResult } from '../../features/tarot/components/TarotResult';
import { JOURNAL_KEY, isReadings, type Reading } from '../../features/tarot/engine/reading';
import { useStoredState } from '../../lib/storage';
import { getActiveProfile } from '../../lib/profiles';
import { Modal } from '../components/Modal';
import { ZodiacWheel } from '../components/astro/AstroWheels';
import { AstroSymbol } from '../components/astro/AstroSymbol';
import { TarotArtwork } from '../../features/tarot/components/TarotArtwork';
import { useTarotAppearance } from '../../features/tarot/context/TarotAppearance';
import { JOJO_BY_CARD } from '../../features/tarot/data/appearance';
import { ReadingMethod } from '../../features/tarot/components/ReadingMethod';
import {
  READING_TOPICS,
  resolveReadingTopic,
  type TopicSelection,
} from '../../features/tarot/data/reading-topics';

export default function TarotPage() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<'reading' | 'library' | 'journal'>('reading');
  const [spreadId, setSpreadId] = useState<SpreadId>(
    () => getSpread(params.get('spread') ?? 'three').id,
  );
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState<TopicSelection>('auto');
  const [allowReversed, setAllowReversed] = useState(true);
  const [journal, setJournal, storageError] = useStoredState<Reading[]>(
    JOURNAL_KEY,
    [],
    isReadings,
  );
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');
  const [suit, setSuit] = useState<Suit | 'all'>('all');
  const [inspect, setInspect] = useState<TarotCard | null>(null);
  const [opened, setOpened] = useState<Reading | null>(null);
  const session = useTarotSession();
  const { appearance } = useTarotAppearance();
  const heroIndices = appearance === 'jojo-ref' ? [0, 21, 17] : [0, 1, 2];
  const inspectedReference =
    inspect && appearance === 'jojo-ref' ? JOJO_BY_CARD.get(inspect.id) : undefined;
  const navigate = useNavigate();
  const spread = getSpread(session.reading?.spreadId ?? spreadId);
  const selected = session.reading?.cards.length ?? 0;
  const needed = spread.positions.length;
  const saved = journal.some((r) => r.id === session.reading?.id);
  const filtered = TAROT_CARDS.filter(
    (c) =>
      (suit === 'all' || c.suit === suit) &&
      `${c.name} ${c.nameVi} ${c.uprightKeywords.join(' ')} ${c.reversedKeywords.join(' ')} ${appearance === 'jojo-ref' ? `${JOJO_BY_CARD.get(c.id)?.stand ?? ''} ${JOJO_BY_CARD.get(c.id)?.user ?? ''}` : ''}`
        .toLocaleLowerCase('vi')
        .includes(search.toLocaleLowerCase('vi')),
  );
  function saveReading() {
    if (!session.reading) return;
    const reading = { ...session.reading, note };
    setJournal([reading, ...journal.filter((r) => r.id !== reading.id)].slice(0, 200));
  }
  return (
    <div className="tarot-page page-enter">
      <div className="page-heading">
        <div>
          <span className="eyebrow">CHIÊM NGHIỆM · KẾT NỐI · KHÁM PHÁ</span>
          <h1>
            Không gian Tarot<span className="gold">.</span>
          </h1>
          <p>Mỗi lá bài là một góc nhìn. Câu trả lời bắt đầu từ bạn.</p>
        </div>
        <div className="tarot-heading-actions">
          <Link to="/settings" className="button subtle" aria-label="Cài đặt bộ bài">
            <Settings size={16} />
            {appearance === 'jojo-ref' ? 'JoJo ref' : 'Celestial'}
          </Link>
          <button className="button subtle" onClick={() => setTab('journal')}>
            <BookOpen size={17} />
            Nhật ký của bạn <span className="count-badge">{journal.length}</span>
          </button>
        </div>
      </div>
      <div className="page-tabs" role="tablist" aria-label="Không gian Tarot">
        {(
          [
            ['reading', 'Trải bài'],
            ['library', 'Thư viện 78 lá'],
            ['journal', 'Nhật ký'],
          ] as const
        ).map(([id, label]) => (
          <button
            id={`tab-${id}`}
            role="tab"
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            key={id}
            onClick={() => setTab(id)}
          >
            {label}
            {id === 'reading' && <Sparkles size={14} />}
          </button>
        ))}
      </div>
      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'reading' && (
          <>
            {session.phase === 'idle' ? (
              <>
                <section className="tarot-hero panel">
                  <div className="tarot-hero-copy">
                    <span className="eyebrow">
                      <span className="tiny-star">✦</span>{' '}
                      {appearance === 'jojo-ref'
                        ? 'JOJO REF · STARDUST CRUSADERS'
                        : 'CELESTIAL TAROT · HUYỀN TINH'}
                    </span>
                    <h2>
                      Một khoảng lặng.
                      <br />
                      Một điều <em>mở ra.</em>
                    </h2>
                    <p>
                      Hít thở sâu, nghĩ về điều bạn muốn khám phá.
                      <br className="desktop-break" /> Để những vì sao gợi mở một góc nhìn mới.
                    </p>
                    <div className="hero-caption">
                      <span className="line" />
                      {appearance === 'jojo-ref'
                        ? '78 minh họa JoJo · 22 đối ứng Tarot chính thức'
                        : '78 lá bài · Ý nghĩa xuôi & ngược'}
                    </div>
                  </div>
                  <div
                    className="hero-art"
                    aria-label={
                      appearance === 'jojo-ref'
                        ? 'Ba lá bài JoJo ref'
                        : 'Ba lá bài Celestial Tarot từ bộ concept'
                    }
                  >
                    <ZodiacWheel className="tarot-sacred-wheel" />
                    <div className="orbit orbit-one" />
                    <div className="orbit orbit-two" />
                    <span className="orbit-star">✧</span>
                    {heroIndices.map((index, i) => (
                      <div className={`hero-card ${['left', 'right', 'center'][i]}`} key={index}>
                        <TarotArtwork card={TAROT_CARDS[index]} />
                      </div>
                    ))}
                    <span className="art-caption">AS ABOVE, SO WITHIN</span>
                  </div>
                </section>
                <section className="reading-setup">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">01 / CHỌN HÀNH TRÌNH</span>
                      <h2>Bạn muốn khám phá điều gì?</h2>
                    </div>
                    <span className="muted small">Chọn một kiểu trải bài phù hợp với bạn</span>
                  </div>
                  <div className="spread-options">
                    {SPREADS.map((s, index) => (
                      <button
                        key={s.id}
                        className={`spread-option ${spreadId === s.id ? 'selected' : ''}`}
                        onClick={() => setSpreadId(s.id)}
                        aria-pressed={spreadId === s.id}
                      >
                        <span className="spread-top">
                          <span className="spread-icon">
                            <AstroSymbol
                              name={['Sun', 'Moon', 'Venus', 'star', 'compass'][index]}
                              size={25}
                            />
                          </span>
                          <span className="small">{s.short}</span>
                        </span>
                        <strong>{s.name}</strong>
                        <span>{s.description}</span>
                        {spreadId === s.id && <Check className="spread-check" size={15} />}
                      </button>
                    ))}
                  </div>
                  <div className="intention-panel panel">
                    <div>
                      <label htmlFor="tarot-question">
                        02 / ĐẶT MỘT Ý NIỆM <span className="muted">· Không bắt buộc</span>
                      </label>
                      <input
                        id="tarot-question"
                        maxLength={500}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Điều gì đang ở trong tâm trí bạn?"
                      />
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={allowReversed}
                          onChange={(e) => setAllowReversed(e.target.checked)}
                          disabled={spreadId === 'daily'}
                        />
                        {spreadId === 'daily'
                          ? 'Lá hằng ngày có cả xuôi/ngược, giữ nguyên trong ngày'
                          : 'Khám phá cả lá bài ngược'}
                      </label>
                      <div className="reading-topic-selector">
                        <label htmlFor="reading-topic">Chủ đề luận giải offline</label>
                        <select
                          id="reading-topic"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value as TopicSelection)}
                        >
                          <option value="auto">Tự nhận diện từ câu hỏi / kiểu trải</option>
                          {READING_TOPICS.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                        <p className="muted small">
                          {resolveReadingTopic(question, spreadId, topic).reason} · Bạn có thể chọn
                          lại chủ đề.
                        </p>
                      </div>
                    </div>
                    <button
                      className="button primary large"
                      onClick={() => {
                        setNote('');
                        session.start(
                          spreadId,
                          question,
                          allowReversed,
                          getActiveProfile()?.id ?? 'guest',
                          topic,
                        );
                      }}
                    >
                      <Sparkles size={18} />
                      {spreadId === 'daily' ? 'Rút lá hôm nay' : 'Xào bài & bắt đầu'}
                      <ArrowUpRight size={17} />
                    </button>
                  </div>
                </section>
                <div className="ritual-footer">
                  <span>✧</span>
                  <p>
                    Không cần một câu hỏi hoàn hảo.
                    <br />
                    <span className="muted">Chỉ cần một tâm trí rộng mở.</span>
                  </p>
                  <span>✧</span>
                </div>
              </>
            ) : (
              <section className="active-reading altar-stage" data-phase={session.phase}>
                <div className="altar-mandala" aria-hidden="true">
                  <ZodiacWheel />
                </div>
                <div className="section-heading">
                  <button
                    className="button subtle"
                    disabled={session.phase === 'shuffling' || session.phase === 'revealing'}
                    onClick={session.reset}
                  >
                    <ArrowLeft size={16} />
                    Chọn kiểu trải khác
                  </button>
                  <span className="eyebrow">
                    {spread.name} · {needed} lá
                  </span>
                </div>
                <div className="ritual-status" aria-live="polite">
                  <span className="eyebrow">
                    {session.phase === 'shuffling'
                      ? 'KẾT NỐI VỚI BỘ BÀI'
                      : session.phase === 'complete'
                        ? 'HÀNH TRÌNH ĐÃ MỞ RA'
                        : 'LẮNG NGHE TRỰC GIÁC CỦA BẠN'}
                  </span>
                  <h2>
                    {session.phase === 'shuffling'
                      ? 'Đang xào những vì sao…'
                      : session.phase === 'revealing'
                        ? 'Thông điệp đang mở ra…'
                        : session.phase === 'complete'
                          ? 'Những lá bài đã chọn bạn.'
                          : selected === needed
                            ? 'Sẵn sàng mở thông điệp?'
                            : `Chọn ${needed - selected} lá bài dành cho bạn`}
                  </h2>
                  <p>
                    {session.reading?.question ||
                      'Hít thở sâu. Cho mình một khoảnh khắc tĩnh lặng.'}
                  </p>
                </div>
                {session.phase !== 'complete' && (
                  <>
                    {(session.phase === 'shuffling' ||
                      (session.phase === 'picking' && selected < needed)) && (
                      <TarotDeck
                        deck={session.deck}
                        shuffling={session.phase === 'shuffling'}
                        disabled={selected === needed}
                        onChoose={session.choose}
                      />
                    )}
                    <div className={`selected-spread ${needed > 5 ? 'many-cards' : ''}`}>
                      {spread.positions.map((position, i) => (
                        <div className="spread-slot" key={position}>
                          <span className="slot-number">{String(i + 1).padStart(2, '0')}</span>
                          {session.reading?.cards[i] ? (
                            <TarotCard3D
                              card={session.reading.cards[i]}
                              revealed={i < session.revealed}
                            />
                          ) : (
                            <div className="empty-card">
                              <span>✧</span>
                            </div>
                          )}
                          <span className="slot-label">{position}</span>
                        </div>
                      ))}
                    </div>
                    <div className="center-actions">
                      <span className="muted small" aria-live="polite">
                        Đã chọn {selected}/{needed} lá
                      </span>
                      {session.phase === 'picking' && selected === needed && (
                        <button className="button primary large" onClick={session.reveal}>
                          <Sparkles size={18} />
                          Lật bài & khám phá
                        </button>
                      )}
                    </div>
                  </>
                )}
                {session.phase === 'complete' && session.reading && (
                  <>
                    <TarotResult reading={session.reading} onInspect={setInspect} />
                    <div className="center-actions">
                      <button
                        className="button subtle"
                        onClick={() =>
                          navigate('/chat', {
                            state: {
                              prompt: `Hãy giúp tôi tự suy ngẫm về trải bài ${spread.name}. Câu hỏi: ${session.reading!.question || 'Thông điệp dành cho tôi hôm nay'}. Các lá bài: ${session.reading!.cards.map((c, i) => `${spread.positions[i]}: ${CARD_MAP.get(c.cardId)!.name} (${c.reversed ? 'ngược' : 'xuôi'})`).join('; ')}. Hãy kết nối các lá, giải thích giới hạn và gợi ý một hành động thực tế.`,
                            },
                          })
                        }
                      >
                        <Sparkles size={16} />
                        Cùng AI suy ngẫm trải bài
                        <ArrowUpRight size={15} />
                      </button>
                      <span className="muted small">Cần đăng nhập để trò chuyện</span>
                    </div>
                    <div className="journal-save panel">
                      <div>
                        <label htmlFor="reading-note">Cảm nhận của bạn</label>
                        <textarea
                          id="reading-note"
                          maxLength={3000}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Thông điệp nào chạm đến bạn hôm nay?"
                          rows={3}
                        />
                        <p className="muted small">
                          Nhật ký lưu trên trình duyệt này · Tối đa 200 phiên gần nhất.
                        </p>
                      </div>
                      <div className="stack-actions">
                        <button className="button primary" onClick={saveReading}>
                          {saved ? <Check size={17} /> : <Bookmark size={17} />}
                          {saved ? 'Cập nhật nhật ký' : 'Lưu vào nhật ký'}
                        </button>
                        {saved && (
                          <span className="success small" role="status">
                            {storageError ? '' : 'Đã lưu trên thiết bị'}
                          </span>
                        )}
                        <button className="button subtle" onClick={session.reset}>
                          <RotateCcw size={16} />
                          Một hành trình mới
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </section>
            )}
          </>
        )}
        {tab === 'library' && (
          <section className="library-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  {appearance === 'jojo-ref'
                    ? 'JOJO REF · BẢNG ĐỐI ỨNG TAROT'
                    : 'BỘ BÀI HUYỀN TINH'}
                </span>
                <h2>78 cánh cửa để hiểu mình</h2>
              </div>
              <label className="search-field">
                <Search size={17} />
                <input
                  aria-label="Tìm lá bài"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    appearance === 'jojo-ref' ? 'Tên lá, Stand, nhân vật…' : 'Tìm tên, từ khóa…'
                  }
                />
              </label>
            </div>
            <div className="filter-chips">
              {(
                [
                  ['all', 'Tất cả · 78'],
                  ['major', 'Ẩn chính · 22'],
                  ['wands', 'Gậy'],
                  ['cups', 'Cốc'],
                  ['swords', 'Kiếm'],
                  ['pentacles', 'Tiền'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  aria-pressed={suit === id}
                  className={suit === id ? 'active' : ''}
                  onClick={() => setSuit(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="muted small">
              {appearance === 'jojo-ref'
                ? 'Đủ 78 minh họa JoJo. 22 Major là đối ứng Tarot trong truyện; 56 Minor là liên tưởng mỹ thuật, không phải đối ứng chính thức.'
                : 'Ba lá đầu giữ artwork concept; các lá còn lại sử dụng thiết kế biểu tượng Celestial.'}
            </p>
            <div className="library-grid">
              {filtered.map((card) => (
                <button className="library-card" key={card.id} onClick={() => setInspect(card)}>
                  <TarotArtwork card={card} lazy />
                  <strong>{card.nameVi}</strong>
                  <span>{card.name}</span>
                  {appearance === 'jojo-ref' && JOJO_BY_CARD.has(card.id) && (
                    <p className="jojo-library-caption">{JOJO_BY_CARD.get(card.id)!.user}</p>
                  )}
                </button>
              ))}
            </div>
            {!filtered.length && (
              <div className="empty-state">
                <Search />
                <p>Chưa tìm thấy lá bài phù hợp. Thử một từ khóa khác.</p>
              </div>
            )}
          </section>
        )}
        {tab === 'journal' && (
          <section className="journal-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">NHỮNG DẤU MỐC NHỎ</span>
                <h2>Hành trình bạn đã đi qua</h2>
              </div>
              <span className="muted small">{journal.length} phiên · Lưu trên thiết bị này</span>
            </div>
            {!journal.length ? (
              <div className="empty-state panel">
                <BookOpen size={36} />
                <h3>Mỗi hành trình đều bắt đầu từ một lá bài</h3>
                <p>Lưu một trải bài cùng cảm nhận để nhìn lại khi bạn cần.</p>
                <button className="button primary" onClick={() => setTab('reading')}>
                  Bắt đầu trải bài
                  <ArrowUpRight size={17} />
                </button>
              </div>
            ) : (
              <div className="journal-grid">
                {journal.map((r) => (
                  <article className="journal-entry panel" key={r.id}>
                    <div className="journal-entry-top">
                      <span className="eyebrow">{getSpread(r.spreadId).name}</span>
                      <button
                        className="icon-button"
                        aria-label={`Xóa phiên ngày ${new Date(r.createdAt).toLocaleDateString('vi-VN')}`}
                        onClick={() => setJournal(journal.filter((x) => x.id !== r.id))}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <button className="journal-open" onClick={() => setOpened(r)}>
                      <div className="journal-thumbnails">
                        {r.cards.map((c) => (
                          <TarotArtwork
                            key={c.cardId}
                            card={CARD_MAP.get(c.cardId)!}
                            reversed={c.reversed}
                            lazy
                          />
                        ))}
                      </div>
                      <h3>{r.question || 'Một khoảng lặng dành cho mình'}</h3>
                      <p>
                        {r.note || 'Xem lại thông điệp của trải bài'}
                        <ArrowUpRight size={15} />
                      </p>
                      <time>
                        {new Date(r.createdAt).toLocaleString('vi-VN', {
                          timeZone: 'Asia/Ho_Chi_Minh',
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </time>
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
      {storageError && (
        <p className="error-message" role="alert">
          Trình duyệt không cho phép lưu. Dữ liệu hiện chỉ tồn tại trong phiên này.
        </p>
      )}
      {inspect && (
        <Modal title={inspect.nameVi} onClose={() => setInspect(null)}>
          <div className="card-detail">
            <TarotArtwork card={inspect} />
            <div>
              <span className="eyebrow">{inspect.name}</span>
              {inspectedReference && (
                <div className="jojo-inspect-reference">
                  <h3>{inspectedReference.stand}</h3>
                  <p>Người sử dụng: {inspectedReference.user}</p>
                  <p className="small">
                    {inspectedReference.association === 'canonical'
                      ? 'Đối ứng Tarot trong Stardust Crusaders'
                      : 'Liên tưởng mỹ thuật do ứng dụng chọn · Không phải đối ứng Tarot trong truyện'}
                  </p>
                  <a
                    className="text-link small"
                    href={inspectedReference.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Xem tham chiếu nhân vật
                  </a>
                </div>
              )}
              <h3>Thông điệp xuôi</h3>
              <div className="keyword-row">
                {inspect.uprightKeywords.map((k) => (
                  <span key={k}>{k}</span>
                ))}
              </div>
              <p>{inspect.upright}</p>
              <h3>Thông điệp ngược</h3>
              <div className="keyword-row">
                {inspect.reversedKeywords.map((k) => (
                  <span key={k}>{k}</span>
                ))}
              </div>
              <p>{inspect.reversed}</p>
            </div>
          </div>
          <ReadingMethod />
        </Modal>
      )}
      {opened && (
        <Modal title="Nhìn lại trải bài" onClose={() => setOpened(null)}>
          <TarotResult reading={opened} />
          <label htmlFor="journal-note">Ghi chú của bạn</label>
          <textarea
            id="journal-note"
            maxLength={3000}
            rows={4}
            value={opened.note}
            onChange={(e) => setOpened({ ...opened, note: e.target.value })}
          />
          <button
            className="button primary"
            onClick={() => {
              setJournal(journal.map((r) => (r.id === opened.id ? opened : r)));
              setOpened(null);
            }}
          >
            Lưu ghi chú
          </button>
        </Modal>
      )}
    </div>
  );
}
