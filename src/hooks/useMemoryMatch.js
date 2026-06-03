import { useReducer, useEffect, useRef } from 'react';

// Concentration / memory-match engine. Builds a grid of face-down tiles: each
// vocabulary card becomes two tiles — one showing the Chinese, one showing the
// meaning. Flip two; a matching pairId stays up, a mismatch flips back.
const MISMATCH_CLEAR_MS = 900;

export function shuffleWith(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildMemoryDeck(cards, rand = Math.random, pairCount = 6) {
  const chosen = shuffleWith(cards, rand).slice(0, Math.min(pairCount, cards.length));
  const tiles = [];
  for (const c of chosen) {
    tiles.push({ key: `${c.id}__zh`, pairId: c.id, face: 'zh', zh: c.zh, py: c.py, en: c.en, fr: c.fr });
    tiles.push({ key: `${c.id}__gl`, pairId: c.id, face: 'gloss', zh: c.zh, py: c.py, en: c.en, fr: c.fr });
  }
  return shuffleWith(tiles, rand);
}

export function init({ cards, pairCount }) {
  return {
    cards,
    pairCount: pairCount ?? 6,
    tiles: buildMemoryDeck(cards, Math.random, pairCount ?? 6),
    flipped: [],
    matched: [],
    moves: 0,
    status: 'playing',
  };
}

function tileByKey(tiles, key) {
  return tiles.find((t) => t.key === key) || null;
}

export function reducer(state, action) {
  switch (action.type) {
    case 'FLIP': {
      if (state.status !== 'playing') return state;
      const { key } = action;
      const tile = tileByKey(state.tiles, key);
      if (!tile) return state;
      if (state.matched.includes(tile.pairId)) return state;
      if (state.flipped.includes(key)) return state;
      if (state.flipped.length >= 2) return state;

      const flipped = [...state.flipped, key];
      if (flipped.length < 2) return { ...state, flipped };

      const [aKey, bKey] = flipped;
      const a = tileByKey(state.tiles, aKey);
      const b = tileByKey(state.tiles, bKey);
      const isMatch = a.pairId === b.pairId && a.face !== b.face;
      const moves = state.moves + 1;
      if (isMatch) {
        const matched = [...state.matched, a.pairId];
        const won = matched.length === state.pairCount;
        return { ...state, flipped: [], matched, moves, status: won ? 'won' : 'playing' };
      }
      return { ...state, flipped, moves };
    }

    case 'CLEAR_MISMATCH': {
      if (state.flipped.length < 2) return state;
      return { ...state, flipped: [] };
    }

    case 'NEW_GAME': {
      return {
        ...state,
        tiles: buildMemoryDeck(state.cards, Math.random, state.pairCount),
        flipped: [],
        matched: [],
        moves: 0,
        status: 'playing',
      };
    }

    default:
      return state;
  }
}

export function useMemoryMatch({ cards, pairCount }) {
  const [state, dispatch] = useReducer(reducer, { cards, pairCount }, init);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (state.flipped.length === 2) {
      timerRef.current = setTimeout(() => dispatch({ type: 'CLEAR_MISMATCH' }), MISMATCH_CLEAR_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.flipped]);

  return [state, dispatch];
}
