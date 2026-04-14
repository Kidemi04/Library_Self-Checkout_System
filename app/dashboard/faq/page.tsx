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
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
      </svg>
    ),
  },
  {
    title: 'Active loans',
    description: 'See everything you currently have borrowed along with each due date.',
    href: '/dashboard',
    actionLabel: 'View dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0 1 18 9.375v9.375a3 3 0 0 0 3-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 0 0-.673-.05A3 3 0 0 0 15 1.5h-1.5a3 3 0 0 0-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6ZM13.5 3A1.5 1.5 0 0 0 12 4.5h4.5A1.5 1.5 0 0 0 15 3h-1.5Z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375Zm9.586 4.594a.75.75 0 0 0-1.172-.938l-2.476 3.096-.908-.907a.75.75 0 0 0-1.06 1.06l1.5 1.5a.75.75 0 0 0 1.116-.062l3-3.75Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: 'Scan a barcode',
    description: 'Use your camera to identify a book instantly without typing anything.',
    href: '/dashboard/cameraScan',
    actionLabel: 'Open camera scan',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path fillRule="evenodd" d="M3 4.875C3 3.839 3.84 3 4.875 3h4.5c1.036 0 1.875.84 1.875 1.875v4.5C11.25 10.41 10.41 11.25 9.375 11.25h-4.5A1.875 1.875 0 0 1 3 9.375v-4.5Zm1.5 0v4.5c0 .207.168.375.375.375h4.5A.375.375 0 0 0 9.75 9.375v-4.5A.375.375 0 0 0 9.375 4.5h-4.5A.375.375 0 0 0 4.5 4.875Zm0 11.25C4.5 15.089 5.34 14.25 6.375 14.25h1.5c1.036 0 1.875.84 1.875 1.875v1.5C9.75 18.661 8.91 19.5 7.875 19.5h-1.5A1.875 1.875 0 0 1 4.5 17.625v-1.5Zm7.5-11.25C12 3.839 12.84 3 13.875 3h4.5C19.41 3 20.25 3.84 20.25 4.875v4.5c0 1.035-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0 1 12 9.375v-4.5Zm1.5 0v4.5c0 .207.168.375.375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5a.375.375 0 0 0-.375.375Zm-7.5 11.25v1.5c0 .207.168.375.375.375h1.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-1.5a.375.375 0 0 0-.375.375ZM12 12.75c0-.621.504-1.125 1.125-1.125H15a1.125 1.125 0 0 1 0 2.25h-.75v.75a1.125 1.125 0 0 1-2.25 0v-1.875Zm3.75 1.5a1.125 1.125 0 0 1 1.125-1.125H18a1.125 1.125 0 0 1 0 2.25h-.75a1.125 1.125 0 0 1-1.125-1.125Zm-3 3a1.125 1.125 0 0 1 1.125-1.125H15a1.125 1.125 0 0 1 1.125 1.125v2.625a1.125 1.125 0 0 1-2.25 0v-2.625Zm3.75 1.125a1.125 1.125 0 0 1 1.125-1.125H18a1.125 1.125 0 0 1 0 2.25h-.75a1.125 1.125 0 0 1-1.125-1.125Z" clipRule="evenodd" />
      </svg>
    ),
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

      {/* Quick shortcuts — icon row on mobile, full cards on md+ */}
      <section>
        {/* Mobile: single horizontal icon row */}
        <div className="flex items-center justify-around gap-2 md:hidden">
          {quickHelpLinks.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex flex-1 flex-col items-center gap-1.5 rounded-2xl border border-swin-charcoal/10 bg-white px-2 py-3 text-center shadow-sm shadow-swin-charcoal/5 transition hover:border-swin-red/50 hover:bg-swin-red/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-swin-red/10 text-swin-red group-hover:bg-swin-red group-hover:text-white dark:bg-swin-red/20 dark:text-swin-red dark:group-hover:bg-swin-red dark:group-hover:text-white transition">
                {item.icon}
              </span>
              <span className="text-[11px] font-semibold leading-tight text-swin-charcoal dark:text-slate-100">
                {item.title}
              </span>
            </Link>
          ))}
        </div>

        {/* Desktop: full cards */}
        <div className="hidden gap-4 md:grid md:grid-cols-3">
          {quickHelpLinks.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-2xl border border-swin-charcoal/10 bg-white p-5 text-swin-charcoal shadow-md shadow-swin-charcoal/5 transition hover:-translate-y-0.5 hover:border-swin-red/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-black/30"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-swin-red/10 text-swin-red dark:bg-swin-red/20">
                  {item.icon}
                </span>
                <div className="text-xs font-semibold uppercase tracking-wide text-swin-red/80 dark:text-swin-red">Shortcut</div>
              </div>
              <p className="mt-3 text-lg font-semibold dark:text-slate-100">{item.title}</p>
              <p className="mt-2 text-sm text-swin-charcoal/70 dark:text-slate-200">{item.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-swin-red group-hover:gap-1.5 dark:text-swin-red">
                {item.actionLabel}
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Assistant */}
      <FaqAiAssistant />

      <FaqScrollTopButton />
    </main>
  );
}
