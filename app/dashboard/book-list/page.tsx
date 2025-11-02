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
  searchParams?: Record<string, string | string[]>;
}) {
  noStore();

  // Read search (optional)
  const q = pick(searchParams?.q).trim();

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

  const uiBooks: CatalogBook[] = (dbBooks ?? []).map((b: any) => {
    const rawStatus: string | null = b.status ?? null;
    const status = allowed.has(rawStatus as ItemStatus)
      ? (rawStatus as ItemStatus)
      : null;

    return {
      id: b.id,
      title: b.title ?? null,
      author: b.author ?? null,
      isbn: b.isbn ?? null,
      classification: b.classification ?? null,
      location: b.location ?? null,
      publisher: b.publisher ?? null,
      // Prefer publication_year; fall back to year
      publication_year: b.publication_year ?? b.year ?? null,
      tags: b.tags ?? null,
      status, // SIP-aligned status used by the table badges
      // Copy counts (support either naming in DB)
      copies_available: b.available_copies ?? b.copies_available ?? null,
      total_copies: b.total_copies ?? null,
      // Optional cover field names
      cover: b.cover_image_url ?? b.cover ?? null,
      // (If your BookCatalogTable also reads `available`, keep it coherent)
      available:
        typeof b.available === 'boolean'
          ? b.available
          : status === 'available' ||
            (typeof (b.available_copies ?? b.copies_available) === 'number' &&
              (b.available_copies ?? b.copies_available) > 0),
    };
  });

  return (
    <main className="space-y-8">
      <title>Book Items | Dashboard</title>

      {/* Header */}
      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <h1 className="text-2xl font-semibold">Book Items</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
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
          <h2 className="text-lg font-semibold text-swin-charcoal">Catalogue</h2>
          <p className="text-sm text-swin-charcoal/60">Showing {uiBooks.length} records</p>
        </div>
        <BookCatalogTable books={uiBooks} />
      </section>
    </main>
  );
}
