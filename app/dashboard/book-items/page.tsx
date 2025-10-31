// app/dashboard/book-list/page.tsx
// --- Always fetch fresh data (no static cache) ---
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import BookList, { UIBook } from '@/app/ui/dashboard/book-list';
import { fetchBooks } from '@/app/lib/supabase/queries';

// Helper to safely read a single value from Next's searchParams
function pickOne(v?: string | string[] | null) {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

type Params = {
  searchParams?: Record<string, string | string[]>;
};

export default async function StudentCataloguePage({ searchParams }: Params) {
  // --- Read query params ---
  const q = pickOne(searchParams?.q).trim();
  const status = pickOne(searchParams?.status).trim(); // '', 'available', 'checked_out', 'borrowed', ...
  const sort = (pickOne(searchParams?.sort) || 'title').trim() as
    | 'title'
    | 'author'
    | 'year';
  const order = (pickOne(searchParams?.order) || 'asc').trim() as 'asc' | 'desc';
  const variant = (pickOne(searchParams?.view) || 'grid').trim() as 'grid' | 'list';

  // --- Fetch from Supabase (server-side) ---
  const dbBooks = await fetchBooks(q || undefined);

  // --- Map DB rows -> UI card props used by <BookList /> ---
  // Your books table (from queries.ts) exposes:
  // id, title, author, isbn, barcode, classification, total_copies, available_copies,
  // status, location, cover_image_url, last_transaction_at
  const uiBooks: UIBook[] = (dbBooks ?? []).map((b: any) => ({
    id: b.id,
    title: b.title ?? 'Untitled',
    author: b.author ?? 'Unknown',
    cover: b.cover_image_url ?? undefined,
    tags: undefined, // if you later join book_tags, map them here
    available:
      typeof b.available_copies === 'number'
        ? b.available_copies > 0
        : (b.status ?? '') === 'available',
    classification: b.classification ?? null,
    location: b.location ?? null,
    isbn: b.isbn ?? null,
    year: null, // you can add `publication_year` in SELECT and place it here
    publisher: null,
  }));

  // --- Filter by status (optional) ---
  const filtered = !status
    ? uiBooks
    : uiBooks.filter((b) => {
        // map UI "available" to copies/status; the rest come from b.status in DB if you want to expose it
        if (status === 'available') return b.available === true;
        if (status === 'checked_out' || status === 'borrowed')
          return b.available === false;
        return true;
      });

  // --- Sort (client-side) ---
  const sorted = [...filtered].sort((a, b) => {
    const A =
      (sort === 'year'
        ? String(a.year ?? '')
        : sort === 'author'
        ? a.author
        : a.title
      )?.toLowerCase() ?? '';
    const B =
      (sort === 'year'
        ? String(b.year ?? '')
        : sort === 'author'
        ? b.author
        : b.title
      )?.toLowerCase() ?? '';
    if (A < B) return order === 'asc' ? -1 : 1;
    if (A > B) return order === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <main className="space-y-8">
      <title>Catalogue</title>

      {/* Header */}
      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <h1 className="text-2xl font-semibold">Catalogue</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          Browse the library collection. Use title or author to narrow results.
          {sorted.length ? ` Showing ${sorted.length} item(s).` : ''}
        </p>
      </header>

      {/* Toolbar */}
      <section className="mx-auto max-w-6xl">
        <form
          action="/dashboard/book-list"
          method="get"
          className="grid gap-3 sm:grid-cols-[1fr,auto,auto,auto] items-center"
        >
          {/* Search */}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by title or author"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-swin-red/60"
          />

          {/* Status filter */}
          <select
            name="status"
            defaultValue={status || ''}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-swin-red/60"
          >
            <option value="">All items</option>
            <option value="available">Available</option>
            <option value="checked_out">Checked out</option>
            <option value="borrowed">Borrowed</option>
          </select>

          {/* Sort field */}
          <select
            name="sort"
            defaultValue={sort}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-swin-red/60"
          >
            <option value="title">Sort: Title</option>
            <option value="author">Sort: Author</option>
            <option value="year">Sort: Year</option>
          </select>

          {/* Order */}
          <select
            name="order"
            defaultValue={order}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-swin-red/60"
          >
            <option value="asc">A → Z</option>
            <option value="desc">Z → A</option>
          </select>

          {/* View toggle (optional) */}
          <input type="hidden" name="view" value={variant} />

          <div className="sm:col-span-4">
            <button
              type="submit"
              className="mt-2 rounded-xl bg-swin-charcoal px-4 py-2 text-sm font-medium text-swin-ivory shadow hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-swin-red/50 sm:mt-0"
            >
              Apply
            </button>
          </div>
        </form>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-6xl">
        <BookList books={sorted} variant={variant} />
      </section>
    </main>
  );
}
