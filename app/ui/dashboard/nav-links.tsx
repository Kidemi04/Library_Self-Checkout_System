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
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import type { DashboardRole } from '@/app/lib/auth/types';

const userLinks = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'My Profile', href: '/dashboard/profile', icon: UserCircleIcon },
  { name: 'Book List', href: '/dashboard/book-list', icon: QueueListIcon },
  { name: 'Borrow Books', href: '/dashboard/check-out', icon: ArrowUpTrayIcon },
  { name: 'Returning Books', href: '/dashboard/check-in', icon: ArrowDownTrayIcon },
];

const staffLinks = [
  { name: 'Staff Overview', href: '/dashboard/admin', icon: Squares2X2Icon },
  { name: 'Catalogue', href: '/dashboard/book-items', icon: BookOpenIcon },
  { name: 'My Profile', href: '/dashboard/profile', icon: UserCircleIcon },
  { name: 'Book List', href: '/dashboard/book-list', icon: QueueListIcon },
  { name: 'Borrow Books', href: '/dashboard/check-out', icon: ArrowUpTrayIcon },
  { name: 'Returning Books', href: '/dashboard/check-in', icon: ArrowDownTrayIcon },
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
  const links = role === 'admin' ? adminLinks : role === 'staff' ? staffLinks : userLinks;

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

  const isPrivileged = role === 'staff' || role === 'admin';

  const activeVariant = isPrivileged
    ? 'bg-white/15 text-white shadow-lg shadow-slate-900/40'
    : 'bg-swin-red text-swin-ivory shadow-lg shadow-swin-red/30';

  const inactiveVariant = isPrivileged
    ? 'bg-transparent text-slate-200/80 hover:bg-white/10 hover:text-white border-white/20'
    : 'bg-swin-charcoal text-swin-ivory/80 hover:bg-swin-red hover:text-swin-ivory border-transparent';

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
