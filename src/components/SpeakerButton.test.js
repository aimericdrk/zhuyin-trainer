import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SpeakerButton from './SpeakerButton';

test('calls onPlay when clicked', async () => {
  const onPlay = jest.fn();
  render(<SpeakerButton label="Play" onPlay={onPlay} playing={false} />);
  await userEvent.click(screen.getByRole('button', { name: 'Play' }));
  expect(onPlay).toHaveBeenCalledTimes(1);
});

test('renders disabled and does not call onPlay when disabled', async () => {
  const onPlay = jest.fn();
  render(<SpeakerButton label="Play" onPlay={onPlay} playing={false} disabled />);
  const btn = screen.getByRole('button', { name: 'Play' });
  expect(btn).toBeDisabled();
  await userEvent.click(btn);
  expect(onPlay).not.toHaveBeenCalled();
});

test('applies sb--playing class when playing', () => {
  render(<SpeakerButton label="Play" onPlay={() => {}} playing />);
  const btn = screen.getByRole('button', { name: 'Play' });
  expect(btn.className).toMatch(/sb--playing/);
});
