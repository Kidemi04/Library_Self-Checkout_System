import Link from 'next/link';
import clsx from 'clsx';
import { redirect } from 'next/navigation';
import SummaryCards from '@/app/ui/dashboard/summaryCards';
import RecentLoans from '@/app/ui/dashboard/recentLoans';
import ActiveLoansTable from '@/app/ui/dashboard/activeLoansTable';
import DashboardTitleBar from '@/app/ui/dashboard/dashboardTitleBar';
import DashboardUserCard from '@/app/ui/dashboard/dashboardUserCard';
import NotificationPanel from '@/app/ui/dashboard/notificationPanel';
import { getDashboardSession } from '@/app/lib/auth/session';
import {
  fetchActiveLoans,
  fetchDashboardSummary,
  fetchRecentLoans,
} from '@/app/lib/supabase/queries';

export default async function AdminDashboardPage() {
  // 1. Authenticate and authorize the user
  const { user, isBypassed } = await getDashboardSession();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'staff' && user.role !== 'admin') {
    redirect('/dashboard');
  }

  // 2. Fetch dashboard data in parallel
  const [summary, recentLoans, activeLoans] = await Promise.all([
    fetchDashboardSummary(),
    fetchRecentLoans(6),
    fetchActiveLoans(),
  ]);

  return (
    <main className="space-y-8">
      <title>Dashboard | Admin Overview</title>

      {/* Moved from layout.tsx: Displays page header and user profile */}
      <DashboardTitleBar
        subtitle="Admin Control Center"
        title={`Good day, ${user.name}`}
        description={`
          Full catalogue and circulation access enabled for this session.
          ${isBypassed ? "Development bypass active" : ""}
        `}
        rightSlot={<DashboardUserCard email={user.email} role={user.role} />}
      />

      {/* Quick Navigation Link (Mobile Only) */}
      <div className="md:hidden">
        <Link
          href="/dashboard/learning"
          className={clsx(
            'flex items-center justify-between rounded-2xl border border-swin-charcoal/10 bg-white px-5 py-4 text-swin-charcoal shadow-sm transition hover:border-swin-red/60 hover:shadow-swin-red/20',
            'dark:border-white/10 dark:bg-slate-900/70 dark:text-white dark:hover:border-emerald-300/40 dark:hover:shadow-emerald-400/20',
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.499 5.516 50.552 50.552 0 0 0-2.658.813m-15.482 0A50.55 50.55 0 0 1 12 13.489a50.55 50.55 0 0 1 6.74-3.342" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Learning</span>
              <span className="text-xs text-swin-charcoal/60 dark:text-slate-300/80">Browse learning resources</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Numerical Data Summary */}
      <SummaryCards summary={summary} />

      {/* Recent Activity List */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-swin-charcoal dark:text-white">Recent activity</h2>
          <p className="text-sm text-swin-charcoal/60 dark:text-slate-300">Latest borrowing and return activity</p>
        </div>
        <RecentLoans loans={recentLoans} />
      </section>

      {/* Detailed Loans Table */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-swin-charcoal dark:text-white">Active loans</h2>
          <p className="text-sm text-swin-charcoal/60 dark:text-slate-300">
            {activeLoans.length} items currently outside the library
          </p>
        </div>
        <ActiveLoansTable loans={activeLoans.slice(0, 8)} />
      </section>

      {/* Live Notification Feed */}
      <NotificationPanel />
    </main>
  );
}