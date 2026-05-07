import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import AdminShell from '@/app/ui/dashboard/adminShell';
import HelpCentreLayout from '@/app/ui/dashboard/help/helpCentreLayout';
import { resolveInitialMode } from '@/app/dashboard/help/modeFromQuery';

const loginRedirect = encodeURIComponent('/dashboard/help');

export default async function HelpCentrePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await getDashboardSession();
  if (!user) redirect(`/login?callbackUrl=${loginRedirect}`);
  if (user.role === 'admin') redirect('/dashboard/admin');
  if (user.role === 'staff') redirect('/dashboard');

  const params = searchParams ? await searchParams : {};
  const { mode, topicSlug } = resolveInitialMode(params);
  const studentName = user.name ?? user.username ?? user.email ?? null;

  return (
    <>
      <title>Help Centre | Dashboard</title>
      <AdminShell
        titleSubtitle="Library help"
        title="Help Centre"
        description="Quick answers, AI chat, and book recommendations — all in one place."
      >
        <HelpCentreLayout
          initialMode={mode}
          initialTopicSlug={topicSlug}
          userId={user.id}
          studentName={studentName}
        />
      </AdminShell>
    </>
  );
}
