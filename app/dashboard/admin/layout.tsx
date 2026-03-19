import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import DashboardTitleBar from '@/app/ui/dashboard/dashboard-title-bar';
import DashboardUserCard from '@/app/ui/dashboard/dashboard-user-card';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isBypassed } = await getDashboardSession();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'staff' && user.role !== 'admin') {
    redirect('/dashboard');
  }

  const roleLabel = user.role === 'admin' ? 'Admin' : 'Staff';

  return (
    <div className="space-y-8">
      <DashboardTitleBar
        subtitle="Admin Control Center"
        title={`Good day, ${user.name}`}
        description={`
          Full catalogue and circulation access enabled for this session.
          ${isBypassed ? ( "Development bypass active") : ""}
        `}
        rightSlot={<DashboardUserCard email={user.email} role={user.role} />}
      />

      <div className="space-y-8">{children}</div>
    </div>
  );
}
