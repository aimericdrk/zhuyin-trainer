import { render } from '@testing-library/react';
import InputStrip from './InputStrip';

test('renders one slot per length', () => {
  const { container } = render(
    <InputStrip length={3} input={[]} perSymbolResult={null} phase="input" />
  );
  expect(container.querySelectorAll('.is-slot')).toHaveLength(3);
});

test('marks slot at the end of every group except the last with is-slot--group-end', () => {
  // groups [2, 3] → boundary after index 1 only
  const { container } = render(
    <InputStrip length={5} input={[]} perSymbolResult={null} phase="input" groups={[2, 3]} />
  );
  const slots = container.querySelectorAll('.is-slot');
  expect(slots).toHaveLength(5);
  expect(slots[0].className).not.toMatch(/is-slot--group-end/);
  expect(slots[1].className).toMatch(/is-slot--group-end/);
  expect(slots[2].className).not.toMatch(/is-slot--group-end/);
  expect(slots[3].className).not.toMatch(/is-slot--group-end/);
  expect(slots[4].className).not.toMatch(/is-slot--group-end/);
});

test('groups missing or length<=1: no group-end class on any slot', () => {
  const { container } = render(
    <InputStrip length={3} input={[]} perSymbolResult={null} phase="input" />
  );
  for (const slot of container.querySelectorAll('.is-slot')) {
    expect(slot.className).not.toMatch(/is-slot--group-end/);
  }
});

test('showCount=false with empty input renders exactly 1 slot (trailing placeholder)', () => {
  const { container } = render(
    <InputStrip length={5} input={[]} perSymbolResult={null} phase="input" showCount={false} />
  );
  expect(container.querySelectorAll('.is-slot')).toHaveLength(1);
});

test('showCount=false with partial input renders input.length + 1 slots', () => {
  const { container } = render(
    <InputStrip length={5} input={['ㄋ', 'ㄧ']} perSymbolResult={null} phase="input" showCount={false} />
  );
  expect(container.querySelectorAll('.is-slot')).toHaveLength(3);
});

test('showCount=false with full input (input.length === length) caps at length, no trailing placeholder', () => {
  const { container } = render(
    <InputStrip length={3} input={['ㄋ', 'ㄧ', 'ˇ']} perSymbolResult={null} phase="input" showCount={false} />
  );
  expect(container.querySelectorAll('.is-slot')).toHaveLength(3);
});

test('showCount=false suppresses group-end class even when groups is provided', () => {
  const { container } = render(
    <InputStrip length={5} input={['ㄋ', 'ㄧ', 'ˇ']} perSymbolResult={null} phase="input" showCount={false} groups={[2, 3]} />
  );
  const slots = container.querySelectorAll('.is-slot');
  for (const slot of slots) {
    expect(slot.className).not.toMatch(/is-slot--group-end/);
  }
});

test('showCount=false preserves ok/bad styling on filled slots', () => {
  const { container } = render(
    <InputStrip
      length={5}
      input={['ㄋ', 'ㄚ']}
      perSymbolResult={['ok', 'bad']}
      phase="wrong"
      showCount={false}
    />
  );
  const slots = container.querySelectorAll('.is-slot');
  expect(slots).toHaveLength(3);
  expect(slots[0].className).toMatch(/is-slot--ok/);
  expect(slots[1].className).toMatch(/is-slot--bad/);
  expect(slots[2].className).not.toMatch(/is-slot--ok/);
  expect(slots[2].className).not.toMatch(/is-slot--bad/);
});

test('showCount default true keeps current full-length behavior', () => {
  const { container } = render(
    <InputStrip length={5} input={['ㄋ']} perSymbolResult={null} phase="input" />
  );
  expect(container.querySelectorAll('.is-slot')).toHaveLength(5);
});
