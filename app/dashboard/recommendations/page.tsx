export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getDashboardSession } from '@/app/lib/auth/session';

import AdminShell from '@/app/ui/dashboard/adminShell';
import BookRecommendations from '@/app/ui/dashboard/bookRecommendations';

export default async function RecommendationsPage() {
  const { user } = await getDashboardSession();
  const displayName = user?.name ?? user?.username ?? user?.email ?? null;

  return (
    <>
      <title>Book Recommendations | Dashboard</title>

      <AdminShell
        titleSubtitle="Reading assistant"
        title="Book Recommendations"
        description="Personalised picks based on your borrowing history and interests."
      >
        <BookRecommendations studentName={displayName} />
      </AdminShell>
    </>
  );
}
