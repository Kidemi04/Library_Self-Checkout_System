import clsx from 'clsx';
import CheckOutForm from '@/app/ui/dashboard/check-out-form';
import ActiveLoansTable from '@/app/ui/dashboard/active-loans-table';
import SearchForm from '@/app/ui/dashboard/search-form';
import { fetchActiveLoans, fetchAvailableBooks } from '@/app/lib/supabase/queries';
import { getDashboardSession } from '@/app/lib/auth/session';

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
  const role = user?.role ?? 'student';
  const isStaff = role === 'staff';

  const params = searchParams ? await searchParams : undefined;
  const raw = params?.q;
  const searchTerm = Array.isArray(raw) ? raw[0]?.trim() ?? '' : raw?.trim() ?? '';

  const [books, activeLoans] = await Promise.all([
    fetchAvailableBooks(searchTerm),
    fetchActiveLoans(),
  ]);

  const defaultDueDate = buildDefaultDueDate();

  return (
    <main className="space-y-8">
      <title>Borrow Books | Dashboard</title>
      <header className="rounded-2xl border border-swin-charcoal/10 bg-swin-charcoal p-8 text-swin-ivory shadow-inner shadow-black/20">
        <h1 className="text-2xl font-semibold text-swin-ivory">Borrow Books</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          {isStaff
            ? 'Lend titles by scanning library cards or selecting items from the catalogue.'
            : 'Reserve a title by providing your borrower details to the library team.'}
        </p>
      </header>

      <SearchForm
        action="/dashboard/check-out"
        placeholder="Search by title, author, ISBN, or barcode"
        defaultValue={searchTerm}
        aria-label="Search available books"
      />

      <CheckOutForm books={books} defaultDueDate={defaultDueDate} />

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
            {activeLoans.length} books are with borrowers right now
          </p>
        </div>
        <ActiveLoansTable loans={activeLoans} showActions={isStaff} />
      </section>
    </main>
  );
}
