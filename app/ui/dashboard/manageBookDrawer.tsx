'use client';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  lockScroll?: boolean; // set true to prevent background scroll (optional)
  children: React.ReactNode;
};

export default function ManageBookModal({
  open,
  onClose,
  title = 'Manage book',
  lockScroll = false, // default: background can scroll under the modal
  children,
}: Props) {
  // (optional) lock background scroll when open
  useEffect(() => {
    if (!open || !lockScroll) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, lockScroll]);

  if (!open) return null;

  // Render at the top level so it follows viewport on scroll
  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Panel (keep your current visual style) */}
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl"
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
          >
            ✕
          </button>
        </div>

        {/* Body (scrollable inside the modal; follows touch scroll) */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          {children}
        </div>

        {/* Footer slot (optional, keep your buttons in children if you prefer) */}
        {/* <div className="flex justify-end gap-2 border-t px-5 py-4">
          <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50" onClick={onClose}>Cancel</button>
          <button className="rounded-xl bg-swin-charcoal px-4 py-2 text-sm text-swin-ivory hover:opacity-95">Save changes</button>
        </div> */}
      </div>
    </div>,
    document.body
  );
}
