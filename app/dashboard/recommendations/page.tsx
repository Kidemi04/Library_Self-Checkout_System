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

      <DashboardTitleBar
        subtitle="Chat With AI"
        title="AI Recommendation"
        description="Enter what you want to learn or explore. 
        We score your catalogue using content signals, simple association rules between tags, 
        and circulation heat to surface relevant titles. 
        This prototype view keeps the logic transparent so you can validate the AI-powered picks."
      />

      <StudentChat studentName={displayName} />
    </main>
  );
}
