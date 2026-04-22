export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getDashboardSession } from '@/app/lib/auth/session';

import AdminShell from '@/app/ui/dashboard/adminShell';
import StudentChat from '@/app/ui/dashboard/studentChat';

export default async function RecommendationsPage() {
  const { user } = await getDashboardSession();
  const displayName = user?.name ?? user?.username ?? user?.email ?? null;

  return (
    <>
      <title>Recommendations | Dashboard</title>

      <AdminShell
        titleSubtitle="Reading assistant"
        title="AI Book Recommendations"
        description="Share what you want to read, and we will recommend books from the Sarawak Campus catalogue."
      >
        <StudentChat studentName={displayName} />
      </AdminShell>
    </>
  );
}
