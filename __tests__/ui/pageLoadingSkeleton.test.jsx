import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageLoadingSkeleton from '@/app/ui/pageLoadingSkeleton';

describe('PageLoadingSkeleton', () => {
  test('renders main container', () => {
    const { container } = render(<PageLoadingSkeleton />);

    expect(container.firstChild).toBeInTheDocument();
  });

  test('renders title skeleton blocks', () => {
    render(<PageLoadingSkeleton />);

    // top bar has 2 skeleton lines (title + button)
    const skeletons = document.querySelectorAll('div.bg-slate-200, div.bg-slate-100, div.bg-slate-800');

    expect(skeletons.length).toBeGreaterThan(0);
  });

  test('renders 4 skeleton cards', () => {
    render(<PageLoadingSkeleton />);

    // cards are repeated SkeletonCard (4 times)
    const cards = document.querySelectorAll('.rounded-2xl');

    expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  test('renders multiple skeleton rows', () => {
    render(<PageLoadingSkeleton />);

    // row container includes multiple skeleton lines
    const rows = document.querySelectorAll('.border-b');

    expect(rows.length).toBeGreaterThanOrEqual(5);
  });

  test('applies shimmer animation class', () => {
    const { container } = render(<PageLoadingSkeleton />);

    const shimmerElements = container.querySelectorAll('div');

    const hasShimmer = Array.from(shimmerElements).some((el) =>
      el.className.includes('animate-[') ||
      el.className.includes('before:animate')
    );

    expect(hasShimmer).toBe(true);
  });
});