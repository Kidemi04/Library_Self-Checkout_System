import { NextResponse } from 'next/server';
import { getDashboardSession } from '@/app/lib/auth/session';
import { createNotification, createUserNotification } from '@/app/lib/supabase/notifications';

export async function POST(request: Request) {
  const { user } = await getDashboardSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { bookTitle } = await request.json();

  const patron = user.name ?? user.email ?? 'A patron';

  await Promise.all([
    // Confirm to the user
    createUserNotification(
      user.id,
      'hold_placed',
      'Hold placed',
      bookTitle
        ? `Your hold for "${bookTitle}" has been placed. We'll notify you when it's ready for pickup.`
        : `Your hold has been placed. We'll notify you when it's ready for pickup.`,
      { bookTitle: bookTitle ?? '' },
    ),
    // Alert staff/admin
    createNotification(
      'hold_placed',
      'New hold request',
      bookTitle
        ? `${patron} has placed a hold on "${bookTitle}".`
        : `${patron} has placed a new hold.`,
      { bookTitle: bookTitle ?? '', patronName: patron },
    ),
  ]);

  return NextResponse.json({ success: true });
}
