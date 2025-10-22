'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createBookAction } from '@/app/dashboard/actions';
import { initialActionState } from '@/app/dashboard/action-state';
import type { ActionState } from '@/app/dashboard/action-state';
import { ArrowDownCircleIcon, ArrowUpCircleIcon } from "@heroicons/react/24/outline";

export default function CreateBookForm() {
  const [state, formAction] = useFormState(createBookAction, initialActionState);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [open, setOpen] = useState(false); // Control the form open and close

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
      setOpen(false); // Auto close after submit
    }
  }, [state.status]);

  return (
    <section className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-sm shadow-swin-charcoal/5">

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="mb-2 flex w-full items-center justify-between text-left focus:outline-none">

      {/* Title and subtitle */}
        <div>
          <h2 className="text-lg font-semibold text-swin-charcoal">Add Book Item</h2>
          <p className="text-sm text-swin-charcoal/60">
            Register a new physical or digital item in the library catalogue.
          </p>
        </div>

        {/* Arrow Up and Down */}
        <div className="ml-3 flex-shrink-0 transition-transform duration-300 h-10 w-10">
          {open ? (
            <ArrowUpCircleIcon className="text-swin-charcoal hover:text-swin-red transition" />
          ) : (
            <ArrowDownCircleIcon className="text-swin-charcoal hover:text-swin-red transition" />
          )}
        </div>

      </button>


      {/* Collapase Area */}
      <div
        className={`grid transition-all duration-500 overflow-hidden ${
          open ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`} >

        <form ref={formRef} action={formAction} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-swin-charcoal" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Book title"
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-black text-sm focus:border-swin-red focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-swin-charcoal" htmlFor="author">
              Author / Creator
            </label>
            <input
              id="author"
              name="author"
              type="text"
              placeholder="Author name"
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-black focus:border-swin-red focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-swin-charcoal" htmlFor="classification">
              Classification
            </label>
            <input
              id="classification"
              name="classification"
              type="text"
              placeholder="e.g. QA76.76.C672"
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-black focus:border-swin-red focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-swin-charcoal" htmlFor="isbn">
              ISBN
            </label>
            <input
              id="isbn"
              name="isbn"
              type="text"
              placeholder="978-0-00-0000"
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-black focus:border-swin-red focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-swin-charcoal" htmlFor="barcode">
              Barcode
            </label>
            <input
              id="barcode"
              name="barcode"
              type="text"
              placeholder="Internal barcode"
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-black focus:border-swin-red focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-swin-charcoal" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="Level 2 - Stack A"
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-black focus:border-swin-red focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-swin-charcoal" htmlFor="coverImageUrl">
              Cover image URL
            </label>
            <input
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              placeholder="https://example.com/cover.jpg"
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-black focus:border-swin-red focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-swin-charcoal" htmlFor="totalCopies">
              Total copies
            </label>
            <input
              id="totalCopies"
              name="totalCopies"
              type="number"
              min={1}
              defaultValue={1}
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-black focus:border-swin-red focus:outline-none"
              required
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ActionMessage status={state.status} message={state.message} />
            <SubmitButton />
          </div>
        </form>
      </div>
    </section>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-lg bg-swin-red px-5 py-2 text-sm text-black font-semibold text-swin-ivory shadow-sm shadow-swin-red/30 transition hover:bg-swin-red/90 disabled:cursor-not-allowed disabled:bg-swin-charcoal/20"
    >
      {pending ? 'Saving...' : 'Add book'}
    </button>
  );
}

function ActionMessage({ status, message }: { status: ActionState['status']; message: string }) {
  if (!message) return null;

  const tone = status === 'success' ? 'text-emerald-600' : status === 'error' ? 'text-swin-red' : 'text-swin-charcoal';

  return <p className={`text-sm font-medium ${tone}`}>{message}</p>;
}
