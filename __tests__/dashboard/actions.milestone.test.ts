import { detectMilestone } from '@/app/dashboard/detectMilestone';

describe('actions milestone contract', () => {
  test('detectMilestone result extends ActionState shape', () => {
    const m = detectMilestone({
      action: 'checkout',
      before: { totalLoans: 0, onTimeReturns: 0, hasOverdue: false },
      after:  { totalLoans: 1, onTimeReturns: 0, hasOverdue: false },
    });
    expect(m).toMatchObject({ kind: expect.any(String), display: expect.any(String) });
  });
});
