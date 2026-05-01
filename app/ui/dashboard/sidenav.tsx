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
  ArrowPathIcon,
  QrCodeIcon,
  ClockIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  SunIcon,
  MoonIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useTheme } from '@/app/ui/theme/themeProvider';
import SignOutButton from '@/app/ui/dashboard/signOutButton';
import type { DashboardUserProfile } from '@/app/lib/auth/types';
import type { DashboardRole } from '@/app/lib/auth/types';
import { useEffect, useState } from 'react';

type NavItem = { icon: React.ElementType; label: string; href: string; badge?: number };

const ADMIN_NAV: NavItem[] = [
  { icon: HomeIcon,                  label: 'Overview',        href: '/dashboard/admin' },
  { icon: BookOpenIcon,              label: 'Catalogue',       href: '/dashboard/book/items' },
  { icon: UserGroupIcon,             label: 'Users',           href: '/dashboard/admin/users' },
  { icon: BookmarkIcon,              label: 'Holds',           href: '/dashboard/book/holds' },
  { icon: QrCodeIcon,                label: 'Borrow Books',    href: '/dashboard/book/checkout' },
  { icon: ArrowPathIcon,             label: 'Return Books',    href: '/dashboard/book/checkin' },
  { icon: ExclamationTriangleIcon,   label: 'Damage Reports',  href: '/dashboard/staff/damage-reports' },
  { icon: ClockIcon,                 label: 'Borrow History',  href: '/dashboard/book/history' },
  { icon: BellIcon,                  label: 'Notifications',   href: '/dashboard/notifications' },
  { icon: Cog6ToothIcon,             label: 'Settings',        href: '/dashboard/profile' },
];

const STAFF_NAV: NavItem[] = [
  { icon: HomeIcon,                  label: 'Desk',            href: '/dashboard' },
  { icon: QrCodeIcon,                label: 'Borrow Books',    href: '/dashboard/book/checkout' },
  { icon: ArrowPathIcon,             label: 'Return Books',    href: '/dashboard/book/checkin' },
  { icon: BookmarkIcon,              label: 'Holds',           href: '/dashboard/book/holds' },
  { icon: BookOpenIcon,              label: 'Catalogue',       href: '/dashboard/book/items' },
  { icon: ExclamationTriangleIcon,   label: 'Damage Reports',  href: '/dashboard/staff/damage-reports' },
  { icon: BellIcon,                  label: 'Notifications',   href: '/dashboard/notifications' },
  { icon: UserCircleIcon,            label: 'Profile',         href: '/dashboard/profile' },
];

const USER_NAV: NavItem[] = [
  { icon: HomeIcon,                  label: 'Dashboard',       href: '/dashboard' },
  { icon: MagnifyingGlassIcon,       label: 'Catalogue',       href: '/dashboard/book/items' },
  { icon: QrCodeIcon,                label: 'Borrow',          href: '/dashboard/book/checkout' },
  { icon: ArrowPathIcon,             label: 'Return',          href: '/dashboard/book/checkin' },
  { icon: BookOpenIcon,              label: 'My Books',        href: '/dashboard/my-books' },
  { icon: AcademicCapIcon,           label: 'Learning hub',    href: '/dashboard/learning' },
  { icon: SparklesIcon,              label: 'Recommendations', href: '/dashboard/recommendations' },
  { icon: ChatBubbleLeftRightIcon,   label: 'Chat Assistant',  href: '/dashboard/chat' },
  { icon: QuestionMarkCircleIcon,    label: 'Help Centre',     href: '/dashboard/faq' },
  { icon: BellIcon,                  label: 'Notifications',   href: '/dashboard/notifications' },
  { icon: UserCircleIcon,            label: 'Profile',         href: '/dashboard/profile' },
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
    const timer = setInterval(check, 90_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (pathname === '/dashboard/notifications') setHasUnread(false);
  }, [pathname]);

  const nav = getNav(user.role);
  const roleBadge = user.role === 'admin' ? 'ADMIN' : user.role === 'staff' ? 'STAFF' : 'STUDENT';
  const initials = getInitials(user.name);

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-hairline bg-canvas py-7 px-[18px] text-ink dark:border-dark-hairline dark:bg-dark-canvas dark:text-on-dark">
      {/* Logo */}
      <div className="mb-5 px-2.5 pb-5 border-b border-hairline dark:border-dark-hairline">
        <Link href="/dashboard" className="block">
          <Image
            src="/swinburne-logo.png"
            alt="Swinburne University of Technology Sarawak Campus"
            width={220}
            height={103}
            className="w-full rounded-sm"
            priority
          />
        </Link>
        <p className="mt-2 font-display text-[11px] italic text-muted-soft dark:text-on-dark-soft">
          Library · est. 1908
        </p>
      </div>

      {/* Role badge */}
      <div className={clsx(
        'mx-2.5 mb-5 rounded-btn border p-2.5',
        user.role === 'admin'
          ? 'border-primary/30 bg-primary/8 dark:border-dark-primary/40 dark:bg-dark-primary/15'
          : user.role === 'staff'
          ? 'border-accent-amber/30 bg-accent-amber/10 dark:border-accent-amber/40 dark:bg-accent-amber/15'
          : 'border-hairline bg-transparent dark:border-dark-hairline',
      )}>
        <p className={clsx(
          'font-mono text-[9px] font-bold uppercase tracking-[2px]',
          user.role === 'admin' ? 'text-primary dark:text-dark-primary'
            : user.role === 'staff' ? 'text-accent-amber'
            : 'text-muted-soft dark:text-on-dark-soft',
        )}>{roleBadge}</p>
        <p className="mt-0.5 font-sans text-[13px] font-semibold text-ink dark:text-on-dark">
          {user.name ?? user.email ?? 'Library Member'}
        </p>
        {isBypassed && (
          <p className="mt-0.5 font-mono text-[9px] text-primary/70 dark:text-dark-primary/70">Dev bypass active</p>
        )}
      </div>

      <p className="mb-2 px-3 font-mono text-[9px] font-semibold uppercase tracking-[1.8px] text-muted-soft dark:text-on-dark-soft">
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
                'flex items-center gap-3 rounded-btn px-3 py-2.5 font-sans text-nav-link transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-dark-primary/15 dark:text-dark-primary'
                  : 'text-body hover:bg-surface-cream-strong hover:text-ink dark:text-on-dark/70 dark:hover:bg-dark-surface-strong dark:hover:text-on-dark',
              )}
            >
              <span className="relative flex-shrink-0">
                <Icon className="h-[18px] w-[18px]" />
                {showDot && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-canvas dark:ring-dark-canvas" />
                )}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge != null && (
                <span className={clsx(
                  'rounded-pill px-1.5 py-0.5 font-mono text-[10px] font-bold',
                  isActive ? 'bg-primary text-on-primary' : 'bg-surface-cream-strong text-muted dark:bg-dark-surface-strong dark:text-on-dark-soft',
                )}>{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex w-full items-center justify-center gap-2 rounded-btn border border-hairline bg-surface-card px-3 py-2 font-sans text-caption text-body transition hover:bg-surface-cream-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark/70 dark:hover:bg-dark-surface-strong dark:hover:text-on-dark dark:focus-visible:ring-offset-dark-canvas"
        >
          {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          {isDark ? 'Light mode' : 'Dark mode'}
        </button>

        {/* User footer */}
        <div className="flex items-center gap-2.5 rounded-btn border border-hairline p-2.5 dark:border-dark-hairline">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-on-primary">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-sans text-[13px] font-semibold text-ink dark:text-on-dark">
              {user.name ?? 'Library Member'}
            </p>
            <p className="truncate font-mono text-[11px] text-muted-soft dark:text-on-dark-soft">
              {user.email ?? ''}
            </p>
          </div>
          <SignOutButton labelClassName="hidden" />
        </div>
      </div>
    </aside>
  );
}
