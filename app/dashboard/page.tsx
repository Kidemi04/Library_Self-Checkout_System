import Link from 'next/link';
import { redirect } from 'next/navigation';
import clsx from 'clsx';
import { ArrowUpTrayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import CheckOutForm from '@/app/ui/dashboard/check-out-form';
import CheckInForm from '@/app/ui/dashboard/check-in-form';
import ActiveLoansTable from '@/app/ui/dashboard/active-loans-table';
import { fetchActiveLoans, fetchAvailableBooks, fetchDashboardSummary } from '@/app/lib/supabase/queries';
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

  const isPrivileged = ['staff', 'admin'].includes(user.role);
  const headerClasses = clsx(
    'grid gap-4 rounded-xl p-5 shadow-md md:grid-cols-[1fr_minmax(0,260px)] md:items-center md:gap-6 md:rounded-2xl md:p-8',
    isPrivileged
      ? 'bg-slate-950 text-white shadow-slate-900/30'
      : 'bg-swin-charcoal text-swin-ivory shadow-swin-charcoal/25',
  );
  const summaryCardClasses = clsx(
    'rounded-xl border p-4 text-sm shadow-inner md:rounded-2xl md:p-5',
    isPrivileged
      ? 'border-white/15 bg-white/5 text-white/90 shadow-black/20'
      : 'border-swin-ivory/15 bg-swin-ivory/10 text-swin-ivory/90 shadow-black/10',
  );
  const summaryPillClasses = clsx(
    'mt-2 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
    isPrivileged ? 'border border-white/20 text-emerald-200/90' : 'border border-swin-ivory/30 text-swin-ivory/80',
  );
  const bypassBannerClasses = clsx(
    'mt-3 rounded-md px-3 py-2 text-[11px] font-medium shadow-inner',
    isPrivileged
      ? 'bg-amber-400/20 text-amber-100 shadow-amber-600/10'
      : 'bg-amber-400/20 text-amber-200 shadow-amber-500/10',
  );
  const mobileCardClasses = clsx(
    'flex items-center justify-between rounded-2xl px-5 py-4 shadow-sm transition',
    isPrivileged
      ? 'border border-white/10 bg-slate-900/70 text-white hover:border-emerald-300/40 hover:shadow-emerald-400/20'
      : 'border border-swin-charcoal/10 bg-white text-swin-charcoal hover:border-swin-red/60 hover:shadow-swin-red/20',
  );
  const pillClasses = clsx(
    'flex h-11 w-11 items-center justify-center rounded-full shadow-md',
    isPrivileged ? 'bg-emerald-400/10 text-emerald-200 shadow-emerald-500/10' : 'bg-swin-charcoal/90 text-swin-ivory shadow-swin-charcoal/40',
  );
  const helperTextClass = clsx(
    'text-xs',
    isPrivileged ? 'text-slate-300/70' : 'text-swin-charcoal/60',
  );
  const titleTextClass = clsx(
    'text-sm font-semibold',
    isPrivileged ? 'text-slate-100' : 'text-swin-charcoal',
  );

  const [books, activeLoans, summary] = await Promise.all([
    fetchAvailableBooks(),
    fetchActiveLoans(),
    fetchDashboardSummary(),
  ]);

  const defaultDueDate = buildDefaultDueDate();

  return (
    <main className="space-y-8">
      <title>Dashboard | Quick Actions</title>

      <header className="grid gap-6 rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30 md:grid-cols-[1fr_minmax(0,260px)] md:items-center">
        <div>
          <p className="text-sm uppercase tracking-wide text-swin-ivory/60">Self-Service Desk</p>
          <h1 className="mt-2 text-2xl font-semibold">
            Welcome back, <span className="md:inline hidden">{user.name || 'Library Member'}</span><span className="inline md:hidden">{user.username || user.name || 'Library Member'}</span>!
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-swin-ivory/70">
            Quickly process borrowing and returning directly from this dashboard. Use the controls below to
            assist patrons without leaving the page.
          </p>
        </div>
        <div className="rounded-2xl border border-swin-ivory/15 bg-swin-ivory/10 p-5 text-sm text-swin-ivory/90 shadow-inner shadow-black/10">
          <p className="text-xs uppercase tracking-wide text-swin-ivory/60">Signed in</p>
          {user.email ? (
            <p className={clsx(
              "mt-1 font-semibold text-swin-ivory break-words",
              user.email.length > 30 ? "text-sm md:text-base" : "text-base",
              user.email.length > 40 ? "text-xs md:text-base" : "text-base"
            )}>
              {user.email}
            </p>
          ) : null}
          <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-swin-ivory/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-swin-ivory/80">
            Role: {roleLabel(user.role)}
          </p>
          {isBypassed ? (
            <p className="mt-3 rounded-md bg-amber-400/20 px-3 py-2 text-[11px] font-medium text-amber-200 shadow-inner shadow-amber-500/10">
              Development bypass active — authentication skipped.
            </p>
          ) : null}
        </div>
      </header>

      {/* Mobile quick actions */}
      <section className="grid gap-3 md:hidden">
        <Link
          href="/dashboard/check-out"
          className={mobileCardClasses}
        >
          <div className="flex flex-col">
            <span className={titleTextClass}>Borrow books</span>
            <span className={helperTextClass}>Scan or search to start a new loan</span>
          </div>
          <span className={pillClasses}>
            <ArrowUpTrayIcon className="h-5 w-5" />
          </span>
        </Link>
        <Link
          href="/dashboard/check-in"
          className={mobileCardClasses}
        >
          <div className="flex flex-col">
            <span className={titleTextClass}>Return books</span>
            <span className={helperTextClass}>Record a check-in by scan or ID</span>
          </div>
          <span className={pillClasses}>
            <ArrowDownTrayIcon className="h-5 w-5" />
          </span>
        </Link>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <CheckOutForm books={books} defaultDueDate={defaultDueDate} />
        <CheckInForm activeLoanCount={summary.activeLoans} />
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-swin-charcoal">Active loans</h2>
          <p className="text-sm text-swin-charcoal/60">
            {activeLoans.length} items currently outside the library
          </p>
        </div>
        <ActiveLoansTable loans={activeLoans} />
      </section>
    </main>
  );
}
