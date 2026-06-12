import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../theme/ThemeContext';
import { AnnotationProvider } from '../theme/AnnotationContext';
import { SpeechProvider } from '../theme/SpeechContext';
import { I18nProvider } from '../i18n/I18nContext';
import TopBar from './TopBar';

function renderBar() {
  return render(
    <ThemeProvider>
      <AnnotationProvider>
        <SpeechProvider>
          <I18nProvider>
            <TopBar title="Test" />
          </I18nProvider>
        </SpeechProvider>
      </AnnotationProvider>
    </ThemeProvider>
  );
}

beforeEach(() => { try { localStorage.clear(); } catch { /* ignore */ } });

test('renders three reading-aid pills, three size pills and an auto-play toggle', () => {
  const { container } = renderBar();
  // 3 annotation pills + 3 size pills (zhuyin/pinyin/char) + 1 emoji (autoplay) pill
  expect(container.querySelectorAll('.tb-pill').length).toBe(7);
});

test('a size pill exists for zhuyin, pinyin and characters', () => {
  const { getByLabelText } = renderBar();
  expect(getByLabelText('Zhuyin size')).toBeInTheDocument();
  expect(getByLabelText('Pinyin size')).toBeInTheDocument();
  expect(getByLabelText('Character size')).toBeInTheDocument();
});

test('the character-size pill scales --char-scale on the root on click', async () => {
  const { getByLabelText } = renderBar();
  expect(document.documentElement.style.getPropertyValue('--char-scale')).toBe('1');
  await userEvent.click(getByLabelText('Character size'));
  // S (1) → M (1.3)
  expect(document.documentElement.style.getPropertyValue('--char-scale')).toBe('1.3');
});

test('annotation pills reflect the default (pinyin + zhuyin on, meaning off)', () => {
  const { getByLabelText } = renderBar();
  expect(getByLabelText('Show pinyin').getAttribute('aria-pressed')).toBe('true');
  expect(getByLabelText('Show zhuyin').getAttribute('aria-pressed')).toBe('true');
  expect(getByLabelText('Show meaning').getAttribute('aria-pressed')).toBe('false');
});

test('toggling the meaning pill flips its state', async () => {
  const { getByLabelText } = renderBar();
  const pill = getByLabelText('Show meaning');
  expect(pill.getAttribute('aria-pressed')).toBe('false');
  await userEvent.click(pill);
  expect(pill.getAttribute('aria-pressed')).toBe('true');
});

test('auto-play toggle starts on and flips off', async () => {
  const { getByLabelText } = renderBar();
  const pill = getByLabelText('Auto-play audio');
  expect(pill.getAttribute('aria-pressed')).toBe('true');
  await userEvent.click(pill);
  expect(pill.getAttribute('aria-pressed')).toBe('false');
});
