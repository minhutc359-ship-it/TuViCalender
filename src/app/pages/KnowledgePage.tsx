import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  KNOWLEDGE,
  KNOWLEDGE_VERSION,
  searchKnowledge,
  useKnowledge,
  loadKnowledge,
  missingKnowledgePacks,
} from '../../features/knowledge/catalog';
import { useStoredState } from '../../lib/storage';
import { KnowledgeWheel } from '../../features/knowledge/KnowledgeWheel';
export default function KnowledgePage() {
  useKnowledge();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void loadKnowledge().finally(() => setLoading(false));
  }, []);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [limit, setLimit] = useState(24);
  const [saved, setSaved, error] = useStoredState<string[]>(
    'astroai.bookmarks.v1',
    [],
    (v): v is string[] =>
      Array.isArray(v) &&
      v.every((id) => typeof id === 'string' && /^[a-zA-Z0-9-]{1,100}$/.test(id)),
  );
  const focused = KNOWLEDGE.find((e) => e.id === params.get('id'));
  const results = (
    focused ? [focused] : query ? searchKnowledge(query, KNOWLEDGE.length) : KNOWLEDGE
  ).filter(
    (e) =>
      category === 'all' ||
      e.category === category ||
      (category === 'saved' && saved.includes(e.id)),
  );
  return (
    <div className="knowledge-page page-enter">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ĐÔNG · TÂY · TAROT</span>
          <h1>
            Thư viện chiêm nghiệm<span className="gold">.</span>
          </h1>
          <p>
            {KNOWLEDGE.length} mục tra cứu tại máy · {KNOWLEDGE_VERSION}
          </p>
        </div>
      </div>
      {focused && (
        <Link className="button subtle" to="/knowledge">
          Xem toàn bộ thư viện
        </Link>
      )}
      {!focused && (
        <section className="knowledge-atlas" aria-label="Lối vào thư viện Đông và Tây">
          <button
            type="button"
            className={`knowledge-atlas-card panel ${category === 'eastern' ? 'selected' : ''}`}
            aria-pressed={category === 'eastern'}
            onClick={() => {
              setParams({});
              setQuery('');
              setCategory('eastern');
              setLimit(24);
            }}
          >
            <img
              src="/assets/illustrations/eastern-knowledge.webp"
              alt="La bàn Bát quái và vòng Ngũ hành trong sân trăng"
              loading="lazy"
              decoding="async"
            />
            <span>
              <small>NGŨ HÀNH · CAN CHI · BÁT QUÁI</small>
              <strong>Kho tri thức Đông phương</strong>
              <em>Khám phá nội dung</em>
            </span>
          </button>
          <button
            type="button"
            className={`knowledge-atlas-card panel ${category === 'western' ? 'selected' : ''}`}
            aria-pressed={category === 'western'}
            onClick={() => {
              setParams({});
              setQuery('');
              setCategory('western');
              setLimit(24);
            }}
          >
            <img
              src="/assets/illustrations/western-atlas.webp"
              alt="Vòng hoàng đạo và quỹ đạo hành tinh trên bản đồ sao cổ"
              loading="lazy"
              decoding="async"
            />
            <span>
              <small>ZODIAC · HÀNH TINH · BIỂU TƯỢNG</small>
              <strong>Atlas chiêm tinh Tây phương</strong>
              <em>Khám phá nội dung</em>
            </span>
          </button>
        </section>
      )}
      <KnowledgeWheel onSelect={id=>{setParams({id});setQuery('');setCategory('all');setLimit(24);}} />
      <div className="knowledge-filters panel">
        <label>
          Tìm nội dung
          <input
            type="search"
            value={query}
            onChange={(e) => {
              if (params.has('id')) setParams({});
              setQuery(e.target.value);
              setLimit(24);
            }}
            placeholder="Tên lá bài, ngũ hành, cung hoàng đạo…"
          />
        </label>
        <label>
          Nhóm nội dung
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setLimit(24);
            }}
          >
            <option value="all">Tất cả</option>
            <option value="eastern">Đông phương</option>
            <option value="western">Tây phương</option>
            <option value="tarot">Tarot</option>
            <option value="guide">Hướng dẫn</option>
            <option value="saved">Đã lưu</option>
          </select>
        </label>
      </div>
      <p role="status" className="small muted">
        {results.length} kết quả · Có sẵn trong ứng dụng, không cần AI.
      </p>
      {error && <p role="alert">Chưa lưu được bookmark trên thiết bị.</p>}
      <div className="knowledge-grid">
        {results.slice(0, limit).map((entry) => (
          <article key={entry.id} className="knowledge-entry panel" id={entry.id}>
            <h2>{entry.title}</h2>
            <p>{entry.content}</p>
            <small className="muted">Nguồn nội bộ: {entry.source}</small>
            <button
              className="button subtle"
              aria-pressed={saved.includes(entry.id)}
              onClick={() =>
                setSaved(
                  saved.includes(entry.id)
                    ? saved.filter((id) => id !== entry.id)
                    : [...saved, entry.id],
                )
              }
            >
              {saved.includes(entry.id) ? 'Bỏ lưu' : 'Lưu nội dung'}
            </button>
          </article>
        ))}
      </div>
      {results.length > limit && (
        <button className="button primary" onClick={() => setLimit(limit + 24)}>
          Xem thêm nội dung
        </button>
      )}
      {loading && <p role="status">Đang đọc các gói kiến thức…</p>}
      {!loading && missingKnowledgePacks().length > 0 && (
        <p className="knowledge-pack-notice" role="status">
          Một số gói chưa có tại máy hoặc đã bị trình duyệt dọn.{' '}
          <Link className="text-link" to="/settings">
            Tải pack kiến thức
          </Link>{' '}
          để tra cứu đầy đủ khi offline.
        </p>
      )}
      {!loading && !results.length && (
        <p>Chưa có nội dung phù hợp tại máy. Hãy tải pack còn thiếu hoặc thử từ khóa khác.</p>
      )}
      <p className="method-note">
        Nội dung truyền thống và chiêm nghiệm, không phải dự đoán khoa học.{' '}
        <Link className="text-link" to="/chat">
          Hỏi trợ lý local
        </Link>{' '}
        để tra lịch và các câu hỏi có dữ liệu. Nguồn và giới hạn nằm trong từng mục.
      </p>
    </div>
  );
}
