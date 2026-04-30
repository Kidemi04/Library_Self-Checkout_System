import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import StudentChat from '@/app/ui/dashboard/studentChat';
import AdminShell from '@/app/ui/dashboard/adminShell';
import { userNeedsOnboarding } from '@/app/lib/recommendations/user-context';

const supportFacts = [
  {
    title: 'Weekday coverage',
    detail: 'Mon-Fri | 8:00 AM - 9:00 PM',
    description: 'Librarians monitor every conversation during staffed hours.',
  },
  {
    title: 'After-hours follow up',
    detail: 'Auto replies + email handoff',
    description: 'Leave your question and we will email your student account within one business day.',
  },
  {
    title: 'Call us directly',
    detail: '+6082 260936',
    description: 'Use the hotline for urgent equipment, facility, or access issues.',
  },
];

const resourceLinks = [
  {
    title: 'Borrowing FAQ',
    description: 'Find answers about limits, renewals, and return windows.',
    href: '/dashboard/faq',
    action: 'Open FAQ',
  },
  {
    title: 'Active loans',
    description: 'Check what you currently have out and renew items when allowed.',
    href: '/dashboard',
    action: 'Go to dashboard',
  },
  {
    title: 'Notifications',
    description: 'Review upcoming due reminders, holds, and staff announcements.',
    href: '/dashboard/notifications',
    action: 'View alerts',
  },
];

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

  const displayName = user.name ?? user.username ?? user.email ?? null;

  let needsOnboarding = false;
  try {
    needsOnboarding = await userNeedsOnboarding(user.id);
  } catch {
    // Non-fatal: default to not showing onboarding
  }

  return (
    <>
      <title>Chat Support | Dashboard</title>

      <AdminShell
        titleSubtitle="Talk to us"
        title="Student chat support"
        description="Get real-time help with loans, holds, or account issues. Messages stay synced with your student account so you can pick up the conversation on any device."
      >
        <div className="space-y-6">
          <section className="grid gap-3 md:grid-cols-3">
            {supportFacts.map((fact) => (
              <div
                key={fact.title}
                className="rounded-card border border-hairline bg-surface-card p-5 dark:border-dark-hairline dark:bg-dark-surface-card"
              >
                <p className="font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">
                  {fact.title}
                </p>
                <p className="mt-2 font-display text-title-lg text-ink dark:text-on-dark tracking-tight">
                  {fact.detail}
                </p>
                <p className="mt-1 font-sans text-body-sm text-muted dark:text-on-dark-soft">{fact.description}</p>
              </div>
            ))}
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
            <StudentChat studentName={displayName} needsOnboarding={needsOnboarding} userId={user.id} />

            <aside className="space-y-4">
              <div className="rounded-card border border-hairline bg-surface-card p-6 dark:border-dark-hairline dark:bg-dark-surface-card">
                <p className="font-sans text-caption-uppercase tracking-[0.35em] text-muted dark:text-on-dark-soft">When to use chat</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 font-sans text-body-sm text-body dark:text-on-dark/85">
                  <li>Need help locating or renewing an item while you are on the go.</li>
                  <li>Want to confirm fines, holds, or equipment availability.</li>
                  <li>Have issues with the barcode scanner or the self-checkout flow.</li>
                </ul>
                <p className="mt-4 font-sans text-body-sm text-muted dark:text-on-dark-soft">
                  For official paperwork or appeals, please follow up via email so we can send attachments.
                </p>
              </div>

              <div className="rounded-card border border-hairline bg-surface-cream-strong/60 p-6 dark:border-dark-hairline dark:bg-dark-surface-strong/60">
                <h3 className="font-display text-display-sm text-ink dark:text-on-dark">Helpful links</h3>
                <div className="mt-3 space-y-3">
                  {resourceLinks.map((link) => (
                    <Link
                      key={link.title}
                      href={link.href}
                      className="block rounded-card border border-hairline bg-surface-card px-4 py-3 text-ink transition hover:border-primary/40 hover:-translate-y-0.5 dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark"
                    >
                      <p className="font-sans text-body-sm font-semibold">{link.title}</p>
                      <p className="font-sans text-caption text-muted dark:text-on-dark-soft">{link.description}</p>
                      <span className="mt-2 inline-flex items-center gap-1 font-sans text-caption font-semibold text-primary">
                        {link.action}
                        <span aria-hidden="true">-&gt;</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-card border border-hairline bg-surface-card p-6 font-sans text-body-sm text-ink dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark">
                <h3 className="font-display text-display-sm text-ink dark:text-on-dark">Need a transcript?</h3>
                <p className="mt-2 text-body dark:text-on-dark/85">
                  Email the library team and mention the chat so we can attach the conversation log for your records.
                </p>
                <a
                  href="mailto:library@swinburne.edu.my?subject=Student%20chat%20follow-up"
                  className="mt-3 inline-flex items-center font-semibold text-primary hover:underline"
                >
                  library@swinburne.edu.my
                </a>
                <p className="mt-2 font-sans text-caption text-muted dark:text-on-dark-soft">Include your student ID for faster assistance.</p>
              </div>
            </aside>
          </div>
        </div>
      </AdminShell>
    </>
  );
}
