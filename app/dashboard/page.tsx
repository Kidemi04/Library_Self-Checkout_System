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

        {/* Social & Learning Links - Mobile Only */}
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/dashboard/friends"
            className={clsx(
              'flex flex-col items-center justify-center gap-2 rounded-2xl border border-swin-charcoal/10 bg-white p-3 text-center text-swin-charcoal shadow-sm transition hover:border-swin-red/60 hover:shadow-swin-red/20',
              'dark:border-white/10 dark:bg-slate-900/70 dark:text-white dark:hover:border-emerald-300/40 dark:hover:shadow-emerald-400/20',
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 5.472m0 0a9.09 9.09 0 0 0-3.279 1.317c-1.143.63-1.214 1.98-.477 2.912a5.976 5.976 0 0 1 4.693-3.03m0 0a6.051 6.051 0 0 1 3.848-1.232m0 0a6.051 6.051 0 0 1 3.848 1.232M12 12.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              </svg>
            </div>
            <span className="text-xs font-semibold">Friends</span>
          </Link>

          <Link
            href="/dashboard/communities"
            className={clsx(
              'flex flex-col items-center justify-center gap-2 rounded-2xl border border-swin-charcoal/10 bg-white p-3 text-center text-swin-charcoal shadow-sm transition hover:border-swin-red/60 hover:shadow-swin-red/20',
              'dark:border-white/10 dark:bg-slate-900/70 dark:text-white dark:hover:border-emerald-300/40 dark:hover:shadow-emerald-400/20',
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 5.472m0 0a9.09 9.09 0 0 0-3.279 1.317c-1.143.63-1.214 1.98-.477 2.912a5.976 5.976 0 0 1 4.693-3.03m0 0a6.051 6.051 0 0 1 3.848-1.232m0 0a6.051 6.051 0 0 1 3.848 1.232M12 12.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              </svg>
            </div>
            <span className="text-xs font-semibold">Communities</span>
          </Link>

          <Link
            href="/dashboard/learning"
            className={clsx(
              'flex flex-col items-center justify-center gap-2 rounded-2xl border border-swin-charcoal/10 bg-white p-3 text-center text-swin-charcoal shadow-sm transition hover:border-swin-red/60 hover:shadow-swin-red/20',
              'dark:border-white/10 dark:bg-slate-900/70 dark:text-white dark:hover:border-emerald-300/40 dark:hover:shadow-emerald-400/20',
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.499 5.516 50.552 50.552 0 0 0-2.658.813m-15.482 0A50.55 50.55 0 0 1 12 13.489a50.55 50.55 0 0 1 6.74-3.342" />
              </svg>
            </div>
            <span className="text-xs font-semibold">Learning</span>
          </Link>
        </div>
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
