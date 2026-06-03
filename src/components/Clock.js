import './Clock.css';

// A small analog clock face plus a digital read-out. Pure presentational.
export default function Clock({ hour24 = 0, minute = 0, size = 132 }) {
  const minuteAngle = minute * 6;
  const hourAngle = ((hour24 % 12) + minute / 60) * 30;
  const ticks = Array.from({ length: 12 }, (_, i) => i);
  const r = 50;
  const c = 60;
  const digital = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return (
    <div className="clk-wrap" aria-label={`clock ${digital}`}>
      <svg className="clk-face" width={size} height={size} viewBox="0 0 120 120" role="img">
        <circle className="clk-rim" cx={c} cy={c} r={r} />
        {ticks.map((i) => {
          const a = (i * 30 * Math.PI) / 180;
          const inner = i % 3 === 0 ? 40 : 44;
          const x1 = c + inner * Math.sin(a);
          const y1 = c - inner * Math.cos(a);
          const x2 = c + r * Math.sin(a);
          const y2 = c - r * Math.cos(a);
          return (
            <line
              key={i}
              className={i % 3 === 0 ? 'clk-tick clk-tick--major' : 'clk-tick'}
              x1={x1} y1={y1} x2={x2} y2={y2}
            />
          );
        })}
        <line
          className="clk-hand clk-hand--hour"
          x1={c} y1={c}
          x2={c} y2={c - 26}
          transform={`rotate(${hourAngle} ${c} ${c})`}
        />
        <line
          className="clk-hand clk-hand--minute"
          x1={c} y1={c}
          x2={c} y2={c - 38}
          transform={`rotate(${minuteAngle} ${c} ${c})`}
        />
        <circle className="clk-pin" cx={c} cy={c} r={3} />
      </svg>
      <span className="clk-digital">{digital}</span>
    </div>
  );
}
