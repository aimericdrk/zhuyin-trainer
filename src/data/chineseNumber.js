// Spell integers the Mandarin way (Taiwan usage), 0–9999.
//
// Conventions implemented:
// - 兩 (liǎng) is used for the digit 2 in the 百 (hundreds) and 千 (thousands)
//   places: 200 → 兩百, 2000 → 兩千. In the 十 (tens) and ones places we use 二:
//   20 → 二十, 12 → 十二, 22 → 二十二.
// - Leading 一十 collapses to 十: 10 → 十, 15 → 十五 (but 110 → 一百一十).
// - Internal zeros insert a single 零: 105 → 一百零五, 2005 → 兩千零五.

export const DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const UNITS = ['', '十', '百', '千'];

// Pinyin for the characters that appear in spelled numbers / money / dates.
export const CHAR_PY = {
  零: 'líng', 一: 'yī', 二: 'èr', 兩: 'liǎng', 三: 'sān', 四: 'sì', 五: 'wǔ',
  六: 'liù', 七: 'qī', 八: 'bā', 九: 'jiǔ', 十: 'shí', 百: 'bǎi', 千: 'qiān',
  萬: 'wàn', 月: 'yuè', 號: 'hào', 點: 'diǎn', 分: 'fēn', 塊: 'kuài', 毛: 'máo', 元: 'yuán',
};

export function charPinyin(ch) {
  return CHAR_PY[ch] || '';
}

// Language-neutral meaning for number characters (used to annotate builder
// tiles when the "meaning" reading aid is on). Units like 塊/分 are ambiguous
// across games, so each generator glosses those itself.
export const NUMBER_GLOSS = {
  零: '0', 一: '1', 二: '2', 兩: '2', 三: '3', 四: '4', 五: '5',
  六: '6', 七: '7', 八: '8', 九: '9', 十: '10', 百: '100', 千: '1,000', 萬: '10,000',
};
export function numberGloss(ch) {
  return NUMBER_GLOSS[ch] || '';
}

// Spell a value 1–9999 (a single 萬-group). `simplify` collapses a leading
// 一十 → 十; it must be false for non-leading groups (so 10010 → 一萬零一十).
function spell4(n, simplify) {
  const s = String(n);
  const len = s.length;
  let out = '';
  let zeroPending = false;
  for (let i = 0; i < len; i++) {
    const d = Number(s[i]);
    const pos = len - 1 - i;
    if (d === 0) {
      zeroPending = true;
      continue;
    }
    if (zeroPending) {
      out += '零';
      zeroPending = false;
    }
    const word = d === 2 && pos >= 2 ? '兩' : DIGITS[d];
    out += word + UNITS[pos];
  }
  if (simplify && out.startsWith('一十')) out = out.slice(1);
  return out;
}

export function spellNumber(n) {
  if (!Number.isInteger(n) || n < 0) return '';
  if (n === 0) return '零';
  if (n < 10000) return spell4(n, true);
  // Group by 萬 (10^4). Supports up to 99,999,999.
  const high = Math.floor(n / 10000);
  const low = n % 10000;
  const highWord = high === 2 ? '兩' : spellNumber(high); // 2 before 萬 → 兩萬
  let out = `${highWord}萬`;
  if (low > 0) {
    if (low < 1000) out += '零';
    out += spell4(low, false);
  }
  return out;
}

// Reading of a clock-minute value (0–59) as spoken after 點.
// Minutes 1–9 take a 零 placeholder: 9:05 → 九點零五分.
export function spellMinute(m) {
  if (!Number.isInteger(m) || m < 0 || m > 59) return '';
  if (m === 0) return '';
  if (m < 10) return `零${DIGITS[m]}`;
  return spellNumber(m);
}

// Hour word for clock times (1–12). 2 o'clock is 兩點, not 二點.
export function spellHour(h) {
  if (!Number.isInteger(h) || h < 1 || h > 12) return '';
  if (h === 2) return '兩';
  return spellNumber(h);
}
