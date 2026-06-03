import { DIALOGUES, collectTurn } from './dialogues';

test('every dialogue starts with a partner line and alternates into choices', () => {
  for (const d of DIALOGUES) {
    expect(d.steps[0].who).toBe('partner');
    const choose = d.steps.filter((s) => s.who === 'choose');
    expect(choose.length).toBeGreaterThanOrEqual(1);
    for (const c of choose) {
      expect(c.options.length).toBeGreaterThanOrEqual(2);
      for (const o of c.options) {
        expect(o.zh).toBeTruthy();
        expect(o.py).toBeTruthy();
        expect(o.en).toBeTruthy();
        expect(o.fr).toBeTruthy();
      }
    }
  }
});

describe('collectTurn', () => {
  const d = DIALOGUES[0];

  test('collects the opening partner run up to the first choice', () => {
    const { bubbles, nextIndex, choose } = collectTurn(d, 0);
    expect(bubbles.length).toBeGreaterThanOrEqual(1);
    expect(bubbles[0].who).toBe('partner');
    expect(choose).not.toBeNull();
    expect(d.steps[nextIndex].who).toBe('choose');
  });

  test('returns null choose at the end of the script', () => {
    const last = collectTurn(d, d.steps.length);
    expect(last.bubbles).toHaveLength(0);
    expect(last.choose).toBeNull();
  });
});
