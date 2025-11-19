import Link from 'next/link';
import { redirect } from 'next/navigation';
import clsx from 'clsx';
import { ArrowUpTrayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import CheckOutForm from '@/app/ui/dashboard/check-out-form';
import CheckInForm from '@/app/ui/dashboard/check-in-form';
import ActiveLoansTable from '@/app/ui/dashboard/active-loans-table';
import SummaryCards from '@/app/ui/dashboard/summary-cards';
import RecentLoans from '@/app/ui/dashboard/recent-loans';
import TextType from '@/app/ui/components/text-type';
import { 
  fetchActiveLoans, 
  fetchAvailableBooks, 
  fetchDashboardSummary,
  fetchRecentLoans 
} from '@/app/lib/supabase/queries';
import { getDashboardSession } from '@/app/lib/auth/session';

const roleLabel = (role: string): string => {
  if (role === 'admin') return 'Admin';
  if (role === 'staff') return 'Staff';
  return 'User';
};

const defaultLoanDurationDays = 14;

const buildDefaultDueDate = () => {
  const now = new Date();
  now.setDate(now.getDate() + defaultLoanDurationDays);
  const iso = now.toISOString();
  return iso.split('T')[0] ?? iso;
};

const formatStatValue = (value?: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value ?? 0);

const buildInitials = (input?: string | null) => {
  if (!input) return 'LM';
  const segments = input
    .split(' ')
    .map(segment => segment.trim())
    .filter(Boolean);
  const letters = segments
    .map(segment => segment.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('');
  return letters.toUpperCase() || 'LM';
};

export default async function UserDashboardPage() {
  const { user, isBypassed } = await getDashboardSession();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'admin') {
    redirect('/dashboard/admin');
  }

  const [books, activeLoans, summary, recentLoans] = await Promise.all([
    fetchAvailableBooks(),
    fetchActiveLoans(),
    fetchDashboardSummary(),
    fetchRecentLoans(6),
  ]);

  const defaultDueDate = buildDefaultDueDate();
  const displayName = user.name || 'Library Member';
  const username = user.username || 'Unassigned member';
  const userInitials = buildInitials(user.name || user.username || displayName);
  const heroPhrases = [
    `Currently guiding ${formatStatValue(summary.activeLoans)} active loans.`,
    `Keeping ${formatStatValue(summary.availableBooks)} titles ready for the next reader.`,
    `Flagging ${formatStatValue(summary.overdueLoans)} overdue reminders before close.`,
    'Delivering lightning-fast check-ins right from this panel.',
  ];
  const heroStats = [
    {
      label: 'Active loans',
      helper: 'waiting for return',
      value: formatStatValue(summary.activeLoans),
    },
    {
      label: 'Available titles',
      helper: 'ready to lend',
      value: formatStatValue(summary.availableBooks),
    },
    {
      label: 'Overdue items',
      helper: 'needs follow-up',
      value: formatStatValue(summary.overdueLoans),
    },
  ];
  const heroActionLinks = [
    {
      href: '/dashboard/check-out',
      label: 'Borrow queue',
      detail: 'Scan IDs & confirm due dates',
      icon: ArrowUpTrayIcon,
    },
    {
      href: '/dashboard/check-in',
      label: 'Return desk',
      detail: 'Log check-ins & restock shelves',
      icon: ArrowDownTrayIcon,
    },
  ];

  return (
    <main className="space-y-8">
      <title>Dashboard | Quick Actions</title>

      <header className="relative grid gap-8 overflow-hidden rounded-[32px] border border-swin-red/40 bg-gradient-to-br from-[#830f22] via-[#c82333] to-[#2f1438] p-8 text-white shadow-2xl shadow-swin-red/40 transition md:grid-cols-[minmax(0,1.5fr)_minmax(0,320px)] md:items-stretch">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute left-1/4 top-1/2 h-64 w-64 rounded-full bg-rose-500/30 blur-[120px]" />
          <div className="absolute bottom-6 right-0 h-56 w-56 rounded-full bg-purple-600/30 blur-3xl" />
          <div className="absolute -bottom-10 left-0 h-72 w-72 rounded-full bg-amber-400/10 blur-[120px]" />
        </div>
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/70">
            <span className="rounded-full border border-white/30 px-3 py-1">Self-Service Desk</span>
            <span className="rounded-full border border-white/30 px-3 py-1">Supabase Sync Live</span>
          </div>
          <div>
            <p className="text-sm text-white/70">Front-of-house control for quick lending</p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight text-white md:text-4xl">
              Welcome back, <span className="text-white">{displayName}</span>
            </h1>
            <TextType
              as="p"
              className="mt-4 text-lg font-semibold leading-snug text-white/90"
              text={heroPhrases}
              typingSpeed={60}
              deletingSpeed={40}
              pauseDuration={2400}
              initialDelay={300}
              variableSpeed={{ min: 35, max: 75 }}
              hideCursorWhileTyping
              cursorCharacter="|"
              cursorClassName="text-white/70"
              textColors={['#ffffff', '#ffe6ef', '#ffdbe5', '#ffeeff']}
              startOnVisible
            />
            <p className="mt-4 max-w-2xl text-sm text-white/75">
              Move between check-outs, returns, and overdue follow-ups without leaving this workspace. All
              updates flow directly to Supabase so your shelves stay perfectly in sync.
            </p>
          </div>
          <ul className="grid gap-3 text-sm text-white/80 sm:grid-cols-3">
            {heroStats.map(stat => (
              <li
                key={stat.label}
                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 shadow-lg shadow-black/20 backdrop-blur"
              >
                <p className="text-3xl font-semibold text-white">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-white/70">{stat.label}</p>
                <p className="text-sm text-white/70">{stat.helper}</p>
              </li>
            ))}
          </ul>
          <div className="hidden gap-3 text-sm md:grid md:grid-cols-2">
            {heroActionLinks.map(({ href, label, detail, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-white shadow-lg shadow-black/20 backdrop-blur transition hover:border-white/60 hover:bg-white/20"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/60">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{detail}</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition group-hover:bg-white group-hover:text-swin-red">
                  <Icon className="h-5 w-5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex flex-col justify-between rounded-3xl border border-white/20 bg-white/5 p-6 text-sm text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-xl font-semibold text-white">
              {userInitials}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/70">Currently signed in</p>
              <p className="mt-1 text-xl font-semibold text-white">{displayName}</p>
              {user.email ? (
                <p className="text-sm text-white/80">{user.email}</p>
              ) : (
                <p className="text-sm text-white/60">No email on record</p>
              )}
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm text-white/80">
            <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <span className="text-xs uppercase tracking-wide text-white/60">Role</span>
              <span className="text-sm font-semibold text-white">{roleLabel(user.role)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <span className="text-xs uppercase tracking-wide text-white/60">Username</span>
              <span className="text-sm font-semibold text-white">{username}</span>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-r from-white/20 to-transparent px-4 py-4 text-white/80">
            <p className="text-xs uppercase tracking-wide text-white/70">Session</p>
            <p className="mt-2 text-sm text-white">
              {isBypassed
                ? 'Development bypass active - authentication skipped.'
                : 'Authentication verified - Supabase session active.'}
            </p>
          </div>
        </div>
      </header>

      {/* Mobile quick actions - Only visible on mobile */}
      <section className="grid gap-3 md:hidden">
        <Link
          href="/dashboard/check-out"
          className={clsx(
            'flex items-center justify-between rounded-2xl border border-swin-charcoal/10 bg-white px-5 py-4 text-swin-charcoal shadow-sm transition hover:border-swin-red/60 hover:shadow-swin-red/20',
            'dark:border-white/10 dark:bg-slate-900/70 dark:text-white dark:hover:border-emerald-300/40 dark:hover:shadow-emerald-400/20',
          )}
        >
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-swin-charcoal dark:text-white">Borrow books</span>
            <span className="text-xs text-swin-charcoal/60 dark:text-slate-300/80">Scan or search to start a new loan</span>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-swin-charcoal/90 text-swin-ivory shadow-swin-charcoal/40 shadow-md dark:bg-emerald-400/10 dark:text-emerald-200 dark:shadow-emerald-500/10">
            <ArrowUpTrayIcon className="h-5 w-5" />
          </span>
        </Link>
        <Link
          href="/dashboard/check-in"
          className={clsx(
            'flex items-center justify-between rounded-2xl border border-swin-charcoal/10 bg-white px-5 py-4 text-swin-charcoal shadow-sm transition hover:border-swin-red/60 hover:shadow-swin-red/20',
            'dark:border-white/10 dark:bg-slate-900/70 dark:text-white dark:hover:border-emerald-300/40 dark:hover:shadow-emerald-400/20',
          )}
        >
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-swin-charcoal dark:text-white">Return books</span>
            <span className="text-xs text-swin-charcoal/60 dark:text-slate-300/80">Record a check-in by scan or ID</span>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-swin-charcoal/90 text-swin-ivory shadow-swin-charcoal/40 shadow-md dark:bg-emerald-400/10 dark:text-emerald-200 dark:shadow-emerald-500/10">
            <ArrowDownTrayIcon className="h-5 w-5" />
          </span>
        </Link>
      </section>

      {/* Desktop view - Hidden on mobile */}
      <div className="hidden md:block">
        <SummaryCards summary={summary} />
      </div>

      {/* Mobile view - Forms */}
      <div className="grid gap-6 md:hidden xl:grid-cols-2">
        <CheckOutForm books={books} defaultDueDate={defaultDueDate} />
        <CheckInForm activeLoanCount={summary.activeLoans} />
      </div>

      {/* Desktop view - Recent Activity */}
      <section className="hidden space-y-4 md:block">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-swin-charcoal dark:text-white">Recent activity</h2>
          <p className="text-sm text-swin-charcoal/60 dark:text-slate-300/80">Latest borrowing and return activity</p>
        </div>
        <RecentLoans loans={recentLoans} />
      </section>

      {/* Active Loans Section - Visible on all views */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-swin-charcoal dark:text-white">Active loans</h2>
          <p className="text-sm text-swin-charcoal/60 dark:text-slate-300/80">
            {activeLoans.length} items currently outside the library
          </p>
        </div>
        <ActiveLoansTable loans={activeLoans} />
      </section>
    </main>
  );
}
