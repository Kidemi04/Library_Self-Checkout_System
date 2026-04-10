'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import clsx from 'clsx';
import { renewLoanAction } from '@/app/dashboard/actions';
import { initialActionState } from '@/app/dashboard/actionState';
import type { Loan } from '@/app/lib/supabase/types';

type RenewButtonProps = {
  loan: Loan;
  /** Number of queued holds on this book — if > 0, renewal is blocked */
  holdCount: number;
};

const isOverdue = (loan: Loan) => {
  if (loan.status === 'overdue') return true;
  const due = new Date(loan.dueAt);
  return !Number.isNaN(due.valueOf()) && due.getTime() < Date.now();
};

export default function RenewButton({ loan, holdCount }: RenewButtonProps) {
  const [state, formAction] = useActionState(renewLoanAction, initialActionState);

  const overdue = isOverdue(loan);
  const maxRenewals = loan.renewedCount >= 2;
  const hasHold = holdCount > 0;
  const disabled = overdue || maxRenewals || hasHold;

  const tooltip = overdue
    ? 'Cannot renew an overdue loan'
    : maxRenewals
      ? 'Maximum renewals reached (2/2)'
      : hasHold
        ? 'Cannot renew — another student has a hold on this book'
        : undefined;

  if (state.status === 'success') {
    return (
      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
        Renewed!
      </p>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="loanId" value={loan.id} />
      <SubmitBtn disabled={disabled} tooltip={tooltip} />
      {state.status === 'error' && (
        <p className="mt-1 text-xs text-swin-red">{state.message}</p>
      )}
    </form>
  );
}

function SubmitBtn({ disabled, tooltip }: { disabled: boolean; tooltip?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      title={tooltip}
      className={clsx(
        'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
        disabled
          ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
          : 'bg-swin-red/10 text-swin-red hover:bg-swin-red/20 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25',
      )}
    >
      {pending ? 'Renewing…' : 'Renew'}
    </button>
  );
}
