import { buildQuestion, init, reducer } from './useHard';

function entry(id, meaning) {
  return {
    id,
    character: id.toUpperCase(),
    pinyin: id,
    pinyinPlain: id,
    chars: [{ char: id.toUpperCase(), zhuyin: ['ㄚ'], tone: 1 }],
    meaning: { en: meaning, fr: `fr-${meaning}` },
    isWord: false,
  };
}

function rawFrom(unified) {
  return {
    id: unified.id,
    character: unified.character,
    pinyin: unified.pinyin,
    pinyinPlain: unified.pinyinPlain,
    zhuyin: unified.chars[0].zhuyin,
    tone: unified.chars[0].tone,
    meaning: unified.meaning,
  };
}

function makePool(n) {
  return Array.from({ length: n }, (_, i) => entry(`e${i}`, `meaning-${i}`));
}

function seededRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('buildQuestion', () => {
  test('returns 10 options when pool has 12 distinct meanings', () => {
    const pool = makePool(12);
    const q = buildQuestion(pool, null, seededRng(1));
    expect(q.options).toHaveLength(10);
    expect(q.correctId).toBe(q.target.id);
    expect(q.options.some((o) => o.id === q.correctId)).toBe(true);
  });

  test('all 9 distractors have meanings distinct from the target', () => {
    const pool = makePool(15);
    const q = buildQuestion(pool, null, seededRng(2));
    const targetEn = q.target.meaning.en.toLowerCase();
    const distractors = q.options.filter((o) => o.id !== q.correctId);
    expect(distractors).toHaveLength(9);
    for (const d of distractors) {
      const e = pool.find((p) => p.id === d.id);
      expect(e.meaning.en.toLowerCase()).not.toBe(targetEn);
    }
  });

  test('avoids reusing the same target when prevTargetId is given and pool has ≥2 entries', () => {
    const pool = makePool(12);
    const q = buildQuestion(pool, 'e0', seededRng(3));
    expect(q.target.id).not.toBe('e0');
  });

  test('small pool fallback: returns whatever options are available', () => {
    const pool = makePool(5);
    const q = buildQuestion(pool, null, seededRng(4));
    expect(q.options.length).toBe(5);
    expect(q.options.some((o) => o.id === q.correctId)).toBe(true);
  });

  test('dedupes by english meaning (case-insensitive)', () => {
    const pool = [
      entry('a', 'horse'),
      entry('b', 'HORSE'),
      entry('c', 'mother'),
      entry('d', 'mother'),
      entry('e', 'father'),
      entry('f', 'cat'),
      entry('g', 'dog'),
      entry('h', 'bird'),
      entry('i', 'fish'),
      entry('j', 'tea'),
      entry('k', 'water'),
      entry('l', 'rice'),
    ];
    const q = buildQuestion(pool, 'a', seededRng(5));
    const meanings = new Set(
      q.options.map((o) => {
        const e = pool.find((p) => p.id === o.id);
        return e.meaning.en.toLowerCase();
      })
    );
    expect(meanings.size).toBe(q.options.length);
  });
});

describe('useVocabMcq init + reducer', () => {
  function setup(rawEntries) {
    return init({ characters: rawEntries });
  }

  test('init builds a question and zeroed stats', () => {
    const raw = makePool(12).map(rawFrom);
    const s = setup(raw);
    expect(s.options).toHaveLength(10);
    expect(s.picked.size).toBe(0);
    expect(s.firstWrongCounted).toBe(false);
    expect(s.status).toBe('guessing');
    expect(s.stats).toEqual({ correct: 0, wrong: 0, skipped: 0 });
    expect(s.options.some((o) => o.id === s.correctId)).toBe(true);
  });

  test('PICK_OPTION with the correct id → status=correct, stats.correct=1, picked includes it', () => {
    const raw = makePool(12).map(rawFrom);
    let s = setup(raw);
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    expect(s.status).toBe('correct');
    expect(s.stats.correct).toBe(1);
    expect(s.picked.has(s.correctId)).toBe(true);
  });

  test('PICK_OPTION with a wrong id → status=guessing, stats.wrong=1, firstWrongCounted=true', () => {
    const raw = makePool(12).map(rawFrom);
    let s = setup(raw);
    const wrongId = s.options.find((o) => o.id !== s.correctId).id;
    s = reducer(s, { type: 'PICK_OPTION', optionId: wrongId });
    expect(s.status).toBe('guessing');
    expect(s.stats.wrong).toBe(1);
    expect(s.firstWrongCounted).toBe(true);
    expect(s.picked.has(wrongId)).toBe(true);
  });

  test('two wrong picks count as one (no double-count)', () => {
    const raw = makePool(12).map(rawFrom);
    let s = setup(raw);
    const wrongs = s.options.filter((o) => o.id !== s.correctId);
    s = reducer(s, { type: 'PICK_OPTION', optionId: wrongs[0].id });
    s = reducer(s, { type: 'PICK_OPTION', optionId: wrongs[1].id });
    expect(s.stats.wrong).toBe(1);
    expect(s.picked.has(wrongs[0].id)).toBe(true);
    expect(s.picked.has(wrongs[1].id)).toBe(true);
  });

  test('wrong then correct → status=correct, stats.wrong=1, stats.correct=0', () => {
    const raw = makePool(12).map(rawFrom);
    let s = setup(raw);
    const wrongId = s.options.find((o) => o.id !== s.correctId).id;
    s = reducer(s, { type: 'PICK_OPTION', optionId: wrongId });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    expect(s.status).toBe('correct');
    expect(s.stats.wrong).toBe(1);
    expect(s.stats.correct).toBe(0);
  });

  test('PICK_OPTION on an already-picked id is a no-op', () => {
    const raw = makePool(12).map(rawFrom);
    let s = setup(raw);
    const wrongId = s.options.find((o) => o.id !== s.correctId).id;
    s = reducer(s, { type: 'PICK_OPTION', optionId: wrongId });
    const before = s;
    s = reducer(s, { type: 'PICK_OPTION', optionId: wrongId });
    expect(s).toBe(before);
  });

  test('PICK_OPTION outside guessing is a no-op', () => {
    const raw = makePool(12).map(rawFrom);
    let s = setup(raw);
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    expect(s.status).toBe('correct');
    const before = s;
    const wrongId = s.options.find((o) => o.id !== s.correctId).id;
    s = reducer(s, { type: 'PICK_OPTION', optionId: wrongId });
    expect(s).toBe(before);
  });

  test('SKIP increments stats.skipped and advances to a new prompt', () => {
    const raw = makePool(12).map(rawFrom);
    let s = setup(raw);
    const prevCorrectId = s.correctId;
    s = reducer(s, { type: 'SKIP' });
    expect(s.stats.skipped).toBe(1);
    expect(s.status).toBe('guessing');
    expect(s.picked.size).toBe(0);
    expect(s.correctId).not.toBe(prevCorrectId);
  });

  test('SOLUTION from guessing increments stats.wrong (once) and sets status=revealed', () => {
    const raw = makePool(12).map(rawFrom);
    let s = setup(raw);
    s = reducer(s, { type: 'SOLUTION' });
    expect(s.status).toBe('revealed');
    expect(s.stats.wrong).toBe(1);
    expect(s.picked.has(s.correctId)).toBe(true);
  });

  test('SOLUTION after a wrong pick does NOT double-count stats.wrong', () => {
    const raw = makePool(12).map(rawFrom);
    let s = setup(raw);
    const wrongId = s.options.find((o) => o.id !== s.correctId).id;
    s = reducer(s, { type: 'PICK_OPTION', optionId: wrongId });
    s = reducer(s, { type: 'SOLUTION' });
    expect(s.status).toBe('revealed');
    expect(s.stats.wrong).toBe(1);
  });

  test('CONTINUE from revealed advances to a new prompt', () => {
    const raw = makePool(12).map(rawFrom);
    let s = setup(raw);
    s = reducer(s, { type: 'SOLUTION' });
    expect(s.status).toBe('revealed');
    s = reducer(s, { type: 'CONTINUE' });
    expect(s.status).toBe('guessing');
    expect(s.picked.size).toBe(0);
  });

  test('ADVANCE from correct builds a new question', () => {
    const raw = makePool(12).map(rawFrom);
    let s = setup(raw);
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    expect(s.status).toBe('correct');
    s = reducer(s, { type: 'ADVANCE' });
    expect(s.status).toBe('guessing');
    expect(s.picked.size).toBe(0);
    expect(s.firstWrongCounted).toBe(false);
  });
});

const SENTENCE_FIXTURE = {
  chinese: '我媽媽喜歡喝茶。',
  words: [
    { char: '我', pinyin: 'wǒ', zhuyin: 'ㄨㄛˇ', en: 'I', fr: 'je' },
    { char: '媽媽', pinyin: 'mā ma', zhuyin: 'ㄇㄚ ㄇㄚ˙', en: 'mother', fr: 'maman' },
    { char: '喜歡', pinyin: 'xǐ huān', zhuyin: 'ㄒㄧˇ ㄏㄨㄢ', en: 'to like', fr: 'aimer' },
    { char: '喝', pinyin: 'hē', zhuyin: 'ㄏㄜ', en: 'to drink', fr: 'boire' },
    { char: '茶', pinyin: 'chá', zhuyin: 'ㄔㄚˊ', en: 'tea', fr: 'thé' },
  ],
  translation: { en: 'My mom likes drinking tea.', fr: 'Ma maman aime boire du thé.' },
};

function rawWithSentence(id, meaning) {
  return {
    id,
    character: id.toUpperCase(),
    pinyin: id,
    pinyinPlain: id,
    zhuyin: ['ㄚ'],
    tone: 1,
    meaning: { en: meaning, fr: `fr-${meaning}` },
    sentence: SENTENCE_FIXTURE,
  };
}

function poolWithSentences(n) {
  return Array.from({ length: n }, (_, i) => rawWithSentence(`e${i}`, `meaning-${i}`));
}

describe('useHard phase + order exercise', () => {
  test('init starts in phase mcq with mcq fields populated', () => {
    const raw = poolWithSentences(12);
    const s = init({ characters: raw });
    expect(s.phase).toBe('mcq');
    expect(s.options).toHaveLength(10);
    expect(s.status).toBe('guessing');
  });

  test('after correct MCQ pick + ADVANCE, phase flips to order with order fields populated', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    expect(s.status).toBe('correct');
    s = reducer(s, { type: 'ADVANCE' });
    expect(s.phase).toBe('order');
    expect(s.status).toBe('arranging');
    expect(Array.isArray(s.sentenceWords)).toBe(true);
    expect(s.sentenceWords.length).toBeGreaterThanOrEqual(2);
    expect(s.available.length).toBe(s.sentenceWords.length);
    expect(s.placed).toEqual([]);
    expect(s.sentenceTranslation).toBeDefined();
  });

  test('sentenceWords have stable ids w-0, w-1, ... in canonical order', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    s = reducer(s, { type: 'ADVANCE' });
    for (let i = 0; i < s.sentenceWords.length; i++) {
      expect(s.sentenceWords[i].id).toBe(`w-${i}`);
    }
  });

  test('available is shuffled (not equal to canonical order, with high probability)', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    s = reducer(s, { type: 'ADVANCE' });
    const availableIds = s.available.map((w) => w.id);
    const canonicalIds = s.sentenceWords.map((w) => w.id);
    expect(availableIds).not.toEqual(canonicalIds);
  });

  test('PLACE_WORD moves a word from available to placed (appended)', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    s = reducer(s, { type: 'ADVANCE' });
    const firstAvail = s.available[0];
    s = reducer(s, { type: 'PLACE_WORD', wordId: firstAvail.id });
    expect(s.available.find((w) => w.id === firstAvail.id)).toBeUndefined();
    expect(s.placed[s.placed.length - 1].id).toBe(firstAvail.id);
  });

  test('REMOVE_WORD moves a placed word back to available', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    s = reducer(s, { type: 'ADVANCE' });
    const firstAvail = s.available[0];
    s = reducer(s, { type: 'PLACE_WORD', wordId: firstAvail.id });
    s = reducer(s, { type: 'REMOVE_WORD', wordId: firstAvail.id });
    expect(s.placed).toEqual([]);
    expect(s.available.find((w) => w.id === firstAvail.id)).toBeDefined();
  });

  test('placing all words in canonical order → status correct, stats.correct++ (first-try)', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    s = reducer(s, { type: 'ADVANCE' });
    for (const sw of s.sentenceWords) {
      s = reducer(s, { type: 'PLACE_WORD', wordId: sw.id });
    }
    expect(s.status).toBe('correct');
    expect(s.stats.correct).toBe(1);
  });

  test('placing all words in wrong order → status wrong, stats.wrong=1, firstWrongCounted=true', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    s = reducer(s, { type: 'ADVANCE' });
    const reversed = s.sentenceWords.slice().reverse();
    for (const sw of reversed) {
      s = reducer(s, { type: 'PLACE_WORD', wordId: sw.id });
    }
    expect(s.status).toBe('wrong');
    expect(s.stats.wrong).toBe(1);
    expect(s.firstWrongCounted).toBe(true);
  });

  test('RESET_ORDER from status=wrong clears placed, reshuffles available, status=arranging', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    s = reducer(s, { type: 'ADVANCE' });
    const reversed = s.sentenceWords.slice().reverse();
    for (const sw of reversed) {
      s = reducer(s, { type: 'PLACE_WORD', wordId: sw.id });
    }
    expect(s.status).toBe('wrong');
    s = reducer(s, { type: 'RESET_ORDER' });
    expect(s.status).toBe('arranging');
    expect(s.placed).toEqual([]);
    expect(s.available).toHaveLength(s.sentenceWords.length);
    expect(s.firstWrongCounted).toBe(true);
  });

  test('wrong then RESET_ORDER then correct → status correct, stats.wrong=1, stats.correct=0', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    s = reducer(s, { type: 'ADVANCE' });
    const reversed = s.sentenceWords.slice().reverse();
    for (const sw of reversed) {
      s = reducer(s, { type: 'PLACE_WORD', wordId: sw.id });
    }
    s = reducer(s, { type: 'RESET_ORDER' });
    for (const sw of s.sentenceWords) {
      s = reducer(s, { type: 'PLACE_WORD', wordId: sw.id });
    }
    expect(s.status).toBe('correct');
    expect(s.stats.wrong).toBe(1);
    expect(s.stats.correct).toBe(0);
  });

  test('SKIP from order phase increments stats.skipped and flips back to mcq', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    s = reducer(s, { type: 'ADVANCE' });
    expect(s.phase).toBe('order');
    s = reducer(s, { type: 'SKIP' });
    expect(s.stats.skipped).toBe(1);
    expect(s.phase).toBe('mcq');
    expect(s.status).toBe('guessing');
  });

  test('SOLUTION from order phase places all words correctly, status=revealed, stats.wrong increments once', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    s = reducer(s, { type: 'ADVANCE' });
    s = reducer(s, { type: 'SOLUTION' });
    expect(s.status).toBe('revealed');
    expect(s.stats.wrong).toBe(1);
    expect(s.placed.map((w) => w.id)).toEqual(s.sentenceWords.map((w) => w.id));
    expect(s.available).toEqual([]);
  });

  test('CONTINUE from revealed (order phase) flips phase back to mcq', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    s = reducer(s, { type: 'ADVANCE' });
    s = reducer(s, { type: 'SOLUTION' });
    s = reducer(s, { type: 'CONTINUE' });
    expect(s.phase).toBe('mcq');
    expect(s.status).toBe('guessing');
  });

  test('PICK_OPTION is ignored in order phase', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    s = reducer(s, { type: 'ADVANCE' });
    expect(s.phase).toBe('order');
    const before = s;
    s = reducer(s, { type: 'PICK_OPTION', optionId: 'whatever' });
    expect(s).toBe(before);
  });

  test('PLACE_WORD is ignored in mcq phase', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    expect(s.phase).toBe('mcq');
    const before = s;
    s = reducer(s, { type: 'PLACE_WORD', wordId: 'w-0' });
    expect(s).toBe(before);
  });
});

describe('useHard order reducer extensions (DnD)', () => {
  test('PLACE_WORD with toIndex inserts at that position', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    s = reducer(s, { type: 'ADVANCE' });
    const w0 = s.sentenceWords[0];
    const w1 = s.sentenceWords[1];
    const w2 = s.sentenceWords[2];
    s = reducer(s, { type: 'PLACE_WORD', wordId: w1.id, toIndex: 0 });
    s = reducer(s, { type: 'PLACE_WORD', wordId: w2.id, toIndex: 0 });
    s = reducer(s, { type: 'PLACE_WORD', wordId: w0.id, toIndex: 1 });
    expect(s.placed.map((w) => w.id)).toEqual([w2.id, w0.id, w1.id]);
  });

  test('PLACE_WORD without toIndex appends (back-compat)', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    s = reducer(s, { type: 'ADVANCE' });
    const w0 = s.sentenceWords[0];
    const w1 = s.sentenceWords[1];
    s = reducer(s, { type: 'PLACE_WORD', wordId: w0.id });
    s = reducer(s, { type: 'PLACE_WORD', wordId: w1.id });
    expect(s.placed.map((w) => w.id)).toEqual([w0.id, w1.id]);
  });

  test('PLACE_WORD with out-of-bounds toIndex is clamped to a valid position', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    s = reducer(s, { type: 'ADVANCE' });
    const w0 = s.sentenceWords[0];
    const w1 = s.sentenceWords[1];
    s = reducer(s, { type: 'PLACE_WORD', wordId: w0.id });
    s = reducer(s, { type: 'PLACE_WORD', wordId: w1.id, toIndex: 999 });
    expect(s.placed[s.placed.length - 1].id).toBe(w1.id);
  });

  test('REORDER_PLACED moves a word from one index to another', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    s = reducer(s, { type: 'ADVANCE' });
    const w0 = s.sentenceWords[0];
    const w1 = s.sentenceWords[1];
    const w2 = s.sentenceWords[2];
    s = reducer(s, { type: 'PLACE_WORD', wordId: w0.id });
    s = reducer(s, { type: 'PLACE_WORD', wordId: w1.id });
    s = reducer(s, { type: 'PLACE_WORD', wordId: w2.id });
    expect(s.placed.map((w) => w.id)).toEqual([w0.id, w1.id, w2.id]);
    s = reducer(s, { type: 'REORDER_PLACED', fromIndex: 0, toIndex: 2 });
    expect(s.placed.map((w) => w.id)).toEqual([w1.id, w2.id, w0.id]);
  });

  test('REORDER_PLACED fromIndex === toIndex is a no-op (same state ref)', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    s = reducer(s, { type: 'ADVANCE' });
    const w0 = s.sentenceWords[0];
    s = reducer(s, { type: 'PLACE_WORD', wordId: w0.id });
    const before = s;
    s = reducer(s, { type: 'REORDER_PLACED', fromIndex: 0, toIndex: 0 });
    expect(s).toBe(before);
  });

  test('REORDER_PLACED with invalid fromIndex is a no-op', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    s = reducer(s, { type: 'PICK_OPTION', optionId: s.correctId });
    s = reducer(s, { type: 'ADVANCE' });
    const w0 = s.sentenceWords[0];
    s = reducer(s, { type: 'PLACE_WORD', wordId: w0.id });
    const before = s;
    s = reducer(s, { type: 'REORDER_PLACED', fromIndex: 5, toIndex: 0 });
    expect(s).toBe(before);
  });

  test('REORDER_PLACED is ignored outside order/arranging (e.g., mcq phase)', () => {
    const raw = poolWithSentences(12);
    let s = init({ characters: raw });
    // Initial state is mcq phase.
    expect(s.phase).toBe('mcq');
    const before = s;
    s = reducer(s, { type: 'REORDER_PLACED', fromIndex: 0, toIndex: 0 });
    expect(s).toBe(before);
  });
});
