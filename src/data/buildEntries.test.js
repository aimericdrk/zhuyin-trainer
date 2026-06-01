import { parseWordZhuyin, buildEntries } from './buildEntries';

describe('parseWordZhuyin', () => {
  test('two-character word, char1 tone 1 (no mark), char2 neutral tone ˙', () => {
    expect(parseWordZhuyin('ㄇㄚ ㄇㄚ˙')).toEqual([
      { zhuyin: ['ㄇ', 'ㄚ'], tone: 1 },
      { zhuyin: ['ㄇ', 'ㄚ'], tone: 5 },
    ]);
  });

  test('two-character word with medial + final + tones', () => {
    expect(parseWordZhuyin('ㄒㄩㄝˊ ㄕㄥ')).toEqual([
      { zhuyin: ['ㄒ', 'ㄩ', 'ㄝ'], tone: 2 },
      { zhuyin: ['ㄕ', 'ㄥ'], tone: 1 },
    ]);
  });

  test('every tone mark is recognized', () => {
    expect(parseWordZhuyin('ㄉㄚˊ ㄉㄚˇ ㄉㄚˋ ㄉㄚ˙ ㄉㄚ')).toEqual([
      { zhuyin: ['ㄉ', 'ㄚ'], tone: 2 },
      { zhuyin: ['ㄉ', 'ㄚ'], tone: 3 },
      { zhuyin: ['ㄉ', 'ㄚ'], tone: 4 },
      { zhuyin: ['ㄉ', 'ㄚ'], tone: 5 },
      { zhuyin: ['ㄉ', 'ㄚ'], tone: 1 },
    ]);
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
  translation: { en: 'My mom likes tea.', fr: 'Ma maman aime le thé.' },
};

const RAW_MA = {
  id: 'ma1-ma',
  character: '媽',
  pinyin: 'mā',
  pinyinPlain: 'ma',
  zhuyin: ['ㄇ', 'ㄚ'],
  tone: 1,
  meaning: { en: 'mother', fr: 'mère' },
  sentence: SENTENCE_FIXTURE,
};

const RAW_NI = {
  id: 'ni3-ni',
  character: '你',
  pinyin: 'nǐ',
  pinyinPlain: 'ni',
  zhuyin: ['ㄋ', 'ㄧ'],
  tone: 3,
  meaning: { en: 'you', fr: 'tu' },
  sentence: {
    chinese: '你好。',
    words: [
      { char: '你好', pinyin: 'nǐ hǎo', zhuyin: 'ㄋㄧˇ ㄏㄠˇ', en: 'hello', fr: 'bonjour' },
    ],
    translation: { en: 'Hello.', fr: 'Bonjour.' },
  },
};

describe('buildEntries', () => {
  test('pool contains normalized originals plus deduped compiled multi-char words', () => {
    const { pool } = buildEntries([RAW_MA, RAW_NI]);
    // 2 originals + 3 unique multi-char words (媽媽, 喜歡, 你好)
    expect(pool).toHaveLength(5);
    const ids = pool.map((e) => e.id);
    expect(ids).toEqual(expect.arrayContaining(['ma1-ma', 'ni3-ni']));
    const originals = pool.filter((e) => !e.isWord);
    expect(originals).toHaveLength(2);
    expect(originals[0].id).toBe('ma1-ma');
    expect(originals[0].character).toBe('媽');
    expect(originals[0].chars).toEqual([{ char: '媽', zhuyin: ['ㄇ', 'ㄚ'], tone: 1 }]);
    const wordEntries = pool.filter((e) => e.isWord);
    expect(wordEntries.map((e) => e.character).sort()).toEqual(['你好', '喜歡', '媽媽']);
  });

  test('compiled word entry has multi-element chars[] and inherits parent sentence', () => {
    const { pool } = buildEntries([RAW_MA]);
    const mama = pool.find((e) => e.character === '媽媽');
    expect(mama.isWord).toBe(true);
    expect(mama.chars).toEqual([
      { char: '媽', zhuyin: ['ㄇ', 'ㄚ'], tone: 1 },
      { char: '媽', zhuyin: ['ㄇ', 'ㄚ'], tone: 5 },
    ]);
    expect(mama.pinyin).toBe('mā ma');
    expect(mama.pinyinPlain).toBe('ma ma');
    expect(mama.meaning).toEqual({ en: 'mother', fr: 'maman' });
    expect(mama.sentence).toBe(SENTENCE_FIXTURE);
  });

  test('duplicate words across entries are deduped (first occurrence wins)', () => {
    const second = { ...RAW_NI, id: 'ni3-other', sentence: { ...RAW_NI.sentence } };
    const { pool } = buildEntries([RAW_NI, second]);
    const nihao = pool.filter((e) => e.character === '你好');
    expect(nihao).toHaveLength(1);
    expect(nihao[0].sentence).toBe(RAW_NI.sentence);
  });

  test('entries without a sentence still produce a normalized original', () => {
    const minimal = { id: 'x', character: '甲', pinyin: 'jiǎ', pinyinPlain: 'jia', zhuyin: ['ㄐ', 'ㄧ', 'ㄚ'], tone: 3, meaning: { en: 'A', fr: 'A' } };
    const { pool } = buildEntries([minimal]);
    expect(pool).toHaveLength(1);
    expect(pool[0].isWord).toBe(false);
  });

  test('a word whose parsed-segment count mismatches the char count is skipped with a warn', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const corrupted = {
      ...RAW_MA,
      sentence: {
        ...SENTENCE_FIXTURE,
        words: [{ char: '媽媽媽', pinyin: 'x', zhuyin: 'ㄇㄚ ㄇㄚ˙', en: 'x', fr: 'x' }],
      },
    };
    const { pool } = buildEntries([corrupted]);
    expect(pool.filter((e) => e.isWord)).toHaveLength(0);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
