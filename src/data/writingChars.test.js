import { WRITING_CHARS, generateStrokeCount } from './writingChars';

test('every writing char has a positive stroke count', () => {
  for (const c of WRITING_CHARS) {
    expect(c.strokes).toBeGreaterThanOrEqual(1);
    expect(c.zh).toBeTruthy();
    expect(c.py).toBeTruthy();
  }
});

describe('generateStrokeCount', () => {
  test('offers 6 distinct numeric options including the correct count', () => {
    let s = 51;
    const rand = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
    let prev = null;
    for (let i = 0; i < 80; i++) {
      const q = generateStrokeCount(rand, prev);
      expect(q.options).toHaveLength(6);
      const nums = q.options.map((o) => o.zh);
      expect(new Set(nums).size).toBe(6);
      expect(q.options.some((o) => o.id === q.correctId)).toBe(true);
      for (const o of q.options) expect(Number(o.zh)).toBeGreaterThanOrEqual(1);
      expect(q.id).not.toBe(prev);
      prev = q.id;
    }
  });
});
