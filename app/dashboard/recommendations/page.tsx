export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getDashboardSession } from '@/app/lib/auth/session';

import DashboardTitleBar from '@/app/ui/dashboard/dashboardTitleBar';
import StudentChat from '@/app/ui/dashboard/studentChat';

export default async function RecommendationsPage() {
  const { user } = await getDashboardSession();
  const displayName = user?.name ?? user?.username ?? user?.email ?? null;

  return (
    <main className="space-y-8">
      <title>Recommendations | Dashboard</title>

      <StudentChat studentName={displayName} />
    </main>
  );
}
