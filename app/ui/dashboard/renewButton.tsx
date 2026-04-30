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
      <p className="font-sans text-caption font-medium text-success">
        Renewed!
      </p>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="loanId" value={loan.id} />
      <SubmitBtn disabled={disabled} tooltip={tooltip} />
      {state.status === 'error' && (
        <p className="mt-1 font-sans text-caption text-primary">{state.message}</p>
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
        'inline-flex h-9 items-center rounded-btn px-3 font-sans text-caption-uppercase transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas',
        disabled
          ? 'cursor-not-allowed bg-surface-cream-strong text-muted-soft dark:bg-dark-surface-strong dark:text-on-dark-soft'
          : 'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-dark-primary/15 dark:text-dark-primary dark:hover:bg-dark-primary/25',
      )}
    >
      {pending ? 'Renewing…' : 'Renew'}
    </button>
  );
}
