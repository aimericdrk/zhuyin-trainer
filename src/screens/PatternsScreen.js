import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAnnotation } from '../theme/AnnotationContext';
import { useAutoPlay } from '../theme/SpeechContext';
import { useSpeech } from '../hooks/useSpeech';
import { PATTERNS, optionsFor, segmentPattern, wordsFor } from '../data/patterns';
import { zhuyinOf } from '../data/pinyinToZhuyin';
import TopBar from '../components/TopBar';
import SpeakerButton from '../components/SpeakerButton';
import './PatternsScreen.css';

const SPEECH_RATE_LS = 'zhuyin.speechRate';
function readRate() {
  try {
    const n = Number(localStorage.getItem(SPEECH_RATE_LS));
    return Number.isFinite(n) && n > 0 ? Math.min(1.5, Math.max(0.5, n)) : 1.0;
  } catch { return 1.0; }
}
function shuffled(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PatternsScreen({ onBack }) {
  const { t, lang } = useI18n();
  const { annot } = useAnnotation();
  const { autoPlay } = useAutoPlay();
  const { speak, speakingId } = useSpeech({ rate: readRate() });
  const [order] = useState(() => shuffled(PATTERNS.length));
  const [pos, setPos] = useState(0);
  const item = PATTERNS[order[pos]];
  const options = useMemo(() => optionsFor(item), [item]);
  const seg = useMemo(() => segmentPattern(item), [item]);
  const words = useMemo(() => wordsFor(item).filter((w) => w[lang] ?? w.en), [item, lang]);
  const [picked, setPicked] = useState(null); // zh of picked option
  const [solved, setSolved] = useState(false);
  const lastPlayed = useRef(null);

  const correctZh = item.answer.zh;

  useEffect(() => { setPicked(null); setSolved(false); }, [pos]);

  // Speak the full sentence once solved.
  useEffect(() => {
    if (solved && autoPlay && lastPlayed.current !== item.id) {
      lastPlayed.current = item.id;
      speak(item.full, { id: item.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved]);

  function pick(opt) {
    if (solved) return;
    setPicked(opt.zh);
    if (opt.zh === correctZh) setSolved(true);
  }
  function next() { setPos((p) => (p + 1) % order.length); }

  // Ruby: a character with its reading (zhuyin / pinyin) aligned underneath.
  const ruby = (s, key, cls) => (
    <span key={key} className={`pt-ruby${cls ? ` ${cls}` : ''}`}>
      <span className="pt-ruby-char">{s.c}</span>
      {s.py && annot.zhuyin && <span className="pt-ruby-zh">{zhuyinOf(s.py)}</span>}
      {s.py && annot.pinyin && <span className="pt-ruby-py">{s.py}</span>}
    </span>
  );

  function annoRow(c) {
    return (
      <span className="pt-anno">
        {annot.zhuyin && <span className="pt-anno-zh">{zhuyinOf(c.py)}</span>}
        {annot.pinyin && <span className="pt-anno-py">{c.py}</span>}
        {annot.meaning && <span className="pt-anno-mn">{c[lang] ?? c.en}</span>}
      </span>
    );
  }

  return (
    <div className="pt-wrap">
      <TopBar title={t('tools.patterns.title')} onBack={onBack} />
      <main className="pt-main">
        <p className="pt-intro">{t('tools.patterns.intro')}</p>
        <span className="pt-count">{pos + 1} / {order.length}</span>

        <div className="pt-sentence">
          {seg.before.map((s, i) => ruby(s, `b${i}`))}
          {solved
            ? seg.answer.map((s, i) => ruby(s, `a${i}`, 'pt-ruby--ok'))
            : (
              <span className={`pt-ruby pt-slot${picked && picked !== correctZh ? ' pt-slot--bad' : ''}`}>
                <span className="pt-ruby-char">{picked && picked !== correctZh ? picked : '＿＿'}</span>
              </span>
            )}
          {seg.after.map((s, i) => ruby(s, `f${i}`))}
          {solved && (
            <SpeakerButton
              label={t('games.replay')}
              onPlay={() => speak(item.full, { id: item.id })}
              playing={speakingId === item.id}
            />
          )}
        </div>

        {solved && (
          <div className="pt-meaning">
            <p className="pt-gloss">“{item.gloss[lang] ?? item.gloss.en}”</p>
            {words.length > 0 && (
              <ul className="pt-words">
                {words.map((w, i) => (
                  <li className="pt-word" key={`w${i}`}>
                    <span className="pt-word-char">{w.char}</span>
                    <span className="pt-word-mn">{w[lang] ?? w.en}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="pt-options">
          {options.map((c) => {
            const isCorrect = c.zh === correctZh;
            const isPicked = picked === c.zh;
            const cls = ['pt-opt',
              solved && isCorrect ? 'pt-opt--ok' : '',
              isPicked && !isCorrect ? 'pt-opt--bad' : ''].filter(Boolean).join(' ');
            return (
              <button
                key={c.zh}
                className={cls}
                disabled={solved || (isPicked && !isCorrect)}
                onClick={() => pick(c)}
              >
                <span className="pt-opt-zh">{c.zh}</span>
                {annoRow(c)}
              </button>
            );
          })}
        </div>

        <div className="pt-actions">
          {solved
            ? <button className="pt-btn pt-btn--next" onClick={next}>{t('tools.patterns.next')}</button>
            : <button className="pt-btn" onClick={next}>{t('trainer.skip')}</button>}
        </div>
      </main>
    </div>
  );
}
