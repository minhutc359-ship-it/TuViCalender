import { useState } from 'react';
import { AstroSymbol } from '../../app/components/astro/AstroSymbol';
import { BAT_QUAI, ZODIAC_SIGNS, ZODIAC_VN } from '../../lib/astrology';
export function KnowledgeWheel({ onSelect }: { onSelect: (id: string) => void }) {
  const [mode, setMode] = useState<'elements' | 'bagua' | 'zodiac'>('elements');
  const elements = ['Mộc', 'Hỏa', 'Thổ', 'Kim', 'Thủy'];
  const nodes =
    mode === 'elements'
      ? elements.map((name, i) => ({ name, icon: name, id: `element-${i}` }))
      : mode === 'bagua'
        ? BAT_QUAI.map((q) => ({
            name: `Quẻ ${q.name}`,
            icon: q.name,
            id: `bagua-${q.name === 'Cấn' ? 'can-son' : q.name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace('đ', 'd')}`,
          }))
        : ZODIAC_SIGNS.map((sign) => ({ name: ZODIAC_VN[sign], icon: sign, id: `zodiac-${sign}` }));
  const point = (i: number) => ({
    x: 116 + 88 * Math.sin((i * 2 * Math.PI) / nodes.length),
    y: 116 - 88 * Math.cos((i * 2 * Math.PI) / nodes.length),
  });
  return (
    <section className="knowledge-visual panel" aria-label="Vòng biểu tượng tương tác">
      <div className="knowledge-wheel-tabs" role="group" aria-label="Chọn vòng biểu tượng">
        {(['elements', 'bagua', 'zodiac'] as const).map((id) => (
          <button
            key={id}
            className="button subtle"
            aria-pressed={mode === id}
            onClick={() => setMode(id)}
          >
            {id === 'elements' ? 'Ngũ hành' : id === 'bagua' ? 'Bát quái' : 'Zodiac'}
          </button>
        ))}
      </div>
      <div className="knowledge-diagram">
        <svg viewBox="0 0 232 232" aria-hidden="true">
          <circle cx="116" cy="116" r="88" fill="none" stroke="currentColor" opacity=".35" />
          <circle cx="116" cy="116" r="65" fill="none" stroke="currentColor" opacity=".15" />
          {mode === 'elements' &&
            nodes.map((_, i) => {
              const a = point(i),
                b = point((i + 1) % 5),
                c = point((i + 2) % 5);
              return (
                <g key={i}>
                  <path
                    d={`M${a.x} ${a.y}L${b.x} ${b.y}`}
                    stroke="currentColor"
                    fill="none"
                    opacity=".5"
                  />
                  <path
                    d={`M${a.x} ${a.y}L${c.x} ${c.y}`}
                    stroke="currentColor"
                    strokeDasharray="3 5"
                    fill="none"
                    opacity=".22"
                  />
                </g>
              );
            })}
        </svg>
        <span className="knowledge-wheel-center">
          <AstroSymbol name={mode === 'zodiac' ? 'star' : 'fusion'} size={35} />
        </span>
        {nodes.map((node, i) => (
          <button
            key={node.id}
            className="knowledge-symbol"
            aria-label={`Tra cứu ${node.name}`}
            title={node.name}
            style={{
              left: `calc(${50 + 38 * Math.sin((i * 2 * Math.PI) / nodes.length)}% - 22px)`,
              top: `calc(${50 - 38 * Math.cos((i * 2 * Math.PI) / nodes.length)}% - 22px)`,
            }}
            onClick={() => onSelect(node.id)}
          >
            <AstroSymbol name={node.icon} size={25} />
          </button>
        ))}
      </div>
      <p className="small muted">
        Chọn một biểu tượng để đọc ý nghĩa và nguồn.{' '}
        {mode === 'elements'
          ? 'Vòng ngoài theo thứ tự tương sinh; nét đứt nối các cặp tương khắc.'
          : 'Vòng biểu tượng dùng để tra cứu truyền thống.'}
      </p>
    </section>
  );
}
