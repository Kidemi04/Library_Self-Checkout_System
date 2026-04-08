import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import {
  fetchBorrowingHistory,
  fetchBorrowingStats,
  type TimePeriod,
} from '@/app/lib/supabase/queries';
import DashboardTitleBar from '@/app/ui/dashboard/dashboardTitleBar';
import BorrowingHistoryStats from '@/app/ui/dashboard/borrowingHistoryStats';
import BorrowingHistoryFilter from '@/app/ui/dashboard/borrowingHistoryFilter';
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
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:shadow-black/30">
    <p className="text-base font-semibold text-slate-800 dark:text-slate-100">No borrowing history yet</p>
    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
      Once you borrow and return books, they will appear here.
    </p>
    <Link
      href="/dashboard/book/items"
      className="mt-6 inline-flex items-center justify-center rounded-full bg-swin-charcoal px-4 py-2 text-sm font-semibold text-white shadow hover:bg-swin-charcoal/90 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
    >
      Browse catalogue
    </Link>
  </div>
);

type HistoryCardProps = {
  loan: Awaited<ReturnType<typeof fetchBorrowingHistory>>[number];
};

const HistoryCard = ({ loan }: HistoryCardProps) => (
  <li className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40">
    <div className="flex flex-wrap gap-4">
      <div className="h-20 w-16 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
        {loan.book.coverImageUrl ? (
          <img
            src={loan.book.coverImageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400 dark:text-slate-500">
            No cover
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{loan.book.title}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{loan.book.author ?? 'Unknown author'}</p>
          {loan.book.isbn ? (
            <p className="text-xs text-slate-400 dark:text-slate-500">ISBN {loan.book.isbn}</p>
          ) : null}
        </div>
        <span className="inline-flex h-fit items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-100 dark:border-emerald-700/70">
          Returned
        </span>
      </div>
    </div>

    <dl className="grid gap-4 text-sm sm:grid-cols-3">
      <div>
        <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Borrowed</dt>
        <dd className="font-medium text-slate-800 dark:text-slate-100">{formatDate(loan.borrowedAt)}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Returned</dt>
        <dd className="font-medium text-slate-800 dark:text-slate-100">{formatDate(loan.returnedAt)}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Loan duration</dt>
        <dd className="font-medium text-slate-800 dark:text-slate-100">
          {loan.loanDurationDays} day{loan.loanDurationDays !== 1 ? 's' : ''}
        </dd>
      </div>
    </dl>
  </li>
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
    <main className="space-y-8 text-slate-900 dark:text-slate-100">
      <title>My Borrowing History | Dashboard</title>

      <DashboardTitleBar
        subtitle="Borrowing History"
        title="My borrowing history"
        description="View all books you have previously borrowed. Search by title or author and filter by time period."
      />

      <BorrowingHistoryStats stats={stats} />

      <BorrowingHistoryFilter
        action="/dashboard/book/history"
        defaults={{ q: q ?? '', period }}
      />

      <BlurFade delay={0.3} yOffset={10}>
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Past loans</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {history.length} record{history.length === 1 ? '' : 's'}
            </p>
          </div>

          {history.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="grid gap-6">
              {history.map((loan) => (
                <HistoryCard key={loan.id} loan={loan} />
              ))}
            </ul>
          )}
        </section>
      </BlurFade>
    </main>
  );
}
