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
  <div className="rounded-card border border-dashed border-hairline bg-surface-card p-10 text-center dark:border-dark-hairline dark:bg-dark-surface-card">
    <p className="font-display text-display-sm text-ink dark:text-on-dark">
      No borrowing history yet
    </p>
    <p className="mt-2 font-sans text-body-sm text-muted dark:text-on-dark-soft">
      Once you borrow and return books, they will appear here.
    </p>
    <Link
      href="/dashboard/book/items"
      className="mt-5 inline-flex items-center justify-center rounded-btn bg-primary px-5 h-10 font-sans text-button text-on-primary transition hover:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
    >
      Browse catalogue
    </Link>
  </div>
);

type HistoryRowProps = {
  loan: Awaited<ReturnType<typeof fetchBorrowingHistory>>[number];
};

const HistoryRow = ({ loan }: HistoryRowProps) => (
  <tr className="border-t border-hairline-soft dark:border-dark-hairline">
    <td className="px-4 py-3.5">
      <div className="flex items-center gap-3">
        {loan.book.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={loan.book.coverImageUrl}
            alt=""
            className="h-12 w-8 flex-shrink-0 rounded object-cover ring-1 ring-hairline dark:ring-dark-hairline"
            loading="lazy"
          />
        ) : (
          <BookCover gradient={getBookGradient(loan.book.title ?? loan.id)} w={32} h={46} radius={3} />
        )}
        <div className="min-w-0">
          <p className="truncate font-sans text-title-md text-ink dark:text-on-dark">
            {loan.book.title}
          </p>
          <p className="truncate font-sans text-body-sm italic text-muted dark:text-on-dark-soft">
            {loan.book.author ?? 'Unknown author'}
          </p>
        </div>
      </div>
    </td>
    <td className="px-4 py-3.5 font-mono text-code text-muted dark:text-on-dark-soft">
      {formatDate(loan.borrowedAt)}
    </td>
    <td className="px-4 py-3.5 font-mono text-code text-success">
      {formatDate(loan.returnedAt)}
    </td>
    <td className="px-4 py-3.5 font-mono text-code text-muted dark:text-on-dark-soft">
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
                <h2 className="font-display text-display-md text-ink dark:text-on-dark">
                  Past loans
                </h2>
                <p className="font-mono text-code text-muted-soft dark:text-on-dark-soft">
                  {history.length} record{history.length === 1 ? '' : 's'}
                </p>
              </div>

              {history.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="overflow-hidden rounded-card border border-hairline bg-surface-card dark:border-dark-hairline dark:bg-dark-surface-card">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-surface-cream-strong dark:bg-dark-surface-strong">
                          {['Book', 'Borrowed', 'Returned', 'Duration', 'Status'].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left font-sans text-caption-uppercase text-ink dark:text-on-dark"
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
