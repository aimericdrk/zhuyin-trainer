import { useCallback, useEffect, useRef, useState } from 'react';

function pickVoice(voices) {
  if (!voices || voices.length === 0) return null;
  const tw = voices.find((v) => v.lang === 'zh-TW');
  if (tw) return tw;
  const anyZh = voices.find((v) => typeof v.lang === 'string' && v.lang.toLowerCase().startsWith('zh'));
  return anyZh ?? null;
}

export function useSpeech({ rate = 1.0 } = {}) {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const [voice, setVoice] = useState(() => (synth ? pickVoice(synth.getVoices()) : null));
  const [speakingId, setSpeakingId] = useState(null);
  const speakingIdRef = useRef(null);
  const utteranceRef = useRef(null);
  const pendingTimerRef = useRef(null);
  const rateRef = useRef(rate);

  useEffect(() => { speakingIdRef.current = speakingId; }, [speakingId]);

  useEffect(() => { rateRef.current = rate; }, [rate]);

  useEffect(() => {
    if (!synth) return undefined;
    if (voice) return undefined;
    const handler = () => {
      const v = pickVoice(synth.getVoices());
      if (v) setVoice(v);
    };
    if (typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', handler);
      return () => synth.removeEventListener('voiceschanged', handler);
    }
    synth.onvoiceschanged = handler;
    return () => { synth.onvoiceschanged = null; };
  }, [synth, voice]);

  useEffect(() => () => {
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    if (synth) synth.cancel();
  }, [synth]);

  const supported = Boolean(synth && voice);

  const speak = useCallback((text, opts) => {
    if (!synth || !voice) return;
    const id = (opts && opts.id) || text;

    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }

    const u = new window.SpeechSynthesisUtterance(text);
    u.lang = 'zh-TW';
    u.voice = voice;
    u.rate = rateRef.current;
    u.onstart = () => setSpeakingId(id);
    u.onend = () => {
      if (speakingIdRef.current === id) setSpeakingId(null);
    };
    u.onerror = () => {
      if (speakingIdRef.current === id) setSpeakingId(null);
    };
    // Holding a reference avoids Chrome GC'ing the utterance while it sits
    // queued, which is one of the documented causes of silent drops.
    utteranceRef.current = u;

    // Chrome bug: cancel() + speak() in the same task strands the queue after
    // a few rapid cycles. Deferring speak() to a new task gives the engine a
    // tick to process the cancel.
    synth.cancel();
    pendingTimerRef.current = setTimeout(() => {
      pendingTimerRef.current = null;
      synth.speak(u);
    }, 100);
  }, [synth, voice]);

  const stop = useCallback(() => {
    if (!synth) return;
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    synth.cancel();
    setSpeakingId(null);
  }, [synth]);

  return { speak, stop, speakingId, supported };
}
