'use client';

import { useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import clsx from 'clsx';
import { checkinBookAction } from '@/app/dashboard/actions';
import { initialActionState } from '@/app/dashboard/actionState';

const CONFIRM_WORD = 'return';

function SubmitButton({ onClick }: { onClick: () => void }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-1 text-xs font-semibold text-swin-charcoal transition hover:border-swin-red hover:bg-swin-red hover:text-swin-ivory disabled:cursor-not-allowed disabled:border-swin-charcoal/10 disabled:text-swin-charcoal/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-swin-red dark:hover:bg-swin-red dark:hover:text-white"
    >
      {pending ? 'Returning…' : 'Return'}
    </button>
  );
}

export default function QuickCheckInButton({
  loanId,
  bookTitle,
  borrowerName,
}: {
  loanId: string;
  bookTitle?: string;
  borrowerName?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const action = checkinBookAction.bind(null, initialActionState) as unknown as (
    formData: FormData,
  ) => Promise<void>;

  const handleOpen = () => {
    setConfirmText('');
    setOpen(true);
    setTimeout(() => confirmInputRef.current?.focus(), 60);
  };

  const handleCancel = () => {
    setOpen(false);
    setConfirmText('');
  };

  const handleConfirm = () => {
    if (confirmText.toLowerCase() !== CONFIRM_WORD) return;
    setOpen(false);
    setConfirmText('');
    formRef.current?.requestSubmit();
  };

  const confirmed = confirmText.toLowerCase() === CONFIRM_WORD;

  return (
    <>
      <form ref={formRef} action={action} className="flex justify-end">
        <input type="hidden" name="loanId" value={loanId} />
        <SubmitButton onClick={handleOpen} />
      </form>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`confirm-title-${loanId}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancel}
          />

          {/* Panel */}
          <div className="relative w-full max-w-md rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            {/* Warning icon */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-swin-red/10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-swin-red">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>

            <h2 id={`confirm-title-${loanId}`} className="text-left text-lg font-semibold text-swin-charcoal dark:text-slate-100">
              Confirm book return
            </h2>

            {/* Context — show what's being returned */}
            {(bookTitle || borrowerName) && (
              <div className="mt-3 rounded-xl border border-swin-charcoal/10 bg-swin-ivory px-4 py-3 text-left dark:border-slate-700 dark:bg-slate-800">
                {bookTitle && (
                  <p className="truncate text-sm font-medium text-swin-charcoal dark:text-slate-100">
                    {bookTitle}
                  </p>
                )}
                {borrowerName && (
                  <p className="mt-0.5 text-xs text-swin-charcoal/60 dark:text-slate-400">
                    Borrower: {borrowerName}
                  </p>
                )}
              </div>
            )}

            <p className="mt-3 text-left text-sm text-swin-charcoal/70 dark:text-slate-400">
              This will mark the loan as returned and make the copy available again. This cannot be undone without manual intervention.
            </p>

            <div className="mt-5">
              <label
                htmlFor={`confirm-input-${loanId}`}
                className="block text-left text-sm font-medium text-swin-charcoal dark:text-slate-200"
              >
                Type{' '}
                <span className="rounded bg-swin-charcoal/10 px-1.5 py-0.5 font-mono font-semibold text-swin-red dark:bg-slate-800 dark:text-swin-red">
                  {CONFIRM_WORD}
                </span>{' '}
                to confirm
              </label>
              <input
                id={`confirm-input-${loanId}`}
                ref={confirmInputRef}
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                placeholder={CONFIRM_WORD}
                autoComplete="off"
                className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-swin-charcoal focus:border-swin-red focus:outline-none focus:ring-1 focus:ring-swin-red dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-xl border border-swin-charcoal/20 bg-swin-ivory px-4 py-2.5 text-sm font-semibold text-swin-charcoal transition hover:bg-swin-charcoal/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!confirmed}
                className={clsx(
                  'flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition',
                  confirmed
                    ? 'bg-swin-red shadow-sm shadow-swin-red/30 hover:bg-swin-red/90'
                    : 'cursor-not-allowed bg-swin-red/30',
                )}
              >
                Yes, return book
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
