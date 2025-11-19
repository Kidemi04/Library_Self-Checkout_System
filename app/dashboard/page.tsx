import Link from 'next/link';
import { redirect } from 'next/navigation';
import clsx from 'clsx';
import { ArrowUpTrayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import CheckOutForm from '@/app/ui/dashboard/check-out-form';
import CheckInForm from '@/app/ui/dashboard/check-in-form';
import ActiveLoansTable from '@/app/ui/dashboard/active-loans-table';
import SummaryCards from '@/app/ui/dashboard/summary-cards';
import RecentLoans from '@/app/ui/dashboard/recent-loans';
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

  return (
    <main className="space-y-8">
      <title>Dashboard | Quick Actions</title>

      <header className="relative grid gap-6 overflow-hidden rounded-3xl border border-swin-red/40 bg-gradient-to-r from-[#9f1c2b] via-[#c82333] to-[#511627] p-8 text-white shadow-2xl shadow-swin-red/40 transition md:grid-cols-[1fr_minmax(0,260px)] md:items-center">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-rose-500/30 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-purple-600/20 blur-3xl" />
        </div>
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-[0.35em] text-white/70">Self-Service Desk</p>
          <h1 className="mt-3 text-2xl font-semibold">
            Welcome back, <span className="hidden md:inline">{user.name || 'Library Member'}</span>
            <span className="inline md:hidden">{user.username || user.name || 'Library Member'}</span>!
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/80">
            Quickly process borrowing and returning directly from this dashboard. Use the controls below to
            assist patrons without leaving the page.
          </p>
        </div>
        <div className="relative z-10 rounded-3xl border border-white/20 bg-white/10 p-5 text-sm text-white shadow-xl shadow-black/20 backdrop-blur-lg">
          <p className="text-xs uppercase tracking-wide text-white/70">Signed in</p>
          {user.email ? (
            <p
              className={clsx(
                'mt-1 break-words font-semibold',
                user.email.length > 30 ? 'text-sm md:text-base' : 'text-base',
                user.email.length > 40 ? 'text-xs md:text-base' : 'text-base',
              )}
            >
              {user.email}
            </p>
          ) : null}
          <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80">
            Role: {roleLabel(user.role)}
          </p>
          {isBypassed ? (
            <p className="mt-3 rounded-md bg-amber-400/30 px-3 py-2 text-[11px] font-medium text-amber-100 shadow-inner shadow-amber-700/10">
              Development bypass active - authentication skipped.
            </p>
          ) : null}
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
