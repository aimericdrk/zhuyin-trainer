import {
  buildTimePhrase,
  generateTime,
  periodFor,
  to12h,
  stylesFor,
} from './timePhrase';

const speakOf = (h, m, style) => buildTimePhrase(h, m, style).speak;

describe('periodFor', () => {
  test('maps hours to periods', () => {
    expect(periodFor(0).zh).toBe('半夜');
    expect(periodFor(3).zh).toBe('凌晨');
    expect(periodFor(7).zh).toBe('早上');
    expect(periodFor(10).zh).toBe('上午');
    expect(periodFor(12).zh).toBe('中午');
    expect(periodFor(15).zh).toBe('下午');
    expect(periodFor(20).zh).toBe('晚上');
    expect(periodFor(23).zh).toBe('晚上');
  });
});

describe('to12h', () => {
  test('converts 24h to 12h', () => {
    expect(to12h(0)).toBe(12);
    expect(to12h(12)).toBe(12);
    expect(to12h(13)).toBe(1);
    expect(to12h(23)).toBe(11);
  });
});

describe('buildTimePhrase', () => {
  test('on the hour', () => {
    expect(speakOf(3, 0, 'sharp')).toBe('凌晨三點');
    expect(speakOf(12, 0, 'sharpZheng')).toBe('中午十二點整');
  });

  test('half past uses 半', () => {
    expect(speakOf(14, 30, 'half')).toBe('下午兩點半');
    expect(speakOf(14, 30, 'minutes')).toBe('下午兩點三十分');
  });

  test('quarters', () => {
    expect(speakOf(0, 15, 'quarter')).toBe('半夜十二點一刻');
    expect(speakOf(15, 45, 'threeQuarter')).toBe('下午三點三刻');
  });

  test('plain minutes with 零 for single digits', () => {
    expect(speakOf(9, 5, 'minutes')).toBe('上午九點零五分');
    expect(speakOf(15, 25, 'minutes')).toBe('下午三點二十五分');
  });

  test('差 (minutes before the hour)', () => {
    expect(speakOf(7, 55, 'to')).toBe('早上差五分八點');
    expect(speakOf(23, 45, 'to')).toBe('晚上差一刻十二點');
    expect(speakOf(13, 50, 'to')).toBe('下午差十分兩點');
  });

  test('2 o’clock uses 兩 not 二', () => {
    expect(speakOf(14, 0, 'sharp')).toBe('下午兩點');
  });

  test('tokens reconstruct speak in order', () => {
    const item = buildTimePhrase(9, 5, 'minutes');
    expect(item.tokens.map((t) => t.zh).join('')).toBe(item.speak);
    expect(item.tokens.every((t) => t.id && t.zh)).toBe(true);
  });

  test('gloss has both languages', () => {
    const item = buildTimePhrase(14, 30, 'half');
    expect(item.gloss.en).toContain('afternoon');
    expect(item.gloss.fr).toContain('après-midi');
    expect(item.display).toBe('14:30');
  });
});

describe('stylesFor', () => {
  test('special minutes expose extra styles', () => {
    expect(stylesFor(0)).toContain('sharp');
    expect(stylesFor(15)).toContain('quarter');
    expect(stylesFor(30)).toContain('half');
    expect(stylesFor(45)).toContain('threeQuarter');
    expect(stylesFor(55)).toContain('to');
    expect(stylesFor(20)).toEqual(['minutes']);
  });
});

describe('generateTime', () => {
  test('is deterministic given a seeded rand and avoids prevId', () => {
    let i = 0;
    const seq = [0.5, 0.3, 0.1, 0.9, 0.2, 0.7, 0.4, 0.8, 0.6, 0.05];
    const rand = () => seq[i++ % seq.length];
    const a = generateTime(rand);
    expect(a.id).toMatch(/^time-/);
    expect(a.tokens.length).toBeGreaterThanOrEqual(2);
    const b = generateTime(rand, a.id);
    expect(b.id).not.toBe(a.id);
  });

  test('many random draws always produce reconstructable tokens', () => {
    let s = 1;
    const rand = () => {
      s = (s * 1103515245 + 12345) % 2147483648;
      return s / 2147483648;
    };
    for (let n = 0; n < 200; n++) {
      const item = generateTime(rand);
      expect(item.tokens.map((t) => t.zh).join('')).toBe(item.speak);
      expect(item.speak).toContain('點');
    }
  });
});
