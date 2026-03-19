'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BookOpenIcon,
  Squares2X2Icon,
  UserGroupIcon,
  UserCircleIcon,
  BellAlertIcon,
  AcademicCapIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import BlurFade from '@/app/ui/magic-ui/blur-fade';
import { useTheme } from '@/app/ui/theme/theme-provider';
import type { DashboardRole } from '@/app/lib/auth/types';

const userLinks = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Catalogue', href: '/dashboard/book', icon: BookOpenIcon },
  { name: 'My Profile', href: '/dashboard/profile', icon: UserCircleIcon },
  { name: 'Social', href: '/dashboard/social', icon: UserGroupIcon },
  { name: 'My Reservations', href: '/dashboard/reservations', icon: BellAlertIcon },
  { name: 'AI Recommendations', href: '/dashboard/recommendations', icon: SparklesIcon },
  { name: 'Learning', href: '/dashboard/learning', icon: AcademicCapIcon },
];

const staffLinks = [
  { name: 'Staff Overview', href: '/dashboard/admin', icon: Squares2X2Icon },
  { name: 'Catalogue', href: '/dashboard/book', icon: BookOpenIcon },
  { name: 'My Profile', href: '/dashboard/profile', icon: UserCircleIcon },
  { name: 'Social', href: '/dashboard/social', icon: UserGroupIcon },
  { name: 'Manage Holds', href: '/dashboard/holds', icon: BellAlertIcon },
  { name: 'AI Recommendations', href: '/dashboard/recommendations', icon: SparklesIcon },
  { name: 'Learning', href: '/dashboard/learning', icon: AcademicCapIcon },
];

const adminLinks = [...staffLinks, { name: 'Manage Users', href: '/dashboard/admin/users', icon: UserGroupIcon }];

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
    ? 'bg-gradient-to-r from-white/20 to-white/10 text-white shadow-xl shadow-white/10 scale-[1.02]'
    : 'bg-gradient-to-r from-swin-red to-swin-red/90 text-swin-ivory shadow-xl shadow-swin-red/30 scale-[1.02]';

  const inactiveVariant = isDarkTheme
    ? 'bg-transparent text-slate-200/80 hover:bg-white/10 hover:text-white hover:scale-[1.01] hover:shadow-lg border-white/10'
    : 'bg-black/10 text-swin-ivory/80 hover:bg-swin-red/80 hover:text-white hover:scale-[1.01] hover:shadow-lg border-transparent shadow-sm';

  return (
    <>
      {links.map(({ name, href, icon: LinkIcon }, index) => {
        const isActive = href === activeHref;

        return (
          <BlurFade key={name} delay={0.3 + index * 0.05} yOffset={10}>
            <Link
              href={href}
              className={clsx(
                'flex h-auto w-full grow items-center justify-center gap-2 rounded-xl border py-3.5 px-3 text-sm font-medium transition-all duration-300 ease-out mb-2 md:flex-none md:justify-start active:scale-95',
                isActive ? activeVariant : inactiveVariant,
                name === 'Learning Hub' && 'hidden md:flex',
              )}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
            >
              <LinkIcon className="w-5" />
              <span className={clsx(showLabels ? 'block' : 'hidden md:block')}>{name}</span>
            </Link>
          </BlurFade>
        );
      })}
    </>
  );
}
