import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import DashboardTitleBar from '@/app/ui/dashboard/dashboard-title-bar';
import NotificationsFilter from '@/app/ui/dashboard/notification-filter';

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
