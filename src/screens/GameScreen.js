import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAnnotation } from '../theme/AnnotationContext';
import { useAutoPlay } from '../theme/SpeechContext';
import { useGameBuilder } from '../hooks/useGameBuilder';
import { useGameQuiz } from '../hooks/useGameQuiz';
import { useSpeech } from '../hooks/useSpeech';
import { getGame } from '../data/games';
import { zhuyinOf } from '../data/pinyinToZhuyin';
import TopBar from '../components/TopBar';
import SpeakerButton from '../components/SpeakerButton';
import SentenceArranger from '../components/SentenceArranger';
import Clock from '../components/Clock';
import './GameScreen.css';

const SPEECH_RATE_LS = 'zhuyin.speechRate';

function readInitialSpeechRate() {
  try {
    const raw = localStorage.getItem(SPEECH_RATE_LS);
    const n = raw == null ? 1.0 : Number(raw);
    if (!Number.isFinite(n)) return 1.0;
    return Math.min(1.5, Math.max(0.5, n));
  } catch { return 1.0; }
}

// SentenceArranger reads { id, char, pinyin?, zhuyin?, en?, fr? } and shows the
// annotations the global preference allows. Builder tokens carry pinyin only.
function asWords(tokens) {
  return tokens.map((tk) => ({
    id: tk.id, char: tk.zh, pinyin: tk.py, zhuyin: zhuyinOf(tk.py), en: tk.en, fr: tk.fr,
  }));
}

function PromptVisual({ item, gloss }) {
  const { lang } = useI18n();
  const text = gloss ? (gloss[lang] ?? gloss.en) : '';
  return (
    <div className="gm-prompt">
      {typeof item.hour24 === 'number' ? (
        <Clock hour24={item.hour24} minute={item.minute} />
      ) : (
        <span className="gm-prompt-big">{item.display}</span>
      )}
      <span className="gm-prompt-gloss">{text}</span>
    </div>
  );
}

function BuilderBoard({ gameId, onBack }) {
  const game = getGame(gameId);
  const { t } = useI18n();
  const [state, dispatch] = useGameBuilder({ generate: game.generate });
  const { speak, speakingId, supported } = useSpeech({ rate: readInitialSpeechRate() });
  const { autoPlay } = useAutoPlay();
  const cur = state.current;
  const sayText = cur.audio ?? cur.speak;
  const lastPlayed = useRef(null);

  useEffect(() => {
    if ((state.status === 'correct' || state.status === 'revealed') && autoPlay) {
      speak(sayText, { id: cur.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, cur.id]);

  // Auto-play the prompt for dictation (audio-first) on each new item.
  useEffect(() => {
    if (cur.autoPlay && cur.audio && autoPlay && lastPlayed.current !== cur.id) {
      lastPlayed.current = cur.id;
      speak(cur.audio, { id: cur.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur.id]);

  const done = state.status === 'revealed';
  const reveal = state.status === 'correct' || state.status === 'revealed';
  return (
    <div className="gm-wrap">
      <TopBar title={`${game.zh} · ${t(`games.${gameId}.title`)}`} onBack={onBack} stats={state.stats} />
      <main className="gm-main">
        {cur.autoPlay ? (
          <div className="gm-prompt">
            <SpeakerButton
              label={t('games.replay')}
              onPlay={() => speak(cur.audio, { id: cur.id })}
              playing={speakingId === cur.id}
            />
            <span className="gm-prompt-q">{t('games.listenArrange')}</span>
          </div>
        ) : (
          <PromptVisual item={cur} gloss={cur.gloss} />
        )}
        {supported && reveal && (
          <div className="gm-answer-audio">
            <SpeakerButton
              label={t('games.playAnswer')}
              onPlay={() => speak(sayText, { id: cur.id })}
              playing={speakingId === cur.id}
            />
            <span className="gm-answer-zh">{cur.audio ?? cur.speak}</span>
          </div>
        )}
        <SentenceArranger
          available={asWords(state.available)}
          placed={asWords(state.placed)}
          status={state.status}
          onPlace={(wordId, toIndex) => dispatch({ type: 'PLACE_WORD', wordId, toIndex })}
          onRemove={(wordId) => dispatch({ type: 'REMOVE_WORD', wordId })}
          onReorder={(fromIndex, toIndex) => dispatch({ type: 'REORDER_PLACED', fromIndex, toIndex })}
        />
        <div className="gm-actions">
          {done ? (
            <button className="gm-btn gm-btn--continue" onClick={() => dispatch({ type: 'CONTINUE' })}>
              {t('trainer.continue')}
            </button>
          ) : (
            <>
              <button
                className="gm-btn gm-btn--secondary"
                onClick={() => dispatch({ type: 'SKIP' })}
                disabled={state.status !== 'arranging'}
              >
                {t('trainer.skip')}
              </button>
              <button
                className="gm-btn gm-btn--accent"
                onClick={() => dispatch({ type: 'SOLUTION' })}
                disabled={state.status !== 'arranging'}
              >
                {t('trainer.solution')}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function QuizPrompt({ prompt, audio, showReplay, speak, speakingId }) {
  const { t, lang } = useI18n();
  const { annot } = useAnnotation();
  const question = prompt.gloss ? (prompt.gloss[lang] ?? prompt.gloss.en) : '';
  return (
    <div className="gm-prompt">
      {showReplay ? (
        <SpeakerButton
          label={t('games.replay')}
          onPlay={() => speak(audio, { id: 'prompt' })}
          playing={speakingId === 'prompt'}
        />
      ) : null}
      {prompt.swatch ? (
        <span className="gm-swatch" style={{ background: prompt.swatch }} aria-hidden="true" />
      ) : null}
      {prompt.emoji ? <span className="gm-prompt-emoji" aria-hidden="true">{prompt.emoji}</span> : null}
      {prompt.zh ? (
        <span className="gm-prompt-zh">
          {prompt.zh}
          {prompt.py && annot.zhuyin ? <span className="gm-prompt-py gm-prompt-zhuyin">{zhuyinOf(prompt.py)}</span> : null}
          {prompt.py && annot.pinyin ? <span className="gm-prompt-py">{prompt.py}</span> : null}
        </span>
      ) : null}
      <span className="gm-prompt-q">{question}</span>
    </div>
  );
}

function QuizBoard({ gameId, onBack }) {
  const game = getGame(gameId);
  const { t } = useI18n();
  const config = game.items ? { items: game.items } : { generate: game.generate };
  const [state, dispatch] = useGameQuiz({ config });
  const { speak, speakingId } = useSpeech({ rate: readInitialSpeechRate() });
  const { annot } = useAnnotation();
  const { autoPlay } = useAutoPlay();
  const cur = state.current;
  const lastPlayed = useRef(null);

  // Auto-play the prompt audio for ear-training (tones) on each new question.
  useEffect(() => {
    if (cur.autoPlay && cur.audio && autoPlay && lastPlayed.current !== cur.id) {
      lastPlayed.current = cur.id;
      speak(cur.audio, { id: 'prompt' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur.id]);

  // Speak the answer on resolution for non-audio prompts.
  useEffect(() => {
    if ((state.status === 'correct' || state.status === 'revealed') && cur.audio && !cur.autoPlay && autoPlay) {
      speak(cur.audio, { id: cur.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  const done = state.status === 'revealed';
  return (
    <div className="gm-wrap">
      <TopBar title={`${game.zh} · ${t(`games.${gameId}.title`)}`} onBack={onBack} stats={state.stats} />
      <main className="gm-main">
        <QuizPrompt
          prompt={cur.prompt}
          audio={cur.audio}
          showReplay={Boolean(cur.autoPlay && cur.audio)}
          speak={speak}
          speakingId={speakingId}
        />
        <div className="gm-grid">
          {cur.options.map((opt) => {
            const isPicked = state.picked.has(opt.id);
            const isCorrect = opt.id === cur.correctId;
            const showCorrect = isCorrect && isPicked && (state.status === 'correct' || state.status === 'revealed');
            const showWrong = isPicked && !isCorrect;
            const cls = ['gm-chip', showWrong ? 'gm-chip--wrong' : '', showCorrect ? 'gm-chip--correct' : '']
              .filter(Boolean).join(' ');
            return (
              <button
                key={opt.id}
                type="button"
                className={cls}
                disabled={isPicked || state.status !== 'guessing'}
                onClick={() => dispatch({ type: 'PICK_OPTION', optionId: opt.id })}
              >
                <span className="gm-chip-zh">{opt.zh}</span>
                {opt.py && annot.zhuyin ? <span className="gm-chip-py gm-chip-zhuyin">{zhuyinOf(opt.py)}</span> : null}
                {opt.py && annot.pinyin ? <span className="gm-chip-py">{opt.py}</span> : null}
              </button>
            );
          })}
        </div>
        <div className="gm-actions">
          {done ? (
            <button className="gm-btn gm-btn--continue" onClick={() => dispatch({ type: 'CONTINUE' })}>
              {t('trainer.continue')}
            </button>
          ) : (
            <>
              <button
                className="gm-btn gm-btn--secondary"
                onClick={() => dispatch({ type: 'SKIP' })}
                disabled={state.status !== 'guessing'}
              >
                {t('trainer.skip')}
              </button>
              <button
                className="gm-btn gm-btn--accent"
                onClick={() => dispatch({ type: 'SOLUTION' })}
                disabled={state.status !== 'guessing'}
              >
                {t('trainer.solution')}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function GameScreen({ gameId, onBack }) {
  const game = getGame(gameId);
  const { t } = useI18n();
  if (!game) {
    return (
      <div className="gm-wrap">
        <TopBar title={t('games.title')} onBack={onBack} />
        <main className="gm-main"><p className="gm-empty">Unknown game.</p></main>
      </div>
    );
  }
  return game.engine === 'builder'
    ? <BuilderBoard gameId={gameId} onBack={onBack} />
    : <QuizBoard gameId={gameId} onBack={onBack} />;
}
