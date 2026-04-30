import { redirect } from 'next/navigation';
import {
  fetchActiveLoans,
  fetchDashboardSummary,
  fetchActiveHoldsForPatron,
} from '@/app/lib/supabase/queries';
import { getDashboardSession } from '@/app/lib/auth/session';
import StudentDashboard from '@/app/ui/dashboard/student/studentDashboard';
import StaffDashboard from '@/app/ui/dashboard/staff/staffDashboard';

export default async function UserDashboardPage() {
  const { user } = await getDashboardSession();

  if (!user) redirect('/login');
  if (user.role === 'admin') redirect('/dashboard/admin');

  // Student dashboard
  if (user.role === 'user') {
    const [activeLoans, holds] = await Promise.all([
      fetchActiveLoans(undefined, user.id),
      fetchActiveHoldsForPatron(user.id),
    ]);
    return (
      <>
        <title>Dashboard | Swinburne Library</title>
        <StudentDashboard userName={user.name} activeLoans={activeLoans} holds={holds} />
      </>
    );
  }

  // Staff dashboard
  const summary = await fetchDashboardSummary();

  return (
    <>
      <title>Dashboard | Swinburne Library</title>
      <StaffDashboard userName={user.name} summary={summary} />
    </>
  );
}
