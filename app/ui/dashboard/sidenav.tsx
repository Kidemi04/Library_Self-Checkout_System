'use client';

import Link from 'next/link';
import clsx from 'clsx';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import SignOutButton from '@/app/ui/dashboard/sign-out-button';
import ThemeToggle from '@/app/ui/theme/theme-toggle';
import BlurFade from '@/app/ui/magic-ui/blur-fade';
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
        'fixed left-0 top-0 flex h-screen w-64 flex-col overflow-y-auto scrollbar-none px-3 py-5 shadow-2xl backdrop-blur-xl transition-all duration-300 md:px-4',
        isDark
          ? 'bg-slate-950/80 text-slate-100 ring-1 ring-white/10'
          : 'bg-swin-charcoal/95 text-swin-ivory ring-1 ring-black/20',
      )}
    >
      <BlurFade delay={0.1} yOffset={-10}>
        <Link
          className="mb-8 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-swin-red to-swin-red/90 px-4 py-3 text-swin-ivory shadow-xl shadow-swin-red/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-swin-red/40"
          href="/"
        >
          <div className="text-swin-ivory">
            <AcmeLogo />
          </div>
          <span className="hidden text-sm font-semibold uppercase tracking-wide md:block">
            Library Self-Checkout
          </span>
        </Link>
      </BlurFade>

      <div className="flex grow flex-col justify-between gap-6">
        <nav className="flex flex-col gap-2.5">
          {isPrivileged ? (
            <BlurFade delay={0.2} yOffset={-10}>
              <div
                className={clsx(
                  'rounded-2xl border p-4 text-sm shadow-lg backdrop-blur-sm transition-all duration-300',
                  isDark
                    ? 'border-white/10 bg-white/5 text-slate-100 shadow-black/20'
                    : 'border-swin-ivory/15 bg-black/20 text-swin-ivory shadow-black/30',
                )}
              >
                <p
                  className={clsx(
                    'text-[11px] uppercase tracking-wide',
                    isDark ? 'text-white/60' : 'text-swin-ivory/80',
                  )}
                >{`${roleLabel} access`}</p>
                <p className="mt-1 truncate text-sm font-semibold">{user.name ?? user.email ?? 'Librarian'}</p>
                {user.email ? (
                  <p className={clsx('break-words text-[11px]', isDark ? 'text-white/60' : 'text-swin-ivory/70')}>
                    {user.email}
                  </p>
                ) : null}
                <p
                  className={clsx(
                    'mt-2 text-[11px] font-medium uppercase tracking-wide',
                    isDark ? 'text-emerald-300/80' : 'text-swin-red/90',
                  )}
                >
                  {isBypassed ? 'Dev bypass active' : `Role: ${roleLabel}`}
                </p>
              </div>
            </BlurFade>
          ) : null}

          <div className="mt-2">
            <NavLinks role={user.role} />
          </div>
        </nav>

        <BlurFade delay={0.3} yOffset={10}>
          <div className="flex flex-col gap-3">
            <ThemeToggle context="sidebar" />
            <SignOutButton
              className={clsx(
                'flex h-[44px] w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all duration-300 md:justify-start md:px-3',
                isDark
                  ? 'border-white/20 text-slate-200 hover:scale-[1.02] hover:bg-white/10 hover:text-white hover:shadow-lg'
                  : 'border-swin-ivory/30 bg-transparent text-swin-ivory hover:scale-[1.02] hover:bg-white/10 hover:text-swin-ivory hover:shadow-lg',
              )}
              labelClassName="hidden md:block"
            />
          </div>
        </BlurFade>
      </div>
    </aside>
  );
}
