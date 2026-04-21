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
  switch (value.trim().toLowerCase()) {
    case 'on_loan':
      return 'on_loan';
    case 'lost':
      return 'lost';
    case 'damaged':
      return 'damaged';
    case 'processing':
      return 'processing';
    case 'hold_shelf':
      return 'hold_shelf';
    case 'avaliable':
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
  category: string | null;
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
    category: row.category ?? null,
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
    supabase.from('Books').select('id', { head: true, count: 'exact' }),
    supabase.from('Loans').select('id', { head: true, count: 'exact' }).is('returned_at', null),
    supabase
      .from('Loans')
      .select('id', { head: true, count: 'exact' })
      .is('returned_at', null)
      .lt('due_at', nowIso),
    supabase
      .from('Copies')
      .select(
        `
          book_id,
          status,
          loans:Loans(
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
    .from('Loans')
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
        copy:Copies(
          id,
          barcode,
          book:Books(
            id,
            title,
            author,
            isbn
          )
        ),
        borrower:Users!Loans_user_id_fkey(
          id,
          email,
          role,
          profile:UserProfile(
            display_name,
            student_id
          )
        ),
        handler:Users!Loans_handled_by_fkey(
          id,
          email,
          role,
          profile:UserProfile(
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

export async function fetchActiveLoans(searchTerm?: string, userId?: string): Promise<Loan[]> {
  const supabase = getSupabaseServerClient();

  let query = supabase
    .from('Loans')
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
        copy:Copies(
          id,
          barcode,
          book:Books(
            id,
            title,
            author,
            isbn
          )
        ),
        borrower:Users!Loans_user_id_fkey(
          id,
          email,
          role,
          profile:UserProfile(
            display_name,
            student_id
          )
        ),
        handler:Users!Loans_handled_by_fkey(
          id,
          email,
          role,
          profile:UserProfile(
            display_name
          )
        )
      `,
    )
    .is('returned_at', null)
    .order('borrowed_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

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
    .from('Books')
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
        category,
        created_at,
        updated_at,
         copies:Copies(
          id,
          book_id,
          barcode,
          status,
          created_at,
          updated_at,
          loans:Loans(
            id,
            returned_at
          )
        ),
        book_tag_links:BookTagsLinks(
          tag:BookTags(
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


// ------------------- HOLDS (STAFF VIEW) -------------------

export type HoldStatus =
  | 'queued'
  | 'ready'
  | 'fulfilled'
  | 'expired'
  | 'canceled';

type RawHoldRow = {
  id: string;
  patron_id: string;
  book_id: string;
  status: HoldStatus;
  placed_at: string | null;
  ready_at: string | null;
  expires_at: string | null;
};

export type PatronHold = {
  id: string;
  bookId: string;
  patronId: string;
  status: HoldStatus;
  placedAt: string | null;
  readyAt: string | null;
  expiresAt: string | null;
  title: string;
  author: string | null;
  isbn: string | null;
  coverImage: string | null;
};

/**
 * Basic fetch for holds table for staff/admin pages.
 * (You can later extend this to join books/users if you want.)
 */
export async function fetchHoldsForStaff() {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from('Holds')
    .select(
      `
      id,
      patron_id,
      book_id,
      status,
      placed_at,
      ready_at,
      expires_at,
      book:Books (
        title,
        cover_image_url
      ),
      patron:Users (
        email,
        profile:UserProfile (
          display_name
        )
      )
      `
    )
    .order('placed_at', { ascending: true });

  if (error) throw error;

  return data.map((h: any) => ({
    id: h.id,
    patron_id: h.patron_id,
    book_id: h.book_id,
    status: h.status,
    placed_at: h.placed_at,
    ready_at: h.ready_at,
    expires_at: h.expires_at,
    book_title: h.book?.title ?? 'Unknown title',
    book_cover: h.book?.cover_image_url ?? null,
    patron_name:
      h.patron?.profile?.display_name ??
      h.patron?.email ??
      'Unknown patron',
  }));
}


/**
 * Small helper for updating a single hold's status / timestamps.
 */
export async function updateHoldStatus(
  holdId: string,
  fields: {
    status?: HoldStatus;
    ready_at?: string | null;
    expires_at?: string | null;
    fulfilled_by_copy_id?: string | null;
  },
) {
  const supabase = getSupabaseServerClient();

  const { error } = await supabase
    .from('Holds')
    .update(fields)
    .eq('id', holdId);

  if (error) throw error;
}

/**
 * Returns active holds (queued or ready) for the signed-in patron.
 */
export async function fetchActiveHoldsForPatron(patronId: string): Promise<PatronHold[]> {
  if (!patronId) return [];

  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from('Holds')
    .select(
      `
      id,
      patron_id,
      book_id,
      status,
      placed_at,
      ready_at,
      expires_at,
      book:Books (
        title,
        author,
        isbn,
        cover_image_url
      )
      `,
    )
    .eq('patron_id', patronId)
    .in('status', ['queued', 'ready'])
    .order('placed_at', { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .map((row: any) => ({
      id: row.id,
      bookId: row.book_id,
      patronId: row.patron_id,
      status: row.status as HoldStatus,
      placedAt: row.placed_at,
      readyAt: row.ready_at,
      expiresAt: row.expires_at,
      title: row.book?.title ?? 'Untitled',
      author: row.book?.author ?? null,
      isbn: row.book?.isbn ?? null,
      coverImage: row.book?.cover_image_url ?? null,
    }))
    .sort((a, b) => {
      if (a.status === 'ready' && b.status !== 'ready') return -1;
      if (b.status === 'ready' && a.status !== 'ready') return 1;
      const aTime = a.placedAt ? new Date(a.placedAt).getTime() : 0;
      const bTime = b.placedAt ? new Date(b.placedAt).getTime() : 0;
      return aTime - bTime;
    });
}

// ------------------- BORROWING HISTORY (STUDENT VIEW) -------------------

export type TimePeriod = 'all' | '30d' | '6m' | 'semester';

export interface BorrowingHistoryLoan {
  id: string;
  borrowedAt: string;
  returnedAt: string;
  dueAt: string;
  renewedCount: number;
  loanDurationDays: number;
  book: {
    id: string;
    title: string;
    author: string | null;
    isbn: string | null;
    coverImageUrl: string | null;
  };
}

export interface BorrowingStats {
  totalBorrowed: number;
  thisYearCount: number;
  avgLoanDays: number;
}

const getSemesterStart = (): Date => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return month < 6 ? new Date(year, 0, 1) : new Date(year, 6, 1);
};

const getPeriodCutoff = (period: TimePeriod): Date | null => {
  if (period === 'all') return null;
  if (period === 'semester') return getSemesterStart();
  const now = new Date();
  if (period === '30d') {
    now.setDate(now.getDate() - 30);
    return now;
  }
  // 6m
  now.setMonth(now.getMonth() - 6);
  return now;
};

type RawHistoryRow = {
  id: string;
  borrowed_at: string;
  returned_at: string;
  due_at: string;
  renewed_count: number | null;
  copy?: {
    id: string;
    book?: {
      id: string;
      title: string;
      author: string | null;
      isbn: string | null;
      cover_image_url: string | null;
    } | null;
  } | null;
};

export async function fetchBorrowingHistory(
  userId: string,
  searchTerm?: string,
  period?: TimePeriod,
): Promise<BorrowingHistoryLoan[]> {
  const supabase = getSupabaseServerClient();

  let query = supabase
    .from('Loans')
    .select(
      `
        id,
        borrowed_at,
        due_at,
        returned_at,
        renewed_count,
        copy:Copies(
          id,
          book:Books(
            id,
            title,
            author,
            isbn,
            cover_image_url
          )
        )
      `,
    )
    .not('returned_at', 'is', null)
    .eq('user_id', userId)
    .order('returned_at', { ascending: false });

  const cutoff = getPeriodCutoff(period ?? 'all');
  if (cutoff) {
    query = query.gte('borrowed_at', cutoff.toISOString());
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = ((data ?? []) as unknown) as RawHistoryRow[];

  const mapped = rows
    .filter((row) => row.copy?.book != null)
    .map((row) => {
      const book = row.copy!.book!;
      const borrowed = new Date(row.borrowed_at);
      const returned = new Date(row.returned_at);
      const diffMs = returned.getTime() - borrowed.getTime();
      const loanDurationDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

      return {
        id: row.id,
        borrowedAt: row.borrowed_at,
        returnedAt: row.returned_at,
        dueAt: row.due_at,
        renewedCount: row.renewed_count ?? 0,
        loanDurationDays,
        book: {
          id: book.id,
          title: book.title,
          author: book.author ?? null,
          isbn: book.isbn ?? null,
          coverImageUrl: book.cover_image_url ?? null,
        },
      };
    });

  const sanitized = sanitizeSearchTerm(searchTerm);
  if (!sanitized) return mapped;

  const lowered = sanitized.toLowerCase();
  return mapped.filter((loan) => {
    return (
      loan.book.title.toLowerCase().includes(lowered) ||
      (loan.book.author?.toLowerCase().includes(lowered) ?? false)
    );
  });
}

export async function fetchBorrowingStats(userId: string): Promise<BorrowingStats> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from('Loans')
    .select('borrowed_at, returned_at')
    .not('returned_at', 'is', null)
    .eq('user_id', userId);

  if (error) throw error;

  const rows = (data ?? []) as Array<{ borrowed_at: string; returned_at: string }>;
  const currentYear = new Date().getFullYear();

  let totalDays = 0;
  let thisYearCount = 0;

  for (const row of rows) {
    const borrowed = new Date(row.borrowed_at);
    const returned = new Date(row.returned_at);
    totalDays += Math.max(1, Math.round((returned.getTime() - borrowed.getTime()) / (1000 * 60 * 60 * 24)));
    if (borrowed.getFullYear() === currentYear) {
      thisYearCount++;
    }
  }

  return {
    totalBorrowed: rows.length,
    thisYearCount,
    avgLoanDays: rows.length > 0 ? Math.round(totalDays / rows.length) : 0,
  };
}

export async function fetchLoanHistory(userId: string, limit?: number): Promise<BorrowingHistoryLoan[]> {
  const history = await fetchBorrowingHistory(userId);
  return limit ? history.slice(0, limit) : history;
}

export async function fetchHoldsForBook(bookId: string): Promise<number> {
  const supabase = getSupabaseServerClient();

  const { count, error } = await supabase
    .from('Holds')
    .select('id', { count: 'exact', head: true })
    .eq('book_id', bookId)
    .in('status', ['queued', 'ready']);

  if (error) throw error;
  return count ?? 0;
}

export async function cancelHoldForPatron(holdId: string, patronId: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from('Holds')
    .update({
      status: 'canceled',
      ready_at: null,
      expires_at: null,
      fulfilled_by_copy_id: null,
    })
    .eq('id', holdId)
    .eq('patron_id', patronId)
    .in('status', ['queued', 'ready'])
    .select('id');

  if (error) throw error;

  return Array.isArray(data) && data.length > 0;
}
