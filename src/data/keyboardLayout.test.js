import { ZHUYIN_LAYOUT, ALL_ZHUYIN, TONE_MARKS } from './keyboardLayout';

test('layout has 21 initials, 13 finals, 3 medials, 4 tone marks', () => {
  const initials = ZHUYIN_LAYOUT.initials.flat();
  const finals = ZHUYIN_LAYOUT.finals.flat();
  expect(initials).toHaveLength(21);
  expect(finals).toHaveLength(13);
  expect(ZHUYIN_LAYOUT.medials).toHaveLength(3);
  expect(ZHUYIN_LAYOUT.tones).toHaveLength(4);
});

test('ALL_ZHUYIN is a set of 37 symbols (no tones)', () => {
  expect(ALL_ZHUYIN.size).toBe(37);
});

test('TONE_MARKS maps tones 2-5 to their mark, tone 1 is empty string', () => {
  expect(TONE_MARKS).toEqual({ 1: '', 2: 'ˊ', 3: 'ˇ', 4: 'ˋ', 5: '˙' });
});

test('TONE_KEYS contains the four tone marks ˊ ˇ ˋ ˙', () => {
  const { TONE_KEYS } = require('./keyboardLayout');
  expect(TONE_KEYS).toBeInstanceOf(Set);
  expect(TONE_KEYS.size).toBe(4);
  expect(TONE_KEYS.has('ˊ')).toBe(true);
  expect(TONE_KEYS.has('ˇ')).toBe(true);
  expect(TONE_KEYS.has('ˋ')).toBe(true);
  expect(TONE_KEYS.has('˙')).toBe(true);
});

test('PHONE_LAYOUT main grid is 4 rows × 10 columns', () => {
  const { PHONE_LAYOUT } = require('./keyboardLayout');
  expect(PHONE_LAYOUT.rows).toHaveLength(4);
  for (const row of PHONE_LAYOUT.rows) {
    expect(row).toHaveLength(10);
  }
});

test('PHONE_LAYOUT bottomRow has a presentational spacebar and an ㄦ symbol key', () => {
  const { PHONE_LAYOUT } = require('./keyboardLayout');
  expect(PHONE_LAYOUT.bottomRow).toEqual([
    { kind: 'space', label: '注音' },
    { kind: 'symbol', symbol: 'ㄦ' },
  ]);
});

test('PHONE_LAYOUT covers every symbol in ALL_ZHUYIN ∪ TONE_KEYS (41 unique symbols)', () => {
  const { PHONE_LAYOUT, ALL_ZHUYIN, TONE_KEYS } = require('./keyboardLayout');
  const fromMain = PHONE_LAYOUT.rows.flat();
  const fromBottom = PHONE_LAYOUT.bottomRow
    .filter((c) => c.kind === 'symbol')
    .map((c) => c.symbol);
  const all = new Set([...fromMain, ...fromBottom]);
  const expected = new Set([...ALL_ZHUYIN, ...TONE_KEYS]);
  expect(all.size).toBe(expected.size);
  for (const sym of expected) {
    expect(all.has(sym)).toBe(true);
  }
});
