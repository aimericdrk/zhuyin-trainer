import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

// Global preference for which reading aids accompany Chinese text: pinyin,
// zhuyin and the meaning (gloss/translation). Persisted to localStorage so it
// applies everywhere and survives reloads. Defaults: pinyin + zhuyin on, meaning
// off — fitting a zhuyin trainer, and so drag-and-drop tiles never reveal the
// English by default. Each can be toggled independently from the top bar.
const ANNOT_LS = 'zhuyin.annot';
const DEFAULT = { pinyin: true, zhuyin: true, meaning: false };
const KEYS = ['pinyin', 'zhuyin', 'meaning'];

// Zhuyin (bopomofo) annotations were too small to read comfortably, so their
// size is globally adjustable. Each level multiplies the base size of every
// zhuyin annotation via the `--zhuyin-scale` CSS variable. Persisted, and a
// little bigger than the original by default. Cycled from a top-bar pill.
const SCALE_LS = 'zhuyin.zhscale';
const SCALE_LEVELS = [
  { id: 'S', scale: 1 },
  { id: 'M', scale: 1.3 },
  { id: 'L', scale: 1.7 },
  { id: 'XL', scale: 2.2 },
  { id: 'XXL', scale: 3 },
];
const DEFAULT_SCALE_INDEX = 1; // M

const AnnotationContext = createContext(null);

function readScaleIndex() {
  try {
    const i = parseInt(localStorage.getItem(SCALE_LS), 10);
    if (Number.isInteger(i) && i >= 0 && i < SCALE_LEVELS.length) return i;
  } catch { /* ignore */ }
  return DEFAULT_SCALE_INDEX;
}

function applyScale(scale) {
  try { document.documentElement.style.setProperty('--zhuyin-scale', String(scale)); } catch { /* ignore */ }
}

function readInitial() {
  try {
    const saved = JSON.parse(localStorage.getItem(ANNOT_LS) || 'null');
    if (saved && typeof saved === 'object') {
      return {
        pinyin: typeof saved.pinyin === 'boolean' ? saved.pinyin : DEFAULT.pinyin,
        zhuyin: typeof saved.zhuyin === 'boolean' ? saved.zhuyin : DEFAULT.zhuyin,
        meaning: typeof saved.meaning === 'boolean' ? saved.meaning : DEFAULT.meaning,
      };
    }
  } catch { /* ignore */ }
  return DEFAULT;
}

export function AnnotationProvider({ children }) {
  const [annot, setAnnot] = useState(readInitial);
  const [scaleIndex, setScaleIndex] = useState(readScaleIndex);

  useEffect(() => {
    try { localStorage.setItem(ANNOT_LS, JSON.stringify(annot)); } catch { /* ignore */ }
  }, [annot]);

  useEffect(() => {
    try { localStorage.setItem(SCALE_LS, String(scaleIndex)); } catch { /* ignore */ }
    applyScale(SCALE_LEVELS[scaleIndex].scale);
  }, [scaleIndex]);

  const toggle = useCallback((key) => {
    if (!KEYS.includes(key)) return;
    setAnnot((a) => ({ ...a, [key]: !a[key] }));
  }, []);

  const cycleZhuyinScale = useCallback(() => {
    setScaleIndex((i) => (i + 1) % SCALE_LEVELS.length);
  }, []);

  const value = useMemo(
    () => ({ annot, toggle, cycleZhuyinScale, zhuyinScale: SCALE_LEVELS[scaleIndex].scale, zhuyinScaleLabel: SCALE_LEVELS[scaleIndex].id }),
    [annot, toggle, cycleZhuyinScale, scaleIndex]
  );
  return <AnnotationContext.Provider value={value}>{children}</AnnotationContext.Provider>;
}

// Tolerant of a missing provider so isolated component tests still work.
export function useAnnotation() {
  const ctx = useContext(AnnotationContext);
  if (!ctx) return { annot: DEFAULT, toggle: () => { }, cycleZhuyinScale: () => { }, zhuyinScale: 1, zhuyinScaleLabel: 'S' };
  return ctx;
}

export { DEFAULT as ANNOTATION_DEFAULT, KEYS as ANNOTATION_KEYS };
