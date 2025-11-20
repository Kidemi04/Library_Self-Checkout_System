import Link from 'next/link';
import clsx from 'clsx';
import SummaryCards from '@/app/ui/dashboard/summary-cards';
import RecentLoans from '@/app/ui/dashboard/recent-loans';
import ActiveLoansTable from '@/app/ui/dashboard/active-loans-table';
import {
  fetchActiveLoans,
  fetchDashboardSummary,
  fetchRecentLoans,
} from '@/app/lib/supabase/queries';

export default async function AdminDashboardPage() {
  const [summary, recentLoans, activeLoans] = await Promise.all([
    fetchDashboardSummary(),
    fetchRecentLoans(6),
    fetchActiveLoans(),
  ]);

  return (
    <main className="space-y-8">
      <title>Dashboard | Admin Overview</title>

      <div className="grid grid-cols-3 gap-3 md:hidden">
        <Link
          href="/dashboard/friends"
          className={clsx(
            'flex flex-col items-center justify-center gap-2 rounded-2xl border border-swin-charcoal/10 bg-white p-3 text-center text-swin-charcoal shadow-sm transition hover:border-swin-red/60 hover:shadow-swin-red/20',
            'dark:border-white/10 dark:bg-slate-900/70 dark:text-white dark:hover:border-emerald-300/40 dark:hover:shadow-emerald-400/20',
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 5.472m0 0a9.09 9.09 0 0 0-3.279 1.317c-1.143.63-1.214 1.98-.477 2.912a5.976 5.976 0 0 1 4.693-3.03m0 0a6.051 6.051 0 0 1 3.848-1.232m0 0a6.051 6.051 0 0 1 3.848 1.232M12 12.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            </svg>
          </div>
          <span className="text-xs font-semibold">Friends</span>
        </Link>

        <Link
          href="/dashboard/communities"
          className={clsx(
            'flex flex-col items-center justify-center gap-2 rounded-2xl border border-swin-charcoal/10 bg-white p-3 text-center text-swin-charcoal shadow-sm transition hover:border-swin-red/60 hover:shadow-swin-red/20',
            'dark:border-white/10 dark:bg-slate-900/70 dark:text-white dark:hover:border-emerald-300/40 dark:hover:shadow-emerald-400/20',
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 5.472m0 0a9.09 9.09 0 0 0-3.279 1.317c-1.143.63-1.214 1.98-.477 2.912a5.976 5.976 0 0 1 4.693-3.03m0 0a6.051 6.051 0 0 1 3.848-1.232m0 0a6.051 6.051 0 0 1 3.848 1.232M12 12.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            </svg>
          </div>
          <span className="text-xs font-semibold">Communities</span>
        </Link>

        <Link
          href="/dashboard/learning"
          className={clsx(
            'flex flex-col items-center justify-center gap-2 rounded-2xl border border-swin-charcoal/10 bg-white p-3 text-center text-swin-charcoal shadow-sm transition hover:border-swin-red/60 hover:shadow-swin-red/20',
            'dark:border-white/10 dark:bg-slate-900/70 dark:text-white dark:hover:border-emerald-300/40 dark:hover:shadow-emerald-400/20',
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.499 5.516 50.552 50.552 0 0 0-2.658.813m-15.482 0A50.55 50.55 0 0 1 12 13.489a50.55 50.55 0 0 1 6.74-3.342" />
            </svg>
          </div>
          <span className="text-xs font-semibold">Learning</span>
        </Link>
      </div>

      <SummaryCards summary={summary} />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-swin-charcoal dark:text-white">Recent activity</h2>
          <p className="text-sm text-swin-charcoal/60 dark:text-slate-300">Latest borrowing and return activity</p>
        </div>
        <RecentLoans loans={recentLoans} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-swin-charcoal dark:text-white">Active loans</h2>
          <p className="text-sm text-swin-charcoal/60 dark:text-slate-300">
            {activeLoans.length} items currently outside the library
          </p>
        </div>
        <ActiveLoansTable loans={activeLoans.slice(0, 8)} />
      </section>
    </main>
  );
}
