import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import FaqAiAssistant from '@/app/ui/dashboard/faqAiAssistant';
import FaqScrollTopButton from '@/app/ui/dashboard/faqScrollTopButton';
import DashboardTitleBar from '@/app/ui/dashboard/dashboardTitleBar';

const quickHelpLinks = [
  {
    title: 'Borrow a book',
    description: 'Search by title or scan the barcode to start a 14-day self-checkout right now.',
    href: '/dashboard/book/checkout',
    actionLabel: 'Open Borrow Books',
  },
  {
    title: 'View active loans',
    description: 'See everything you currently have borrowed along with each due date.',
    href: '/dashboard',
    actionLabel: 'View dashboard',
  },
  {
    title: 'Scan a barcode',
    description: 'Use your camera to identify a book instantly without typing anything.',
    href: '/dashboard/cameraScan',
    actionLabel: 'Open camera scan',
  },
];

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
    <main className="space-y-8">
      <title>AI Assistant | Dashboard</title>

      <DashboardTitleBar
        subtitle="Library Assistant"
        title="Ask me anything"
        description="Get instant step-by-step guidance on borrowing, returning, due dates, and using the barcode scanner. Just ask a question and I will walk you through it."
      />

      {/* Quick shortcuts */}
      <section className="grid gap-4 md:grid-cols-3">
        {quickHelpLinks.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group rounded-2xl border border-swin-charcoal/10 bg-white p-5 text-swin-charcoal shadow-md shadow-swin-charcoal/5 transition hover:-translate-y-0.5 hover:border-swin-red/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-black/30"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-swin-red/80 dark:text-swin-red">Shortcut</div>
            <p className="mt-2 text-lg font-semibold dark:text-slate-100">{item.title}</p>
            <p className="mt-2 text-sm text-swin-charcoal/70 dark:text-slate-200">{item.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-swin-red group-hover:gap-1.5 dark:text-swin-red">
              {item.actionLabel}
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </section>

      {/* AI Assistant */}
      <FaqAiAssistant />

      <FaqScrollTopButton />
    </main>
  );
}
