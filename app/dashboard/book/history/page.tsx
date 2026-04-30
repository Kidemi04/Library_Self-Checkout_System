import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import {
  fetchBorrowingHistory,
  fetchBorrowingStats,
  type TimePeriod,
} from '@/app/lib/supabase/queries';
import AdminShell from '@/app/ui/dashboard/adminShell';
import BorrowingHistoryStats from '@/app/ui/dashboard/borrowingHistoryStats';
import BorrowingHistoryFilter from '@/app/ui/dashboard/borrowingHistoryFilter';
import BookCover, { getBookGradient } from '@/app/ui/dashboard/primitives/BookCover';
import Chip from '@/app/ui/dashboard/primitives/Chip';
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

const validPeriods: TimePeriod[] = ['all', '30d', '6m', 'semester'];

const parsePeriod = (value: unknown): TimePeriod => {
  if (typeof value === 'string' && validPeriods.includes(value as TimePeriod)) {
    return value as TimePeriod;
  }
  return 'all';
};

const EmptyState = () => (
  <div className="rounded-2xl border border-dashed border-swin-charcoal/15 bg-white p-10 text-center dark:border-white/10 dark:bg-swin-dark-surface">
    <p className="font-display text-[20px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
      No borrowing history yet
    </p>
    <p className="mt-2 text-[13px] text-swin-charcoal/55 dark:text-white/55">
      Once you borrow and return books, they will appear here.
    </p>
    <Link
      href="/dashboard/book/items"
      className="mt-5 inline-flex rounded-full bg-swin-red px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-swin-red/90"
    >
      Browse catalogue
    </Link>
  </div>
);

type HistoryRowProps = {
  loan: Awaited<ReturnType<typeof fetchBorrowingHistory>>[number];
};

const HistoryRow = ({ loan }: HistoryRowProps) => (
  <tr className="border-t border-swin-charcoal/8 dark:border-white/8">
    <td className="px-4 py-3.5">
      <div className="flex items-center gap-3">
        {loan.book.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={loan.book.coverImageUrl}
            alt=""
            className="h-12 w-8 flex-shrink-0 rounded object-cover ring-1 ring-swin-charcoal/10 dark:ring-white/10"
            loading="lazy"
          />
        ) : (
          <BookCover gradient={getBookGradient(loan.book.title ?? loan.id)} w={32} h={46} radius={3} />
        )}
        <div className="min-w-0">
          <p className="truncate font-display text-[14px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
            {loan.book.title}
          </p>
          <p className="truncate font-display text-[12px] italic text-swin-charcoal/55 dark:text-white/55">
            {loan.book.author ?? 'Unknown author'}
          </p>
        </div>
      </div>
    </td>
    <td className="px-4 py-3.5 font-mono text-[11px] text-swin-charcoal/60 dark:text-white/60">
      {formatDate(loan.borrowedAt)}
    </td>
    <td className="px-4 py-3.5 font-mono text-[11px] text-green-600 dark:text-green-400">
      {formatDate(loan.returnedAt)}
    </td>
    <td className="px-4 py-3.5 font-mono text-[11px] text-swin-charcoal/60 dark:text-white/60">
      {loan.loanDurationDays}d
    </td>
    <td className="px-4 py-3.5">
      <Chip tone="success" mono>Returned</Chip>
    </td>
  </tr>
);

export default async function BorrowingHistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await getDashboardSession();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'user') {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : undefined;
  const period = parsePeriod(params.period);

  const [history, stats] = await Promise.all([
    fetchBorrowingHistory(user.id, q, period),
    fetchBorrowingStats(user.id),
  ]);

  return (
    <>
      <title>My Borrowing History | Dashboard</title>

      <AdminShell
        titleSubtitle="Borrowing History"
        title="My borrowing history"
        description="View all books you have previously borrowed. Search by title or author and filter by time period."
      >
        <div className="space-y-6">
          <BorrowingHistoryStats stats={stats} />

          <BorrowingHistoryFilter
            action="/dashboard/book/history"
            defaults={{ q: q ?? '', period }}
          />

          <BlurFade delay={0.3} yOffset={10}>
            <section className="space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-[22px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
                  Past loans
                </h2>
                <p className="font-mono text-[11px] text-swin-charcoal/45 dark:text-white/45">
                  {history.length} record{history.length === 1 ? '' : 's'}
                </p>
              </div>

              {history.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="overflow-hidden rounded-2xl border border-swin-charcoal/10 bg-white dark:border-white/10 dark:bg-swin-dark-surface">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-swin-dark-bg/60">
                          {['Book', 'Borrowed', 'Returned', 'Duration', 'Status'].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[1.8px] text-swin-charcoal/45 dark:text-white/45"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((loan) => (
                          <HistoryRow key={loan.id} loan={loan} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </BlurFade>
        </div>
      </AdminShell>
    </>
  );
}
