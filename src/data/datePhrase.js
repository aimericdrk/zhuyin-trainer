// Procedural generator for the Dates & Days game. Composes a Chinese date in
// the natural order: [month]月 [day]號 [weekday].  e.g. 三月五號星期一.
import { spellNumber, charPinyin, numberGloss } from './chineseNumber';

// Sunday-first index 0..6 to match JS Date conventions in the gloss.
const WEEKDAYS = [
  { zh: '星期日', py: 'xīngqí rì', en: 'Sunday', fr: 'dimanche' },
  { zh: '星期一', py: 'xīngqí yī', en: 'Monday', fr: 'lundi' },
  { zh: '星期二', py: 'xīngqí èr', en: 'Tuesday', fr: 'mardi' },
  { zh: '星期三', py: 'xīngqí sān', en: 'Wednesday', fr: 'mercredi' },
  { zh: '星期四', py: 'xīngqí sì', en: 'Thursday', fr: 'jeudi' },
  { zh: '星期五', py: 'xīngqí wǔ', en: 'Friday', fr: 'vendredi' },
  { zh: '星期六', py: 'xīngqí liù', en: 'Saturday', fr: 'samedi' },
];

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];
const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
  'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function numberTiles(n) {
  return [...spellNumber(n)].map((ch) => ({ zh: ch, py: charPinyin(ch), en: numberGloss(ch), fr: numberGloss(ch) }));
}

export function buildDatePhrase(weekdayIdx, month, day) {
  const wd = WEEKDAYS[weekdayIdx];
  const tiles = [
    ...numberTiles(month),
    { zh: '月', py: 'yuè', en: 'month', fr: 'mois' },
    ...numberTiles(day),
    { zh: '號', py: 'hào', en: 'day (date)', fr: 'jour (date)' },
    { zh: wd.zh, py: wd.py, en: wd.en, fr: wd.fr },
  ];
  const tokens = tiles.map((t, i) => ({ id: `t${i}`, zh: t.zh, py: t.py, en: t.en, fr: t.fr }));
  const speak = tokens.map((t) => t.zh).join('');
  return {
    id: `date-${month}-${day}-${weekdayIdx}`,
    weekdayIdx,
    month,
    day,
    display: `${month}/${day}`,
    speak,
    tokens,
    gloss: {
      en: `${wd.en}, ${MONTHS_EN[month - 1]} ${day}`,
      fr: `${wd.fr} ${day} ${MONTHS_FR[month - 1]}`,
    },
  };
}

export function generateDate(rand = Math.random, prevId = null) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const weekdayIdx = Math.floor(rand() * 7);
    const month = 1 + Math.floor(rand() * 12);
    const day = 1 + Math.floor(rand() * 28);
    const item = buildDatePhrase(weekdayIdx, month, day);
    if (item.id !== prevId) return item;
  }
  return buildDatePhrase(1, 3, 5);
}

export { WEEKDAYS };
