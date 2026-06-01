import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import SpeakerButton from './SpeakerButton';
import SpeedSlider from './SpeedSlider';
import './ContextPanel.css';

const HAN_RE = /\p{Script=Han}/u;

function renderSentenceNodes({ sentence, speak, speakingId, audioSupported, label }) {
  const chars = Array.from(sentence);
  return chars.map((ch, i) => {
    if (!HAN_RE.test(ch)) {
      return <span key={`t-${i}`} className="cp-sentence-text">{ch}</span>;
    }
    const id = `s-${i}-${ch}`;
    const playing = speakingId === id;
    const canPlay = typeof speak === 'function' && audioSupported;
    return (
      <button
        key={id}
        type="button"
        className={`cp-han${playing ? ' cp-han--playing' : ''}`}
        onClick={canPlay ? () => speak(ch, { id }) : undefined}
        aria-label={label(ch)}
        aria-disabled={canPlay ? undefined : 'true'}
        disabled={!canPlay}
      >
        {ch}
      </button>
    );
  });
}

export default function ContextPanel({
  entry,
  collapsibleOnMobile = true,
  speak,
  speakingId,
  audioSupported = false,
  speechRate,
  onSpeechRateChange,
}) {
  const { lang, t } = useI18n();
  const [collapsed, setCollapsed] = useState(true);

  const meaning = entry.meaning[lang] ?? entry.meaning.en;
  const translation = entry.sentence.translation[lang] ?? entry.sentence.translation.en;
  const canPlay = typeof speak === 'function' && audioSupported;

  const playLabel = (word) => t('trainer.playWord', { word });

  return (
    <aside className={`cp-wrap ${collapsibleOnMobile ? 'cp-wrap--collapsible' : ''}`}>
      {collapsibleOnMobile && (
        <button
          className="cp-toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
        >
          <span className="cp-toggle-arrow" aria-hidden>{collapsed ? '▸' : '▾'}</span>
          <span>{t('trainer.meaning')} & {t('trainer.example').toLowerCase()}</span>
        </button>
      )}
      <div className={`cp-body ${collapsibleOnMobile && collapsed ? 'cp-body--collapsed' : ''}`}>
        <section className="cp-section">
          <h3 className="cp-label">{t('trainer.meaning')}</h3>
          <p className="cp-meaning">{meaning}</p>
        </section>
        <section className="cp-section">
          <h3 className="cp-label">{t('trainer.example')}</h3>
          <p className="cp-sentence">
            {renderSentenceNodes({
              sentence: entry.sentence.chinese,
              speak,
              speakingId,
              audioSupported,
              label: playLabel,
            })}
            {speak && (
              <SpeakerButton
                label={t('trainer.playSentence')}
                onPlay={() => speak(entry.sentence.chinese, { id: 'sentence' })}
                playing={speakingId === 'sentence'}
                disabled={!canPlay}
                size="sm"
              />
            )}
          </p>
          {typeof onSpeechRateChange === 'function' && typeof speechRate === 'number' && (
            <div className="cp-rate-row">
              <SpeedSlider
                value={speechRate}
                onChange={onSpeechRateChange}
                label={t('trainer.speechRate')}
              />
            </div>
          )}
          <ul className="cp-words">
            {entry.sentence.words.map((w, i) => {
              const isPracticed = w.char.includes(entry.character);
              const id = `w-${i}`;
              const playing = speakingId === id;
              return (
                <li key={i}>
                  <button
                    type="button"
                    className={`cp-word${playing ? ' cp-word--playing' : ''}`}
                    onClick={canPlay ? () => speak(w.char, { id }) : undefined}
                    aria-label={playLabel(w.char)}
                    aria-disabled={canPlay ? undefined : 'true'}
                    disabled={!canPlay}
                  >
                    <span className="cp-word-char">{w.char}</span>
                    {!isPracticed && w.pinyin && (
                      <span className="cp-word-pinyin">{w.pinyin}</span>
                    )}
                    {!isPracticed && w.zhuyin && (
                      <span className="cp-word-zhuyin">{w.zhuyin}</span>
                    )}
                    <span className="cp-word-gloss">{w[lang] ?? w.en}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="cp-translation">"{translation}"</p>
        </section>
      </div>
    </aside>
  );
}
