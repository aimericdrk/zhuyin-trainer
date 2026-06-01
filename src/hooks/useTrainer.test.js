import { reducer, init, deriveExpected, validate } from './useTrainer';

const easyEntry = {
  id: 'ni3-ni',
  character: '你',
  pinyin: 'nǐ',
  pinyinPlain: 'ni',
  meaning: { en: 'you', fr: 'tu' },
  chars: [{ char: '你', zhuyin: ['ㄋ', 'ㄧ'], tone: 3 }],
  isWord: false,
};

const tone1Entry = {
  id: 'ma1-ma',
  character: '媽',
  pinyin: 'mā',
  pinyinPlain: 'ma',
  meaning: { en: 'mother', fr: 'mère' },
  chars: [{ char: '媽', zhuyin: ['ㄇ', 'ㄚ'], tone: 1 }],
  isWord: false,
};

// Raw shapes for `init`, which calls `buildEntries` internally.
function rawFrom(unified, opts = {}) {
  return {
    id: unified.id,
    character: unified.character,
    pinyin: unified.pinyin,
    pinyinPlain: unified.pinyinPlain,
    zhuyin: unified.chars[0].zhuyin,
    tone: unified.chars[0].tone,
    meaning: unified.meaning,
    sentence: opts.sentence,
  };
}

describe('deriveExpected', () => {
  test('tone 1 returns symbols, no tone mark, single group', () => {
    expect(deriveExpected(tone1Entry)).toEqual({
      expected: ['ㄇ', 'ㄚ'],
      groups: [2],
    });
  });

  test('tone 3 appends ˇ as part of the single group', () => {
    expect(deriveExpected(easyEntry)).toEqual({
      expected: ['ㄋ', 'ㄧ', 'ˇ'],
      groups: [3],
    });
  });

  test('multi-char word interleaves tones per character', () => {
    const wordEntry = {
      id: 'w-媽媽',
      character: '媽媽',
      chars: [
        { char: '媽', zhuyin: ['ㄇ', 'ㄚ'], tone: 1 },
        { char: '媽', zhuyin: ['ㄇ', 'ㄚ'], tone: 5 },
      ],
      isWord: true,
    };
    expect(deriveExpected(wordEntry)).toEqual({
      expected: ['ㄇ', 'ㄚ', 'ㄇ', 'ㄚ', '˙'],
      groups: [2, 3],
    });
  });
});

describe('validate', () => {
  test('all match returns correct with all-ok positions', () => {
    expect(validate(['ㄋ', 'ㄧ'], ['ㄋ', 'ㄧ'])).toEqual({
      outcome: 'correct',
      positions: ['ok', 'ok'],
    });
  });
  test('mismatch returns wrong with per-position results', () => {
    expect(validate(['ㄋ', 'ㄚ'], ['ㄋ', 'ㄧ'])).toEqual({
      outcome: 'wrong',
      positions: ['ok', 'bad'],
    });
  });
});

describe('reducer', () => {
  function setup(rawEntries) {
    return init({ characters: rawEntries });
  }

  test('init builds the initial state from a raw single-char entry', () => {
    const s = setup([rawFrom(easyEntry)]);
    expect(s.current.id).toBe(easyEntry.id);
    expect(s.current.character).toBe('你');
    expect(s.expected).toEqual(['ㄋ', 'ㄧ', 'ˇ']);
    expect(s.groups).toEqual([3]);
    expect(s.input).toEqual([]);
    expect(s.misses).toBe(0);
    expect(s.phase).toBe('input');
    expect(s.perSymbolResult).toBe(null);
    expect(s.stats).toEqual({ correct: 0, wrong: 0, skipped: 0 });
  });

  test('TAP_SYMBOL appends to input', () => {
    let s = setup([rawFrom(easyEntry)]);
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄋ' });
    expect(s.input).toEqual(['ㄋ']);
    expect(s.phase).toBe('input');
  });

  test('TAP_SYMBOL that completes input correctly transitions to correct', () => {
    let s = setup([rawFrom(easyEntry)]);
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄋ' });
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄧ' });
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ˇ' });
    expect(s.phase).toBe('correct');
    expect(s.stats.correct).toBe(1);
  });

  test('TAP_SYMBOL with wrong final symbol transitions to wrong, misses=1', () => {
    let s = setup([rawFrom(easyEntry)]);
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄋ' });
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄧ' });
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ˊ' });
    expect(s.phase).toBe('wrong');
    expect(s.misses).toBe(1);
    expect(s.perSymbolResult).toBe(null);
  });

  test('on the 3rd miss, perSymbolResult is populated', () => {
    let s = setup([rawFrom(easyEntry)]);
    for (let i = 0; i < 3; i++) {
      s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄚ' });
      s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄚ' });
      s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄚ' });
      if (i < 2) s = reducer(s, { type: 'RESET_AFTER_WRONG' });
    }
    expect(s.misses).toBe(3);
    expect(s.perSymbolResult).toEqual(['bad', 'bad', 'bad']);
  });

  test('on the 5th miss, phase becomes revealed and stats.wrong++', () => {
    let s = setup([rawFrom(easyEntry)]);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄚ' });
      s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄚ' });
      s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄚ' });
      if (i < 4) s = reducer(s, { type: 'RESET_AFTER_WRONG' });
    }
    expect(s.misses).toBe(5);
    expect(s.phase).toBe('revealed');
    expect(s.stats.wrong).toBe(1);
  });

  test('RESET_AFTER_WRONG clears input and perSymbolResult, returns to input', () => {
    let s = setup([rawFrom(easyEntry)]);
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄚ' });
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄚ' });
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄚ' });
    expect(s.phase).toBe('wrong');
    s = reducer(s, { type: 'RESET_AFTER_WRONG' });
    expect(s.phase).toBe('input');
    expect(s.input).toEqual([]);
    expect(s.perSymbolResult).toBe(null);
  });

  test('BACKSPACE pops last symbol with no penalty', () => {
    let s = setup([rawFrom(easyEntry)]);
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄋ' });
    s = reducer(s, { type: 'BACKSPACE' });
    expect(s.input).toEqual([]);
    expect(s.misses).toBe(0);
  });

  test('SKIP advances cursor without touching misses or stats.wrong', () => {
    const a = rawFrom({ ...easyEntry, id: 'a' });
    const b = rawFrom({ ...easyEntry, id: 'b' });
    let s = init({ characters: [a, b] });
    s = reducer(s, { type: 'SKIP' });
    expect(s.stats.skipped).toBe(1);
    expect(s.stats.wrong).toBe(0);
    expect(s.misses).toBe(0);
    expect(s.current.id).not.toBe(s.queue[0]);
  });

  test('SKIP is a no-op outside input phase (no double-count during correct flash)', () => {
    const a = rawFrom({ ...easyEntry, id: 'a' });
    const b = rawFrom({ ...easyEntry, id: 'b' });
    let s = init({ characters: [a, b] });
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄋ' });
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄧ' });
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ˇ' });
    expect(s.phase).toBe('correct');
    expect(s.stats.correct).toBe(1);
    const before = s;
    s = reducer(s, { type: 'SKIP' });
    expect(s).toBe(before);
    expect(s.stats.skipped).toBe(0);
    expect(s.stats.correct).toBe(1);
  });

  test('SOLUTION reveals answer and increments stats.wrong', () => {
    let s = setup([rawFrom(easyEntry)]);
    s = reducer(s, { type: 'SOLUTION' });
    expect(s.phase).toBe('revealed');
    expect(s.stats.wrong).toBe(1);
  });

  test('CONTINUE from revealed advances to next character', () => {
    const a = rawFrom({ ...easyEntry, id: 'a' });
    const b = rawFrom({ ...easyEntry, id: 'b', character: '好' });
    let s = init({ characters: [a, b] });
    s = reducer(s, { type: 'SOLUTION' });
    expect(s.phase).toBe('revealed');
    s = reducer(s, { type: 'CONTINUE' });
    expect(s.phase).toBe('input');
    expect(s.input).toEqual([]);
    expect(s.misses).toBe(0);
  });

  test('ADVANCE after correct moves to next char and resets misses', () => {
    const a = rawFrom({ ...easyEntry, id: 'a' });
    const b = rawFrom({ ...easyEntry, id: 'b' });
    let s = init({ characters: [a, b] });
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄋ' });
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄧ' });
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ˇ' });
    expect(s.phase).toBe('correct');
    s = reducer(s, { type: 'ADVANCE' });
    expect(s.phase).toBe('input');
    expect(s.input).toEqual([]);
    expect(s.misses).toBe(0);
    expect(s.stats.correct).toBe(1);
  });

  test('tone 1: auto-validates without tone mark', () => {
    let s = init({ characters: [rawFrom(tone1Entry)] });
    expect(s.expected).toEqual(['ㄇ', 'ㄚ']);
    expect(s.groups).toEqual([2]);
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄇ' });
    s = reducer(s, { type: 'TAP_SYMBOL', symbol: 'ㄚ' });
    expect(s.phase).toBe('correct');
  });

  test('multi-char word: interleaved tones, multi-group state.groups', () => {
    const raw = {
      id: 'ma1-ma',
      character: '媽',
      pinyin: 'mā',
      pinyinPlain: 'ma',
      zhuyin: ['ㄇ', 'ㄚ'],
      tone: 1,
      meaning: { en: 'mother', fr: 'mère' },
      sentence: {
        chinese: '媽媽。',
        words: [{ char: '媽媽', pinyin: 'mā ma', zhuyin: 'ㄇㄚ ㄇㄚ˙', en: 'mother', fr: 'maman' }],
        translation: { en: 'mother', fr: 'maman' },
      },
    };
    let s = init({ characters: [raw] });
    let safety = 10;
    while (s.current.character !== '媽媽' && safety-- > 0) {
      s = reducer(s, { type: 'SOLUTION' });
      s = reducer(s, { type: 'CONTINUE' });
    }
    expect(s.current.character).toBe('媽媽');
    expect(s.expected).toEqual(['ㄇ', 'ㄚ', 'ㄇ', 'ㄚ', '˙']);
    expect(s.groups).toEqual([2, 3]);
  });
});
