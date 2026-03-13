'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BookOpenIcon,
  UserGroupIcon,
  UserCircleIcon,
  AcademicCapIcon,
  SparklesIcon,
  ChevronDownIcon, // Import icon for collapse indicator
  BellIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import BlurFade from '@/app/ui/magicUi/blurFade';
import { useTheme } from '@/app/ui/theme/themeProvider';
import type { DashboardRole } from '@/app/lib/auth/types';

// Define the Link type to support nested children
type NavItem = {
  name: string;
  href: string;
  icon: any;
  children?: { name: string; href: string }[];
};

const userLinks: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { 
    name: 'Catalogue', href: '/dashboard/book', icon: BookOpenIcon,
    // sub-titles
    children: [
      { name: 'Book Items', href: '/dashboard/book/items' },
      { name: 'Borrow Books', href: '/dashboard/book/checkout' },
      { name: 'Return Books', href: '/dashboard/book/checkin' },
      { name: 'My Reservations', href: '/dashboard/book/reservation'}
    ]
  },
  { name: 'AI Recommendations', href: '/dashboard/recommendations', icon: SparklesIcon },
  { 
    name: 'Learning', href: '/dashboard/learning', icon: AcademicCapIcon,
    // sub-titles
    children: [
      { name: 'LinkedIn Learning library', href: '/dashboard/learning/linkedin' },
      { name: 'Learning Path Management', href: '/dashboard/learning/paths' },
    ]
  },
  { name: 'Social', href: '/dashboard/social', icon: UserGroupIcon,
  children: [
    { name: 'Communities', href: '/dashboard/social/communities' },
    { name: 'Friends', href: '/dashboard/social/friends' },
  ]
},

  { name: 'Notifications', href: '/dashboard/notifications', icon: BellIcon },
  { name: 'My Profile', href: '/dashboard/profile', icon: UserCircleIcon },
];


// Create staffLinks by transforming userLinks
const staffLinks: NavItem[] = [
  ...userLinks.map((link) => {
    // Find the Catalogue section to inject the extra sub-item
    if (link.name === 'Catalogue') {
      return {
        ...link,
        children: [
          { name: 'Book List', href: '/dashboard/book/list' }, // New staff sub-item
          ...(link.children || []), // Keep existing user sub-items
        ],
      };
    }
    return link;
  }),
];

const adminLinks: NavItem[] = [
  ...staffLinks.flatMap((link) => {
    // If the link name is Overview, change the homepage to the admin homepage.
    if (link.name === 'Overview') {
      return { ...link, href: '/dashboard/admin' };
    }

    // Add the Manage User Page between Overview and Catalogue
    if (link.name === 'Catalogue'){
      return [
        { name: 'Manage Users', href: '/dashboard/admin/users', icon: UserGroupIcon },
        link
      ];
    }

    // Return the original link if no change is needed
    return link;
  }), 
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
  const [openSection, setOpenSection] = useState<string | null>(null); // Track collapsed state
  
  const links = role === 'admin' ? adminLinks : role === 'staff' ? staffLinks : userLinks;
  const isDarkTheme = theme === 'dark';

  // Helper to toggle collapse
  const handleToggle = (name: string) => {
    setOpenSection(openSection === name ? null : name);
  };

  const activeVariant = isDarkTheme
    ? 'bg-gradient-to-r from-white/20 to-white/10 text-white shadow-xl shadow-white/10 scale-[1.02]'
    : 'bg-gradient-to-r from-swin-red to-swin-red/90 text-swin-ivory shadow-xl shadow-swin-red/30 scale-[1.02]';

  const inactiveVariant = isDarkTheme
    ? 'bg-transparent text-slate-200/80 hover:bg-white/10 hover:text-white hover:scale-[1.01] hover:shadow-lg border-white/10'
    : 'bg-black/10 text-swin-ivory/80 hover:bg-swin-red/80 hover:text-white hover:scale-[1.01] hover:shadow-lg border-transparent shadow-sm';

  const subLinkVariant = isDarkTheme
    ? 'text-slate-400 hover:text-white hover:bg-white/5'
    : 'text-swin-ivory/70 hover:text-white hover:bg-white/10';

  return (
    <>
      {links.map(({ name, href, icon: LinkIcon, children }, index) => {
        const hasChildren = children && children.length > 0;
        const isOpen = openSection === name;
        const isActive = pathname === href || (hasChildren && children.some(c => pathname === c.href));

        return (
          <BlurFade key={name} delay={0.3 + index * 0.05} yOffset={10}>
            <div className="flex flex-col mb-2">
              {/* Parent Item */}
              {hasChildren ? (
                // IF it has children: Render a button that toggles collapse
                <button
                  onClick={() => handleToggle(name)}
                  className={clsx(
                    'flex h-auto w-full items-center justify-between gap-2 rounded-xl border py-3.5 px-3 text-sm font-medium transition-all duration-300 ease-out active:scale-95',
                    isActive ? activeVariant : inactiveVariant
                  )}
                >
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-5" />
                    <span className={clsx(showLabels ? 'block' : 'hidden md:block')}>{name}</span>
                  </div>
                  <ChevronDownIcon className={clsx('w-4 transition-transform duration-300', isOpen && 'rotate-180')} />
                </button>
              ) : (
                // IF no children: Render a standard Link
                <Link
                  href={href}
                  className={clsx(
                    'flex h-auto w-full items-center gap-2 rounded-xl border py-3.5 px-3 text-sm font-medium transition-all duration-300 ease-out active:scale-95',
                    isActive ? activeVariant : inactiveVariant
                  )}
                  onClick={onNavigate}
                >
                  <LinkIcon className="w-5" />
                  <span className={clsx(showLabels ? 'block' : 'hidden md:block')}>{name}</span>
                </Link>
              )}

              {/* Nested Sub-titles */}
              {hasChildren && isOpen && (
                <div className="mt-1 flex flex-col gap-1 overflow-hidden pl-9 pr-2">
                  {children.map((child) => {
                    const isChildActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onNavigate}
                        className={clsx(
                          'rounded-lg py-2.5 px-3 text-xs font-medium transition-all duration-200',
                          isChildActive ? 'bg-white/20 text-white' : subLinkVariant
                        )}>
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </BlurFade>
        );
      })}
    </>
  );
}