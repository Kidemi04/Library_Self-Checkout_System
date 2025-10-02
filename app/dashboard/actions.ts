
'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import type { BorrowerType } from '@/app/lib/supabase/types';
import type { ActionState } from '@/app/dashboard/action-state';

const success = (message: string): ActionState => ({ status: 'success', message });
const failure = (message: string): ActionState => ({ status: 'error', message });

export async function checkoutBookAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const bookId = formData.get('bookId')?.toString();
  const borrowerIdentifier = formData.get('borrowerIdentifier')?.toString().trim();
  const borrowerName = formData.get('borrowerName')?.toString().trim();
  const borrowerType = formData.get('borrowerType')?.toString() as BorrowerType | undefined;
  const dueDateInput = formData.get('dueDate')?.toString();

  if (!bookId) return failure('Select a book to check out.');
  if (!borrowerIdentifier) return failure('Borrower ID is required.');
  if (!borrowerName) return failure('Borrower name is required.');
  if (!borrowerType) return failure('Choose borrower type.');
  if (!dueDateInput) return failure('Provide a due date.');

  const dueDate = new Date(dueDateInput);
  if (Number.isNaN(dueDate.valueOf())) {
    return failure('Due date is invalid.');
  }

  const supabase = getSupabaseServerClient();

  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('id, title, available_copies, total_copies')
    .eq('id', bookId)
    .single();

  if (bookError || !book) {
    console.error('Checkout book lookup failed', bookError);
    return failure('Unable to load book information.');
  }

  if ((book.available_copies ?? 0) < 1) {
    return failure('No copies available for this title.');
  }

  const borrowedAt = new Date().toISOString();
  const dueAt = dueDate.toISOString();

  const { error: insertLoanError } = await supabase.from('loans').insert({
    book_id: bookId,
    borrower_identifier: borrowerIdentifier,
    borrower_name: borrowerName,
    borrower_type: borrowerType,
    status: 'borrowed',
    borrowed_at: borrowedAt,
    due_at: dueAt,
  });

  if (insertLoanError) {
    console.error('Failed to insert loan', insertLoanError);
    return failure('Unable to complete checkout. Try again.');
  }

  const updatedAvailable = Math.max(0, (book.available_copies ?? 0) - 1);
  const nextStatus = updatedAvailable === 0 ? 'checked_out' : 'available';

  const { error: updateBookError } = await supabase
    .from('books')
    .update({
      available_copies: updatedAvailable,
      status: nextStatus,
      last_transaction_at: borrowedAt,
    })
    .eq('id', bookId);

  if (updateBookError) {
    console.error('Failed to update book availability', updateBookError);
    return failure('Checkout succeeded but inventory update failed. Please verify manually.');
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/check-out');
  revalidatePath('/dashboard/book-items');

  return success(`Checked out to ${borrowerName}.`);
}

export async function checkinBookAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const loanId = formData.get('loanId')?.toString();
  const identifier = formData.get('identifier')?.toString().trim();

  if (!loanId && !identifier) {
    return failure('Provide a loan reference or scan a book.');
  }

  const supabase = getSupabaseServerClient();
  const now = new Date();
  const nowIso = now.toISOString();

  let loanRecord: { id: string; book_id: string } | null = null;

  if (loanId) {
    const { data, error } = await supabase
      .from('loans')
      .select('id, book_id, status')
      .eq('id', loanId)
      .single();

    if (error) {
      console.error('Loan lookup by id failed', error);
    } else if (data?.status !== 'borrowed') {
      return failure('This loan is not currently active.');
    } else {
      loanRecord = { id: data.id, book_id: data.book_id };
    }
  }

  if (!loanRecord && identifier) {
    const { data, error } = await supabase
      .from('loans')
      .select('id, book_id, status')
      .eq('borrower_identifier', identifier)
      .eq('status', 'borrowed')
      .order('borrowed_at', { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      loanRecord = { id: data.id, book_id: data.book_id };
    }
  }

  let bookRecord:
    | { id: string; title: string | null; available_copies: number | null; total_copies: number | null }
    | null = null;

  if (!loanRecord && identifier) {
    const { data: matchedBook } = await supabase
      .from('books')
      .select('id, title, available_copies, total_copies')
      .or(`barcode.eq.${identifier},isbn.eq.${identifier}`)
      .maybeSingle();

    if (matchedBook) {
      const { data: bookLoan } = await supabase
        .from('loans')
        .select('id, book_id, status')
        .eq('book_id', matchedBook.id)
        .eq('status', 'borrowed')
        .order('borrowed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (bookLoan) {
        loanRecord = { id: bookLoan.id, book_id: bookLoan.book_id };
        bookRecord = matchedBook;
      }
    }
  }

  if (!loanRecord) {
    return failure('Unable to find an active loan for that identifier.');
  }

  if (!bookRecord) {
    const { data, error } = await supabase
      .from('books')
      .select('id, title, available_copies, total_copies')
      .eq('id', loanRecord.book_id)
      .single();

    if (error || !data) {
      console.error('Book lookup during check-in failed', error);
      return failure('Book details missing for this loan.');
    }

    bookRecord = data;
  }

  const { error: loanUpdateError } = await supabase
    .from('loans')
    .update({ status: 'returned', returned_at: nowIso })
    .eq('id', loanRecord.id);

  if (loanUpdateError) {
    console.error('Failed to mark loan as returned', loanUpdateError);
    return failure('Unable to update loan status.');
  }

  const available = Math.max(0, bookRecord.available_copies ?? 0);
  const total = Math.max(1, bookRecord.total_copies ?? 1);
  const updatedAvailable = Math.min(total, available + 1);

  const { error: bookUpdateError } = await supabase
    .from('books')
    .update({
      available_copies: updatedAvailable,
      status: 'available',
      last_transaction_at: nowIso,
    })
    .eq('id', bookRecord.id);

  if (bookUpdateError) {
    console.error('Failed to update book during check-in', bookUpdateError);
    return failure('Check-in succeeded but inventory update failed. Please verify manually.');
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/check-in');
  revalidatePath('/dashboard/check-out');
  revalidatePath('/dashboard/book-items');

  return success(`${bookRecord.title ?? 'Book'} returned successfully.`);
}

export async function createBookAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = formData.get('title')?.toString().trim();
  const author = formData.get('author')?.toString().trim() || null;
  const isbn = formData.get('isbn')?.toString().trim() || null;
  const barcode = formData.get('barcode')?.toString().trim() || null;
  const classification = formData.get('classification')?.toString().trim() || null;
  const location = formData.get('location')?.toString().trim() || null;
  const coverImageUrl = formData.get('coverImageUrl')?.toString().trim() || null;
  const totalCopiesRaw = formData.get('totalCopies')?.toString();

  if (!title) return failure('Book title is required.');

  const totalCopies = totalCopiesRaw ? Number.parseInt(totalCopiesRaw, 10) : 1;

  if (!Number.isFinite(totalCopies) || totalCopies < 1) {
    return failure('Total copies must be a positive number.');
  }

  const supabase = getSupabaseServerClient();

  if (barcode) {
    const { data: existingByBarcode } = await supabase
      .from('books')
      .select('id')
      .eq('barcode', barcode)
      .maybeSingle();

    if (existingByBarcode) {
      return failure('A book with this barcode already exists.');
    }
  }

  if (isbn) {
    const { data: existingByIsbn } = await supabase
      .from('books')
      .select('id')
      .eq('isbn', isbn)
      .maybeSingle();

    if (existingByIsbn) {
      return failure('A book with this ISBN already exists.');
    }
  }

  const nowIso = new Date().toISOString();

  const { error } = await supabase.from('books').insert({
    title,
    author,
    isbn,
    barcode,
    classification,
    location,
    cover_image_url: coverImageUrl,
    total_copies: totalCopies,
    available_copies: totalCopies,
    status: 'available',
    last_transaction_at: nowIso,
  });

  if (error) {
    console.error('Failed to create book', error);
    return failure('Unable to create book record.');
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/book-items');
  revalidatePath('/dashboard/check-out');

  return success('Book has been added to the catalogue.');
}
