import { useI18n } from '../i18n/I18nContext';
import './StrokeRules.css';

// Visual stroke-order principles. Each card draws a sample character as numbered
// strokes (the number = the order you write them), so the rule is shown, not
// described in prose.
const RULES = [
  {
    key: 'topToBottom', char: '三',
    strokes: [
      { d: 'M16 24 H64', n: 1, nx: 9, ny: 24 },
      { d: 'M22 40 H58', n: 2, nx: 15, ny: 40 },
      { d: 'M12 58 H68', n: 3, nx: 6, ny: 58 },
    ],
  },
  {
    key: 'leftToRight', char: '川',
    strokes: [
      { d: 'M26 16 C23 34 23 50 22 64', n: 1, nx: 24, ny: 10 },
      { d: 'M41 12 V66', n: 2, nx: 41, ny: 7 },
      { d: 'M58 16 V62', n: 3, nx: 58, ny: 10 },
    ],
  },
  {
    key: 'horizFirst', char: '十',
    strokes: [
      { d: 'M14 40 H66', n: 1, nx: 9, ny: 40 },
      { d: 'M40 12 V68', n: 2, nx: 47, ny: 15 },
    ],
  },
  {
    key: 'centerFirst', char: '小',
    strokes: [
      { d: 'M40 14 V56', n: 1, nx: 47, ny: 14 },
      { d: 'M25 26 L19 44', n: 2, nx: 16, ny: 24 },
      { d: 'M55 24 L61 46', n: 3, nx: 63, ny: 22 },
    ],
  },
  {
    key: 'outsideFirst', char: '月',
    strokes: [
      { d: 'M28 16 L23 66', n: 1, nx: 22, ny: 11 },
      { d: 'M28 16 H54 V66', n: 2, nx: 56, ny: 12 },
      { d: 'M31 33 H52', n: 3, nx: 27, ny: 33 },
      { d: 'M31 48 H52', n: 4, nx: 27, ny: 48 },
    ],
  },
  {
    key: 'closeLast', char: '口',
    strokes: [
      { d: 'M24 18 V64', n: 1, nx: 19, ny: 18 },
      { d: 'M24 18 H58 V64', n: 2, nx: 60, ny: 14 },
      { d: 'M24 64 H58', n: 3, nx: 41, ny: 73, last: true },
    ],
  },
];

export default function StrokeRules() {
  const { t } = useI18n();
  return (
    <div className="sr-grid">
      {RULES.map((rule) => (
        <div key={rule.key} className="sr-card">
          <svg className="sr-svg" viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
            {rule.strokes.map((s, i) => (
              <path key={`p${i}`} d={s.d} className={`sr-stroke${s.last ? ' sr-stroke--last' : ''}`} />
            ))}
            {rule.strokes.map((s, i) => (
              <g key={`n${i}`}>
                <circle cx={s.nx} cy={s.ny} r="6.5" className={`sr-num-bg${s.last ? ' sr-num-bg--last' : ''}`} />
                <text x={s.nx} y={s.ny + 3.2} className="sr-num">{s.n}</text>
              </g>
            ))}
          </svg>
          <span className="sr-char">{rule.char}</span>
          <span className="sr-label">{t(`tools.writing.rules.${rule.key}`)}</span>
        </div>
      ))}
    </div>
  );
}
