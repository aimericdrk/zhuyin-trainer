import { useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAnnotation } from '../theme/AnnotationContext';
import { useSpeech } from '../hooks/useSpeech';
import { DECKS } from '../data/quizSets';
import { zhuyinOf } from '../data/pinyinToZhuyin';
import { pickSession, nextBox, mastery, readBoxes, writeBoxes } from '../data/srs';
import TopBar from '../components/TopBar';
import SpeakerButton from '../components/SpeakerButton';
import './ReviewScreen.css';

const SPEECH_RATE_LS = 'zhuyin.speechRate';
const SESSION_SIZE = 12;
function readRate() {
  try {
    const n = Number(localStorage.getItem(SPEECH_RATE_LS));
    return Number.isFinite(n) && n > 0 ? Math.min(1.5, Math.max(0.5, n)) : 1.0;
  } catch { return 1.0; }
}

// One deduped pool across every vocabulary deck.
function buildPool() {
  const byZh = new Map();
  for (const deck of DECKS) {
    for (const c of deck.cards) if (!byZh.has(c.zh)) byZh.set(c.zh, c);
  }
  return [...byZh.values()];
}

export default function ReviewScreen({ onBack }) {
  const { t, lang } = useI18n();
  const { annot } = useAnnotation();
  const { speak, speakingId } = useSpeech({ rate: readRate() });
  const pool = useMemo(buildPool, []);
  const [boxes, setBoxes] = useState(readBoxes);
  const [session, setSession] = useState(() => pickSession(pool, readBoxes(), SESSION_SIZE));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ right: 0, wrong: 0 });

  const card = session[idx];
  const done = idx >= session.length;
  const masteryPct = Math.round(mastery(pool, boxes) * 100);

  function grade(correct) {
    const updated = { ...boxes, [card.id]: nextBox(boxes[card.id], correct) };
    setBoxes(updated);
    writeBoxes(updated);
    setStats((s) => ({ right: s.right + (correct ? 1 : 0), wrong: s.wrong + (correct ? 0 : 1) }));
    setFlipped(false);
    setIdx((i) => i + 1);
  }

  function newSession() {
    const fresh = readBoxes();
    setBoxes(fresh);
    setSession(pickSession(pool, fresh, SESSION_SIZE));
    setIdx(0);
    setFlipped(false);
    setStats({ right: 0, wrong: 0 });
  }

  return (
    <div className="rv-wrap">
      <TopBar title={t('tools.review.title')} onBack={onBack} />
      <main className="rv-main">
        <div className="rv-bar">
          <span>{t('tools.review.mastery', { n: masteryPct })}</span>
          <div className="rv-progress"><div className="rv-progress-fill" style={{ width: `${masteryPct}%` }} /></div>
        </div>

        {done ? (
          <div className="rv-summary">
            <span className="rv-summary-icon">🎉</span>
            <p className="rv-summary-text">{t('tools.review.sessionDone', { right: stats.right, total: session.length })}</p>
            <button className="rv-btn rv-btn--primary" onClick={newSession}>{t('tools.review.newSession')}</button>
          </div>
        ) : (
          <>
            <span className="rv-count">{idx + 1} / {session.length}</span>
            <button
              className={`rv-card${flipped ? ' rv-card--flipped' : ''}`}
              onClick={() => setFlipped((f) => !f)}
            >
              {!flipped ? (
                <span className="rv-zh">{card.zh}</span>
              ) : (
                <span className="rv-back">
                  {annot.zhuyin && <span className="rv-zhuyin">{zhuyinOf(card.py)}</span>}
                  {annot.pinyin && <span className="rv-py">{card.py}</span>}
                  <span className="rv-meaning">{card[lang] ?? card.en}</span>
                </span>
              )}
            </button>
            <SpeakerButton
              label={t('games.replay')}
              onPlay={() => speak(card.zh, { id: card.id })}
              playing={speakingId === card.id}
            />
            {flipped ? (
              <div className="rv-grade">
                <button className="rv-btn rv-btn--again" onClick={() => grade(false)}>✗ {t('tools.review.again')}</button>
                <button className="rv-btn rv-btn--got" onClick={() => grade(true)}>✓ {t('tools.review.gotIt')}</button>
              </div>
            ) : (
              <p className="rv-hint">{t('tools.flashcards.tapToFlip')}</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
