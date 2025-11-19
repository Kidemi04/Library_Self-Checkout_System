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
