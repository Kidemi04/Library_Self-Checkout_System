// app/ui/dashboard/nav-links.tsx
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
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import type { DashboardRole } from '@/app/lib/auth/types';

const studentLinks = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Book List', href: '/dashboard/book-list', icon: QueueListIcon },
  { name: 'Borrow Books', href: '/dashboard/check-out', icon: ArrowUpTrayIcon },
  { name: 'Returning Books', href: '/dashboard/check-in', icon: ArrowDownTrayIcon },
];

const adminLinks = [
  { name: 'Admin Overview', href: '/dashboard/admin', icon: Squares2X2Icon },
  { name: 'Catalogue', href: '/dashboard/book-items', icon: BookOpenIcon },
  { name: 'Book List', href: '/dashboard/book-list', icon: QueueListIcon },
  { name: 'Borrow Books', href: '/dashboard/check-out', icon: ArrowUpTrayIcon },
  { name: 'Returning Books', href: '/dashboard/check-in', icon: ArrowDownTrayIcon },
  { name: 'Manage Users', href: '/dashboard/admin/users', icon: UserGroupIcon },
];

export default function NavLinks({
  role,
  onNavigate,
  showLabels,
  userEmail,
}: {
  role: DashboardRole;
  onNavigate?: () => void;
  showLabels?: boolean;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const links = role === 'staff' ? adminLinks : studentLinks;

  const activeHref = links.reduce<string | null>((current, { href }) => {
    const isExactMatch = pathname === href;
    const isNestedMatch = href !== '/dashboard' && pathname.startsWith(`${href}/`);

    if (!isExactMatch && !isNestedMatch) return current;
    if (!current) return href;
    return href.length > current.length ? href : current;
  }, null);

  const activeVariant =
    role === 'staff'
      ? 'bg-white/15 text-white shadow-lg shadow-slate-900/40'
      : 'bg-swin-red text-swin-ivory shadow-lg shadow-swin-red/30';

  const inactiveVariant =
    role === 'staff'
      ? 'bg-transparent text-slate-200/80 hover:bg-white/10 hover:text-white border-white/20'
      : 'bg-swin-charcoal text-swin-ivory/80 hover:bg-swin-red hover:text-swin-ivory border-transparent';

  const roleLabel = role === 'staff' ? 'Admin / Staff account' : 'Student account';

  return (
    <>
      <div
        className={clsx(
          'mb-3 rounded-md border p-3 text-left text-xs leading-tight md:mb-4',
          role === 'staff'
            ? 'border-white/15 bg-white/5 text-white/90'
            : 'border-swin-ivory/15 bg-swin-ivory/5 text-swin-ivory/90',
        )}
      >
        <p className="uppercase tracking-wide opacity-70">Signed in as</p>
        <p className="font-semibold text-sm">{roleLabel}</p>
        {userEmail ? <p className="truncate text-[11px] opacity-70">{userEmail}</p> : null}
      </div>

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
