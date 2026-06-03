import { INITIALS, MEDIALS, FINALS, ALL_SYMBOLS, TONES, generateBopomofo } from './bopomofo';

test('there are 37 zhuyin symbols (21 initials + 3 medials + 13 finals)', () => {
  expect(INITIALS).toHaveLength(21);
  expect(MEDIALS).toHaveLength(3);
  expect(FINALS).toHaveLength(13);
  expect(ALL_SYMBOLS).toHaveLength(37);
});

test('every symbol has a pinyin and an example with reading', () => {
  for (const s of ALL_SYMBOLS) {
    expect(s.sym).toBeTruthy();
    expect(s.py).toBeTruthy();
    expect(s.ex).toBeTruthy();
    expect(s.exPy).toBeTruthy();
  }
});

test('symbols are unique', () => {
  const syms = ALL_SYMBOLS.map((s) => s.sym);
  expect(new Set(syms).size).toBe(syms.length);
});

test('five tone marks', () => {
  expect(TONES).toHaveLength(5);
});

describe('generateBopomofo', () => {
  test('asks for a symbol with its sound among options, avoids repeats', () => {
    let s = 4;
    const rand = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
    let prev = null;
    for (let i = 0; i < 80; i++) {
      const q = generateBopomofo(rand, prev);
      expect(q.prompt.zh).toBeTruthy();
      expect(q.options.some((o) => o.id === q.correctId)).toBe(true);
      const sounds = q.options.map((o) => o.zh);
      expect(new Set(sounds).size).toBe(sounds.length);
      expect(q.id).not.toBe(prev);
      prev = q.id;
    }
  });
});
