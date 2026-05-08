import '@testing-library/jest-dom';
import { detectMilestone } from '@/app/dashboard/detectMilestone';

describe('detectMilestone', () => {
  test('first_borrow when total loans count goes from 0 to 1', () => {
    const m = detectMilestone({
      action: 'checkout',
      before: { totalLoans: 0, onTimeReturns: 0, hasOverdue: false },
      after:  { totalLoans: 1, onTimeReturns: 0, hasOverdue: false },
    });
    expect(m?.kind).toBe('first_borrow');
  });

  test('does not fire first_borrow on second loan', () => {
    const m = detectMilestone({
      action: 'checkout',
      before: { totalLoans: 1, onTimeReturns: 0, hasOverdue: false },
      after:  { totalLoans: 2, onTimeReturns: 0, hasOverdue: false },
    });
    expect(m?.kind).not.toBe('first_borrow');
  });

  test('first_on_time_return when onTimeReturns goes 0 to 1', () => {
    const m = detectMilestone({
      action: 'checkin',
      before: { totalLoans: 1, onTimeReturns: 0, hasOverdue: false },
      after:  { totalLoans: 1, onTimeReturns: 1, hasOverdue: false },
    });
    expect(m?.kind).toBe('first_on_time_return');
  });

  test.each([5, 10, 25, 50] as const)('books_milestone_%i when crossing threshold', (n) => {
    const m = detectMilestone({
      action: 'checkout',
      before: { totalLoans: n - 1, onTimeReturns: 0, hasOverdue: false },
      after:  { totalLoans: n,     onTimeReturns: 0, hasOverdue: false },
    });
    expect(m?.kind).toBe(`books_milestone_${n}`);
  });

  test('does not fire books_milestone if not exactly crossing', () => {
    const m = detectMilestone({
      action: 'checkout',
      before: { totalLoans: 5, onTimeReturns: 0, hasOverdue: false },
      after:  { totalLoans: 6, onTimeReturns: 0, hasOverdue: false },
    });
    expect(m).toBeNull();
  });

  test('all_overdues_cleared when hasOverdue goes true to false on checkin', () => {
    const m = detectMilestone({
      action: 'checkin',
      before: { totalLoans: 3, onTimeReturns: 1, hasOverdue: true },
      after:  { totalLoans: 3, onTimeReturns: 1, hasOverdue: false },
    });
    expect(m?.kind).toBe('all_overdues_cleared');
  });

  test('returns null when no threshold crossed', () => {
    const m = detectMilestone({
      action: 'checkout',
      before: { totalLoans: 7, onTimeReturns: 3, hasOverdue: false },
      after:  { totalLoans: 8, onTimeReturns: 3, hasOverdue: false },
    });
    expect(m).toBeNull();
  });

  test('first_borrow takes precedence over books_milestone_5', () => {
    const m = detectMilestone({
      action: 'checkout',
      before: { totalLoans: 0, onTimeReturns: 0, hasOverdue: false },
      after:  { totalLoans: 1, onTimeReturns: 0, hasOverdue: false },
    });
    expect(m?.kind).toBe('first_borrow');
  });
});
