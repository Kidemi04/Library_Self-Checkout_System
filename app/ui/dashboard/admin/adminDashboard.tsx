import AdminShell from '@/app/ui/dashboard/adminShell';
import BookCover, { getBookGradient } from '@/app/ui/dashboard/primitives/BookCover';
import BarChartMini from '@/app/ui/dashboard/primitives/BarChartMini';
import type { DashboardSummary } from '@/app/lib/supabase/types';
import type { Loan } from '@/app/lib/supabase/types';
import type { TopBorrowedBook } from '@/app/lib/supabase/queries';
import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

type ActivityType = 'borrowed' | 'returned' | 'held' | 'overdue';

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  borrowed: '#C9A961',
  returned: '#2F8F5A',
  held:     '#4A6FA5',
  overdue:  '#C82333',
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  borrowed: 'borrowed',
  returned: 'returned',
  held:     'placed hold on',
  overdue:  'is overdue on',
};

type AdminDashboardProps = {
  userName: string | null;
  summary: DashboardSummary;
  recentLoans: Loan[];
  chartData: number[];
  topBooks: TopBorrowedBook[];
};

export default function AdminDashboard({
  userName,
  summary,
  recentLoans,
  chartData,
  topBooks,
}: AdminDashboardProps) {
  const firstName = userName?.split(' ')[0] ?? 'Administrator';
  const h = new Date().getHours();
  const tod = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

  const kpis = [
    { label: 'Total books',      value: summary.totalBooks.toLocaleString() },
    { label: 'Active loans',     value: summary.activeLoans.toLocaleString() },
    { label: 'Overdue',          value: summary.overdueLoans.toLocaleString(), danger: summary.overdueLoans > 0 },
    { label: 'Available copies', value: summary.availableBooks.toLocaleString() },
  ];

  // Compute real trend: last 7 days vs previous 7 days from the chartData window (14 days)
  const recent7 = chartData.slice(-7).reduce((a, b) => a + b, 0);
  const prev7 = chartData.slice(0, Math.max(0, chartData.length - 7)).reduce((a, b) => a + b, 0);
  const trendPct = prev7 > 0 ? Math.round(((recent7 - prev7) / prev7) * 100) : 0;
  const trendPositive = trendPct >= 0;

  // Build activity feed from recent loans
  const recentActivity = recentLoans.slice(0, 6).map(loan => ({
    type: (loan.status === 'returned' ? 'returned' : loan.status === 'overdue' ? 'overdue' : 'borrowed') as ActivityType,
    user: loan.borrowerName ?? 'Patron',
    book: loan.book?.title ?? 'Unknown book',
    time: (() => {
      const diff = Math.round((Date.now() - new Date(loan.borrowedAt).getTime()) / 60000);
      return diff < 60 ? `${diff}m ago` : `${Math.round(diff / 60)}h ago`;
    })(),
    avatar: (loan.borrowerName ?? 'UN').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase(),
  }));

  return (
    <AdminShell
      titleSubtitle="Admin Control Center"
      title={`${tod}, ${firstName}`}
      description="Full catalogue and circulation access enabled. Sarawak Campus library is operating normally."
      primaryAction={
        <Link
          href="/dashboard/book/items"
          className="flex items-center gap-1.5 rounded-xl bg-swin-red px-3.5 py-2.5 text-[12px] font-semibold text-white transition hover:bg-swin-red/90"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Add book
        </Link>
      }
    >
      {/* KPI grid */}
      <div className="mb-8 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {kpis.map(k => (
          <div
            key={k.label}
            className="rounded-[14px] border border-swin-charcoal/10 bg-white p-5 dark:border-white/10 dark:bg-swin-dark-surface"
          >
            <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/40 dark:text-white/40">
              {k.label}
            </p>
            <p className={`font-display text-[38px] font-semibold leading-none tracking-[-1px] ${k.danger ? 'text-swin-red' : 'text-swin-charcoal dark:text-white'}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Chart + overdue alert */}
      <div className="mb-8 grid grid-cols-1 gap-3.5 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-[14px] border border-swin-charcoal/10 bg-white p-7 dark:border-white/10 dark:bg-swin-dark-surface">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/40 dark:text-white/40">
                Circulation · Last 14 days
              </p>
              <h2 className="font-display text-[24px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
                {recent7} loans this week
              </h2>
              {prev7 > 0 && (
                <p className="mt-1 text-[12px] text-swin-charcoal/60 dark:text-white/50">
                  <span className={`font-semibold ${trendPositive ? 'text-green-600 dark:text-green-400' : 'text-swin-red'}`}>
                    {trendPositive ? '+' : ''}{trendPct}%
                  </span>{' '}
                  vs previous week
                </p>
              )}
            </div>
          </div>
          <BarChartMini data={chartData} height={120} />
        </div>

        <div
          className="rounded-[14px] border bg-white p-6 dark:bg-swin-dark-surface"
          style={{ borderColor: '#C82333', borderLeft: '3px solid #C82333' }}
        >
          <div className="mb-3.5 flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[2px] text-swin-red">
              ⚠ Attention required
            </span>
          </div>
          <p className="font-display text-[42px] font-semibold leading-none tracking-[-1px] text-swin-charcoal dark:text-white">
            {summary.overdueLoans}
          </p>
          <p className="mt-1 text-[13px] text-swin-charcoal/60 dark:text-white/50">
            Overdue items{' '}
            <span className="font-semibold text-swin-red">· {Math.round(summary.overdueLoans * 0.25)} &gt; 14 days</span>
          </p>
          <div className="mt-4 space-y-2">
            {[
              { n: Math.round(summary.overdueLoans * 0.75), label: 'Under 7 days', color: 'text-amber-600 dark:text-amber-400' },
              { n: Math.round(summary.overdueLoans * 0.25), label: 'Over 14 days', color: 'text-swin-red' },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between border-b border-swin-charcoal/8 py-1.5 dark:border-white/8">
                <span className="font-mono text-[11px] text-swin-charcoal/55 dark:text-white/55">{r.label}</span>
                <span className={`font-display text-[14px] font-bold ${r.color}`}>{r.n}</span>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/admin/overdue"
            className="mt-4 block w-full rounded-lg bg-swin-red py-2.5 text-center text-[12px] font-semibold text-white transition hover:bg-swin-red/90"
          >
            Review overdue list
          </Link>
        </div>
      </div>

      {/* Quick actions (admin) */}
      <div className="mb-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Link
          href="/dashboard/admin/overdue"
          className="group flex items-center justify-between rounded-[14px] border border-swin-charcoal/10 bg-white p-5 transition hover:border-swin-red/40 hover:bg-swin-red/5 dark:border-white/10 dark:bg-swin-dark-surface dark:hover:border-swin-red/40 dark:hover:bg-swin-red/10"
        >
          <div>
            <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/40 dark:text-white/40">
              Circulation
            </p>
            <p className="font-display text-[16px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
              View overdue loans
            </p>
          </div>
          <span className="font-mono text-[18px] font-semibold text-swin-red transition group-hover:translate-x-0.5">→</span>
        </Link>
        <Link
          href="/dashboard/admin/books/new"
          className="group flex items-center justify-between rounded-[14px] border border-swin-charcoal/10 bg-white p-5 transition hover:border-swin-gold/60 hover:bg-swin-gold/5 dark:border-white/10 dark:bg-swin-dark-surface dark:hover:border-swin-gold/60 dark:hover:bg-swin-gold/10"
        >
          <div>
            <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/40 dark:text-white/40">
              Catalogue
            </p>
            <p className="font-display text-[16px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
              Add new book
            </p>
          </div>
          <span className="font-mono text-[18px] font-semibold text-swin-gold transition group-hover:translate-x-0.5">→</span>
        </Link>
      </div>

      {/* Recent activity + top books */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[3fr_2fr]">
        <div className="rounded-[14px] border border-swin-charcoal/10 bg-white p-7 dark:border-white/10 dark:bg-swin-dark-surface">
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
                Recent activity
              </h2>
              <p className="mt-0.5 font-mono text-[11px] text-swin-charcoal/40 dark:text-white/40">
                Last {recentActivity.length} transaction{recentActivity.length === 1 ? '' : 's'}
              </p>
            </div>
            <Link
              href="/dashboard/staff/history"
              className="rounded-md border border-swin-charcoal/10 bg-slate-50 px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-swin-charcoal/60 transition hover:text-swin-charcoal dark:border-white/10 dark:bg-white/5 dark:text-white/55 dark:hover:text-white"
            >
              Full history
            </Link>
          </div>
          <div>
            {recentActivity.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-swin-charcoal/40 dark:text-white/40">No recent activity.</p>
            ) : (
              recentActivity.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3.5 py-3 ${i < recentActivity.length - 1 ? 'border-b border-swin-charcoal/8 dark:border-white/8' : ''}`}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-swin-charcoal/10 bg-slate-50 font-sans text-[11px] font-semibold text-swin-charcoal/60 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                    {r.avatar}
                  </div>
                  <p className="min-w-0 flex-1 text-[13px] text-swin-charcoal dark:text-white">
                    <span className="font-semibold">{r.user}</span>{' '}
                    <span className="text-swin-charcoal/55 dark:text-white/55">{ACTIVITY_LABELS[r.type]}</span>{' '}
                    <span className="font-display italic">{r.book}</span>
                  </p>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: ACTIVITY_COLORS[r.type] }}
                    />
                    <span className="font-mono text-[10px] text-swin-charcoal/40 dark:text-white/40">{r.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[14px] border border-swin-charcoal/10 bg-white p-7 dark:border-white/10 dark:bg-swin-dark-surface">
          <div className="mb-4">
            <h2 className="font-display text-[22px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
              Most borrowed
            </h2>
            <p className="mt-0.5 font-mono text-[11px] text-swin-charcoal/40 dark:text-white/40">Last 30 days</p>
          </div>
          <div className="space-y-3.5">
            {topBooks.length === 0 ? (
              <p className="py-4 text-center text-[13px] text-swin-charcoal/45 dark:text-white/45">
                No loans in the last 30 days.
              </p>
            ) : (
              topBooks.map((b, idx) => (
                <div key={b.bookId} className="flex items-center gap-3">
                  <span className="w-6 flex-shrink-0 font-display text-[18px] font-semibold leading-none tracking-tight text-swin-charcoal/35 dark:text-white/35">
                    {idx + 1}
                  </span>
                  <BookCover gradient={getBookGradient(b.bookId)} w={30} h={42} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[14px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
                      {b.title}
                    </p>
                    {b.author && (
                      <p className="truncate font-display text-[11px] italic text-swin-charcoal/55 dark:text-white/55">
                        {b.author}
                      </p>
                    )}
                  </div>
                  <span className="flex-shrink-0 font-mono text-[11px] font-bold text-swin-gold">{b.count}×</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
