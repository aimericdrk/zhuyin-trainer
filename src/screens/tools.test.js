import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../theme/ThemeContext';
import { I18nProvider } from '../i18n/I18nContext';
import BopomofoChart from './BopomofoChart';
import MemoryMatch from './MemoryMatch';
import Flashcards from './Flashcards';
import ReadingScreen from './ReadingScreen';
import WritingScreen from './WritingScreen';
import ChatScreen from './ChatScreen';
import ReviewScreen from './ReviewScreen';
import PatternsScreen from './PatternsScreen';

function wrap(ui) {
  return render(<ThemeProvider><I18nProvider>{ui}</I18nProvider></ThemeProvider>);
}

describe('BopomofoChart', () => {
  test('renders all 37 symbols plus 5 tone cells', () => {
    const { container } = wrap(<BopomofoChart onBack={() => {}} />);
    expect(container.querySelectorAll('.bp-cell')).toHaveLength(42);
  });
});

describe('MemoryMatch', () => {
  test('renders a 12-tile grid and deck selectors', () => {
    const { container } = wrap(<MemoryMatch onBack={() => {}} />);
    expect(container.querySelectorAll('.mm-tile')).toHaveLength(12);
    expect(container.querySelectorAll('.mm-deck').length).toBeGreaterThanOrEqual(2);
  });

  test('flipping a card reveals its face', async () => {
    const { container } = wrap(<MemoryMatch onBack={() => {}} />);
    const back = container.querySelector('.mm-tile--back');
    await userEvent.click(back);
    expect(container.querySelectorAll('.mm-tile--face').length).toBeGreaterThanOrEqual(1);
  });
});

describe('Flashcards', () => {
  test('shows a character then flips to the meaning', async () => {
    const { container } = wrap(<Flashcards onBack={() => {}} />);
    expect(container.querySelector('.fc-zh')).toBeInTheDocument();
    await userEvent.click(container.querySelector('.fc-card'));
    expect(container.querySelector('.fc-meaning')).toBeInTheDocument();
  });
});

describe('ReadingScreen', () => {
  test('renders a sentence and tapping a word opens its detail', async () => {
    const { container } = wrap(<ReadingScreen onBack={() => {}} />);
    const words = container.querySelectorAll('.rd-word');
    expect(words.length).toBeGreaterThanOrEqual(2);
    await userEvent.click(words[0]);
    expect(container.querySelector('.rd-detail--open')).toBeInTheDocument();
  });

  test('show translation reveals a per-word breakdown (readings by default)', async () => {
    try { localStorage.removeItem('zhuyin.annot'); } catch { /* ignore */ }
    const { container } = wrap(<ReadingScreen onBack={() => {}} />);
    const toggle = container.querySelector('.rd-controls .rd-btn:not(.rd-btn--next)');
    await userEvent.click(toggle);
    const rows = container.querySelectorAll('.rd-breakdown .rd-bd-row');
    expect(rows.length).toBeGreaterThanOrEqual(2);
    // default annotation is pinyin + zhuyin, meaning off
    expect(container.querySelector('.rd-bd-py')).toBeInTheDocument();
    expect(container.querySelector('.rd-bd-zhuyin')).toBeInTheDocument();
    expect(container.querySelector('.rd-bd-meaning')).toBeNull();
  });
});

describe('WritingScreen', () => {
  test('renders the stroke-order animator and its controls', () => {
    const { container } = wrap(<WritingScreen onBack={() => {}} />);
    expect(container.querySelector('.hw-panel')).toBeInTheDocument();
    expect(container.querySelector('.hw-target')).toBeInTheDocument();
    expect(container.querySelectorAll('.hw-btn').length).toBe(3); // animate / practice / reset
  });

  test('has a category menu of at least four groups', () => {
    const { container } = wrap(<WritingScreen onBack={() => {}} />);
    expect(container.querySelectorAll('.wr-cat').length).toBeGreaterThanOrEqual(4);
  });

  test('selecting a category switches the current character', async () => {
    const { container } = wrap(<WritingScreen onBack={() => {}} />);
    const before = container.querySelector('.wr-char').textContent;
    const cats = container.querySelectorAll('.wr-cat');
    await userEvent.click(cats[cats.length - 1]); // last category
    const after = container.querySelector('.wr-char').textContent;
    expect(after).not.toBe(before);
  });
});

describe('ChatScreen', () => {
  test('opens with a partner bubble and reply options; picking adds a user bubble', async () => {
    const { container } = wrap(<ChatScreen onBack={() => {}} />);
    expect(container.querySelector('.ch-bubble--partner')).toBeInTheDocument();
    const reply = container.querySelector('.ch-reply');
    expect(reply).toBeInTheDocument();
    await userEvent.click(reply);
    expect(container.querySelector('.ch-bubble--user')).toBeInTheDocument();
  });

  test('respects annotation settings — zhuyin + pinyin shown, English hidden by default', () => {
    const { container } = wrap(<ChatScreen onBack={() => {}} />);
    expect(container.querySelector('.ch-zhuyin')).toBeInTheDocument();
    expect(container.querySelector('.ch-py')).toBeInTheDocument();
    expect(container.querySelector('.ch-mn')).toBeNull();
  });

  test('a wrong reply is marked and does not advance', async () => {
    const { container } = wrap(<ChatScreen onBack={() => {}} />);
    const drink = [...container.querySelectorAll('.ch-scenario')]
      .find((b) => /drink|boisson/i.test(b.textContent));
    await userEvent.click(drink);
    const before = container.querySelectorAll('.ch-bubble--user').length;
    const replies = container.querySelectorAll('.ch-reply');
    await userEvent.click(replies[replies.length - 1]); // the bad option (hamburger)
    expect(container.querySelector('.ch-reply--wrong')).toBeInTheDocument();
    expect(container.querySelectorAll('.ch-bubble--user').length).toBe(before);
  });
});

describe('ReviewScreen', () => {
  test('shows a card, flips it, and grading advances', async () => {
    const { container } = wrap(<ReviewScreen onBack={() => {}} />);
    expect(container.querySelector('.rv-zh')).toBeInTheDocument();
    await userEvent.click(container.querySelector('.rv-card'));
    expect(container.querySelector('.rv-meaning')).toBeInTheDocument();
    await userEvent.click(container.querySelector('.rv-btn--got'));
    // back to an unflipped card (or summary if session was length 1 — pool is large)
    expect(container.querySelector('.rv-zh')).toBeInTheDocument();
  });
});

describe('PatternsScreen', () => {
  test('renders a sentence with a blank and connective options', () => {
    const { container } = wrap(<PatternsScreen onBack={() => {}} />);
    expect(container.querySelector('.pt-slot')).toBeInTheDocument();
    expect(container.querySelectorAll('.pt-opt').length).toBeGreaterThanOrEqual(2);
    // each character shows its reading underneath by default (pinyin + zhuyin on)
    expect(container.querySelector('.pt-ruby-py')).toBeInTheDocument();
    expect(container.querySelector('.pt-ruby-zh')).toBeInTheDocument();
    // the blank does not reveal the answer's reading before solving
    const slot = container.querySelector('.pt-slot');
    expect(slot.querySelector('.pt-ruby-py')).toBeNull();
    expect(slot.querySelector('.pt-ruby-zh')).toBeNull();
  });

  test('picking every option eventually solves and reveals the answer reading', async () => {
    const { container } = wrap(<PatternsScreen onBack={() => {}} />);
    const opts = [...container.querySelectorAll('.pt-opt')];
    for (const o of opts) { await userEvent.click(o); } // one of them is correct
    expect(container.querySelector('.pt-opt--ok')).toBeInTheDocument();
    // solved: the answer is now shown as ruby (slot gone) with its reading
    expect(container.querySelector('.pt-slot')).toBeNull();
    expect(container.querySelector('.pt-ruby--ok')).toBeInTheDocument();
  });
});
