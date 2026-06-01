import { useReducer, useEffect, useRef } from 'react';
import { TONE_MARKS } from '../data/keyboardLayout';
import { buildEntries } from '../data/buildEntries';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function deriveExpected(entry) {
  const expected = [];
  const groups = [];
  for (const c of entry.chars) {
    const mark = TONE_MARKS[c.tone];
    const segment = mark ? [...c.zhuyin, mark] : [...c.zhuyin];
    expected.push(...segment);
    groups.push(segment.length);
  }
  return { expected, groups };
}

export function validate(input, expected) {
  const positions = expected.map((sym, i) => (input[i] === sym ? 'ok' : 'bad'));
  const outcome = positions.every((p) => p === 'ok') ? 'correct' : 'wrong';
  return { outcome, positions };
}

function loadChar(state, charId) {
  const entry = state.charById[charId];
  const { expected, groups } = deriveExpected(entry);
  return {
    ...state,
    current: entry,
    expected,
    groups,
    input: [],
    misses: 0,
    phase: 'input',
    perSymbolResult: null,
  };
}

function advance(state) {
  const nextCursor = state.cursor + 1;
  if (nextCursor >= state.queue.length) {
    const newQueue = shuffle(state.queue);
    return loadChar({ ...state, queue: newQueue, cursor: 0 }, newQueue[0]);
  }
  return loadChar({ ...state, cursor: nextCursor }, state.queue[nextCursor]);
}

export function init({ characters }) {
  const { pool } = buildEntries(characters);
  const charById = Object.fromEntries(pool.map((c) => [c.id, c]));
  const ids = pool.map((c) => c.id);
  const queue = shuffle(ids);
  const cursor = 0;
  const first = charById[queue[0]];
  const { expected, groups } = deriveExpected(first);
  return {
    charById,
    queue,
    cursor,
    current: first,
    expected,
    groups,
    input: [],
    misses: 0,
    phase: 'input',
    perSymbolResult: null,
    stats: { correct: 0, wrong: 0, skipped: 0 },
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case 'TAP_SYMBOL': {
      if (state.phase !== 'input') return state;
      const nextInput = [...state.input, action.symbol];
      if (nextInput.length < state.expected.length) {
        return { ...state, input: nextInput };
      }
      const { outcome, positions } = validate(nextInput, state.expected);
      if (outcome === 'correct') {
        return {
          ...state,
          input: nextInput,
          phase: 'correct',
          stats: { ...state.stats, correct: state.stats.correct + 1 },
        };
      }
      const misses = state.misses + 1;
      if (misses >= 5) {
        return {
          ...state,
          input: nextInput,
          misses,
          phase: 'revealed',
          perSymbolResult: null,
          stats: { ...state.stats, wrong: state.stats.wrong + 1 },
        };
      }
      return {
        ...state,
        input: nextInput,
        misses,
        phase: 'wrong',
        perSymbolResult: misses > 2 ? positions : null,
      };
    }
    case 'BACKSPACE': {
      if (state.phase !== 'input') return state;
      if (state.input.length === 0) return state;
      return { ...state, input: state.input.slice(0, -1) };
    }
    case 'RESET_AFTER_WRONG': {
      if (state.phase !== 'wrong') return state;
      return { ...state, input: [], phase: 'input', perSymbolResult: null };
    }
    case 'ADVANCE': {
      if (state.phase !== 'correct') return state;
      return advance(state);
    }
    case 'SKIP': {
      if (state.phase !== 'input') return state;
      const next = advance(state);
      return { ...next, stats: { ...state.stats, skipped: state.stats.skipped + 1 } };
    }
    case 'SOLUTION': {
      if (state.phase === 'revealed') return state;
      return {
        ...state,
        phase: 'revealed',
        stats: { ...state.stats, wrong: state.stats.wrong + 1 },
      };
    }
    case 'CONTINUE': {
      if (state.phase !== 'revealed') return state;
      return advance(state);
    }
    default:
      return state;
  }
}

export function useTrainer({ characters }) {
  const [state, dispatch] = useReducer(reducer, { characters }, init);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (state.phase === 'correct') {
      timerRef.current = setTimeout(() => dispatch({ type: 'ADVANCE' }), 700);
    } else if (state.phase === 'wrong') {
      timerRef.current = setTimeout(() => dispatch({ type: 'RESET_AFTER_WRONG' }), 1500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.phase]);

  return [state, dispatch];
}
