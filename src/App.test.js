import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders the home dashboard with sections', () => {
  const { container } = render(<App />);
  expect(container.querySelector('.hs-tagline')).toHaveTextContent('Zhuyin Trainer');
  expect(container.querySelectorAll('.hs-section')).toHaveLength(4);
  expect(container.querySelectorAll(".hs-card")).toHaveLength(11);
});

test('navigates Home → Zhuyin Chart → back', async () => {
  const { container } = render(<App />);
  await userEvent.click(container.querySelectorAll('.hs-card')[0]); // foundations: bopomofo
  expect(container.querySelector('.bp-cell')).toBeInTheDocument();
  await userEvent.click(container.querySelector('.tb-back'));
  expect(container.querySelectorAll('.hs-card').length).toBe(11);
});

test('navigates Home → Games hub → into a game', async () => {
  const { container } = render(<App />);
  const cards = container.querySelectorAll('.hs-card');
  await userEvent.click(cards[cards.length - 1]); // play: games
  expect(container.querySelectorAll('.gs-card').length).toBeGreaterThan(10);
  await userEvent.click(container.querySelector('.gs-card')); // first game (time)
  expect(container.querySelector('.gm-wrap')).toBeInTheDocument();
});
