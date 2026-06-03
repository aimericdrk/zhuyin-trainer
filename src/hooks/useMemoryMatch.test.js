import { reducer, init, buildMemoryDeck } from './useMemoryMatch';

const CARDS = Array.from({ length: 8 }, (_, i) => ({
  id: `c${i}`, zh: `字${i}`, py: `p${i}`, en: `e${i}`, fr: `f${i}`,
}));

describe('buildMemoryDeck', () => {
  test('produces two tiles per chosen pair', () => {
    const deck = buildMemoryDeck(CARDS, () => 0.5, 6);
    expect(deck).toHaveLength(12);
    const faces = deck.filter((t) => t.pairId === deck[0].pairId).map((t) => t.face).sort();
    expect(faces).toEqual(['gloss', 'zh']);
  });

  test('never exceeds available cards', () => {
    const deck = buildMemoryDeck(CARDS.slice(0, 3), () => 0.1, 6);
    expect(deck).toHaveLength(6);
  });
});

describe('memory reducer', () => {
  function freshWithPairs() {
    const state = init({ cards: CARDS, pairCount: 6 });
    return state;
  }

  test('flipping two tiles of the same pair matches them', () => {
    let state = freshWithPairs();
    const firstPair = state.tiles[0].pairId;
    const a = state.tiles.find((t) => t.pairId === firstPair && t.face === 'zh');
    const b = state.tiles.find((t) => t.pairId === firstPair && t.face === 'gloss');
    state = reducer(state, { type: 'FLIP', key: a.key });
    state = reducer(state, { type: 'FLIP', key: b.key });
    expect(state.matched).toContain(firstPair);
    expect(state.flipped).toHaveLength(0);
    expect(state.moves).toBe(1);
  });

  test('flipping two non-matching tiles keeps them flipped until cleared', () => {
    let state = freshWithPairs();
    const a = state.tiles[0];
    const b = state.tiles.find((t) => t.pairId !== a.pairId);
    state = reducer(state, { type: 'FLIP', key: a.key });
    state = reducer(state, { type: 'FLIP', key: b.key });
    expect(state.flipped).toHaveLength(2);
    expect(state.matched).toHaveLength(0);
    state = reducer(state, { type: 'CLEAR_MISMATCH' });
    expect(state.flipped).toHaveLength(0);
  });

  test('cannot flip a third tile while two are up', () => {
    let state = freshWithPairs();
    const a = state.tiles[0];
    const b = state.tiles.find((t) => t.pairId !== a.pairId);
    const c = state.tiles.find((t) => t.key !== a.key && t.key !== b.key);
    state = reducer(state, { type: 'FLIP', key: a.key });
    state = reducer(state, { type: 'FLIP', key: b.key });
    const before = state.flipped;
    state = reducer(state, { type: 'FLIP', key: c.key });
    expect(state.flipped).toBe(before);
  });

  test('matching every pair wins', () => {
    let state = freshWithPairs();
    const pairIds = [...new Set(state.tiles.map((t) => t.pairId))];
    for (const pid of pairIds) {
      const a = state.tiles.find((t) => t.pairId === pid && t.face === 'zh');
      const b = state.tiles.find((t) => t.pairId === pid && t.face === 'gloss');
      state = reducer(state, { type: 'FLIP', key: a.key });
      state = reducer(state, { type: 'FLIP', key: b.key });
    }
    expect(state.status).toBe('won');
    expect(state.matched).toHaveLength(state.pairCount);
  });
});
