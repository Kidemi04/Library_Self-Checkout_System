import clsx from 'clsx';
import CheckOutForm from '@/app/ui/dashboard/check-out-form';
import ActiveLoansTable from '@/app/ui/dashboard/active-loans-table';
import SearchForm from '@/app/ui/dashboard/search-form';
import { fetchActiveLoans, fetchAvailableBooks } from '@/app/lib/supabase/queries';
import { getDashboardSession } from '@/app/lib/auth/session';
import DashboardTitleBar from '@/app/ui/dashboard/dashboard-title-bar';

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
    fetchActiveLoans(),
  ]);

  const defaultDueDate = buildDefaultDueDate();

  return (
    <main className="space-y-8">
      <title>Borrow Books | Dashboard</title>
      <DashboardTitleBar
        subtitle="Check Out"
        title="Borrow Books"
        description={canProcessLoans
          ? "Lend titles by scanning barcodes or selecting items from the catalogue."
          : "Borrow a title by scanning your copy or searching the catalogue, then confirm your details."
        }
      />

      <SearchForm
        action="/dashboard/book"
        placeholder="Search by title, author, ISBN, or barcode"
        defaultValue={searchTerm}
        aria-label="Search available books"
        extraParams={{ mode: 'out' }}
      />

      <CheckOutForm books={books} defaultDueDate={defaultDueDate} preSelectedBookId={preSelectedBookId} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-swin-charcoal dark:text-white">
            Books currently not available
          </h2>
          <p className="text-sm text-swin-charcoal/60 dark:text-slate-300">
            {activeLoans.length} books are with borrowers right now
          </p>
        </div>
        <ActiveLoansTable loans={activeLoans} showActions={canProcessLoans} />
      </section>
    </main>
  );
}
