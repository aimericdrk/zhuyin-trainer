import { render } from '@testing-library/react';
import Clock from './Clock';

test('renders a digital readout and an svg face', () => {
  const { container } = render(<Clock hour24={14} minute={5} />);
  expect(container.querySelector('.clk-face')).toBeInTheDocument();
  expect(container.textContent).toContain('14:05');
});

test('pads single-digit values', () => {
  const { container } = render(<Clock hour24={3} minute={0} />);
  expect(container.textContent).toContain('03:00');
});
