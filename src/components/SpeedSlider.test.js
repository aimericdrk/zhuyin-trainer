import { render, screen, fireEvent } from '@testing-library/react';
import SpeedSlider from './SpeedSlider';

test('renders a range input with default min/max/step and the passed value', () => {
  render(<SpeedSlider value={1} onChange={() => {}} label="Speech rate" />);
  const slider = screen.getByRole('slider', { name: 'Speech rate' });
  expect(slider).toHaveAttribute('type', 'range');
  expect(slider).toHaveAttribute('min', '0.5');
  expect(slider).toHaveAttribute('max', '1.5');
  expect(slider).toHaveAttribute('step', '0.05');
  expect(slider).toHaveValue('1');
});

test('renders the value chip formatted with two decimals and ×', () => {
  const { rerender } = render(<SpeedSlider value={1} onChange={() => {}} label="X" />);
  expect(screen.getByText('1.00×')).toBeInTheDocument();
  rerender(<SpeedSlider value={0.75} onChange={() => {}} label="X" />);
  expect(screen.getByText('0.75×')).toBeInTheDocument();
});

test('changing the slider fires onChange with the parsed numeric value', () => {
  const onChange = jest.fn();
  render(<SpeedSlider value={1} onChange={onChange} label="X" />);
  const slider = screen.getByRole('slider', { name: 'X' });
  fireEvent.change(slider, { target: { value: '0.75' } });
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(0.75);
});

test('custom min/max/step props override the defaults', () => {
  render(<SpeedSlider value={1} onChange={() => {}} label="X" min={0.25} max={2} step={0.25} />);
  const slider = screen.getByRole('slider', { name: 'X' });
  expect(slider).toHaveAttribute('min', '0.25');
  expect(slider).toHaveAttribute('max', '2');
  expect(slider).toHaveAttribute('step', '0.25');
});
