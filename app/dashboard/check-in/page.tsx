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
      <header className="rounded-2xl border border-swin-charcoal/10 bg-swin-charcoal p-8 text-swin-ivory shadow-inner shadow-black/20">
        <h1 className="text-2xl font-semibold text-swin-ivory">Returning Books</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          {isStaff
            ? 'Record completed loans and reconcile returned items with the inventory.'
            : 'Review which books are currently on loan before speaking with library staff.'}
        </p>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchForm
          action="/dashboard/check-in"
          placeholder="Search borrowed books by borrower, ID, or title"
          defaultValue={searchTerm}
          aria-label="Search borrowed books"
          className="w-full lg:flex-1"
        />
        {isStaff ? <CameraScanButton /> : null}
      </div>

      {isStaff ? (
        <CheckInForm activeLoanCount={totalBorrowed} defaultIdentifier={searchTerm} />
      ) : (
        <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 text-sm text-swin-charcoal/70 shadow-inner shadow-black/5">
          Only library staff can confirm returns. Please speak with a librarian to finalise your borrowed
          items.
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2
            className={clsx(
              'text-lg font-semibold',
              isStaff ? 'text-slate-100' : 'text-swin-ivory',
            )}
          >
            Books currently not available
          </h2>
          <p
            className={clsx(
              'text-sm',
              isStaff ? 'text-slate-300' : 'text-swin-ivory/60',
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
