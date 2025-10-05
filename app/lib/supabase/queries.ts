import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import type { Book, DashboardSummary, Loan } from '@/app/lib/supabase/types';

const buildSearchFragments = (searchTerm?: string) => {
  if (!searchTerm) return null;
  const sanitized = searchTerm.trim().replace(/'/g, '');
  const pattern = `%${sanitized}%`;
  const bookFragment = `title.ilike.${pattern},author.ilike.${pattern},isbn.ilike.${pattern},barcode.ilike.${pattern}`;

  return {
    bookFragment,
    sanitized,
  };
};

const normalizeLoanRecord = (loan: any) => ({
  ...loan,
  book: Array.isArray(loan.book) ? loan.book[0] ?? null : loan.book ?? null,
});

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const supabase = getSupabaseServerClient();
  const nowIso = new Date().toISOString();

  const [total, available, active, overdue] = await Promise.all([
    supabase.from('books').select('*', { head: true, count: 'exact' }),
    supabase
      .from('books')
      .select('*', { head: true, count: 'exact' })
      .gte('available_copies', 1),
    supabase
      .from('loans')
      .select('*', { head: true, count: 'exact' })
      .eq('status', 'borrowed'),
    supabase
      .from('loans')
      .select('*', { head: true, count: 'exact' })
      .eq('status', 'borrowed')
      .lt('due_at', nowIso),
  ]);

  if (total.error) throw total.error;
  if (available.error) throw available.error;
  if (active.error) throw active.error;
  if (overdue.error) throw overdue.error;

  return {
    totalBooks: total.count ?? 0,
    availableBooks: available.count ?? 0,
    activeLoans: active.count ?? 0,
    overdueLoans: overdue.count ?? 0,
  };
}

export async function fetchRecentLoans(limit = 6): Promise<Loan[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from('loans')
    .select(
      `
        id,
        book_id,
        borrower_identifier,
        borrower_name,
        borrower_type,
        status,
        borrowed_at,
        due_at,
        returned_at,
        created_at,
        updated_at,
        book:books(title, barcode, isbn)
      `
    )
    .order('borrowed_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map(normalizeLoanRecord) as Loan[];
}

export async function fetchActiveLoans(searchTerm?: string): Promise<Loan[]> {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from('loans')
    .select(
      `
        id,
        book_id,
        borrower_identifier,
        borrower_name,
        borrower_type,
        status,
        borrowed_at,
        due_at,
        returned_at,
        created_at,
        updated_at,
        book:books(title, barcode, isbn)
      `
    )
    .eq('status', 'borrowed')
    .order('borrowed_at', { ascending: false });

  const search = buildSearchFragments(searchTerm);
  if (search) {
    query = query.or(
      `borrower_name.ilike.%${search.sanitized}%,borrower_identifier.ilike.%${search.sanitized}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map(normalizeLoanRecord) as Loan[];
}

export async function fetchAvailableBooks(searchTerm?: string): Promise<Book[]> {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from('books')
    .select(
      `
        id,
        title,
        author,
        isbn,
        barcode,
        classification,
        total_copies,
        available_copies,
        status,
        location,
        cover_image_url,
        last_transaction_at
      `
    )
    .gte('available_copies', 1)
    .order('title');

  const search = buildSearchFragments(searchTerm);
  if (search) {
    query = query.or(search.bookFragment);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data as Book[];
}

export async function fetchBooks(searchTerm?: string): Promise<Book[]> {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from('books')
    .select(
      `
        id,
        title,
        author,
        isbn,
        barcode,
        classification,
        total_copies,
        available_copies,
        status,
        location,
        cover_image_url,
        last_transaction_at
      `
    )
    .order('title');

  const search = buildSearchFragments(searchTerm);
  if (search) {
    query = query.or(search.bookFragment);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data as Book[];
}
