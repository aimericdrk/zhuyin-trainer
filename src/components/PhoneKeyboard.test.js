import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhoneKeyboard from './PhoneKeyboard';
import { PHONE_LAYOUT } from '../data/keyboardLayout';

test('renders 40 main-grid keys, one per cell in PHONE_LAYOUT.rows', () => {
  const { container } = render(<PhoneKeyboard mode="hard" onTap={() => {}} disabled={false} />);
  const mainKeys = container.querySelectorAll('.pk-row:not(.pk-row--bottom) .pk-key');
  expect(mainKeys).toHaveLength(40);
  const allSymbols = PHONE_LAYOUT.rows.flat();
  for (const sym of allSymbols) {
    expect([...mainKeys].some((k) => k.textContent === sym)).toBe(true);
  }
});

test('renders the bottom row: the 注音 spacebar (disabled) and the ㄦ key', () => {
  const { container } = render(<PhoneKeyboard mode="hard" onTap={() => {}} disabled={false} />);
  const bottomKeys = container.querySelectorAll('.pk-row--bottom .pk-key');
  expect(bottomKeys).toHaveLength(2);
  const spaceKey = container.querySelector('.pk-key--space');
  expect(spaceKey).toBeInTheDocument();
  expect(spaceKey.textContent).toBe('注音');
  expect(spaceKey).toBeDisabled();
  const erKey = [...bottomKeys].find((k) => k.textContent === 'ㄦ');
  expect(erKey).toBeInTheDocument();
});

test('clicking a non-tone main-grid key calls onTap with that symbol', async () => {
  const onTap = jest.fn();
  render(<PhoneKeyboard mode="hard" onTap={onTap} disabled={false} />);
  await userEvent.click(screen.getByRole('button', { name: 'ㄇ' }));
  expect(onTap).toHaveBeenCalledWith('ㄇ');
});

test('clicking the ㄦ bottom-row key calls onTap with ㄦ', async () => {
  const onTap = jest.fn();
  render(<PhoneKeyboard mode="hard" onTap={onTap} disabled={false} />);
  await userEvent.click(screen.getByRole('button', { name: 'ㄦ' }));
  expect(onTap).toHaveBeenCalledWith('ㄦ');
});

test('clicking the 注音 spacebar does NOT call onTap', async () => {
  const onTap = jest.fn();
  render(<PhoneKeyboard mode="hard" onTap={onTap} disabled={false} />);
  await userEvent.click(screen.getByRole('button', { name: '注音' }));
  expect(onTap).not.toHaveBeenCalled();
});

test('tone keys (ˊ ˇ ˋ ˙) are clickable in hard mode', async () => {
  const onTap = jest.fn();
  render(<PhoneKeyboard mode="hard" onTap={onTap} disabled={false} />);
  await userEvent.click(screen.getByRole('button', { name: 'tone ˇ' }));
  expect(onTap).toHaveBeenCalledWith('ˇ');
});

test('tone keys are disabled in easy mode', async () => {
  const onTap = jest.fn();
  render(<PhoneKeyboard mode="easy" onTap={onTap} disabled={false} />);
  const toneKey = screen.getByRole('button', { name: 'tone ˇ' });
  expect(toneKey).toBeDisabled();
  await userEvent.click(toneKey);
  expect(onTap).not.toHaveBeenCalled();
});

test('disabled prop disables all functional keys (main grid + ㄦ)', async () => {
  const onTap = jest.fn();
  render(<PhoneKeyboard mode="hard" onTap={onTap} disabled={true} />);
  await userEvent.click(screen.getByRole('button', { name: 'ㄇ' }));
  await userEvent.click(screen.getByRole('button', { name: 'ㄦ' }));
  expect(onTap).not.toHaveBeenCalled();
});
