'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const links = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Check Out', href: '/dashboard/check-out', icon: ArrowUpTrayIcon },
  { name: 'Check In', href: '/dashboard/check-in', icon: ArrowDownTrayIcon },
  { name: 'Book Items', href: '/dashboard/book-items', icon: BookOpenIcon },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map(({ name, href, icon: LinkIcon }) => {
        const isActive = pathname === href;

        return (
          <Link
            key={name}
            href={href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md border border-transparent p-3 text-sm font-medium transition-colors md:flex-none md:justify-start md:p-2 md:px-3',
              isActive
                ? 'bg-swin-red text-swin-ivory shadow-lg shadow-swin-red/30'
                : 'bg-swin-charcoal text-swin-ivory/80 hover:bg-swin-red hover:text-swin-ivory'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <LinkIcon className="w-5" />
            <span className="hidden md:block">{name}</span>
          </Link>
        );
      })}
    </>
  );
}
