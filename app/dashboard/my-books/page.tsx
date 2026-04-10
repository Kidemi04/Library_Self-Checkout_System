import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import {
  fetchActiveLoans,
  fetchActiveHoldsForPatron,
  fetchLoanHistory,
  fetchHoldsForBook,
} from '@/app/lib/supabase/queries';
import DashboardTitleBar from '@/app/ui/dashboard/dashboardTitleBar';
import MyBooksTabs from '@/app/ui/dashboard/student/myBooksTabs';

type Tab = 'current' | 'history' | 'reservations';

export default async function MyBooksPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const { user } = await getDashboardSession();

  if (!user) {
    redirect('/login');
  }

  // Only students use this page; staff/admin have their own views
  if (user.role !== 'user') {
    redirect('/dashboard');
  }

  const params = searchParams ? await searchParams : undefined;
  const rawTab = params?.tab;
  const tabParam = (Array.isArray(rawTab) ? rawTab[0] : rawTab) as Tab | undefined;
  const defaultTab: Tab =
    tabParam === 'history' || tabParam === 'reservations' ? tabParam : 'current';

  const [activeLoans, loanHistory, holds] = await Promise.all([
    fetchActiveLoans(undefined, user.id),
    fetchLoanHistory(user.id, 30),
    fetchActiveHoldsForPatron(user.id),
  ]);

  // Fetch hold counts for each active loan's book (for renewal validation)
  const uniqueBookIds = [
    ...new Set(activeLoans.map((l) => l.bookId).filter(Boolean) as string[]),
  ];
  const holdCountEntries = await Promise.all(
    uniqueBookIds.map(async (bookId) => {
      const count = await fetchHoldsForBook(bookId);
      return [bookId, count] as [string, number];
    }),
  );
  const holdCounts = Object.fromEntries(holdCountEntries);

  return (
    <main className="space-y-8">
      <title>My Books | Dashboard</title>

      <DashboardTitleBar
        subtitle="My Books"
        title="Your Library"
        description="View your current loans, borrowing history, and active reservations."
      />

      <MyBooksTabs
        activeLoans={activeLoans}
        loanHistory={loanHistory}
        holds={holds}
        defaultTab={defaultTab}
        holdCounts={holdCounts}
      />
    </main>
  );
}
