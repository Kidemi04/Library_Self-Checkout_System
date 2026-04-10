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
          'rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 dark:bg-slate-900/80',
          overdue
            ? 'border-swin-red/30 shadow-swin-red/10 dark:border-red-500/30 dark:shadow-red-500/10'
            : dueSoon
              ? 'border-amber-300/50 shadow-amber-300/10 dark:border-amber-500/30 dark:shadow-amber-500/10'
              : 'border-swin-charcoal/10 dark:border-slate-700/60',
        )}
      >
        <div className="flex items-start gap-4">
          {/* Book info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-swin-charcoal dark:text-white">
              {loan.book?.title ?? 'Untitled'}
            </p>
            <p className="mt-0.5 truncate text-xs text-swin-charcoal/60 dark:text-slate-400">
              {loan.book?.author ?? 'Unknown author'}
            </p>

            {/* Due date */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={clsx(
                  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                  overdue
                    ? 'bg-swin-red/10 text-swin-red dark:bg-red-500/20 dark:text-red-200'
                    : dueSoon
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                )}
              >
                {overdue
                  ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? '' : 's'}`
                  : `Due ${formatDate(loan.dueAt)}`}
              </span>
              {loan.renewedCount > 0 && (
                <span className="text-xs text-swin-charcoal/50 dark:text-slate-500">
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
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
        <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
          No books borrowed
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          You don't have any books checked out right now.
        </p>
        <Link
          href="/dashboard/book/items"
          className="mt-5 inline-flex items-center justify-center rounded-full bg-swin-red px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-swin-red/30 transition hover:bg-swin-red/90 dark:bg-rose-600 dark:hover:bg-rose-500"
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
