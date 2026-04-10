'use client';

import { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import type { Loan } from '@/app/lib/supabase/types';
import type { BorrowingHistoryLoan, PatronHold } from '@/app/lib/supabase/queries';
import MyBooksCards from './myBooksCard';
import BlurFade from '@/app/ui/magicUi/blurFade';

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

type Tab = 'current' | 'history' | 'reservations';

const tabs: { id: Tab; label: string }[] = [
  { id: 'current', label: 'Current Loans' },
  { id: 'history', label: 'History' },
  { id: 'reservations', label: 'Reservations' },
];

type MyBooksTabsProps = {
  activeLoans: Loan[];
  loanHistory: BorrowingHistoryLoan[];
  holds: PatronHold[];
  defaultTab?: Tab;
  /** Map of bookId -> number of queued holds (for renewal validation) */
  holdCounts?: Record<string, number>;
};

export default function MyBooksTabs({
  activeLoans,
  loanHistory,
  holds,
  defaultTab = 'current',
  holdCounts,
}: MyBooksTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/60">
        {tabs.map((tab) => {
          const count =
            tab.id === 'current'
              ? activeLoans.length
              : tab.id === 'history'
                ? loanHistory.length
                : holds.length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-white text-swin-charcoal shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
              )}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={clsx(
                    'ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                    activeTab === tab.id
                      ? 'bg-swin-red/10 text-swin-red dark:bg-rose-500/20 dark:text-rose-300'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'current' && (
        <BlurFade delay={0.1} yOffset={8}>
          <MyBooksCards loans={activeLoans} holdCounts={holdCounts} />
        </BlurFade>
      )}

      {activeTab === 'history' && (
        <BlurFade delay={0.1} yOffset={8}>
          <HistoryList loans={loanHistory} />
        </BlurFade>
      )}

      {activeTab === 'reservations' && (
        <BlurFade delay={0.1} yOffset={8}>
          <ReservationsList holds={holds} />
        </BlurFade>
      )}
    </div>
  );
}

function HistoryList({ loans }: { loans: BorrowingHistoryLoan[] }) {
  if (loans.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
          No loan history
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Your returned books will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-swin-charcoal/10 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-swin-charcoal/10 dark:divide-slate-800">
          <thead className="bg-swin-ivory dark:bg-slate-900">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-swin-charcoal/70 dark:text-slate-200/80">
              <th className="px-6 py-3">Book</th>
              <th className="px-6 py-3">Borrowed</th>
              <th className="px-6 py-3">Returned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-swin-charcoal/10 bg-white text-sm dark:divide-slate-800 dark:bg-slate-900 dark:text-slate-200">
            {loans.map((loan) => (
              <tr key={loan.id} className="transition hover:bg-swin-ivory dark:hover:bg-slate-800/80">
                <td className="px-6 py-4">
                  <div className="font-medium text-swin-charcoal dark:text-slate-100">
                    {loan.book?.title ?? 'Untitled'}
                  </div>
                  <p className="text-xs text-swin-charcoal/60 dark:text-slate-400">
                    {loan.book?.author ?? 'Unknown author'}
                  </p>
                </td>
                <td className="px-6 py-4 text-swin-charcoal/70 dark:text-slate-400">
                  {formatDate(loan.borrowedAt)}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    {formatDate(loan.returnedAt)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReservationsList({ holds }: { holds: PatronHold[] }) {
  if (holds.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
          No active reservations
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Browse the catalogue to place a hold on a book that is currently unavailable.
        </p>
        <Link
          href="/dashboard/book/items"
          className="mt-5 inline-flex items-center justify-center rounded-full bg-swin-red px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-swin-red/30 transition hover:bg-swin-red/90"
        >
          Browse catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {holds.map((hold) => {
        const isReady = hold.status === 'ready';
        return (
          <div
            key={hold.id}
            className={clsx(
              'rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-900/80',
              isReady
                ? 'border-emerald-300/50 dark:border-emerald-500/30'
                : 'border-swin-charcoal/10 dark:border-slate-700/60',
            )}
          >
            <div className="flex items-start gap-3">
              {hold.coverImage ? (
                <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                  <img src={hold.coverImage} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-swin-charcoal dark:text-white">
                  {hold.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-swin-charcoal/60 dark:text-slate-400">
                  {hold.author ?? 'Unknown author'}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={clsx(
                      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                      isReady
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                        : 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200',
                    )}
                  >
                    {isReady ? 'Ready for pickup' : 'Waiting in queue'}
                  </span>
                  <span className="text-xs text-swin-charcoal/50 dark:text-slate-500">
                    Placed {formatDate(hold.placedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
