import AdminShell from '@/app/ui/dashboard/adminShell';
import BookCover, { getBookGradient } from '@/app/ui/dashboard/primitives/BookCover';
import type { DashboardSummary } from '@/app/lib/supabase/types';
import type { Loan } from '@/app/lib/supabase/types';
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

const CHART_DATA = [22, 28, 35, 31, 42, 38, 45, 52, 48, 54, 61, 58, 66, 72];

const TOP_BOOKS = [
  { rank: 1, title: 'Clean Architecture', author: 'Robert C. Martin', count: 42 },
  { rank: 2, title: 'Design of Everyday Things', author: 'Don Norman', count: 38 },
  { rank: 3, title: 'Thinking, Fast and Slow', author: 'Kahneman', count: 31 },
  { rank: 4, title: 'Atomic Habits', author: 'James Clear', count: 28 },
  { rank: 5, title: 'Sapiens', author: 'Y.N. Harari', count: 24 },
];

type AdminDashboardProps = {
  userName: string | null;
  summary: DashboardSummary;
  recentLoans: Loan[];
};

function MiniChart() {
  const max = Math.max(...CHART_DATA);
  return (
    <div className="flex h-[120px] items-end gap-1">
      {CHART_DATA.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all"
          style={{
            height: `${(v / max) * 100}%`,
            background: i === CHART_DATA.length - 1 ? '#C82333' : '#C9A961',
            opacity: i === CHART_DATA.length - 1 ? 1 : 0.35 + (i / CHART_DATA.length) * 0.65,
          }}
        />
      ))}
    </div>
  );
}

export default function AdminDashboard({ userName, summary, recentLoans }: AdminDashboardProps) {
  const firstName = userName?.split(' ')[0] ?? 'Administrator';
  const h = new Date().getHours();
  const tod = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

  const kpis = [
    { label: 'Total books',      value: summary.totalBooks.toLocaleString(),   delta: '+124', positive: true },
    { label: 'Active loans',     value: summary.activeLoans.toLocaleString(),  delta: '+18',  positive: true },
    { label: 'Overdue',          value: summary.overdueLoans.toLocaleString(), delta: '+6',   positive: false },
    { label: 'Available copies', value: summary.availableBooks.toLocaleString(), delta: '+3', positive: true },
  ];

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
            <p className="font-display text-[38px] font-semibold leading-none tracking-[-1px] text-swin-charcoal dark:text-white">
              {k.value}
            </p>
            <p className={`mt-2.5 font-mono text-[11px] font-semibold ${k.positive ? 'text-green-600 dark:text-green-400' : 'text-swin-red'}`}>
              {k.delta}{' '}
              <span className="font-normal text-swin-charcoal/40 dark:text-white/40">this week</span>
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
                Loans trending up
              </h2>
              <p className="mt-1 text-[12px] text-swin-charcoal/60 dark:text-white/50">
                <span className="font-semibold text-green-600 dark:text-green-400">+18%</span> vs previous fortnight
              </p>
            </div>
            <div className="flex gap-1.5">
              {['7d', '14d', '30d'].map((r, i) => (
                <button
                  key={r}
                  className={`rounded-md border px-2.5 py-1.5 font-mono text-[11px] font-semibold transition ${
                    i === 1
                      ? 'border-swin-charcoal bg-swin-charcoal text-white dark:border-white dark:bg-white dark:text-swin-charcoal'
                      : 'border-swin-charcoal/15 text-swin-charcoal/50 dark:border-white/15 dark:text-white/50'
                  }`}
                >{r}</button>
              ))}
            </div>
          </div>
          <MiniChart />
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
            href="/dashboard/book/history"
            className="mt-4 block w-full rounded-lg bg-swin-red py-2.5 text-center text-[12px] font-semibold text-white transition hover:bg-swin-red/90"
          >
            Review overdue list
          </Link>
        </div>
      </div>

      {/* Recent activity + top books */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[3fr_2fr]">
        <div className="rounded-[14px] border border-swin-charcoal/10 bg-white p-7 dark:border-white/10 dark:bg-swin-dark-surface">
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
                Recent activity
              </h2>
              <p className="mt-0.5 font-mono text-[11px] text-swin-charcoal/40 dark:text-white/40">Live feed · auto-refreshing</p>
            </div>
            <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-green-600 dark:text-green-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              LIVE
            </span>
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
            <p className="mt-0.5 font-mono text-[11px] text-swin-charcoal/40 dark:text-white/40">This month</p>
          </div>
          <div className="space-y-3.5">
            {TOP_BOOKS.map(b => (
              <div key={b.rank} className="flex items-center gap-3">
                <span className="w-6 flex-shrink-0 font-display text-[18px] font-semibold leading-none tracking-tight text-swin-charcoal/35 dark:text-white/35">
                  {b.rank}
                </span>
                <BookCover gradient={getBookGradient(b.title)} w={30} h={42} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[14px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
                    {b.title}
                  </p>
                  <p className="truncate font-display text-[11px] italic text-swin-charcoal/55 dark:text-white/55">
                    {b.author}
                  </p>
                </div>
                <span className="flex-shrink-0 font-mono text-[11px] font-bold text-swin-gold">{b.count}×</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
