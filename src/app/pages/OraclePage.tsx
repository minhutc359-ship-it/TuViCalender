import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { Coins, RotateCcw } from 'lucide-react';
import {
  castOracle,
  describeCast,
  isOracleCast,
  type OracleCast,
  type OracleLine,
} from '../../features/oracle/engine';
import { useStoredState } from '../../lib/storage';

const LINE_LABELS: Record<OracleLine, string> = {
  6: 'Lão âm · hào động',
  7: 'Thiếu dương',
  8: 'Thiếu âm',
  9: 'Lão dương · hào động',
};

export default function OraclePage() {
  const [question, setQuestion] = useState('');
  const [history, setHistory, storageError] = useStoredState<OracleCast[]>(
    'astroai.oracle.v1',
    [],
    (value): value is OracleCast[] => Array.isArray(value) && value.every(isOracleCast),
  );
  const [active, setActive] = useState<OracleCast | null>(history[0] ?? null);
  const result = active ? describeCast(active) : null;
  const makeCast = () => {
    const next = castOracle(question);
    setActive(next);
    setHistory([next, ...history.filter((item) => item.id !== next.id)].slice(0, 30));
  };
  return (
    <div className="oracle-page page-enter">
      <div className="page-heading">
        <div>
          <span className="eyebrow">BÁT QUÁI · SÁU HÀO · OFFLINE</span>
          <h1>Gieo quẻ để tự soi chiếu<span className="gold">.</span></h1>
          <p>Một nghi thức ngẫu nhiên có ghi rõ giới hạn, không phải lời tiên tri.</p>
        </div>
        <Link className="button subtle" to="/knowledge">Mở thư viện nguồn</Link>
      </div>
      <section className="oracle-stage panel">
        <div className="oracle-copy">
          <span className="eyebrow">ĐẶT MỘT CÂU HỎI MỞ</span>
          <h2>Điều gì đang cần được nhìn từ hai phía?</h2>
          <textarea
            value={question}
            maxLength={300}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ví dụ: Tôi có thể chủ động điều gì trong tuần này?"
          />
          <button className="button primary large oracle-cast-button" onClick={makeCast}>
            <Coins size={18} /> {active ? 'Gieo quẻ mới' : 'Gieo sáu hào'}
          </button>
          <p className="small muted">Web Crypto tạo sáu kết quả tại thiết bị. Không gửi câu hỏi lên máy chủ.</p>
        </div>
        <img
          src="/assets/anime/eastern/element-earth.webp"
          alt="Người giữ quẻ Thổ bên la bàn Bát quái trong minh hoạ anime nguyên bản"
          loading="eager"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = '/assets/illustrations/eastern-knowledge.webp';
          }}
        />
      </section>
      {result && active && (
        <section className="oracle-result panel" aria-live="polite">
          <div className="oracle-lines" aria-label="Sáu hào, đọc từ dưới lên">
            {[...active.lines].reverse().map((line, reverseIndex) => {
              const index = 5 - reverseIndex;
              const yang = line === 7 || line === 9;
              return (
                <div className={`oracle-line ${yang ? 'yang' : 'yin'} ${line === 6 || line === 9 ? 'moving' : ''}`} key={index} style={{ '--line-index': reverseIndex } as CSSProperties}>
                  <span>{index + 1}</span>
                  <i />{!yang && <b />}
                  <small>{LINE_LABELS[line]}</small>
                </div>
              );
            })}
            <p className="small muted">Hào 1 ở dưới, hào 6 ở trên.</p>
          </div>
          <div className="oracle-reading">
            <span className="eyebrow">CẤU TRÚC BIỂU TƯỢNG</span>
            <h2>{result.upper.symbol} {result.upper.name} trên · {result.lower.symbol} {result.lower.name} dưới</h2>
            {active.question && <blockquote>“{active.question}”</blockquote>}
            <article>
              <h3>Ngoại cảnh · {result.upper.image}</h3>
              <p>{result.upper.reflection}</p>
            </article>
            <article>
              <h3>Nội lực · {result.lower.image}</h3>
              <p>{result.lower.reflection}</p>
            </article>
            {result.changing.length > 0 ? (
              <article className="oracle-change">
                <h3>Hào động {result.changing.join(', ')}</h3>
                <p>Nếu đổi các hào động, cấu trúc chuyển thành {result.changedUpper.name} trên · {result.changedLower.name} dưới. Hãy xem đây là lời nhắc kiểm tra điều gì có thể thay đổi, không phải kết luận về tương lai.</p>
              </article>
            ) : <p className="muted">Không có hào động: ưu tiên quan sát cấu trúc hiện tại trước khi đổi hướng.</p>}
            <div className="oracle-actions">
              <strong>Ba bước tham khảo</strong>
              <ol>
                <li>Viết một dữ kiện đang có và một giả định chưa kiểm chứng.</li>
                <li>Chọn một hành động nhỏ, an toàn và có thể hoàn tác.</li>
                <li>Đặt thời điểm nhìn lại sau khi có phản hồi thực tế.</li>
              </ol>
            </div>
            <p className="method-note">AstroAI chỉ ghép hai quái và đánh dấu hào động; chưa gán tên/số 64 quẻ King Wen và không dịch Hào từ. Phần lời khuyên là biên tập tự soi chiếu của ứng dụng.</p>
          </div>
        </section>
      )}
      {history.length > 0 && (
        <section className="oracle-history">
          <div className="section-heading"><div><span className="eyebrow">LƯU TẠI THIẾT BỊ</span><h2>Các lần gieo gần đây</h2></div></div>
          <div className="oracle-history-list">
            {history.slice(0, 6).map((cast) => {
              const summary = describeCast(cast);
              return <button key={cast.id} aria-pressed={active?.id === cast.id} onClick={() => setActive(cast)}><RotateCcw size={14} /><span>{summary.upper.name} / {summary.lower.name}<small>{cast.question || 'Không ghi câu hỏi'}</small></span></button>;
            })}
          </div>
        </section>
      )}
      {storageError && <p role="alert">Chưa lưu được lịch sử gieo quẻ trên thiết bị này.</p>}
    </div>
  );
}
