import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import { fetchBooks } from '@/app/lib/supabase/queries';
import StudentChat from '@/app/ui/dashboard/student-chat';

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

  const books = await fetchBooks();
  const displayName = user.name ?? user.username ?? user.email ?? null;

  return (
    <main className="space-y-8">
      <title>Chat Support | Dashboard</title>

      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <p className="text-xs uppercase tracking-[0.35em] text-swin-ivory/70">Talk to us</p>
        <h1 className="mt-2 text-3xl font-semibold">Student chat support</h1>
        <p className="mt-3 max-w-2xl text-sm text-swin-ivory/70">
          Get real-time help with loans, holds, or account issues. Messages stay synced with your student account so
          you can pick up the conversation on any device.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {supportFacts.map((fact) => (
            <div
              key={fact.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm shadow-inner shadow-swin-charcoal/20"
            >
              <p className="text-xs uppercase tracking-wide text-swin-ivory/70">{fact.title}</p>
              <p className="mt-2 text-base font-semibold text-white">{fact.detail}</p>
              <p className="mt-1 text-xs text-swin-ivory/70">{fact.description}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <StudentChat studentName={displayName} books={books} />

        <aside className="space-y-4">
          <div className="rounded-3xl border border-swin-charcoal/10 bg-white p-5 shadow-lg shadow-swin-charcoal/5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-swin-charcoal/60">When to use chat</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-swin-charcoal/80">
              <li>Need help locating or renewing an item while you are on the go.</li>
              <li>Want to confirm fines, holds, or equipment availability.</li>
              <li>Have issues with the barcode scanner or the self-checkout flow.</li>
            </ul>
            <p className="mt-4 text-sm text-swin-charcoal/70">
              For official paperwork or appeals, please follow up via email so we can send attachments.
            </p>
          </div>

          <div className="rounded-3xl border border-swin-charcoal/10 bg-swin-ivory/70 p-5 shadow-inner shadow-swin-charcoal/10">
            <h3 className="text-base font-semibold text-swin-charcoal">Helpful links</h3>
            <div className="mt-3 space-y-3 text-sm">
              {resourceLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="block rounded-2xl border border-swin-charcoal/10 bg-white px-4 py-3 text-swin-charcoal shadow-sm transition hover:border-swin-red/60 hover:-translate-y-0.5"
                >
                  <p className="text-sm font-semibold">{link.title}</p>
                  <p className="text-xs text-swin-charcoal/70">{link.description}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-swin-red">
                    {link.action}
                    <span aria-hidden="true">-&gt;</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-swin-charcoal/10 bg-white p-5 text-sm text-swin-charcoal shadow-lg shadow-swin-charcoal/5">
            <h3 className="text-base font-semibold text-swin-charcoal">Need a transcript?</h3>
            <p className="mt-2 text-sm text-swin-charcoal/80">
              Email the library team and mention the chat so we can attach the conversation log for your records.
            </p>
            <a
              href="mailto:library@swinburne.edu.my?subject=Student%20chat%20follow-up"
              className="mt-3 inline-flex items-center text-sm font-semibold text-swin-red hover:underline"
            >
              library@swinburne.edu.my
            </a>
            <p className="mt-2 text-xs text-swin-charcoal/60">Include your student ID for faster assistance.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
