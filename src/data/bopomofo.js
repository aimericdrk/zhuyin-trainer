// Reference data for the Bopomofo (注音符號) chart. Each symbol carries its
// pinyin equivalent and an example word — tapping plays the example, because a
// lone symbol does not speak well in TTS. Grouped the traditional way:
// initials 聲母, medials 介音, finals 韻母, plus the tone marks.

export const INITIALS = [
  { sym: 'ㄅ', py: 'b', ex: '爸', exPy: 'bà' },
  { sym: 'ㄆ', py: 'p', ex: '婆', exPy: 'pó' },
  { sym: 'ㄇ', py: 'm', ex: '媽', exPy: 'mā' },
  { sym: 'ㄈ', py: 'f', ex: '飛', exPy: 'fēi' },
  { sym: 'ㄉ', py: 'd', ex: '大', exPy: 'dà' },
  { sym: 'ㄊ', py: 't', ex: '湯', exPy: 'tāng' },
  { sym: 'ㄋ', py: 'n', ex: '你', exPy: 'nǐ' },
  { sym: 'ㄌ', py: 'l', ex: '來', exPy: 'lái' },
  { sym: 'ㄍ', py: 'g', ex: '狗', exPy: 'gǒu' },
  { sym: 'ㄎ', py: 'k', ex: '看', exPy: 'kàn' },
  { sym: 'ㄏ', py: 'h', ex: '好', exPy: 'hǎo' },
  { sym: 'ㄐ', py: 'j', ex: '家', exPy: 'jiā' },
  { sym: 'ㄑ', py: 'q', ex: '七', exPy: 'qī' },
  { sym: 'ㄒ', py: 'x', ex: '謝', exPy: 'xiè' },
  { sym: 'ㄓ', py: 'zh', ex: '中', exPy: 'zhōng' },
  { sym: 'ㄔ', py: 'ch', ex: '吃', exPy: 'chī' },
  { sym: 'ㄕ', py: 'sh', ex: '是', exPy: 'shì' },
  { sym: 'ㄖ', py: 'r', ex: '人', exPy: 'rén' },
  { sym: 'ㄗ', py: 'z', ex: '字', exPy: 'zì' },
  { sym: 'ㄘ', py: 'c', ex: '菜', exPy: 'cài' },
  { sym: 'ㄙ', py: 's', ex: '三', exPy: 'sān' },
];

export const MEDIALS = [
  { sym: 'ㄧ', py: 'i / yi', ex: '一', exPy: 'yī' },
  { sym: 'ㄨ', py: 'u / wu', ex: '五', exPy: 'wǔ' },
  { sym: 'ㄩ', py: 'ü / yu', ex: '魚', exPy: 'yú' },
];

export const FINALS = [
  { sym: 'ㄚ', py: 'a', ex: '媽', exPy: 'mā' },
  { sym: 'ㄛ', py: 'o', ex: '婆', exPy: 'pó' },
  { sym: 'ㄜ', py: 'e', ex: '喝', exPy: 'hē' },
  { sym: 'ㄝ', py: 'ê', ex: '爺', exPy: 'yé' },
  { sym: 'ㄞ', py: 'ai', ex: '愛', exPy: 'ài' },
  { sym: 'ㄟ', py: 'ei', ex: '杯', exPy: 'bēi' },
  { sym: 'ㄠ', py: 'ao', ex: '好', exPy: 'hǎo' },
  { sym: 'ㄡ', py: 'ou', ex: '走', exPy: 'zǒu' },
  { sym: 'ㄢ', py: 'an', ex: '三', exPy: 'sān' },
  { sym: 'ㄣ', py: 'en', ex: '很', exPy: 'hěn' },
  { sym: 'ㄤ', py: 'ang', ex: '忙', exPy: 'máng' },
  { sym: 'ㄥ', py: 'eng', ex: '冷', exPy: 'lěng' },
  { sym: 'ㄦ', py: 'er', ex: '二', exPy: 'èr' },
];

export const TONES = [
  { mark: 'ˉ', py: '1st · high', ex: '媽', exPy: 'mā' },
  { mark: 'ˊ', py: '2nd · rising', ex: '麻', exPy: 'má' },
  { mark: 'ˇ', py: '3rd · dipping', ex: '馬', exPy: 'mǎ' },
  { mark: 'ˋ', py: '4th · falling', ex: '罵', exPy: 'mà' },
  { mark: '˙', py: 'neutral', ex: '嗎', exPy: 'ma' },
];

export const BOPOMOFO_GROUPS = [
  { key: 'initials', zh: '聲母', items: INITIALS },
  { key: 'medials', zh: '介音', items: MEDIALS },
  { key: 'finals', zh: '韻母', items: FINALS },
];

export const ALL_SYMBOLS = [...INITIALS, ...MEDIALS, ...FINALS];

// Active-recall generator: show a zhuyin symbol, pick its pinyin sound. Emits a
// self-contained quiz item (own options + audio) for useGameQuiz. Plays the
// example word on reveal.
function shuffleWith(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const N_OPTIONS = 6;

export function generateBopomofo(rand = Math.random, prevId = null) {
  let candidates = ALL_SYMBOLS;
  if (prevId && ALL_SYMBOLS.length > 1) candidates = ALL_SYMBOLS.filter((s) => s.sym !== prevId);
  const target = shuffleWith(candidates, rand)[0];
  const seen = new Set([target.py]);
  const distractors = [];
  for (const s of shuffleWith(ALL_SYMBOLS, rand)) {
    if (distractors.length >= N_OPTIONS - 1) break;
    if (s.sym === target.sym || seen.has(s.py)) continue;
    seen.add(s.py);
    distractors.push(s);
  }
  const options = shuffleWith(
    [target, ...distractors].map((s) => ({ id: s.sym, zh: s.py, py: '' })),
    rand
  );
  return {
    id: target.sym,
    prompt: { zh: target.sym, gloss: { en: 'Which sound is this?', fr: 'Quel son est-ce ?' } },
    options,
    correctId: target.sym,
    audio: target.ex,
    autoPlay: false,
  };
}
