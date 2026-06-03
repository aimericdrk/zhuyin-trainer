import { generateListening, generatePinyinReading, LISTENING_POOL } from './listening';

test('pool is non-empty and deduped by character', () => {
  expect(LISTENING_POOL.length).toBeGreaterThan(10);
  const zhs = LISTENING_POOL.map((c) => c.zh);
  expect(new Set(zhs).size).toBe(zhs.length);
});

test('generates an audio question with the answer among options', () => {
  let s = 21;
  const rand = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  let prev = null;
  for (let i = 0; i < 80; i++) {
    const q = generateListening(rand, prev);
    expect(q.autoPlay).toBe(true);
    expect(typeof q.audio).toBe('string');
    expect(q.options.some((o) => o.id === q.correctId)).toBe(true);
    const texts = q.options.map((o) => o.zh);
    expect(new Set(texts).size).toBe(texts.length);
    expect(q.id).not.toBe(prev);
    prev = q.id;
  }
});

test('pinyin reading shows a character and offers distinct pinyin options', () => {
  let s = 31;
  const rand = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  let prev = null;
  for (let i = 0; i < 80; i++) {
    const q = generatePinyinReading(rand, prev);
    expect(q.prompt.zh).toBeTruthy();
    expect(q.options.some((o) => o.id === q.correctId)).toBe(true);
    const ps = q.options.map((o) => o.zh);
    expect(new Set(ps).size).toBe(ps.length);
    expect(q.id).not.toBe(prev);
    prev = q.id;
  }
});
