import CheckOutForm from '@/app/ui/dashboard/checkOutForm';
import ActiveLoansTable from '@/app/ui/dashboard/activeLoansTable';
import SearchForm from '@/app/ui/dashboard/searchForm';
import { fetchActiveLoans, fetchAvailableBooks } from '@/app/lib/supabase/queries';
import { getDashboardSession } from '@/app/lib/auth/session';
import AdminShell from '@/app/ui/dashboard/adminShell';
import { QrCodeIcon } from '@heroicons/react/24/outline';

const defaultLoanDurationDays = 14;

const buildDefaultDueDate = () => {
  const now = new Date();
  now.setDate(now.getDate() + defaultLoanDurationDays);
  const iso = now.toISOString();
  return iso.split('T')[0] ?? iso;
};

export default async function BorrowBooksPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const { user } = await getDashboardSession();
  const role = user?.role ?? 'user';
  const canProcessLoans = role === 'staff' || role === 'admin';

  const params = searchParams ? await searchParams : undefined;
  const raw = params?.q;
  const searchTerm = Array.isArray(raw) ? raw[0]?.trim() ?? '' : raw?.trim() ?? '';

  // Extract bookId for pre-selection
  const rawBookId = params?.bookId;
  const preSelectedBookId = Array.isArray(rawBookId) ? rawBookId[0]?.trim() ?? '' : rawBookId?.trim() ?? '';

  const [books, activeLoans] = await Promise.all([
    fetchAvailableBooks(searchTerm),
    fetchActiveLoans(undefined, canProcessLoans ? undefined : user?.id),
  ]);

  const defaultDueDate = buildDefaultDueDate();

  return (
    <>
      <title>Borrow Books | Dashboard</title>

      <AdminShell
        titleSubtitle="Check Out"
        title="Borrow Books"
        description={canProcessLoans
          ? 'Lend titles by scanning barcodes or selecting items from the catalogue.'
          : 'Borrow a title by scanning your copy or searching the catalogue, then confirm your details.'}
      >
        <div className="space-y-6">
          {/* Gradient scan hero */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 text-white"
            style={{
              background: 'linear-gradient(120deg, #A81C2A 0%, #C82333 60%, #E85566 100%)',
              boxShadow: '0 16px 40px rgba(200,35,51,0.2)',
            }}
          >
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/8" />
            <div className="relative flex items-start gap-5">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[14px] border border-white/22 bg-white/16">
                <QrCodeIcon className="h-7 w-7" strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[2px] opacity-80">
                  Self-Service Desk · Scan to Process
                </p>
                <h2 className="mt-1 font-display text-[26px] font-semibold leading-tight tracking-tight">
                  Scan a barcode or pick a title below
                </h2>
                <p className="mt-1 text-[12px] opacity-85">
                  Point the camera at the book barcode, or find it in the catalogue and confirm your loan.
                </p>
              </div>
            </div>
          </div>

          <SearchForm
            defaultValue={searchTerm}
            aria-label="Search available books"
            extraParams={{ mode: 'out' }}
          />

          <CheckOutForm
            books={books}
            defaultDueDate={defaultDueDate}
            preSelectedBookId={preSelectedBookId}
            selfCheckout={!canProcessLoans}
            selfUserId={!canProcessLoans ? user?.id : undefined}
            selfUserName={!canProcessLoans ? (user?.name ?? user?.email ?? undefined) : undefined}
          />

          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
                {canProcessLoans ? 'Books currently not available' : 'Your current loans'}
              </h2>
              <p className="font-mono text-[11px] text-swin-charcoal/45 dark:text-white/45">
                {canProcessLoans
                  ? `${activeLoans.length} books are with borrowers right now`
                  : `${activeLoans.length} book${activeLoans.length === 1 ? '' : 's'} on loan`}
              </p>
            </div>
            <ActiveLoansTable loans={activeLoans} showActions={canProcessLoans} />
          </section>
        </div>
      </AdminShell>
    </>
  );
}
