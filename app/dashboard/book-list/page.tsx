// app/dashboard/book-items/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { unstable_noStore as noStore } from 'next/cache';
import CreateBookForm from '@/app/ui/dashboard/create-book-form';
import BookCatalogTable, {
  type CatalogBook,
} from '@/app/ui/dashboard/book-catalog-table';
import SearchForm from '@/app/ui/dashboard/search-form';
import { fetchBooks } from '@/app/lib/supabase/queries';

// Keep this list in sync with your SIP / Supabase enum
type ItemStatus =
  | 'available'
  | 'checked_out'
  | 'borrowed'
  | 'reserved'
  | 'on_hold'
  | 'in_transit'
  | 'in_process'
  | 'lost'
  | 'missing'
  | 'maintenance';

function pick(v?: string | string[] | null) {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

export default async function BookItemsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  noStore();

  // Read search (optional)
  const params =
    (searchParams ? await searchParams : {}) as Record<string, string | string[] | undefined>;
  const q = pick(params?.q).trim();

  // 1) Fetch from Supabase (server)
  const dbBooks = await fetchBooks(q || undefined);

  // 2) Normalize DB rows to CatalogBook expected by the table
  const allowed = new Set<ItemStatus>([
    'available',
    'checked_out',
    'borrowed',
    'reserved',
    'on_hold',
    'in_transit',
    'in_process',
    'lost',
    'missing',
    'maintenance',
  ]);

  const uiBooks: CatalogBook[] = (dbBooks ?? []).map((book) => {
    const status: ItemStatus =
      book.availableCopies > 0 ? 'available' : 'checked_out';

    return {
      id: book.id,
      title: book.title ?? null,
      author: book.author ?? null,
      isbn: book.isbn ?? null,
      classification: book.classification ?? null,
      publisher: book.publisher ?? null,
      publication_year: book.publicationYear ?? null,
      tags: book.tags ?? null,
      status: allowed.has(status) ? status : null,
      copies_available: book.availableCopies,
      total_copies: book.totalCopies,
      cover: book.coverImageUrl ?? null,
      available: book.availableCopies > 0,
    };
  });

  return (
    <main className="space-y-8">
      <title>Book Items | Dashboard</title>

      {/* Header */}
      <header className="rounded-2xl border border-slate-200 bg-white p-8 text-swin-charcoal shadow-lg shadow-slate-200 transition-colors dark:border-white/10 dark:bg-slate-900 dark:text-white dark:shadow-black/40">
        <h1 className="text-2xl font-semibold">Book Items</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-charcoal/70 dark:text-slate-300">
          Keep the Supabase-powered catalogue of Swinburne resources up to date.
        </p>
      </header>

      {/* Search */}
      <SearchForm
        action="/dashboard/book-items"
        placeholder="Search catalogue by title, author, ISBN, or barcode"
        defaultValue={q}
        aria-label="Search books"
      />

      {/* Create new item */}
      <CreateBookForm />

      {/* Editable table (Manage / Delete handled inside the component) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-swin-charcoal dark:text-white">Catalogue</h2>
          <p className="text-sm text-swin-charcoal/60 dark:text-slate-300">Showing {uiBooks.length} records</p>
        </div>
        <BookCatalogTable books={uiBooks} />
      </section>
    </main>
  );
}
