import { getSupabaseServerClient } from '@/app/lib/supabase/server';

export type NotificationType = 'checkout' | 'checkin' | 'loan_confirmed' | 'due_soon';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  target_roles: string[];
  target_user_id: string | null;
  metadata: Record<string, string> | null;
  created_at: string;
  is_read: boolean;
}

// ----------------------------------------------------------------
// Write — staff/admin broadcast
// ----------------------------------------------------------------

export async function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  metadata?: Record<string, string>,
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from('notifications').insert({
    type,
    title,
    message,
    metadata: metadata ?? null,
  });
  if (error) console.error('[notifications] createNotification error:', error.message);
}

// ----------------------------------------------------------------
// Write — user-targeted
// ----------------------------------------------------------------

export async function createUserNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  metadata?: Record<string, string>,
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from('notifications').insert({
    type,
    title,
    message,
    target_user_id: userId,
    target_roles: [],
    metadata: metadata ?? null,
  });
  if (error) console.error('[notifications] createUserNotification error:', error.message);
}

/** Returns true if a due_soon notification already exists for this loan+user (idempotency guard). */
export async function dueSoonNotificationExists(loanId: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  const { count } = await supabase
    .from('notifications')
    .select('id', { head: true, count: 'exact' })
    .eq('type', 'due_soon')
    .eq('target_user_id', userId)
    .contains('metadata', { loanId });
  return (count ?? 0) > 0;
}

// ----------------------------------------------------------------
// Read — role-broadcast (staff / admin)
// ----------------------------------------------------------------

function mapRows(
  notifs: Record<string, unknown>[],
  readSet: Set<string>,
): Notification[] {
  return notifs.map((n) => ({
    id: n.id as string,
    type: n.type as NotificationType,
    title: n.title as string,
    message: n.message as string,
    target_roles: (n.target_roles as string[]) ?? [],
    target_user_id: (n.target_user_id as string | null) ?? null,
    metadata: (n.metadata as Record<string, string> | null) ?? null,
    created_at: n.created_at as string,
    is_read: readSet.has(n.id as string),
  }));
}

async function getReadSet(supabase: ReturnType<typeof getSupabaseServerClient>, userId: string, ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const { data: reads } = await supabase
    .from('notification_reads')
    .select('notification_id')
    .eq('user_id', userId)
    .in('notification_id', ids);
  return new Set((reads ?? []).map((r) => r.notification_id as string));
}

export async function fetchNotificationsForRole(
  role: string,
  userId: string,
  filter: 'all' | 'read' | 'unread' = 'all',
  limit = 50,
): Promise<Notification[]> {
  const supabase = getSupabaseServerClient();

  const { data: notifs, error } = await supabase
    .from('notifications')
    .select('*')
    .contains('target_roles', [role])
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !notifs) return [];

  const ids = notifs.map((n) => n.id as string);
  const readSet = await getReadSet(supabase, userId, ids);
  const result = mapRows(notifs as Record<string, unknown>[], readSet);

  if (filter === 'read') return result.filter((n) => n.is_read);
  if (filter === 'unread') return result.filter((n) => !n.is_read);
  return result;
}

// ----------------------------------------------------------------
// Read — user-targeted
// ----------------------------------------------------------------

export async function fetchNotificationsForUser(
  userId: string,
  filter: 'all' | 'read' | 'unread' = 'all',
  limit = 50,
): Promise<Notification[]> {
  const supabase = getSupabaseServerClient();

  const { data: notifs, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('target_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !notifs) return [];

  const ids = notifs.map((n) => n.id as string);
  const readSet = await getReadSet(supabase, userId, ids);
  const result = mapRows(notifs as Record<string, unknown>[], readSet);

  if (filter === 'read') return result.filter((n) => n.is_read);
  if (filter === 'unread') return result.filter((n) => !n.is_read);
  return result;
}

// ----------------------------------------------------------------
// Mark read — shared helpers
// ----------------------------------------------------------------

export async function markNotificationRead(notificationId: string, userId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  await supabase
    .from('notification_reads')
    .upsert(
      { notification_id: notificationId, user_id: userId },
      { onConflict: 'notification_id,user_id' },
    );
}

export async function markAllNotificationsRead(role: string, userId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { data: notifs } = await supabase
    .from('notifications')
    .select('id')
    .contains('target_roles', [role]);

  if (!notifs?.length) return;
  const rows = notifs.map((n) => ({ notification_id: n.id as string, user_id: userId }));
  await supabase.from('notification_reads').upsert(rows, { onConflict: 'notification_id,user_id' });
}

export async function markAllUserNotificationsRead(userId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { data: notifs } = await supabase
    .from('notifications')
    .select('id')
    .eq('target_user_id', userId);

  if (!notifs?.length) return;
  const rows = notifs.map((n) => ({ notification_id: n.id as string, user_id: userId }));
  await supabase.from('notification_reads').upsert(rows, { onConflict: 'notification_id,user_id' });
}
