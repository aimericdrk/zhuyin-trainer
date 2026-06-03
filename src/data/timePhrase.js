// Procedural generator for the Time Teller game.
//
// Produces a clock time plus the tiles needed to compose the Mandarin spoken
// form. Chinese expresses clock time as:
//   [period of day] [hour]點 [minute part]
// where the minute part can be:
//   - nothing / 整      → on the hour          (三點 / 三點整)
//   - 半                → half past            (三點半  = 3:30)
//   - 一刻 / 三刻        → quarter / 3-quarters (三點一刻 = 3:15, 三點三刻 = 3:45)
//   - X分               → plain minutes        (三點二十五分 = 3:25, 九點零五分 = 9:05)
//   - 差 X分 Y點         → X minutes before Y   (差五分八點 = 7:55)
import { DIGITS, spellNumber, spellHour } from './chineseNumber';

const PY_DIGIT = ['líng', 'yī', 'èr', 'sān', 'sì', 'wǔ', 'liù', 'qī', 'bā', 'jiǔ'];

const HOUR_PY = {
  1: 'yī', 2: 'liǎng', 3: 'sān', 4: 'sì', 5: 'wǔ', 6: 'liù',
  7: 'qī', 8: 'bā', 9: 'jiǔ', 10: 'shí', 11: 'shíyī', 12: 'shí’èr',
};

// Pinyin for a spelled number 0–59 (no tone-sandhi adjustment).
export function numberPinyinUnder60(n) {
  if (n === 0) return 'líng';
  if (n < 10) return PY_DIGIT[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const tensPart = tens === 1 ? 'shí' : `${PY_DIGIT[tens]}shí`;
  return tensPart + (ones ? PY_DIGIT[ones] : '');
}

export const PERIODS = [
  { test: (h) => h === 0, zh: '半夜', py: 'bàn yè', en: 'midnight', fr: 'minuit' },
  { test: (h) => h >= 1 && h <= 5, zh: '凌晨', py: 'líng chén', en: 'early morning', fr: 'petit matin' },
  { test: (h) => h >= 6 && h <= 8, zh: '早上', py: 'zǎo shang', en: 'morning', fr: 'matin' },
  { test: (h) => h >= 9 && h <= 11, zh: '上午', py: 'shàng wǔ', en: 'late morning', fr: 'matinée' },
  { test: (h) => h === 12, zh: '中午', py: 'zhōng wǔ', en: 'noon', fr: 'midi' },
  { test: (h) => h >= 13 && h <= 17, zh: '下午', py: 'xià wǔ', en: 'afternoon', fr: 'après-midi' },
  { test: (h) => h >= 18, zh: '晚上', py: 'wǎn shang', en: 'evening', fr: 'soir' },
];

export function periodFor(hour24) {
  return PERIODS.find((p) => p.test(hour24)) || PERIODS[PERIODS.length - 1];
}

export function to12h(hour24) {
  return ((hour24 + 11) % 12) + 1;
}

function hourTile(h12) {
  return { zh: spellHour(h12), py: HOUR_PY[h12], en: String(h12), fr: String(h12) };
}

function attachedMinuteTiles(m) {
  // m is 1–59, not a special quarter/half value handled elsewhere
  const numZh = m < 10 ? `零${DIGITS[m]}` : spellNumber(m);
  const numPy = m < 10 ? `líng${PY_DIGIT[m]}` : numberPinyinUnder60(m);
  return [
    { zh: numZh, py: numPy, en: String(m), fr: String(m) },
    { zh: '分', py: 'fēn', en: 'min', fr: 'min' },
  ];
}

// Valid minute-expression styles for a given minute value.
export function stylesFor(minute) {
  if (minute === 0) return ['sharp', 'sharpZheng'];
  if (minute === 15) return ['quarter', 'minutes'];
  if (minute === 30) return ['half', 'minutes'];
  if (minute === 45) return ['threeQuarter', 'minutes', 'to'];
  if (minute > 30) return ['minutes', 'to'];
  return ['minutes'];
}

// Build the deterministic phrase for an explicit (hour24, minute, style).
export function buildTimePhrase(hour24, minute, style) {
  const period = periodFor(hour24);
  const h12 = to12h(hour24);
  const tiles = [{ ...period }];

  const usesTo = style === 'to';
  if (!usesTo) {
    tiles.push(hourTile(h12));
    tiles.push({ zh: '點', py: 'diǎn', en: "o'clock", fr: 'heure' });
  }

  switch (style) {
    case 'sharp':
      break;
    case 'sharpZheng':
      tiles.push({ zh: '整', py: 'zhěng', en: 'sharp', fr: 'pile' });
      break;
    case 'half':
      tiles.push({ zh: '半', py: 'bàn', en: 'half', fr: 'demie' });
      break;
    case 'quarter':
      tiles.push({ zh: '一刻', py: 'yí kè', en: 'quarter', fr: 'quart' });
      break;
    case 'threeQuarter':
      tiles.push({ zh: '三刻', py: 'sān kè', en: 'three-quarters', fr: 'trois quarts' });
      break;
    case 'minutes':
      tiles.push(...attachedMinuteTiles(minute));
      break;
    case 'to': {
      const h12next = (h12 % 12) + 1;
      const remain = 60 - minute;
      tiles.push({ zh: '差', py: 'chà', en: 'to (minus)', fr: 'moins' });
      if (remain === 15) {
        tiles.push({ zh: '一刻', py: 'yí kè', en: 'quarter', fr: 'quart' });
      } else {
        tiles.push({ zh: spellNumber(remain), py: numberPinyinUnder60(remain), en: String(remain), fr: String(remain) });
        tiles.push({ zh: '分', py: 'fēn', en: 'min', fr: 'min' });
      }
      tiles.push({ zh: spellHour(h12next), py: HOUR_PY[h12next], en: String(h12next), fr: String(h12next) });
      tiles.push({ zh: '點', py: 'diǎn', en: "o'clock", fr: 'heure' });
      break;
    }
    default:
      break;
  }

  const tokens = tiles.map((t, i) => ({ id: `t${i}`, zh: t.zh, py: t.py, en: t.en, fr: t.fr }));
  const speak = tokens.map((t) => t.zh).join('');
  const mm = String(minute).padStart(2, '0');
  return {
    hour24,
    minute,
    display: `${String(hour24).padStart(2, '0')}:${mm}`,
    h12,
    period,
    style,
    tokens,
    speak,
    gloss: {
      en: `${period.en} — ${h12}:${mm}`,
      fr: `${period.fr} — ${h12}h${mm}`,
    },
  };
}

const MINUTE_CHOICES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export function generateTime(rand = Math.random, prevId = null) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const hour24 = Math.floor(rand() * 24);
    const minute = MINUTE_CHOICES[Math.floor(rand() * MINUTE_CHOICES.length)];
    const styles = stylesFor(minute);
    const style = styles[Math.floor(rand() * styles.length)];
    const item = buildTimePhrase(hour24, minute, style);
    const id = `time-${item.display}-${style}`;
    if (id !== prevId) return { ...item, id };
  }
  const fallback = buildTimePhrase(12, 0, 'sharp');
  return { ...fallback, id: 'time-fallback' };
}
