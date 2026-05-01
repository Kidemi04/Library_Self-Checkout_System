import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import AdminShell from '@/app/ui/dashboard/adminShell';
import FaqHelpCentre from '@/app/ui/dashboard/faqHelpCentre';

const loginRedirect = encodeURIComponent('/dashboard/faq');

export default async function StudentFaqPage() {
  const { user } = await getDashboardSession();

  if (!user) {
    redirect(`/login?callbackUrl=${loginRedirect}`);
  }

  if (user.role === 'admin') {
    redirect('/dashboard/admin');
  }

  if (user.role === 'staff') {
    redirect('/dashboard');
  }

  return (
    <>
      <title>Help Centre | Dashboard</title>

      <AdminShell
        titleSubtitle="Help Centre"
        title="How to use the library"
        description="Step-by-step guides on borrowing, returning, renewals, holds, and fines."
      >
        <FaqHelpCentre />
      </AdminShell>
    </>
  );
}
