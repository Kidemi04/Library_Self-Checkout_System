import CreateBookForm from '@/app/ui/dashboard/create-book-form';
import BookCatalogTable from '@/app/ui/dashboard/book-catalog-table';
import SearchForm from '@/app/ui/dashboard/search-form';
import { fetchBooks } from '@/app/lib/supabase/queries';

export default async function BookItemsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const raw = params?.q;
  const searchTerm = Array.isArray(raw) ? raw[0]?.trim() ?? '' : raw?.trim() ?? '';
  const books = await fetchBooks(searchTerm);

  return (
    <main className="space-y-8">
      <title>Book Items | Dashboard</title>
      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <h1 className="text-2xl font-semibold">Book Items</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          Keep the Supabase-powered catalogue of Swinburne resources up to date.
        </p>
      </header>

      <SearchForm
        action="/dashboard/book-items"
        placeholder="Search catalogue by title, author, ISBN, or barcode"
        defaultValue={searchTerm}
        aria-label="Search books"
      />

      <CreateBookForm />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-swin-charcoal">Catalogue</h2>
          <p className="text-sm text-swin-charcoal/60">Showing {books.length} records</p>
        </div>
        <BookCatalogTable books={books} />
      </section>
    </main>
  );
}
