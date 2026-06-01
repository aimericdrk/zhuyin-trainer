export const ZHUYIN_LAYOUT = {
  initials: [
    ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ'],
    ['ㄉ', 'ㄊ', 'ㄋ', 'ㄌ'],
    ['ㄍ', 'ㄎ', 'ㄏ'],
    ['ㄐ', 'ㄑ', 'ㄒ'],
    ['ㄓ', 'ㄔ', 'ㄕ', 'ㄖ'],
    ['ㄗ', 'ㄘ', 'ㄙ'],
  ],
  finals: [
    ['ㄚ', 'ㄛ', 'ㄜ', 'ㄝ'],
    ['ㄞ', 'ㄟ', 'ㄠ', 'ㄡ'],
    ['ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ'],
  ],
  medials: ['ㄧ', 'ㄨ', 'ㄩ'],
  tones: ['ˊ', 'ˇ', 'ˋ', '˙'],
};

export const ALL_ZHUYIN = new Set([
  ...ZHUYIN_LAYOUT.initials.flat(),
  ...ZHUYIN_LAYOUT.finals.flat(),
  ...ZHUYIN_LAYOUT.medials,
]);

export const TONE_MARKS = { 1: '', 2: 'ˊ', 3: 'ˇ', 4: 'ˋ', 5: '˙' };

export const TONE_KEYS = new Set(['ˊ', 'ˇ', 'ˋ', '˙']);

export const PHONE_LAYOUT = {
  rows: [
    ['ㄅ', 'ㄉ', 'ˇ', 'ˋ', 'ㄓ', 'ˊ', '˙', 'ㄚ', 'ㄞ', 'ㄢ'],
    ['ㄆ', 'ㄊ', 'ㄍ', 'ㄐ', 'ㄔ', 'ㄗ', 'ㄧ', 'ㄛ', 'ㄟ', 'ㄣ'],
    ['ㄇ', 'ㄋ', 'ㄎ', 'ㄑ', 'ㄕ', 'ㄘ', 'ㄨ', 'ㄜ', 'ㄠ', 'ㄤ'],
    ['ㄈ', 'ㄌ', 'ㄏ', 'ㄒ', 'ㄖ', 'ㄙ', 'ㄩ', 'ㄝ', 'ㄡ', 'ㄥ'],
  ],
  bottomRow: [
    { kind: 'space', label: '注音' },
    { kind: 'symbol', symbol: 'ㄦ' },
  ],
};
