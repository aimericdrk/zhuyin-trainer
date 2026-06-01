import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import './TopBar.css';

export default function TopBar({ title, onBack, stats }) {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useI18n();

  return (
    <header className="tb-wrap">
      <div className="tb-left">
        {onBack && (
          <button className="tb-back" onClick={onBack} aria-label={t('trainer.back')}>
            ←
          </button>
        )}
        <span className="tb-title">{title}</span>
        {stats && (
          <span className="tb-stats" aria-label="session stats">
            <span className="tb-stat tb-stat--ok">✓ {stats.correct}</span>
            <span className="tb-stat tb-stat--bad">✗ {stats.wrong}</span>
            <span className="tb-stat tb-stat--neutral">⤼ {stats.skipped}</span>
          </span>
        )}
      </div>
      <div className="tb-right">
        <button className="tb-icon" onClick={toggleTheme} aria-label={t('topbar.theme')}>
          {theme === 'dark' ? '☀' : '🌙'}
        </button>
        <button className="tb-icon tb-lang" onClick={toggleLang} aria-label={t('topbar.language')}>
          {lang.toUpperCase()}
        </button>
      </div>
    </header>
  );
}
