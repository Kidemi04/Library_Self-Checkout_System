import CreateBookForm from '@/app/ui/dashboard/create-book-form';
import BookCatalogTable from '@/app/ui/dashboard/book-catalog-table';
import SearchForm from '@/app/ui/dashboard/search-form';
import { fetchBooks } from '@/app/lib/supabase/queries';
import type { ItemStatus } from '@/app/lib/supabase/updates';

export default async function BookItemsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const raw = params?.q;
  const searchTerm = Array.isArray(raw) ? raw[0]?.trim() ?? '' : raw?.trim() ?? '';
  const books = await fetchBooks(searchTerm);

  // Allowed statuses (mirror of ItemStatus)
  const allowed = new Set<ItemStatus>([
    'available',
    'checked_out',
    'borrowed',
    'reserved',
    'in_transit',
    'on_hold',
    'in_process',
    'lost',
    'missing',
    'maintenance',
  ]);

  // Map DB Book -> UI CatalogBook safely (tolerate differing column names)
  const uiBooks = (books as any[]).map((b) => {
    const status: string | null | undefined = b.status ?? null;
    const normalizedStatus = (status && allowed.has(status as ItemStatus)
      ? (status as ItemStatus)
      : null) as ItemStatus | null;

    return {
      id: b.id,
      title: b.title ?? null,
      author: b.author ?? null,
      isbn: b.isbn ?? null,
      classification: b.classification ?? null,
      location: b.location ?? null,
      publication_year: b.publication_year ?? b.year ?? null,
      publisher: b.publisher ?? null,
      tags: b.tags ?? null,
      status: normalizedStatus,
      // prefer explicit "available"; fallback: true only if status is "available"
      available:
        typeof b.available === 'boolean'
          ? b.available
          : normalizedStatus === 'available',
      cover: b.cover ?? b.cover_image_url ?? null,
      copies_available: b.copies_available ?? null,
      total_copies: b.total_copies ?? null,
    };
  });

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
          <p className="text-sm text-swin-charcoal/60">Showing {uiBooks.length} records</p>
        </div>
        <BookCatalogTable books={uiBooks} />
      </section>
    </main>
  );
}
