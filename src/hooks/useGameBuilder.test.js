import { reducer, init, freshBuilderState } from './useGameBuilder';
import { buildTimePhrase } from '../data/timePhrase';

// A deterministic single-item generator for testing.
function makeGenerate(item) {
  return () => item;
}

const ITEM = buildTimePhrase(14, 30, 'half'); // 下午兩點半 → 3 tokens

describe('freshBuilderState', () => {
  test('puts all tokens in the tray and none placed', () => {
    const s = freshBuilderState(makeGenerate(ITEM), null, () => 0.5);
    expect(s.available).toHaveLength(ITEM.tokens.length);
    expect(s.placed).toHaveLength(0);
    expect(s.status).toBe('arranging');
  });
});

describe('reducer place / correctness', () => {
  function placeAll(state, order) {
    let s = state;
    for (const id of order) {
      s = reducer(s, { type: 'PLACE_WORD', wordId: id });
    }
    return s;
  }

  test('placing tiles in correct order marks correct and scores', () => {
    const state = init({ generate: makeGenerate(ITEM) });
    const correctOrder = ITEM.tokens.map((t) => t.id);
    const s = placeAll(state, correctOrder);
    expect(s.placed.map((t) => t.zh).join('')).toBe('下午兩點半');
    expect(s.status).toBe('correct');
    expect(s.stats.correct).toBe(1);
  });

  test('wrong order marks wrong and counts once', () => {
    const state = init({ generate: makeGenerate(ITEM) });
    const reversed = ITEM.tokens.map((t) => t.id).reverse();
    const s = placeAll(state, reversed);
    // reversed of 下午|兩|點|半 is not equal to speak
    expect(s.status).toBe('wrong');
    expect(s.stats.wrong).toBe(1);
  });

  test('RESET after wrong returns to arranging with empty placed', () => {
    const state = init({ generate: makeGenerate(ITEM) });
    const reversed = ITEM.tokens.map((t) => t.id).reverse();
    let s = placeAll(state, reversed);
    s = reducer(s, { type: 'RESET' });
    expect(s.status).toBe('arranging');
    expect(s.placed).toHaveLength(0);
    expect(s.available).toHaveLength(ITEM.tokens.length);
  });

  test('REMOVE_WORD returns a placed tile to the tray', () => {
    const state = init({ generate: makeGenerate(ITEM) });
    const firstId = ITEM.tokens[0].id;
    let s = reducer(state, { type: 'PLACE_WORD', wordId: firstId });
    expect(s.placed).toHaveLength(1);
    s = reducer(s, { type: 'REMOVE_WORD', wordId: firstId });
    expect(s.placed).toHaveLength(0);
    expect(s.available).toHaveLength(ITEM.tokens.length);
  });

  test('SOLUTION reveals full answer and counts a miss', () => {
    const state = init({ generate: makeGenerate(ITEM) });
    const s = reducer(state, { type: 'SOLUTION' });
    expect(s.status).toBe('revealed');
    expect(s.placed.map((t) => t.zh).join('')).toBe('下午兩點半');
    expect(s.stats.wrong).toBe(1);
  });

  test('SKIP increments skipped', () => {
    const state = init({ generate: makeGenerate(ITEM) });
    const s = reducer(state, { type: 'SKIP' });
    expect(s.stats.skipped).toBe(1);
    expect(s.status).toBe('arranging');
  });
});
