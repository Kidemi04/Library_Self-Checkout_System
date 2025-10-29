'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { checkinBookAction } from '@/app/dashboard/actions';
import { initialActionState } from '@/app/dashboard/action-state';
import type { ActionState } from '@/app/dashboard/action-state';

type CheckInFormProps = {
  activeLoanCount: number;
  defaultIdentifier?: string;
};

export default function CheckInForm({ activeLoanCount, defaultIdentifier }: CheckInFormProps) {
  const [state, formAction] = useFormState(checkinBookAction, initialActionState);
  const formRef = useRef<HTMLFormElement | null>(null);
  const identifierInputRef = useRef<HTMLInputElement | null>(null);

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

  return (
    <section className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-sm shadow-swin-charcoal/5">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-swin-charcoal">Returning Item Details</h2>
        <p className="text-sm text-swin-charcoal/60">
          Use the search above or enter the loan reference to reconcile items being returned.
        </p>
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-6"
      >
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-swin-charcoal" htmlFor="identifier">
            Scan barcode or enter loan ID
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            required
            placeholder="Loan ID, borrower ID, barcode, or ISBN"
            ref={identifierInputRef}
            className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm focus:border-swin-red focus:outline-none focus:ring-2 focus:ring-swin-red/30"
          />
          <p className="mt-2 text-xs text-swin-charcoal/60">{activeLoanCount} books are currently on loan.</p>
        </div>
        <div className="flex items-stretch justify-end md:self-end">
          <SubmitButton />
        </div>
        <ActionMessage status={state.status} message={state.message} />
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
      className="inline-flex h-[56px] min-w-[140px] items-center justify-center rounded-lg bg-swin-charcoal px-6 text-sm font-semibold uppercase tracking-wide text-swin-ivory shadow-sm shadow-swin-charcoal/30 transition hover:bg-swin-charcoal/90 disabled:cursor-not-allowed disabled:bg-swin-charcoal/40"
    >
      {pending ? 'Processing...' : 'Check In'}
    </button>
  );
}

function ActionMessage({ status, message }: { status: ActionState['status']; message: string }) {
  if (!message) return null;

  const tone = status === 'success' ? 'text-emerald-600' : status === 'error' ? 'text-swin-red' : 'text-swin-charcoal/70';

  return <p className={`md:col-span-2 text-sm font-medium ${tone}`}>{message}</p>;
}
