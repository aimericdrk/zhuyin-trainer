import { spellNumber, spellMinute, spellHour } from './chineseNumber';

describe('spellNumber', () => {
  test('single digits', () => {
    expect(spellNumber(0)).toBe('零');
    expect(spellNumber(2)).toBe('二');
    expect(spellNumber(9)).toBe('九');
  });

  test('tens collapse leading 一十', () => {
    expect(spellNumber(10)).toBe('十');
    expect(spellNumber(12)).toBe('十二');
    expect(spellNumber(15)).toBe('十五');
    expect(spellNumber(20)).toBe('二十');
    expect(spellNumber(22)).toBe('二十二');
    expect(spellNumber(99)).toBe('九十九');
  });

  test('hundreds use 兩 for 2 and insert 零', () => {
    expect(spellNumber(100)).toBe('一百');
    expect(spellNumber(105)).toBe('一百零五');
    expect(spellNumber(110)).toBe('一百一十');
    expect(spellNumber(200)).toBe('兩百');
    expect(spellNumber(250)).toBe('兩百五十');
  });

  test('thousands', () => {
    expect(spellNumber(1000)).toBe('一千');
    expect(spellNumber(2000)).toBe('兩千');
    expect(spellNumber(2005)).toBe('兩千零五');
    expect(spellNumber(1010)).toBe('一千零一十');
    expect(spellNumber(1900)).toBe('一千九百');
    expect(spellNumber(9999)).toBe('九千九百九十九');
  });

  test('ten-thousands use 萬 with the 兩 and 零 rules', () => {
    expect(spellNumber(10000)).toBe('一萬');
    expect(spellNumber(20000)).toBe('兩萬');
    expect(spellNumber(12000)).toBe('一萬兩千');
    expect(spellNumber(12345)).toBe('一萬兩千三百四十五');
    expect(spellNumber(10001)).toBe('一萬零一');
    expect(spellNumber(10010)).toBe('一萬零一十');
    expect(spellNumber(100000)).toBe('十萬');
    expect(spellNumber(110000)).toBe('十一萬');
    expect(spellNumber(105000)).toBe('十萬五千');
  });

  test('rejects invalid', () => {
    expect(spellNumber(-1)).toBe('');
    expect(spellNumber(1.5)).toBe('');
  });
});

describe('spellMinute', () => {
  test('0 is empty (no minute spoken)', () => {
    expect(spellMinute(0)).toBe('');
  });
  test('1–9 take 零', () => {
    expect(spellMinute(5)).toBe('零五');
    expect(spellMinute(9)).toBe('零九');
  });
  test('10+ spelled plainly', () => {
    expect(spellMinute(10)).toBe('十');
    expect(spellMinute(15)).toBe('十五');
    expect(spellMinute(25)).toBe('二十五');
    expect(spellMinute(59)).toBe('五十九');
  });
});

describe('spellHour', () => {
  test('2 o’clock is 兩', () => {
    expect(spellHour(2)).toBe('兩');
  });
  test('others normal', () => {
    expect(spellHour(1)).toBe('一');
    expect(spellHour(10)).toBe('十');
    expect(spellHour(12)).toBe('十二');
  });
});
