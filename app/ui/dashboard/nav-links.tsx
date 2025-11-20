'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  BookOpenIcon,
  Squares2X2Icon,
  UserGroupIcon,
  QueueListIcon,
  UserCircleIcon,
  BellAlertIcon,      // 👈 NEW: icon for Manage Holds
  InformationCircleIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useTheme } from '@/app/ui/theme/theme-provider';
import type { DashboardRole } from '@/app/lib/auth/types';

const userLinks = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'My Profile', href: '/dashboard/profile', icon: UserCircleIcon },
  { name: 'Friends', href: '/dashboard/friends', icon: UserGroupIcon },
  { name: 'Communities', href: '/dashboard/communities', icon: UserGroupIcon },
  { name: 'Catalogue', href: '/dashboard/book-items', icon: BookOpenIcon },
  { name: 'My Reservations', href: '/dashboard/reservations', icon: BellAlertIcon },
  { name: 'Borrow Books', href: '/dashboard/check-out', icon: ArrowUpTrayIcon },
  { name: 'Returning Books', href: '/dashboard/check-in', icon: ArrowDownTrayIcon },
  { name: 'Learning Hub', href: '/dashboard/learning', icon: AcademicCapIcon },
  { name: 'About Us', href: '/dashboard/about-page', icon: InformationCircleIcon },
];

const staffLinks = [
  { name: 'Staff Overview', href: '/dashboard/admin', icon: Squares2X2Icon },
  { name: 'Catalogue', href: '/dashboard/book-items', icon: BookOpenIcon },
  { name: 'My Profile', href: '/dashboard/profile', icon: UserCircleIcon },
  { name: 'Friends', href: '/dashboard/friends', icon: UserGroupIcon },
  { name: 'Communities', href: '/dashboard/communities', icon: UserGroupIcon },
  { name: 'Book List', href: '/dashboard/book-list', icon: QueueListIcon },
  { name: 'Manage Holds', href: '/dashboard/holds', icon: BellAlertIcon }, // 👈 NEW
  { name: 'Borrow Books', href: '/dashboard/check-out', icon: ArrowUpTrayIcon },
  { name: 'Returning Books', href: '/dashboard/check-in', icon: ArrowDownTrayIcon },
  { name: 'Learning Hub', href: '/dashboard/learning', icon: AcademicCapIcon },
  { name: 'About Us', href: '/dashboard/about-page', icon: InformationCircleIcon },
];

const adminLinks = [
  ...staffLinks,
  { name: 'Manage Users', href: '/dashboard/admin/users', icon: UserGroupIcon },
];

export default function NavLinks({
  role,
  onNavigate,
  showLabels,
}: {
  role: DashboardRole;
  onNavigate?: () => void;
  showLabels?: boolean;
}) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const links = role === 'admin' ? adminLinks : role === 'staff' ? staffLinks : userLinks;
  const isPrivileged = role === 'staff' || role === 'admin';
  const isDarkTheme = theme === 'dark';

  const activeHref = links.reduce<string | null>((current, { href }) => {
    const isExactMatch = pathname === href;
    const isNestedMatch = href !== '/dashboard' && pathname.startsWith(`${href}/`);

    if (!isExactMatch && !isNestedMatch) {
      return current;
    }

    if (!current) {
      return href;
    }

    return href.length > current.length ? href : current;
  }, null);

  const activeVariant = isDarkTheme
    ? 'bg-white/15 text-white shadow-lg shadow-slate-900/40'
    : 'bg-swin-red text-[#FEFDFD] shadow-lg shadow-swin-red/30';

  const inactiveVariant = isDarkTheme
    ? 'bg-transparent text-slate-200/80 hover:bg-white/10 hover:text-white border-white/20'
    : 'bg-[#2a2d38] text-[#FEFDFD]/80 hover:bg-swin-red hover:text-white border-transparent shadow-inner shadow-black/30';

  return (
    <>
      {links.map(({ name, href, icon: LinkIcon }) => {
        const isActive = href === activeHref;

        return (
          <Link
            key={name}
            href={href}
            className={clsx(
              'flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md border p-3 text-sm font-medium transition-colors md:flex-none md:justify-start md:p-2 md:px-3',
              isActive ? activeVariant : inactiveVariant,
              name === 'Learning Hub' && 'hidden md:flex'
            )}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
          >
            <LinkIcon className="w-5" />
            <span className={clsx(showLabels ? 'block' : 'hidden md:block')}>{name}</span>
          </Link>
        );
      })}
    </>
  );
}
