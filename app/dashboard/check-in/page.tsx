import CheckInForm from '@/app/ui/dashboard/check-in-form';
import ActiveLoansTable from '@/app/ui/dashboard/active-loans-table';
import SearchForm from '@/app/ui/dashboard/search-form';
import { fetchActiveLoans, fetchDashboardSummary } from '@/app/lib/supabase/queries';

export default async function CheckInPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const searchTerm = searchParams?.q?.trim() ?? '';

  const [activeLoans, summary] = await Promise.all([
    fetchActiveLoans(searchTerm),
    fetchDashboardSummary(),
  ]);

  const totalActive = summary.activeLoans;

  return (
    <main className="space-y-8">
      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <h1 className="text-2xl font-semibold">Check In</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          Quickly process returns and keep the catalogue up to date.
        </p>
      </header>

      <SearchForm
        action="/dashboard/check-in"
        placeholder="Search active loans by borrower, ID, or book"
        defaultValue={searchTerm}
        aria-label="Search active loans"
      />

      <CheckInForm activeLoanCount={totalActive} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-swin-charcoal">Active loans</h2>
          <p className="text-sm text-swin-charcoal/60">
            Showing {activeLoans.length} of {totalActive}
          </p>
        </div>
        <ActiveLoansTable loans={activeLoans} />
      </section>
    </main>
  );
}
