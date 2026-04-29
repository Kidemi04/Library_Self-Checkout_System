'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BellIcon,
  QrCodeIcon,
  BookOpenIcon,
  UserCircleIcon,
  BookmarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import MobileMenu from '@/app/ui/dashboard/mobileMenu';
import ThemeToggle from '@/app/ui/theme/themeToggle';
import type { DashboardUserProfile, DashboardRole } from '@/app/lib/auth/types';

type BottomNavItem = {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isCenter?: boolean;
};

const BOTTOM_NAV_BY_ROLE: Record<DashboardRole, BottomNavItem[]> = {
  user: [
    { key: 'home', label: 'Home', href: '/dashboard', icon: HomeIcon },
    { key: 'books', label: 'My Books', href: '/dashboard/my-books', icon: BookOpenIcon },
    { key: 'scan', label: 'Scan', href: '/dashboard/book/checkout', icon: QrCodeIcon, isCenter: true },
    { key: 'alerts', label: 'Alerts', href: '/dashboard/notifications', icon: BellIcon },
    { key: 'profile', label: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
  ],
  staff: [
    { key: 'desk', label: 'Desk', href: '/dashboard', icon: HomeIcon },
    { key: 'return', label: 'Return', href: '/dashboard/book/checkin', icon: ArrowPathIcon },
    { key: 'borrow', label: 'Borrow', href: '/dashboard/book/checkout', icon: QrCodeIcon, isCenter: true },
    { key: 'holds', label: 'Holds', href: '/dashboard/book/holds', icon: BookmarkIcon },
    { key: 'alerts', label: 'Alerts', href: '/dashboard/notifications', icon: BellIcon },
  ],
  admin: [
    { key: 'overview', label: 'Overview', href: '/dashboard/admin', icon: HomeIcon },
    { key: 'catalogue', label: 'Catalogue', href: '/dashboard/book/items', icon: BookOpenIcon },
    { key: 'scan', label: 'Scan', href: '/dashboard/book/checkout', icon: QrCodeIcon, isCenter: true },
    { key: 'alerts', label: 'Alerts', href: '/dashboard/notifications', icon: BellIcon },
    { key: 'profile', label: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
  ],
};

const roleBadge = (role: DashboardRole) =>
  role === 'admin' ? 'ADMIN' : role === 'staff' ? 'STAFF' : 'STUDENT';

type MobileNavProps = {
  user: DashboardUserProfile;
  isBypassed: boolean;
};

export default function MobileNav({ user, isBypassed }: MobileNavProps) {
  const pathname = usePathname();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/notifications?filter=unread&limit=1');
        if (!res.ok) return;
        const { notifications } = await res.json();
        setHasUnread(Array.isArray(notifications) && notifications.length > 0);
      } catch { /* ignore */ }
    };
    check();
    const timer = setInterval(check, 90_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (pathname === '/dashboard/notifications') setHasUnread(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/dashboard/admin') return pathname === '/dashboard/admin';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const nav = BOTTOM_NAV_BY_ROLE[user.role];

  return (
    <>
      {/* ── Top header ───────────────────────────── */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-hairline bg-canvas/90 px-4 py-3 text-ink backdrop-blur-md dark:border-dark-hairline dark:bg-dark-canvas/90 dark:text-on-dark md:hidden">
        <div className="flex items-center gap-2">
          <MobileMenu user={user} />
        </div>

        <div className="flex items-center gap-2.5">
          <Image
            src="/swinburne-logo.png"
            alt="Swinburne"
            width={100}
            height={34}
            priority
            className="h-[34px] w-auto rounded-sm"
          />
          <span
            className={clsx(
              'rounded-pill px-2 py-0.5 font-mono text-[9px] font-bold tracking-[1.8px]',
              user.role === 'admin'
                ? 'bg-primary/15 text-primary dark:bg-dark-primary/20 dark:text-dark-primary'
                : user.role === 'staff'
                ? 'bg-accent-amber/15 text-accent-amber'
                : 'bg-surface-cream-strong text-muted dark:bg-dark-surface-strong dark:text-on-dark-soft',
            )}
          >
            {roleBadge(user.role)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isBypassed && (
            <span className="rounded-pill border border-warning/40 bg-warning/10 px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider text-warning">
              DEV
            </span>
          )}
          <ThemeToggle size="sm" />
        </div>
      </header>

      {/* ── Bottom navigation ────────────────────── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-canvas/90 backdrop-blur-xl dark:border-dark-hairline dark:bg-dark-canvas/90 md:hidden"
        aria-label="Primary mobile"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 10px)' }}
      >
        <div className="mx-auto flex max-w-md items-end justify-around gap-1 px-4 pt-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const showDot = item.key === 'alerts' && hasUnread;

            if (item.isCenter) {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex flex-1 flex-col items-center gap-1"
                  aria-current={active ? 'page' : undefined}
                >
                  <div className="-mt-3.5 flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-primary text-on-primary transition hover:bg-primary-active dark:bg-dark-primary">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <span
                    className={clsx(
                      'font-sans text-[10px] font-semibold',
                      active ? 'text-primary dark:text-dark-primary' : 'text-muted-soft dark:text-on-dark-soft',
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.key}
                href={item.href}
                className={clsx(
                  'flex flex-1 flex-col items-center gap-0.5 py-1',
                  active ? 'text-primary dark:text-dark-primary' : 'text-muted dark:text-on-dark-soft',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.6} />
                  {showDot && (
                    <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-canvas dark:ring-dark-canvas" />
                  )}
                </span>
                <span className={clsx('font-sans text-[10px]', active ? 'font-semibold' : 'font-medium')}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
