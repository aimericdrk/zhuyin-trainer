import { useReducer, useEffect, useRef } from 'react';

// Generic multiple-choice engine. A game supplies either:
//   - `items`: [{ id, prompt, answer:{zh,py,en,fr} }]  → distractors are sampled
//     from sibling answers (deduped by zh), OR
//   - `generate(rand, prevId)`: returns an item that may carry its own
//     `options`, `correctId`, `audio`, `autoPlay` (used by the Tones game).
// Tracks status guessing → correct | revealed, auto-advances on correct.

const N_OPTIONS = 6;
const ADVANCE_DELAY_MS = 800;

export function shuffleWith(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildQuizQuestion({ items, generate, nOptions = N_OPTIONS }, prevId = null, rand = Math.random) {
  if (typeof generate === 'function') {
    const item = generate(rand, prevId);
    if (item.options && item.correctId) {
      return {
        id: item.id,
        prompt: item.prompt,
        options: item.options,
        correctId: item.correctId,
        audio: item.audio ?? null,
        autoPlay: Boolean(item.autoPlay),
      };
    }
    // generated item without its own options falls through to sampling below
    items = items || [item];
  }
  if (!items || items.length === 0) {
    return { id: null, prompt: null, options: [], correctId: null, audio: null, autoPlay: false };
  }
  let candidates = items;
  if (prevId && items.length > 1) candidates = items.filter((e) => e.id !== prevId);
  const target = shuffleWith(candidates, rand)[0];
  const targetText = (target.answer?.zh ?? '').trim();

  const seen = new Set([targetText]);
  const distractors = [];
  for (const e of shuffleWith(items, rand)) {
    if (distractors.length >= nOptions - 1) break;
    const txt = (e.answer?.zh ?? '').trim();
    if (e.id === target.id) continue;
    if (seen.has(txt)) continue;
    seen.add(txt);
    distractors.push(e);
  }
  const options = shuffleWith(
    [target, ...distractors].map((e) => ({ id: e.id, zh: e.answer.zh, py: e.answer.py })),
    rand
  );
  return {
    id: target.id,
    prompt: target.prompt,
    options,
    correctId: target.id,
    audio: target.answer.zh,
    autoPlay: false,
  };
}

function freshState(config, prevId) {
  const q = buildQuizQuestion(config, prevId);
  return {
    current: q,
    picked: new Set(),
    status: 'guessing',
    firstWrongCounted: false,
  };
}

export function init({ config }) {
  return {
    config,
    ...freshState(config, null),
    stats: { correct: 0, wrong: 0, skipped: 0 },
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case 'PICK_OPTION': {
      if (state.status !== 'guessing') return state;
      if (state.picked.has(action.optionId)) return state;
      const isCorrect = action.optionId === state.current.correctId;
      const nextPicked = new Set(state.picked);
      nextPicked.add(action.optionId);
      if (isCorrect) {
        const gotFirstTry = !state.firstWrongCounted && state.picked.size === 0;
        return {
          ...state,
          picked: nextPicked,
          status: 'correct',
          stats: gotFirstTry
            ? { ...state.stats, correct: state.stats.correct + 1 }
            : state.stats,
        };
      }
      if (state.firstWrongCounted) return { ...state, picked: nextPicked };
      return {
        ...state,
        picked: nextPicked,
        firstWrongCounted: true,
        stats: { ...state.stats, wrong: state.stats.wrong + 1 },
      };
    }

    case 'SOLUTION': {
      if (state.status !== 'guessing') return state;
      const nextPicked = new Set(state.picked);
      nextPicked.add(state.current.correctId);
      const wrongIncrement = state.firstWrongCounted ? 0 : 1;
      return {
        ...state,
        picked: nextPicked,
        status: 'revealed',
        firstWrongCounted: true,
        stats: { ...state.stats, wrong: state.stats.wrong + wrongIncrement },
      };
    }

    case 'SKIP': {
      if (state.status !== 'guessing') return state;
      return {
        ...state,
        ...freshState(state.config, state.current.id),
        stats: { ...state.stats, skipped: state.stats.skipped + 1 },
      };
    }

    case 'CONTINUE':
    case 'ADVANCE': {
      if (action.type === 'CONTINUE' && state.status !== 'revealed') return state;
      if (action.type === 'ADVANCE' && state.status !== 'correct') return state;
      return { ...state, ...freshState(state.config, state.current.id) };
    }

    default:
      return state;
  }
}

export function useGameQuiz({ config }) {
  const [state, dispatch] = useReducer(reducer, { config }, init);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (state.status === 'correct') {
      timerRef.current = setTimeout(() => dispatch({ type: 'ADVANCE' }), ADVANCE_DELAY_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.status]);

  return [state, dispatch];
}
