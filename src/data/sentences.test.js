import { buildSentences, SENTENCES, generateDictation } from './sentences';

test('extracts deduped multi-word sentences from the corpus', () => {
  expect(SENTENCES.length).toBeGreaterThan(5);
  const chinese = SENTENCES.map((s) => s.chinese);
  expect(new Set(chinese).size).toBe(chinese.length);
  for (const s of SENTENCES) {
    expect(Array.isArray(s.words)).toBe(true);
    expect(s.words.length).toBeGreaterThanOrEqual(2);
    expect(s.translation).toBeTruthy();
  }
});

test('buildSentences skips entries without a usable sentence', () => {
  const out = buildSentences([
    { sentence: null },
    { sentence: { chinese: '一', words: [{ char: '一' }] } },
    { sentence: { chinese: '你好嗎', words: [{ char: '你' }, { char: '好' }], translation: { en: 'ok', fr: 'ok' } } },
  ]);
  expect(out).toHaveLength(1);
  expect(out[0].chinese).toBe('你好嗎');
});

describe('generateDictation', () => {
  test('tiles join to speak; audio is the full sentence; auto-plays', () => {
    let s = 41;
    const rand = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
    let prev = null;
    for (let i = 0; i < 60; i++) {
      const item = generateDictation(rand, prev);
      expect(item.autoPlay).toBe(true);
      expect(item.tokens.map((t) => t.zh).join('')).toBe(item.speak);
      expect(typeof item.audio).toBe('string');
      expect(item.gloss).toBeTruthy();
      expect(item.id).not.toBe(prev);
      prev = item.id;
    }
  });
});
