import { reducer, init, buildQuizQuestion } from './useGameQuiz';
import { MEASURE_WORDS } from '../data/quizSets';
import { generateTone } from '../data/tonePhrase';

describe('buildQuizQuestion with sampled items', () => {
  test('always includes the correct answer among options', () => {
    const rand = () => 0.42;
    const q = buildQuizQuestion({ items: MEASURE_WORDS }, null, rand);
    expect(q.options.some((o) => o.id === q.correctId)).toBe(true);
    expect(q.options.length).toBeLessThanOrEqual(6);
  });

  test('options have no duplicate Chinese text', () => {
    let s = 5;
    const rand = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
    for (let i = 0; i < 50; i++) {
      const q = buildQuizQuestion({ items: MEASURE_WORDS }, null, rand);
      const texts = q.options.map((o) => o.zh);
      expect(new Set(texts).size).toBe(texts.length);
    }
  });

  test('avoids repeating the previous question', () => {
    const rand = () => 0.1;
    const first = buildQuizQuestion({ items: MEASURE_WORDS }, null, rand);
    const second = buildQuizQuestion({ items: MEASURE_WORDS }, first.id, rand);
    expect(second.id).not.toBe(first.id);
  });
});

describe('buildQuizQuestion with a generator (tones)', () => {
  test('uses the item-provided fixed options and audio', () => {
    const q = buildQuizQuestion({ generate: generateTone }, null, () => 0.3);
    expect(q.options).toHaveLength(4);
    expect(q.correctId).toMatch(/^tone[1-4]$/);
    expect(q.autoPlay).toBe(true);
    expect(typeof q.audio).toBe('string');
  });
});

describe('quiz reducer', () => {
  const config = { items: MEASURE_WORDS };

  test('correct pick on first try scores and sets correct', () => {
    const state = init({ config });
    const s = reducer(state, { type: 'PICK_OPTION', optionId: state.current.correctId });
    expect(s.status).toBe('correct');
    expect(s.stats.correct).toBe(1);
  });

  test('wrong pick counts once, then correct does not add to correct', () => {
    const state = init({ config });
    const wrongId = state.current.options.find((o) => o.id !== state.current.correctId).id;
    let s = reducer(state, { type: 'PICK_OPTION', optionId: wrongId });
    expect(s.stats.wrong).toBe(1);
    expect(s.status).toBe('guessing');
    s = reducer(s, { type: 'PICK_OPTION', optionId: state.current.correctId });
    expect(s.status).toBe('correct');
    expect(s.stats.correct).toBe(0);
  });

  test('SOLUTION reveals and counts a miss', () => {
    const state = init({ config });
    const s = reducer(state, { type: 'SOLUTION' });
    expect(s.status).toBe('revealed');
    expect(s.picked.has(state.current.correctId)).toBe(true);
    expect(s.stats.wrong).toBe(1);
  });

  test('SKIP advances and increments skipped', () => {
    const state = init({ config });
    const s = reducer(state, { type: 'SKIP' });
    expect(s.stats.skipped).toBe(1);
    expect(s.status).toBe('guessing');
  });
});
