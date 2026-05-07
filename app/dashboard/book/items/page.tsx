import { redirect } from 'next/navigation';
import Link from 'next/link';
import BookList from '@/app/ui/dashboard/bookList';
import BookItemsFilter from '@/app/ui/dashboard/bookItemsFilter';
import { CATEGORY_OPTIONS, type CategoryKey } from '@/app/ui/dashboard/bookCategories';
import { fetchBooks } from '@/app/lib/supabase/queries';
import { getDashboardSession } from '@/app/lib/auth/session';
import { QrCodeIcon } from '@heroicons/react/24/outline';

export type ItemStatus =
  | 'available'
  | 'checked_out'
  | 'on_hold'
  | 'reserved'
  | 'maintenance';

type ViewMode = 'grid' | 'list';
type SortField = 'title' | 'author' | 'year' | 'created_at';
type SortOrder = 'asc' | 'desc';

function isItemStatus(x: unknown): x is ItemStatus {
  return (
    x === 'available' ||
    x === 'checked_out' ||
    x === 'on_hold' ||
    x === 'reserved' ||
    x === 'maintenance'
  );
}

const CATEGORY_KEYS = new Set(CATEGORY_OPTIONS.map((c) => c.key));
const isCategoryKey = (x: unknown): x is CategoryKey =>
  typeof x === 'string' && CATEGORY_KEYS.has(x as CategoryKey);

function toUIBook(db: any) {
  const available = db.availableCopies ?? db.available_copies ?? 0;
  const total = db.totalCopies ?? db.total_copies ?? db.copies?.length ?? 0;
  const onLoan = (db.copies ?? []).filter((c: any) => c.status === 'on_loan').length;
  const derivedStatus: ItemStatus =
    available > 0 ? 'available' : onLoan > 0 ? 'checked_out' : 'maintenance';

  return {
    id: db.id,
    title: db.title ?? 'Untitled',
    author: db.author ?? 'Unknown',
    cover: db.coverImageUrl ?? db.cover_image_url ?? null,
    tags: db.tags ?? null,
    category: db.category ?? null,
    classification: db.classification ?? null,
    isbn: db.isbn ?? null,
    year: db.publicationYear ?? db.publication_year ?? db.year ?? null,
    publisher: db.publisher ?? null,
    status: isItemStatus(db.status) ? (db.status as ItemStatus) : derivedStatus,
    copies_available: available,
    total_copies: total,
    copies_on_loan: onLoan,
  };
}

export default async function BookItemsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const { user } = await getDashboardSession();
  if (!user) redirect('/login');
  const patronId = user.id;

  const params = searchParams ? await searchParams : undefined;

  const qp = (key: string) => {
    const v = params?.[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const q = (qp('q') ?? '').trim();
  const rawStatus = (qp('status') ?? '').trim();
  const statusFilter: ItemStatus | undefined = isItemStatus(rawStatus) ? rawStatus : undefined;
  const sort = (qp('sort') as SortField) || 'title';
  const order: SortOrder = (qp('order') as SortOrder) === 'desc' ? 'desc' : 'asc';
  const view: ViewMode = (qp('view') as ViewMode) === 'list' ? 'list' : 'grid';
  const rawCategory = qp('category');
  const category: CategoryKey = isCategoryKey(rawCategory) ? rawCategory : 'all';

  const dbBooks = await fetchBooks(q);
  let books = (dbBooks ?? []).map(toUIBook);

  if (statusFilter) {
    books = books.filter((b) => b.status === statusFilter);
  }

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

  const isStaff = user.role !== 'user';
  const availableCount = books.filter((b) => (b.copies_available ?? 0) > 0).length;

  return (
    <>
      <title>Book Catalogue | Dashboard</title>

      <div className="flex flex-col gap-6">
        {/* ── Editorial header ── */}
        <header className="rounded-card bg-surface-card px-5 py-5 dark:bg-dark-surface-card sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-1 font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">
                Library · Catalogue
              </p>
              <h1 className="font-display text-display-sm tracking-tight text-ink dark:text-on-dark">
                Browse Books
              </h1>
              <p className="mt-1 hidden font-sans text-body-sm text-body dark:text-on-dark-soft sm:block">
                Browse and reserve titles from the collection.
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-code text-muted-soft dark:text-on-dark-soft">
                <span>{books.length} title{books.length !== 1 ? 's' : ''}</span>
                {availableCount > 0 && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="text-success">{availableCount} available now</span>
                  </>
                )}
              </div>
            </div>
            <Link
              href="/dashboard/book/checkout"
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-btn bg-primary px-3.5 py-2.5 font-sans text-button text-on-primary transition hover:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
            >
              <QrCodeIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Scan to borrow</span>
              <span className="sm:hidden">Scan</span>
            </Link>
          </div>
        </header>

        {/* ── Filter bar ── */}
        <BookItemsFilter
          action="/dashboard/book/items"
          defaults={{
            q,
            status: statusFilter,
            sort,
            order,
            view,
            category,
          }}
        />

        {/* ── Result count ── */}
        {q && (
          <p className="-mt-2 font-mono text-code text-muted-soft dark:text-on-dark-soft">
            {books.length === 0
              ? `No results for "${q}"`
              : `${books.length} result${books.length === 1 ? '' : 's'} for "${q}"`}
          </p>
        )}

        {/* ── Book list ── */}
        <BookList
          books={books}
          variant={view}
          patronId={patronId}
          isStaff={isStaff}
          category={category}
          searchQuery={q}
        />
      </div>
    </>
  );
}
