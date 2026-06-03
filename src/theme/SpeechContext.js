import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

// Whether audio (text-to-speech) auto-plays — e.g. the prompt in Listening /
// Tones / Dictation, and the partner's lines in Conversation. Manual replay
// (tapping a speaker / bubble) always works regardless. Persisted; default on.
const LS = 'zhuyin.autoplay';
const SpeechContext = createContext(null);

function readInitial() {
  try { return localStorage.getItem(LS) !== '0'; } catch { return true; }
}

export function SpeechProvider({ children }) {
  const [autoPlay, setAutoPlay] = useState(readInitial);

  useEffect(() => {
    try { localStorage.setItem(LS, autoPlay ? '1' : '0'); } catch { /* ignore */ }
  }, [autoPlay]);

  const toggleAutoPlay = useCallback(() => setAutoPlay((v) => !v), []);
  const value = useMemo(() => ({ autoPlay, toggleAutoPlay }), [autoPlay, toggleAutoPlay]);
  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
}

// Tolerant of a missing provider (default on) so isolated tests still work.
export function useAutoPlay() {
  const ctx = useContext(SpeechContext);
  if (!ctx) return { autoPlay: true, toggleAutoPlay: () => {} };
  return ctx;
}
