import CheckOutForm from '@/app/ui/dashboard/check-out-form';
import CheckInForm from '@/app/ui/dashboard/check-in-form';
import ActiveLoansTable from '@/app/ui/dashboard/active-loans-table';
import { fetchActiveLoans, fetchAvailableBooks, fetchDashboardSummary } from '@/app/lib/supabase/queries';

const defaultLoanDurationDays = 14;

const buildDefaultDueDate = () => {
  const now = new Date();
  now.setDate(now.getDate() + defaultLoanDurationDays);
  const iso = now.toISOString();
  return iso.split('T')[0] ?? iso;
};

export default async function UserDashboardPage() {
  const [books, activeLoans, summary] = await Promise.all([
    fetchAvailableBooks(),
    fetchActiveLoans(),
    fetchDashboardSummary(),
  ]);

  const defaultDueDate = buildDefaultDueDate();

  return (
    <main className="space-y-8">
      <title>Dashboard | Quick Actions</title>

      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <h1 className="text-2xl font-semibold">Self-Service Desk</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          Quickly process checkouts and returns directly from this dashboard. Use the controls below to
          assist patrons without leaving the page.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <CheckOutForm books={books} defaultDueDate={defaultDueDate} />
        <CheckInForm activeLoanCount={summary.activeLoans} />
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-swin-charcoal">Active loans</h2>
          <p className="text-sm text-swin-charcoal/60">
            {activeLoans.length} items currently outside the library
          </p>
        </div>
        <ActiveLoansTable loans={activeLoans} />
      </section>
    </main>
  );
}
