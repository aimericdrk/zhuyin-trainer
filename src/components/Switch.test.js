import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Switch from './Switch';

test('renders as role="switch" with aria-checked and aria-label', () => {
  render(<Switch checked label="Show count" onChange={() => {}} />);
  const sw = screen.getByRole('switch', { name: 'Show count' });
  expect(sw).toHaveAttribute('aria-checked', 'true');
});

test('aria-checked reflects the checked prop', () => {
  const { rerender } = render(<Switch checked={false} label="Toggle" onChange={() => {}} />);
  expect(screen.getByRole('switch', { name: 'Toggle' })).toHaveAttribute('aria-checked', 'false');
  rerender(<Switch checked label="Toggle" onChange={() => {}} />);
  expect(screen.getByRole('switch', { name: 'Toggle' })).toHaveAttribute('aria-checked', 'true');
});

test('clicking calls onChange', async () => {
  const onChange = jest.fn();
  render(<Switch checked={false} label="Toggle" onChange={onChange} />);
  await userEvent.click(screen.getByRole('switch', { name: 'Toggle' }));
  expect(onChange).toHaveBeenCalledTimes(1);
});

test('applies sw--on class when checked', () => {
  render(<Switch checked label="On" onChange={() => {}} />);
  expect(screen.getByRole('switch', { name: 'On' }).className).toMatch(/sw--on/);
});

test('does not apply sw--on when not checked', () => {
  render(<Switch checked={false} label="Off" onChange={() => {}} />);
  expect(screen.getByRole('switch', { name: 'Off' }).className).not.toMatch(/sw--on/);
});

test('disabled blocks onChange and adds sw--disabled class', async () => {
  const onChange = jest.fn();
  render(<Switch checked={false} label="X" onChange={onChange} disabled />);
  const sw = screen.getByRole('switch', { name: 'X' });
  expect(sw).toBeDisabled();
  expect(sw.className).toMatch(/sw--disabled/);
  await userEvent.click(sw);
  expect(onChange).not.toHaveBeenCalled();
});
