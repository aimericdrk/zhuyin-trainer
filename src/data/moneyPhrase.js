// Procedural generator for the Money game. Spoken Taiwanese prices use
//   塊 (kuài, dollar/元), 毛 (máo, 10-cent/角), 分 (fēn, cent).
//   $35.20 → 三十五塊兩毛   ·   $2.00 → 兩塊   ·   $0.50 → 五毛
// The digit 2 directly before a measure word becomes 兩 (兩塊 / 兩毛 / 兩分).
import { spellNumber, charPinyin, numberGloss } from './chineseNumber';

function moneyCount(n) {
  return n === 2 ? '兩' : spellNumber(n);
}

function countTiles(n) {
  return [...moneyCount(n)].map((ch) => ({ zh: ch, py: charPinyin(ch), en: numberGloss(ch), fr: numberGloss(ch) }));
}

export function buildMoneyPhrase(dollars, jiao, fen) {
  const tiles = [];
  if (dollars > 0) {
    tiles.push(...countTiles(dollars), { zh: '塊', py: 'kuài', en: 'dollar', fr: 'dollar' });
  }
  if (jiao > 0) {
    tiles.push(...countTiles(jiao), { zh: '毛', py: 'máo', en: '10¢ (jiao)', fr: '10¢ (jiao)' });
  }
  if (fen > 0) {
    tiles.push(...countTiles(fen), { zh: '分', py: 'fēn', en: 'cent', fr: 'centime' });
  }
  const tokens = tiles.map((t, i) => ({ id: `t${i}`, zh: t.zh, py: t.py || charPinyin(t.zh), en: t.en, fr: t.fr }));
  const speak = tokens.map((t) => t.zh).join('');
  const amount = dollars + jiao / 10 + fen / 100;
  const display = `$${amount.toFixed(2)}`;
  return {
    id: `money-${dollars}-${jiao}-${fen}`,
    dollars,
    jiao,
    fen,
    display,
    speak,
    tokens,
    gloss: { en: display, fr: display.replace('$', '').concat(' $') },
  };
}

export function generateMoney(rand = Math.random, prevId = null) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const dollars = Math.floor(rand() * 100);
    const jiao = Math.floor(rand() * 10);
    const fen = rand() < 0.3 ? Math.floor(rand() * 10) : 0;
    if (dollars === 0 && jiao === 0 && fen === 0) continue;
    const item = buildMoneyPhrase(dollars, jiao, fen);
    if (item.id !== prevId) return item;
  }
  return buildMoneyPhrase(35, 2, 0);
}
