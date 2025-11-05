import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';

export default async function StaffLandingPage() {
  const { user } = await getDashboardSession();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'staff' && user.role !== 'admin') {
    redirect('/dashboard');
  }

  redirect('/dashboard/check-out');
}
