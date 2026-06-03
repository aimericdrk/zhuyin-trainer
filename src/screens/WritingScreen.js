import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAnnotation } from '../theme/AnnotationContext';
import { useSpeech } from '../hooks/useSpeech';
import { WRITING_CHARS, WRITING_CATEGORIES } from '../data/writingChars';
import TopBar from '../components/TopBar';
import SpeakerButton from '../components/SpeakerButton';
import HanziWriterPanel from '../components/HanziWriterPanel';
import './WritingScreen.css';

const SPEECH_RATE_LS = 'zhuyin.speechRate';
const POS_LS = 'zhuyin.writingPos';

function readRate() {
  try {
    const n = Number(localStorage.getItem(SPEECH_RATE_LS));
    return Number.isFinite(n) && n > 0 ? Math.min(1.5, Math.max(0.5, n)) : 1.0;
  } catch { return 1.0; }
}
function readPos() {
  try { return JSON.parse(localStorage.getItem(POS_LS) || 'null'); } catch { return null; }
}

export default function WritingScreen({ onBack }) {
  const { t, lang } = useI18n();
  const { annot } = useAnnotation();
  const { speak, speakingId } = useSpeech({ rate: readRate() });
  const saved = readPos();
  const [catKey, setCatKey] = useState(() =>
    (WRITING_CATEGORIES.some((c) => c.key === saved?.cat) ? saved.cat : WRITING_CATEGORIES[0].key)
  );
  const [pos, setPos] = useState(() => (Number.isInteger(saved?.index) && saved.index >= 0 ? saved.index : 0));

  const chars = WRITING_CHARS.filter((c) => c.cat === catKey);
  const safePos = Math.min(pos, chars.length - 1);
  const char = chars[safePos] || chars[0];

  useEffect(() => {
    try { localStorage.setItem(POS_LS, JSON.stringify({ cat: catKey, index: safePos })); } catch { /* ignore */ }
  }, [catKey, safePos]);

  function go(delta) {
    setPos((p) => (Math.min(p, chars.length - 1) + delta + chars.length) % chars.length);
  }
  function pickCategory(key) {
    setCatKey(key);
    setPos(0);
  }

  return (
    <div className="wr-wrap">
      <TopBar title={t('tools.writing.title')} onBack={onBack} />
      <main className="wr-main">
        <p className="wr-intro">{t('tools.writing.intro')}</p>

        <div className="wr-cats">
          {WRITING_CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`wr-cat${c.key === catKey ? ' wr-cat--active' : ''}`}
              onClick={() => pickCategory(c.key)}
            >
              {c.zh} · {t(`tools.writing.cats.${c.key}`)}
            </button>
          ))}
        </div>

        <div className="wr-meta">
          <span className="wr-char">{char.zh}</span>
          {annot.pinyin && <span className="wr-py">{char.py}</span>}
          {annot.meaning && <span className="wr-en">{char[lang] ?? char.en}</span>}
          <span className="wr-strokes">{t('tools.writing.strokes', { n: char.strokes })}</span>
          <SpeakerButton
            label={t('games.replay')}
            onPlay={() => speak(char.zh, { id: char.zh })}
            playing={speakingId === char.zh}
          />
        </div>

        <HanziWriterPanel key={`${catKey}-${char.zh}`} char={char.zh} size={280} />

        <div className="wr-nav">
          <button className="wr-btn" onClick={() => go(-1)}>←</button>
          <span className="wr-count">{safePos + 1} / {chars.length}</span>
          <button className="wr-btn wr-btn--next" onClick={() => go(1)}>→</button>
        </div>
      </main>
    </div>
  );
}
