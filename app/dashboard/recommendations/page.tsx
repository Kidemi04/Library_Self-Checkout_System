export const dynamic = 'force-dynamic';
export const revalidate = 0;

import DashboardTitleBar from '@/app/ui/dashboard/dashboard-title-bar';
import RecommendationLab from '@/app/ui/dashboard/recommendations/recommendation-lab';
import { fetchBooks } from '@/app/lib/supabase/queries';

export default async function RecommendationsPage() {
  const books = await fetchBooks();

  return (
    <main className="space-y-8">
      <title>Recommendations | Dashboard</title>
      <DashboardTitleBar
        subtitle="Recommendation lab"
        title="AI-powered book picks"
        description="Enter what you want to learn or explore. 
        We score your catalogue using content signals, simple association rules between tags, 
        and circulation heat to surface relevant titles. 
        This prototype view keeps the logic transparent so you can validate the AI-powered picks."
      />

      <RecommendationLab books={books} />
    </main>
  );
}
