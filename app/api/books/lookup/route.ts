import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';

const sanitizeCode = (value: string) => value.trim().replace(/[^0-9A-Za-z-]/g, '');

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

  const { data, error } = await supabase
    .from('books')
    .select(
      `
        id,
        title,
        author,
        isbn,
        barcode,
        classification,
        available_copies,
        total_copies,
        status
      `
    )
    .or(`barcode.eq.${sanitized},isbn.eq.${sanitized}`)
    .eq('status', 'available')
    .gte('available_copies', 1)
    .maybeSingle();

  if (error) {
    console.error('Book lookup failed', error);
    return NextResponse.json({ error: 'Unable to lookup book at the moment.' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'No available book matches that code.' }, { status: 404 });
  }

  return NextResponse.json({ book: data, code: sanitized });
}
