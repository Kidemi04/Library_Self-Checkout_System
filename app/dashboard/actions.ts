'use server';

import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';
import { auth } from '@/auth';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import type { ActionState } from '@/app/dashboard/action-state';

const success = (message: string): ActionState => ({ status: 'success', message });
const failure = (message: string): ActionState => ({ status: 'error', message });

type AuditAction = 'create' | 'update' | 'delete';

const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const session = await auth();
    const user = session?.user as { id?: string } | null;
    return user?.id ?? null;
  } catch (error) {
    console.error('Failed to read authenticated user for audit metadata', error);
    return null;
  }
};

const logAuditEvent = async (
  supabase: SupabaseClient,
  {
    table,
    recordId,
    action,
    payload,
    performedBy,
  }: {
    table: string;
    recordId: string;
    action: AuditAction;
    payload?: Record<string, unknown>;
    performedBy?: string | null;
  },
) => {
  try {
    await supabase.from('audit_log').insert({
      table_name: table,
      record_id: recordId,
      action,
      changed_data: payload ?? null,
      performed_by: performedBy ?? null,
    });
  } catch (error) {
    console.error('Audit log insert failed', error);
  }
};

type AvailableCopy = {
  id: string;
  bookId: string;
  barcode: string | null;
};

const findAvailableCopyForBook = async (
  supabase: SupabaseClient,
  bookId: string,
): Promise<AvailableCopy | null> => {
  const { data, error } = await supabase
    .from('copies')
    .select(
      `
        id,
        book_id,
        barcode,
        status,
        loans:loans(
          id,
          returned_at
        )
      `,
    )
    .eq('book_id', bookId);

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const candidate = data.find((copy) => {
    const status = typeof copy.status === 'string' ? copy.status.trim().toLowerCase() : 'available';
    if (status !== 'available') return false;
    const hasActiveLoan = Array.isArray(copy.loans)
      ? copy.loans.some((loan) => loan.returned_at == null)
      : false;
    return !hasActiveLoan;
  });

  if (!candidate) return null;

  return {
    id: candidate.id,
    bookId: candidate.book_id,
    barcode: candidate.barcode ?? null,
  };
};

const loanSelection = `
  id,
  copy_id,
  book_id,
  borrower_name,
  borrower_identifier,
  status,
  returned_at,
  borrowed_at,
  copy:copies(
    id,
    barcode,
    book_id
  )
`;

type RawActiveLoan = {
  id: string;
  copy_id: string;
  book_id: string | null;
  borrower_name: string | null;
  borrower_identifier: string | null;
  status: string | null;
  returned_at: string | null;
  borrowed_at: string;
  copy: { id: string; barcode: string | null; book_id: string | null } | null;
};

type ActiveLoan = {
  id: string;
  copyId: string;
  bookId: string | null;
  borrowerName: string | null;
  borrowerIdentifier: string | null;
  status: string;
  copyBarcode: string | null;
  borrowedAt: string;
};

const mapLoan = (row: RawActiveLoan): ActiveLoan => ({
  id: row.id,
  copyId: row.copy_id,
  bookId: row.book_id ?? row.copy?.book_id ?? null,
  borrowerName: row.borrower_name ?? null,
  borrowerIdentifier: row.borrower_identifier ?? null,
  status: row.status ? row.status.trim().toLowerCase() : 'borrowed',
  copyBarcode: row.copy?.barcode ?? null,
  borrowedAt: row.borrowed_at,
});

export async function checkoutBookAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const bookId = formData.get('bookId')?.toString();
  const copyId = formData.get('copyId')?.toString();
  const borrowerIdentifier = formData.get('borrowerIdentifier')?.toString().trim();
  const borrowerName = formData.get('borrowerName')?.toString().trim();
  const dueDateInput = formData.get('dueDate')?.toString();

  if (!bookId) return failure('Select a book to borrow.');
  if (!borrowerIdentifier) return failure('Borrower ID is required.');
  if (!borrowerName) return failure('Borrower name is required.');
  if (!dueDateInput) return failure('Provide a due date.');

  const dueDate = new Date(dueDateInput);
  if (Number.isNaN(dueDate.valueOf())) {
    return failure('Due date is invalid.');
  }

  const supabase = getSupabaseServerClient();
  const handlerId = await getCurrentUserId();
  const borrowedAt = new Date().toISOString();
  const dueAt = dueDate.toISOString();

  let copy: AvailableCopy | null = null;

  if (copyId) {
    const { data: copyRow, error: copyError } = await supabase
      .from('copies')
      .select(
        `
          id,
          book_id,
          barcode,
          status,
          loans:loans(
            id,
            returned_at
          )
        `,
      )
      .eq('id', copyId)
      .maybeSingle<{
        id: string;
        book_id: string;
        barcode: string | null;
        status: string | null;
        loans: Array<{ returned_at: string | null }> | null;
      }>();

    if (copyError) {
      console.error('Failed to lookup selected copy', copyError);
      return failure('Unable to verify the selected copy.');
    }

    if (!copyRow) {
      return failure('The selected copy could not be found.');
    }

    if (copyRow.book_id !== bookId) {
      return failure('Selected copy does not belong to the chosen book.');
    }

    const status = copyRow.status ? copyRow.status.trim().toLowerCase() : 'available';
    const hasActiveLoan = Array.isArray(copyRow.loans)
      ? copyRow.loans.some((loan) => loan.returned_at == null)
      : false;

    if (status !== 'available' || hasActiveLoan) {
      return failure('That copy is not currently available.');
    }

    copy = {
      id: copyRow.id,
      bookId: copyRow.book_id,
      barcode: copyRow.barcode ?? null,
    };
  } else {
    try {
      copy = await findAvailableCopyForBook(supabase, bookId);
    } catch (error) {
      console.error('Failed to lookup copies for book', error);
      return failure('Unable to check availability for the selected book.');
    }

    if (!copy) {
      return failure('No available copies for this title.');
    }
  }

  const { data: loanRow, error: insertLoanError } = await supabase
    .from('loans')
    .insert({
      book_id: bookId,
      copy_id: copy.id,
      borrower_identifier: borrowerIdentifier,
      borrower_name: borrowerName,
      status: 'borrowed',
      borrowed_at: borrowedAt,
      due_at: dueAt,
      handled_by: handlerId,
    })
    .select('id')
    .single();

  if (insertLoanError) {
    console.error('Failed to record borrow transaction', insertLoanError);
    return failure('Unable to complete borrow request. Try again.');
  }

  const loanId = loanRow?.id;

  const { error: copyUpdateError } = await supabase
    .from('copies')
    .update({
      status: 'loaned',
      last_inventory_at: borrowedAt,
    })
    .eq('id', copy.id);

  if (copyUpdateError) {
    console.error('Failed to update copy status after borrowing', copyUpdateError);
    if (loanId) {
      await supabase.from('loans').delete().eq('id', loanId);
    }
    return failure('Loan cancelled because the copy status could not be updated.');
  }

  const { error: bookUpdateError } = await supabase
    .from('books')
    .update({ last_transaction_at: borrowedAt })
    .eq('id', bookId);

  if (bookUpdateError) {
    console.error('Failed to update book transaction timestamp', bookUpdateError);
  }

  if (loanId) {
    await logAuditEvent(supabase, {
      table: 'loans',
      recordId: loanId,
      action: 'create',
      performedBy: handlerId,
      payload: {
        copy_id: copy.id,
        borrower_identifier: borrowerIdentifier,
        due_at: dueAt,
      },
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/check-out');
  revalidatePath('/dashboard/book-items');

  return success(`Loan recorded for ${borrowerName}.`);
}

export async function checkinBookAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const loanId = formData.get('loanId')?.toString();
  const identifier = formData.get('identifier')?.toString().trim();

  if (!loanId && !identifier) {
    return failure('Provide a loan reference, borrower ID, or copy barcode.');
  }

  const supabase = getSupabaseServerClient();

  let rawLoan: RawActiveLoan | null = null;

  if (loanId) {
    const { data, error } = await supabase
      .from('loans')
      .select(loanSelection)
      .eq('id', loanId)
      .maybeSingle<RawActiveLoan>();

    if (error) {
      console.error('Loan lookup by id failed', error);
      return failure('Unable to locate that loan.');
    }

    if (!data) {
      return failure('No loan matches that reference.');
    }

    rawLoan = data;
  }

  if (!rawLoan && identifier) {
    const { data: copyMatch, error: copyError } = await supabase
      .from('copies')
      .select('id, book_id, barcode')
      .eq('barcode', identifier)
      .maybeSingle<{ id: string; book_id: string | null; barcode: string | null }>();

    if (copyError) {
      console.error('Copy lookup failed', copyError);
      return failure('Unable to locate a copy with that barcode.');
    }

    if (copyMatch) {
      const { data: loanByCopy, error: loanByCopyError } = await supabase
        .from('loans')
        .select(loanSelection)
        .eq('copy_id', copyMatch.id)
        .is('returned_at', null)
        .maybeSingle<RawActiveLoan>();

      if (loanByCopyError) {
        console.error('Loan lookup by copy failed', loanByCopyError);
        return failure('Unable to locate an active loan for that copy.');
      }

      if (loanByCopy) {
        rawLoan = loanByCopy;
      }
    }
  }

  if (!rawLoan && identifier) {
    const { data: loanByBorrower, error: loanByBorrowerError } = await supabase
      .from('loans')
      .select(loanSelection)
      .eq('borrower_identifier', identifier)
      .is('returned_at', null)
      .order('borrowed_at', { ascending: false })
      .limit(1)
      .maybeSingle<RawActiveLoan>();

    if (loanByBorrowerError) {
      console.error('Loan lookup by borrower failed', loanByBorrowerError);
      return failure('Unable to locate an active loan for that borrower.');
    }

    if (loanByBorrower) {
      rawLoan = loanByBorrower;
    }
  }

  if (!rawLoan) {
    return failure('No active loan matched the provided reference.');
  }

  if (rawLoan.returned_at) {
    return failure('This loan has already been returned.');
  }

  const normalizedStatus = rawLoan.status ? rawLoan.status.trim().toLowerCase() : 'borrowed';
  if (normalizedStatus !== 'borrowed' && normalizedStatus !== 'overdue') {
    return failure('This loan is not currently active.');
  }

  const loan = mapLoan(rawLoan);
  const handlerId = await getCurrentUserId();
  const nowIso = new Date().toISOString();

  const loanUpdatePayload: Record<string, unknown> = {
    status: 'returned',
    returned_at: nowIso,
  };

  if (handlerId) {
    loanUpdatePayload.handled_by = handlerId;
  }

  const { error: loanUpdateError } = await supabase
    .from('loans')
    .update(loanUpdatePayload)
    .eq('id', loan.id);

  if (loanUpdateError) {
    console.error('Failed to mark loan as returned', loanUpdateError);
    return failure('Unable to update loan status.');
  }

  const { error: copyUpdateError } = await supabase
    .from('copies')
    .update({
      status: 'available',
      last_inventory_at: nowIso,
    })
    .eq('id', loan.copyId);

  if (copyUpdateError) {
    console.error('Failed to update copy during return processing', copyUpdateError);
    await supabase
      .from('loans')
      .update({ status: normalizedStatus, returned_at: null })
      .eq('id', loan.id);
    return failure('Copy status update failed; the loan remains active.');
  }

  if (loan.bookId) {
    const { error: bookUpdateError } = await supabase
      .from('books')
      .update({ last_transaction_at: nowIso })
      .eq('id', loan.bookId);

    if (bookUpdateError) {
      console.error('Failed to update book transaction timestamp', bookUpdateError);
    }
  }

  await logAuditEvent(supabase, {
    table: 'loans',
    recordId: loan.id,
    action: 'update',
    performedBy: handlerId,
    payload: {
      status: 'returned',
      returned_at: nowIso,
    },
  });

  let bookTitle = 'Book';
  if (loan.bookId) {
    const { data: bookRow, error: bookLookupError } = await supabase
      .from('books')
      .select('title')
      .eq('id', loan.bookId)
      .maybeSingle<{ title: string | null }>();
    if (!bookLookupError && bookRow?.title) {
      bookTitle = bookRow.title;
    }
  } else if (loan.copyBarcode) {
    bookTitle = `Copy ${loan.copyBarcode}`;
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/check-in');
  revalidatePath('/dashboard/check-out');
  revalidatePath('/dashboard/book-items');

  return success(`${bookTitle} returned successfully.`);
}

export async function updateBookAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const bookId = formData.get('bookId')?.toString();
  const title = formData.get('title')?.toString().trim();
  const classificationRaw = formData.get('classification')?.toString();
  const locationRaw = formData.get('location')?.toString();
  const statusRaw = formData.get('status')?.toString();

  if (!bookId) return failure('Book reference is missing.');
  if (!title) return failure('Book title is required.');

  const supabase = getSupabaseServerClient();

  const updatePayload: Record<string, unknown> = {
    title,
    classification: classificationRaw?.trim() || null,
    location: locationRaw?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (statusRaw) {
    updatePayload.status = statusRaw.trim();
  }

  const { error } = await supabase.from('books').update(updatePayload).eq('id', bookId);

  if (error) {
    console.error('Failed to update book record', error);
    return failure('Unable to update book details. Try again.');
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/book-items');
  revalidatePath('/dashboard/check-out');
  revalidatePath('/dashboard/book-list');

  return success('Book details updated.');
}

export async function deleteBookAction(bookId: string): Promise<ActionState> {
  const supabase = getSupabaseServerClient();

  try {
    const { error: copyError } = await supabase.from('copies').delete().eq('book_id', bookId);
    if (copyError) {
      throw new Error(copyError.message);
    }

    const { error } = await supabase.from('books').delete().eq('id', bookId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/book-items');
    revalidatePath('/dashboard/book-list');

    return success('Book deleted successfully.');
  } catch (error: any) {
    console.error('Failed to delete book', error);
    return failure(`Failed to delete book: ${error.message ?? 'Unknown error'}`);
  }
}

const parseCopyBarcodes = (raw: string | null | undefined, fallback: string | null) => {
  const inputs: string[] = [];

  if (raw) {
    raw
      .split(/\r?\n|,/)
      .map((code) => code.trim())
      .filter(Boolean)
      .forEach((code) => inputs.push(code));
  }

  if (fallback) {
    inputs.push(fallback);
  }

  const unique = Array.from(new Set(inputs.map((code) => code.trim()))).filter(Boolean);
  return unique;
};

export async function createBookAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = formData.get('title')?.toString().trim();
  const author = formData.get('author')?.toString().trim() || null;
  const isbn = formData.get('isbn')?.toString().trim() || null;
  const classification = formData.get('classification')?.toString().trim() || null;
  const location = formData.get('location')?.toString().trim() || null;
  const coverImageUrl = formData.get('coverImageUrl')?.toString().trim() || null;
  const copyBarcodeSingle = formData.get('barcode')?.toString().trim() || null;
  const copyBarcodeList = formData.get('copyBarcodes')?.toString() ?? null;

  if (!title) return failure('Book title is required.');

  const supabase = getSupabaseServerClient();

  if (isbn) {
    const { data: existingByIsbn, error: isbnError } = await supabase
      .from('books')
      .select('id')
      .eq('isbn', isbn)
      .maybeSingle();

    if (isbnError) {
      console.error('ISBN uniqueness check failed', isbnError);
      return failure('Unable to verify ISBN uniqueness.');
    }

    if (existingByIsbn) {
      return failure('A book with this ISBN already exists.');
    }
  }

  const barcodes = parseCopyBarcodes(copyBarcodeList, copyBarcodeSingle);

  if (barcodes.length === 0) {
    return failure('Provide at least one copy barcode.');
  }

  const { data: conflictingCopies, error: copyConflictError } = await supabase
    .from('copies')
    .select('id, barcode')
    .in('barcode', barcodes);

  if (copyConflictError) {
    console.error('Failed to verify copy barcode uniqueness', copyConflictError);
    return failure('Unable to verify copy barcode uniqueness.');
  }

  if (conflictingCopies && conflictingCopies.length > 0) {
    return failure('One or more copy barcodes already exist in the catalogue.');
  }

  const nowIso = new Date().toISOString();

  const { data: bookRow, error: bookInsertError } = await supabase
    .from('books')
    .insert({
      title,
      author,
      isbn,
      classification,
      location,
      cover_image_url: coverImageUrl,
      last_transaction_at: nowIso,
    })
    .select('id')
    .single();

  if (bookInsertError || !bookRow) {
    console.error('Failed to create book', bookInsertError);
    return failure('Unable to create book record.');
  }

  const copyRows = barcodes.map((barcode) => ({
    book_id: bookRow.id,
    barcode,
    status: 'available',
  }));

  const { error: copyInsertError } = await supabase.from('copies').insert(copyRows);

  if (copyInsertError) {
    console.error('Failed to create copies', copyInsertError);
    await supabase.from('books').delete().eq('id', bookRow.id);
    return failure('Unable to create book copies; no records were saved.');
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/book-items');
  revalidatePath('/dashboard/check-out');

  return success('Book has been added to the catalogue.');
}
