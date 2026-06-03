import { buildNumberPhrase, generateNumber } from './numberPhrase';

describe('buildNumberPhrase', () => {
  test('tiles reconstruct the spelled number', () => {
    const item = buildNumberPhrase(250);
    expect(item.speak).toBe('兩百五十');
    expect(item.tokens.map((t) => t.zh).join('')).toBe('兩百五十');
    expect(item.display).toBe('250');
  });

  test('tiles carry pinyin and unique ids', () => {
    const item = buildNumberPhrase(2005);
    expect(item.speak).toBe('兩千零五');
    const ids = item.tokens.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(item.tokens[0].py).toBe('liǎng');
  });
});

describe('generateNumber', () => {
  test('avoids prevId and stays reconstructable across many draws', () => {
    let s = 7;
    const rand = () => {
      s = (s * 1103515245 + 12345) % 2147483648;
      return s / 2147483648;
    };
    let prev = null;
    for (let n = 0; n < 200; n++) {
      const item = generateNumber(rand, prev);
      expect(item.id).not.toBe(prev);
      expect(item.tokens.map((t) => t.zh).join('')).toBe(item.speak);
      expect(item.value).toBeGreaterThanOrEqual(0);
      expect(item.value).toBeLessThan(100000);
      prev = item.id;
    }
  });
});
