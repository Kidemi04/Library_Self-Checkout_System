export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getDashboardSession } from '@/app/lib/auth/session';

import DashboardTitleBar from '@/app/ui/dashboard/dashboardTitleBar';
import ChatWithLearningPath from '@/app/ui/dashboard/chatWithLearningPath';

export default async function RecommendationsPage() {
  const { user } = await getDashboardSession();
  const displayName = user?.name ?? user?.username ?? user?.email ?? null;

  return (
    <main className="space-y-8">
      <title>Recommendations | Dashboard</title>

      <DashboardTitleBar
        subtitle="Reading assistant"
        title="AI Book Recommendations"
        description="Share what you want to read, and I will recommend books from the catalog"
      />

      <ChatWithLearningPath studentName={displayName} userId={user?.id} />
    </main>
  );
}
