import { buildCountPhrase, generateCount, NOUNS } from './countPhrase';

describe('buildCountPhrase', () => {
  test('2 uses 兩 before the measure word', () => {
    const tea = NOUNS.find((n) => n.zh === '茶');
    expect(buildCountPhrase(2, tea).speak).toBe('兩杯茶');
  });

  test('other counts spell normally', () => {
    const book = NOUNS.find((n) => n.zh === '書');
    expect(buildCountPhrase(3, book).speak).toBe('三本書');
    expect(buildCountPhrase(12, book).speak).toBe('十二本書');
  });

  test('tiles reconstruct speak and gloss is bilingual', () => {
    const book = NOUNS.find((n) => n.zh === '書');
    const item = buildCountPhrase(3, book);
    expect(item.tokens.map((t) => t.zh).join('')).toBe(item.speak);
    expect(item.gloss.en).toBe('3 books');
    expect(item.gloss.fr).toBe('3 livres');
  });
});

describe('generateCount', () => {
  test('avoids prevId and reconstructs across draws', () => {
    let s = 13;
    const rand = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
    let prev = null;
    for (let i = 0; i < 150; i++) {
      const item = generateCount(rand, prev);
      expect(item.id).not.toBe(prev);
      expect(item.tokens.map((t) => t.zh).join('')).toBe(item.speak);
      expect(item.value).toBeGreaterThanOrEqual(1);
      expect(item.value).toBeLessThanOrEqual(10);
      prev = item.id;
    }
  });
});
