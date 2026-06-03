// Lightweight spaced-repetition (Leitner) logic for the Review mode. Each card
// sits in a box 1–5; a correct answer promotes it (capped at 5), a wrong answer
// sends it back to box 1. Sessions pull the weakest cards first. Box state is
// persisted in localStorage. Pure functions here are unit-tested; the screen
// owns persistence and randomness.
const SRS_LS = 'zhuyin.srs';
export const MAX_BOX = 5;

export function nextBox(box, correct) {
  const b = box || 1;
  return correct ? Math.min(b + 1, MAX_BOX) : 1;
}

function shuffleWith(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick a session of `size` cards, weakest boxes first, shuffled within a box.
export function pickSession(cards, boxes, size = 12, rand = Math.random) {
  const byBox = new Map();
  for (const c of cards) {
    const b = boxes[c.id] || 1;
    if (!byBox.has(b)) byBox.set(b, []);
    byBox.get(b).push(c);
  }
  const ordered = [];
  for (let b = 1; b <= MAX_BOX; b++) {
    if (byBox.has(b)) ordered.push(...shuffleWith(byBox.get(b), rand));
  }
  return ordered.slice(0, Math.min(size, ordered.length));
}

// Mastery 0..1 across the whole pool: average of (box-1)/(MAX_BOX-1).
export function mastery(cards, boxes) {
  if (!cards.length) return 0;
  const total = cards.reduce((sum, c) => sum + ((boxes[c.id] || 1) - 1), 0);
  return total / (cards.length * (MAX_BOX - 1));
}

export function readBoxes() {
  try { return JSON.parse(localStorage.getItem(SRS_LS) || '{}') || {}; } catch { return {}; }
}

export function writeBoxes(boxes) {
  try { localStorage.setItem(SRS_LS, JSON.stringify(boxes)); } catch {}
}
