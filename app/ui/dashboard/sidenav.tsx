'use client';

import Link from 'next/link';
import clsx from 'clsx';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import SignOutButton from '@/app/ui/dashboard/sign-out-button';
import ThemeToggle from '@/app/ui/theme/theme-toggle';
import { useTheme } from '@/app/ui/theme/theme-provider';
import type { DashboardUserProfile } from '@/app/lib/auth/types';

type SideNavProps = {
  user: DashboardUserProfile;
  isBypassed: boolean;
};

export default function SideNav({ user, isBypassed }: SideNavProps) {
  const isPrivileged = user.role === 'staff' || user.role === 'admin';
  const roleLabel = user.role === 'admin' ? 'Admin' : user.role === 'staff' ? 'Staff' : 'User';
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 flex h-screen w-64 flex-col overflow-y-auto px-3 py-5 shadow-xl transition-colors duration-300 md:px-4',
        isDark ? 'bg-slate-950/95 text-slate-100 ring-1 ring-white/10' : 'bg-white text-swin-charcoal ring-1 ring-slate-100',
      )}
    >
      <Link
        className="mb-8 flex items-center gap-3 rounded-xl bg-swin-red px-4 py-3 text-swin-ivory shadow-lg shadow-swin-red/30 transition hover:bg-swin-red/90"
        href="/"
      >
        <div className="text-swin-ivory">
          <AcmeLogo />
        </div>
        <span className="hidden text-sm font-semibold uppercase tracking-wide md:block">
          Library Self-Checkout
        </span>
      </Link>
      <div className="flex grow flex-col justify-between gap-6">
        <nav className="flex flex-col gap-2">
          {isPrivileged ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-slate-900 shadow-inner transition-colors duration-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
              <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-white/60">{`${roleLabel} access`}</p>
              <p className="mt-1 truncate text-sm font-semibold">{user.name ?? user.email ?? 'Librarian'}</p>
              {user.email ? <p className="break-words text-[11px] text-slate-500 dark:text-white/60">{user.email}</p> : null}
              <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-swin-red dark:text-emerald-300/80">
                {isBypassed ? 'Dev bypass active' : `Role: ${roleLabel}`}
              </p>
            </div>
          ) : null}
          <NavLinks role={user.role} />
        </nav>
        <div className="flex flex-col gap-3">
          <ThemeToggle />
          <SignOutButton
            className={clsx(
              'flex h-[44px] w-full items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors md:justify-start md:px-3',
              isDark
                ? 'border-white/20 text-slate-200 hover:bg-white/10 hover:text-white'
                : 'border-slate-200 bg-white text-swin-charcoal hover:bg-swin-red hover:text-white',
            )}
            labelClassName="hidden md:block"
          />
        </div>
      </div>
    </aside>
  );
}
