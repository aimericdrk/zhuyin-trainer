import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../theme/ThemeContext';
import { I18nProvider } from '../i18n/I18nContext';
import GameScreen from './GameScreen';

function renderGame(gameId) {
  return render(
    <ThemeProvider>
      <I18nProvider>
        <GameScreen gameId={gameId} onBack={() => {}} />
      </I18nProvider>
    </ThemeProvider>
  );
}

describe('builder game (time)', () => {
  test('renders a clock and a tray of tiles', () => {
    const { container } = renderGame('time');
    expect(container.querySelector('.clk-face')).toBeInTheDocument();
    const tiles = container.querySelectorAll('.sa-available .sa-card');
    expect(tiles.length).toBeGreaterThanOrEqual(2);
  });

  test('tapping a tray tile moves it into the answer row', async () => {
    const { container } = renderGame('time');
    const before = container.querySelectorAll('.sa-available .sa-card').length;
    await userEvent.click(container.querySelector('.sa-available .sa-card'));
    const placed = container.querySelectorAll('.sa-placed .sa-card');
    expect(placed.length).toBe(1);
    expect(container.querySelectorAll('.sa-available .sa-card').length).toBe(before - 1);
  });
});

describe('quiz game (colors)', () => {
  test('renders option chips and a colour swatch', () => {
    const { container } = renderGame('colors');
    expect(container.querySelector('.gm-swatch')).toBeInTheDocument();
    expect(container.querySelectorAll('.gm-chip').length).toBeGreaterThanOrEqual(2);
  });
});

describe('tones game', () => {
  test('renders four tone options', () => {
    const { container } = renderGame('tones');
    expect(container.querySelectorAll('.gm-chip')).toHaveLength(4);
  });
});

describe('dictation game (audio builder)', () => {
  test('shows a listen prompt and a tray of word tiles', () => {
    const { container } = renderGame('dictation');
    expect(container.querySelector('.gm-prompt-q')).toBeInTheDocument();
    expect(container.querySelectorAll('.sa-available .sa-card').length).toBeGreaterThanOrEqual(2);
  });
});

test('unknown game id renders a fallback', () => {
  const { container } = renderGame('does-not-exist');
  expect(container.querySelector('.gm-empty')).toBeInTheDocument();
});
