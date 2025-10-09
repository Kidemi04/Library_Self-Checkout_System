import dynamic from 'next/dynamic';
import CheckInForm from '@/app/ui/dashboard/check-in-form';
import ActiveLoansTable from '@/app/ui/dashboard/active-loans-table';
import SearchForm from '@/app/ui/dashboard/search-form';
import { fetchActiveLoans, fetchDashboardSummary } from '@/app/lib/supabase/queries';

const CameraScanButton = dynamic(() => import('@/app/ui/dashboard/camera-scanner-button'), {
  ssr: false,
  loading: () => (
    <div className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-500 shadow-sm">
      Preparing camera…
    </div>
  ),
});

export default async function CheckInPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const raw = params?.q;
  const searchTerm = Array.isArray(raw) ? raw[0]?.trim() ?? '' : raw?.trim() ?? '';

  const [activeLoans, summary] = await Promise.all([
    fetchActiveLoans(searchTerm),
    fetchDashboardSummary(),
  ]);

  const totalActive = summary.activeLoans;

  return (
    <main className="space-y-8">
      <title>Check In | Dashboard</title>
      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <h1 className="text-2xl font-semibold">Check In</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          Quickly process returns and keep the catalogue up to date.
        </p>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchForm
          action="/dashboard/check-in"
          placeholder="Search active loans by borrower, ID, or book"
          defaultValue={searchTerm}
          aria-label="Search active loans"
          className="w-full lg:flex-1"
        />
        <CameraScanButton />
      </div>

      <CheckInForm activeLoanCount={totalActive} defaultIdentifier={searchTerm} />

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
