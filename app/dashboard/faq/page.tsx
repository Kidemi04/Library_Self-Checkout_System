import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import FaqAiAssistant from '@/app/ui/dashboard/faqAiAssistant';

const loginRedirect = encodeURIComponent('/dashboard/faq');

export default async function StudentFaqPage() {
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
    <main>
      <title>AI Assistant | Dashboard</title>
      <FaqAiAssistant />
    </main>
  );
}
