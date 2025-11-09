import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';

export default async function AdminLandingPage() {
  const { user } = await getDashboardSession();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  redirect('/dashboard/admin');
}
