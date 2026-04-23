'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Loan } from '@/app/lib/supabase/types';
import type { BorrowingHistoryLoan, PatronHold } from '@/app/lib/supabase/queries';
import LoanCard from '@/app/ui/dashboard/primitives/LoanCard';
import HoldCard from '@/app/ui/dashboard/primitives/HoldCard';
import BookCover, { getBookGradient } from '@/app/ui/dashboard/primitives/BookCover';
import CancelHoldButton from '@/app/ui/dashboard/cancelHoldButton';

const fmt = new Intl.DateTimeFormat('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
const formatDate = (v: string | null) => {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d.valueOf()) ? '—' : fmt.format(d);
};

type Tab = 'current' | 'history' | 'reservations';

type MyBooksTabsProps = {
  activeLoans: Loan[];
  loanHistory: BorrowingHistoryLoan[];
  holds: PatronHold[];
  defaultTab?: Tab;
  holdCounts?: Record<string, number>;
  cancelHoldAction?: (formData: FormData) => Promise<void>;
};

export default function MyBooksTabs({
  activeLoans, loanHistory, holds, defaultTab = 'current', holdCounts, cancelHoldAction,
}: MyBooksTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  const tabDef: { id: Tab; label: string; count: number }[] = [
    { id: 'current',      label: 'Current',      count: activeLoans.length },
    { id: 'history',      label: 'History',       count: loanHistory.length },
    { id: 'reservations', label: 'Reservations',  count: holds.length },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="My books"
        className="mb-7 flex border-b border-swin-charcoal/10 dark:border-white/10"
      >
        {tabDef.map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              id={`my-books-tab-${t.id}`}
              aria-selected={isActive}
              aria-controls={`my-books-panel-${t.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(t.id)}
              onKeyDown={(e) => {
                if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                e.preventDefault();
                const idx = tabDef.findIndex((x) => x.id === activeTab);
                const next = e.key === 'ArrowRight'
                  ? tabDef[(idx + 1) % tabDef.length]
                  : tabDef[(idx - 1 + tabDef.length) % tabDef.length];
                setActiveTab(next.id);
                document.getElementById(`my-books-tab-${next.id}`)?.focus();
              }}
              className={`relative pb-3 pr-5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-swin-red/40 ${
                isActive
                  ? 'text-swin-charcoal dark:text-white'
                  : 'text-swin-charcoal/45 hover:text-swin-charcoal/70 dark:text-white/45 dark:hover:text-white/70'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                  isActive
                    ? 'bg-swin-red/10 text-swin-red'
                    : 'bg-swin-charcoal/8 text-swin-charcoal/50 dark:bg-white/8 dark:text-white/50'
                }`}>
                  {t.count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-5 h-0.5 rounded-t-full bg-swin-red" />
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'current' && (
        <div
          role="tabpanel"
          id="my-books-panel-current"
          aria-labelledby="my-books-tab-current"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
        >
          {activeLoans.length === 0 ? (
            <div className="col-span-2 rounded-xl border border-dashed border-swin-charcoal/15 bg-white p-10 text-center dark:border-white/10 dark:bg-swin-dark-surface">
              <p className="font-display text-[18px] font-semibold text-swin-charcoal dark:text-white">No books borrowed</p>
              <p className="mt-1 text-[13px] text-swin-charcoal/50 dark:text-white/50">You don't have any books checked out right now.</p>
              <Link href="/dashboard/book/items" className="mt-4 inline-flex rounded-full bg-swin-red px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-swin-red/90">
                Browse catalogue
              </Link>
            </div>
          ) : (
            activeLoans.map(loan => (
              <LoanCard key={loan.id} loan={loan} holdCount={loan.bookId ? holdCounts?.[loan.bookId] : 0} />
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div
          role="tabpanel"
          id="my-books-panel-history"
          aria-labelledby="my-books-tab-history"
          className="overflow-hidden rounded-[14px] border border-swin-charcoal/10 bg-white dark:border-white/10 dark:bg-swin-dark-surface"
        >
          {loanHistory.length === 0 ? (
            <p className="p-10 text-center text-[13px] text-swin-charcoal/50 dark:text-white/50">No loan history yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-swin-dark-bg">
                  {['Book', 'Borrowed', 'Returned'].map(h => (
                    <th key={h} className="border-b border-swin-charcoal/8 px-4 py-3.5 text-left font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/40 dark:border-white/8 dark:text-white/40">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loanHistory.map((loan, i) => (
                  <tr
                    key={loan.id}
                    className={`transition hover:bg-slate-50 dark:hover:bg-white/5 ${i < loanHistory.length - 1 ? 'border-b border-swin-charcoal/8 dark:border-white/8' : ''}`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <BookCover gradient={getBookGradient(loan.id)} w={32} h={46} />
                        <div>
                          <p className="font-display text-[15px] font-semibold leading-tight tracking-tight text-swin-charcoal dark:text-white">
                            {loan.book?.title ?? 'Untitled'}
                          </p>
                          <p className="font-display text-[11px] italic text-swin-charcoal/55 dark:text-white/55">
                            {loan.book?.author ?? 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-[12px] text-swin-charcoal/55 dark:text-white/55">
                      {formatDate(loan.borrowedAt)}
                    </td>
                    <td className="px-4 py-4 font-mono text-[12px] font-semibold text-green-600 dark:text-green-400">
                      {formatDate(loan.returnedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'reservations' && (
        <div
          role="tabpanel"
          id="my-books-panel-reservations"
          aria-labelledby="my-books-tab-reservations"
          className="flex flex-col gap-3"
        >
          {holds.length === 0 ? (
            <div className="rounded-xl border border-dashed border-swin-charcoal/15 bg-white p-10 text-center dark:border-white/10 dark:bg-swin-dark-surface">
              <p className="font-display text-[18px] font-semibold text-swin-charcoal dark:text-white">No active reservations</p>
              <p className="mt-1 text-[13px] text-swin-charcoal/50 dark:text-white/50">Browse the catalogue to place a hold on an unavailable book.</p>
              <Link href="/dashboard/book/items" className="mt-4 inline-flex rounded-full bg-swin-red px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-swin-red/90">
                Browse catalogue
              </Link>
            </div>
          ) : (
            holds.map(hold => {
              const canCancel = cancelHoldAction && (hold.status === 'queued' || hold.status === 'ready');
              return (
                <div
                  key={hold.id}
                  className="overflow-hidden rounded-2xl border border-swin-charcoal/10 bg-white dark:border-white/10 dark:bg-swin-dark-surface"
                >
                  <div className="p-1">
                    <HoldCard hold={hold} />
                  </div>
                  {canCancel && (
                    <div className="flex justify-end border-t border-swin-charcoal/8 px-4 py-3 dark:border-white/8">
                      <CancelHoldButton
                        holdId={hold.id}
                        bookTitle={hold.title}
                        cancelAction={cancelHoldAction!}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
