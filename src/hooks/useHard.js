import { useReducer, useEffect, useRef } from 'react';
import { buildEntries } from '../data/buildEntries';

const N_OPTIONS = 10;
const ADVANCE_DELAY_MS = 700;
const WRONG_RESET_DELAY_MS = 700;

function shuffleWith(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function arrayEqIds(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id) return false;
  }
  return true;
}

export function buildQuestion(pool, prevTargetId = null, rand = Math.random) {
  if (!pool || pool.length === 0) {
    return { target: null, correctId: null, options: [] };
  }
  let candidates = pool;
  if (prevTargetId && pool.length > 1) {
    candidates = pool.filter((e) => e.id !== prevTargetId);
  }
  const target = shuffleWith(candidates, rand)[0];
  const targetMeaning = (target.meaning?.en ?? '').toLowerCase();

  const distractorPool = pool.filter(
    (e) => e.id !== target.id && (e.meaning?.en ?? '').toLowerCase() !== targetMeaning
  );
  const shuffledDistractorPool = shuffleWith(distractorPool, rand);
  const seenMeanings = new Set([targetMeaning]);
  const distractors = [];
  for (const e of shuffledDistractorPool) {
    if (distractors.length >= N_OPTIONS - 1) break;
    const m = (e.meaning?.en ?? '').toLowerCase();
    if (!seenMeanings.has(m)) {
      seenMeanings.add(m);
      distractors.push(e);
    }
  }

  const all = shuffleWith(
    [target, ...distractors].map((e) => ({ id: e.id, meaning: e.meaning })),
    rand
  );

  return { target, correctId: target.id, options: all };
}

function poolHasUsableSentence(pool) {
  return pool.some(
    (e) => e.sentence && Array.isArray(e.sentence.words) && e.sentence.words.length >= 2
  );
}

export function buildOrderQuestion(pool, prevTargetId = null, rand = Math.random) {
  if (!pool || pool.length === 0) {
    return { target: null, sentenceWords: [], available: [], placed: [], sentenceTranslation: null };
  }
  let candidates = pool.filter(
    (e) => e.sentence && Array.isArray(e.sentence.words) && e.sentence.words.length >= 2
  );
  if (prevTargetId && candidates.length > 1) {
    candidates = candidates.filter((e) => e.id !== prevTargetId);
  }
  if (candidates.length === 0) {
    return { target: null, sentenceWords: [], available: [], placed: [], sentenceTranslation: null };
  }
  const target = shuffleWith(candidates, rand)[0];
  const words = target.sentence.words;
  const sentenceWords = words.map((w, i) => ({
    id: `w-${i}`,
    char: w.char,
    pinyin: w.pinyin,
    zhuyin: w.zhuyin,
    en: w.en,
    fr: w.fr,
  }));
  let available = shuffleWith(sentenceWords, rand);
  for (let attempt = 0; attempt < 5 && arrayEqIds(available, sentenceWords); attempt++) {
    available = shuffleWith(sentenceWords, rand);
  }
  return {
    target,
    sentenceWords,
    available,
    placed: [],
    sentenceTranslation: target.sentence.translation,
  };
}

function freshMcqState(pool, prevTargetId) {
  const { target, correctId, options } = buildQuestion(pool, prevTargetId);
  return {
    phase: 'mcq',
    current: target,
    status: 'guessing',
    firstWrongCounted: false,
    options,
    correctId,
    picked: new Set(),
    sentenceWords: [],
    available: [],
    placed: [],
    sentenceTranslation: null,
  };
}

function freshOrderState(pool, prevTargetId) {
  if (!poolHasUsableSentence(pool)) {
    return freshMcqState(pool, prevTargetId);
  }
  const { target, sentenceWords, available, placed, sentenceTranslation } = buildOrderQuestion(
    pool,
    prevTargetId
  );
  return {
    phase: 'order',
    current: target,
    status: 'arranging',
    firstWrongCounted: false,
    options: [],
    correctId: null,
    picked: new Set(),
    sentenceWords,
    available,
    placed,
    sentenceTranslation,
  };
}

function freshStateForPhase(phase, pool, prevTargetId) {
  return phase === 'mcq'
    ? freshMcqState(pool, prevTargetId)
    : freshOrderState(pool, prevTargetId);
}

function nextPhase(phase) {
  return phase === 'mcq' ? 'order' : 'mcq';
}

export function init({ characters }) {
  const { pool } = buildEntries(characters);
  const fresh = freshMcqState(pool, null);
  return {
    pool,
    ...fresh,
    stats: { correct: 0, wrong: 0, skipped: 0 },
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case 'PICK_OPTION': {
      if (state.phase !== 'mcq') return state;
      if (state.status !== 'guessing') return state;
      if (state.picked.has(action.optionId)) return state;
      const isCorrect = action.optionId === state.correctId;
      const nextPicked = new Set(state.picked);
      nextPicked.add(action.optionId);
      if (isCorrect) {
        const gotFirstTry = !state.firstWrongCounted && state.picked.size === 0;
        const mcqCountsCorrect = gotFirstTry && !poolHasUsableSentence(state.pool);
        return {
          ...state,
          picked: nextPicked,
          status: 'correct',
          stats: mcqCountsCorrect
            ? { ...state.stats, correct: state.stats.correct + 1 }
            : state.stats,
        };
      }
      if (state.firstWrongCounted) {
        return { ...state, picked: nextPicked };
      }
      return {
        ...state,
        picked: nextPicked,
        firstWrongCounted: true,
        stats: { ...state.stats, wrong: state.stats.wrong + 1 },
      };
    }

    case 'PLACE_WORD': {
      if (state.phase !== 'order') return state;
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
        const isCorrect =
          nextPlaced.length === state.sentenceWords.length &&
          nextPlaced.every((w, i) => w.id === state.sentenceWords[i].id);
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
      if (state.phase !== 'order') return state;
      if (state.status !== 'arranging') return state;
      const idx = state.placed.findIndex((w) => w.id === action.wordId);
      if (idx === -1) return state;
      const word = state.placed[idx];
      const nextPlaced = state.placed.slice();
      nextPlaced.splice(idx, 1);
      const nextAvailable = [...state.available, word];
      return { ...state, placed: nextPlaced, available: nextAvailable };
    }

    case 'REORDER_PLACED': {
      if (state.phase !== 'order') return state;
      if (state.status !== 'arranging') return state;
      const { fromIndex, toIndex } = action;
      if (typeof fromIndex !== 'number' || typeof toIndex !== 'number') return state;
      if (fromIndex === toIndex) return state;
      if (fromIndex < 0 || fromIndex >= state.placed.length) return state;
      const clampedTo = Math.max(0, Math.min(toIndex, state.placed.length - 1));
      if (clampedTo === fromIndex) return state;
      const nextPlaced = state.placed.slice();
      const [moved] = nextPlaced.splice(fromIndex, 1);
      nextPlaced.splice(clampedTo, 0, moved);
      return { ...state, placed: nextPlaced };
    }

    case 'RESET_ORDER': {
      if (state.phase !== 'order') return state;
      if (state.status !== 'wrong') return state;
      let nextAvail = shuffleWith(state.sentenceWords, Math.random);
      for (let attempt = 0; attempt < 5 && arrayEqIds(nextAvail, state.sentenceWords); attempt++) {
        nextAvail = shuffleWith(state.sentenceWords, Math.random);
      }
      return {
        ...state,
        available: nextAvail,
        placed: [],
        status: 'arranging',
      };
    }

    case 'SKIP': {
      if (state.status !== 'guessing' && state.status !== 'arranging') return state;
      const np = nextPhase(state.phase);
      const fresh = freshStateForPhase(np, state.pool, state.current ? state.current.id : null);
      return {
        ...state,
        ...fresh,
        stats: { ...state.stats, skipped: state.stats.skipped + 1 },
      };
    }

    case 'SOLUTION': {
      if (state.phase === 'mcq') {
        if (state.status !== 'guessing') return state;
        const nextPicked = new Set(state.picked);
        nextPicked.add(state.correctId);
        const wrongIncrement = state.firstWrongCounted ? 0 : 1;
        return {
          ...state,
          picked: nextPicked,
          status: 'revealed',
          firstWrongCounted: true,
          stats: { ...state.stats, wrong: state.stats.wrong + wrongIncrement },
        };
      }
      if (state.status !== 'arranging') return state;
      const wrongIncrement = state.firstWrongCounted ? 0 : 1;
      return {
        ...state,
        placed: state.sentenceWords.slice(),
        available: [],
        status: 'revealed',
        firstWrongCounted: true,
        stats: { ...state.stats, wrong: state.stats.wrong + wrongIncrement },
      };
    }

    case 'CONTINUE': {
      if (state.status !== 'revealed') return state;
      const np = nextPhase(state.phase);
      const fresh = freshStateForPhase(np, state.pool, state.current ? state.current.id : null);
      return { ...state, ...fresh };
    }

    case 'ADVANCE': {
      if (state.status !== 'correct') return state;
      const np = nextPhase(state.phase);
      const fresh = freshStateForPhase(np, state.pool, state.current ? state.current.id : null);
      return { ...state, ...fresh };
    }

    default:
      return state;
  }
}

export function useHard({ characters }) {
  const [state, dispatch] = useReducer(reducer, { characters }, init);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (state.status === 'correct') {
      timerRef.current = setTimeout(() => dispatch({ type: 'ADVANCE' }), ADVANCE_DELAY_MS);
    } else if (state.status === 'wrong' && state.phase === 'order') {
      timerRef.current = setTimeout(() => dispatch({ type: 'RESET_ORDER' }), WRONG_RESET_DELAY_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.status, state.phase]);

  return [state, dispatch];
}
