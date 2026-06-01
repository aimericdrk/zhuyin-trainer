import { ZHUYIN_LAYOUT } from '../data/keyboardLayout';
import './ZhuyinKeyboard.css';

export default function ZhuyinKeyboard({ mode, onTap, disabled, layout = ZHUYIN_LAYOUT }) {
  const handleTap = (sym) => {
    if (!disabled) onTap(sym);
  };
  const renderRow = (row, idx) => (
    <div className="zk-row" key={idx}>
      {row.map((sym) => (
        <button
          key={sym}
          className="zk-key"
          onClick={() => handleTap(sym)}
          aria-label={sym}
          disabled={disabled}
        >
          {sym}
        </button>
      ))}
    </div>
  );

  return (
    <div className="zk-board">
      <div className="zk-section">
        {layout.initials.map(renderRow)}
      </div>
      <div className="zk-divider" aria-hidden />
      <div className="zk-section">
        {layout.finals.map(renderRow)}
      </div>
      <div className="zk-divider" aria-hidden />
      <div className="zk-section zk-bottom-row">
        <div className="zk-row">
          {layout.medials.map((sym) => (
            <button
              key={sym}
              className="zk-key"
              onClick={() => handleTap(sym)}
              aria-label={sym}
              disabled={disabled}
            >
              {sym}
            </button>
          ))}
        </div>
        <div className="zk-tones">
          {layout.tones.map((sym) => (
            <button
              key={sym}
              className="zk-key zk-tone"
              onClick={() => handleTap(sym)}
              aria-label={`tone ${sym}`}
              disabled={disabled || mode === 'easy'}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
