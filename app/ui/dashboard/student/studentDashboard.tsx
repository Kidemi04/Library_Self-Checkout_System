'use client';

import Link from 'next/link';
import type { Loan } from '@/app/lib/supabase/types';
import type { PatronHold } from '@/app/lib/supabase/queries';
import QuickActions from './quickActions';
import MyBooksCards from './myBooksCard';
import BlurFade from '@/app/ui/magicUi/blurFade';

type StudentDashboardProps = {
  userName: string | null;
  activeLoans: Loan[];
  holds: PatronHold[];
};

export default function StudentDashboard({
  userName,
  activeLoans,
  holds,
}: StudentDashboardProps) {
  const overdueCount = activeLoans.filter(
    (loan) =>
      loan.status === 'overdue' ||
      new Date(loan.dueAt).getTime() < Date.now(),
  ).length;

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <section>
        <QuickActions />
      </section>

      {/* My Books */}
      <BlurFade delay={0.5} yOffset={15}>
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-swin-charcoal dark:text-white">
                My Books
              </h2>
              <p className="text-sm text-swin-charcoal/60 dark:text-slate-400">
                {activeLoans.length} book{activeLoans.length === 1 ? '' : 's'} currently borrowed
                {overdueCount > 0 && (
                  <span className="ml-1.5 text-swin-red dark:text-red-400">
                    ({overdueCount} overdue)
                  </span>
                )}
              </p>
            </div>
            {activeLoans.length > 0 && (
              <Link
                href="/dashboard/my-books"
                className="text-sm font-medium text-swin-red hover:text-swin-red/80 dark:text-rose-400 dark:hover:text-rose-300"
              >
                View all
              </Link>
            )}
          </div>
          <MyBooksCards loans={activeLoans} />
        </section>
      </BlurFade>

      {/* Reservations */}
      {holds.length > 0 && (
        <BlurFade delay={0.7} yOffset={15}>
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-swin-charcoal dark:text-white">
                  My Reservations
                </h2>
                <p className="text-sm text-swin-charcoal/60 dark:text-slate-400">
                  {holds.length} hold{holds.length === 1 ? '' : 's'} active
                </p>
              </div>
              <Link
                href="/dashboard/my-books?tab=reservations"
                className="text-sm font-medium text-swin-red hover:text-swin-red/80 dark:text-rose-400 dark:hover:text-rose-300"
              >
                View all
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {holds.slice(0, 3).map((hold) => {
                const isReady = hold.status === 'ready';
                return (
                  <div
                    key={hold.id}
                    className={`rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900/80 ${
                      isReady
                        ? 'border-emerald-300/50 dark:border-emerald-500/30'
                        : 'border-swin-charcoal/10 dark:border-slate-700/60'
                    }`}
                  >
                    <p className="truncate text-sm font-semibold text-swin-charcoal dark:text-white">
                      {hold.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-swin-charcoal/60 dark:text-slate-400">
                      {hold.author ?? 'Unknown author'}
                    </p>
                    <span
                      className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isReady
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                          : 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200'
                      }`}
                    >
                      {isReady ? 'Ready for pickup' : 'Waiting in queue'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </BlurFade>
      )}
    </div>
  );
}
