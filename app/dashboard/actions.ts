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
      event_type: action,
      entity: table,
      entity_id: recordId,
      actor_id: performedBy ?? null,
      actor_role: null,
      source: 'ui',
      success: true,
      diff: payload ?? null,
      context: null,
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

const normalizeCopyStatus = (value: string | null | undefined) => {
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

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isUuid = (value: string) => UUID_REGEX.test(value);

const isEmail = (value: string) => value.includes('@');

type BorrowerRecord = {
  id: string;
  email: string | null;
  role: string | null;
  profile: {
    display_name: string | null;
    student_id: string | null;
  } | null;
};

const fetchUserWithProfile = async (supabase: SupabaseClient, filters: Record<string, string>) => {
  const query = supabase
    .from('users')
    .select(
      `
        id,
        email,
        role,
        profile:user_profiles(
          display_name,
          student_id
        )
      `,
    )
    .limit(1);

  Object.entries(filters).forEach(([column, value]) => {
    query.eq(column, value);
  });

  const { data, error } = await query.maybeSingle<BorrowerRecord>();
  if (error || !data) {
    return null;
  }
  return data;
};

const loadBorrowerByIdentifier = async (
  supabase: SupabaseClient,
  rawIdentifier: string,
): Promise<BorrowerRecord | null> => {
  const identifier = rawIdentifier.trim();
  if (!identifier) return null;

  if (isUuid(identifier)) {
    const user = await fetchUserWithProfile(supabase, { id: identifier });
    if (user) return user;
  }

  if (isEmail(identifier)) {
    const user = await fetchUserWithProfile(supabase, { email: identifier.toLowerCase() });
    if (user) return user;
  }

  const { data: studentMatch } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('student_id', identifier)
    .maybeSingle<{ user_id: string }>();

  if (studentMatch?.user_id) {
    const user = await fetchUserWithProfile(supabase, { id: studentMatch.user_id });
    if (user) return user;
  }

  const { data: usernameMatch } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('username', identifier)
    .maybeSingle<{ user_id: string }>();

  if (usernameMatch?.user_id) {
    const user = await fetchUserWithProfile(supabase, { id: usernameMatch.user_id });
    if (user) return user;
  }

  return null;
};

const upsertProfileFields = async (
  supabase: SupabaseClient,
  userId: string,
  updates: { display_name?: string | null; student_id?: string | null },
) => {
  const payload: Record<string, string | null> = { user_id: userId };
  if (typeof updates.display_name === 'string') {
    payload.display_name = updates.display_name;
  }
  if (typeof updates.student_id === 'string') {
    payload.student_id = updates.student_id;
  }

  if (Object.keys(payload).length > 1) {
    await supabase.from('user_profiles').upsert(payload, { onConflict: 'user_id' });
  }
};

const activeLoanSelect = `
  id,
  copy_id,
  user_id,
  borrowed_at,
  due_at,
  returned_at,
  handled_by,
  copy:copies(
    id,
    book_id,
    barcode
  ),
  borrower:users!loans_user_id_fkey(
    id,
    email,
    profile:user_profiles(
      display_name,
      student_id
    )
  )
`;

type ActiveLoanRow = {
  id: string;
  copy_id: string;
  user_id: string | null;
  borrowed_at: string;
  due_at: string;
  returned_at: string | null;
  handled_by: string | null;
  copy: { id: string; book_id: string | null; barcode: string | null } | null;
  borrower?: {
    id: string;
    email: string | null;
    profile?: {
      display_name: string | null;
      student_id: string | null;
    } | null;
  } | null;
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
    const status = normalizeCopyStatus(copy.status);
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

export async function checkoutBookAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const bookId = formData.get('bookId')?.toString();
  const copyId = formData.get('copyId')?.toString();
  const borrowerIdentifier = formData.get('borrowerIdentifier')?.toString().trim();
  const borrowerName = formData.get('borrowerName')?.toString().trim() || null;
  const dueDateInput = formData.get('dueDate')?.toString();

  if (!bookId) return failure('Select a book to borrow.');
  if (!borrowerIdentifier) return failure('Borrower ID is required.');
  if (!dueDateInput) return failure('Provide a due date.');

  const dueDate = new Date(dueDateInput);
  if (Number.isNaN(dueDate.valueOf())) {
    return failure('Due date is invalid.');
  }

  const supabase = getSupabaseServerClient();
  const handlerId = await getCurrentUserId();
  const borrowedAt = new Date().toISOString();
  const dueAt = dueDate.toISOString();

  const borrower = await loadBorrowerByIdentifier(supabase, borrowerIdentifier);
  if (!borrower) {
    return failure('No patron matches that ID or email.');
  }

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

    const status = normalizeCopyStatus(copyRow.status);
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
      copy_id: copy.id,
      user_id: borrower.id,
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
      status: 'ON_LOAN',
    })
    .eq('id', copy.id);

  if (copyUpdateError) {
    console.error('Failed to update copy status after borrowing', copyUpdateError);
    if (loanId) {
      await supabase.from('loans').delete().eq('id', loanId);
    }
    return failure('Loan cancelled because the copy status could not be updated.');
  }

  if (borrowerName || (!isEmail(borrowerIdentifier) && !isUuid(borrowerIdentifier))) {
    const profileUpdates: { display_name?: string | null; student_id?: string | null } = {};
    if (!borrower.profile?.display_name && borrowerName) {
      profileUpdates.display_name = borrowerName;
    }
    if (
      !borrower.profile?.student_id &&
      !isEmail(borrowerIdentifier) &&
      !isUuid(borrowerIdentifier)
    ) {
      profileUpdates.student_id = borrowerIdentifier;
    }
    if (Object.keys(profileUpdates).length > 0) {
      await upsertProfileFields(supabase, borrower.id, profileUpdates);
    }
  }

  if (loanId) {
    await logAuditEvent(supabase, {
      table: 'loans',
      recordId: loanId,
      action: 'create',
      performedBy: handlerId,
      payload: {
        copy_id: copy.id,
        user_id: borrower.id,
        due_at: dueAt,
        borrowed_at: borrowedAt,
      },
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/check-out');
  revalidatePath('/dashboard/book-items');

  const borrowerLabel = borrowerName ?? borrower.profile?.display_name ?? borrower.email ?? 'borrower';
  return success(`Loan recorded for ${borrowerLabel}.`);
}

export async function checkinBookAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const loanId = formData.get('loanId')?.toString();
  const identifierRaw = formData.get('identifier')?.toString().trim();

  if (!loanId && !identifierRaw) {
    return failure('Provide a loan reference, borrower ID, or copy barcode.');
  }

  const supabase = getSupabaseServerClient();
  const handlerId = await getCurrentUserId();
  const nowIso = new Date().toISOString();

  let loan: ActiveLoanRow | null = null;

  if (loanId) {
    const { data, error } = await supabase
      .from('loans')
      .select(activeLoanSelect)
      .eq('id', loanId)
      .is('returned_at', null)
      .maybeSingle();

    if (error) {
      console.error('Loan lookup by id failed', error);
      return failure('Unable to locate that loan.');
    }

    if (data) {
      loan = (data as unknown) as ActiveLoanRow;
    } else {
      return failure('No active loan matches that reference.');
    }
  }

  const identifier = identifierRaw ?? '';

  if (!loan && identifier) {
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
      const { data, error } = await supabase
        .from('loans')
        .select(activeLoanSelect)
        .eq('copy_id', copyMatch.id)
        .is('returned_at', null)
        .maybeSingle();

      if (error) {
        console.error('Loan lookup by copy failed', error);
        return failure('Unable to locate an active loan for that copy.');
      }

      if (data) {
        loan = (data as unknown) as ActiveLoanRow;
      }
    }
  }

  if (!loan && identifier) {
    const borrower = await loadBorrowerByIdentifier(supabase, identifier);
    if (borrower) {
      const { data, error } = await supabase
        .from('loans')
        .select(activeLoanSelect)
        .eq('user_id', borrower.id)
        .is('returned_at', null)
        .order('borrowed_at', { ascending: true })
        .limit(2);

      if (error) {
        console.error('Loan lookup by borrower failed', error);
        return failure('Unable to locate active loans for that borrower.');
      }

      const rows = ((data ?? []) as unknown) as ActiveLoanRow[];

      if (rows.length === 0) {
        return failure('That borrower has no active loans.');
      }

      if (rows.length > 1) {
        return failure('Multiple active loans found. Scan the barcode or enter the specific loan ID.');
      }

      loan = rows[0] ?? null;
    }
  }

  if (!loan) {
    return failure('No active loan matched the provided reference.');
  }

  const loanUpdatePayload: Record<string, unknown> = {
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
    .update({ status: 'AVAILABLE' })
    .eq('id', loan.copy_id);

  if (copyUpdateError) {
    console.error('Failed to update copy during return processing', copyUpdateError);
    await supabase
      .from('loans')
      .update({ returned_at: null, handled_by: loan.handled_by ?? null })
      .eq('id', loan.id);
    return failure('Copy status update failed; the loan remains active.');
  }

  await logAuditEvent(supabase, {
    table: 'loans',
    recordId: loan.id,
    action: 'update',
    performedBy: handlerId,
    payload: {
      returned_at: nowIso,
    },
  });

  const borrowerLabel =
    loan.borrower?.profile?.display_name ?? loan.borrower?.email ?? 'borrower';
  const copyLabel = loan.copy?.barcode ? `copy ${loan.copy.barcode}` : 'the item';

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/check-in');
  revalidatePath('/dashboard/check-out');
  revalidatePath('/dashboard/book-items');

  return success(`Marked ${copyLabel} as returned for ${borrowerLabel}.`);
}

export async function updateBookAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const bookId = formData.get('bookId')?.toString();
  const title = formData.get('title')?.toString().trim();
  const author = formData.get('author')?.toString().trim() || null;
  const isbn = formData.get('isbn')?.toString().trim() || null;
  const classificationRaw = formData.get('classification')?.toString();
  const publisherRaw = formData.get('publisher')?.toString();
  const publicationYearRaw = formData.get('publicationYear')?.toString();
  const coverImageUrl = formData.get('coverImageUrl')?.toString().trim() || null;

  if (!bookId) return failure('Book reference is missing.');
  if (!title) return failure('Book title is required.');

  const supabase = getSupabaseServerClient();

  const updatePayload: Record<string, unknown> = {
    title,
    author,
    isbn,
    classification: classificationRaw?.trim() || null,
    publisher: publisherRaw?.trim() || null,
    publication_year: publicationYearRaw?.trim() || null,
    cover_image_url: coverImageUrl,
    updated_at: new Date().toISOString(),
  };

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
  const coverImageUrl = formData.get('coverImageUrl')?.toString().trim() || null;
  const publisher = formData.get('publisher')?.toString().trim() || null;
  const publicationYear = formData.get('publicationYear')?.toString().trim() || null;
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
      publisher,
      publication_year: publicationYear,
      cover_image_url: coverImageUrl,
      updated_at: nowIso,
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
    status: 'AVAILABLE',
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
