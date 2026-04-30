import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import { studentFaqSections } from '@/app/ui/dashboard/studentFaqData';
import FaqScrollTopButton from '@/app/ui/dashboard/faqScrollTopButton';
import AdminShell from '@/app/ui/dashboard/adminShell';

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
    <>
      <title>Student FAQ | Dashboard</title>

      <AdminShell
        titleSubtitle="Student Guide"
        title="How to Use the Library System"
        description="A step-by-step guide to borrowing, returning, and managing your loans. Learn about the 14-day loan period, due dates, renewals, and how to use the barcode scanner."
      >
        <div className="space-y-8">
          <section className="grid gap-4 md:grid-cols-3">
            {quickHelpLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-card border border-hairline bg-surface-card p-5 text-ink transition hover:-translate-y-0.5 hover:border-primary/40 dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark"
              >
                <div className="font-sans text-caption-uppercase text-primary">Shortcut</div>
                <p className="mt-2 font-display text-title-lg text-ink dark:text-on-dark">{item.title}</p>
                <p className="mt-2 font-sans text-body-sm text-body dark:text-on-dark/80">{item.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 font-sans text-body-sm font-semibold text-primary group-hover:gap-1.5">
                  {item.actionLabel}
                  <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </section>

          {studentFaqSections.map((section) => (
            <section key={section.id} aria-labelledby={`${section.id}-title`} className="space-y-4">
              <div className="flex flex-col gap-2">
                <p className="font-sans text-caption-uppercase tracking-[0.3em] text-muted dark:text-on-dark-soft">Topic</p>
                <h2 id={`${section.id}-title`} className="font-display text-display-sm text-ink dark:text-on-dark">
                  {section.title}
                </h2>
                <p className="font-sans text-body-sm text-body dark:text-on-dark/80">{section.description}</p>
              </div>
              <div className="space-y-4">
                {section.items.map((item, index) => (
                  <details
                    key={`${section.id}-${index}`}
                    className="group rounded-card border border-hairline bg-surface-card p-5 transition hover:border-primary/30 dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer items-start gap-4 text-left">
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-hairline bg-surface-cream-strong font-sans text-body-sm font-semibold text-primary group-open:bg-primary group-open:text-on-primary group-open:border-transparent dark:border-dark-hairline dark:bg-dark-surface-strong dark:text-dark-primary dark:group-open:bg-dark-primary dark:group-open:text-on-primary">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <p className="font-sans text-body-md font-semibold text-ink dark:text-on-dark">{item.question}</p>
                        <p className="mt-1 font-sans text-caption-uppercase text-muted group-open:hidden dark:text-on-dark-soft">
                          Tap to expand
                        </p>
                        <p className="mt-1 hidden font-sans text-caption-uppercase text-primary group-open:block">
                          Tap to close
                        </p>
                      </div>
                    </summary>
                    <div className="mt-4 border-t border-hairline pt-4 font-sans text-body-sm text-body dark:border-dark-hairline dark:text-on-dark/85">
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
                              className="rounded-pill border border-hairline bg-surface-cream-strong px-3 py-1 font-sans text-caption-uppercase text-muted dark:border-dark-hairline dark:bg-dark-surface-strong dark:text-on-dark-soft"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {item.contactLink ? (
                        <p className="mt-4 font-sans text-body-sm">
                          Need a human?{' '}
                          <a
                            href={item.contactLink.href}
                            className="font-semibold text-primary underline-offset-4 hover:underline"
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

          <section className="rounded-card border border-hairline bg-surface-cream-strong/60 p-6 text-ink dark:border-dark-hairline dark:bg-dark-surface-strong/60 dark:text-on-dark">
            <div className="flex flex-col gap-3 font-sans text-body-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-sans text-body-md font-semibold">Still need help?</p>
                <p className="mt-1 text-body dark:text-on-dark/80">
                  Visit the service desk on Level 1 or email
                  {' '}
                  <a href="mailto:library@swinburne.edu.my" className="font-semibold text-primary hover:underline">
                    library@swinburne.edu.my
                  </a>{' '}
                  with your student ID.
                </p>
              </div>
              <Link
                href="/dashboard/profile"
                className="inline-flex h-10 items-center justify-center rounded-btn border border-primary/40 bg-surface-card px-4 font-sans text-button text-primary transition hover:bg-primary hover:text-on-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:bg-dark-surface-card dark:focus-visible:ring-offset-dark-canvas"
              >
                Update my contact details
              </Link>
            </div>
          </section>
          <FaqScrollTopButton />
        </div>
      </AdminShell>
    </>
  );
}
