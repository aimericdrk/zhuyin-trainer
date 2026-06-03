import { useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';
import { useI18n } from '../i18n/I18nContext';
import './HanziWriterPanel.css';

// Animated, step-by-step stroke-order trainer for a single character, backed by
// hanzi-writer. `animate` plays the strokes in order; `practice` (quiz) makes
// the learner draw each stroke and checks it. Character data is fetched on
// demand from the hanzi-writer-data CDN.
export default function HanziWriterPanel({ char, size = 280 }) {
  const { t } = useI18n();
  const targetRef = useRef(null);
  const writerRef = useRef(null);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return undefined;
    el.innerHTML = '';
    writerRef.current = null;
    // Skip in tests / SSR (no real layout, and we must not hit the data CDN).
    if (process.env.NODE_ENV === 'test' || typeof window === 'undefined'
        || typeof window.requestAnimationFrame !== 'function') {
      return undefined;
    }
    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue('--ink').trim() || '#1f1a14';
    const accent = css.getPropertyValue('--accent').trim() || '#b8473b';
    const soft = css.getPropertyValue('--accent-soft').trim() || '#e8c9a0';
    try {
      writerRef.current = HanziWriter.create(el, char, {
        width: size,
        height: size,
        padding: 8,
        showOutline: true,
        strokeColor: ink,
        outlineColor: soft,
        drawingColor: accent,
        radicalColor: accent,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 220,
        showHintAfterMisses: 2,
        highlightOnComplete: true,
        onLoadCharDataError: () => { /* offline / network — leave the grid */ },
      });
      // Start in writing (practice) mode so the learner can write immediately.
      writerRef.current.quiz({ showHintAfterMisses: 2 });
    } catch {
      writerRef.current = null;
    }
    return () => {
      try { writerRef.current && writerRef.current.cancelQuiz && writerRef.current.cancelQuiz(); } catch { /* ignore */ }
      if (el) el.innerHTML = '';
      writerRef.current = null;
    };
  }, [char, size]);

  const animate = () => { try { writerRef.current && writerRef.current.animateCharacter(); } catch { /* ignore */ } };
  const practice = () => { try { writerRef.current && writerRef.current.quiz({ showHintAfterMisses: 2 }); } catch { /* ignore */ } };
  const reset = () => {
    try {
      const w = writerRef.current;
      if (!w) return;
      if (w.cancelQuiz) w.cancelQuiz();
      w.showOutline();
      w.showCharacter();
    } catch { /* ignore */ }
  };

  return (
    <div className="hw-panel">
      <div className="hw-stage" style={{ width: size, height: size }}>
        <svg className="hw-guides" viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
          <rect x="0.5" y="0.5" width="99" height="99" className="hw-border" />
          <line x1="50" y1="0" x2="50" y2="100" className="hw-dash" />
          <line x1="0" y1="50" x2="100" y2="50" className="hw-dash" />
          <line x1="0" y1="0" x2="100" y2="100" className="hw-dash" />
          <line x1="100" y1="0" x2="0" y2="100" className="hw-dash" />
        </svg>
        <div ref={targetRef} className="hw-target" />
      </div>
      <div className="hw-controls">
        <button className="hw-btn hw-btn--accent" onClick={animate}>▶ {t('tools.writing.animate')}</button>
        <button className="hw-btn" onClick={practice}>✎ {t('tools.writing.practice')}</button>
        <button className="hw-btn" onClick={reset}>↺ {t('tools.writing.reset')}</button>
      </div>
    </div>
  );
}
