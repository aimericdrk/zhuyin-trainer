import characters from './characters.json';
import { ALL_ZHUYIN, TONE_MARKS } from './keyboardLayout';

test('characters.json is a non-empty array', () => {
  expect(Array.isArray(characters)).toBe(true);
  expect(characters.length).toBeGreaterThan(0);
});

test('every entry has required fields with valid shapes', () => {
  for (const e of characters) {
    expect(typeof e.id).toBe('string');
    expect(e.id.length).toBeGreaterThan(0);
    expect(typeof e.character).toBe('string');
    expect(e.character.length).toBeGreaterThanOrEqual(1);
    expect(typeof e.pinyin).toBe('string');
    expect(typeof e.pinyinPlain).toBe('string');
    expect(Array.isArray(e.zhuyin)).toBe(true);
    expect(e.zhuyin.length).toBeGreaterThan(0);

    for (const z of e.zhuyin) {
      expect(ALL_ZHUYIN.has(z)).toBe(true);
    }

    expect([1, 2, 3, 4, 5]).toContain(e.tone);
    expect(TONE_MARKS).toHaveProperty(String(e.tone));

    expect(typeof e.meaning.en).toBe('string');
    expect(e.meaning.en.length).toBeGreaterThan(0);
    expect(typeof e.meaning.fr).toBe('string');
    expect(e.meaning.fr.length).toBeGreaterThan(0);

    expect(typeof e.sentence.chinese).toBe('string');
    expect(Array.isArray(e.sentence.words)).toBe(true);
    expect(e.sentence.words.length).toBeGreaterThan(0);

    for (const w of e.sentence.words) {
      expect(typeof w.char).toBe('string');
      expect(typeof w.en).toBe('string');
      expect(typeof w.fr).toBe('string');
      expect(typeof w.pinyin).toBe('string');
      expect(w.pinyin.length).toBeGreaterThan(0);
      expect(typeof w.zhuyin).toBe('string');
      expect(w.zhuyin.length).toBeGreaterThan(0);
    }

    expect(typeof e.sentence.translation.en).toBe('string');
    expect(typeof e.sentence.translation.fr).toBe('string');
  }
});

test('ids are unique', () => {
  const ids = characters.map((e) => e.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test('every sentence word has pinyin and zhuyin annotations', () => {
  for (const e of characters) {
    for (const w of e.sentence.words) {
      expect(typeof w.pinyin).toBe('string');
      expect(w.pinyin.length).toBeGreaterThan(0);
      expect(typeof w.zhuyin).toBe('string');
      expect(w.zhuyin.length).toBeGreaterThan(0);
    }
  }
});
