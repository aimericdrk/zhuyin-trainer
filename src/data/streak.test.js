import { updateStreak, todayStr } from './streak';

describe('todayStr', () => {
  test('formats a date as YYYY-MM-DD', () => {
    expect(todayStr(new Date(2026, 5, 2))).toBe('2026-06-02');
    expect(todayStr(new Date(2026, 0, 9))).toBe('2026-01-09');
  });
});

describe('updateStreak', () => {
  test('first visit starts a streak of 1', () => {
    expect(updateStreak(null, '2026-06-02')).toEqual({ lastDate: '2026-06-02', streak: 1, days: 1 });
  });

  test('same day is a no-op', () => {
    const prev = { lastDate: '2026-06-02', streak: 3, days: 5 };
    expect(updateStreak(prev, '2026-06-02')).toBe(prev);
  });

  test('consecutive day increments streak and days', () => {
    const prev = { lastDate: '2026-06-02', streak: 3, days: 5 };
    expect(updateStreak(prev, '2026-06-03')).toEqual({ lastDate: '2026-06-03', streak: 4, days: 6 });
  });

  test('a gap resets the streak but still counts the day', () => {
    const prev = { lastDate: '2026-06-02', streak: 3, days: 5 };
    expect(updateStreak(prev, '2026-06-05')).toEqual({ lastDate: '2026-06-05', streak: 1, days: 6 });
  });

  test('handles month boundaries', () => {
    const prev = { lastDate: '2026-06-30', streak: 2, days: 2 };
    expect(updateStreak(prev, '2026-07-01')).toEqual({ lastDate: '2026-07-01', streak: 3, days: 3 });
  });
});
