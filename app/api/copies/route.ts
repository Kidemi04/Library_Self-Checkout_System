import { NextResponse } from 'next/server';
import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';

// GET /api/copies?bookId=xxx  — list all copies for a book
export async function GET(request: Request) {
  const { user } = await getDashboardSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role === 'user') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const bookId = new URL(request.url).searchParams.get('bookId');
  if (!bookId) return NextResponse.json({ error: 'bookId required' }, { status: 400 });

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('Copies')
    .select('id, barcode, status, created_at')
    .eq('book_id', bookId)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ copies: data ?? [] });
}

// POST /api/copies  {bookId, barcode}  — add a new copy
export async function POST(request: Request) {
  const { user } = await getDashboardSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role === 'user') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const bookId = typeof body.bookId === 'string' ? body.bookId.trim() : null;
  const barcode = typeof body.barcode === 'string' ? body.barcode.trim() : null;

  if (!bookId || !barcode) {
    return NextResponse.json({ error: 'bookId and barcode are required.' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  // Verify book exists
  const { data: book } = await supabase
    .from('Books')
    .select('id')
    .eq('id', bookId)
    .maybeSingle();

  if (!book) return NextResponse.json({ error: 'Book not found.' }, { status: 404 });

  // Check barcode uniqueness across all copies
  const { data: existing } = await supabase
    .from('Copies')
    .select('id')
    .eq('barcode', barcode)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'That barcode is already assigned to another copy.' },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from('Copies').insert({
    book_id: bookId,
    barcode,
    status: 'available',
    created_at: now,
    updated_at: now,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE /api/copies  {copyId}  — remove a copy (only if not on loan)
export async function DELETE(request: Request) {
  const { user } = await getDashboardSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role === 'user') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const copyId = typeof body.copyId === 'string' ? body.copyId.trim() : null;
  if (!copyId) return NextResponse.json({ error: 'copyId required' }, { status: 400 });

  const supabase = getSupabaseServerClient();

  const { data: copy } = await supabase
    .from('Copies')
    .select('id, status, loans:Loans(id, returned_at)')
    .eq('id', copyId)
    .maybeSingle();

  if (!copy) return NextResponse.json({ error: 'Copy not found.' }, { status: 404 });

  const hasActiveLoan = (copy.loans ?? []).some((l: any) => l.returned_at == null);
  if (copy.status === 'on_loan' || hasActiveLoan) {
    return NextResponse.json(
      { error: 'Cannot remove — this copy is currently on loan.' },
      { status: 409 },
    );
  }

  const { error } = await supabase.from('Copies').delete().eq('id', copyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
