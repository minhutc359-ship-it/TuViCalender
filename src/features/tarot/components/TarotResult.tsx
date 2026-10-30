import { interpretReading } from '../engine/interpretation';
import type { Reading } from '../engine/reading';
import { TarotCard3D } from './TarotCard3D';
import type { TarotCard } from '../data/cards';
import { useTarotAppearance } from '../context/TarotAppearance';
import { JOJO_BY_CARD } from '../data/appearance';
import { ReadingMethod } from './ReadingMethod';

export function TarotResult({
  reading,
  onInspect,
}: {
  reading: Reading;
  onInspect?: (card: TarotCard) => void;
}) {
  const result = interpretReading(reading);
  const { appearance } = useTarotAppearance();
  return (
    <div className="reading-result" data-interpretation-version={result.version}>
      <div className="result-intro">
        <span className="eyebrow">✦ LUẬN GIẢI OFFLINE · RWS</span>
        <h2>Lắng nghe những điều đang mở ra</h2>
        {reading.question && <p>“{reading.question}”</p>}
        <p className="reading-topic-badge">
          {result.topic.label} · {result.topicReason}
        </p>
      </div>
      <section className="reading-overview panel">
        <span className="eyebrow">TRỌNG TÂM CÂU HỎI</span>
        <h3>Một cách tiếp cận tình huống</h3>
        <p>{result.overview}</p>
      </section>
      <div className="interpretations">
        {result.cards.map((item, index) => {
          const reference = appearance === 'jojo-ref' ? JOJO_BY_CARD.get(item.card.id) : undefined;
          return (
            <article className="interpretation panel" key={item.card.id}>
              <TarotCard3D
                card={item.drawn}
                revealed
                onClick={onInspect ? () => onInspect(item.card) : undefined}
              />
              <div>
                <span className="eyebrow">
                  {String(index + 1).padStart(2, '0')} · {item.position}
                </span>
                <h3>
                  {item.card.nameVi}{' '}
                  <span className="orientation">{item.drawn.reversed ? 'Ngược' : 'Xuôi'}</span>
                </h3>
                <p className="card-english">{item.card.name}</p>
                {reference && (
                  <p className="jojo-reference-caption">
                    <strong>{reference.stand}</strong> · {reference.user}
                  </p>
                )}
                <div className="keyword-row">
                  {item.keywords.map((k) => (
                    <span key={k}>{k}</span>
                  ))}
                </div>
                <p>{item.meaning}</p>
                <div className="card-context">
                  {item.context !== item.meaning && (
                    <>
                      <h4>Theo chủ đề {result.topic.label.toLocaleLowerCase('vi')}</h4>
                      <p>{item.context}</p>
                    </>
                  )}
                  <h4>Cách đọc ở vị trí “{item.position}”</h4>
                  <p>{item.positionMeaning}</p>
                </div>
                <div className="card-practice">
                  <strong>Việc có thể thử</strong>
                  <p>{item.action}</p>
                </div>
                <details className="reflection-question">
                  <summary>Câu hỏi tự đối chiếu</summary>
                  <p>{item.reflection}</p>
                </details>
              </div>
            </article>
          );
        })}
      </div>
      <section className="synthesis panel">
        <span className="eyebrow">KẾT NỐI CÁC LÁ & HƯỚNG HÀNH ĐỘNG</span>
        <h3>Một góc nhìn để mang theo</h3>
        {result.patterns.length > 0 && (
          <div className="reading-patterns">
            {result.patterns.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        )}
        <div className="reading-connections">
          {result.connections.map((connection, i) => (
            <article key={i}>
              <h4>{connection.title}</h4>
              <span className="small gold">{connection.cards}</span>
              <p>{connection.text}</p>
              <p>{connection.application}</p>
            </article>
          ))}
        </div>
        <div className="reading-plan">
          <h4>
            {result.actions.length > 1 ? 'Các bước bạn có thể chủ động' : 'Một bước nhỏ để thử'}
          </h4>
          <ol>
            {result.actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ol>
        </div>
        {result.limits.map((limit) => (
          <p className="reading-limit" key={limit}>
            {limit}
          </p>
        ))}
        <p className="synthesis-method">
          Bộ quy tắc {result.version} · Tính tại thiết bị · Không cần mạng hoặc API AI. Nội dung
          định hướng tự suy ngẫm, không xác nhận sự kiện hay dự báo chắc chắn.
        </p>
      </section>
      <ReadingMethod />
    </div>
  );
}
