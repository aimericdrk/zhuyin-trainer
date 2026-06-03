// Listening-comprehension generator: play a spoken word and choose the matching
// character. Trains ear → script recognition (input), complementing the
// production-oriented quizzes. Emits a self-contained quiz item (own options +
// audio) consumed by useGameQuiz's generator path.
import { DECKS } from './quizSets';

// Flatten decks into a deduped pool of speakable words.
const POOL = (() => {
  const byZh = new Map();
  for (const deck of DECKS) {
    for (const c of deck.cards) {
      if (!byZh.has(c.zh)) byZh.set(c.zh, c);
    }
  }
  return [...byZh.values()];
})();

function shuffleWith(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const N_OPTIONS = 6;

export function generateListening(rand = Math.random, prevId = null) {
  let candidates = POOL;
  if (prevId && POOL.length > 1) candidates = POOL.filter((c) => c.id !== prevId);
  const target = shuffleWith(candidates, rand)[0];

  const seen = new Set([target.zh]);
  const distractors = [];
  for (const c of shuffleWith(POOL, rand)) {
    if (distractors.length >= N_OPTIONS - 1) break;
    if (c.id === target.id || seen.has(c.zh)) continue;
    seen.add(c.zh);
    distractors.push(c);
  }
  const options = shuffleWith(
    [target, ...distractors].map((c) => ({ id: c.id, zh: c.zh, py: c.py })),
    rand
  );
  return {
    id: target.id,
    prompt: { gloss: { en: 'Which word did you hear?', fr: 'Quel mot as-tu entendu ?' } },
    options,
    correctId: target.id,
    audio: target.zh,
    autoPlay: true,
  };
}

// Reading-recognition: show a character, pick how it is read (pinyin). Visual
// counterpart to the (audio) Listening game. Plays the word on reveal.
export function generatePinyinReading(rand = Math.random, prevId = null) {
  let candidates = POOL;
  if (prevId && POOL.length > 1) candidates = POOL.filter((c) => c.id !== prevId);
  const target = shuffleWith(candidates, rand)[0];

  const seen = new Set([target.py]);
  const distractors = [];
  for (const c of shuffleWith(POOL, rand)) {
    if (distractors.length >= N_OPTIONS - 1) break;
    if (c.id === target.id || seen.has(c.py)) continue;
    seen.add(c.py);
    distractors.push(c);
  }
  const options = shuffleWith(
    [target, ...distractors].map((c) => ({ id: c.id, zh: c.py, py: '' })),
    rand
  );
  return {
    id: target.id,
    prompt: { zh: target.zh, gloss: { en: 'How is this read?', fr: 'Comment se lit-il ?' } },
    options,
    correctId: target.id,
    audio: target.zh,
    autoPlay: false,
  };
}

export { POOL as LISTENING_POOL };
