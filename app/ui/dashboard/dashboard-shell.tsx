'use client';

import clsx from 'clsx';
import SideNav from '@/app/ui/dashboard/sidenav';
import MobileNav from '@/app/ui/dashboard/mobile-nav';
import { useTheme } from '@/app/ui/theme/theme-provider';
import type { DashboardUserProfile } from '@/app/lib/auth/types';
import { useEffect, useState } from 'react';

type DashboardShellProps = {
  user: DashboardUserProfile;
  isBypassed: boolean;
  children: React.ReactNode;
};

export default function DashboardShell({ user, isBypassed, children }: DashboardShellProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait until client is fully mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Do not render layout until theme is stable
  if (!mounted) {
    return null; // or a skeleton if you want
  }

  const isDark = theme === 'dark';

  return (
    <div
      className={clsx(
        'flex min-h-screen transition-colors duration-300',
        isDark ? 'bg-slate-950 text-slate-50' : 'bg-swin-ivory text-swin-charcoal',
      )}
    >
      <aside className="hidden md:flex md:w-72 md:flex-none md:flex-col">
        <SideNav user={user} isBypassed={isBypassed} />
      </aside>

      <div className="flex min-h-screen w-full flex-col">
        <MobileNav user={user} isBypassed={isBypassed} />

        <div
          className={clsx(
            'flex-1 overflow-y-auto px-4 pt-6 pb-[calc(env(safe-area-inset-bottom)+112px)] transition-colors duration-300 sm:px-6 md:px-12 md:py-10 md:pb-12',
            isDark ? 'bg-slate-950 text-slate-50' : 'bg-white text-swin-charcoal',
          )}
        >
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
