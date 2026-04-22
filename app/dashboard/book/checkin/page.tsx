import CheckInForm from '@/app/ui/dashboard/checkInForm';
import ActiveLoansTable from '@/app/ui/dashboard/activeLoansTable';
import SearchForm from '@/app/ui/dashboard/searchForm';
import { fetchActiveLoans, fetchDashboardSummary } from '@/app/lib/supabase/queries';
import CameraScanButton from '@/app/ui/dashboard/cameraScannerButton';
import { getDashboardSession } from '@/app/lib/auth/session';
import AdminShell from '@/app/ui/dashboard/adminShell';
import { MapPinIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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
    fetchActiveLoans(searchTerm, canProcessReturns ? undefined : user?.id),
    fetchDashboardSummary(),
  ]);

  const totalBorrowed = summary.activeLoans;

  return (
    <>
      <title>Returning Books | Dashboard</title>

      <AdminShell
        titleSubtitle="Check In"
        title="Return Books"
        description={canProcessReturns
          ? 'Record completed loans and reconcile returned items with the inventory.'
          : 'Review which books are currently on loan before speaking with library staff.'}
      >
        <div className="space-y-6">
          {/* Gradient return hero */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 text-white"
            style={{
              background: 'linear-gradient(120deg, #1F6E47 0%, #2F8F5A 60%, #58B483 100%)',
              boxShadow: '0 16px 40px rgba(47,143,90,0.2)',
            }}
          >
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/8" />
            <div className="relative flex items-start gap-5">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[14px] border border-white/22 bg-white/16">
                <ArrowPathIcon className="h-7 w-7" strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[2px] opacity-80">
                  Return Desk · Scan to Complete
                </p>
                <h2 className="mt-1 font-display text-[26px] font-semibold leading-tight tracking-tight">
                  {canProcessReturns
                    ? 'Scan the returned copy barcode'
                    : 'Drop by the library counter to return'}
                </h2>
                <p className="mt-1 text-[12px] opacity-85">
                  {canProcessReturns
                    ? 'Once scanned, the loan is closed and the copy is returned to the shelf.'
                    : 'Staff will confirm the return on the spot — no form needed.'}
                </p>
              </div>
            </div>
          </div>

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
            <div className="flex gap-4 rounded-2xl border border-swin-charcoal/10 bg-white p-5 dark:border-white/10 dark:bg-swin-dark-surface">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-swin-charcoal/8 text-swin-charcoal dark:bg-white/10 dark:text-white/80">
                <MapPinIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-[16px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
                  Bring your book to the library counter
                </p>
                <p className="mt-1 text-[13px] text-swin-charcoal/60 dark:text-white/55">
                  Staff will process your return — no form needed. Just hand over the book and you&apos;re done.
                </p>
              </div>
            </div>
          )}

          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
                {canProcessReturns ? 'Books currently not available' : 'Your current loans'}
              </h2>
              <p className="font-mono text-[11px] text-swin-charcoal/45 dark:text-white/45">
                {canProcessReturns
                  ? `Showing ${activeLoans.length} of ${totalBorrowed} borrowed books`
                  : `${activeLoans.length} book${activeLoans.length === 1 ? '' : 's'} on loan`}
              </p>
            </div>
            <ActiveLoansTable loans={activeLoans} showActions={canProcessReturns} />
          </section>
        </div>
      </AdminShell>
    </>
  );
}

