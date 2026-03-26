import { NextResponse } from 'next/server';
import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import { createUserNotification, dueSoonNotificationExists } from '@/app/lib/supabase/notifications';

const DUE_SOON_DAYS = 3;

export async function POST() {
  const { user } = await getDashboardSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseServerClient();

  // Window: loans due between (now + 2 days) and (now + 4 days) — catches "3 days out"
  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() + DUE_SOON_DAYS - 1);
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + DUE_SOON_DAYS + 1);

  const { data: loans, error } = await supabase
    .from('loans')
    .select(`
      id,
      due_at,
      copy:copies(
        barcode,
        book:books(title)
      )
    `)
    .eq('user_id', user.id)
    .is('returned_at', null)
    .gte('due_at', windowStart.toISOString())
    .lte('due_at', windowEnd.toISOString());

  if (error) {
    console.error('[due-check] loan lookup failed:', error.message);
    return NextResponse.json({ error: 'Failed to check loans' }, { status: 500 });
  }

  let created = 0;

  for (const loan of loans ?? []) {
    // Idempotency: skip if we already sent a due_soon for this loan
    const exists = await dueSoonNotificationExists(loan.id, user.id);
    if (exists) continue;

    const copy = loan.copy as { barcode?: string; book?: { title?: string } } | null;
    const bookTitle = copy?.book?.title ?? copy?.barcode ?? 'Your borrowed book';
    const dueDate = new Date(loan.due_at).toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    await createUserNotification(
      user.id,
      'due_soon',
      'Return reminder',
      `"${bookTitle}" is due back in ${DUE_SOON_DAYS} days, on ${dueDate}. Please return it on time to avoid late fees.`,
      { bookTitle, dueAt: loan.due_at, loanId: loan.id, barcode: copy?.barcode ?? '' },
    );

    created++;
  }

  return NextResponse.json({ checked: (loans ?? []).length, created });
}
