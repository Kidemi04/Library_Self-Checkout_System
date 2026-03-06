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
          'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* Modal surface */}
      <div
        className={clsx(
          'relative w-full max-w-2xl rounded-2xl bg-white shadow-xl transition-all duration-300 ease-out dark:bg-slate-950 dark:text-slate-100',
          isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update catalogue details to keep the inventory accurate.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            X
          </button>
        </div>

        {/* Body (scrollable inside the modal; follows touch scroll) */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
