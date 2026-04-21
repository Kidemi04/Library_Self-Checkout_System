import { NextResponse } from 'next/server';
import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';

export async function POST(request: Request) {
  const { user } = await getDashboardSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const bookId = typeof body.bookId === 'string' ? body.bookId.trim() : null;
  const bookTitle = typeof body.bookTitle === 'string' ? body.bookTitle.trim() : '';

  if (!bookId) {
    return NextResponse.json({ error: 'Missing bookId' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  // 1. Fetch all copies for this book
  const { data: allCopies, error: copyError } = await supabase
    .from('Copies')
    .select('id, status')
    .eq('book_id', bookId);

  if (copyError) {
    console.error('[holds/place] copy lookup error:', copyError.message);
    return NextResponse.json({ error: 'Failed to check availability.' }, { status: 500 });
  }

  const copies = allCopies ?? [];

  // Reject if no copies exist at all
  if (copies.length === 0) {
    return NextResponse.json(
      { error: 'This book has no copies in the system. A hold cannot be placed.' },
      { status: 409 },
    );
  }

  // Reject if any copy is currently available to borrow
  if (copies.some((c) => c.status === 'available')) {
    return NextResponse.json(
      { error: 'This book has available copies — please borrow it directly instead of placing a hold.' },
      { status: 409 },
    );
  }

  // 2. Check patron doesn't already have an active hold
  const { data: existing } = await supabase
    .from('Holds')
    .select('id')
    .eq('patron_id', user.id)
    .eq('book_id', bookId)
    .in('status', ['queued', 'ready'])
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: 'You already have an active hold for this book.' }, { status: 409 });
  }

  // 3. Insert the hold
  const now = new Date().toISOString();
  const { error: insertError } = await supabase.from('Holds').insert({
    patron_id: user.id,
    book_id: bookId,
    status: 'queued',
    placed_at: now,
    created_at: now,
    updated_at: now,
  });

  if (insertError) {
    console.error('[holds/place] insert error:', insertError.message);
    return NextResponse.json({ error: 'Failed to place hold. Please try again.' }, { status: 500 });
  }

  // 4. Resolve patron display name / identifier for notifications
  const { data: profileRow } = await supabase
    .from('UserProfile')
    .select('display_name, student_id')
    .eq('user_id', user.id)
    .maybeSingle<{ display_name: string | null; student_id: string | null }>();

  const patronName = profileRow?.display_name ?? user.email ?? '';
  const patronIdentifier = profileRow?.student_id ?? user.email ?? '';

  // 5. Send notifications
  try {
    const { createUserNotification, createNotification } = await import('@/app/lib/supabase/notifications');

    // Patron confirmation
    await createUserNotification(
      user.id,
      'hold_placed',
      'Hold placed successfully',
      bookTitle
        ? `Your hold for "${bookTitle}" has been placed. You will be notified when it is ready for pickup.`
        : 'Your hold has been placed. You will be notified when it is ready for pickup.',
      { bookId, bookTitle, patronName, patronIdentifier },
    );

    // Staff/admin broadcast
    await createNotification(
      'hold_placed',
      'Hold placed',
      bookTitle
        ? `${patronName} placed a hold on "${bookTitle}".`
        : `${patronName} placed a hold on a book.`,
      { bookId, bookTitle, patronName, patronIdentifier },
    );
  } catch (err) {
    console.warn('[holds/place] notification failed:', err);
  }

  return NextResponse.json({ success: true });
}
