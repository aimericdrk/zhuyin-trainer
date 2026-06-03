import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../theme/ThemeContext';
import { I18nProvider } from '../i18n/I18nContext';
import GamesScreen from './GamesScreen';
import { GAMES } from '../data/games';

function renderScreen(props) {
  return render(
    <ThemeProvider>
      <I18nProvider>
        <GamesScreen onBack={() => {}} onSelect={() => {}} {...props} />
      </I18nProvider>
    </ThemeProvider>
  );
}

test('shows a card for every registered game', () => {
  const { container } = renderScreen();
  expect(container.querySelectorAll('.gs-card')).toHaveLength(GAMES.length);
});

test('selecting a card reports the game id', async () => {
  const onSelect = jest.fn();
  const { container } = renderScreen({ onSelect });
  await userEvent.click(container.querySelectorAll('.gs-card')[0]);
  expect(onSelect).toHaveBeenCalledWith(GAMES[0].id);
});
