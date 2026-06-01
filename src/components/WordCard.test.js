import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../i18n/I18nContext';
import WordCard from './WordCard';

function renderCard(props) {
  return render(
    <I18nProvider>
      <WordCard
        character="媽媽"
        pinyin="mā ma"
        zhuyin="ㄇㄚ ㄇㄚ˙"
        speak={() => {}}
        speakingId={null}
        audioSupported={true}
        {...props}
      />
    </I18nProvider>
  );
}

test('renders the character, pinyin, and zhuyin strings', () => {
  renderCard({});
  expect(screen.getByText('媽媽')).toBeInTheDocument();
  expect(screen.getByText('mā ma')).toBeInTheDocument();
  expect(screen.getByText('ㄇㄚ ㄇㄚ˙')).toBeInTheDocument();
});

test('renders a speaker button when speak is provided and audioSupported', () => {
  renderCard({});
  expect(screen.getByRole('button', { name: 'Play character' })).toBeInTheDocument();
});

test('clicking the speaker button calls speak with the character', async () => {
  const speak = jest.fn();
  renderCard({ speak });
  await userEvent.click(screen.getByRole('button', { name: 'Play character' }));
  expect(speak).toHaveBeenCalledTimes(1);
  expect(speak).toHaveBeenCalledWith('媽媽', { id: 'wc-headline' });
});

test('speaker button is disabled when audioSupported is false', () => {
  renderCard({ audioSupported: false });
  expect(screen.getByRole('button', { name: 'Play character' })).toBeDisabled();
});

test('speaker button does not render when speak is not provided', () => {
  renderCard({ speak: undefined });
  expect(screen.queryByRole('button', { name: 'Play character' })).not.toBeInTheDocument();
});

test('speakingId === "wc-headline" applies the playing class', () => {
  renderCard({ speakingId: 'wc-headline' });
  const btn = screen.getByRole('button', { name: 'Play character' });
  expect(btn.className).toMatch(/sb--playing/);
});
