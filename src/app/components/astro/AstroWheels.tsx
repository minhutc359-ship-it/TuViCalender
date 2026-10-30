import { ZODIAC_SIGNS, ZODIAC_VN, type ZodiacSign } from '../../../lib/astrology';
import { AstroSymbol } from './AstroSymbol';
import { BAGUA, ELEMENTS } from './symbols';

function point(radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return { x: 200 + radius * Math.cos(radians), y: 200 + radius * Math.sin(radians) };
}

function WheelTicks({ count, radius = 184 }: { count: number; radius?: number }) {
  return (
    <g stroke="currentColor" strokeWidth=".65">
      {Array.from({ length: count }, (_, index) => {
        const major = index % 5 === 0;
        const outer = point(radius, (index * 360) / count);
        const inner = point(radius - (major ? 9 : 4), (index * 360) / count);
        return (
          <line
            key={index}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            opacity={major ? '.7' : '.3'}
          />
        );
      })}
    </g>
  );
}

function Orbit() {
  return (
    <g className="astro-wheel-orbit" fill="none" stroke="currentColor">
      <circle cx="200" cy="200" r="194" strokeWidth=".5" strokeDasharray="1 13" opacity=".45" />
      <ellipse
        cx="200"
        cy="200"
        rx="194"
        ry="181"
        transform="rotate(-28 200 200)"
        strokeWidth=".6"
        opacity=".18"
      />
      <circle cx="200" cy="6" r="3" fill="currentColor" stroke="none" />
      <circle cx="31.99" cy="297" r="2" fill="currentColor" stroke="none" opacity=".7" />
      <circle cx="368.01" cy="297" r="2" fill="currentColor" stroke="none" opacity=".7" />
    </g>
  );
}

/** A decorative symbol wheel. Only the selected Sun sign is highlighted; no planetary chart is inferred. */
export function ZodiacWheel({ sign, className = '' }: { sign?: ZodiacSign; className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={`astro-wheel astro-zodiac-wheel ${className}`.trim()}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <Orbit />
      <g stroke="currentColor">
        <circle cx="200" cy="200" r="184" strokeWidth=".7" opacity=".65" />
        <circle cx="200" cy="200" r="173" strokeWidth=".7" opacity=".4" />
        <circle cx="200" cy="200" r="139" strokeWidth=".7" opacity=".45" />
        <circle cx="200" cy="200" r="96" strokeWidth=".5" opacity=".3" />
        <circle cx="200" cy="200" r="78" strokeWidth=".6" opacity=".25" />
      </g>
      <WheelTicks count={120} />
      {ZODIAC_SIGNS.map((name, index) => {
        const angle = index * 30;
        const symbol = point(155.5, angle);
        const label = point(119, angle);
        const dividerOuter = point(173, angle - 15);
        const dividerInner = point(139, angle - 15);
        const selected = sign === name;
        return (
          <g key={name} data-wheel-sign={name} data-selected={selected || undefined}>
            <path
              d={`M${dividerInner.x} ${dividerInner.y}L${dividerOuter.x} ${dividerOuter.y}`}
              stroke="currentColor"
              strokeWidth=".6"
              opacity=".35"
            />
            {selected && (
              <circle
                cx={symbol.x}
                cy={symbol.y}
                r="17"
                fill="currentColor"
                fillOpacity=".13"
                stroke="currentColor"
                strokeWidth=".7"
              />
            )}
            <g
              transform={`translate(${symbol.x - 11} ${symbol.y - 11})`}
              opacity={sign && !selected ? '.55' : '1'}
            >
              <AstroSymbol name={name} size={22} />
            </g>
            <text
              x={label.x}
              y={label.y + 2.5}
              textAnchor="middle"
              fill="currentColor"
              fontSize="6.8"
              fontFamily="inherit"
              letterSpacing=".4"
              opacity={selected ? '1' : '.6'}
            >
              {ZODIAC_VN[name].toLocaleUpperCase('vi')}
            </text>
          </g>
        );
      })}
      <g className="astro-wheel-center">
        <path
          d="m157 195 28-39 35 23 27-18 9 59-30 23-42-9-27-39Z"
          stroke="currentColor"
          strokeWidth=".65"
          opacity=".35"
        />
        {[
          [157, 195],
          [185, 156],
          [220, 179],
          [247, 161],
          [256, 220],
          [226, 243],
          [184, 234],
        ].map(([x, y], index) => (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={index % 2 ? 1.7 : 2.5}
            fill="currentColor"
            opacity=".65"
          />
        ))}
        <g transform="translate(177 177)">
          <AstroSymbol name="star" size={46} />
        </g>
        <path d="M181 266h38" stroke="currentColor" strokeWidth=".7" opacity=".55" />
        <text
          x="200"
          y="284"
          textAnchor="middle"
          fill="currentColor"
          fontSize="6"
          letterSpacing="2"
          opacity=".75"
        >
          AS ABOVE, SO WITHIN
        </text>
      </g>
    </svg>
  );
}

/** An ornamental bát quái/ngũ hành diagram, never a magnetic compass or personal chart. */
export function BaguaWheel({ element, className = '' }: { element?: string; className?: string }) {
  const octagon = Array.from({ length: 8 }, (_, index) => {
    const p = point(132, index * 45 + 22.5);
    return `${p.x},${p.y}`;
  }).join(' ');
  return (
    <svg
      viewBox="0 0 400 400"
      className={`astro-wheel astro-bagua-wheel ${className}`.trim()}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <Orbit />
      <g stroke="currentColor">
        <circle cx="200" cy="200" r="184" strokeWidth=".75" opacity=".65" />
        <circle cx="200" cy="200" r="173" strokeWidth=".6" opacity=".35" />
        <polygon points={octagon} strokeWidth=".7" opacity=".5" />
        <circle cx="200" cy="200" r="124" strokeWidth=".6" opacity=".25" />
        <circle cx="200" cy="200" r="76" strokeWidth=".6" opacity=".35" />
      </g>
      <WheelTicks count={80} />
      {BAGUA.map((item, index) => {
        const position = point(153, index * 45);
        const dividerOuter = point(173, index * 45 - 22.5);
        const dividerInner = point(132, index * 45 - 22.5);
        const selected = item.element === element;
        return (
          <g key={item.name}>
            <path
              d={`M${dividerInner.x} ${dividerInner.y}L${dividerOuter.x} ${dividerOuter.y}`}
              stroke="currentColor"
              strokeWidth=".6"
              opacity=".4"
            />
            {selected && (
              <circle
                cx={position.x}
                cy={position.y - 2}
                r="19"
                fill="currentColor"
                fillOpacity=".1"
              />
            )}
            <g transform={`translate(${position.x - 11} ${position.y - 15})`}>
              <AstroSymbol name={item.name} size={22} />
            </g>
            <text
              x={position.x}
              y={position.y + 17}
              textAnchor="middle"
              fill="currentColor"
              fontSize="7.5"
              letterSpacing="1"
              opacity=".8"
            >
              {item.name.toLocaleUpperCase('vi')}
            </text>
          </g>
        );
      })}
      {ELEMENTS.map((item, index) => {
        const position = point(101, index * 72);
        return (
          <g
            key={item.name}
            style={{ color: item.color }}
            opacity={element && element !== item.name ? '.45' : '.95'}
          >
            <g transform={`translate(${position.x - 9} ${position.y - 10})`}>
              <AstroSymbol name={item.name} size={18} />
            </g>
            <text
              x={position.x}
              y={position.y + 19}
              textAnchor="middle"
              fill="currentColor"
              fontSize="7"
              letterSpacing=".8"
            >
              {item.name.toLocaleUpperCase('vi')}
            </text>
          </g>
        );
      })}
      <g className="astro-wheel-center" transform="translate(200 200)">
        <circle r="55" stroke="currentColor" strokeWidth=".9" />
        <path
          d="M0-55a55 55 0 0 1 0 110 27.5 27.5 0 0 1 0-55 27.5 27.5 0 0 0 0-55Z"
          fill="currentColor"
          fillOpacity=".85"
        />
        <circle cy="-27.5" r="5" fill="currentColor" />
        <circle cy="27.5" r="5" fill="var(--ink, #080f23)" />
        <circle r="61" stroke="currentColor" strokeWidth=".5" opacity=".4" />
      </g>
    </svg>
  );
}
