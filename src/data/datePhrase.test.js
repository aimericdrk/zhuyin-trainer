import { buildDatePhrase, generateDate } from './datePhrase';

describe('buildDatePhrase', () => {
  test('composes month/day/weekday in order', () => {
    const item = buildDatePhrase(1, 3, 5); // Monday, March 5
    expect(item.speak).toBe('三月五號星期一');
    expect(item.gloss.en).toBe('Monday, March 5');
    expect(item.gloss.fr).toBe('lundi 5 mars');
  });

  test('handles two-digit days', () => {
    const item = buildDatePhrase(0, 12, 25); // Sunday, Dec 25
    expect(item.speak).toBe('十二月二十五號星期日');
  });

  test('tiles reconstruct speak', () => {
    const item = buildDatePhrase(4, 2, 14);
    expect(item.tokens.map((t) => t.zh).join('')).toBe(item.speak);
  });
});

describe('generateDate', () => {
  test('avoids prevId and reconstructs across draws', () => {
    let s = 11;
    const rand = () => {
      s = (s * 1103515245 + 12345) % 2147483648;
      return s / 2147483648;
    };
    let prev = null;
    for (let n = 0; n < 150; n++) {
      const item = generateDate(rand, prev);
      expect(item.id).not.toBe(prev);
      expect(item.tokens.map((t) => t.zh).join('')).toBe(item.speak);
      prev = item.id;
    }
  });
});
