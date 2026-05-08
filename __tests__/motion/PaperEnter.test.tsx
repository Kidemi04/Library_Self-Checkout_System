import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { PaperEnter } from '@/app/ui/motion/PaperEnter';

describe('PaperEnter', () => {
  test('renders children', () => {
    render(<PaperEnter><span>hello</span></PaperEnter>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  test('wraps with motion.div (data attribute)', () => {
    const { container } = render(<PaperEnter><div /></PaperEnter>);
    expect(container.querySelector('[data-motion="paper-enter"]')).toBeInTheDocument();
  });
});
