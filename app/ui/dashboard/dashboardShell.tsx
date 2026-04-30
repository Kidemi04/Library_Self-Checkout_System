'use client';

import SideNav from '@/app/ui/dashboard/sidenav';
import MobileNav from '@/app/ui/dashboard/mobileNav';
import FaqFloatingHelp from '@/app/ui/dashboard/faqFloatingHelp';
import NotificationToast from '@/app/ui/dashboard/notificationToast';
import DueDateChecker from '@/app/ui/dashboard/dueDateChecker';
import { useTheme } from '@/app/ui/theme/themeProvider';
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

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <div className={isDark ? 'bg-swin-dark-bg text-white' : 'bg-slate-50 text-swin-charcoal'}>
      {/* Desktop sidebar */}
      <aside className="hidden md:block md:w-64 md:flex-none">
        <SideNav user={user} isBypassed={isBypassed} />
      </aside>

      {/* Main area — offset by sidebar width on desktop */}
      <div className="flex min-h-screen flex-col md:pl-64">
        <MobileNav user={user} isBypassed={isBypassed} />

        <main className="flex-1 px-4 pt-6 pb-[calc(env(safe-area-inset-bottom)+88px)] sm:px-6 md:px-10 md:py-10 md:pb-12">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {user.role !== 'admin' && user.role !== 'staff' && <FaqFloatingHelp />}
      {(user.role === 'staff' || user.role === 'admin') && <NotificationToast />}
      {user.role === 'user' && <DueDateChecker />}
    </div>
  );
}
