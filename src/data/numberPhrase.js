// Procedural generator for the Numbers game: show a numeral, compose the
// Mandarin reading from single-character tiles. Teaches 零, 兩-vs-二, and the
// 十/百/千 place values.
import { spellNumber, charPinyin, numberGloss } from './chineseNumber';

export function buildNumberPhrase(n) {
  const speak = spellNumber(n);
  const tokens = [...speak].map((ch, i) => ({ id: `t${i}`, zh: ch, py: charPinyin(ch), en: numberGloss(ch), fr: numberGloss(ch) }));
  return {
    id: `num-${n}`,
    value: n,
    display: String(n),
    speak,
    tokens,
    gloss: { en: String(n), fr: String(n) },
  };
}

export function generateNumber(rand = Math.random, prevId = null) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const r = rand();
    let n;

    if (r < 0.33) {
      n = 100 + Math.floor(rand() * 900); // 100–999
    } else if (r < 0.66) {
      n = 1000 + Math.floor(rand() * 9000); // 1000–9999
    } else {
      n = 10000 + Math.floor(rand() * 90000); // 10000–99999 (teaches 萬)
    }
    const item = buildNumberPhrase(n);
    if (item.id !== prevId) return item;
  }
  return buildNumberPhrase(42);
}
