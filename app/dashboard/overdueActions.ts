'use server';

import { revalidatePath } from 'next/cache';
import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import { createUserNotification } from '@/app/lib/supabase/notifications';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export type SendReminderResult =
  | { ok: true; lastRemindedAt: string }
  | { ok: false; reason: 'unauthorized' | 'not_overdue' | 'too_recent' | 'failed'; message: string };

export async function sendReminder(loanId: string): Promise<SendReminderResult> {
  const { user } = await getDashboardSession();
  if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
    return { ok: false, reason: 'unauthorized', message: 'Not allowed.' };
  }

  const supabase = getSupabaseServerClient();
  const nowIso = new Date().toISOString();

  const { data: loan, error: loadError } = await supabase
    .from('Loans')
    .select(`
      id, user_id, due_at, returned_at, last_reminded_at,
      copy:Copies(book:Books(title))
    `)
    .eq('id', loanId)
    .maybeSingle();

  if (loadError || !loan) {
    return { ok: false, reason: 'failed', message: 'Loan not found.' };
  }

  const loanRow = loan as {
    id: string;
    user_id: string;
    due_at: string;
    returned_at: string | null;
    last_reminded_at: string | null;
    copy: unknown;
  };

  if (loanRow.returned_at || new Date(loanRow.due_at).getTime() >= Date.now()) {
    return { ok: false, reason: 'not_overdue', message: 'This loan is no longer overdue.' };
  }
  if (loanRow.last_reminded_at && Date.now() - new Date(loanRow.last_reminded_at).getTime() < ONE_DAY_MS) {
    return { ok: false, reason: 'too_recent', message: 'A reminder was already sent within the last 24 hours.' };
  }

  const copyRow = (Array.isArray(loanRow.copy) ? loanRow.copy[0] : loanRow.copy) as { book?: unknown } | null;
  const bookRowRaw = copyRow?.book;
  const bookRow = (Array.isArray(bookRowRaw) ? bookRowRaw[0] : bookRowRaw) as { title?: string } | null;
  const title = bookRow?.title ?? 'a library book';
  const daysOverdue = Math.floor((Date.now() - new Date(loanRow.due_at).getTime()) / ONE_DAY_MS);

  // Schema note: Notifications table uses (type, message, target_user_id) — not
  // (kind, body, user_id) — and the type CHECK constraint does not include
  // 'overdue_reminder'. We use 'due_soon' (closest semantic fit for an
  // overdue/due reminder) and stash the original kind in metadata so the UI
  // can still distinguish admin-sent overdue reminders from automated ones.
  try {
    await createUserNotification(
      loanRow.user_id,
      'due_soon',
      'Overdue loan reminder',
      `Your loan of "${title}" is ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue. Please return it as soon as possible.`,
      { loanId: loanRow.id, kind: 'overdue_reminder', sentBy: user.id },
    );
  } catch (err) {
    console.error('[sendReminder] notif insert failed', err);
    return { ok: false, reason: 'failed', message: 'Could not write notification.' };
  }

  const { error: updateError } = await supabase
    .from('Loans')
    .update({ last_reminded_at: nowIso, last_reminded_by: user.id })
    .eq('id', loanId);
  if (updateError) {
    console.error('[sendReminder] loan update failed', updateError);
    return { ok: false, reason: 'failed', message: 'Could not record reminder.' };
  }

  revalidatePath('/dashboard/admin/overdue');
  return { ok: true, lastRemindedAt: nowIso };
}
