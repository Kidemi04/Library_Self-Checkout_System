// app/dashboard/book-items/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { redirect } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import CreateBookForm from '@/app/ui/dashboard/createBookForm';
import BookCatalogTable, {
  type CatalogBook,
} from '@/app/ui/dashboard/bookCatalogTable';
import SearchForm from '@/app/ui/dashboard/searchForm';
import { fetchBooks } from '@/app/lib/supabase/queries';
import type { Book, CopyStatus } from '@/app/lib/supabase/types';
import DashboardTitleBar from '@/app/ui/dashboard/dashboardTitleBar';
import { getDashboardSession } from '@/app/lib/auth/session';
import type { ItemStatus } from '@/app/lib/supabase/updates';

const SIP_STATUS_PRIORITY: CopyStatus[] = [
  'on_loan',
  'available',
  'hold_shelf',
  'processing',
  'lost',
  'damaged',
];

function deriveSipStatus(copies: Book['copies']): CopyStatus | null {
  if (!copies.length) return null;
  for (const status of SIP_STATUS_PRIORITY) {
    if (copies.some((copy) => copy.status === status)) {
      return status;
    }
  }
  return copies[0]?.status ?? null;
}

function pick(v?: string | string[] | null) {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

export default async function BookListPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  noStore();

  // 2. Fetch the session/role directly inside the server component
  const { user } = await getDashboardSession();
  const userRole = user?.role; // Assuming session contains the role

  // Anti-bypass Mechanism
  // Should a user access this page by other means whilst in student status (such as manual input), 
  // they shall be redirected to the book items page.  
  const isPrivileged = userRole === 'admin' || userRole === 'staff';
  if (!isPrivileged) {
    redirect('/dashboard/book/items');
  }

  // Read search (optional)
  const params =
    (searchParams ? await searchParams : {}) as Record<string, string | string[] | undefined>;
  const q = pick(params?.q).trim();

  // 1) Fetch from Supabase (server)
  const dbBooks = await fetchBooks(q || undefined);

  // 2) Normalize DB rows to CatalogBook expected by the table
  const allowed = new Set<ItemStatus>([
    'available',
    'checked out',
    'borrowed',
    'reserved',
    'on_hold',
    'in transit',
    'in_process',
    'lost',
    'missing',
    'maintenance',
  ]);

  const uiBooks: CatalogBook[] = (dbBooks ?? []).map((book) => {
    const status: ItemStatus =
      book.availableCopies > 0 ? 'available' : 'checked out';

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
      sip_status: deriveSipStatus(book.copies),
    };
  });

  return (
    <main className="space-y-8">
      <title>Book Items | Dashboard</title>

      {/* Header */}
      <DashboardTitleBar
        subtitle="Book Lists"
        title="Manage Book Lists"
        description="Keep the Supabase-powered catalogue of Swinburne resources up to date."
      />

      {/* Search */}
      <SearchForm
        defaultValue={q}
        aria-label="Search books"
        extraParams={{ section: 'list' }}
      />

      {/* Create new item */}
      <CreateBookForm />

      {/* Editable table (Manage / Delete handled inside the component) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-display-md text-ink dark:text-on-dark">Catalogue</h2>
          <p className="font-sans text-body-sm text-muted dark:text-on-dark-soft">Showing {uiBooks.length} records</p>
        </div>
        <BookCatalogTable books={uiBooks} />
      </section>
    </main>
  );
}
