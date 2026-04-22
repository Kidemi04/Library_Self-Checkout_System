'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  HomeIcon,
  BookOpenIcon,
  UserGroupIcon,
  UserCircleIcon,
  AcademicCapIcon,
  SparklesIcon,
  BellIcon,
  BookmarkIcon,
  ArrowRightOnRectangleIcon,
  ArrowPathIcon,
  QrCodeIcon,
  ClockIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useTheme } from '@/app/ui/theme/themeProvider';
import SignOutButton from '@/app/ui/dashboard/signOutButton';
import ThemeToggle from '@/app/ui/theme/themeToggle';
import type { DashboardUserProfile } from '@/app/lib/auth/types';
import type { DashboardRole } from '@/app/lib/auth/types';
import { useEffect, useState } from 'react';

type NavItem = { icon: React.ElementType; label: string; href: string; badge?: number };

const ADMIN_NAV: NavItem[] = [
  { icon: HomeIcon,               label: 'Overview',       href: '/dashboard/admin' },
  { icon: BookOpenIcon,           label: 'Catalogue',      href: '/dashboard/book/items' },
  { icon: UserGroupIcon,          label: 'Users',          href: '/dashboard/admin/users' },
  { icon: BookmarkIcon,           label: 'Reservations',   href: '/dashboard/book/holds' },
  { icon: QrCodeIcon,             label: 'Borrow Books',   href: '/dashboard/book/checkout' },
  { icon: ArrowPathIcon,          label: 'Return Books',   href: '/dashboard/book/checkin' },
  { icon: ClockIcon,              label: 'Borrow History', href: '/dashboard/book/history' },
  { icon: BellIcon,               label: 'Notifications',  href: '/dashboard/notifications' },
  { icon: AcademicCapIcon,        label: 'Learning hub',   href: '/dashboard/learning' },
  { icon: Cog6ToothIcon,          label: 'Settings',       href: '/dashboard/profile' },
];

const STAFF_NAV: NavItem[] = [
  { icon: HomeIcon,               label: 'Desk',           href: '/dashboard' },
  { icon: QrCodeIcon,             label: 'Borrow Books',   href: '/dashboard/book/checkout' },
  { icon: ArrowPathIcon,          label: 'Return Books',   href: '/dashboard/book/checkin' },
  { icon: BookmarkIcon,           label: 'Holds',          href: '/dashboard/book/holds' },
  { icon: BookOpenIcon,           label: 'Catalogue',      href: '/dashboard/book/items' },
  { icon: ClockIcon,              label: 'Borrow History', href: '/dashboard/book/history' },
  { icon: BellIcon,               label: 'Notifications',  href: '/dashboard/notifications' },
  { icon: AcademicCapIcon,        label: 'Learning hub',   href: '/dashboard/learning' },
];

const USER_NAV: NavItem[] = [
  { icon: HomeIcon,               label: 'Dashboard',      href: '/dashboard' },
  { icon: BookOpenIcon,           label: 'My Books',       href: '/dashboard/my-books' },
  { icon: BookmarkIcon,           label: 'Reservations',   href: '/dashboard/my-books?tab=reservations' },
  { icon: MagnifyingGlassIcon,    label: 'Catalogue',      href: '/dashboard/book/items' },
  { icon: AcademicCapIcon,        label: 'Learning hub',   href: '/dashboard/learning' },
  { icon: BellIcon,               label: 'Notifications',  href: '/dashboard/notifications' },
  { icon: SparklesIcon,           label: 'Recommendations',href: '/dashboard/recommendations' },
  { icon: QuestionMarkCircleIcon, label: 'FAQ',            href: '/dashboard/faq' },
  { icon: UserCircleIcon,         label: 'Profile',        href: '/dashboard/profile' },
];

function getNav(role: DashboardRole): NavItem[] {
  if (role === 'admin') return ADMIN_NAV;
  if (role === 'staff') return STAFF_NAV;
  return USER_NAV;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

type SideNavProps = {
  user: DashboardUserProfile;
  isBypassed: boolean;
};

export default function SideNav({ user, isBypassed }: SideNavProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
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
    const timer = setInterval(check, 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (pathname === '/dashboard/notifications') setHasUnread(false);
  }, [pathname]);

  const nav = getNav(user.role);
  const roleBadge = user.role === 'admin' ? 'ADMIN' : user.role === 'staff' ? 'STAFF' : 'STUDENT';
  const initials = getInitials(user.name);

  return (
    <aside className={clsx(
      'fixed left-0 top-0 flex h-screen w-64 flex-col border-r py-7 px-[18px]',
      isDark
        ? 'border-white/10 bg-swin-dark-surface text-white'
        : 'border-swin-charcoal/10 bg-white text-swin-charcoal',
    )}>
      {/* Logo */}
      <div className="mb-5 px-2.5 pb-5 border-b border-swin-charcoal/10 dark:border-white/10">
        <Image
          src="/swinburne-logo.png"
          alt="Swinburne University of Technology Sarawak Campus"
          width={220}
          height={103}
          className="w-full rounded-sm"
          priority
        />
        <p className="mt-2 font-display text-[11px] italic text-swin-charcoal/45 dark:text-white/40">
          Library · est. 1908
        </p>
      </div>

      {/* Role badge */}
      <div className={clsx(
        'mx-2.5 mb-5 rounded-lg border p-2.5',
        user.role === 'admin'
          ? 'border-swin-red/30 bg-swin-red/8 dark:border-swin-red/40 dark:bg-swin-red/15'
          : user.role === 'staff'
          ? 'border-swin-gold/30 bg-swin-gold/8 dark:border-swin-gold/40 dark:bg-swin-gold/15'
          : 'border-swin-charcoal/10 bg-transparent dark:border-white/10',
      )}>
        <p className={clsx(
          'font-mono text-[9px] font-bold uppercase tracking-[2px]',
          user.role === 'admin' ? 'text-swin-red' : user.role === 'staff' ? 'text-swin-gold' : 'text-swin-charcoal/50 dark:text-white/50',
        )}>{roleBadge}</p>
        <p className="mt-0.5 text-[13px] font-semibold text-swin-charcoal dark:text-white">
          {user.name ?? user.email ?? 'Library Member'}
        </p>
        {isBypassed && (
          <p className="mt-0.5 font-mono text-[9px] text-swin-red/70">Dev bypass active</p>
        )}
      </div>

      <p className="mb-2 px-3 font-mono text-[9px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/40 dark:text-white/40">
        Workspace
      </p>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto scrollbar-none space-y-0.5">
        {nav.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : item.href === '/dashboard/admin'
            ? pathname === '/dashboard/admin'
            : pathname.startsWith(item.href.split('?')[0]);
          const Icon = item.icon;
          const showDot = item.label === 'Notifications' && hasUnread;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors',
                isActive
                  ? 'bg-swin-red/10 text-swin-red dark:bg-swin-red/15 dark:text-red-300'
                  : 'text-swin-charcoal/65 hover:bg-swin-charcoal/5 hover:text-swin-charcoal dark:text-white/55 dark:hover:bg-white/8 dark:hover:text-white',
              )}
            >
              <span className="relative flex-shrink-0">
                <Icon className="h-[18px] w-[18px]" />
                {showDot && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-swin-red ring-2 ring-white dark:ring-swin-dark-surface" />
                )}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge != null && (
                <span className={clsx(
                  'rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold',
                  isActive ? 'bg-swin-red text-white' : 'bg-swin-charcoal/10 text-swin-charcoal/60 dark:bg-white/10 dark:text-white/60',
                )}>{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="mt-4 space-y-2">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-swin-charcoal/10 bg-swin-charcoal/5 px-3 py-2 text-[12px] font-medium text-swin-charcoal/70 transition hover:bg-swin-charcoal/10 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
        >
          {isDark ? '☀ Light mode' : '☾ Dark mode'}
        </button>

        {/* User footer */}
        <div className="flex items-center gap-2.5 rounded-lg border border-swin-charcoal/10 p-2.5 dark:border-white/10">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-swin-red text-[12px] font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-swin-charcoal dark:text-white">
              {user.name ?? 'Library Member'}
            </p>
            <p className="truncate font-mono text-[11px] text-swin-charcoal/40 dark:text-white/40">
              {user.email ?? ''}
            </p>
          </div>
          <SignOutButton
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-swin-charcoal/40 transition hover:text-swin-red dark:text-white/40 dark:hover:text-red-400"
            labelClassName="hidden"
          />
        </div>
      </div>
    </aside>
  );
}
