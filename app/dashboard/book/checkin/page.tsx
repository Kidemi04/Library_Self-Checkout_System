import clsx from 'clsx';
import CheckInForm from '@/app/ui/dashboard/checkInForm';
import ActiveLoansTable from '@/app/ui/dashboard/activeLoansTable';
import SearchForm from '@/app/ui/dashboard/searchForm';
import { fetchActiveLoans, fetchDashboardSummary } from '@/app/lib/supabase/queries';
import CameraScanButton from '@/app/ui/dashboard/cameraScannerButton';
import { getDashboardSession } from '@/app/lib/auth/session';
import DashboardTitleBar from '@/app/ui/dashboard/dashboardTitleBar';
import { MapPinIcon } from '@heroicons/react/24/outline';

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
    canProcessReturns ? fetchActiveLoans(searchTerm) : fetchActiveLoans(undefined, user?.id),
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
        <div className="space-y-4">
          {/* Helpful info panel for students */}
          <div className="flex gap-4 rounded-2xl border border-swin-charcoal/10 bg-white p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-swin-charcoal/8 text-swin-charcoal dark:bg-white/10 dark:text-white/80">
              <MapPinIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-swin-charcoal dark:text-white">
                Bring your book to the library counter
              </p>
              <p className="mt-1 text-sm text-swin-charcoal/60 dark:text-white/50">
                Staff will process your return — no form needed. Just hand over the book and you're done.
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-swin-charcoal dark:text-white">
            {canProcessReturns ? 'Books currently not available' : 'Your borrowed books'}
          </h2>
          <p className="text-sm text-swin-charcoal/60 dark:text-slate-300">
            {canProcessReturns
              ? `Showing ${activeLoans.length} of ${totalBorrowed} borrowed books`
              : `${activeLoans.length} book${activeLoans.length === 1 ? '' : 's'} to return`}
          </p>
        </div>
        <ActiveLoansTable loans={activeLoans} showActions={canProcessReturns} />
      </section>
    </main>
  );
}

