const TONE_FROM_MARK = { 'ˊ': 2, 'ˇ': 3, 'ˋ': 4, '˙': 5 };

export function parseWordZhuyin(s) {
  return s.split(/ +/).filter(Boolean).map((segment) => {
    const last = segment[segment.length - 1];
    if (Object.prototype.hasOwnProperty.call(TONE_FROM_MARK, last)) {
      return { zhuyin: [...segment.slice(0, -1)], tone: TONE_FROM_MARK[last] };
    }
    return { zhuyin: [...segment], tone: 1 };
  });
}

function stripDiacritics(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function normalizeOriginal(raw) {
  return {
    id: raw.id,
    character: raw.character,
    pinyin: raw.pinyin,
    pinyinPlain: raw.pinyinPlain,
    meaning: raw.meaning,
    sentence: raw.sentence,
    chars: [{ char: raw.character, zhuyin: raw.zhuyin, tone: raw.tone }],
    isWord: false,
  };
}

function compileWord(word, parentSentence) {
  const chars = [...word.char];
  if (chars.length < 2) return null;
  const parsed = parseWordZhuyin(word.zhuyin);
  if (parsed.length !== chars.length) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[buildEntries] zhuyin segment count (${parsed.length}) does not match character count (${chars.length}) for word "${word.char}" with zhuyin "${word.zhuyin}" — skipping.`);
    }
    return null;
  }
  return {
    id: `w-${word.char}-${word.zhuyin.replace(/ /g, '-')}`,
    character: word.char,
    pinyin: word.pinyin,
    pinyinPlain: stripDiacritics(word.pinyin),
    meaning: { en: word.en, fr: word.fr },
    sentence: parentSentence,
    chars: chars.map((ch, i) => ({ char: ch, zhuyin: parsed[i].zhuyin, tone: parsed[i].tone })),
    isWord: true,
  };
}

export function buildEntries(characters) {
  const originals = characters.map(normalizeOriginal);
  const wordById = new Map();
  for (const raw of characters) {
    const words = raw.sentence && Array.isArray(raw.sentence.words) ? raw.sentence.words : [];
    for (const word of words) {
      if ([...word.char].length < 2) continue;
      const compiled = compileWord(word, raw.sentence);
      if (!compiled) continue;
      if (!wordById.has(compiled.id)) {
        wordById.set(compiled.id, compiled);
      }
    }
  }
  return { pool: [...originals, ...wordById.values()] };
}
