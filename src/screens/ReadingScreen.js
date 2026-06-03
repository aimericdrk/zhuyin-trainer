import { useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAnnotation } from '../theme/AnnotationContext';
import { useSpeech } from '../hooks/useSpeech';
import { SENTENCES } from '../data/sentences';
import TopBar from '../components/TopBar';
import SpeakerButton from '../components/SpeakerButton';
import './ReadingScreen.css';

const SPEECH_RATE_LS = 'zhuyin.speechRate';
function readRate() {
  try {
    const n = Number(localStorage.getItem(SPEECH_RATE_LS));
    return Number.isFinite(n) && n > 0 ? Math.min(1.5, Math.max(0.5, n)) : 1.0;
  } catch { return 1.0; }
}

function shuffledIndices(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ReadingScreen({ onBack }) {
  const { t, lang } = useI18n();
  const { annot } = useAnnotation();
  const { speak, speakingId } = useSpeech({ rate: readRate() });
  const [order] = useState(() => shuffledIndices(SENTENCES.length));
  const [pos, setPos] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showTrans, setShowTrans] = useState(false);

  const sentence = SENTENCES[order[pos] ?? 0];
  const sel = selected != null ? sentence.words[selected] : null;
  const fullId = useMemo(() => `sent-${order[pos]}`, [order, pos]);

  function next() {
    setSelected(null);
    setShowTrans(false);
    setPos((p) => (p + 1) % order.length);
  }

  if (!sentence) {
    return (
      <div className="rd-wrap">
        <TopBar title={t('tools.reading.title')} onBack={onBack} />
        <main className="rd-main"><p className="rd-empty">—</p></main>
      </div>
    );
  }

  return (
    <div className="rd-wrap">
      <TopBar title={t('tools.reading.title')} onBack={onBack} />
      <main className="rd-main">
        <p className="rd-intro">{t('tools.reading.intro')}</p>

        <div className="rd-sentence">
          {sentence.words.map((w, i) => (
            <button
              key={i}
              className={`rd-word${selected === i ? ' rd-word--active' : ''}`}
              onClick={() => { setSelected(i); speak(w.char, { id: `w-${i}` }); }}
            >
              {w.char}
            </button>
          ))}
        </div>

        <div className="rd-controls">
          <SpeakerButton
            label={t('trainer.playSentence')}
            onPlay={() => speak(sentence.chinese, { id: fullId })}
            playing={speakingId === fullId}
          />
          <button className="rd-btn" onClick={() => setShowTrans((s) => !s)}>
            {showTrans ? t('tools.reading.hideTranslation') : t('tools.reading.showTranslation')}
          </button>
          <button className="rd-btn rd-btn--next" onClick={next}>
            {t('tools.reading.next')}
          </button>
        </div>

        {showTrans && (
          <div className="rd-reveal">
            <p className="rd-translation">
              “{sentence.translation[lang] ?? sentence.translation.en}”
            </p>
            <ul className="rd-breakdown">
              {sentence.words.map((w, i) => (
                <li
                  key={i}
                  className="rd-bd-row"
                  onClick={() => { setSelected(i); speak(w.char, { id: `w-${i}` }); }}
                >
                  <span className="rd-bd-char">{w.char}</span>
                  <span className="rd-bd-readings">
                    {annot.zhuyin && <span className="rd-bd-zhuyin">{w.zhuyin}</span>}
                    {annot.pinyin && <span className="rd-bd-py">{w.pinyin}</span>}
                  </span>
                  {annot.meaning && <span className="rd-bd-meaning">{w[lang] ?? w.en}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={`rd-detail${sel ? ' rd-detail--open' : ''}`}>
          {sel ? (
            <>
              <span className="rd-detail-char">{sel.char}</span>
              <span className="rd-detail-line">
                {annot.zhuyin && <span className="rd-detail-zhuyin">{sel.zhuyin}</span>}
                {annot.pinyin && <span className="rd-detail-py">{sel.pinyin}</span>}
              </span>
              {annot.meaning && <span className="rd-detail-meaning">{sel[lang] ?? sel.en}</span>}
            </>
          ) : (
            <span className="rd-detail-hint">{t('tools.reading.tapHint')}</span>
          )}
        </div>
      </main>
    </div>
  );
}
