// Convert toned pinyin (e.g. "nǐ hǎo", "xièxie", "píngguǒ") to zhuyin
// (注音 bopomofo) so every word can display zhuyin without hand-authoring it.
// Handles multi-syllable runs via greedy longest-final parsing, the j/q/x → ü
// rule, the empty rime (zhi/chi/shi/ri/zi/ci/si), y/w zero-initial spellings,
// and tone marks placed after the syllable (matching the app's existing data).

const ACCENT = {
  ā: ['a', 1], á: ['a', 2], ǎ: ['a', 3], à: ['a', 4],
  ē: ['e', 1], é: ['e', 2], ě: ['e', 3], è: ['e', 4],
  ī: ['i', 1], í: ['i', 2], ǐ: ['i', 3], ì: ['i', 4],
  ō: ['o', 1], ó: ['o', 2], ǒ: ['o', 3], ò: ['o', 4],
  ū: ['u', 1], ú: ['u', 2], ǔ: ['u', 3], ù: ['u', 4],
  ǖ: ['ü', 1], ǘ: ['ü', 2], ǚ: ['ü', 3], ǜ: ['ü', 4],
};
const TONE_MARK = { 1: '', 2: 'ˊ', 3: 'ˇ', 4: 'ˋ', 5: '˙' };

const INIT_Z = {
  b: 'ㄅ', p: 'ㄆ', m: 'ㄇ', f: 'ㄈ', d: 'ㄉ', t: 'ㄊ', n: 'ㄋ', l: 'ㄌ',
  g: 'ㄍ', k: 'ㄎ', h: 'ㄏ', j: 'ㄐ', q: 'ㄑ', x: 'ㄒ', zh: 'ㄓ', ch: 'ㄔ',
  sh: 'ㄕ', r: 'ㄖ', z: 'ㄗ', c: 'ㄘ', s: 'ㄙ',
};
const INIT_SORTED = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's'];
const EMPTY_RIME = new Set(['zh', 'ch', 'sh', 'r', 'z', 'c', 's']);

const FINALS = {
  uang: 'ㄨㄤ', iang: 'ㄧㄤ', iong: 'ㄩㄥ', ueng: 'ㄨㄥ', üan: 'ㄩㄢ',
  uai: 'ㄨㄞ', uan: 'ㄨㄢ', iao: 'ㄧㄠ', ian: 'ㄧㄢ', ang: 'ㄤ', eng: 'ㄥ', ong: 'ㄨㄥ', ing: 'ㄧㄥ',
  ai: 'ㄞ', ei: 'ㄟ', ao: 'ㄠ', ou: 'ㄡ', an: 'ㄢ', en: 'ㄣ', in: 'ㄧㄣ', un: 'ㄨㄣ', ui: 'ㄨㄟ',
  ua: 'ㄨㄚ', uo: 'ㄨㄛ', ia: 'ㄧㄚ', ie: 'ㄧㄝ', iu: 'ㄧㄡ', er: 'ㄦ', üe: 'ㄩㄝ', ün: 'ㄩㄣ',
  a: 'ㄚ', o: 'ㄛ', e: 'ㄜ', i: 'ㄧ', u: 'ㄨ', ü: 'ㄩ', ê: 'ㄝ',
};
const FINALS_SORTED = Object.keys(FINALS).sort((a, b) => b.length - a.length);

const ZERO = {
  yuan: 'ㄩㄢ', yue: 'ㄩㄝ', yun: 'ㄩㄣ', yu: 'ㄩ',
  wang: 'ㄨㄤ', weng: 'ㄨㄥ', wai: 'ㄨㄞ', wan: 'ㄨㄢ', wen: 'ㄨㄣ', wei: 'ㄨㄟ', wa: 'ㄨㄚ', wo: 'ㄨㄛ', wu: 'ㄨ',
  yang: 'ㄧㄤ', ying: 'ㄧㄥ', yong: 'ㄩㄥ', yao: 'ㄧㄠ', you: 'ㄧㄡ', yan: 'ㄧㄢ', yin: 'ㄧㄣ', ya: 'ㄧㄚ', ye: 'ㄧㄝ', yi: 'ㄧ',
};
const ZERO_SORTED = Object.keys(ZERO).sort((a, b) => b.length - a.length);

function matchFinal(body) {
  for (const f of FINALS_SORTED) {
    if (body.startsWith(f)) return { zh: FINALS[f], len: f.length };
  }
  return null;
}
function matchZero(rest) {
  for (const z of ZERO_SORTED) {
    if (rest.startsWith(z)) return { zh: ZERO[z], len: z.length };
  }
  return null;
}

function parseSyllableAt(s, pos) {
  const rest = s.slice(pos);
  let init = '';
  for (const i of INIT_SORTED) {
    if (rest.startsWith(i)) { init = i; break; }
  }
  if (init) {
    let body = rest.slice(init.length);
    if (EMPTY_RIME.has(init) && body[0] === 'i') {
      return { zh: INIT_Z[init], len: init.length + 1 };
    }
    if ((init === 'j' || init === 'q' || init === 'x') && body[0] === 'u') {
      body = `ü${body.slice(1)}`;
    }
    const f = matchFinal(body);
    if (f) return { zh: INIT_Z[init] + f.zh, len: init.length + f.len };
  }
  const z = matchZero(rest);
  if (z) return { zh: z.zh, len: z.len };
  const f2 = matchFinal(rest);
  if (f2) return { zh: f2.zh, len: f2.len };
  return null;
}

function chunkToZhuyin(chunk) {
  // toneless string + tone recorded at the index of each accented vowel
  let toneless = '';
  const toneAt = {};
  for (const ch of chunk) {
    const lower = ch.toLowerCase();
    if (ACCENT[lower]) {
      const [base, tone] = ACCENT[lower];
      toneAt[toneless.length] = tone;
      toneless += base;
    } else {
      toneless += lower;
    }
  }
  let pos = 0;
  const parts = [];
  let guard = 0;
  while (pos < toneless.length && guard++ < 40) {
    const parsed = parseSyllableAt(toneless, pos);
    const len = parsed ? parsed.len : 1;
    let tone = 5;
    for (let i = pos; i < pos + len; i++) {
      if (toneAt[i]) { tone = toneAt[i]; break; }
    }
    parts.push((parsed ? parsed.zh : toneless[pos]) + (parsed ? TONE_MARK[tone] : ''));
    pos += len;
  }
  // syllables are space-separated, matching the app's existing zhuyin data
  return parts.join(' ');
}

export function pinyinToZhuyin(pinyin) {
  if (!pinyin || typeof pinyin !== 'string') return '';
  return pinyin
    .split(/[\s'’·-]+/)
    .filter(Boolean)
    .map(chunkToZhuyin)
    .join(' ');
}

const cache = new Map();
export function zhuyinOf(pinyin) {
  if (cache.has(pinyin)) return cache.get(pinyin);
  const z = pinyinToZhuyin(pinyin);
  cache.set(pinyin, z);
  return z;
}
