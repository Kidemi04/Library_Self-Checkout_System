import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import AdminShell from '@/app/ui/dashboard/adminShell';
import NotificationList from '@/app/ui/dashboard/notificationList';
import type { NotificationFilterType } from '@/app/ui/dashboard/notificationFilter';

interface SearchParams {
  q?: string;
  filter?: string;
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { user } = await getDashboardSession();
  if (!user) redirect('/login');

  const params = await searchParams;
  const q = params.q ?? '';
  const filter = (['all', 'read', 'unread'] as string[]).includes(params.filter ?? '')
    ? (params.filter as NotificationFilterType)
    : 'all';

  const isStaffOrAdmin = user.role === 'staff' || user.role === 'admin';

  return (
    <>
      <title>Notifications</title>

      <AdminShell
        titleSubtitle="Notifications"
        title="Inbox"
        description={
          isStaffOrAdmin
            ? 'Circulation alerts — book borrowals, returns and system events appear here in real time.'
            : 'Your loan confirmations, due-date reminders, and hold alerts appear here.'
        }
      >
        <NotificationList filter={filter} searchQuery={q} />
      </AdminShell>
    </>
  );
}
