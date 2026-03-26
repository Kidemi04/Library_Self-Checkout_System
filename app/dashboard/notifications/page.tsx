import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import DashboardTitleBar from '@/app/ui/dashboard/dashboardTitleBar';
import NotificationsFilter, {
  type NotificationFilterType,
} from '@/app/ui/dashboard/notificationFilter';
import NotificationList from '@/app/ui/dashboard/notificationList';

interface SearchParams {
  q?: string;
  filter?: string;
  sort?: string;
  order?: string;
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
    <main className="space-y-6">
      <title>Notifications</title>
      <DashboardTitleBar
        subtitle="Notifications"
        title="Notifications"
        description={
          isStaffOrAdmin
            ? 'Circulation alerts — book borrowals and returns appear here in real time.'
            : 'Your loan confirmations and return reminders appear here.'
        }
      />

      <NotificationsFilter
        action="/dashboard/notifications"
        defaults={{ q, filter }}
      />

      <NotificationList filter={filter} searchQuery={q} />
    </main>
  );
}
