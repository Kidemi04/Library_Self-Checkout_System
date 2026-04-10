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
    color:
      'from-swin-red to-swin-red/80 shadow-swin-red/30 dark:from-rose-500 dark:to-rose-600 dark:shadow-rose-500/20',
  },
  {
    label: 'Return a Book',
    description: 'Bring your book to the library counter',
    href: '/dashboard/book/checkin',
    icon: ArrowDownTrayIcon,
    color:
      'from-swin-charcoal to-swin-charcoal/80 shadow-swin-charcoal/30 dark:from-slate-500 dark:to-slate-600 dark:shadow-slate-500/20',
  },
  {
    label: 'Browse Catalogue',
    description: 'Explore available books',
    href: '/dashboard/book/items',
    icon: MagnifyingGlassIcon,
    color:
      'from-emerald-600 to-emerald-500 shadow-emerald-500/30 dark:from-emerald-500 dark:to-emerald-600 dark:shadow-emerald-500/20',
  },
] as const;

export default function QuickActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {actions.map((action, index) => (
        <BlurFade key={action.href} delay={0.2 + index * 0.08} yOffset={10}>
          <Link
            href={action.href}
            className="group flex items-center gap-4 rounded-2xl border border-swin-charcoal/10 bg-white p-5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900/70"
          >
            <span
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} shadow-md text-white transition-transform duration-300 group-hover:scale-110`}
            >
              <action.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-swin-charcoal dark:text-white">
                {action.label}
              </p>
              <p className="text-xs text-swin-charcoal/60 dark:text-slate-400">
                {action.description}
              </p>
            </div>
          </Link>
        </BlurFade>
      ))}
    </div>
  );
}
