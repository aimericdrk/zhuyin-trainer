import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../theme/ThemeContext';
import { I18nProvider } from '../i18n/I18nContext';
import HomeScreen from './HomeScreen';

function renderHome(onNavigate = () => {}) {
  return render(
    <ThemeProvider>
      <I18nProvider>
        <HomeScreen onNavigate={onNavigate} />
      </I18nProvider>
    </ThemeProvider>
  );
}

test('shows four sections of destinations', () => {
  const { container } = renderHome();
  expect(container.querySelectorAll('.hs-section')).toHaveLength(4);
  // foundations(3) + study(3) + practice(4) + play(1)
  expect(container.querySelectorAll('.hs-card')).toHaveLength(11);
});

test('navigates to the chosen view', async () => {
  const onNavigate = jest.fn();
  const { container } = renderHome(onNavigate);
  await userEvent.click(container.querySelectorAll('.hs-card')[0]);
  expect(onNavigate).toHaveBeenCalledWith('bopomofo');
});
