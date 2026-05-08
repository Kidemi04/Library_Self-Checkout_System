import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { StampReveal } from '@/app/ui/motion/StampReveal';

describe('StampReveal', () => {
  test.each([
    ['borrowed', 'BORROWED', /text-primary/, /border-primary/, false],
    ['returned', 'RETURNED', /text-success/, /border-success/, false],
    ['renewed',  'RENEWED',  /text-accent-amber/, /border-accent-amber/, false],
    ['reserved', 'RESERVED', /text-accent-teal/,  /border-accent-teal/,  false],
    ['reported', 'REPORTED', /text-error/, /border-error/, true],
  ] as const)('kind=%s renders %s with correct classes (hollow=%s)', (kind, label, textRe, borderRe, hollow) => {
    const { container } = render(<StampReveal kind={kind as any} />);
    expect(container.textContent).toMatch(label);
    const stamp = container.querySelector('[data-testid="stamp"]') as HTMLElement;
    expect(stamp.className).toMatch(textRe);
    expect(stamp.className).toMatch(borderRe);
    if (hollow) expect(stamp.className).toMatch(/bg-transparent|bg-canvas/);
  });

  test('is aria-hidden by default (decorative)', () => {
    const { container } = render(<StampReveal kind="borrowed" />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
