'use client';

import React, { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createBookAction } from '@/app/dashboard/actions';
import { initialActionState } from '@/app/dashboard/action-state';
import type { ActionState } from '@/app/dashboard/action-state';
import { ArrowDownCircleIcon, ArrowUpCircleIcon } from "@heroicons/react/24/outline";

export default function CreateBookForm() {
  const [state, formAction] = useActionState(createBookAction, initialActionState);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [expanded, setExpanded] = React.useState(false); // form expanded and collapse

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <section
      className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-sm shadow-swin-charcoal/5 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100 dark:shadow-black/20">
      <div 
        onClick={(e) => setExpanded(!expanded)}
        className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-swin-charcoal dark:text-slate-100">Add Book Item</h2>
          <p className="text-sm text-swin-charcoal/60 dark:text-slate-200">
            Register a new library resource and assign individual copy barcodes for circulation tracking.
          </p>
        </div>

        {/* Arrow Icon */}
        <div className="text-swin-charcoal dark:text-slate-200">
          {expanded ? (
            <ArrowUpCircleIcon className="h-10 w-10" />
          ) : (
            <ArrowDownCircleIcon className="h-10 w-10" />
          )}
        </div>
      </div>

      {/* Let the form can be expand and collapse */}
      {expanded && (
        <form ref={formRef} action={formAction} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-swin-charcoal dark:text-slate-100" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Book title"
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm focus:border-swin-red focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-swin-charcoal dark:text-slate-100" htmlFor="author">
              Author / Creator
            </label>
            <input
              id="author"
              name="author"
              type="text"
              placeholder="Author name"
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm focus:border-swin-red focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-swin-charcoal dark:text-slate-100" htmlFor="classification">
              Classification
            </label>
            <input
              id="classification"
              name="classification"
              type="text"
              placeholder="e.g. QA76.76.C672"
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm focus:border-swin-red focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-swin-charcoal dark:text-slate-100" htmlFor="isbn">
              ISBN
            </label>
            <input
              id="isbn"
              name="isbn"
              type="text"
              placeholder="978-0-00-0000"
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm focus:border-swin-red focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-swin-charcoal dark:text-slate-100" htmlFor="copyBarcodes">
              Copy barcodes
            </label>
            <textarea
              id="copyBarcodes"
              name="copyBarcodes"
              rows={3}
              required
              placeholder="Scan or type one barcode per line"
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm focus:border-swin-red focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
            <p className="mt-1 text-xs text-swin-charcoal/60 dark:text-slate-200">
              Provide at least one barcode. Separate multiple barcodes with new lines or commas.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-swin-charcoal dark:text-slate-100" htmlFor="publisher">
              Publisher
            </label>
            <input
              id="publisher"
              name="publisher"
              type="text"
              placeholder="Publisher name"
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm focus:border-swin-red focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-swin-charcoal dark:text-slate-100" htmlFor="publicationYear">
              Publication year
            </label>
            <input
              id="publicationYear"
              name="publicationYear"
              type="text"
              placeholder="e.g. 2024"
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm focus:border-swin-red focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-swin-charcoal dark:text-slate-100" htmlFor="coverImageUrl">
              Cover image URL
            </label>
            <input
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              placeholder="https://example.com/cover.jpg"
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm focus:border-swin-red focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ActionMessage status={state.status} message={state.message} />
            <SubmitButton />
          </div>
        </form>
      )}

    </section>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-lg bg-swin-red px-5 py-2 text-sm font-semibold text-swin-ivory shadow-sm shadow-swin-red/30 transition hover:bg-swin-red/90 disabled:cursor-not-allowed disabled:bg-swin-charcoal/20"
    >
      {pending ? 'Saving...' : 'Add book'}
    </button>
  );
}

function ActionMessage({ status, message }: { status: ActionState['status']; message: string }) {
  if (!message) return null;
  const tone =
    status === 'success' ? 'text-emerald-600' :
    status === 'error'   ? 'text-swin-red'    :
                           'text-swin-charcoal';
  return <p className={`text-sm font-medium ${tone}`}>{message}</p>;
}
