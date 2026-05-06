import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import { fetchManagedUsers } from '@/app/lib/supabase/queries';
import UsersManager from '@/app/ui/dashboard/admin/usersManager';

export default async function UsersPage() {
  const { user } = await getDashboardSession();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/dashboard');

  const initialUsers = await fetchManagedUsers();

  return <UsersManager initialUsers={initialUsers} />;
}
