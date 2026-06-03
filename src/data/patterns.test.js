import { PATTERNS, optionsFor, wordsFor } from './patterns';

test('every pattern is well-formed', () => {
  for (const p of PATTERNS) {
    expect(typeof p.id).toBe('string');
    expect(p.answer.zh).toBeTruthy();
    expect(p.answer.py).toBeTruthy();
    expect(p.distractors.length).toBeGreaterThanOrEqual(2);
    expect(p.full).toContain(p.answer.zh);
    expect(p.gloss.en).toBeTruthy();
    expect(p.gloss.fr).toBeTruthy();
    expect(p.fullPy).toBeTruthy();
    expect(p.fullPy).not.toMatch(/[,。?]/); // pinyin only, no punctuation
    // the full sentence equals before + answer + after (ignoring blanks)
    expect(p.full).toBe(`${p.before}${p.answer.zh}${p.after}`);
  }
});

test('every pattern has word glosses that reconstruct the full sentence', () => {
  for (const p of PATTERNS) {
    const words = wordsFor(p);
    expect(words.length).toBeGreaterThan(0);
    expect(words.map((w) => w.char).join('')).toBe(p.full);
    for (const w of words) {
      // every non-punctuation word carries both meanings
      if (w.py) {
        expect(w.en).toBeTruthy();
        expect(w.fr).toBeTruthy();
      }
    }
  }
});

test('ids are unique', () => {
  const ids = PATTERNS.map((p) => p.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test('optionsFor includes the answer and all distractors', () => {
  const p = PATTERNS[0];
  const opts = optionsFor(p, () => 0.5);
  expect(opts).toHaveLength(1 + p.distractors.length);
  expect(opts.some((o) => o.zh === p.answer.zh)).toBe(true);
  const zhs = opts.map((o) => o.zh);
  expect(new Set(zhs).size).toBe(zhs.length);
});
