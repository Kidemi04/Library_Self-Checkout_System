'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BellIcon,
  CameraIcon,
  BookOpenIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import AcmeLogo from '@/app/ui/acme-logo';
import SignOutButton from '@/app/ui/dashboard/sign-out-button';
import type { DashboardUserProfile } from '@/app/lib/auth/types';

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: React.ForwardRefExoticComponent<React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & { title?: string; titleId?: string } & React.RefAttributes<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { key: 'home', label: 'Home', href: '/dashboard', icon: HomeIcon },
  { key: 'notifications', label: 'Notifications', href: '/dashboard/notifications', icon: BellIcon },
  { key: 'scan', label: 'Scan', href: '/dashboard/qr-scan', icon: CameraIcon },
  { key: 'catalog', label: 'Catalog', href: '/dashboard/book-list', icon: BookOpenIcon },
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
  const isPrivileged = user.role === 'staff' || user.role === 'admin';

  const topBarClasses = clsx(
    'flex items-center justify-between px-4 py-3 md:hidden',
    isPrivileged
      ? 'bg-slate-950 text-white border-b border-white/10'
      : 'bg-swin-charcoal text-swin-ivory border-b border-swin-ivory/10',
  );

  const navClasses = clsx(
    'fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-md md:hidden',
    isPrivileged
      ? 'border-white/10 bg-slate-950/90 text-white'
      : 'border-swin-charcoal/10 bg-white/95 text-swin-charcoal',
  );

  const isItemActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const activeTextClass = isPrivileged ? 'text-emerald-300' : 'text-swin-red';
  const inactiveTextClass = isPrivileged
    ? 'text-slate-300/80 hover:text-white'
    : 'text-swin-charcoal/70 hover:text-swin-red/80';

  const scanButtonBackground = isPrivileged ? 'bg-emerald-500 text-slate-950' : 'bg-swin-red text-white';
  const scanButtonRing = isPrivileged ? 'ring-emerald-200/60' : 'ring-swin-red/30';

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
          <SignOutButton
            className={clsx(
              'inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-xs font-semibold transition',
              isPrivileged
                ? 'border-white/20 text-white hover:bg-white/10'
                : 'border-swin-ivory/20 text-swin-ivory hover:bg-swin-ivory/20 hover:text-swin-charcoal',
            )}
            labelClassName="text-xs font-semibold"
          />
        </div>
      </header>

      <nav className={navClasses} aria-label="Primary">
        <div className="mx-auto flex max-w-4xl items-end justify-between gap-1 px-5 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
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
