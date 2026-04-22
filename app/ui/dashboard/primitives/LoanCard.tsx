'use client';

import type { Loan } from '@/app/lib/supabase/types';
import BookCover, { getBookGradient } from './BookCover';
import Chip from './Chip';
import RenewButton from '@/app/ui/dashboard/renewButton';

function getDaysUntilDue(dueAt: string): number {
  const due = new Date(dueAt);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

type LoanCardProps = {
  loan: Loan;
  holdCount?: number;
};

export default function LoanCard({ loan, holdCount = 0 }: LoanCardProps) {
  const dueIn = getDaysUntilDue(loan.dueAt);
  const overdue = loan.status === 'overdue' || dueIn < 0;
  const urgent = !overdue && dueIn <= 3;

  const title = loan.book?.title ?? 'Untitled';
  const author = loan.book?.author ?? 'Unknown author';
  const callNumber = loan.book?.isbn ?? loan.copy?.barcode ?? '';
  const gradient = getBookGradient(loan.bookId ?? loan.id);

  const dueTone = overdue ? 'danger' : urgent ? 'warn' : 'default';
  const dueLabel = overdue
    ? `Overdue ${Math.abs(dueIn)}d`
    : dueIn === 0
    ? 'Due today'
    : `${dueIn}d left`;

  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-swin-charcoal/10 bg-white p-3.5 transition-all dark:border-white/10 dark:bg-swin-dark-surface">
      <BookCover gradient={gradient} w={48} h={68} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[17px] font-semibold leading-tight tracking-tight text-swin-charcoal dark:text-white">
          {title}
        </p>
        <p className="mt-0.5 truncate font-display text-[12px] italic text-swin-charcoal/60 dark:text-slate-400">
          {author}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Chip tone={dueTone} mono>{dueLabel}</Chip>
          {callNumber && (
            <span className="font-mono text-[10px] tracking-wide text-swin-charcoal/40 dark:text-slate-500">
              {callNumber}
            </span>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
        <RenewButton loan={loan} holdCount={holdCount} />
      </div>
    </div>
  );
}
