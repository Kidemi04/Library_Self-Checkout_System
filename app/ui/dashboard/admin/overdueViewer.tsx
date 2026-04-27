'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import type { OverdueLoan, OverdueBucket } from '@/app/lib/supabase/types';
import ReminderButton from '@/app/ui/dashboard/primitives/ReminderButton';
import UserAvatar from '@/app/ui/dashboard/primitives/UserAvatar';
import BookCover, { getBookGradient } from '@/app/ui/dashboard/primitives/BookCover';
import { sendReminder } from '@/app/dashboard/overdueActions';

type Props = {
  loans: OverdueLoan[];
  initialFilters: { bucket: OverdueBucket; q: string };
};

const BUCKETS: Array<{ value: OverdueBucket; label: string }> = [
  { value: 'all', label: 'All overdue' },
  { value: '1-7', label: '1–7 days' },
  { value: '8-30', label: '8–30 days' },
  { value: '30+', label: '30+ days' },
];

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function OverdueViewer({ loans, initialFilters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [search, setSearch] = useState(initialFilters.q);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // CSV export is handled by the sibling route handler at /dashboard/admin/overdue/export.
  const exportHref = `${pathname}/export?${params.toString()}`;

  const setBucket = (b: OverdueBucket) => {
    const next = new URLSearchParams(params.toString());
    if (b === 'all') next.delete('bucket');
    else next.set('bucket', b);
    router.push(`${pathname}?${next.toString()}`);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (search.trim()) next.set('q', search.trim());
    else next.delete('q');
    router.push(`${pathname}?${next.toString()}`);
  };

  const handleSend = (loanId: string) => {
    setPendingId(loanId);
    setErrorMessage(null);
    setStatusMessage(null);
    startTransition(async () => {
      const res = await sendReminder(loanId);
      setPendingId(null);
      if (!res.ok) setErrorMessage(res.message);
      else setStatusMessage('Reminder sent.');
      router.refresh();
    });
  };

  if (
    loans.length === 0 &&
    !initialFilters.q &&
    initialFilters.bucket === 'all'
  ) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center dark:border-emerald-500/30 dark:bg-emerald-500/5">
        <p className="font-display text-[20px] font-semibold tracking-tight text-emerald-700 dark:text-emerald-300">
          All loans are on time. Nice.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-swin-charcoal dark:text-white">
      {/* Filter row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {BUCKETS.map((b) => (
            <button
              key={b.value}
              type="button"
              onClick={() => setBucket(b.value)}
              className={clsx(
                'rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition',
                initialFilters.bucket === b.value
                  ? 'bg-swin-red text-white'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10',
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search borrower / book / barcode"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
          />
          <a
            href={exportHref}
            download
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/20 dark:bg-transparent dark:text-white"
          >
            Export CSV
          </a>
        </form>
      </div>

      {(statusMessage || errorMessage) && (
        <div
          className={clsx(
            'rounded-lg border px-4 py-3 text-sm',
            errorMessage
              ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500 dark:bg-rose-500/10 dark:text-rose-100'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-400/10 dark:text-emerald-100',
          )}
        >
          {errorMessage ?? statusMessage}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-swin-charcoal/10 bg-white dark:border-white/10 dark:bg-swin-dark-surface">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-swin-dark-bg/60">
              {['Book', 'Borrower', 'Borrowed', 'Due', 'Days overdue', 'Reminder', 'Action'].map(
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
            {loans.map((loan) => (
              <tr
                key={loan.id}
                className="border-t border-swin-charcoal/8 dark:border-white/8"
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    {loan.book?.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={loan.book.coverImageUrl}
                        alt=""
                        className="h-12 w-8 rounded object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <BookCover
                        gradient={getBookGradient(loan.book?.title ?? loan.id)}
                        w={32}
                        h={46}
                        radius={3}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-display text-[14px] font-semibold tracking-tight">
                        {loan.book?.title ?? '—'}
                      </p>
                      <p className="truncate font-display text-[12px] italic text-swin-charcoal/55 dark:text-white/55">
                        {loan.book?.author ?? 'Unknown author'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      name={loan.borrower?.displayName ?? loan.borrower?.email ?? '?'}
                      size="sm"
                      tone="charcoal"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold">
                        {loan.borrower?.displayName ?? loan.borrower?.email ?? '—'}
                      </p>
                      <p className="truncate font-mono text-[11px] text-swin-charcoal/55 dark:text-white/55">
                        {loan.borrower?.studentId ?? loan.borrower?.email ?? ''}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono text-[11px] text-swin-charcoal/60 dark:text-white/60">
                  {new Date(loan.borrowedAt).toLocaleDateString('en-MY')}
                </td>
                <td className="px-4 py-3.5 font-mono text-[11px] text-rose-600 dark:text-rose-400">
                  {new Date(loan.dueAt).toLocaleDateString('en-MY')}
                </td>
                <td className="px-4 py-3.5">
                  <span className="rounded-full bg-rose-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-200">
                    {loan.daysOverdue}d
                  </span>
                </td>
                <td className="px-4 py-3.5 text-[12px] text-swin-charcoal/60 dark:text-white/60">
                  {loan.lastRemindedAt
                    ? `Reminded ${formatRelative(loan.lastRemindedAt)}${
                        loan.lastRemindedByName ? ` by ${loan.lastRemindedByName}` : ''
                      }`
                    : '—'}
                </td>
                <td className="px-4 py-3.5">
                  <ReminderButton
                    lastRemindedAt={loan.lastRemindedAt}
                    pending={pendingId === loan.id}
                    onSend={() => handleSend(loan.id)}
                  />
                </td>
              </tr>
            ))}
            {loans.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                  No overdue loans match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
