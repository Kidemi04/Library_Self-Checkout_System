'use client';
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  lockScroll?: boolean; // true = freeze background scroll
  children: React.ReactNode;
};

export default function ManageBookModal({
  open,
  onClose,
  title = 'Manage book',
  lockScroll = false,
  children,
}: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  // (optional) lock background scroll
  useEffect(() => {
    if (!open || !lockScroll) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, lockScroll]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Autofocus first focusable control
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const root = panelRef.current;
    const first =
      root.querySelector<HTMLElement>('input, select, textarea, button, [tabindex]:not([tabindex="-1"])');
    first?.focus();
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-2xl origin-center rounded-2xl bg-white shadow-xl outline-none
                   transition-all duration-150 ease-out
                   data-[state=open]:scale-100 data-[state=open]:opacity-100
                   data-[state=closed]:scale-95 data-[state=closed]:opacity-0"
        data-state="open"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">
              Update catalogue details to keep the inventory accurate.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-slate-600 hover:bg-slate-100"
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Body (scrolls within modal) */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
