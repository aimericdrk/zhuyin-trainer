// Reading-practice corpus: the example sentences already authored in
// characters.json, deduped. Each sentence is a list of words carrying char,
// pinyin, zhuyin and bilingual gloss — ideal for tap-to-read comprehensible input.
import characters from './characters.json';
import { READING_EXTRA } from './readingExtra';

export function buildSentences(chars, extra = []) {
  const seen = new Set();
  const out = [];
  const push = (s) => {
    if (!s || !Array.isArray(s.words) || s.words.length < 2) return;
    if (seen.has(s.chinese)) return;
    seen.add(s.chinese);
    out.push({ chinese: s.chinese, words: s.words, translation: s.translation });
  };
  for (const c of chars) push(c.sentence);
  for (const s of extra) push(s);
  return out;
}

export const SENTENCES = buildSentences(characters, READING_EXTRA);

function shuffleWith(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Dictation generator (builder engine): play a whole sentence, then arrange its
// word tiles in order. `speak` (used for the correctness check) is the words
// joined; `audio` (used for TTS) is the natural sentence with punctuation.
const DICTATION_POOL = SENTENCES.filter((s) => s.words.length >= 2 && s.words.length <= 7);

export function generateDictation(rand = Math.random, prevId = null) {
  let candidates = DICTATION_POOL;
  if (prevId && DICTATION_POOL.length > 1) {
    candidates = DICTATION_POOL.filter((s) => `dict-${s.chinese}` !== prevId);
  }
  const s = shuffleWith(candidates, rand)[0] || DICTATION_POOL[0];
  const tokens = s.words.map((w, i) => ({ id: `t${i}`, zh: w.char, py: w.pinyin, en: w.en, fr: w.fr }));
  return {
    id: `dict-${s.chinese}`,
    tokens,
    speak: tokens.map((t) => t.zh).join(''),
    audio: s.chinese,
    autoPlay: true,
    gloss: s.translation,
  };
}

