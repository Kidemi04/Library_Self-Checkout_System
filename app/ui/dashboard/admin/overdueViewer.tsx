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
      <div className="rounded-card border border-success/30 bg-success/5 p-10 text-center">
        <p className="font-display text-display-sm tracking-tight text-success">
          All loans are on time. Nice.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-ink dark:text-on-dark">
      {/* Filter row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {BUCKETS.map((b) => (
            <button
              key={b.value}
              type="button"
              onClick={() => setBucket(b.value)}
              className={clsx(
                'rounded-pill px-3 py-1.5 font-sans text-caption-uppercase font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas',
                initialFilters.bucket === b.value
                  ? 'bg-primary text-on-primary'
                  : 'border border-hairline dark:border-dark-hairline bg-surface-card dark:bg-dark-surface-card text-body dark:text-on-dark/80 hover:bg-surface-cream-strong dark:hover:bg-dark-surface-strong hover:text-ink dark:hover:text-on-dark',
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
            className="w-72 rounded-btn border border-hairline dark:border-dark-hairline bg-canvas dark:bg-dark-surface-soft px-3.5 h-10 font-sans text-body-md text-ink dark:text-on-dark placeholder:text-muted-soft dark:placeholder:text-on-dark-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
          />
          <a
            href={exportHref}
            download
            className="rounded-btn border border-hairline dark:border-dark-hairline bg-surface-card dark:bg-dark-surface-card px-3 h-10 inline-flex items-center font-sans text-button text-ink dark:text-on-dark hover:bg-surface-cream-strong dark:hover:bg-dark-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
          >
            Export CSV
          </a>
        </form>
      </div>

      {(statusMessage || errorMessage) && (
        <div
          className={clsx(
            'rounded-btn border px-4 py-3 font-sans text-body-sm',
            errorMessage
              ? 'border-primary/30 bg-primary/10 text-primary dark:border-dark-primary/30 dark:bg-dark-primary/15 dark:text-dark-primary'
              : 'border-success/30 bg-success/10 text-success',
          )}
        >
          {errorMessage ?? statusMessage}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-card border border-hairline dark:border-dark-hairline bg-surface-card dark:bg-dark-surface-card">
        <table className="min-w-full">
          <thead>
            <tr className="bg-surface-cream-strong dark:bg-dark-surface-strong">
              {['Book', 'Borrower', 'Borrowed', 'Due', 'Days overdue', 'Reminder', 'Action'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-sans text-caption-uppercase text-ink dark:text-on-dark"
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
                className="border-t border-hairline-soft dark:border-dark-hairline hover:bg-surface-cream-strong/50 dark:hover:bg-dark-surface-strong/40"
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
                      <p className="truncate font-display text-title-md font-semibold tracking-tight text-ink dark:text-on-dark">
                        {loan.book?.title ?? '—'}
                      </p>
                      <p className="truncate font-display text-body-sm italic text-muted-soft dark:text-on-dark-soft">
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
                      <p className="truncate font-sans text-body-sm font-semibold text-ink dark:text-on-dark">
                        {loan.borrower?.displayName ?? loan.borrower?.email ?? '—'}
                      </p>
                      <p className="truncate font-mono text-code text-muted-soft dark:text-on-dark-soft">
                        {loan.borrower?.studentId ?? loan.borrower?.email ?? ''}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono text-code text-muted dark:text-on-dark-soft">
                  {new Date(loan.borrowedAt).toLocaleDateString('en-MY')}
                </td>
                <td className="px-4 py-3.5 font-mono text-code text-primary dark:text-dark-primary">
                  {new Date(loan.dueAt).toLocaleDateString('en-MY')}
                </td>
                <td className="px-4 py-3.5">
                  <span className="rounded-pill bg-primary/15 px-2.5 py-1 font-mono text-code font-semibold text-primary dark:bg-dark-primary/20 dark:text-dark-primary">
                    {loan.daysOverdue}d
                  </span>
                </td>
                <td className="px-4 py-3.5 font-sans text-body-sm text-muted dark:text-on-dark-soft">
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
                <td className="px-4 py-8 text-center font-sans text-body-sm text-muted dark:text-on-dark-soft" colSpan={7}>
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
