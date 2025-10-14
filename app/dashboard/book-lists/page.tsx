import BookList from '@/app/ui/dashboard/book-lists';
import SearchForm from '@/app/ui/dashboard/search-form';
import { fetchBooks } from '@/app/lib/supabase/queries';

export default async function BookListsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const raw = params?.q;
  const searchTerm = Array.isArray(raw) ? raw[0]?.trim() ?? '' : raw?.trim() ?? '';
  const books = await fetchBooks(searchTerm);

  // Derive simple groupings from the fetched results
  const available = books.filter((b: any) => b.available === true);
  const onLoan = books.filter((b: any) => b.available === false);
  const programming = books.filter((b: any) =>
    Array.isArray(b.tags) && b.tags.some((t: string) => ['programming', 'typescript', 'javascript'].includes(t.toLowerCase()))
  );
  const designUI = books.filter((b: any) =>
    Array.isArray(b.tags) && b.tags.some((t: string) => ['design', 'ui', 'accessibility'].includes(t.toLowerCase()))
  );

  return (
    <main className="space-y-8">
      <title>Book Lists | Dashboard</title>

      {/* Same header bar style as book-items */}
      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <h1 className="text-2xl font-semibold">Book Lists</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          Browse curated groups from the Supabase-powered Swinburne catalogue.
        </p>
      </header>

      {/* Shared search form */}
      <SearchForm
        action="/dashboard/book-lists"
        placeholder="Search catalogue by title, author, ISBN, or barcode"
        defaultValue={searchTerm}
        aria-label="Search books"
      />

      {/* All results */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-swin-charcoal">All results</h2>
          <p className="text-sm text-swin-charcoal/60">Showing {books.length} records</p>
        </div>
        <BookList books={books} />
      </section>

      {/* Available now */}
      {available.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-swin-charcoal">Available now</h2>
            <p className="text-sm text-swin-charcoal/60">{available.length} available</p>
          </div>
          <BookList books={available} />
        </section>
      )}

      {/* On loan */}
      {onLoan.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-swin-charcoal">On loan</h2>
            <p className="text-sm text-swin-charcoal/60">{onLoan.length} currently checked out</p>
          </div>
          <BookList books={onLoan} />
        </section>
      )}

      {/* Programming */}
      {programming.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-swin-charcoal">Programming</h2>
            <p className="text-sm text-swin-charcoal/60">{programming.length} matching</p>
          </div>
          <BookList books={programming} />
        </section>
      )}

      {/* Design & UI */}
      {designUI.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-swin-charcoal">Design and UI</h2>
            <p className="text-sm text-swin-charcoal/60">{designUI.length} matching</p>
          </div>
          <BookList books={designUI} />
        </section>
      )}
    </main>
  );
}
