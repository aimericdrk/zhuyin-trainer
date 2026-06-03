import { nextBox, pickSession, mastery, MAX_BOX } from './srs';

describe('nextBox', () => {
  test('correct promotes, capped at MAX_BOX', () => {
    expect(nextBox(1, true)).toBe(2);
    expect(nextBox(5, true)).toBe(5);
    expect(nextBox(undefined, true)).toBe(2);
  });
  test('wrong resets to box 1', () => {
    expect(nextBox(4, false)).toBe(1);
    expect(nextBox(1, false)).toBe(1);
  });
});

describe('pickSession', () => {
  const cards = Array.from({ length: 10 }, (_, i) => ({ id: `c${i}` }));

  test('limits to size and prioritises low boxes', () => {
    const boxes = { c0: 5, c1: 5, c2: 1, c3: 1 };
    const session = pickSession(cards, boxes, 4, () => 0.5);
    expect(session).toHaveLength(4);
    // box-1 / default-1 cards should be chosen before box-5 cards
    expect(session.find((c) => c.id === 'c0')).toBeUndefined();
    expect(session.find((c) => c.id === 'c1')).toBeUndefined();
  });

  test('returns all when fewer than size', () => {
    expect(pickSession(cards.slice(0, 3), {}, 12, () => 0.1)).toHaveLength(3);
  });
});

describe('mastery', () => {
  const cards = [{ id: 'a' }, { id: 'b' }];
  test('all box 1 → 0', () => {
    expect(mastery(cards, {})).toBe(0);
  });
  test('all max box → 1', () => {
    expect(mastery(cards, { a: MAX_BOX, b: MAX_BOX })).toBe(1);
  });
  test('empty pool → 0', () => {
    expect(mastery([], {})).toBe(0);
  });
});
