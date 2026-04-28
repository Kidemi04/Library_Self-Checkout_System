'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const guideTopics = [
  {
    id: 'how-to-borrow',
    label: 'How to Borrow a Book',
    description: 'Step-by-step checkout walkthrough',
  },
  {
    id: 'due-dates',
    label: 'Loan Period & Due Dates',
    description: '14-day loans, renewals & late returns',
  },
  {
    id: 'returning',
    label: 'Returning Books',
    description: 'How to return and verify the record',
  },
  {
    id: 'scanner',
    label: 'Using the Barcode Scanner',
    description: 'Camera scan tips & troubleshooting',
  },
  {
    id: 'account',
    label: 'Account & Notifications',
    description: 'Sign-in, profile and reminders',
  },
];

const quickActions = [
  { label: 'Borrow a book', href: '/dashboard/book/checkout' },
  { label: 'Camera scan', href: '/dashboard/cameraScan' },
  { label: 'Active loans', href: '/dashboard' },
];

export default function FaqFloatingHelp() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isOnFaqPage = pathname === '/dashboard/faq';

  const topicHref = (id: string) =>
    isOnFaqPage ? `#${id}-title` : `/dashboard/faq#${id}-title`;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={panelRef} className="fixed bottom-40 right-4 z-40 flex flex-col items-end gap-3 md:bottom-24 md:right-8">
      {/* Panel */}
      {open && (
        <div
          className="w-80 rounded-2xl border border-swin-charcoal/10 bg-white shadow-2xl shadow-swin-charcoal/15 dark:border-white/10 dark:bg-swin-dark-bg dark:shadow-black/40"
          style={{ animation: 'faqPanelIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both' }}
        >
          <style>{`
            @keyframes faqPanelIn {
              from { opacity: 0; transform: translateY(12px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-swin-charcoal to-swin-red px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">Student Guide</p>
              <p className="text-sm font-semibold text-white">How to Use the System</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close panel"
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition hover:bg-white/15 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>

          {/* Guide topics */}
          <div className="p-3">
            <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-swin-charcoal/50 dark:text-white/40">
              Guide Topics
            </p>
            <ul className="space-y-0.5">
              {guideTopics.map((topic, index) => (
                <li key={topic.id}>
                  <Link
                    href={topicHref(topic.id)}
                    onClick={() => setOpen(false)}
                    className="group flex items-start gap-3 rounded-xl px-3 py-2 transition hover:bg-swin-red/8 dark:hover:bg-swin-red/10"
                  >
                    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-swin-charcoal/8 text-[10px] font-bold text-swin-charcoal/50 group-hover:bg-swin-red group-hover:text-white dark:bg-white/10 dark:text-white/50">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-swin-charcoal group-hover:text-swin-red dark:text-white dark:group-hover:text-swin-red">
                        {topic.label}
                      </p>
                      <p className="text-[11px] text-swin-charcoal/50 dark:text-white/40">
                        {topic.description}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-swin-charcoal/10 dark:border-white/10" />

          {/* Quick actions */}
          <div className="p-3">
            <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-swin-charcoal/50 dark:text-white/40">
              Quick Actions
            </p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-swin-charcoal/10 bg-swin-ivory px-3 py-1.5 text-xs font-semibold text-swin-charcoal transition hover:border-swin-red/40 hover:bg-swin-red hover:text-white dark:border-white/10 dark:bg-swin-dark-surface dark:text-white/80 dark:hover:bg-swin-red dark:hover:text-white"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-swin-charcoal/10 dark:border-white/10" />

          {/* Contact footer */}
          <div className="rounded-b-2xl px-4 py-3">
            <p className="text-[11px] text-swin-charcoal/60 dark:text-white/50">
              Still stuck? Visit Level 1 service desk or email{' '}
              <a
                href="mailto:library@swinburne.edu.my"
                className="font-semibold text-swin-red hover:underline"
              >
                library@swinburne.edu.my
              </a>
            </p>
          </div>
        </div>
      )}

      {/* FAB trigger */}
      <button
        type="button"
        aria-label={open ? 'Close help panel' : 'Open student guide'}
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-swin-charcoal text-white shadow-lg shadow-swin-charcoal/30 transition-all duration-300 hover:bg-swin-red hover:scale-110 active:scale-95 dark:bg-swin-dark-surface dark:shadow-black/40 dark:hover:bg-swin-red"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  );
}
