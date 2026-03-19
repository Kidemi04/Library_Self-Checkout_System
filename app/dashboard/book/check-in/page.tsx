import clsx from 'clsx';
import CheckInForm from '@/app/ui/dashboard/check-in-form';
import ActiveLoansTable from '@/app/ui/dashboard/active-loans-table';
import SearchForm from '@/app/ui/dashboard/search-form';
import { fetchActiveLoans, fetchDashboardSummary } from '@/app/lib/supabase/queries';
import CameraScanButton from '@/app/ui/dashboard/camera-scanner-button';
import { getDashboardSession } from '@/app/lib/auth/session';
import DashboardTitleBar from '@/app/ui/dashboard/dashboard-title-bar';

export default async function ReturningBooksPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const { user } = await getDashboardSession();
  const role = user?.role ?? 'user';
  const canProcessReturns = role === 'staff' || role === 'admin';

  const params = searchParams ? await searchParams : undefined;
  const raw = params?.q;
  const searchTerm = Array.isArray(raw) ? raw[0]?.trim() ?? '' : raw?.trim() ?? '';

  const [activeLoans, summary] = await Promise.all([
    fetchActiveLoans(searchTerm),
    fetchDashboardSummary(),
  ]);

  const totalBorrowed = summary.activeLoans;

  return (
    <main className="space-y-8">
      <title>Returning Books | Dashboard</title>
      <DashboardTitleBar
        subtitle="Check In"
        title="Returning Books"
        description={canProcessReturns
          ? "Record completed loans and reconcile returned items with the inventory."
          : "Review which books are currently on loan before speaking with library staff."}
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchForm
          action="/dashboard/book"
          placeholder="Search borrowed books by borrower, ID, or title"
          defaultValue={searchTerm}
          aria-label="Search borrowed books"
          className="flex-1 min-w-0"
          extraParams={{ mode: 'in' }}
        />
        {canProcessReturns ? <CameraScanButton className="w-full max-w-full md:w-auto" /> : null}
      </div>

      {canProcessReturns ? (
        <CheckInForm activeLoanCount={totalBorrowed} defaultIdentifier={searchTerm} />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-swin-charcoal/70 shadow-sm shadow-slate-200 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:shadow-black/30">
          Only library staff can confirm returns. Please speak with a librarian to finalise your borrowed
          items.
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-swin-charcoal dark:text-white">
            Books currently not available
          </h2>
          <p className="text-sm text-swin-charcoal/60 dark:text-slate-300">
            Showing {activeLoans.length} of {totalBorrowed} borrowed books
          </p>
        </div>
        <ActiveLoansTable loans={activeLoans} showActions={canProcessReturns} />
      </section>
    </main>
  );
}

