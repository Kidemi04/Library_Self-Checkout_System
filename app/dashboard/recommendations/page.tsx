export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getDashboardSession } from '@/app/lib/auth/session';
import StudentChat from '@/app/ui/dashboard/student-chat';

export default async function RecommendationsPage() {
  const { user } = await getDashboardSession();
  const displayName = user?.name ?? user?.username ?? user?.email ?? null;

  return (
    <main className="space-y-8">
      <title>Recommendations | Dashboard</title>

      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <p className="text-xs uppercase tracking-[0.35em] text-swin-ivory/70">Recommendations</p>
        <h1 className="mt-2 text-3xl font-semibold">Book chat</h1>
        <p className="mt-3 max-w-2xl text-sm text-swin-ivory/70">
          Describe what you want to read and receive picks from the catalog.
        </p>
      </header>

      <StudentChat studentName={displayName} />
    </main>
  );
}
