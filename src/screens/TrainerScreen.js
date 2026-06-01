import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useTrainer } from '../hooks/useTrainer';
import { useSpeech } from '../hooks/useSpeech';
import { useShuffledLayout } from '../hooks/useShuffledLayout';
import TopBar from '../components/TopBar';
import ZhuyinKeyboard from '../components/ZhuyinKeyboard';
import PhoneKeyboard from '../components/PhoneKeyboard';
import InputStrip from '../components/InputStrip';
import CharacterCard from '../components/CharacterCard';
import ContextPanel from '../components/ContextPanel';
import ActionBar from '../components/ActionBar';
import Switch from '../components/Switch';
import NativeInput from '../components/NativeInput';
import characters from '../data/characters.json';
import './TrainerScreen.css';

const SHUFFLE_KEY_LS = 'zhuyin.shuffleKeys';
const SHOW_COUNT_LS = 'zhuyin.showCount';
const NATIVE_INPUT_LS = 'zhuyin.nativeInput';
const PHONE_LAYOUT_LS = 'zhuyin.phoneLayout';
const SPEECH_RATE_LS = 'zhuyin.speechRate';

function readInitialShuffle() {
  try { return localStorage.getItem(SHUFFLE_KEY_LS) === '1'; } catch { return false; }
}

function readInitialShowCount() {
  try { return localStorage.getItem(SHOW_COUNT_LS) !== '0'; } catch { return true; }
}

function readInitialNativeInput() {
  try { return localStorage.getItem(NATIVE_INPUT_LS) === '1'; } catch { return false; }
}

function readInitialPhoneLayout() {
  try { return localStorage.getItem(PHONE_LAYOUT_LS) === '1'; } catch { return false; }
}

function readInitialSpeechRate() {
  try {
    const raw = localStorage.getItem(SPEECH_RATE_LS);
    const n = raw == null ? 1.0 : Number(raw);
    if (!Number.isFinite(n)) return 1.0;
    return Math.min(1.5, Math.max(0.5, n));
  } catch { return 1.0; }
}

function freshSeed() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export default function TrainerScreen({ onBack }) {
  const { t } = useI18n();
  const [state, dispatch] = useTrainer({ characters });
  const [shuffleKeys, setShuffleKeys] = useState(readInitialShuffle);
  const [shuffleSeed, setShuffleSeed] = useState(freshSeed);
  const [showCount, setShowCount] = useState(readInitialShowCount);
  const [nativeInput, setNativeInput] = useState(readInitialNativeInput);
  const [phoneLayout, setPhoneLayout] = useState(readInitialPhoneLayout);
  const [speechRate, setSpeechRate] = useState(readInitialSpeechRate);
  const { speak, speakingId, supported: audioSupported } = useSpeech({ rate: speechRate });
  const layout = useShuffledLayout({ enabled: shuffleKeys, promptId: shuffleSeed });

  useEffect(() => {
    try { localStorage.setItem(SHUFFLE_KEY_LS, shuffleKeys ? '1' : '0'); } catch {}
  }, [shuffleKeys]);

  useEffect(() => {
    try { localStorage.setItem(SHOW_COUNT_LS, showCount ? '1' : '0'); } catch {}
  }, [showCount]);

  useEffect(() => {
    try { localStorage.setItem(NATIVE_INPUT_LS, nativeInput ? '1' : '0'); } catch {}
  }, [nativeInput]);

  useEffect(() => {
    try { localStorage.setItem(PHONE_LAYOUT_LS, phoneLayout ? '1' : '0'); } catch {}
  }, [phoneLayout]);

  useEffect(() => {
    try { localStorage.setItem(SPEECH_RATE_LS, String(speechRate)); } catch {}
  }, [speechRate]);

  useEffect(() => {
    setShuffleSeed(freshSeed());
  }, [state.current.id]);

  const interactionDisabled = state.phase === 'correct' || state.phase === 'wrong' || state.phase === 'revealed';

  const renderAnswerStrip = () => {
    if (state.phase !== 'revealed') {
      return (
        <div className="ts-strip-row">
          <InputStrip
            length={state.expected.length}
            input={state.input}
            perSymbolResult={state.perSymbolResult}
            phase={state.phase}
            groups={state.groups}
            showCount={showCount}
          />
          <div className="ts-strip-switch">
            <Switch
              checked={showCount}
              onChange={() => setShowCount((v) => !v)}
              label={t('trainer.showCount')}
            />
          </div>
        </div>
      );
    }
    return (
      <div className="ts-revealed">
        <InputStrip
          length={state.expected.length}
          input={state.expected}
          perSymbolResult={state.expected.map(() => 'ok')}
          phase="correct"
          groups={state.groups}
          showCount={true}
        />
        <button className="ts-continue" onClick={() => dispatch({ type: 'CONTINUE' })}>
          {t('trainer.continue')}
        </button>
      </div>
    );
  };

  const renderKeyboard = () => {
    if (nativeInput) {
      return (
        <NativeInput
          onSymbol={(symbol) => dispatch({ type: 'TAP_SYMBOL', symbol })}
          onBackspace={() => dispatch({ type: 'BACKSPACE' })}
          disabled={interactionDisabled}
          promptId={state.current.id}
          placeholder={t('trainer.nativeInputPlaceholder')}
        />
      );
    }
    if (phoneLayout) {
      return (
        <PhoneKeyboard
          mode="hard"
          onTap={(symbol) => dispatch({ type: 'TAP_SYMBOL', symbol })}
          disabled={interactionDisabled}
        />
      );
    }
    return (
      <ZhuyinKeyboard
        mode="hard"
        onTap={(symbol) => dispatch({ type: 'TAP_SYMBOL', symbol })}
        disabled={interactionDisabled}
        layout={layout}
      />
    );
  };

  return (
    <div className="ts-wrap">
      <TopBar title={t('trainer.easyTitle')} onBack={onBack} stats={state.stats} />
      <main className="ts-main ts-main--easy">
        <section className="ts-game">
          <CharacterCard
            character={state.current.character}
            pinyin={state.current.pinyin}
            speak={speak}
            speakingId={speakingId}
            audioSupported={audioSupported}
          />
          {renderAnswerStrip()}
          <div className="ts-mobile-context">
            <ContextPanel
              entry={state.current}
              collapsibleOnMobile
              speak={speak}
              speakingId={speakingId}
              audioSupported={audioSupported}
              speechRate={speechRate}
              onSpeechRateChange={setSpeechRate}
            />
          </div>
          {state.phase !== 'revealed' && (
            <>
              {renderKeyboard()}
              <ActionBar
                onSkip={() => dispatch({ type: 'SKIP' })}
                onBackspace={() => dispatch({ type: 'BACKSPACE' })}
                onSolution={() => dispatch({ type: 'SOLUTION' })}
                shuffleKeys={shuffleKeys}
                onToggleShuffle={() => {
                  setShuffleSeed(freshSeed());
                  setShuffleKeys((v) => !v);
                }}
                nativeInput={nativeInput}
                onToggleNativeInput={() => setNativeInput((v) => !v)}
                phoneLayout={phoneLayout}
                onTogglePhoneLayout={() => setPhoneLayout((v) => !v)}
                disabled={interactionDisabled}
              />
            </>
          )}
        </section>
        <aside className="ts-desktop-context">
          <ContextPanel
            entry={state.current}
            collapsibleOnMobile={false}
            speak={speak}
            speakingId={speakingId}
            audioSupported={audioSupported}
            speechRate={speechRate}
            onSpeechRateChange={setSpeechRate}
          />
        </aside>
      </main>
    </div>
  );
}
