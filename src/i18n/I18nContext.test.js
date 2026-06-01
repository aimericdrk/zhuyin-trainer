import { render, screen, act } from '@testing-library/react';
import { I18nProvider, useI18n } from './I18nContext';

function Probe() {
  const { lang, t, toggleLang } = useI18n();
  return (
    <div>
      <p data-testid="lang">{lang}</p>
      <p data-testid="title">{t('home.title')}</p>
      <button onClick={toggleLang}>toggle</button>
    </div>
  );
}

test('default lang is en, toggling switches to fr', () => {
  localStorage.clear();
  render(
    <I18nProvider>
      <Probe />
    </I18nProvider>
  );
  expect(screen.getByTestId('lang').textContent).toBe('en');
  expect(screen.getByTestId('title').textContent).toBe('Zhuyin Trainer');

  act(() => { screen.getByText('toggle').click(); });

  expect(screen.getByTestId('lang').textContent).toBe('fr');
  expect(screen.getByTestId('title').textContent).toBe('Entraîneur de Zhuyin');
});

test('missing key falls back to English', () => {
  localStorage.clear();
  function MissingProbe() {
    const { t, toggleLang } = useI18n();
    return (
      <>
        <p data-testid="val">{t('home.title')}</p>
        <button onClick={toggleLang}>x</button>
      </>
    );
  }
  render(<I18nProvider><MissingProbe /></I18nProvider>);
  expect(screen.getByTestId('val').textContent).toBe('Zhuyin Trainer');
});

test('t interpolates {word} placeholders from params', () => {
  localStorage.clear();
  function Probe2() {
    const { t } = useI18n();
    return <p data-testid="v">{t('trainer.playWord', { word: '媽媽' })}</p>;
  }
  render(<I18nProvider><Probe2 /></I18nProvider>);
  expect(screen.getByTestId('v').textContent).toBe('Play 媽媽');
});
