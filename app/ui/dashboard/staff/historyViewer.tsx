'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import type {
  HistoryPage,
  HistoryStatusFilter,
  HistoryRange,
} from '@/app/lib/supabase/types';
import BookCover, { getBookGradient } from '@/app/ui/dashboard/primitives/BookCover';
import Chip from '@/app/ui/dashboard/primitives/Chip';

type Props = {
  result: HistoryPage;
  initialFilters: {
    status: HistoryStatusFilter;
    range: HistoryRange;
    rangeStart?: string;
    rangeEnd?: string;
    borrowerQ?: string;
    bookQ?: string;
    handlerQ?: string;
    page: number;
  };
};

const STATUS_LABEL: Record<string, string> = {
  borrowed: 'Active',
  returned: 'Returned',
  overdue: 'Overdue',
};

// Chip tone enum is 'default' | 'danger' | 'gold' | 'success' | 'warn'.
// 'borrowed' (Active) → 'gold' for in-progress emphasis.
const STATUS_TONE: Record<string, 'gold' | 'success' | 'danger'> = {
  borrowed: 'gold',
  returned: 'success',
  overdue: 'danger',
};

export default function HistoryViewer({ result, initialFilters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [borrowerQ, setBorrowerQ] = useState(initialFilters.borrowerQ ?? '');
  const [bookQ, setBookQ] = useState(initialFilters.bookQ ?? '');
  const [handlerQ, setHandlerQ] = useState(initialFilters.handlerQ ?? '');

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== '') next.set(key, value);
    else next.delete(key);
    next.delete('page');
    router.push(`${pathname}?${next.toString()}`);
  };

  const goToPage = (n: number) => {
    const next = new URLSearchParams(params.toString());
    next.set('page', String(n));
    router.push(`${pathname}?${next.toString()}`);
  };

  // CSV export is handled by the sibling route handler at /dashboard/staff/history/export.
  const exportHref = `${pathname}/export?${params.toString()}`;

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  const STATUSES: Array<[HistoryStatusFilter, string]> = [
    ['all', 'All'],
    ['borrowed', 'Active'],
    ['returned', 'Returned'],
    ['overdue', 'Overdue'],
  ];
  const RANGES: Array<[HistoryRange, string]> = [
    ['30d', '30 days'],
    ['6m', '6 months'],
    ['semester', 'Semester'],
    ['all', 'All time'],
  ];

  return (
    <div className="space-y-6 text-swin-charcoal dark:text-white">
      {/* Filters */}
      <div className="space-y-3 rounded-2xl border border-swin-charcoal/10 bg-white p-4 dark:border-white/10 dark:bg-swin-dark-surface">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setParam('status', v === 'all' ? null : v)}
              className={clsx(
                'rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide',
                initialFilters.status === v
                  ? 'bg-swin-charcoal text-white'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {RANGES.map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setParam('range', v === '30d' ? null : v)}
              className={clsx(
                'rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide',
                initialFilters.range === v
                  ? 'bg-swin-charcoal text-white'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          <input
            value={borrowerQ}
            onChange={(e) => setBorrowerQ(e.target.value)}
            onBlur={() => setParam('borrower', borrowerQ)}
            placeholder="Borrower (name / student ID)"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950"
          />
          <input
            value={bookQ}
            onChange={(e) => setBookQ(e.target.value)}
            onBlur={() => setParam('book', bookQ)}
            placeholder="Book (title / author / barcode)"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950"
          />
          <input
            value={handlerQ}
            onChange={(e) => setHandlerQ(e.target.value)}
            onBlur={() => setParam('handler', handlerQ)}
            placeholder="Handler (staff name)"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] text-swin-charcoal/55 dark:text-white/55">
          Showing {result.rows.length} of {result.total} loans · {result.active} active ·{' '}
          {result.returned} returned · {result.overdue} overdue
        </p>
        <a
          href={exportHref}
          download
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/20 dark:bg-transparent dark:text-white"
        >
          Export CSV
        </a>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-swin-charcoal/10 bg-white dark:border-white/10 dark:bg-swin-dark-surface">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-swin-dark-bg/60">
              {['Book', 'Borrower', 'Borrowed', 'Due', 'Returned', 'Duration', 'Status', 'Handler'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[1.8px] text-swin-charcoal/45 dark:text-white/45"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {result.rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No loans match these filters.
                </td>
              </tr>
            ) : (
              result.rows.map((r) => (
                <tr key={r.id} className="border-t border-swin-charcoal/8 dark:border-white/8">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {r.book?.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.book.coverImageUrl}
                          alt=""
                          className="h-12 w-8 rounded object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <BookCover
                          gradient={getBookGradient(r.book?.title ?? r.id)}
                          w={32}
                          h={46}
                          radius={3}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-display text-[14px] font-semibold">
                          {r.book?.title ?? '—'}
                        </p>
                        <p className="truncate font-display text-[12px] italic text-swin-charcoal/55 dark:text-white/55">
                          {r.book?.author ?? '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[13px]">
                    {r.borrower?.displayName ?? '—'}
                    <br />
                    <span className="font-mono text-[11px] text-swin-charcoal/55">
                      {r.borrower?.studentId ?? ''}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px]">
                    {new Date(r.borrowedAt).toLocaleDateString('en-MY')}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px]">
                    {new Date(r.dueAt).toLocaleDateString('en-MY')}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px]">
                    {r.returnedAt ? new Date(r.returnedAt).toLocaleDateString('en-MY') : '—'}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px]">{r.durationDays}d</td>
                  <td className="px-4 py-3.5">
                    <Chip mono tone={STATUS_TONE[r.status]}>
                      {STATUS_LABEL[r.status]}
                    </Chip>
                  </td>
                  <td className="px-4 py-3.5 text-[12px]">
                    {r.handler?.isSelfCheckout
                      ? 'Self-checkout'
                      : r.handler?.displayName ?? '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {result.total > result.pageSize && (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => goToPage(Math.max(1, initialFilters.page - 1))}
            disabled={initialFilters.page === 1}
            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold uppercase disabled:opacity-50 dark:border-white/20 dark:text-white"
          >
            Previous
          </button>
          <span className="text-xs">
            Page {initialFilters.page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => goToPage(Math.min(totalPages, initialFilters.page + 1))}
            disabled={initialFilters.page >= totalPages}
            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold uppercase disabled:opacity-50 dark:border-white/20 dark:text-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
