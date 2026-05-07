import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import AdminShell from '@/app/ui/dashboard/adminShell';

const loginRedirect = encodeURIComponent('/dashboard/reading-assistant');

export default async function ReadingAssistantPage() {
  const { user } = await getDashboardSession();
  if (!user) redirect(`/login?callbackUrl=${loginRedirect}`);
  if (user.role === 'admin') redirect('/dashboard/admin');
  if (user.role === 'staff') redirect('/dashboard');

  return (
    <>
      <title>Reading Assistant | Dashboard</title>
      <AdminShell
        titleSubtitle="Library AI"
        title="Reading Assistant"
        description="Ask anything — find books, get help with loans, holds, fines, and more."
      >
        <div className="rounded-card border border-hairline bg-surface-card p-8 text-center dark:border-dark-hairline dark:bg-dark-surface-card">
          <p className="font-display text-display-sm text-ink dark:text-on-dark">Coming online…</p>
          <p className="mt-2 font-sans text-body-md text-muted dark:text-on-dark-soft">
            The reading assistant is being wired up.
          </p>
        </div>
      </AdminShell>
    </>
  );
}
