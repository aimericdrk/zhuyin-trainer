import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAnnotation } from '../theme/AnnotationContext';
import { useAutoPlay } from '../theme/SpeechContext';
import { useSpeech } from '../hooks/useSpeech';
import { DIALOGUES, collectTurn } from '../data/dialogues';
import { zhuyinOf } from '../data/pinyinToZhuyin';
import TopBar from '../components/TopBar';
import './ChatScreen.css';

const SPEECH_RATE_LS = 'zhuyin.speechRate';
function readRate() {
  try {
    const n = Number(localStorage.getItem(SPEECH_RATE_LS));
    return Number.isFinite(n) && n > 0 ? Math.min(1.5, Math.max(0.5, n)) : 1.0;
  } catch { return 1.0; }
}

export default function ChatScreen({ onBack }) {
  const { t, lang } = useI18n();
  const { annot } = useAnnotation();
  const { speak, speakingId } = useSpeech({ rate: readRate() });
  const { autoPlay } = useAutoPlay();
  const [dialogId, setDialogId] = useState(DIALOGUES[0].id);
  const dialog = DIALOGUES.find((d) => d.id === dialogId) || DIALOGUES[0];
  const [bubbles, setBubbles] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [options, setOptions] = useState(null);
  const [wrong, setWrong] = useState([]);
  const endRef = useRef(null);
  const idCounter = useRef(0);

  function speakLastPartner(newBubbles) {
    if (!autoPlay) return;
    for (let i = newBubbles.length - 1; i >= 0; i--) {
      if (newBubbles[i].who === 'partner') { speak(newBubbles[i].zh, { id: newBubbles[i].key }); break; }
    }
  }

  function withKeys(arr) {
    return arr.map((b) => ({ ...b, key: `b${idCounter.current++}` }));
  }

  function reveal() {
    idCounter.current = 0;
    const { bubbles: bs, nextIndex, choose } = collectTurn(dialog, 0);
    const keyed = withKeys(bs);
    setBubbles(keyed);
    setStepIdx(nextIndex);
    setOptions(choose);
    setWrong([]);
    speakLastPartner(keyed);
  }

  // Reset and reveal the opening turn whenever the dialogue changes.
  useEffect(() => {
    reveal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogId]);

  useEffect(() => {
    if (endRef.current && endRef.current.scrollIntoView) {
      endRef.current.scrollIntoView({ block: 'end' });
    }
  }, [bubbles]);

  function pick(option, idx) {
    if (option.bad) {
      setWrong((w) => (w.includes(idx) ? w : [...w, idx]));
      if (autoPlay) speak(option.zh, { id: `bad-${idx}` });
      return;
    }
    const userBubble = withKeys([{ who: 'user', ...option }])[0];
    const { bubbles: bs, nextIndex, choose } = collectTurn(dialog, stepIdx + 1);
    const partnerBubbles = withKeys(bs);
    setBubbles((prev) => [...prev, userBubble, ...partnerBubbles]);
    setStepIdx(nextIndex);
    setOptions(choose);
    setWrong([]);
    if (partnerBubbles.length) speakLastPartner(partnerBubbles);
    else if (autoPlay) speak(option.zh, { id: userBubble.key });
  }

  function annoRow(item, base) {
    return (
      <span className={`${base}-sub`}>
        {annot.zhuyin && <span className={`${base}-zhuyin`}>{zhuyinOf(item.py)}</span>}
        {annot.pinyin && <span className={`${base}-py`}>{item.py}</span>}
        {annot.meaning && <span className={`${base}-mn`}>{item[lang] ?? item.en}</span>}
      </span>
    );
  }

  return (
    <div className="ch-wrap">
      <TopBar title={t('tools.chat.title')} onBack={onBack} />
      <main className="ch-main">
        <div className="ch-scenarios">
          {DIALOGUES.map((d) => (
            <button
              key={d.id}
              className={`ch-scenario${d.id === dialogId ? ' ch-scenario--active' : ''}`}
              onClick={() => setDialogId(d.id)}
            >
              <span aria-hidden="true">{d.icon}</span> {d.title[lang] ?? d.title.en}
            </button>
          ))}
        </div>

        <div className="ch-thread">
          {bubbles.map((b) => (
            <button
              key={b.key}
              className={`ch-bubble ch-bubble--${b.who}${speakingId === b.key ? ' ch-bubble--speaking' : ''}`}
              onClick={() => speak(b.zh, { id: b.key })}
              title={t('games.replay')}
            >
              <span className="ch-zh">{b.zh}</span>
              {annoRow(b, 'ch')}
            </button>
          ))}
          <div ref={endRef} />
        </div>

        {options ? (
          <div className="ch-options">
            <span className="ch-options-label">{t('tools.chat.yourReply')}</span>
            {options.map((o, i) => (
              <button
                key={i}
                className={`ch-reply${wrong.includes(i) ? ' ch-reply--wrong' : ''}`}
                disabled={wrong.includes(i)}
                onClick={() => pick(o, i)}
              >
                <span className="ch-reply-zh">{o.zh}</span>
                {annoRow(o, 'ch-reply')}
              </button>
            ))}
            {wrong.length > 0 && <span className="ch-hint">{t('tools.chat.tryAgain')}</span>}
          </div>
        ) : (
          <div className="ch-end">
            <span className="ch-end-label">{t('tools.chat.finished')}</span>
            <button className="ch-restart" onClick={() => reveal()}>{t('tools.chat.restart')}</button>
          </div>
        )}
      </main>
    </div>
  );
}
