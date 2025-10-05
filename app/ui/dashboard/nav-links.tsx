'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  BookOpenIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const studentLinks = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Check Out', href: '/dashboard/check-out', icon: ArrowUpTrayIcon },
  { name: 'Check In', href: '/dashboard/check-in', icon: ArrowDownTrayIcon },
];

const adminLinks = [
  { name: 'Admin Overview', href: '/dashboard/admin', icon: Squares2X2Icon },
  { name: 'Book Items', href: '/dashboard/book-items', icon: BookOpenIcon },
  { name: 'Check Out', href: '/dashboard/check-out', icon: ArrowUpTrayIcon },
  { name: 'Check In', href: '/dashboard/check-in', icon: ArrowDownTrayIcon },
];

export default function NavLinks(
  { onNavigate, showLabels }: { onNavigate?: () => void; showLabels?: boolean } = {},
) {
  const pathname = usePathname();
  const isAdminView =
    pathname.startsWith('/dashboard/admin') || pathname.startsWith('/dashboard/book-items');
  const links = isAdminView ? adminLinks : studentLinks;

  return (
    <>
      {links.map(({ name, href, icon: LinkIcon }) => {
        const isActive = pathname === href;

        return (
          <Link
            key={name}
            href={href}
            className={clsx(
              'flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md border border-transparent p-3 text-sm font-medium transition-colors md:flex-none md:justify-start md:p-2 md:px-3',
              isActive
                ? 'bg-swin-red text-swin-ivory shadow-lg shadow-swin-red/30'
                : 'bg-swin-charcoal text-swin-ivory/80 hover:bg-swin-red hover:text-swin-ivory'
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
