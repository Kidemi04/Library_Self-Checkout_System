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
import { useTheme } from '@/app/ui/theme/themeProvider';
import type { DashboardUserProfile, DashboardRole } from '@/app/lib/auth/types';
import SignOutButton from '@/app/ui/dashboard/signOutButton';

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
    { key: 'alerts', label: 'Notification', href: '/dashboard/notifications', icon: BellIcon },
    { key: 'profile', label: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
  ],
  staff: [
    { key: 'desk', label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { key: 'return', label: 'Return', href: '/dashboard/book/checkin', icon: ArrowPathIcon },
    { key: 'borrow', label: 'Borrow', href: '/dashboard/book/checkout', icon: QrCodeIcon, isCenter: true },
    { key: 'holds', label: 'Holds', href: '/dashboard/book/holds', icon: BookmarkIcon },
    { key: 'alerts', label: 'Notification', href: '/dashboard/notifications', icon: BellIcon },
  ],
  admin: [
    { key: 'overview', label: 'Overview', href: '/dashboard/admin', icon: HomeIcon },
    { key: 'catalogue', label: 'Catalogue', href: '/dashboard/book/items', icon: BookOpenIcon },
    { key: 'scan', label: 'Scan', href: '/dashboard/book/checkout', icon: QrCodeIcon, isCenter: true },
    { key: 'alerts', label: 'Notification', href: '/dashboard/notifications', icon: BellIcon },
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
      <header
        className={clsx(
          'sticky top-0 z-40 flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur-md md:hidden',
          isDark
            ? 'border-white/10 bg-swin-dark-surface/90 text-white'
            : 'border-swin-charcoal/10 bg-white/90 text-swin-charcoal',
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5">
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
              'rounded-full px-2 py-0.5 font-mono text-[9px] font-bold tracking-[1.8px]',
              user.role === 'admin'
                ? 'bg-swin-red/15 text-swin-red'
                : user.role === 'staff'
                ? 'bg-swin-gold/15 text-swin-gold'
                : 'bg-swin-charcoal/10 text-swin-charcoal/60 dark:bg-white/10 dark:text-white/60',
            )}
          >
            {roleBadge(user.role)}
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          {isBypassed && (
            <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider text-amber-600 dark:text-amber-300">
              DEV
            </span>
          )}
          <SignOutButton
            className={clsx(
              'flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 transition',
              isDark
                ? 'text-white/50 hover:bg-white/10 hover:text-white'
                : 'text-swin-charcoal/50 hover:bg-swin-charcoal/8 hover:text-swin-charcoal',
            )}
            labelClassName="text-[10px] font-medium"
          />
        </div>
      </header>

      {/* ── Bottom navigation ────────────────────── */}
      <nav
        className={clsx(
          'fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-xl md:hidden',
          isDark
            ? 'border-white/10 bg-swin-dark-surface/90'
            : 'border-swin-charcoal/10 bg-white/90',
        )}
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
                  <div
                    className="-mt-3.5 flex h-[46px] w-[46px] items-center justify-center rounded-[14px] text-white transition"
                    style={{
                      background: 'linear-gradient(135deg, #A81C2A, #C82333)',
                      boxShadow: '0 8px 20px rgba(200,35,51,0.35)',
                    }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <span
                    className={clsx(
                      'text-[10px] font-semibold',
                      active
                        ? 'text-swin-red'
                        : 'text-swin-charcoal/50 dark:text-white/50',
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
                  active
                    ? 'text-swin-red'
                    : 'text-swin-charcoal/55 dark:text-white/55',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.6} />
                  {showDot && (
                    <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-swin-red ring-2 ring-white dark:ring-swin-dark-surface" />
                  )}
                </span>
                <span className={clsx('text-[10px]', active ? 'font-semibold' : 'font-medium')}>
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
