import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAutoPlay } from '../theme/SpeechContext';
import { useSpeech } from '../hooks/useSpeech';
import { useMemoryMatch } from '../hooks/useMemoryMatch';
import { DECKS } from '../data/quizSets';
import TopBar from '../components/TopBar';
import './MemoryMatch.css';

const SPEECH_RATE_LS = 'zhuyin.speechRate';
const BEST_LS = 'zhuyin.memBest';
function readRate() {
  try {
    const n = Number(localStorage.getItem(SPEECH_RATE_LS));
    return Number.isFinite(n) && n > 0 ? Math.min(1.5, Math.max(0.5, n)) : 1.0;
  } catch { return 1.0; }
}
function readBest() {
  try { return JSON.parse(localStorage.getItem(BEST_LS) || '{}') || {}; } catch { return {}; }
}

function MemoryBoard({ cards, deckKey }) {
  const { t, lang } = useI18n();
  const [state, dispatch] = useMemoryMatch({ cards, pairCount: 6 });
  const { speak } = useSpeech({ rate: readRate() });
  const { autoPlay } = useAutoPlay();
  const prevMatched = useRef(0);
  const [best, setBest] = useState(() => readBest()[deckKey] ?? null);

  useEffect(() => {
    if (state.matched.length > prevMatched.current && autoPlay) {
      const pid = state.matched[state.matched.length - 1];
      const tile = state.tiles.find((tl) => tl.pairId === pid);
      if (tile) speak(tile.zh, { id: `m-${pid}` });
    }
    prevMatched.current = state.matched.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.matched.length]);

  useEffect(() => {
    if (state.status !== 'won') return;
    if (best == null || state.moves < best) {
      setBest(state.moves);
      try {
        const all = readBest();
        all[deckKey] = state.moves;
        localStorage.setItem(BEST_LS, JSON.stringify(all));
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  return (
    <>
      <div className="mm-status">
        <span className="mm-moves">{t('tools.memory.moves')}: {state.moves}</span>
        {best != null && <span className="mm-best">{t('tools.memory.best', { n: best })}</span>}
        <button className="mm-new" onClick={() => dispatch({ type: 'NEW_GAME' })}>
          {t('tools.memory.newGame')}
        </button>
      </div>
      {state.status === 'won' && (
        <p className="mm-won">🎉 {t('tools.memory.won', { moves: state.moves })}</p>
      )}
      <div className="mm-grid">
        {state.tiles.map((tile) => {
          const isMatched = state.matched.includes(tile.pairId);
          const isFlipped = state.flipped.includes(tile.key) || isMatched;
          const cls = [
            'mm-tile',
            isFlipped ? 'mm-tile--face' : 'mm-tile--back',
            isMatched ? 'mm-tile--matched' : '',
          ].filter(Boolean).join(' ');
          return (
            <button
              key={tile.key}
              className={cls}
              disabled={isFlipped || state.flipped.length >= 2}
              onClick={() => dispatch({ type: 'FLIP', key: tile.key })}
              aria-label={isFlipped ? undefined : 'hidden card'}
            >
              {isFlipped ? (
                tile.face === 'zh' ? (
                  <span className="mm-zh">{tile.zh}</span>
                ) : (
                  <span className="mm-gloss">{tile[lang] ?? tile.en}</span>
                )
              ) : (
                <span className="mm-back-mark">注</span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

export default function MemoryMatch({ onBack }) {
  const { t } = useI18n();
  const [deckKey, setDeckKey] = useState(DECKS[0].key);
  const deck = DECKS.find((d) => d.key === deckKey) || DECKS[0];

  return (
    <div className="mm-wrap">
      <TopBar title={t('tools.memory.title')} onBack={onBack} />
      <main className="mm-main">
        <p className="mm-intro">{t('tools.memory.intro')}</p>
        <div className="mm-decks">
          {DECKS.map((d) => (
            <button
              key={d.key}
              className={`mm-deck${d.key === deckKey ? ' mm-deck--active' : ''}`}
              onClick={() => setDeckKey(d.key)}
            >
              {d.zh}
            </button>
          ))}
        </div>
        <MemoryBoard key={deckKey} cards={deck.cards} deckKey={deckKey} />
      </main>
    </div>
  );
}
