// app/dashboard/book-items/page.tsx
import { redirect } from 'next/navigation';
import BookList from '@/app/ui/dashboard/book-list'; // student-facing renderer (grid/list)
import BookItemsFilter from '@/app/ui/dashboard/book-items-filter';
import AiModeHero from '@/app/ui/dashboard/ai-mode-hero';
import { fetchBooks } from '@/app/lib/supabase/queries';
import { getDashboardSession } from '@/app/lib/auth/session';

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
  // 🔹 Get logged-in user from your NextAuth-based session
  const { user } = await getDashboardSession();
  if (!user) {
    redirect('/login');
  }
  const patronId = user.id;

  const params = searchParams ? await searchParams : undefined;

  // ----- read and sanitize query params -----
  const qp = (key: string) => {
    const v = params?.[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const q = (qp('q') ?? '').trim();

  const rawStatus = (qp('status') ?? '').trim();
  // ✅ Narrow the string to ItemStatus | undefined
  const statusFilter: ItemStatus | undefined = isItemStatus(rawStatus)
    ? rawStatus
    : undefined;

  const sort = (qp('sort') as SortField) || 'title';
  const order: SortOrder = (qp('order') as SortOrder) === 'desc' ? 'desc' : 'asc';
  const view: ViewMode = (qp('view') as ViewMode) === 'list' ? 'list' : 'grid';

  // ----- fetch from Supabase -----
  const dbBooks = await fetchBooks(q);
  let books = (dbBooks ?? []).map(toUIBook);

  // ----- apply status filter -----
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

      <AiModeHero defaultQuery={q} />

      {/* ✅ This form stays on /dashboard/book-items and submits via GET */}
      <BookItemsFilter
        action="/dashboard/book-items"
        defaults={{
          q,
          status: statusFilter, // ItemStatus | undefined
          sort,
          order,
          view,
        }}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-swin-charcoal dark:text-white">Catalogue</h2>
          <p className="text-sm text-swin-charcoal/60 dark:text-slate-300">
            Showing {books.length} record{books.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Student-friendly list/grid view */}
        <BookList
          books={books}
          variant={view}
          patronId={patronId} // used by PlaceHoldButton
        />
      </section>
    </main>
  );
}
