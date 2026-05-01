'use client';

import { useState, type ComponentType, type SVGProps } from 'react';
import Link from 'next/link';
import {
  BookOpenIcon,
  ArrowPathIcon,
  BookmarkIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  CameraIcon,
  BellIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

type FaqIcon = ComponentType<SVGProps<SVGSVGElement>>;

type FaqItem = { q: string; a: string };

type FaqSection = {
  title: string;
  icon: FaqIcon;
  items: FaqItem[];
};

const FAQ_SECTIONS: FaqSection[] = [
  {
    title: 'Borrowing & Returns',
    icon: BookOpenIcon,
    items: [
      { q: 'How long is the loan period?', a: 'Standard loans are 14 days. Some reference materials may have shorter periods.' },
      { q: 'How do I return a book?', a: 'Return books at the library desk during staffed hours. Drop-off slots are available 24/7 at the main entrance.' },
      { q: 'How many books can I borrow?', a: 'Students may borrow up to 5 books at a time. Staff and postgrad students may borrow up to 10.' },
      { q: 'Can I return books after hours?', a: 'Yes! Use the 24-hour drop box at the library entrance. Items are processed the next business day.' },
    ],
  },
  {
    title: 'Renewals',
    icon: ArrowPathIcon,
    items: [
      { q: 'How do I renew a book?', a: 'Go to My Books → Current, then tap "Renew" next to the book. You can also visit the library desk.' },
      { q: 'How many times can I renew?', a: 'You can renew up to 2 times per item, unless another patron has placed a hold on it.' },
      { q: 'Will I be notified before a book is due?', a: "Yes — you'll receive an in-app notification 3 days before and again on the due date." },
    ],
  },
  {
    title: 'Holds & Reservations',
    icon: BookmarkIcon,
    items: [
      { q: 'How do I place a hold?', a: 'Search for the book in the catalogue and tap "Place hold". You\'ll be notified when it\'s ready for pickup.' },
      { q: 'How long is a hold kept?', a: "Once your hold is ready, you have 3 days to collect it before it's released to the next person in queue." },
    ],
  },
  {
    title: 'Fines & Fees',
    icon: ExclamationTriangleIcon,
    items: [
      { q: 'What is the overdue fine?', a: 'RM 0.50 per day per item. Fines are tracked in your account and must be settled to borrow again.' },
      { q: 'How do I pay a fine?', a: 'Visit the library desk with your student ID. Card and e-wallet payments are accepted.' },
    ],
  },
];

const QUICK_ACTIONS: Array<{
  label: string;
  sub: string;
  icon: FaqIcon;
  href: string;
}> = [
  { label: 'Borrow a book', sub: 'Search by title or scan barcode', icon: BookOpenIcon, href: '/dashboard/book/items' },
  { label: 'Camera scan', sub: 'Identify a book instantly', icon: CameraIcon, href: '/dashboard/cameraScan' },
  { label: 'My notifications', sub: 'Due dates and hold alerts', icon: BellIcon, href: '/dashboard/notifications' },
  { label: 'My profile', sub: 'Account and preferences', icon: UserIcon, href: '/dashboard/profile' },
];

export default function FaqHelpCentre() {
  const [openSection, setOpenSection] = useState<string>('Borrowing & Returns');
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_260px] lg:grid-cols-[minmax(0,1fr)_280px]">
      {/* Left column: stacked accordion */}
      <div className="flex flex-col gap-2.5">
        {FAQ_SECTIONS.map((section) => {
          const isOpen = openSection === section.title;
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="overflow-hidden rounded-hero border border-hairline bg-surface-card dark:border-dark-hairline dark:bg-dark-surface-card"
            >
              <button
                type="button"
                onClick={() => {
                  setOpenSection(isOpen ? '' : section.title);
                  setOpenItem(null);
                }}
                className="flex w-full items-center gap-3.5 px-5 py-[18px] text-left transition hover:bg-surface-cream-strong/40 dark:hover:bg-dark-surface-strong/50"
                aria-expanded={isOpen}
              >
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-btn bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary">
                  <Icon className="h-[17px] w-[17px]" />
                </span>
                <span className="flex-1 font-display text-[18px] font-semibold tracking-[-0.2px] text-ink dark:text-on-dark">
                  {section.title}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted dark:text-on-dark-soft">
                  {section.items.length} items
                </span>
                <ChevronRightIcon
                  className={`h-4 w-4 flex-none text-muted transition-transform duration-200 dark:text-on-dark-soft ${
                    isOpen ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {isOpen ? (
                <div className="border-t border-hairline dark:border-dark-hairline">
                  {section.items.map((item, idx) => {
                    const itemKey = `${section.title}::${item.q}`;
                    const itemOpen = openItem === itemKey;
                    const isLast = idx === section.items.length - 1;
                    return (
                      <div
                        key={itemKey}
                        className={`${
                          isLast ? '' : 'border-b border-hairline-soft dark:border-dark-hairline'
                        } ${itemOpen ? 'bg-surface-cream-strong/40 dark:bg-dark-surface-strong/40' : ''}`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenItem(itemOpen ? null : itemKey)}
                          className="flex w-full items-center justify-between gap-3.5 px-5 py-4 text-left transition hover:bg-surface-cream-strong/60 dark:hover:bg-dark-surface-strong/40"
                          aria-expanded={itemOpen}
                        >
                          <span className="font-sans text-[13px] font-semibold text-ink dark:text-on-dark">
                            {item.q}
                          </span>
                          <ChevronRightIcon
                            className={`h-3.5 w-3.5 flex-none text-muted transition-transform duration-200 dark:text-on-dark-soft ${
                              itemOpen ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                        {itemOpen ? (
                          <p className="px-5 pb-4 font-sans text-[13px] leading-[1.6] text-body dark:text-on-dark/85">
                            {item.a}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Right column: quick actions + still need help */}
      <aside className="self-start">
        <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted dark:text-on-dark-soft">
          Quick actions
        </p>
        <div className="flex flex-col gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 rounded-card border border-hairline bg-surface-card px-4 py-3.5 transition hover:border-primary/30 hover:bg-surface-cream-strong/60 dark:border-dark-hairline dark:bg-dark-surface-card dark:hover:bg-dark-surface-strong"
              >
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-btn bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary">
                  <Icon className="h-[17px] w-[17px]" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-sans text-[13px] font-semibold text-ink dark:text-on-dark">
                    {action.label}
                  </span>
                  <span className="font-sans text-[11px] text-muted dark:text-on-dark-soft">
                    {action.sub}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-4 rounded-hero border border-hairline bg-surface-cream-strong/60 p-[18px] dark:border-dark-hairline dark:bg-dark-surface-strong/60">
          <p className="mb-1.5 font-sans text-[12px] font-semibold text-ink dark:text-on-dark">
            Still need help?
          </p>
          <p className="mb-2.5 font-sans text-[12px] leading-[1.5] text-body dark:text-on-dark/85">
            Chat with a librarian during staffed hours or email us.
          </p>
          <a
            href="mailto:library@swinburne.edu.my"
            className="font-mono text-[11px] font-bold text-primary hover:underline dark:text-dark-primary"
          >
            library@swinburne.edu.my
          </a>
        </div>
      </aside>
    </div>
  );
}
