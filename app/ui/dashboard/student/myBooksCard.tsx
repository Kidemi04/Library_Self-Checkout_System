'use client';

import Link from 'next/link';
import clsx from 'clsx';
import type { Loan } from '@/app/lib/supabase/types';
import BlurFade from '@/app/ui/magicUi/blurFade';
import RenewButton from '@/app/ui/dashboard/renewButton';

const dateFormatter = new Intl.DateTimeFormat('en-MY', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const formatDate = (value: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '—';
  return dateFormatter.format(date);
};

const isOverdue = (loan: Loan) => {
  if (loan.status === 'overdue') return true;
  const due = new Date(loan.dueAt);
  return !Number.isNaN(due.valueOf()) && due.getTime() < Date.now();
};

const getDaysUntilDue = (dueAt: string): number => {
  const due = new Date(dueAt);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

function LoanCard({ loan, index, holdCount }: { loan: Loan; index: number; holdCount?: number }) {
  const overdue = isOverdue(loan);
  const daysUntilDue = getDaysUntilDue(loan.dueAt);
  const dueSoon = !overdue && daysUntilDue <= 3 && daysUntilDue >= 0;

  return (
    <BlurFade delay={0.3 + index * 0.06} yOffset={10}>
      <div
        className={clsx(
          'rounded-card border bg-surface-card p-5 transition-colors duration-200 dark:bg-dark-surface-card',
          overdue
            ? 'border-primary/30 dark:border-dark-primary/40'
            : dueSoon
              ? 'border-warning/40 dark:border-warning/40'
              : 'border-hairline dark:border-dark-hairline',
        )}
      >
        <div className="flex items-start gap-4">
          {/* Book info */}
          <div className="min-w-0 flex-1">
            <p className="truncate font-sans text-title-md text-ink dark:text-on-dark">
              {loan.book?.title ?? 'Untitled'}
            </p>
            <p className="mt-0.5 truncate font-sans text-body-sm text-muted dark:text-on-dark-soft">
              {loan.book?.author ?? 'Unknown author'}
            </p>

            {/* Due date */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={clsx(
                  'inline-flex items-center rounded-pill px-2.5 py-1 font-sans text-caption',
                  overdue
                    ? 'bg-primary text-on-primary dark:bg-dark-primary'
                    : dueSoon
                      ? 'bg-surface-cream-strong text-ink dark:bg-dark-surface-strong dark:text-on-dark'
                      : 'bg-surface-card text-muted dark:bg-dark-surface-strong dark:text-on-dark-soft',
                )}
              >
                {overdue
                  ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? '' : 's'}`
                  : `Due ${formatDate(loan.dueAt)}`}
              </span>
              {loan.renewedCount > 0 && (
                <span className="font-sans text-caption text-muted-soft dark:text-on-dark-soft">
                  Renewed {loan.renewedCount}/2
                </span>
              )}
            </div>
          </div>

          {/* Renew button */}
          <div className="flex-shrink-0">
            <RenewButton loan={loan} holdCount={holdCount ?? 0} />
          </div>
        </div>
      </div>
    </BlurFade>
  );
}

export default function MyBooksCards({
  loans,
  holdCounts,
}: {
  loans: Loan[];
  /** Map of bookId -> number of queued holds */
  holdCounts?: Record<string, number>;
}) {
  if (loans.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-hairline bg-surface-card p-8 text-center dark:border-dark-hairline dark:bg-dark-surface-card">
        <p className="font-sans text-title-md text-ink dark:text-on-dark">
          No books borrowed
        </p>
        <p className="mt-2 font-sans text-body-sm text-muted dark:text-on-dark-soft">
          You don&apos;t have any books checked out right now.
        </p>
        <Link
          href="/dashboard/book/items"
          className="mt-5 inline-flex items-center justify-center rounded-btn bg-primary px-5 py-2 font-sans text-button text-on-primary transition-colors hover:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:bg-dark-primary dark:hover:bg-primary-active dark:focus-visible:ring-offset-dark-canvas"
        >
          Browse catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {loans.map((loan, index) => (
        <LoanCard
          key={loan.id}
          loan={loan}
          index={index}
          holdCount={loan.bookId ? holdCounts?.[loan.bookId] : undefined}
        />
      ))}
    </div>
  );
}
