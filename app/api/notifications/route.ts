import { NextResponse } from 'next/server';
import { requireStaff, ForbiddenError, UnauthorizedError } from '@/auth';
import { isDevAuthBypassed, getDevBypassUserId, getDevBypassRole } from '@/app/lib/auth/env';
import { getDashboardSession } from '@/app/lib/auth/session';
import {
  fetchNotificationsForRole,
  fetchNotificationsForUser,
  markNotificationRead,
  markAllNotificationsRead,
  markAllUserNotificationsRead,
} from '@/app/lib/supabase/notifications';
import type { DashboardRole } from '@/app/lib/auth/types';

// Resolve the current session for any role
async function getSessionUser(): Promise<{ id: string; role: DashboardRole } | null> {
  // Dev bypass
  if (isDevAuthBypassed) {
    const role = getDevBypassRole();
    return { id: getDevBypassUserId(), role };
  }

  // Staff / admin — use requireStaff which validates the JWT
  try {
    const user = await requireStaff();
    return { id: user.id, role: user.role };
  } catch (err) {
    if (!(err instanceof UnauthorizedError) && !(err instanceof ForbiddenError)) throw err;
  }

  // Regular user — fall back to the full session helper
  const { user } = await getDashboardSession();
  if (!user) return null;
  return { id: user.id, role: user.role };
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filter = (searchParams.get('filter') ?? 'all') as 'all' | 'read' | 'unread';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);

  const notifications =
    user.role === 'staff' || user.role === 'admin'
      ? await fetchNotificationsForRole(user.role, user.id, filter, limit)
      : await fetchNotificationsForUser(user.id, filter, limit);

  return NextResponse.json({ notifications });
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();

  if (body.markAll === true) {
    if (user.role === 'staff' || user.role === 'admin') {
      await markAllNotificationsRead(user.role, user.id);
    } else {
      await markAllUserNotificationsRead(user.id);
    }
  } else if (typeof body.notificationId === 'string') {
    await markNotificationRead(body.notificationId, user.id);
  } else {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
