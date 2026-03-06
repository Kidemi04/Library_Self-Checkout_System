export const dynamic = 'force-dynamic';
export const revalidate = 0;

import RecommendationLab from '@/app/ui/dashboard/recommendations/recommendation-lab';
import { fetchBooks } from '@/app/lib/supabase/queries';

export default async function RecommendationsPage() {
  const books = await fetchBooks();

  return (
    <main className="space-y-8">
      <title>Recommendations | Dashboard</title>
      <RecommendationLab books={books} />
    </main>
  );
}
