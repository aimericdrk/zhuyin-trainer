import { pinyinToZhuyin } from './pinyinToZhuyin';

describe('pinyinToZhuyin — single syllables', () => {
  const cases = [
    ['mā', 'ㄇㄚ'],
    ['má', 'ㄇㄚˊ'],
    ['mǎ', 'ㄇㄚˇ'],
    ['mà', 'ㄇㄚˋ'],
    ['nǐ', 'ㄋㄧˇ'],
    ['hǎo', 'ㄏㄠˇ'],
    ['shì', 'ㄕˋ'],
    ['zì', 'ㄗˋ'],
    ['rén', 'ㄖㄣˊ'],
    ['lǜ', 'ㄌㄩˋ'],
    ['nǚ', 'ㄋㄩˇ'],
    ['qī', 'ㄑㄧ'],
    ['xué', 'ㄒㄩㄝˊ'],
    ['jiā', 'ㄐㄧㄚ'],
    ['èr', 'ㄦˋ'],
    ['yī', 'ㄧ'],
    ['wǔ', 'ㄨˇ'],
    ['yú', 'ㄩˊ'],
    ['guó', 'ㄍㄨㄛˊ'],
    ['zhōng', 'ㄓㄨㄥ'],
  ];
  test.each(cases)('%s → %s', (py, zh) => {
    expect(pinyinToZhuyin(py)).toBe(zh);
  });
});

describe('pinyinToZhuyin — multi-syllable & neutral tone', () => {
  test('spaced syllables', () => {
    expect(pinyinToZhuyin('nǐ hǎo')).toBe('ㄋㄧˇ ㄏㄠˇ');
  });
  test('joined syllables split greedily', () => {
    expect(pinyinToZhuyin('zhōngguó')).toBe('ㄓㄨㄥ ㄍㄨㄛˊ');
    expect(pinyinToZhuyin('xiāngjiāo')).toBe('ㄒㄧㄤ ㄐㄧㄠ');
    expect(pinyinToZhuyin('píngguǒ')).toBe('ㄆㄧㄥˊ ㄍㄨㄛˇ');
  });
  test('neutral tone gets the ˙ mark', () => {
    expect(pinyinToZhuyin('māma')).toBe('ㄇㄚ ㄇㄚ˙');
    expect(pinyinToZhuyin('xièxie')).toBe('ㄒㄧㄝˋ ㄒㄧㄝ˙');
  });
  test('capitalised toned names', () => {
    expect(pinyinToZhuyin('Táiwān')).toBe('ㄊㄞˊ ㄨㄢ');
  });
});

describe('pinyinToZhuyin — robustness', () => {
  test('empty / non-string', () => {
    expect(pinyinToZhuyin('')).toBe('');
    expect(pinyinToZhuyin(null)).toBe('');
  });
});
