'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BookOpenIcon,
  UserGroupIcon,
  UserCircleIcon,
  SparklesIcon,
  ChevronDownIcon, // Import icon for collapse indicator
  BellIcon,
  BookmarkIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import BlurFade from '@/app/ui/magicUi/blurFade';
import type { DashboardRole } from '@/app/lib/auth/types';

// Define the Link type to support nested children
type NavItem = {
  name: string;
  href: string;
  icon: any;
  children?: { name: string; href: string }[];
};

const generalLinks: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Catalogue', href: '/dashboard/book', icon: BookOpenIcon,
    // sub-titles
    children: [
      { name: 'Book Items', href: '/dashboard/book/items' },
      { name: 'Borrow Books', href: '/dashboard/book/checkout' },
      { name: 'Return Books', href: '/dashboard/book/checkin' },
    ]
  },
  { name: 'Notifications', href: '/dashboard/notifications', icon: BellIcon },
  { name: 'My Profile', href: '/dashboard/profile', icon: UserCircleIcon },
];

// Flat, student-friendly nav — no Catalogue dropdown
const userLinks: NavItem[] = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Browse Books', href: '/dashboard/book/items', icon: BookOpenIcon },
  { name: 'Borrow', href: '/dashboard/book/checkout', icon: QrCodeIcon },
  { name: 'Return', href: '/dashboard/book/checkin', icon: ArrowPathIcon },
  { name: 'My Books', href: '/dashboard/my-books', icon: BookmarkIcon },
  { name: 'Recommendations', href: '/dashboard/recommendations', icon: SparklesIcon },
  { name: 'Chat Assistant', href: '/dashboard/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Help Centre', href: '/dashboard/faq', icon: QuestionMarkCircleIcon },
  { name: 'Notifications', href: '/dashboard/notifications', icon: BellIcon },
  { name: 'My Profile', href: '/dashboard/profile', icon: UserCircleIcon },
];


// Create staffLinks by transforming userLinks
const staffLinks: NavItem[] = generalLinks.flatMap((link) => {
  // Find the Catalogue section to inject the extra sub-item, and inject the
  // Damage Reports top-level entry right after it so the workflow tool sits
  // close to the circulation links.
  if (link.name === 'Catalogue') {
    const transformedCatalogue: NavItem = {
      ...link,
      children: [
        { name: 'Book List', href: '/dashboard/book/list' }, // New staff sub-item
        ...(link.children || []), // Keep existing user sub-items
        { name: 'Manage Holds', href: '/dashboard/book/holds' },
        { name: 'Borrow History', href: '/dashboard/book/history' },
      ],
    };
    return [
      transformedCatalogue,
      {
        name: 'Damage Reports',
        href: '/dashboard/staff/damage-reports',
        icon: ExclamationTriangleIcon,
      },
    ];
  }
  return [link];
});

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
  const [openSection, setOpenSection] = useState<string | null>(null); // Track collapsed state
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/notifications?filter=unread&limit=1');
        if (!res.ok) return;
        const { notifications } = await res.json();
        setHasUnread(Array.isArray(notifications) && notifications.length > 0);
      } catch {
        // silently ignore
      }
    };

    check();
    const timer = setInterval(check, 90_000);
    return () => clearInterval(timer);
  }, [role]);

  // Clear dot when the user is on the notifications page
  useEffect(() => {
    if (pathname === '/dashboard/notifications') {
      setHasUnread(false);
    }
  }, [pathname]);
  
  const links = role === 'admin' ? adminLinks : role === 'staff' ? staffLinks : userLinks;

  // Helper to toggle collapse
  const handleToggle = (name: string) => {
    setOpenSection(openSection === name ? null : name);
  };

  const activeVariant =
    'bg-primary/10 text-primary border-primary/20 dark:bg-dark-primary/15 dark:text-dark-primary dark:border-dark-primary/30';

  const inactiveVariant =
    'bg-transparent text-body border-hairline hover:bg-surface-cream-strong hover:text-ink dark:text-on-dark/80 dark:border-dark-hairline dark:hover:bg-dark-surface-strong dark:hover:text-on-dark';

  const subLinkVariant =
    'text-muted hover:text-ink hover:bg-surface-cream-strong dark:text-on-dark-soft dark:hover:text-on-dark dark:hover:bg-dark-surface-strong';

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
                    'flex h-auto w-full items-center justify-between gap-2 rounded-btn border py-3.5 px-3 font-sans text-body-sm font-medium transition active:scale-95',
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
                    'flex h-auto w-full items-center gap-2 rounded-btn border py-3.5 px-3 font-sans text-body-sm font-medium transition active:scale-95',
                    isActive ? activeVariant : inactiveVariant
                  )}
                  onClick={onNavigate}
                >
                  <span className="relative flex-shrink-0">
                    <LinkIcon className="w-5" />
                    {name === 'Notifications' && hasUnread && (
                      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-canvas dark:ring-dark-canvas" />
                    )}
                  </span>
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
                          'rounded-btn px-3 py-2.5 font-sans text-caption font-medium transition',
                          isChildActive
                            ? 'bg-primary/10 text-primary dark:bg-dark-primary/15 dark:text-dark-primary'
                            : subLinkVariant
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