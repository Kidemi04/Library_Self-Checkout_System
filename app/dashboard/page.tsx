import { redirect } from 'next/navigation';
import {
  fetchActiveLoans,
  fetchDashboardSummary,
  fetchActiveHoldsForPatron,
  fetchAvailableBooks,
  fetchRecentLoans,
  fetchHoldsForStaff,
} from '@/app/lib/supabase/queries';
import { getDashboardSession } from '@/app/lib/auth/session';
import StudentDashboard, { type BookPick } from '@/app/ui/dashboard/student/studentDashboard';
import StaffDashboard from '@/app/ui/dashboard/staff/staffDashboard';

export default async function UserDashboardPage() {
  const { user } = await getDashboardSession();

  if (!user) redirect('/login');
  if (user.role === 'admin') redirect('/dashboard/admin');

  // Student dashboard
  if (user.role === 'user') {
    const [activeLoans, holds, availableBooks] = await Promise.all([
      fetchActiveLoans(undefined, user.id),
      fetchActiveHoldsForPatron(user.id),
      fetchAvailableBooks(),
    ]);

    const picks: BookPick[] = availableBooks
      .slice(0, 8)
      .map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author ?? 'Unknown author',
        category: b.category ?? null,
        coverImageUrl: b.coverImageUrl ?? null,
      }));

    return (
      <>
        <title>Dashboard | Swinburne Library</title>
        <StudentDashboard
          userName={user.name}
          activeLoans={activeLoans}
          holds={holds}
          picks={picks}
        />
      </>
    );
  }

  // Staff dashboard
  const [summary, recentLoans, allStaffHolds] = await Promise.all([
    fetchDashboardSummary(),
    fetchRecentLoans(6),
    fetchHoldsForStaff(),
  ]);

  const readyHolds = allStaffHolds
    .filter((h) => h.status === 'ready')
    .slice(0, 5)
    .map((h) => ({
      id: h.id,
      patron: h.patron_name,
      bookTitle: h.book_title,
      expiresAt: h.expires_at,
    }));

  return (
    <>
      <title>Dashboard | Swinburne Library</title>
      <StaffDashboard
        userName={user.name}
        summary={summary}
        recentLoans={recentLoans}
        readyHolds={readyHolds}
        readyHoldsCount={allStaffHolds.filter((h) => h.status === 'ready').length}
      />
    </>
  );
}
