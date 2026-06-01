import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../i18n/I18nContext';
import SentenceArranger from './SentenceArranger';

const W = (i, char, en) => ({ id: `w-${i}`, char, en, fr: `fr-${en}` });

function renderArr(props) {
  return render(
    <I18nProvider>
      <SentenceArranger
        available={[W(0, '我', 'I'), W(1, '媽媽', 'mother'), W(2, '喜歡', 'like')]}
        placed={[]}
        status="arranging"
        onPlace={() => {}}
        onRemove={() => {}}
        {...props}
      />
    </I18nProvider>
  );
}

test('renders the available cards with char and gloss', () => {
  const { container } = renderArr({});
  const available = container.querySelector('.sa-available');
  expect(available).toBeInTheDocument();
  const cards = available.querySelectorAll('.sa-card');
  expect(cards).toHaveLength(3);
  expect(available.textContent).toMatch(/我/);
  expect(available.textContent).toMatch(/I/);
  expect(available.textContent).toMatch(/媽媽/);
  expect(available.textContent).toMatch(/mother/);
});

test('renders placed cards in the placed row', () => {
  const { container } = renderArr({
    available: [W(2, '喜歡', 'like')],
    placed: [W(0, '我', 'I'), W(1, '媽媽', 'mother')],
  });
  const placed = container.querySelector('.sa-placed');
  expect(placed).toBeInTheDocument();
  const placedCards = placed.querySelectorAll('.sa-card');
  expect(placedCards).toHaveLength(2);
  expect(placed.textContent).toMatch(/我/);
  expect(placed.textContent).toMatch(/媽媽/);
});

test('tapping an available card calls onPlace with the wordId', async () => {
  const onPlace = jest.fn();
  renderArr({ onPlace });
  await userEvent.click(screen.getByText('媽媽').closest('button'));
  expect(onPlace).toHaveBeenCalledTimes(1);
  expect(onPlace).toHaveBeenCalledWith('w-1');
});

test('tapping a placed card calls onRemove with the wordId', async () => {
  const onRemove = jest.fn();
  renderArr({
    available: [W(2, '喜歡', 'like')],
    placed: [W(0, '我', 'I')],
    onRemove,
  });
  await userEvent.click(screen.getByText('我').closest('button'));
  expect(onRemove).toHaveBeenCalledTimes(1);
  expect(onRemove).toHaveBeenCalledWith('w-0');
});

test('placed row gets status modifier class', () => {
  const { container, rerender } = renderArr({ status: 'arranging' });
  expect(container.querySelector('.sa-placed').className).toMatch(/sa-placed--arranging/);
  rerender(
    <I18nProvider>
      <SentenceArranger
        available={[]}
        placed={[W(0, '我', 'I')]}
        status="wrong"
        onPlace={() => {}}
        onRemove={() => {}}
      />
    </I18nProvider>
  );
  expect(container.querySelector('.sa-placed').className).toMatch(/sa-placed--wrong/);
  rerender(
    <I18nProvider>
      <SentenceArranger
        available={[]}
        placed={[W(0, '我', 'I')]}
        status="correct"
        onPlace={() => {}}
        onRemove={() => {}}
      />
    </I18nProvider>
  );
  expect(container.querySelector('.sa-placed').className).toMatch(/sa-placed--correct/);
});

test('cards are disabled when status is correct', async () => {
  const onPlace = jest.fn();
  const onRemove = jest.fn();
  renderArr({
    available: [W(0, '我', 'I')],
    placed: [W(1, '媽媽', 'mother')],
    status: 'correct',
    onPlace,
    onRemove,
  });
  const availCard = screen.getByText('我').closest('button');
  const placedCard = screen.getByText('媽媽').closest('button');
  expect(availCard).toBeDisabled();
  expect(placedCard).toBeDisabled();
  await userEvent.click(availCard);
  await userEvent.click(placedCard);
  expect(onPlace).not.toHaveBeenCalled();
  expect(onRemove).not.toHaveBeenCalled();
});

test('cards are disabled when status is revealed', () => {
  renderArr({
    available: [],
    placed: [W(0, '我', 'I')],
    status: 'revealed',
  });
  expect(screen.getByText('我').closest('button')).toBeDisabled();
});
