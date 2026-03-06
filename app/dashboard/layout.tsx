import { redirect } from 'next/navigation';
import FaqQuickPanel from '@/app/ui/dashboard/faq-quick-panel';
import DashboardShell from '@/app/ui/dashboard/dashboard-shell';
import { getDashboardSession } from '@/app/lib/auth/session';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { user, isBypassed } = await getDashboardSession();
  if (!user) redirect('/login');

  return (
    <>
      <DashboardShell user={user} isBypassed={isBypassed}>
        {children}
      </DashboardShell>
      <FaqQuickPanel role={user.role} />
    </>
  );
}
