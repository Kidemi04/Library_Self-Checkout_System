'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useFormStatus } from 'react-dom';
import { checkinBookAction } from '@/app/dashboard/actions';
import { initialActionState } from '@/app/dashboard/actionState';
import type { ActionState } from '@/app/dashboard/actionState';

type CheckInFormProps = {
  activeLoanCount: number;
  defaultIdentifier?: string;
};

export default function CheckInForm({ activeLoanCount, defaultIdentifier }: CheckInFormProps) {
  const [state, formAction] = useActionState(checkinBookAction, initialActionState);
  const formRef = useRef<HTMLFormElement | null>(null);
  const identifierInputRef = useRef<HTMLInputElement | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const contentId = 'return-form-panel';
  const mobileToggleLabel = mobileExpanded ? 'Hide form' : 'Record a return';

  const handleMobileToggle = () => setMobileExpanded((prev) => !prev);

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
    }
  }, [state.status]);

  useEffect(() => {
    if (identifierInputRef.current) {
      identifierInputRef.current.value = defaultIdentifier ?? '';
    }
  }, [defaultIdentifier]);

  useEffect(() => {
    if (defaultIdentifier) setMobileExpanded(true);
  }, [defaultIdentifier]);

  useEffect(() => {
    if (state.status === 'error') setMobileExpanded(true);
  }, [state.status]);

  // Open the confirmation dialog instead of directly submitting
  const handleReturnClick = () => {
    setConfirmOpen(true);
    setTimeout(() => confirmButtonRef.current?.focus(), 60);
  };

  // User confirmed — actually submit the form
  const handleConfirm = () => {
    setConfirmOpen(false);
    formRef.current?.requestSubmit();
  };

  const handleCancel = () => {
    setConfirmOpen(false);
  };

  return (
    <>
      <section className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-sm shadow-swin-charcoal/5 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100 dark:shadow-black/20">
        <div className="mb-3 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-swin-charcoal dark:text-slate-100">Returning Item Details</h2>
            <p className="hidden text-sm text-swin-charcoal/60 dark:text-slate-400 md:block">
              Use the search above or enter the loan reference to reconcile items being returned.
            </p>
            <p className="text-xs text-swin-charcoal/60 dark:text-slate-400 md:hidden">
              Scan a barcode or enter a loan ID to finish the return.
            </p>
          </div>
          <button
            type="button"
            onClick={handleMobileToggle}
            className="inline-flex h-[44px] w-full items-center justify-center rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-4 text-sm font-semibold text-swin-charcoal shadow-sm transition hover:border-swin-red hover:bg-swin-red hover:text-swin-ivory focus:outline-none focus-visible:ring-2 focus-visible:ring-swin-red focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 md:hidden"
            aria-expanded={mobileExpanded}
            aria-controls={contentId}
          >
            {mobileToggleLabel}
          </button>
        </div>

        {/* The form action is set so requestSubmit() triggers the server action */}
        <form
          ref={formRef}
          id={contentId}
          action={formAction}
          className={clsx(
            'mt-4 gap-4 md:mt-0 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-6',
            mobileExpanded ? 'grid' : 'hidden',
          )}
        >
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-swin-charcoal dark:text-slate-100" htmlFor="identifier">
              Scan barcode or enter loan ID
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              placeholder="Loan ID, borrower ID, barcode, or ISBN"
              ref={identifierInputRef}
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-swin-charcoal focus:border-swin-red focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <p className="mt-2 text-xs text-swin-charcoal/60 dark:text-slate-400">{activeLoanCount} books are currently on loan.</p>
          </div>

          <div className="flex items-stretch justify-end md:self-end">
            {/* Intercept submit — open confirmation dialog instead */}
            <SubmitButton onReturnClick={handleReturnClick} />
          </div>

          <ActionMessage status={state.status} message={state.message} />
        </form>
      </section>

      {/* ── Confirmation dialog ── */}
      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
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

            <h2 id="confirm-title" className="text-lg font-semibold text-swin-charcoal dark:text-slate-100">
              Confirm book return
            </h2>
            <p className="mt-1 text-sm text-swin-charcoal/70 dark:text-slate-400">
              This action will mark the loan as returned and update the copy status. This cannot be undone without manual intervention.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-xl border border-swin-charcoal/20 bg-swin-ivory px-4 py-2.5 text-sm font-semibold text-swin-charcoal transition hover:bg-swin-charcoal/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={handleConfirm}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                className="flex-1 rounded-xl bg-swin-red px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-swin-red/30 transition hover:bg-swin-red/90"
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

function SubmitButton({ onReturnClick }: { onReturnClick: () => void }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={onReturnClick}
      className="inline-flex h-[56px] min-w-[140px] items-center justify-center rounded-lg bg-swin-charcoal px-6 text-sm font-semibold uppercase tracking-wide text-swin-ivory shadow-sm shadow-swin-charcoal/30 transition hover:bg-swin-charcoal/90 disabled:cursor-not-allowed disabled:bg-swin-charcoal/40"
    >
      {pending ? 'Processing...' : 'Return book'}
    </button>
  );
}

function ActionMessage({ status, message }: { status: ActionState['status']; message: string }) {
  if (!message) return null;
  const tone = status === 'success' ? 'text-emerald-600' : status === 'error' ? 'text-swin-red' : 'text-swin-charcoal';
  return <p className={`md:col-span-2 text-sm font-medium ${tone}`}>{message}</p>;
}
