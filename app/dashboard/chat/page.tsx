import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import StudentChat from '@/app/ui/dashboard/studentChat';
import { userNeedsOnboarding } from '@/app/lib/recommendations/user-context';


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
    <main className="space-y-8">
      <title>Chat Support | Dashboard</title>

      <header className="relative overflow-hidden rounded-3xl p-5 md:p-8 text-white shadow-2xl shadow-swin-red/25">
        <div className="absolute inset-0 bg-gradient-to-r from-swin-charcoal via-swin-red to-[#3b0b14]" />
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-black/20 blur-3xl" />
        </div>
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">AI Assistant</p>
          <h1 className="mt-1 text-xl font-semibold md:text-2xl">How can I help you?</h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Ask me anything about borrowing, returning, fines, or using the library system — I will guide you step by step.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <StudentChat studentName={displayName} needsOnboarding={needsOnboarding} userId={user.id} />

        <aside className="space-y-4">
          {/* When to use chat */}
          <div className="rounded-3xl border border-swin-charcoal/10 bg-white p-5 shadow-lg shadow-swin-charcoal/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-swin-charcoal/50 dark:text-slate-400">When to use chat</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-swin-charcoal/80 dark:text-slate-300">
              <li>Need help locating or renewing an item while you are on the go.</li>
              <li>Want to confirm fines, holds, or equipment availability.</li>
              <li>Have issues with the barcode scanner or the self-checkout flow.</li>
            </ul>
            <p className="mt-4 text-sm text-swin-charcoal/60 dark:text-slate-400">
              For official paperwork or appeals, please follow up via email so we can send attachments.
            </p>
          </div>

          {/* Helpful links */}
          <div className="rounded-3xl border border-swin-charcoal/10 bg-white p-5 shadow-lg shadow-swin-charcoal/5 dark:border-slate-700 dark:bg-slate-900/60 dark:shadow-black/20">
            <h3 className="text-base font-semibold text-swin-charcoal dark:text-slate-100">Helpful links</h3>
            <div className="mt-3 space-y-3 text-sm">
              {resourceLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="block rounded-2xl border border-swin-charcoal/10 bg-swin-ivory/60 px-4 py-3 text-swin-charcoal shadow-sm transition hover:border-swin-red/50 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-swin-red/50"
                >
                  <p className="text-sm font-semibold">{link.title}</p>
                  <p className="text-xs text-swin-charcoal/60 dark:text-slate-400">{link.description}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-swin-red">
                    {link.action}
                    <span aria-hidden="true">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Need a transcript? */}
          <div className="rounded-3xl border border-swin-charcoal/10 bg-white p-5 shadow-lg shadow-swin-charcoal/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
            <h3 className="text-base font-semibold text-swin-charcoal dark:text-slate-100">Need a transcript?</h3>
            <p className="mt-2 text-sm text-swin-charcoal/70 dark:text-slate-300">
              Email the library team and mention the chat so we can attach the conversation log for your records.
            </p>
            <a
              href="mailto:library@swinburne.edu.my?subject=Student%20chat%20follow-up"
              className="mt-3 inline-flex items-center text-sm font-semibold text-swin-red hover:underline"
            >
              library@swinburne.edu.my
            </a>
            <p className="mt-2 text-xs text-swin-charcoal/50 dark:text-slate-500">Include your student ID for faster assistance.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
