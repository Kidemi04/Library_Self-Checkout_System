import SummaryCards from '@/app/ui/dashboard/summary-cards';
import RecentLoans from '@/app/ui/dashboard/recent-loans';
import ActiveLoansTable from '@/app/ui/dashboard/active-loans-table';
import {
  fetchActiveLoans,
  fetchDashboardSummary,
  fetchRecentLoans,
} from '@/app/lib/supabase/queries';

export default async function DashboardPage() {
  const [summary, recentLoans, activeLoans] = await Promise.all([
    fetchDashboardSummary(),
    fetchRecentLoans(6),
    fetchActiveLoans(),
  ]);

  return (
    <main className="space-y-8">
      <title>Dashboard | Home</title>

      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <h1 className="text-2xl font-semibold">Library Operations Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          Monitor catalogue health, active circulation, and overdue follow-ups across the Swinburne
          Library self-checkout experience.
        </p>
      </header>

      <SummaryCards summary={summary} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-swin-charcoal">Recent activity</h2>
          <p className="text-sm text-swin-charcoal/60">Latest checkouts and returns</p>
        </div>
        <RecentLoans loans={recentLoans} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-swin-charcoal">Active loans</h2>
          <p className="text-sm text-swin-charcoal/60">
            {activeLoans.length} items currently outside the library
          </p>
        </div>
        <ActiveLoansTable loans={activeLoans.slice(0, 8)} />
      </section>
    </main>
  );
}
