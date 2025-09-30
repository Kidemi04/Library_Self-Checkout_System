'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { checkinBookAction } from '@/app/dashboard/actions';
import { initialActionState } from '@/app/dashboard/action-state';
import type { ActionState } from '@/app/dashboard/action-state';

export default function CheckInForm({ activeLoanCount }: { activeLoanCount: number }) {
  const [state, formAction] = useFormState(checkinBookAction, initialActionState);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <section className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-sm shadow-swin-charcoal/5">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-swin-charcoal">Check In Book</h2>
        <p className="text-sm text-swin-charcoal/60">
          Scan a book barcode or enter the loan reference to mark items as returned.
        </p>
      </div>

      <form ref={formRef} action={formAction} className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-swin-charcoal" htmlFor="identifier">
            Scan barcode or enter loan ID
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            required
            placeholder="Loan ID, borrower ID, barcode, or ISBN"
            className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm focus:border-swin-red focus:outline-none"
          />
          <p className="mt-2 text-xs text-swin-charcoal/60">
            {activeLoanCount} active loans awaiting return.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:w-auto">
          <ActionMessage status={state.status} message={state.message} />
          <SubmitButton />
        </div>
      </form>
    </section>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-lg bg-swin-charcoal px-5 py-2 text-sm font-semibold text-swin-ivory shadow-sm shadow-swin-charcoal/30 transition hover:bg-swin-charcoal/90 disabled:cursor-not-allowed disabled:bg-swin-charcoal/40"
    >
      {pending ? 'Processing…' : 'Check in'}
    </button>
  );
}

function ActionMessage({ status, message }: { status: ActionState['status']; message: string }) {
  if (!message) return null;

  const tone = status === 'success' ? 'text-emerald-600' : status === 'error' ? 'text-swin-red' : 'text-swin-charcoal';

  return <p className={`text-sm font-medium ${tone}`}>{message}</p>;
}
