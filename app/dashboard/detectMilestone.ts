import type { MilestonePayload } from '@/app/ui/motion/MilestoneBurst';

export type CirculationAction = 'checkout' | 'checkin' | 'renew' | 'placeHold' | 'damageReport';

export type UserMilestoneCounts = {
  totalLoans: number;
  onTimeReturns: number;
  hasOverdue: boolean;
};

export type DetectInput = {
  action: CirculationAction;
  before: UserMilestoneCounts;
  after:  UserMilestoneCounts;
};

const BOOK_THRESHOLDS = [5, 10, 25, 50] as const;

export function detectMilestone(input: DetectInput): MilestonePayload | null {
  const { action, before, after } = input;

  if (action === 'checkout' && before.totalLoans === 0 && after.totalLoans === 1) {
    return { kind: 'first_borrow', display: 'Your first borrow! Welcome to the library.' };
  }

  if (action === 'checkin' && before.onTimeReturns === 0 && after.onTimeReturns === 1) {
    return { kind: 'first_on_time_return', display: 'First on-time return — well done!' };
  }

  if (action === 'checkout') {
    for (const n of BOOK_THRESHOLDS) {
      if (before.totalLoans < n && after.totalLoans === n) {
        return {
          kind: `books_milestone_${n}` as MilestonePayload['kind'],
          display: `${n} books borrowed!`,
        };
      }
    }
  }

  if (action === 'checkin' && before.hasOverdue && !after.hasOverdue) {
    return { kind: 'all_overdues_cleared', display: 'All overdues cleared!' };
  }

  return null;
}
