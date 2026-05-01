'use client';

import Link from 'next/link';
import {
  BookOpenIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import BlurFade from '@/app/ui/magicUi/blurFade';

const actions = [
  {
    label: 'Borrow a Book',
    description: 'Scan or search to start a new loan',
    href: '/dashboard/book/checkout',
    icon: BookOpenIcon,
    iconBg: 'bg-primary/10 text-primary dark:bg-dark-primary/15 dark:text-dark-primary',
  },
  {
    label: 'Return a Book',
    description: 'Bring your book to the library counter',
    href: '/dashboard/book/checkin',
    icon: ArrowDownTrayIcon,
    iconBg: 'bg-surface-cream-strong text-body dark:bg-dark-surface-strong dark:text-on-dark/80',
  },
  {
    label: 'Browse Catalogue',
    description: 'Explore available books',
    href: '/dashboard/book/items',
    icon: MagnifyingGlassIcon,
    iconBg: 'bg-accent-teal/15 text-accent-teal dark:bg-accent-teal/20 dark:text-accent-teal',
  },
] as const;

export default function QuickActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {actions.map((action, index) => (
        <BlurFade key={action.href} delay={0.2 + index * 0.08} yOffset={10}>
          <Link
            href={action.href}
            className="group flex items-center gap-4 rounded-card border border-hairline bg-surface-card p-5 transition-colors hover:border-primary/20 dark:border-dark-hairline dark:bg-dark-surface-card dark:hover:border-dark-primary/30"
          >
            <span
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-card ${action.iconBg}`}
            >
              <action.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-sans text-title-sm text-ink dark:text-on-dark">
                {action.label}
              </p>
              <p className="font-sans text-body-sm text-muted dark:text-on-dark-soft">
                {action.description}
              </p>
            </div>
          </Link>
        </BlurFade>
      ))}
    </div>
  );
}
