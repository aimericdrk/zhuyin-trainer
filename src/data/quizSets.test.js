import { QUIZ_SETS } from './quizSets';
import { buildQuizQuestion } from '../hooks/useGameQuiz';

const N_OPTIONS = 6;

describe('quiz sets integrity', () => {
  for (const [name, set] of Object.entries(QUIZ_SETS)) {
    describe(name, () => {
      test('has enough distinct answers for a full option grid', () => {
        const distinct = new Set(set.map((i) => i.answer.zh));
        expect(distinct.size).toBeGreaterThanOrEqual(N_OPTIONS);
      });

      test('every item is well-formed', () => {
        for (const item of set) {
          expect(typeof item.id).toBe('string');
          expect(item.answer.zh).toBeTruthy();
          expect(item.answer.py).toBeTruthy();
          expect(item.prompt.gloss.en).toBeTruthy();
          expect(item.prompt.gloss.fr).toBeTruthy();
        }
      });

      test('ids are unique within the set', () => {
        const ids = set.map((i) => i.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      test('builds a question whose options include the answer with no dup text', () => {
        let s = 17;
        const rand = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
        const q = buildQuizQuestion({ items: set }, null, rand);
        expect(q.options.some((o) => o.id === q.correctId)).toBe(true);
        const texts = q.options.map((o) => o.zh);
        expect(new Set(texts).size).toBe(texts.length);
      });
    });
  }
});
