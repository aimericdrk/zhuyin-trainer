import { buildToneItem, generateTone, TONE_BASES, TONE_OPTIONS } from './tonePhrase';

describe('tone data integrity', () => {
  test('every base has 4 chars and 4 pinyin', () => {
    for (const base of TONE_BASES) {
      expect(base.chars).toHaveLength(4);
      expect(base.py).toHaveLength(4);
    }
  });

  test('four tone options', () => {
    expect(TONE_OPTIONS.map((o) => o.id)).toEqual(['tone1', 'tone2', 'tone3', 'tone4']);
  });
});

describe('buildToneItem', () => {
  test('correctId matches the tone and audio is the right character', () => {
    const item = buildToneItem(0, 3); // ma base, 3rd tone → 馬
    expect(item.correctId).toBe('tone3');
    expect(item.audio).toBe('馬');
    expect(item.autoPlay).toBe(true);
    expect(item.options).toHaveLength(4);
  });
});

describe('generateTone', () => {
  test('avoids prevId and always yields a valid tone item', () => {
    let s = 9;
    const rand = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
    let prev = null;
    for (let i = 0; i < 100; i++) {
      const item = generateTone(rand, prev);
      expect(item.id).not.toBe(prev);
      expect(item.correctId).toMatch(/^tone[1-4]$/);
      prev = item.id;
    }
  });
});
