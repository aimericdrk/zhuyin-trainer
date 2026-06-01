import { PHONE_LAYOUT, TONE_KEYS } from '../data/keyboardLayout';
import './PhoneKeyboard.css';

export default function PhoneKeyboard({ mode, onTap, disabled, layout = PHONE_LAYOUT }) {
  const handleTap = (sym) => {
    if (!disabled) onTap(sym);
  };

  const renderSymbolKey = (sym, keyProp) => {
    const isTone = TONE_KEYS.has(sym);
    return (
      <button
        key={keyProp}
        type="button"
        className={`pk-key${isTone ? ' pk-key--tone' : ''}`}
        onClick={() => handleTap(sym)}
        aria-label={isTone ? `tone ${sym}` : sym}
        disabled={disabled || (isTone && mode === 'easy')}
      >
        {sym}
      </button>
    );
  };

  return (
    <div className="pk-board">
      {layout.rows.map((row, ri) => (
        <div className="pk-row" key={`r-${ri}`}>
          {row.map((sym, ci) => renderSymbolKey(sym, `${ri}-${ci}-${sym}`))}
        </div>
      ))}
      <div className="pk-row pk-row--bottom">
        {layout.bottomRow.map((cell, i) => {
          if (cell.kind === 'space') {
            return (
              <button
                key={`bot-${i}-space`}
                type="button"
                className="pk-key pk-key--space"
                disabled
                aria-label={cell.label}
              >
                {cell.label}
              </button>
            );
          }
          return renderSymbolKey(cell.symbol, `bot-${i}-${cell.symbol}`);
        })}
      </div>
    </div>
  );
}
