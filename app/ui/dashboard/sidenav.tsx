'use client';

import Link from 'next/link';
import clsx from 'clsx';
import NavLinks from '@/app/ui/dashboard/navLinks';
import AcmeLogo from '@/app/ui/acmeLogo';
import SignOutButton from '@/app/ui/dashboard/signOutButton';
import ThemeToggle from '@/app/ui/theme/themeToggle';
import BlurFade from '@/app/ui/magicUi/blurFade';
import { useTheme } from '@/app/ui/theme/themeProvider';
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
      /* Container remains fixed and does not scroll as a whole */
      className={clsx(
        'fixed left-0 top-0 flex h-screen w-64 flex-col px-3 py-5 shadow-2xl backdrop-blur-2xl transition-all duration-300 md:px-4',
        isDark
          ? 'bg-slate-950/70 text-slate-100 ring-1 ring-white/20 shadow-white/5'
          : 'bg-swin-charcoal/85 text-swin-ivory ring-1 ring-white/10 shadow-black/30',
      )}
      style={{
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      }}
    >
      {/* 1. FIXED TOP: Logo */}
      <div className="flex-none pb-4">
        <BlurFade delay={0.1} yOffset={-10}>
          <Link
            className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-swin-red to-swin-red/90 px-4 py-3 text-swin-ivory shadow-2xl shadow-swin-red/40 ring-1 ring-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-swin-red/50 hover:ring-white/30 active:scale-95"
            href="/"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative text-swin-ivory">
              <AcmeLogo />
            </div>
            <span className="relative hidden text-sm font-semibold uppercase tracking-wide md:block">
              Library Self-Checkout
            </span>
          </Link>
        </BlurFade>
      </div>

      {/* 2. FIXED TOP: User Card (Optional) */}
      {isPrivileged && (
        <div className="flex-none">
          <BlurFade delay={0.2} yOffset={-10}>
            <div
              className={clsx(
                'relative overflow-hidden rounded-2xl border p-4 mb-2 text-sm backdrop-blur-xl transition-all duration-300 hover:shadow-xl',
                isDark
                  ? 'border-white/20 bg-white/10 text-slate-100 shadow-black/30 ring-1 ring-white/10'
                  : 'border-swin-ivory/20 bg-black/30 text-swin-ivory shadow-black/40 ring-1 ring-white/5',
              )}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              <p className={clsx('relative z-10 text-[11px] uppercase tracking-wide', isDark ? 'text-white/60' : 'text-swin-ivory/80')}>
                {`${roleLabel} access`}
              </p>
              <p className="relative z-10 mt-1 truncate text-sm font-semibold">{user.name ?? user.email ?? 'Librarian'}</p>
              <p className={clsx('relative z-10 mt-2 text-[11px] font-medium uppercase tracking-wide', isDark ? 'text-emerald-300/80' : 'text-swin-red/90')}>
                {isBypassed ? 'Dev bypass active' : `Role: ${roleLabel}`}
              </p>
            </div>
          </BlurFade>
        </div>
      )}

      {/* 3. SCROLLABLE MIDDLE: NavLinks */}
      <nav className="flex-grow overflow-y-auto overflow-x-hidden scrollbar-none px-1 mt-4">
        {/* Add a small padding-top here inside the scroll area.
            This ensures the first button's hover/scale effect 
            has space to expand without being clipped by the container.
        */}
        <div className="pt-4"> 
          <NavLinks role={user.role} />
        </div>
      </nav>

      {/* 4. FIXED BOTTOM: Controls */}
      {/* Added 'mt-auto' and 'pt-4' to ensure it stays at the bottom with enough spacing.
      */}
      <div className="mt-auto flex-none pt-4">
        <BlurFade delay={0.3} yOffset={10}>
          <div className="flex flex-col gap-3">
            <ThemeToggle context="sidebar" />
            <SignOutButton
              className={clsx(
                'flex h-[44px] w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all duration-300 md:justify-start md:px-3 active:scale-95',
                isDark
                  ? 'border-white/20 text-slate-200 hover:scale-[1.02] hover:bg-white/10 hover:text-white'
                  : 'border-swin-ivory/30 bg-transparent text-swin-ivory hover:scale-[1.02] hover:bg-white/10 hover:text-swin-ivory',
              )}
              labelClassName="hidden md:block"
            />
          </div>
        </BlurFade>
      </div>
    </aside>
  );
}