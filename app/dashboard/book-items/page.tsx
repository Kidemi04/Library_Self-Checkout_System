// app/dashboard/book-items/page.tsx
import BookList from '@/app/ui/dashboard/book-list'; // student-facing renderer (grid/list)
import BookItemsFilter from '@/app/ui/dashboard/book-items-filter';
import { fetchBooks } from '@/app/lib/supabase/queries';

// Keep this in sync with your Supabase enum and the BookList component
export type ItemStatus =
  | 'available'
  | 'checked_out'
  | 'on_hold'
  | 'reserved'
  | 'maintenance';

type ViewMode = 'grid' | 'list';
type SortField = 'title' | 'author' | 'year' | 'created_at';
type SortOrder = 'asc' | 'desc';

// A runtime type guard so TS safely narrows a string into ItemStatus
function isItemStatus(x: unknown): x is ItemStatus {
  return (
    x === 'available' ||
    x === 'checked_out' ||
    x === 'on_hold' ||
    x === 'reserved' ||
    x === 'maintenance'
  );
}

// Map DB rows -> UI books consumed by <BookList/>
function toUIBook(db: any) {
  const available = db.availableCopies ?? db.available_copies ?? 0;
  const total = db.totalCopies ?? db.total_copies ?? db.copies?.length ?? 0;
  const derivedStatus: ItemStatus = available > 0 ? 'available' : 'checked_out';

  return {
    id: db.id,
    title: db.title ?? 'Untitled',
    author: db.author ?? 'Unknown',
    cover: db.coverImageUrl ?? db.cover_image_url ?? null,
    tags: db.tags ?? null,
    classification: db.classification ?? null,
    location: db.location ?? null,
    isbn: db.isbn ?? null,
    year: db.publicationYear ?? db.publication_year ?? db.year ?? null,
    publisher: db.publisher ?? null,
    status: isItemStatus(db.status) ? (db.status as ItemStatus) : derivedStatus,
    copies_available: available,
    total_copies: total,
  };
}

export default async function BookItemsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const params = searchParams ? await searchParams : undefined;

  // ----- read and sanitize query params -----
  const qp = (key: string) => {
    const v = params?.[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const q = (qp('q') ?? '').trim();

  const rawStatus = (qp('status') ?? '').trim();
  // ✅ Narrow the string to ItemStatus | undefined
  const statusFilter: ItemStatus | undefined = isItemStatus(rawStatus) ? rawStatus : undefined;

  const sort = (qp('sort') as SortField) || 'title';
  const order = (qp('order') as SortOrder) === 'desc' ? 'desc' : 'asc';
  const view = (qp('view') as ViewMode) === 'list' ? 'list' : 'grid';

  // ----- fetch from Supabase (title/author/isbn/barcode search is handled in fetchBooks) -----
  const dbBooks = await fetchBooks(q);
  let books = (dbBooks ?? []).map(toUIBook);

  // ----- apply status filter (server component side) -----
  if (statusFilter) {
    books = books.filter((b) => b.status === statusFilter);
  }

  // ----- apply sorting -----
  const cmp = (a: any, b: any) => {
    const A = (a ?? '').toString().toLowerCase();
    const B = (b ?? '').toString().toLowerCase();
    if (A < B) return order === 'asc' ? -1 : 1;
    if (A > B) return order === 'asc' ? 1 : -1;
    return 0;
  };

  books.sort((a, b) => {
    if (sort === 'title') return cmp(a.title, b.title);
    if (sort === 'author') return cmp(a.author, b.author);
    if (sort === 'year') return cmp(a.year, b.year);
    if (sort === 'created_at') return cmp((a as any).created_at, (b as any).created_at);
    return 0;
  });

  return (
    <main className="space-y-8">
      <title>Book Items | Dashboard</title>

      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <h1 className="text-2xl font-semibold">Book Items</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          Browse the catalogue and filter by status. Use title or author to narrow results.
        </p>
      </header>

      {/* ✅ This form stays on /dashboard/book-items and submits via GET */}
      <BookItemsFilter
        action="/dashboard/book-items"
        defaults={{
          q,
          status: statusFilter, // <-- correctly typed (ItemStatus | undefined)
          sort,
          order,
          view,
        }}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-swin-charcoal">Catalogue</h2>
          <p className="text-sm text-swin-charcoal/60">
            Showing {books.length} record{books.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Student-friendly list/grid view (reuses your existing component) */}
        <BookList
          books={books}
          variant={view}
          // Optional actions for student page can be passed here if needed:
          // onDetailsClick={(b) => {/* open a read-only details modal */}}
          // onBorrowClick={(b) => {/* start borrow flow */}}
        />
      </section>
    </main>
  );
}
