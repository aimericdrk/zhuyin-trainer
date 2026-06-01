import { renderHook } from '@testing-library/react';
import { useShuffledLayout } from './useShuffledLayout';
import { ZHUYIN_LAYOUT } from '../data/keyboardLayout';

function sortAll(layout) {
  return {
    initials: layout.initials.map((r) => [...r].sort()),
    finals: layout.finals.map((r) => [...r].sort()),
    medials: [...layout.medials].sort(),
    tones: [...layout.tones].sort(),
  };
}

test('disabled returns the exact ZHUYIN_LAYOUT reference', () => {
  const { result } = renderHook(() => useShuffledLayout({ enabled: false, promptId: 'x' }));
  expect(result.current).toBe(ZHUYIN_LAYOUT);
});

test('enabled returns a layout with the same elements as base (per-section set-equal)', () => {
  const { result } = renderHook(() => useShuffledLayout({ enabled: true, promptId: 'abc' }));
  expect(sortAll(result.current)).toEqual(sortAll(ZHUYIN_LAYOUT));
});

test('enabled preserves the row structure (same row lengths)', () => {
  const { result } = renderHook(() => useShuffledLayout({ enabled: true, promptId: 'abc' }));
  expect(result.current.initials.map((r) => r.length)).toEqual(ZHUYIN_LAYOUT.initials.map((r) => r.length));
  expect(result.current.finals.map((r) => r.length)).toEqual(ZHUYIN_LAYOUT.finals.map((r) => r.length));
  expect(result.current.medials.length).toBe(ZHUYIN_LAYOUT.medials.length);
  expect(result.current.tones.length).toBe(ZHUYIN_LAYOUT.tones.length);
});

test('same promptId twice yields the same shuffle (deterministic)', () => {
  const a = renderHook(() => useShuffledLayout({ enabled: true, promptId: 'abc' })).result.current;
  const b = renderHook(() => useShuffledLayout({ enabled: true, promptId: 'abc' })).result.current;
  expect(a).toEqual(b);
});

test('different promptIds yield different shuffles (at least one section differs)', () => {
  const a = renderHook(() => useShuffledLayout({ enabled: true, promptId: 'abc' })).result.current;
  const b = renderHook(() => useShuffledLayout({ enabled: true, promptId: 'xyz' })).result.current;
  expect(a).not.toEqual(b);
});
