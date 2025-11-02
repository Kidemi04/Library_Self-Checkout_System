import { redirect } from 'next/navigation';
import CheckOutForm from '@/app/ui/dashboard/check-out-form';
import CheckInForm from '@/app/ui/dashboard/check-in-form';
import ActiveLoansTable from '@/app/ui/dashboard/active-loans-table';
import { fetchActiveLoans, fetchAvailableBooks, fetchDashboardSummary } from '@/app/lib/supabase/queries';
import { getDashboardSession } from '@/app/lib/auth/session';

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

  if (user.role === 'staff') {
    redirect('/dashboard/admin');
  }

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
            Welcome back{user.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-swin-ivory/70">
            Quickly process borrowing and returning directly from this dashboard. Use the controls below to
            assist patrons without leaving the page.
          </p>
        </div>
        <div className="rounded-2xl border border-swin-ivory/15 bg-swin-ivory/10 p-5 text-sm text-swin-ivory/90 shadow-inner shadow-black/10">
          <p className="text-xs uppercase tracking-wide text-swin-ivory/60">Signed in</p>
          {user.email ? <p className="mt-1 text-base font-semibold text-swin-ivory">{user.email}</p> : null}
          <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-swin-ivory/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-swin-ivory/80">
            Role: Student
          </p>
          {isBypassed ? (
            <p className="mt-3 rounded-md bg-amber-400/20 px-3 py-2 text-[11px] font-medium text-amber-200 shadow-inner shadow-amber-500/10">
              Development bypass active — authentication skipped.
            </p>
          ) : null}
        </div>
      </header>

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
