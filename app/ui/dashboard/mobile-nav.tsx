'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BellIcon,
  CameraIcon,
  BookOpenIcon,
  QueueListIcon,
  UserCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import AcmeLogo from '@/app/ui/acme-logo';
import SignOutButton from '@/app/ui/dashboard/sign-out-button';
import ThemeToggle from '@/app/ui/theme/theme-toggle';
import { useTheme } from '@/app/ui/theme/theme-provider';
import type { DashboardUserProfile } from '@/app/lib/auth/types';

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: React.ForwardRefExoticComponent<React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & { title?: string; titleId?: string } & React.RefAttributes<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { key: 'home', label: 'Home', href: '/dashboard', icon: HomeIcon },
  { key: 'catalog', label: 'Catalog', href: '/dashboard/book', icon: BookOpenIcon },
  { key: 'scan', label: 'Camera', href: '/dashboard/camera-scan', icon: CameraIcon },
  { key: 'notifications', label: 'Notifications', href: '/dashboard/notifications', icon: BellIcon },
  { key: 'profile', label: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
];

export default function MobileNav({
  user,
  isBypassed,
}: {
  user: DashboardUserProfile;
  isBypassed: boolean;
}) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const topBarClasses = clsx(
    'flex items-center justify-between border-b px-4 py-3 backdrop-blur-md transition-colors md:hidden',
    isDark
      ? 'border-white/10 bg-slate-950/90 text-white shadow-lg'
      : 'border-swin-charcoal/10 bg-swin-charcoal/95 text-swin-ivory shadow-lg',
  );

  const navClasses = clsx(
    'fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-xl transition-colors md:hidden shadow-2xl',
    isDark
      ? 'border-white/10 bg-slate-950/80 text-white'
      : 'border-swin-charcoal/10 bg-white/90 text-swin-charcoal',
  );

  const isItemActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const activeTextClass = isDark ? 'text-emerald-300' : 'text-swin-red';
  const inactiveTextClass = isDark ? 'text-slate-300/80 hover:text-white' : 'text-swin-charcoal/70 hover:text-swin-red/80';

  const scanButtonBackground = isDark
    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-slate-950'
    : 'bg-gradient-to-br from-swin-red to-swin-red/90 text-white';
  const scanButtonRing = isDark
    ? 'ring-emerald-200/40 shadow-emerald-500/30'
    : 'ring-swin-red/20 shadow-swin-red/40';

  return (
    <>
      <header className={topBarClasses}>
        <Link href="/" className="flex items-center gap-2">
          <AcmeLogo />
          <span className="text-sm font-semibold uppercase tracking-wide">Self-Checkout</span>
        </Link>
        <div className="flex items-center gap-2">
          {isBypassed ? (
            <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
              Dev
            </span>
          ) : null}
          <ThemeToggle size="sm" />
          <SignOutButton
            className={clsx(
              'inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-xs font-semibold transition',
              isDark
                ? 'border-white/20 text-white hover:bg-white/10'
                : 'border-swin-ivory/20 text-swin-ivory hover:bg-swin-ivory/20 hover:text-swin-charcoal',
            )}
            labelClassName="text-xs font-semibold"
          />
        </div>
      </header>

      <nav className={navClasses} aria-label="Primary">
        {/* Admin-only Manage User Button */}
        {user.role === 'admin' && (
          <Link
            href="/dashboard/admin/users"
            className={clsx(
              'absolute right-3 top-[-68px] z-[70] grid h-16 w-16 place-items-center rounded-full shadow-lg',
              'bg-swin-red text-white hover:bg-swin-red/90' // Swinburne red circular button
            )}
            aria-label="Manage Users"
          >
            <UserGroupIcon className="h-7 w-7" />
          </Link>
        )}

        {/* Main Navigation */}
        <div className="mx-auto flex max-w-4xl items-end justify-between gap-1 px-5 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          {navItems.map((item) => {
            const Icon = item.icon;

            // --- Existing special Scan button (keep unchanged) ---
            if (item.key === 'scan') {
              const isActive = isItemActive(item.href);

              return (
                <div key={item.key} className="flex flex-1 flex-col items-center justify-end gap-1">
                  <Link
                    href={item.href}
                    className={clsx(
                      'grid h-16 w-16 place-items-center rounded-full shadow-xl ring-4 transition',
                      scanButtonBackground,
                      isActive ? 'scale-105' : 'hover:scale-105',
                      scanButtonRing,
                    )}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label="Scan to borrow books"
                  >
                    <Icon className="h-7 w-7" />
                  </Link>
                  <span className={clsx('text-[11px] font-semibold', isActive ? activeTextClass : inactiveTextClass)}>
                    {item.label}
                  </span>
                </div>
              );
            }

            // --- Default for all other nav items ---
            const isActive = isItemActive(item.href);

            return (
              <Link
                key={item.key}
                href={item.href}
                className={clsx(
                  'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors',
                  isActive ? activeTextClass : inactiveTextClass,
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-6 w-6" />
                <span>{item.label}</span>
              </Link>
            );
          })}

        </div>
      </nav>
    </>
  );
}
