import { useI18n } from '../i18n/I18nContext';
import './ActionBar.css';

function ShuffleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M16 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 8h6l4 8h8" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 21l5-5-5-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 16h6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KeyboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="2.5" y="6" width="19" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M6 13h.01M9 13h.01M15 13h.01M18 13h.01M8 16h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <rect x="15" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <rect x="3" y="15" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <rect x="15" y="15" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.8" fill="none" />
    </svg>
  );
}

export default function ActionBar({
  onSkip,
  onBackspace,
  onSolution,
  shuffleKeys = false,
  onToggleShuffle,
  nativeInput = false,
  onToggleNativeInput,
  phoneLayout = false,
  onTogglePhoneLayout,
  disabled,
}) {
  const { t } = useI18n();
  return (
    <div className="ab-wrap">
      <button className="ab-btn ab-btn--secondary" onClick={onSkip} disabled={disabled}>
        {t('trainer.skip')}
      </button>
      <button
        className="ab-btn ab-btn--icon"
        onClick={onBackspace}
        aria-label={t('trainer.backspace')}
        disabled={disabled}
      >
        ⌫
      </button>
      {onToggleShuffle && (
        <button
          type="button"
          className={`ab-btn ab-btn--icon ab-shuffle${shuffleKeys ? ' ab-shuffle--on' : ''}`}
          onClick={onToggleShuffle}
          aria-label={t('trainer.shuffleKeyboard')}
          aria-pressed={shuffleKeys}
          disabled={disabled}
        >
          <ShuffleIcon />
        </button>
      )}
      {onToggleNativeInput && (
        <button
          type="button"
          className={`ab-btn ab-btn--icon ab-native${nativeInput ? ' ab-native--on' : ''}`}
          onClick={onToggleNativeInput}
          aria-label={t('trainer.nativeInput')}
          aria-pressed={nativeInput}
          disabled={disabled}
        >
          <KeyboardIcon />
        </button>
      )}
      {onTogglePhoneLayout && (
        <button
          type="button"
          className={`ab-btn ab-btn--icon ab-phone${phoneLayout ? ' ab-phone--on' : ''}`}
          onClick={onTogglePhoneLayout}
          aria-label={t('trainer.phoneLayout')}
          aria-pressed={phoneLayout}
          disabled={disabled}
        >
          <GridIcon />
        </button>
      )}
      <button className="ab-btn ab-btn--accent" onClick={onSolution} disabled={disabled}>
        {t('trainer.solution')}
      </button>
    </div>
  );
}
