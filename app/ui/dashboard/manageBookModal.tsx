'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** set true to prevent background scroll while modal is open */
  lockScroll?: boolean;
  children: React.ReactNode;
};

export default function ManageBookModal({
  open,
  onClose,
  title = 'Manage book',
  lockScroll = false,
  children,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);

  // Optional: lock background scroll when modal is open
  useEffect(() => {
    if (!open || !lockScroll) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, lockScroll]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setIsVisible(true), 10);
    return () => {
      window.clearTimeout(timer);
      setIsVisible(false);
    };
  }, [open]);

  if (!open) return null;

  // Use a portal so the modal always follows the viewport on scroll
  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className={clsx(
          'absolute inset-0 bg-ink/50 dark:bg-dark-canvas/70 backdrop-blur-sm transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* Modal surface — card recipe + retained shadow per spec §6.4 (floating overlay) */}
      <div
        className={clsx(
          'relative w-full max-w-2xl rounded-card bg-surface-card dark:bg-dark-surface-card border border-hairline dark:border-dark-hairline text-ink dark:text-on-dark shadow-[0_4px_16px_rgba(20,20,19,0.08)] transition-all duration-300 ease-out',
          isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline dark:border-dark-hairline px-6 py-4">
          <div>
            <h2 className="font-display text-display-sm text-ink dark:text-on-dark">{title}</h2>
            <p className="font-sans text-body-sm text-muted dark:text-on-dark-soft">
              Update catalogue details to keep the inventory accurate.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-btn px-2 py-1 text-muted dark:text-on-dark-soft transition hover:bg-surface-cream-strong dark:hover:bg-dark-surface-strong hover:text-ink dark:hover:text-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
            aria-label="Close"
          >
            X
          </button>
        </div>

        {/* Body (scrollable inside the modal; follows touch scroll) */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
