import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import type { DashboardRole } from '@/app/lib/auth/types';
import type { Book, Copy, DashboardSummary, Loan, LoanStatus } from '@/app/lib/supabase/types';

const sanitizeSearchTerm = (value?: string): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

const escapeForIlike = (value: string): string =>
  value.replace(/[%_]/g, (match) => `\\${match}`).replace(/'/g, "''");

const toDashboardRole = (value: unknown): DashboardRole | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'admin') return 'admin';
  if (normalized === 'staff' || normalized === 'librarian') return 'staff';
  return 'user';
};

const normalizeCopyStatus = (value: unknown): Copy['status'] => {
  if (typeof value !== 'string') return 'available';
  switch (value.trim().toUpperCase()) {
    case 'ON_LOAN':
      return 'on_loan';
    case 'LOST':
      return 'lost';
    case 'DAMAGED':
      return 'damaged';
    case 'PROCESSING':
      return 'processing';
    case 'HOLD_SHELF':
      return 'hold_shelf';
    case 'AVAILABLE':
    default:
      return 'available';
  }
};

const deriveLoanStatus = (dueAt: string, returnedAt: string | null): LoanStatus => {
  if (returnedAt) return 'returned';
  const due = new Date(dueAt);
  if (!Number.isNaN(due.valueOf()) && due.getTime() < Date.now()) {
    return 'overdue';
  }
  return 'borrowed';
};

const isCopyAvailable = (copy: Copy): boolean => {
  if (!copy) return false;
  if (copy.status !== 'available') return false;
  return !(copy.loans ?? []).some((loan) => loan.returnedAt == null);
};

type RawCopyLoanRow = {
  id: string;
  returned_at: string | null;
};

type RawCopyRow = {
  id: string;
  book_id: string;
  barcode: string;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  loans?: RawCopyLoanRow[] | null;
};

type RawBookRow = {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  classification: string | null;
  publisher: string | null;
  publication_year: string | null;
  cover_image_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  copies: RawCopyRow[] | null;
  book_tag_links:
    | Array<{
        tag: { name: string | null } | null;
      }>
    | null;
};

type RawLoanRow = {
  id: string;
  copy_id: string;
  user_id: string | null;
  borrowed_at: string;
  due_at: string;
  returned_at: string | null;
  renewed_count: number | null;
  handled_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  copy?: {
    id: string;
    barcode: string | null;
    book?: {
      id: string;
      title: string;
      author: string | null;
      isbn: string | null;
    } | null;
  } | null;
  borrower?: {
    id: string;
    email: string | null;
    role: string | null;
    profile?: {
      display_name: string | null;
      student_id: string | null;
    } | null;
  } | null;
  handler?: {
    id: string;
    email: string | null;
    role: string | null;
    profile?: {
      display_name: string | null;
    } | null;
  } | null;
};

const mapCopyRow = (row: RawCopyRow): Copy => ({
  id: row.id,
  bookId: row.book_id,
  barcode: row.barcode,
  status: normalizeCopyStatus(row.status),
  loans: (row.loans ?? []).map((loan) => ({
    id: loan.id,
    returnedAt: loan.returned_at ?? null,
  })),
  createdAt: row.created_at ?? null,
  updatedAt: row.updated_at ?? null,
});

const mapBookRow = (row: RawBookRow): Book => {
  const copies = (row.copies ?? []).map(mapCopyRow);
  const availableCopies = copies.filter(isCopyAvailable).length;
  const tags = (row.book_tag_links ?? [])
    .map((link) => link?.tag?.name)
    .filter((name): name is string => typeof name === 'string' && name.length > 0);

  return {
    id: row.id,
    title: row.title,
    author: row.author ?? null,
    isbn: row.isbn ?? null,
    classification: row.classification ?? null,
    coverImageUrl: row.cover_image_url ?? null,
    publisher: row.publisher ?? null,
    publicationYear: row.publication_year ?? null,
    tags,
    copies,
    totalCopies: copies.length,
    availableCopies,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
};

const mapLoanRow = (row: RawLoanRow): Loan => {
  const borrowerProfile = row.borrower?.profile ?? null;
  const handlerProfile = row.handler?.profile ?? null;
  const bookSource = row.copy?.book ?? null;

  return {
    id: row.id,
    copyId: row.copy_id,
    bookId: bookSource?.id ?? null,
    borrowerId: row.user_id,
    borrowerName: borrowerProfile?.display_name ?? row.borrower?.email ?? null,
    borrowerEmail: row.borrower?.email ?? null,
    borrowerIdentifier: borrowerProfile?.student_id ?? row.borrower?.email ?? null,
    borrowerRole: toDashboardRole(row.borrower?.role ?? null),
    handledBy: row.handled_by ?? null,
    status: deriveLoanStatus(row.due_at, row.returned_at),
    borrowedAt: row.borrowed_at,
    dueAt: row.due_at,
    returnedAt: row.returned_at ?? null,
    renewedCount: row.renewed_count ?? 0,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    copy: row.copy
      ? {
          id: row.copy.id,
          barcode: row.copy.barcode ?? null,
        }
      : null,
    book: bookSource
      ? {
          id: bookSource.id,
          title: bookSource.title,
          author: bookSource.author ?? null,
          isbn: bookSource.isbn ?? null,
        }
      : null,
    handler: row.handler
      ? {
          id: row.handler.id,
          name: handlerProfile?.display_name ?? row.handler.email ?? null,
          email: row.handler.email ?? null,
        }
      : null,
  };
};

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const supabase = getSupabaseServerClient();
  const nowIso = new Date().toISOString();

  const [totalBooks, activeLoans, overdueLoans, copies] = await Promise.all([
    supabase.from('books').select('id', { head: true, count: 'exact' }),
    supabase.from('loans').select('id', { head: true, count: 'exact' }).is('returned_at', null),
    supabase
      .from('loans')
      .select('id', { head: true, count: 'exact' })
      .is('returned_at', null)
      .lt('due_at', nowIso),
    supabase
      .from('copies')
      .select(
        `
          book_id,
          status,
          loans:loans(
            id,
            returned_at
          )
        `,
      ),
  ]);

  if (totalBooks.error) throw totalBooks.error;
  if (activeLoans.error) throw activeLoans.error;
  if (overdueLoans.error) throw overdueLoans.error;
  if (copies.error) throw copies.error;

  type CopySummaryRow = {
    book_id: string;
    status: string | null;
    loans: RawCopyLoanRow[] | null;
  };

  const availableBookIds = new Set<string>();
  for (const copy of (copies.data ?? []) as CopySummaryRow[]) {
    const status = normalizeCopyStatus(copy.status);
    if (status !== 'available') continue;

    const hasActiveLoan = (copy.loans ?? []).some((loan) => loan.returned_at == null);
    if (!hasActiveLoan && copy.book_id) {
      availableBookIds.add(copy.book_id);
    }
  }

  return {
    totalBooks: totalBooks.count ?? 0,
    availableBooks: availableBookIds.size,
    activeLoans: activeLoans.count ?? 0,
    overdueLoans: overdueLoans.count ?? 0,
  };
}

export async function fetchRecentLoans(limit = 6): Promise<Loan[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from('loans')
    .select(
      `
        id,
        copy_id,
        user_id,
        borrowed_at,
        due_at,
        returned_at,
        renewed_count,
        handled_by,
        created_at,
        updated_at,
        copy:copies(
          id,
          barcode,
          book:books(
            id,
            title,
            author,
            isbn
          )
        ),
        borrower:users!loans_user_id_fkey(
          id,
          email,
          role,
          profile:user_profiles(
            display_name,
            student_id
          )
        ),
        handler:users!loans_handled_by_fkey(
          id,
          email,
          role,
          profile:user_profiles(
            display_name
          )
        )
      `,
    )
    .order('borrowed_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const rawRows = ((data ?? []) as unknown) as RawLoanRow[];
  return rawRows.map(mapLoanRow);
}

export async function fetchActiveLoans(searchTerm?: string): Promise<Loan[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from('loans')
    .select(
      `
        id,
        copy_id,
        user_id,
        borrowed_at,
        due_at,
        returned_at,
        renewed_count,
        handled_by,
        created_at,
        updated_at,
        copy:copies(
          id,
          barcode,
          book:books(
            id,
            title,
            author,
            isbn
          )
        ),
        borrower:users!loans_user_id_fkey(
          id,
          email,
          role,
          profile:user_profiles(
            display_name,
            student_id
          )
        ),
        handler:users!loans_handled_by_fkey(
          id,
          email,
          role,
          profile:user_profiles(
            display_name
          )
        )
      `,
    )
    .is('returned_at', null)
    .order('borrowed_at', { ascending: false });

  if (error) throw error;

  const loans = (((data ?? []) as unknown) as RawLoanRow[]).map(mapLoanRow);
  const sanitized = sanitizeSearchTerm(searchTerm);

  if (!sanitized) return loans;

  const lowered = sanitized.toLowerCase();

  return loans.filter((loan) => {
    const fields = [
      loan.borrowerName,
      loan.borrowerIdentifier,
      loan.copy?.barcode ?? null,
      loan.book?.title ?? null,
      loan.book?.isbn ?? null,
    ];

    return fields.some((field) => field?.toLowerCase().includes(lowered));
  });
}

export async function fetchBooks(searchTerm?: string): Promise<Book[]> {
  const supabase = getSupabaseServerClient();
  const sanitized = sanitizeSearchTerm(searchTerm);

  let query = supabase
    .from('books')
    .select(
      `
        id,
        title,
        author,
        isbn,
        classification,
        publisher,
        publication_year,
        cover_image_url,
        created_at,
        updated_at,
        copies:copies(
          id,
          book_id,
          barcode,
          status,
          created_at,
          updated_at,
          loans:loans(
            id,
            returned_at
          )
        ),
        book_tag_links:book_tag_links(
          tag:book_tags(
            name
          )
        )
      `,
    )
    .order('title')
    .limit(200);

  if (sanitized) {
    const pattern = `%${escapeForIlike(sanitized)}%`;
    query = query.or(
      [
        `title.ilike.${pattern}`,
        `author.ilike.${pattern}`,
        `isbn.ilike.${pattern}`,
        `classification.ilike.${pattern}`,
        `publisher.ilike.${pattern}`,
      ].join(','),
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  const mapped = (((data ?? []) as unknown) as RawBookRow[]).map(mapBookRow);

  if (!sanitized) {
    return mapped;
  }

  const lowered = sanitized.toLowerCase();

  return mapped.filter((book) => {
    const matchesBook =
      (book.title?.toLowerCase().includes(lowered) ?? false) ||
      (book.author?.toLowerCase().includes(lowered) ?? false) ||
      (book.isbn?.toLowerCase().includes(lowered) ?? false) ||
      (book.classification?.toLowerCase().includes(lowered) ?? false) ||
      (book.publisher?.toLowerCase().includes(lowered) ?? false);

    if (matchesBook) return true;

    return book.copies.some((copy) => copy.barcode.toLowerCase().includes(lowered));
  });
}

export async function fetchAvailableBooks(searchTerm?: string): Promise<Book[]> {
  const books = await fetchBooks(searchTerm);
  return books.filter((book) => book.availableCopies > 0);
}
