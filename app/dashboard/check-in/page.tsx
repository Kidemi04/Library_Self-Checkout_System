import clsx from 'clsx';
import CheckInForm from '@/app/ui/dashboard/check-in-form';
import ActiveLoansTable from '@/app/ui/dashboard/active-loans-table';
import SearchForm from '@/app/ui/dashboard/search-form';
import { fetchActiveLoans, fetchDashboardSummary } from '@/app/lib/supabase/queries';
import CameraScanButton from '@/app/ui/dashboard/camera-scanner-button';
import { getDashboardSession } from '@/app/lib/auth/session';

export default async function ReturningBooksPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const { user } = await getDashboardSession();
  const role = user?.role ?? 'student';
  const isStaff = role === 'staff';

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
      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <h1 className="text-2xl font-semibold">Returning Books</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          {isStaff
            ? 'Record completed loans and reconcile returned items with the inventory.'
            : 'Review which books are currently on loan before speaking with library staff.'}
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <SearchForm
          action="/dashboard/check-in"
          placeholder="Search borrowed books by borrower, ID, or title"
          defaultValue={searchTerm}
          aria-label="Search borrowed books"
          className="flex-1 min-w-0"
        />
        {isStaff ? <CameraScanButton className="w-full max-w-full md:w-auto" /> : null}
      </div>

      {isStaff ? (
        <CheckInForm activeLoanCount={totalBorrowed} defaultIdentifier={searchTerm} />
      ) : (
        <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 text-sm text-swin-charcoal/70 shadow-sm shadow-swin-charcoal/5">
          Only library staff can confirm returns. Please speak with a librarian to finalise your borrowed
          items.
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2
            className={clsx(
              'text-lg font-semibold',
              isStaff ? 'text-slate-100' : 'text-swin-charcoal',
            )}
          >
            Books currently not available
          </h2>
          <p
            className={clsx(
              'text-sm',
              isStaff ? 'text-slate-300' : 'text-swin-charcoal/60',
            )}
          >
            Showing {activeLoans.length} of {totalBorrowed} borrowed books
          </p>
        </div>
        <ActiveLoansTable loans={activeLoans} showActions={isStaff} />
      </section>
    </main>
  );
}
