import type { ReactNode } from 'react';
import { BAGUA } from './symbols';

const drawings: Record<string, ReactNode> = {
  Air: (
    <>
      <path d="M2 8h12c6 0 5-7 1-5M4 12h14c5 0 4 7 0 6M2 16h8c4 0 3 6 0 5" />
      <path d="M3 4h5M18 22h3" opacity=".4" />
    </>
  ),
  Aries: <path d="M12 21V9C12 2 3 2 3 8c0 3 3 4 5 2M12 9c0-7 9-7 9-1 0 3-3 4-5 2" />,
  Taurus: (
    <>
      <path d="M4 3c0 4 3.5 7 8 7s8-3 8-7" />
      <circle cx="12" cy="15.5" r="5.5" />
    </>
  ),
  Gemini: (
    <>
      <path d="M5 3c4 2 10 2 14 0M5 21c4-2 10-2 14 0M8 4.2v15.6M16 4.2v15.6" />
      <path d="M4 2v2M20 2v2M4 20v2M20 20v2" opacity=".45" />
    </>
  ),
  Cancer: (
    <>
      <path d="M3 8c4-4 11-5 17-1M21 16c-4 4-11 5-17 1" />
      <circle cx="7" cy="10" r="3.5" />
      <circle cx="17" cy="14" r="3.5" />
    </>
  ),
  Leo: (
    <>
      <circle cx="6" cy="15" r="3.5" />
      <path d="M8.7 12.8C5 7 9 2 13 3c8 2-2 12 1 16 2.3 3.2 7 1.4 7-2" />
    </>
  ),
  Virgo: (
    <path d="M3 18V7c0-4 5-4 5 0v11M8 7c0-4 5-4 5 0v11M13 8c0-4 6-4 6 0v4c0 4-4 7-7 9M13 9c0 5 4 10 8 12" />
  ),
  Libra: (
    <>
      <path d="M3 16h5a5 5 0 1 1 8 0h5M3 21h18" />
      <path d="M12 2v2M3 6l2 2M21 6l-2 2" opacity=".45" />
    </>
  ),
  Scorpio: <path d="M3 18V7c0-4 5-4 5 0v11M8 7c0-4 5-4 5 0v8c0 5 5 6 8 2M17 17h4v4" />,
  Sagittarius: (
    <>
      <path d="m4 20 15-15M11 4h9v9M5 11l8 8" />
      <path d="m4 4 1 1M20 20l-1-1" opacity=".45" />
    </>
  ),
  Capricorn: (
    <path d="M2 5c2-2 5-1 5 3v10M7 8c0-4 5-4 5 0v9c0 6 10 5 10-1 0-5-8-5-12 3M12 10l4-6" />
  ),
  Aquarius: (
    <>
      <path d="m2 9 4-3 4 3 4-3 4 3 4-3M2 17l4-3 4 3 4-3 4 3 4-3" />
      <path d="M4 21h16" opacity=".3" />
    </>
  ),
  Pisces: (
    <>
      <path d="M5 3c7 4 7 14 0 18M19 3c-7 4-7 14 0 18M3 12h18" />
      <circle cx="12" cy="3" r=".7" fill="currentColor" stroke="none" />
      <circle cx="12" cy="21" r=".7" fill="currentColor" stroke="none" />
    </>
  ),
  Kim: (
    <>
      <path d="m12 2 8 7-8 13L4 9l8-7ZM4 9h16M8 5l4 4 4-4M12 9v13" />
      <path d="m2 3 1 1M21 3l-1 1" opacity=".45" />
    </>
  ),
  Mộc: (
    <>
      <path d="M12 22V9M12 15C4 15 3 10 3 6c6 0 9 3 9 7M12 10c0-6 4-8 9-8 0 6-3 10-9 10M6 21h12" />
      <path d="m7 10 5 5M17 6l-5 6" opacity=".55" />
    </>
  ),
  Thủy: (
    <>
      <path d="M12 2c-2 4-7 8-7 13a7 7 0 0 0 14 0c0-5-5-9-7-13Z" />
      <path d="M8 16c0 2 1.5 3.5 3.5 3.5M3 22h18" opacity=".6" />
    </>
  ),
  Hỏa: (
    <>
      <path d="M13 2c1 5-5 6-4 10 1 2 3 2 4-2 4 3 7 6 4 10-3 4-10 2-11-2C4 12 8 9 8 6c1 2 2 2 3 1s2-3 2-5Z" />
      <path d="M10 21c-2-3 1-5 2-7 0 3 3 4 2 7" />
    </>
  ),
  Thổ: (
    <>
      <path d="m2 17 6-9 4 6 3-10 7 13H2ZM3 21h18M10 17h7" />
      <path d="m7 10 1 2 1-2M14 7l1 2 1-2" opacity=".5" />
    </>
  ),
  Tý: (
    <>
      <path d="M7 8C2 8 2 2 6 2c3 0 4 3 3 5M17 8c5 0 5-6 1-6-3 0-4 3-3 5M6 10c1-5 11-5 12 0 1 4-3 10-6 12-3-2-7-8-6-12Z" />
      <path d="M5 15 1 14M6 18l-4 1M19 15l4-1M18 18l4 1M10 13h.1M14 13h.1" />
      <path d="m11 18 1 1 1-1" />
    </>
  ),
  Sửu: (
    <>
      <path d="M6 9C1 8 1 2 3 2c0 4 3 5 5 4M18 9c5-1 5-7 3-7 0 4-3 5-5 4M6 10c0-6 12-6 12 0v7c0 6-12 6-12 0v-7ZM6 11 2 9v4l4 2M18 11l4-2v4l-4 2" />
      <ellipse cx="12" cy="18" rx="4.5" ry="2.7" />
      <path d="M9 11h.1M15 11h.1M10 18h.1M14 18h.1" />
    </>
  ),
  Dần: (
    <>
      <path d="M5 8C0 4 5 0 8 5M19 8c5-4 0-8-3-3M5 10c0-8 14-8 14 0v5c0 9-14 9-14 0v-5Z" />
      <path d="M9 5v3M15 5v3M12 4v5M5 12l3 1-3 2M19 12l-3 1 3 2M9 11h.1M15 11h.1m-4 5 1 1 1-1M12 17v3M9 20l3-1 3 1" />
    </>
  ),
  Mão: (
    <>
      <path d="M5 10 4 2l6 4h4l6-4-1 8c4 8-1 12-7 12S1 18 5 10Z" />
      <path d="M8 12h1M15 12h1m-5 4 1 1 1-1M12 17v3M8 17l-6-1M8 20l-6 1M16 17l6-1M16 20l6 1" />
    </>
  ),
  Thìn: (
    <>
      <path d="M8 6 5 2l1 6M15 5l4-3-2 6M5 11l4-5 8 1 3 6-6 1-1 5-6 3 2-7-4-4ZM5 11l-3 2 4 2M17 15l5 2M16 18l5 3M10 9h.1M12 13l2 1M9 18l4 1" />
      <path d="m12 4 1-2M3 18l-1 3" opacity=".5" />
    </>
  ),
  Tị: (
    <>
      <path d="M15 5c0-4-8-4-8 0 0 3 8 4 8 7 0 4-10 4-10 7s14 4 15-1c1-4-12-7-12-9M15 5l5 2M20 7l2-2M20 7l2 2" />
      <path d="M10 4h.1M6 20c5 1 9 1 12-1" />
    </>
  ),
  Ngọ: (
    <>
      <path d="m7 4 2-2 1 4 5-1 2 5 4 3-2 5-7-1-2 5H4c0-5 4-10 4-13L7 4ZM5 6 2 9l3 2-3 3 3 2" />
      <path d="M14 10h.1M16 16l2-2M8 8l-1 6" />
    </>
  ),
  Mùi: (
    <>
      <path d="M8 8C0 10 1 0 7 2c4 1 3 5 2 6M16 8c8 2 7-8 1-6-4 1-3 5-2 6M7 10c0-6 10-6 10 0l-2 10-3 2-3-2-2-10ZM6 10l-4 1 4 3M18 10l4 1-4 3" />
      <path d="M9 12h.1M15 12h.1m-4 5 1 1 1-1M12 18v3" />
    </>
  ),
  Thân: (
    <>
      <path d="M6 8C0 7 0 16 6 15M18 8c6-1 6 8 0 7M5 10c0-11 14-11 14 0v5c0 9-14 9-14 0v-5Z" />
      <path d="M7 12C5 6 10 5 12 8c2-3 7-2 5 4 5 8-15 8-10 0ZM9 11h.1M15 11h.1M9 17c2 2 4 2 6 0" />
    </>
  ),
  Dậu: (
    <>
      <path d="M8 7C2 5 5 1 8 4c0-5 5-3 5 0 4-4 7 0 3 3M7 9c0-5 11-5 11 1v4l4 2-4 1-1 4H5l2-7V9ZM6 16c-5 1-5-5-3-6 0 4 3 3 4 2" />
      <path d="M14 10h.1M11 19c2 1 4 0 4-2" />
    </>
  ),
  Tuất: (
    <>
      <path d="M7 7C1 0-1 15 5 17l2-7M17 7c6-7 8 8 2 10l-2-7M6 10c0-8 12-8 12 0v7c0 7-12 7-12 0v-7Z" />
      <path d="M9 11h.1M15 11h.1m-5 5 2 2 2-2h-4ZM12 18v3M9 20l3 1 3-1" />
    </>
  ),
  Hợi: (
    <>
      <path d="M7 7 3 2v8M17 7l4-5v8M4 12c0-10 16-10 16 0v3c0 10-16 10-16 0v-3Z" />
      <ellipse cx="12" cy="16" rx="5" ry="3.8" />
      <path d="M8 10h.1M16 10h.1M10 15v2M14 15v2" />
    </>
  ),
  Sun: (
    <>
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <path d="M12 1v2M12 21v2M1 12h2M21 12h2M4 4l1.5 1.5M18.5 18.5 20 20M20 4l-1.5 1.5M5.5 18.5 4 20" />
    </>
  ),
  Moon: <path d="M16 2a10 10 0 1 0 6 16A10 10 0 0 1 16 2Z" />,
  Mercury: (
    <>
      <circle cx="12" cy="10" r="5" />
      <path d="M7 2c0 4 10 4 10 0M12 15v7M8 19h8" />
    </>
  ),
  Venus: (
    <>
      <circle cx="12" cy="8" r="6" />
      <path d="M12 14v8M8 19h8" />
    </>
  ),
  Mars: (
    <>
      <circle cx="9" cy="15" r="6" />
      <path d="m13 11 8-8M15 3h6v6" />
    </>
  ),
  Jupiter: <path d="M8 3c4 4 2 9-5 10h17M15 2v20M12 22h7" />,
  Saturn: <path d="M9 2v18M5 6h8M9 13c5-8 10-5 7 1l-2 5c-1 3 2 4 5 1" />,
  Uranus: (
    <>
      <circle cx="12" cy="18" r="3" />
      <path d="M12 15V4M4 3v9M20 3v9M4 8h16M2 3h4M18 3h4" />
    </>
  ),
  Neptune: (
    <>
      <path d="M12 2v20M6 3v4c0 8 12 8 12 0V3M3 5l3-3 3 3M15 5l3-3 3 3M8 19h8" />
    </>
  ),
  Pluto: (
    <>
      <circle cx="12" cy="5" r="3" />
      <path d="M5 7c0 9 14 9 14 0M12 14v8M8 19h8" />
    </>
  ),
  star: (
    <>
      <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" />
      <path d="m4 4 2 2M18 18l2 2M20 4l-2 2M6 18l-2 2" opacity=".4" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m16 6-2 8-8 4 4-8 6-4ZM12 1v3M12 20v3M1 12h3M20 12h3" />
      <path d="m10 10 4 4" opacity=".5" />
    </>
  ),
  fusion: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a4.5 4.5 0 0 1 0 9 4.5 4.5 0 0 0 0 9" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <path d="m12 14.5 1 1.5 1.5 1-1.5 1-1 1.5-1-1.5-1.5-1 1.5-1 1-1.5Z" />
    </>
  ),
  'moon-new': (
    <>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity=".07" />
      <circle cx="12" cy="12" r="5" strokeDasharray="1 3" opacity=".35" />
    </>
  ),
  'moon-waxing': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path
        d="M12 3a9 9 0 0 1 0 18c5-5 5-13 0-18Z"
        fill="currentColor"
        fillOpacity=".6"
        stroke="none"
      />
    </>
  ),
  'moon-full': (
    <>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity=".6" />
      <circle cx="9" cy="9" r="1.8" opacity=".25" />
      <circle cx="15" cy="15" r="2.5" opacity=".25" />
    </>
  ),
  'moon-waning': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path
        d="M12 3a9 9 0 0 0 0 18c-5-5-5-13 0-18Z"
        fill="currentColor"
        fillOpacity=".6"
        stroke="none"
      />
    </>
  ),
};

export interface AstroSymbolProps {
  name: string;
  size?: number;
  className?: string;
  label?: string;
}

export function AstroSymbol({ name, size = 24, className = '', label }: AstroSymbolProps) {
  const aliases: Record<string, string> = {
    Fire: 'Hỏa',
    Earth: 'Thổ',
    Water: 'Thủy',
    Wood: 'Mộc',
    Metal: 'Kim',
  };
  const symbolName = aliases[name] ?? name;
  const trigram = BAGUA.find((item) => item.name === symbolName);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`astro-symbol ${className}`.trim()}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      data-symbol={name}
    >
      {trigram
        ? trigram.lines.map((solid, index) =>
            solid ? (
              <path key={index} d={`M3 ${6 + index * 6}h18`} strokeWidth="2.1" />
            ) : (
              <path key={index} d={`M3 ${6 + index * 6}h6m6 0h6`} strokeWidth="2.1" />
            ),
          )
        : (drawings[symbolName] ?? drawings.star)}
    </svg>
  );
}
