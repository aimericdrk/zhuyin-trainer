import { buildMoneyPhrase, generateMoney } from './moneyPhrase';

describe('buildMoneyPhrase', () => {
  test('dollars + jiao with 兩 for 2', () => {
    const item = buildMoneyPhrase(35, 2, 0);
    expect(item.speak).toBe('三十五塊兩毛');
    expect(item.display).toBe('$35.20');
  });

  test('2 dollars exact uses 兩塊', () => {
    expect(buildMoneyPhrase(2, 0, 0).speak).toBe('兩塊');
  });

  test('only jiao', () => {
    expect(buildMoneyPhrase(0, 5, 0).speak).toBe('五毛');
  });

  test('fen included', () => {
    expect(buildMoneyPhrase(1, 0, 8).speak).toBe('一塊八分');
  });

  test('twelve keeps 二', () => {
    expect(buildMoneyPhrase(12, 0, 0).speak).toBe('十二塊');
  });

  test('tiles reconstruct speak', () => {
    const item = buildMoneyPhrase(35, 2, 0);
    expect(item.tokens.map((t) => t.zh).join('')).toBe(item.speak);
  });

  test('tiles carry an English/French meaning gloss', () => {
    const item = buildMoneyPhrase(35, 2, 0);
    const kuai = item.tokens.find((t) => t.zh === '塊');
    expect(kuai.en).toBe('dollar');
    expect(kuai.fr).toBe('dollar');
    const mao = item.tokens.find((t) => t.zh === '毛');
    expect(mao.en).toContain('10');
    // number tiles glossed too
    expect(item.tokens.find((t) => t.zh === '三').en).toBe('3');
  });
});

describe('generateMoney', () => {
  test('never all-zero, reconstructs, avoids prevId', () => {
    let s = 3;
    const rand = () => {
      s = (s * 1103515245 + 12345) % 2147483648;
      return s / 2147483648;
    };
    let prev = null;
    for (let n = 0; n < 200; n++) {
      const item = generateMoney(rand, prev);
      expect(item.id).not.toBe(prev);
      expect(item.speak.length).toBeGreaterThan(0);
      expect(item.tokens.map((t) => t.zh).join('')).toBe(item.speak);
      prev = item.id;
    }
  });
});
