import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';

const sanitizeCode = (value: string) => value.trim().replace(/[^0-9A-Za-z-]/g, '');

type CopyLoanRow = { id: string; returned_at: string | null };

type CopyRow = {
  id: string;
  book_id: string;
  barcode: string | null;
  status: string | null;
  loans?: CopyLoanRow[] | null;
};

type BookRow = {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  classification: string | null;
  location: string | null;
  cover_image_url: string | null;
  last_transaction_at: string | null;
  copies: CopyRow[] | null;
};

const countAvailableCopies = (copies: CopyRow[] | null | undefined): number => {
  if (!copies || copies.length === 0) return 0;
  return copies.filter((copy) => {
    const status = typeof copy.status === 'string' ? copy.status.trim().toLowerCase() : 'available';
    if (status !== 'available') return false;
    const hasActiveLoan = Array.isArray(copy.loans)
      ? copy.loans.some((loan) => loan.returned_at == null)
      : false;
    return !hasActiveLoan;
  }).length;
};

const findFirstAvailableCopy = (copies: CopyRow[] | null | undefined): CopyRow | null => {
  if (!copies) return null;
  return (
    copies.find((copy) => {
      const status = typeof copy.status === 'string' ? copy.status.trim().toLowerCase() : 'available';
      if (status !== 'available') return false;
      const hasActiveLoan = Array.isArray(copy.loans)
        ? copy.loans.some((loan) => loan.returned_at == null)
        : false;
      return !hasActiveLoan;
    }) ?? null
  );
};

const mapBookResponse = (book: BookRow) => {
  const totalCopies = book.copies?.length ?? 0;
  const availableCopies = countAvailableCopies(book.copies);

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    classification: book.classification,
    location: book.location,
    cover_image_url: book.cover_image_url,
    last_transaction_at: book.last_transaction_at,
    available_copies: availableCopies,
    total_copies: totalCopies,
    status: availableCopies > 0 ? 'available' : 'checked_out',
    copies:
      book.copies?.map((copy) => ({
        id: copy.id,
        book_id: copy.book_id,
        barcode: copy.barcode,
        status: copy.status,
        loans: (copy.loans ?? []).map((loan) => ({
          id: loan.id,
          returned_at: loan.returned_at,
        })),
      })) ?? [],
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code')?.trim();

  if (!code) {
    return NextResponse.json({ error: 'Missing code parameter.' }, { status: 400 });
  }

  const sanitized = sanitizeCode(code);

  if (!sanitized) {
    return NextResponse.json({ error: 'Invalid code provided.' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  const { data: copyMatch, error: copyError } = await supabase
    .from('copies')
    .select('id, book_id, barcode')
    .eq('barcode', sanitized)
    .maybeSingle();

  if (copyError) {
    console.error('Copy lookup failed', copyError);
    return NextResponse.json({ error: 'Unable to lookup copy.' }, { status: 500 });
  }

  let bookRow: BookRow | null = null;
  let activeCopy: CopyRow | null = null;

  if (copyMatch?.book_id) {
    const { data, error } = await supabase
      .from('books')
      .select(
        `
          id,
          title,
          author,
          isbn,
          classification,
          location,
          cover_image_url,
          last_transaction_at,
          copies:copies(
            id,
            book_id,
            barcode,
            status,
            loans:loans(
              id,
              returned_at
            )
          )
        `,
      )
      .eq('id', copyMatch.book_id)
      .maybeSingle<BookRow>();

    if (error) {
      console.error('Book lookup for copy failed', error);
      return NextResponse.json({ error: 'Unable to load book information.' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Book not found for that copy.' }, { status: 404 });
    }

    bookRow = data;
    activeCopy =
      bookRow.copies?.find((copy) => copy.id === copyMatch.id) ?? findFirstAvailableCopy(bookRow.copies);
  } else {
    const { data, error } = await supabase
      .from('books')
      .select(
        `
          id,
          title,
          author,
          isbn,
          classification,
          location,
          cover_image_url,
          last_transaction_at,
          copies:copies(
            id,
            book_id,
            barcode,
            status,
            loans:loans(
              id,
              returned_at
            )
          )
        `,
      )
      .eq('isbn', sanitized)
      .maybeSingle<BookRow>();

    if (error) {
      console.error('Book lookup by ISBN failed', error);
      return NextResponse.json({ error: 'Unable to lookup book at the moment.' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'No book matches that code.' }, { status: 404 });
    }

    bookRow = data;
    activeCopy = findFirstAvailableCopy(bookRow.copies);
  }

  if (!bookRow) {
    return NextResponse.json({ error: 'Book could not be loaded.' }, { status: 404 });
  }

  if (!activeCopy) {
    return NextResponse.json(
      {
        error: 'All copies of this title are currently unavailable.',
        book: mapBookResponse(bookRow),
      },
      { status: 409 },
    );
  }

  return NextResponse.json({
    code: sanitized,
    book: mapBookResponse(bookRow),
    copy: {
      id: activeCopy.id,
      barcode: activeCopy.barcode,
      status: activeCopy.status,
    },
  });
}
