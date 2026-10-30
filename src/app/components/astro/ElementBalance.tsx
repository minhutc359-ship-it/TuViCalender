import { CAN_TO_NGU_HANH } from '../../../lib/lunar';
import { AstroSymbol } from './AstroSymbol';
const elements = ['Mộc', 'Hỏa', 'Thổ', 'Kim', 'Thủy'];
export function ElementBalance({ pillars }: { pillars: Record<string, string | undefined> }) {
  const stems = Object.values(pillars)
    .filter(Boolean)
    .map((p) => p!.split(' ')[0]);
  const counts = elements.map(
    (element) => stems.filter((stem) => CAN_TO_NGU_HANH[stem] === element).length,
  );
  return (
    <div className="element-balance">
      <div className="element-balance-title">
        <span className="eyebrow">DẤU ẤN NGŨ HÀNH</span>
        <h3>Thiên can trong các trụ</h3>
        <p>Đếm {stems.length} thiên can đã có; mỗi can tương ứng một hành.</p>
      </div>
      <div className="element-balance-grid">
        {elements.map((element, i) => (
          <div className="element-count" data-element={element} key={element}>
            <AstroSymbol name={element} size={25} />
            <span>{element}</span>
            <strong>{counts[i]}</strong>
            <div className="element-count-track">
              <i style={{ width: `${(counts[i] / Math.max(1, stems.length)) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="small muted">
        Phân bố biểu tượng từ thiên can, chưa bao gồm địa chi, tàng can hoặc sức mạnh theo mùa;
        không phải đánh giá vượng suy Bát tự.
      </p>
    </div>
  );
}
