import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

// Global preference for which reading aids accompany Chinese text: pinyin,
// zhuyin and the meaning (gloss/translation). Persisted to localStorage so it
// applies everywhere and survives reloads. Defaults: pinyin + zhuyin on, meaning
// off — fitting a zhuyin trainer, and so drag-and-drop tiles never reveal the
// English by default. Each can be toggled independently from the top bar.
const ANNOT_LS = 'zhuyin.annot';
const DEFAULT = { pinyin: true, zhuyin: true, meaning: false };
const KEYS = ['pinyin', 'zhuyin', 'meaning'];

// Reading aids / glyphs were too small to read comfortably, so their size is
// globally adjustable. Each level multiplies the base size of every matching
// element via a CSS variable (`--zhuyin-scale`, `--pinyin-scale`,
// `--char-scale`). Persisted, and cycled from top-bar pills. Zhuyin defaults a
// little bigger than the original (M); pinyin and characters default to S (1),
// leaving the app's look unchanged until the user adjusts them.
const SCALE_LEVELS = [
  { id: 'S', scale: 1 },
  { id: 'M', scale: 1.3 },
  { id: 'L', scale: 1.7 },
  { id: 'XL', scale: 2.2 },
  { id: 'XXL', scale: 3 },
];
// Each adjustable scale: its localStorage key, CSS variable, and default level.
const SCALES = {
  zhuyin: { ls: 'zhuyin.zhscale', cssVar: '--zhuyin-scale', defaultIndex: 1 }, // M
  pinyin: { ls: 'zhuyin.pyscale', cssVar: '--pinyin-scale', defaultIndex: 0 }, // S
  char: { ls: 'zhuyin.charscale', cssVar: '--char-scale', defaultIndex: 0 }, // S
};

const AnnotationContext = createContext(null);

function readScaleIndex(cfg) {
  try {
    const i = parseInt(localStorage.getItem(cfg.ls), 10);
    if (Number.isInteger(i) && i >= 0 && i < SCALE_LEVELS.length) return i;
  } catch { /* ignore */ }
  return cfg.defaultIndex;
}

function applyScale(cssVar, scale) {
  try { document.documentElement.style.setProperty(cssVar, String(scale)); } catch { /* ignore */ }
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
  const [zhuyinIndex, setZhuyinIndex] = useState(() => readScaleIndex(SCALES.zhuyin));
  const [pinyinIndex, setPinyinIndex] = useState(() => readScaleIndex(SCALES.pinyin));
  const [charIndex, setCharIndex] = useState(() => readScaleIndex(SCALES.char));

  useEffect(() => {
    try { localStorage.setItem(ANNOT_LS, JSON.stringify(annot)); } catch { /* ignore */ }
  }, [annot]);

  useEffect(() => {
    try { localStorage.setItem(SCALES.zhuyin.ls, String(zhuyinIndex)); } catch { /* ignore */ }
    applyScale(SCALES.zhuyin.cssVar, SCALE_LEVELS[zhuyinIndex].scale);
  }, [zhuyinIndex]);
  useEffect(() => {
    try { localStorage.setItem(SCALES.pinyin.ls, String(pinyinIndex)); } catch { /* ignore */ }
    applyScale(SCALES.pinyin.cssVar, SCALE_LEVELS[pinyinIndex].scale);
  }, [pinyinIndex]);
  useEffect(() => {
    try { localStorage.setItem(SCALES.char.ls, String(charIndex)); } catch { /* ignore */ }
    applyScale(SCALES.char.cssVar, SCALE_LEVELS[charIndex].scale);
  }, [charIndex]);

  const toggle = useCallback((key) => {
    if (!KEYS.includes(key)) return;
    setAnnot((a) => ({ ...a, [key]: !a[key] }));
  }, []);

  const next = (n) => (i) => (i + 1) % n;
  const cycleZhuyinScale = useCallback(() => setZhuyinIndex(next(SCALE_LEVELS.length)), []);
  const cyclePinyinScale = useCallback(() => setPinyinIndex(next(SCALE_LEVELS.length)), []);
  const cycleCharScale = useCallback(() => setCharIndex(next(SCALE_LEVELS.length)), []);

  const value = useMemo(
    () => ({
      annot, toggle,
      cycleZhuyinScale, zhuyinScale: SCALE_LEVELS[zhuyinIndex].scale, zhuyinScaleLabel: SCALE_LEVELS[zhuyinIndex].id,
      cyclePinyinScale, pinyinScale: SCALE_LEVELS[pinyinIndex].scale, pinyinScaleLabel: SCALE_LEVELS[pinyinIndex].id,
      cycleCharScale, charScale: SCALE_LEVELS[charIndex].scale, charScaleLabel: SCALE_LEVELS[charIndex].id,
    }),
    [annot, toggle, cycleZhuyinScale, cyclePinyinScale, cycleCharScale, zhuyinIndex, pinyinIndex, charIndex]
  );
  return <AnnotationContext.Provider value={value}>{children}</AnnotationContext.Provider>;
}

// Tolerant of a missing provider so isolated component tests still work.
export function useAnnotation() {
  const ctx = useContext(AnnotationContext);
  if (!ctx) return {
    annot: DEFAULT, toggle: () => { },
    cycleZhuyinScale: () => { }, zhuyinScale: 1, zhuyinScaleLabel: 'S',
    cyclePinyinScale: () => { }, pinyinScale: 1, pinyinScaleLabel: 'S',
    cycleCharScale: () => { }, charScale: 1, charScaleLabel: 'S',
  };
  return ctx;
}

export { DEFAULT as ANNOTATION_DEFAULT, KEYS as ANNOTATION_KEYS };
