import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../i18n/I18nContext';
import ActionBar from './ActionBar';

function renderBar(props) {
  return render(
    <I18nProvider>
      <ActionBar
        onSkip={() => {}}
        onBackspace={() => {}}
        onSolution={() => {}}
        shuffleKeys={false}
        onToggleShuffle={() => {}}
        disabled={false}
        {...props}
      />
    </I18nProvider>
  );
}

test('renders a shuffle toggle button', () => {
  renderBar({});
  expect(screen.getByRole('button', { name: 'Shuffle keys' })).toBeInTheDocument();
});

test('toggle has aria-pressed reflecting the shuffleKeys prop', () => {
  const { rerender } = renderBar({ shuffleKeys: false });
  expect(screen.getByRole('button', { name: 'Shuffle keys' })).toHaveAttribute('aria-pressed', 'false');
  rerender(
    <I18nProvider>
      <ActionBar
        onSkip={() => {}}
        onBackspace={() => {}}
        onSolution={() => {}}
        shuffleKeys
        onToggleShuffle={() => {}}
      />
    </I18nProvider>
  );
  expect(screen.getByRole('button', { name: 'Shuffle keys' })).toHaveAttribute('aria-pressed', 'true');
});

test('clicking the toggle calls onToggleShuffle', async () => {
  const onToggleShuffle = jest.fn();
  renderBar({ onToggleShuffle });
  await userEvent.click(screen.getByRole('button', { name: 'Shuffle keys' }));
  expect(onToggleShuffle).toHaveBeenCalledTimes(1);
});

test('renders a native-input toggle button when onToggleNativeInput is provided', () => {
  renderBar({ onToggleNativeInput: () => {}, nativeInput: false });
  expect(screen.getByRole('button', { name: 'Use phone keyboard' })).toBeInTheDocument();
});

test('native-input toggle has aria-pressed reflecting the nativeInput prop', () => {
  const { rerender } = renderBar({ onToggleNativeInput: () => {}, nativeInput: false });
  expect(screen.getByRole('button', { name: 'Use phone keyboard' })).toHaveAttribute('aria-pressed', 'false');
  rerender(
    <I18nProvider>
      <ActionBar
        onSkip={() => {}}
        onBackspace={() => {}}
        onSolution={() => {}}
        onToggleNativeInput={() => {}}
        nativeInput
      />
    </I18nProvider>
  );
  expect(screen.getByRole('button', { name: 'Use phone keyboard' })).toHaveAttribute('aria-pressed', 'true');
});

test('clicking the native-input toggle calls onToggleNativeInput', async () => {
  const onToggleNativeInput = jest.fn();
  renderBar({ onToggleNativeInput });
  await userEvent.click(screen.getByRole('button', { name: 'Use phone keyboard' }));
  expect(onToggleNativeInput).toHaveBeenCalledTimes(1);
});

test('renders a phone-layout toggle button when onTogglePhoneLayout is provided', () => {
  renderBar({ onTogglePhoneLayout: () => {}, phoneLayout: false });
  expect(screen.getByRole('button', { name: 'Phone keyboard layout' })).toBeInTheDocument();
});

test('phone-layout toggle has aria-pressed reflecting the phoneLayout prop', () => {
  const { rerender } = renderBar({ onTogglePhoneLayout: () => {}, phoneLayout: false });
  expect(screen.getByRole('button', { name: 'Phone keyboard layout' })).toHaveAttribute('aria-pressed', 'false');
  rerender(
    <I18nProvider>
      <ActionBar
        onSkip={() => {}}
        onBackspace={() => {}}
        onSolution={() => {}}
        onTogglePhoneLayout={() => {}}
        phoneLayout
      />
    </I18nProvider>
  );
  expect(screen.getByRole('button', { name: 'Phone keyboard layout' })).toHaveAttribute('aria-pressed', 'true');
});

test('clicking the phone-layout toggle calls onTogglePhoneLayout', async () => {
  const onTogglePhoneLayout = jest.fn();
  renderBar({ onTogglePhoneLayout });
  await userEvent.click(screen.getByRole('button', { name: 'Phone keyboard layout' }));
  expect(onTogglePhoneLayout).toHaveBeenCalledTimes(1);
});
