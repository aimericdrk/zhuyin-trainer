import { useI18n } from '../i18n/I18nContext';
import { useHard } from '../hooks/useHard';
import { useSpeech } from '../hooks/useSpeech';
import { TONE_MARKS } from '../data/keyboardLayout';
import TopBar from '../components/TopBar';
import WordCard from '../components/WordCard';
import MeaningOptions from '../components/MeaningOptions';
import SentenceArranger from '../components/SentenceArranger';
import characters from '../data/characters.json';
import './HardScreen.css';

const SPEECH_RATE_LS = 'zhuyin.speechRate';

function readInitialSpeechRate() {
  try {
    const raw = localStorage.getItem(SPEECH_RATE_LS);
    const n = raw == null ? 1.0 : Number(raw);
    if (!Number.isFinite(n)) return 1.0;
    return Math.min(1.5, Math.max(0.5, n));
  } catch { return 1.0; }
}

function formatZhuyin(entry) {
  if (!entry || !Array.isArray(entry.chars)) return '';
  return entry.chars
    .map((c) => {
      const mark = TONE_MARKS[c.tone] || '';
      return c.zhuyin.join('') + mark;
    })
    .join(' ');
}

export default function HardScreen({ onBack }) {
  const { t, lang } = useI18n();
  const [state, dispatch] = useHard({ characters });
  const { speak, speakingId, supported: audioSupported } = useSpeech({
    rate: readInitialSpeechRate(),
  });

  if (!state.current) {
    return (
      <div className="hd-wrap">
        <TopBar title={t('trainer.hardTitle')} onBack={onBack} stats={state.stats} />
        <main className="hd-main">
          <p className="hd-empty">No words available.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="hd-wrap">
      <TopBar title={t('trainer.hardTitle')} onBack={onBack} stats={state.stats} />
      <main className="hd-main">
        {state.phase === 'mcq' ? (
          <>
            <section className="hd-prompt">
              <WordCard
                character={state.current.character}
                pinyin={state.current.pinyin}
                zhuyin={formatZhuyin(state.current)}
                speak={speak}
                speakingId={speakingId}
                audioSupported={audioSupported}
              />
            </section>
            <section className="hd-options">
              <MeaningOptions
                options={state.options}
                picked={state.picked}
                correctId={state.correctId}
                status={state.status}
                onPick={(id) => dispatch({ type: 'PICK_OPTION', optionId: id })}
              />
            </section>
          </>
        ) : (
          <>
            <section className="hd-order-header">
              <span className="hd-order-label">{t('trainer.arrangeSentence')}</span>
              <span className="hd-order-target">
                "{state.sentenceTranslation
                  ? (state.sentenceTranslation[lang] ?? state.sentenceTranslation.en)
                  : ''}"
              </span>
            </section>
            <section className="hd-options">
              <SentenceArranger
                available={state.available}
                placed={state.placed}
                status={state.status}
                onPlace={(wordId, toIndex) => dispatch({ type: 'PLACE_WORD', wordId, toIndex })}
                onRemove={(wordId) => dispatch({ type: 'REMOVE_WORD', wordId })}
                onReorder={(fromIndex, toIndex) => dispatch({ type: 'REORDER_PLACED', fromIndex, toIndex })}
              />
            </section>
          </>
        )}
        <section className="hd-actions">
          {state.status === 'revealed' ? (
            <button
              className="hd-btn hd-btn--continue"
              onClick={() => dispatch({ type: 'CONTINUE' })}
            >
              {t('trainer.continue')}
            </button>
          ) : (
            <>
              <button
                className="hd-btn hd-btn--secondary"
                onClick={() => dispatch({ type: 'SKIP' })}
                disabled={state.status !== 'guessing' && state.status !== 'arranging'}
              >
                {t('trainer.skip')}
              </button>
              <button
                className="hd-btn hd-btn--accent"
                onClick={() => dispatch({ type: 'SOLUTION' })}
                disabled={state.status !== 'guessing' && state.status !== 'arranging'}
              >
                {t('trainer.solution')}
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
