import { useEffect, useRef } from 'react';
import { ALL_ZHUYIN } from '../data/keyboardLayout';
import './NativeInput.css';

const ACCEPTED = new Set([...ALL_ZHUYIN, 'ˊ', 'ˇ', 'ˋ', '˙']);

// Phone Bopomofo IMEs often emit characters that aren't the canonical Unicode
// tone marks. Map common aliases to the canonical symbol the trainer expects.
const ALIASES = {
  '.': '˙',   // ASCII period → neutral tone
  '·': '˙',   // middle dot → neutral tone
  '́': 'ˊ',   // combining acute → 2nd tone
  '̌': 'ˇ',   // combining caron → 3rd tone
  '̀': 'ˋ',   // combining grave → 4th tone
};

function dispatchValidSymbols(text, onSymbol) {
  if (!text) return;
  for (const ch of text) {
    const mapped = ALIASES[ch] || ch;
    if (ACCEPTED.has(mapped)) onSymbol(mapped);
  }
}

export default function NativeInput({
  onSymbol,
  onBackspace,
  disabled = false,
  promptId,
  placeholder,
}) {
  const inputRef = useRef(null);
  const composingRef = useRef(false);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [promptId, disabled]);

  const clearField = () => {
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleInput = (event) => {
    if (disabled) return;
    if (composingRef.current) return;
    const inputType = event.nativeEvent ? event.nativeEvent.inputType : '';
    if (inputType === 'insertCompositionText') return;
    const data = event.nativeEvent ? event.nativeEvent.data : event.target.value;
    dispatchValidSymbols(data, onSymbol);
    clearField();
  };

  const handleCompositionStart = () => {
    composingRef.current = true;
  };

  const handleCompositionEnd = (event) => {
    composingRef.current = false;
    if (disabled) return;
    const data = event.data;
    dispatchValidSymbols(data, onSymbol);
    clearField();
  };

  const handleKeyDown = (event) => {
    if (disabled) return;
    if (event.key === 'Backspace') {
      onBackspace();
    }
  };

  return (
    <div className="ni-wrap">
      <input
        ref={inputRef}
        type="text"
        className="ni-input"
        placeholder={placeholder}
        disabled={disabled}
        inputMode="text"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
