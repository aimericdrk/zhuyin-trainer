import { useReducer, useEffect, useRef } from 'react';

// Generic tile-arrangement engine. A game supplies `generate(rand, prevId)`
// returning an item `{ id, tokens:[{id,zh,py}], speak, prompt, display, gloss }`.
// The player taps tiles from the tray into the answer row; when the answer row
// is full it is checked by comparing the concatenated zh against `item.speak`
// (so duplicate tiles are interchangeable). Correct → auto-advance; wrong →
// shake and reshuffle. Mirrors the order phase of `useHard`.

const ADVANCE_DELAY_MS = 800;
const WRONG_RESET_DELAY_MS = 800;

export function shuffleWith(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sameOrder(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i].id !== b[i].id) return false;
  return true;
}

function placedMatches(placed, speak) {
  return placed.map((t) => t.zh).join('') === speak;
}

export function freshBuilderState(generate, prevId, rand = Math.random) {
  const item = generate(rand, prevId);
  let available = shuffleWith(item.tokens, rand);
  for (let attempt = 0; attempt < 6 && sameOrder(available, item.tokens) && item.tokens.length > 1; attempt++) {
    available = shuffleWith(item.tokens, rand);
  }
  return {
    current: item,
    available,
    placed: [],
    status: 'arranging',
    firstWrongCounted: false,
  };
}

export function init({ generate }) {
  return {
    generate,
    ...freshBuilderState(generate, null),
    stats: { correct: 0, wrong: 0, skipped: 0 },
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case 'PLACE_WORD': {
      if (state.status !== 'arranging') return state;
      const idx = state.available.findIndex((w) => w.id === action.wordId);
      if (idx === -1) return state;
      const word = state.available[idx];
      const nextAvailable = state.available.slice();
      nextAvailable.splice(idx, 1);
      const insertIdx = typeof action.toIndex === 'number'
        ? Math.max(0, Math.min(action.toIndex, state.placed.length))
        : state.placed.length;
      const nextPlaced = state.placed.slice();
      nextPlaced.splice(insertIdx, 0, word);

      if (nextAvailable.length === 0) {
        const isCorrect = placedMatches(nextPlaced, state.current.speak);
        if (isCorrect) {
          const gotFirstTry = !state.firstWrongCounted;
          return {
            ...state,
            available: nextAvailable,
            placed: nextPlaced,
            status: 'correct',
            stats: gotFirstTry
              ? { ...state.stats, correct: state.stats.correct + 1 }
              : state.stats,
          };
        }
        const wrongIncrement = state.firstWrongCounted ? 0 : 1;
        return {
          ...state,
          available: nextAvailable,
          placed: nextPlaced,
          status: 'wrong',
          firstWrongCounted: true,
          stats: { ...state.stats, wrong: state.stats.wrong + wrongIncrement },
        };
      }
      return { ...state, available: nextAvailable, placed: nextPlaced };
    }

    case 'REMOVE_WORD': {
      if (state.status !== 'arranging') return state;
      const idx = state.placed.findIndex((w) => w.id === action.wordId);
      if (idx === -1) return state;
      const word = state.placed[idx];
      const nextPlaced = state.placed.slice();
      nextPlaced.splice(idx, 1);
      return { ...state, placed: nextPlaced, available: [...state.available, word] };
    }

    case 'REORDER_PLACED': {
      if (state.status !== 'arranging') return state;
      const { fromIndex, toIndex } = action;
      if (typeof fromIndex !== 'number' || typeof toIndex !== 'number') return state;
      if (fromIndex < 0 || fromIndex >= state.placed.length) return state;
      const clampedTo = Math.max(0, Math.min(toIndex, state.placed.length - 1));
      if (clampedTo === fromIndex) return state;
      const nextPlaced = state.placed.slice();
      const [moved] = nextPlaced.splice(fromIndex, 1);
      nextPlaced.splice(clampedTo, 0, moved);
      return { ...state, placed: nextPlaced };
    }

    case 'RESET': {
      if (state.status !== 'wrong') return state;
      const all = [...state.placed, ...state.available];
      let nextAvail = shuffleWith(all, Math.random);
      for (let attempt = 0; attempt < 6 && sameOrder(nextAvail, state.current.tokens); attempt++) {
        nextAvail = shuffleWith(all, Math.random);
      }
      return { ...state, available: nextAvail, placed: [], status: 'arranging' };
    }

    case 'SKIP': {
      if (state.status !== 'arranging') return state;
      return {
        ...state,
        ...freshBuilderState(state.generate, state.current.id),
        stats: { ...state.stats, skipped: state.stats.skipped + 1 },
      };
    }

    case 'SOLUTION': {
      if (state.status !== 'arranging') return state;
      const wrongIncrement = state.firstWrongCounted ? 0 : 1;
      return {
        ...state,
        placed: state.current.tokens.slice(),
        available: [],
        status: 'revealed',
        firstWrongCounted: true,
        stats: { ...state.stats, wrong: state.stats.wrong + wrongIncrement },
      };
    }

    case 'CONTINUE':
    case 'ADVANCE': {
      if (action.type === 'CONTINUE' && state.status !== 'revealed') return state;
      if (action.type === 'ADVANCE' && state.status !== 'correct') return state;
      return { ...state, ...freshBuilderState(state.generate, state.current.id) };
    }

    default:
      return state;
  }
}

export function useGameBuilder({ generate }) {
  const [state, dispatch] = useReducer(reducer, { generate }, init);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (state.status === 'correct') {
      timerRef.current = setTimeout(() => dispatch({ type: 'ADVANCE' }), ADVANCE_DELAY_MS);
    } else if (state.status === 'wrong') {
      timerRef.current = setTimeout(() => dispatch({ type: 'RESET' }), WRONG_RESET_DELAY_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.status]);

  return [state, dispatch];
}
