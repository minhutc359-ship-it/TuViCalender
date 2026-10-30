export function MysticBackdrop() {
  return (
    <div className="mystic-backdrop" aria-hidden="true">
      <div className="mystic-nebula nebula-one" />
      <div className="mystic-nebula nebula-two" />
      <svg className="mystic-stars" viewBox="0 0 1600 1100" preserveAspectRatio="xMidYMid slice">
        <g fill="currentColor">
          {Array.from({ length: 70 }, (_, i) => (
            <circle
              key={i}
              cx={(i * 353 + 71) % 1600}
              cy={(i * 197 + 39) % 1100}
              r={i % 9 === 0 ? 1.7 : 0.7}
              opacity={0.2 + (i % 5) * 0.12}
            />
          ))}
        </g>
        <g fill="none" stroke="currentColor" strokeWidth=".6" opacity=".22">
          <path d="M1100 90 1190 150 1280 105 1370 230 1450 185M1190 150 1205 280 1370 230M90 650 170 570 290 620 340 770 230 860 170 740 90 650M230 860 340 770" />
          <circle cx="1510" cy="900" r="230" />
          <circle cx="1510" cy="900" r="248" />
          <circle cx="1510" cy="900" r="280" />
        </g>
        <g
          className="mystic-clouds"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity=".12"
        >
          <path d="M-30 260H200c65 0 65-70 10-70-50 0-50 55-12 55H340c80 0 75-100 0-100-54 0-68 60-22 60h80c45 0 65 60 10 60H260M1270 720h100c50 0 60-65 10-65-38 0-45 40-10 40h150c70 0 65-90 0-90-44 0-58 54-17 54h95" />
        </g>
      </svg>
    </div>
  );
}
