import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import DashboardTitleBar from '@/app/ui/dashboard/dashboardTitleBar';
import NotificationsFilter from '@/app/ui/dashboard/notificationFilter';

export default async function NotificationsPage() {
  const { user } = await getDashboardSession();
  if (!user) { redirect('/login'); }

  return (
    <main className="space-y-6">
      <title>Notifications</title>
      <DashboardTitleBar
        subtitle='Notifications'
        title='Notifications'
        description='Alerts about due dates, holds, and system updates will appear here. Stay tuned!'
      />

      <NotificationsFilter/>

    </main>
  );
}
