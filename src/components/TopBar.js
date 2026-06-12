import { useTheme } from '../theme/ThemeContext';
import { useAnnotation } from '../theme/AnnotationContext';
import { useAutoPlay } from '../theme/SpeechContext';
import { useI18n } from '../i18n/I18nContext';
import './TopBar.css';

const ANNOT_PILLS = [
  { key: 'pinyin', label: '拼' },
  { key: 'zhuyin', label: 'ㄅ' },
  { key: 'meaning', label: '英' },
];

export default function TopBar({ title, onBack, stats }) {
  const { theme, toggleTheme } = useTheme();
  const {
    annot, toggle,
    cycleZhuyinScale, zhuyinScaleLabel,
    cyclePinyinScale, pinyinScaleLabel,
    cycleCharScale, charScaleLabel,
  } = useAnnotation();
  const { autoPlay, toggleAutoPlay } = useAutoPlay();
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
        <span className="tb-annot" role="group" aria-label={t('topbar.annotations')}>
          {ANNOT_PILLS.map((p) => (
            <button
              key={p.key}
              className={`tb-pill${annot[p.key] ? ' tb-pill--on' : ''}`}
              onClick={() => toggle(p.key)}
              aria-pressed={annot[p.key]}
              aria-label={t(`topbar.${p.key}`)}
              title={t(`topbar.${p.key}`)}
            >
              {p.label}
            </button>
          ))}
          <button
            className="tb-pill tb-pill--size"
            onClick={cycleZhuyinScale}
            aria-label={t('topbar.zhuyinSize')}
            title={`${t('topbar.zhuyinSize')} · ${zhuyinScaleLabel}`}
          >
            ㄅ<sup className="tb-pill-sz">{zhuyinScaleLabel}</sup>
          </button>
          <button
            className="tb-pill tb-pill--size"
            onClick={cyclePinyinScale}
            aria-label={t('topbar.pinyinSize')}
            title={`${t('topbar.pinyinSize')} · ${pinyinScaleLabel}`}
          >
            拼<sup className="tb-pill-sz">{pinyinScaleLabel}</sup>
          </button>
          <button
            className="tb-pill tb-pill--size"
            onClick={cycleCharScale}
            aria-label={t('topbar.charSize')}
            title={`${t('topbar.charSize')} · ${charScaleLabel}`}
          >
            字<sup className="tb-pill-sz">{charScaleLabel}</sup>
          </button>
        </span>
        <button
          className={`tb-pill tb-pill--emoji${autoPlay ? ' tb-pill--on' : ''}`}
          onClick={toggleAutoPlay}
          aria-pressed={autoPlay}
          aria-label={t('topbar.autoplay')}
          title={t('topbar.autoplay')}
        >
          {autoPlay ? '🔊' : '🔇'}
        </button>
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
