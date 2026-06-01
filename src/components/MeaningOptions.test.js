import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../i18n/I18nContext';
import MeaningOptions from './MeaningOptions';

function makeOptions(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: `opt-${i}`,
    meaning: { en: `meaning ${i}`, fr: `sens ${i}` },
  }));
}

function renderOpts(props) {
  return render(
    <I18nProvider>
      <MeaningOptions
        options={makeOptions(10)}
        picked={new Set()}
        correctId="opt-3"
        status="guessing"
        onPick={() => {}}
        disabled={false}
        {...props}
      />
    </I18nProvider>
  );
}

test('renders 10 buttons given 10 options', () => {
  renderOpts({});
  expect(screen.getAllByRole('button')).toHaveLength(10);
});

test('renders each meaning in the current language (en by default)', () => {
  renderOpts({});
  expect(screen.getByText('meaning 0')).toBeInTheDocument();
  expect(screen.getByText('meaning 9')).toBeInTheDocument();
});

test('clicking an option calls onPick with its id', async () => {
  const onPick = jest.fn();
  renderOpts({ onPick });
  await userEvent.click(screen.getByText('meaning 7'));
  expect(onPick).toHaveBeenCalledTimes(1);
  expect(onPick).toHaveBeenCalledWith('opt-7');
});

test('a wrong-and-picked option renders with mo-chip--wrong class and is disabled', () => {
  renderOpts({ picked: new Set(['opt-5']), correctId: 'opt-3' });
  const wrong = screen.getByText('meaning 5').closest('button');
  expect(wrong.className).toMatch(/mo-chip--wrong/);
  expect(wrong).toBeDisabled();
});

test('correctId in picked + status correct renders with mo-chip--correct', () => {
  renderOpts({ picked: new Set(['opt-3']), correctId: 'opt-3', status: 'correct' });
  const correct = screen.getByText('meaning 3').closest('button');
  expect(correct.className).toMatch(/mo-chip--correct/);
});

test('status revealed disables all unpicked buttons but still highlights correct', () => {
  renderOpts({ picked: new Set(['opt-3']), correctId: 'opt-3', status: 'revealed' });
  const correct = screen.getByText('meaning 3').closest('button');
  expect(correct.className).toMatch(/mo-chip--correct/);
  const other = screen.getByText('meaning 0').closest('button');
  expect(other).toBeDisabled();
});

test('disabled prop disables all buttons regardless of pick state', async () => {
  const onPick = jest.fn();
  renderOpts({ disabled: true, onPick });
  for (const btn of screen.getAllByRole('button')) {
    expect(btn).toBeDisabled();
  }
  await userEvent.click(screen.getByText('meaning 0'));
  expect(onPick).not.toHaveBeenCalled();
});

test('clicking an already-picked option does not call onPick (button is disabled)', async () => {
  const onPick = jest.fn();
  renderOpts({ picked: new Set(['opt-2']), onPick });
  await userEvent.click(screen.getByText('meaning 2'));
  expect(onPick).not.toHaveBeenCalled();
});
