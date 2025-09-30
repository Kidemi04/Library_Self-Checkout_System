'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { checkoutBookAction } from '@/app/dashboard/actions';
import { initialActionState } from '@/app/dashboard/action-state';
import type { ActionState } from '@/app/dashboard/action-state';
import type { Book } from '@/app/lib/supabase/types';

interface CheckOutFormProps {
  books: Book[];
  defaultDueDate: string;
}

const BorrowerTypes = [
  { value: 'student', label: 'Student' },
  { value: 'staff', label: 'Staff' },
] as const;

export default function CheckOutForm({ books, defaultDueDate }: CheckOutFormProps) {
  const [state, formAction] = useFormState(checkoutBookAction, initialActionState);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
    }
  }, [state.status]);

  const bookOptions = useMemo(
    () =>
      books.map((book) => ({
        id: book.id,
        label: `${book.title} ${book.author ? `· ${book.author}` : ''}`.trim(),
      })),
    [books],
  );

  return (
    <section className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-sm shadow-swin-charcoal/5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-swin-charcoal">Check Out Book</h2>
          <p className="text-sm text-swin-charcoal/60">
            Select an available title and capture borrower details to complete the transaction.
          </p>
        </div>
      </div>

      <form ref={formRef} action={formAction} className="grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-swin-charcoal" htmlFor="bookId">
            Book to check out
          </label>
          <select
            id="bookId"
            name="bookId"
            defaultValue=""
            className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm focus:border-swin-red focus:outline-none"
            required
          >
            <option value="" disabled>
              {books.length ? 'Select a book' : 'No titles available'}
            </option>
            {bookOptions.map((book) => (
              <option key={book.id} value={book.id}>
                {book.label}
              </option>
            ))}
          </select>
          {bookOptions.length > 0 ? (
            <p className="mt-1 text-xs text-swin-charcoal/60">
              {bookOptions.length} titles ready for checkout.
            </p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-swin-charcoal" htmlFor="borrowerIdentifier">
            Borrower ID
          </label>
          <input
            id="borrowerIdentifier"
            name="borrowerIdentifier"
            type="text"
            required
            placeholder="Scan or type student/staff ID"
            className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm focus:border-swin-red focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-swin-charcoal" htmlFor="borrowerName">
            Borrower name
          </label>
          <input
            id="borrowerName"
            name="borrowerName"
            type="text"
            required
            placeholder="Full name"
            className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm focus:border-swin-red focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-swin-charcoal" htmlFor="borrowerType">
            Borrower type
          </label>
          <select
            id="borrowerType"
            name="borrowerType"
            defaultValue="student"
            className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm focus:border-swin-red focus:outline-none"
            required
          >
            {BorrowerTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-swin-charcoal" htmlFor="dueDate">
            Due date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={defaultDueDate}
            required
            className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm focus:border-swin-red focus:outline-none"
          />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ActionMessage status={state.status} message={state.message} />
          <SubmitButton disabled={!books.length} />
        </div>
      </form>
    </section>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex items-center justify-center rounded-lg bg-swin-red px-5 py-2 text-sm font-semibold text-swin-ivory shadow-sm shadow-swin-red/30 transition hover:bg-swin-red/90 disabled:cursor-not-allowed disabled:bg-swin-charcoal/30 disabled:text-swin-ivory/60"
    >
      {pending ? 'Processing…' : 'Check out'}
    </button>
  );
}

function ActionMessage({ status, message }: { status: ActionState['status']; message: string }) {
  if (!message) return null;

  const tone =
    status === 'success'
      ? 'text-emerald-600'
      : status === 'error'
        ? 'text-swin-red'
        : 'text-swin-charcoal';

  return <p className={`text-sm font-medium ${tone}`}>{message}</p>;
}
