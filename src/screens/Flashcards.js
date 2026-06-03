import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAnnotation } from '../theme/AnnotationContext';
import { useSpeech } from '../hooks/useSpeech';
import { DECKS } from '../data/quizSets';
import { zhuyinOf } from '../data/pinyinToZhuyin';
import TopBar from '../components/TopBar';
import SpeakerButton from '../components/SpeakerButton';
import './Flashcards.css';

const KNOWN_LS = 'zhuyin.flashKnown';
const SPEECH_RATE_LS = 'zhuyin.speechRate';

function readRate() {
  try {
    const n = Number(localStorage.getItem(SPEECH_RATE_LS));
    return Number.isFinite(n) && n > 0 ? Math.min(1.5, Math.max(0.5, n)) : 1.0;
  } catch { return 1.0; }
}
function readKnown() {
  try { return JSON.parse(localStorage.getItem(KNOWN_LS) || '{}') || {}; } catch { return {}; }
}

function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Flashcards({ onBack }) {
  const { t, lang } = useI18n();
  const { annot } = useAnnotation();
  const { speak, speakingId } = useSpeech({ rate: readRate() });
  const [deckKey, setDeckKey] = useState(DECKS[0].key);
  const deck = useMemo(() => DECKS.find((d) => d.key === deckKey) || DECKS[0], [deckKey]);
  const [order, setOrder] = useState(() => deck.cards.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(readKnown);

  useEffect(() => {
    setOrder(deck.cards.map((_, i) => i));
    setPos(0);
    setFlipped(false);
  }, [deck]);

  useEffect(() => {
    try { localStorage.setItem(KNOWN_LS, JSON.stringify(known)); } catch {}
  }, [known]);

  const card = deck.cards[order[pos]];
  const knownCount = deck.cards.filter((c) => known[c.id]).length;

  function go(delta) {
    setFlipped(false);
    setPos((p) => (p + delta + order.length) % order.length);
  }
  function grade(isKnown) {
    setKnown((k) => {
      const next = { ...k };
      if (isKnown) next[card.id] = true;
      else delete next[card.id];
      return next;
    });
    go(1);
  }

  return (
    <div className="fc-wrap">
      <TopBar title={t('tools.flashcards.title')} onBack={onBack} />
      <main className="fc-main">
        <div className="fc-decks">
          {DECKS.map((d) => (
            <button
              key={d.key}
              className={`fc-deck${d.key === deckKey ? ' fc-deck--active' : ''}`}
              onClick={() => setDeckKey(d.key)}
            >
              {d.zh}
            </button>
          ))}
        </div>

        <div className="fc-progress">
          <span>{pos + 1} / {order.length}</span>
          <span className="fc-known">✓ {knownCount}/{deck.cards.length}</span>
          <button className="fc-shuffle" onClick={() => { setOrder(shuffled(order)); setPos(0); setFlipped(false); }}>
            {t('tools.flashcards.shuffle')}
          </button>
        </div>

        <button
          className={`fc-card${flipped ? ' fc-card--flipped' : ''}${known[card.id] ? ' fc-card--known' : ''}`}
          onClick={() => setFlipped((f) => !f)}
        >
          {!flipped ? (
            <span className="fc-front">
              <span className="fc-zh">{card.zh}</span>
              <span className="fc-hint">{t('tools.flashcards.tapToFlip')}</span>
            </span>
          ) : (
            <span className="fc-back">
              {annot.zhuyin && <span className="fc-zhuyin">{zhuyinOf(card.py)}</span>}
              {annot.pinyin && <span className="fc-py">{card.py}</span>}
              <span className="fc-meaning">{card[lang] ?? card.en}</span>
            </span>
          )}
        </button>

        <div className="fc-audio">
          <SpeakerButton
            label={t('games.replay')}
            onPlay={() => speak(card.zh, { id: card.id })}
            playing={speakingId === card.id}
          />
        </div>

        {flipped ? (
          <div className="fc-grade">
            <button className="fc-btn fc-btn--review" onClick={() => grade(false)}>
              ↻ {t('tools.flashcards.review')}
            </button>
            <button className="fc-btn fc-btn--known" onClick={() => grade(true)}>
              ✓ {t('tools.flashcards.knew')}
            </button>
          </div>
        ) : (
          <div className="fc-nav">
            <button className="fc-btn fc-btn--nav" onClick={() => go(-1)}>←</button>
            <button className="fc-btn fc-btn--nav" onClick={() => go(1)}>→</button>
          </div>
        )}
      </main>
    </div>
  );
}
