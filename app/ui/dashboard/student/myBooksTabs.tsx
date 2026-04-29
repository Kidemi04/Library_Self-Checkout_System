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
        className="mb-7 flex border-b border-hairline dark:border-dark-hairline"
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
              className={`relative pb-3 pr-5 font-sans text-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                isActive
                  ? 'text-ink dark:text-on-dark'
                  : 'text-muted-soft hover:text-muted dark:text-on-dark-soft dark:hover:text-on-dark/70'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`ml-1.5 rounded-pill px-1.5 py-0.5 font-mono text-code font-bold ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-dark-primary/15 dark:text-dark-primary'
                    : 'bg-surface-cream-strong text-muted dark:bg-dark-surface-strong dark:text-on-dark-soft'
                }`}>
                  {t.count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-5 h-0.5 rounded-t-full bg-primary" />
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
            <div className="col-span-2 rounded-card border border-dashed border-hairline bg-surface-card p-10 text-center dark:border-dark-hairline dark:bg-dark-surface-card">
              <p className="font-display text-display-sm text-ink dark:text-on-dark">No books borrowed</p>
              <p className="mt-1 font-sans text-body-sm text-muted dark:text-on-dark-soft">You don't have any books checked out right now.</p>
              <Link href="/dashboard/book/items" className="mt-4 inline-flex items-center justify-center rounded-btn bg-primary px-5 h-10 font-sans text-button text-on-primary transition hover:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas">
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
          className="overflow-hidden rounded-card border border-hairline bg-surface-card dark:border-dark-hairline dark:bg-dark-surface-card"
        >
          {loanHistory.length === 0 ? (
            <p className="p-10 text-center font-sans text-body-md text-muted dark:text-on-dark-soft">No loan history yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-cream-strong dark:bg-dark-surface-strong">
                  {['Book', 'Borrowed', 'Returned'].map(h => (
                    <th key={h} className="border-b border-hairline-soft px-4 py-3.5 text-left font-sans text-caption-uppercase text-ink dark:border-dark-hairline dark:text-on-dark">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loanHistory.map((loan, i) => (
                  <tr
                    key={loan.id}
                    className={`transition hover:bg-surface-cream-strong/50 dark:hover:bg-dark-surface-strong/50 ${i < loanHistory.length - 1 ? 'border-b border-hairline-soft dark:border-dark-hairline' : ''}`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <BookCover gradient={getBookGradient(loan.id)} w={32} h={46} />
                        <div>
                          <p className="font-sans text-title-md leading-tight text-ink dark:text-on-dark">
                            {loan.book?.title ?? 'Untitled'}
                          </p>
                          <p className="font-sans text-body-sm italic text-muted dark:text-on-dark-soft">
                            {loan.book?.author ?? 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-code text-muted dark:text-on-dark-soft">
                      {formatDate(loan.borrowedAt)}
                    </td>
                    <td className="px-4 py-4 font-mono text-code font-semibold text-success">
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
            <div className="rounded-card border border-dashed border-hairline bg-surface-card p-10 text-center dark:border-dark-hairline dark:bg-dark-surface-card">
              <p className="font-display text-display-sm text-ink dark:text-on-dark">No active reservations</p>
              <p className="mt-1 font-sans text-body-sm text-muted dark:text-on-dark-soft">Browse the catalogue to place a hold on an unavailable book.</p>
              <Link href="/dashboard/book/items" className="mt-4 inline-flex items-center justify-center rounded-btn bg-primary px-5 h-10 font-sans text-button text-on-primary transition hover:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas">
                Browse catalogue
              </Link>
            </div>
          ) : (
            holds.map(hold => {
              const canCancel = cancelHoldAction && (hold.status === 'queued' || hold.status === 'ready');
              return (
                <div
                  key={hold.id}
                  className="overflow-hidden rounded-card border border-hairline bg-surface-card dark:border-dark-hairline dark:bg-dark-surface-card"
                >
                  <div className="p-1">
                    <HoldCard hold={hold} />
                  </div>
                  {canCancel && (
                    <div className="flex justify-end border-t border-hairline-soft px-4 py-3 dark:border-dark-hairline">
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
