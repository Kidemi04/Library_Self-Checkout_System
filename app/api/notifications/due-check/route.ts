import { NextResponse } from 'next/server';
import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import { createUserNotification, dueSoonNotificationExists } from '@/app/lib/supabase/notifications';

const DUE_SOON_DAYS = 3;

export async function POST() {
  const { user } = await getDashboardSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseServerClient();

  // Catch any unreturned loan due within the next 3 days (including today/overdue)
  const now = new Date();
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + DUE_SOON_DAYS);

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
    .lte('due_at', windowEnd.toISOString());

  if (error) {
    console.error('[due-check] loan lookup failed:', error.message);
    return NextResponse.json({ error: 'Failed to check loans' }, { status: 500 });
  }

  let created = 0;

  const todayKey = now.toISOString().slice(0, 10); // YYYY-MM-DD

  for (const loan of loans ?? []) {
    // Idempotency: skip if we already sent a due_soon for this loan TODAY
    const exists = await dueSoonNotificationExists(loan.id, user.id, todayKey);
    if (exists) continue;

    const copy = loan.copy as { barcode?: string; book?: { title?: string } } | null;
    const bookTitle = copy?.book?.title ?? copy?.barcode ?? 'Your borrowed book';
    const dueDate = new Date(loan.due_at).toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.ceil((new Date(loan.due_at).getTime() - now.getTime()) / msPerDay);
    const daysText =
      daysLeft <= 0 ? 'today — it may already be overdue' : daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`;

    await createUserNotification(
      user.id,
      'due_soon',
      'Return reminder',
      `"${bookTitle}" is due back ${daysText}, on ${dueDate}. Please return it on time to avoid late fees.`,
      { bookTitle, dueAt: loan.due_at, loanId: loan.id, barcode: copy?.barcode ?? '', date: todayKey },
    );

    created++;
  }

  return NextResponse.json({ checked: (loans ?? []).length, created });
}
