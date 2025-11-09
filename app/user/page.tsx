import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';

export default async function UserLandingPage() {
  const { user } = await getDashboardSession();

  if (!user) {
    redirect('/login');
  }

  redirect('/dashboard');
}
