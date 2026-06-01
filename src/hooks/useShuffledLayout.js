import { useMemo } from 'react';
import { ZHUYIN_LAYOUT } from '../data/keyboardLayout';

function hashString(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let s = seed >>> 0;
  return function rand() {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleArr(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleLayout(base, promptId) {
  const rand = mulberry32(hashString(promptId));
  return {
    initials: base.initials.map((row) => shuffleArr(row, rand)),
    finals: base.finals.map((row) => shuffleArr(row, rand)),
    medials: shuffleArr(base.medials, rand),
    tones: shuffleArr(base.tones, rand),
  };
}

export function useShuffledLayout({ enabled, promptId }) {
  return useMemo(
    () => (enabled ? shuffleLayout(ZHUYIN_LAYOUT, String(promptId)) : ZHUYIN_LAYOUT),
    [enabled, promptId]
  );
}
