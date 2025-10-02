import CheckOutForm from '@/app/ui/dashboard/check-out-form';
import ActiveLoansTable from '@/app/ui/dashboard/active-loans-table';
import SearchForm from '@/app/ui/dashboard/search-form';
import { fetchActiveLoans, fetchAvailableBooks } from '@/app/lib/supabase/queries';

const defaultLoanDurationDays = 14;

const buildDefaultDueDate = () => {
  const now = new Date();
  now.setDate(now.getDate() + defaultLoanDurationDays);
  const iso = now.toISOString();
  return iso.split('T')[0] ?? iso;
};

export default async function CheckOutPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const searchTerm = searchParams?.q?.trim() ?? '';

  const [books, activeLoans] = await Promise.all([
    fetchAvailableBooks(searchTerm),
    fetchActiveLoans(),
  ]);

  const defaultDueDate = buildDefaultDueDate();

  return (
    <main className="space-y-8">
      <title>Check Out | Dashboard</title>
      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <h1 className="text-2xl font-semibold">Check Out</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          Issue books by scanning borrower IDs and confirming availability in real time.
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
          <h2 className="text-lg font-semibold text-swin-charcoal">Currently checked out</h2>
          <p className="text-sm text-swin-charcoal/60">
            {activeLoans.length} active loans
          </p>
        </div>
        <ActiveLoansTable loans={activeLoans} />
      </section>
    </main>
  );
}
