import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import { studentFaqSections } from '@/app/ui/dashboard/student-faq-data';

const quickHelpLinks = [
  {
    title: 'Borrowing checklist',
    description: 'Start a self-checkout, search for a title, or scan the barcode directly.',
    href: '/dashboard/check-out',
    actionLabel: 'Open Borrow Books',
  },
  {
    title: 'Active loans',
    description: 'Keep track of who currently holds each item and extend loans when possible.',
    href: '/dashboard',
    actionLabel: 'View dashboard',
  },
  {
    title: 'Notifications',
    description: 'Review reminders about due dates, holds, and renewals in one place.',
    href: '/dashboard/notifications',
    actionLabel: 'Go to notifications',
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
      <title>Student FAQ | Dashboard</title>

      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30 dark:bg-slate-900 dark:text-slate-100 dark:shadow-black/40">
        <p className="text-xs uppercase tracking-[0.2em] text-swin-ivory/70">Need help fast?</p>
        <h1 className="mt-2 text-3xl font-semibold">Student FAQ</h1>
        <p className="mt-3 text-sm text-swin-ivory/70">
          Everything you need to borrow, return, and manage your account with confidence. These answers are tailored
          for student access inside the self-checkout dashboard.
        </p>
      </header>

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

      {studentFaqSections.map((section) => (
        <section key={section.id} aria-labelledby={`${section.id}-title`} className="space-y-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-swin-charcoal/60 dark:text-slate-400">Topic</p>
            <h2 id={`${section.id}-title`} className="text-xl font-semibold text-swin-charcoal dark:text-slate-100">
              {section.title}
            </h2>
            <p className="text-sm text-swin-charcoal/70 dark:text-slate-300">{section.description}</p>
          </div>
          <div className="space-y-4">
            {section.items.map((item, index) => (
              <details
                key={`${section.id}-${index}`}
                className="group rounded-2xl border border-swin-charcoal/10 bg-white/95 p-5 shadow-sm shadow-swin-charcoal/5 transition hover:border-swin-red/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-black/30 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-start gap-4 text-left">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-swin-charcoal/15 bg-swin-ivory text-sm font-semibold text-swin-red group-open:bg-swin-red group-open:text-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-swin-charcoal dark:text-slate-100">{item.question}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-swin-charcoal/60 group-open:hidden dark:text-slate-400">
                      Tap to expand
                    </p>
                    <p className="mt-1 hidden text-xs font-medium uppercase tracking-wide text-swin-red group-open:block">
                      Tap to close
                    </p>
                  </div>
                </summary>
                <div className="mt-4 border-t border-swin-charcoal/10 pt-4 text-sm text-swin-charcoal/80 dark:border-slate-700 dark:text-slate-200">
                  <div className="space-y-3 leading-relaxed">
                    {item.answer.map((paragraph, paragraphIndex) => (
                      <p key={`${section.id}-${index}-paragraph-${paragraphIndex}`}>{paragraph}</p>
                    ))}
                  </div>
                  {item.tags ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={`${section.id}-${tag}`}
                          className="rounded-full border border-swin-charcoal/15 bg-swin-ivory px-3 py-1 text-xs font-semibold uppercase tracking-wide text-swin-charcoal/70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {item.contactLink ? (
                    <p className="mt-4 text-sm">
                      Need a human?{' '}
                      <a
                        href={item.contactLink.href}
                        className="font-semibold text-swin-red underline-offset-4 hover:underline"
                      >
                        {item.contactLink.label}
                      </a>
                    </p>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-2xl border border-swin-charcoal/10 bg-swin-ivory/70 p-6 text-swin-charcoal shadow-inner shadow-swin-charcoal/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:shadow-black/30">
        <div className="flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-base font-semibold">Still need help?</p>
            <p className="mt-1 text-swin-charcoal/70 dark:text-slate-300">
              Visit the service desk on Level 1 or email
              {' '}
              <a href="mailto:library@swinburne.edu.my" className="font-semibold text-swin-red hover:underline">
                library@swinburne.edu.my
              </a>{' '}
              with your student ID.
            </p>
          </div>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center justify-center rounded-lg border border-swin-red/40 bg-white px-4 py-2 text-sm font-semibold text-swin-red shadow-sm transition hover:bg-swin-red hover:text-white dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-swin-red dark:hover:text-white"
          >
            Update my contact details
          </Link>
        </div>
      </section>
    </main>
  );
}
