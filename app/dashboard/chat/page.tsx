import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import AdminShell from '@/app/ui/dashboard/adminShell';
import ChatAssistant from '@/app/ui/dashboard/chatAssistant';

const loginRedirect = encodeURIComponent('/dashboard/chat');

export default async function StudentChatPage() {
  const { user } = await getDashboardSession();

  if (!user) {
    redirect(`/login?callbackUrl=${loginRedirect}`);
  }

  if (user.role === 'admin') {
    redirect('/dashboard/admin');
  }

  if (user.role === 'staff') {
    redirect('/dashboard');
  }

  return (
    <>
      <title>Chat Assistant | Dashboard</title>

      <AdminShell
        titleSubtitle="Support"
        title="Chat Assistant"
        description="Ask about loans, holds, renewals, or get help finding books."
      >
        <ChatAssistant />
      </AdminShell>
    </>
  );
}
