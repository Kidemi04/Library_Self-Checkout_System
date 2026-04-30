'use client';

import React, { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createBookAction } from '@/app/dashboard/actions';
import { initialActionState } from '@/app/dashboard/actionState';
import type { ActionState } from '@/app/dashboard/actionState';
import { ArrowDownCircleIcon, ArrowUpCircleIcon } from "@heroicons/react/24/outline";
import { Button } from '@/app/ui/button';

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
      className="rounded-card border border-hairline dark:border-dark-hairline bg-surface-card dark:bg-dark-surface-card p-6">
      <div
        onClick={(e) => setExpanded(!expanded)}
        className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-display text-display-sm text-ink dark:text-on-dark">Add Book Item</h2>
          <p className="font-sans text-body-sm text-muted dark:text-on-dark-soft">
            Register a new library resource and assign individual copy barcodes for circulation tracking.
          </p>
        </div>

        {/* Arrow Icon */}
        <div className="text-ink dark:text-on-dark">
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
            <label className="block font-sans text-body-sm font-medium text-ink dark:text-on-dark" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Book title"
              className="mt-2 w-full rounded-btn border border-hairline dark:border-dark-hairline bg-canvas dark:bg-dark-surface-soft px-3.5 h-10 font-sans text-body-md text-ink dark:text-on-dark placeholder:text-muted-soft dark:placeholder:text-on-dark-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
            />
          </div>

          <div>
            <label className="block font-sans text-body-sm font-medium text-ink dark:text-on-dark" htmlFor="author">
              Author / Creator
            </label>
            <input
              id="author"
              name="author"
              type="text"
              placeholder="Author name"
              className="mt-2 w-full rounded-btn border border-hairline dark:border-dark-hairline bg-canvas dark:bg-dark-surface-soft px-3.5 h-10 font-sans text-body-md text-ink dark:text-on-dark placeholder:text-muted-soft dark:placeholder:text-on-dark-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
            />
          </div>

          <div>
            <label className="block font-sans text-body-sm font-medium text-ink dark:text-on-dark" htmlFor="classification">
              Classification
            </label>
            <input
              id="classification"
              name="classification"
              type="text"
              placeholder="e.g. QA76.76.C672"
              className="mt-2 w-full rounded-btn border border-hairline dark:border-dark-hairline bg-canvas dark:bg-dark-surface-soft px-3.5 h-10 font-sans text-body-md text-ink dark:text-on-dark placeholder:text-muted-soft dark:placeholder:text-on-dark-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
            />
          </div>

          <div>
            <label className="block font-sans text-body-sm font-medium text-ink dark:text-on-dark" htmlFor="isbn">
              ISBN
            </label>
            <input
              id="isbn"
              name="isbn"
              type="text"
              placeholder="978-0-00-0000"
              className="mt-2 w-full rounded-btn border border-hairline dark:border-dark-hairline bg-canvas dark:bg-dark-surface-soft px-3.5 h-10 font-sans text-body-md text-ink dark:text-on-dark placeholder:text-muted-soft dark:placeholder:text-on-dark-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-sans text-body-sm font-medium text-ink dark:text-on-dark" htmlFor="copyBarcodes">
              Copy barcodes
            </label>
            <textarea
              id="copyBarcodes"
              name="copyBarcodes"
              rows={3}
              required
              placeholder="Scan or type one barcode per line"
              className="mt-2 w-full rounded-btn border border-hairline dark:border-dark-hairline bg-canvas dark:bg-dark-surface-soft px-3.5 py-2 font-sans text-body-md text-ink dark:text-on-dark placeholder:text-muted-soft dark:placeholder:text-on-dark-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
            />
            <p className="mt-1 font-sans text-caption text-muted dark:text-on-dark-soft">
              Provide at least one barcode. Separate multiple barcodes with new lines or commas.
            </p>
          </div>

          <div>
            <label className="block font-sans text-body-sm font-medium text-ink dark:text-on-dark" htmlFor="publisher">
              Publisher
            </label>
            <input
              id="publisher"
              name="publisher"
              type="text"
              placeholder="Publisher name"
              className="mt-2 w-full rounded-btn border border-hairline dark:border-dark-hairline bg-canvas dark:bg-dark-surface-soft px-3.5 h-10 font-sans text-body-md text-ink dark:text-on-dark placeholder:text-muted-soft dark:placeholder:text-on-dark-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
            />
          </div>

          <div>
            <label className="block font-sans text-body-sm font-medium text-ink dark:text-on-dark" htmlFor="publicationYear">
              Publication year
            </label>
            <input
              id="publicationYear"
              name="publicationYear"
              type="text"
              placeholder="e.g. 2024"
              className="mt-2 w-full rounded-btn border border-hairline dark:border-dark-hairline bg-canvas dark:bg-dark-surface-soft px-3.5 h-10 font-sans text-body-md text-ink dark:text-on-dark placeholder:text-muted-soft dark:placeholder:text-on-dark-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
            />
          </div>

          <div>
            <label className="block font-sans text-body-sm font-medium text-ink dark:text-on-dark" htmlFor="coverImageUrl">
              Cover image URL
            </label>
            <input
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              placeholder="https://example.com/cover.jpg"
              className="mt-2 w-full rounded-btn border border-hairline dark:border-dark-hairline bg-canvas dark:bg-dark-surface-soft px-3.5 h-10 font-sans text-body-md text-ink dark:text-on-dark placeholder:text-muted-soft dark:placeholder:text-on-dark-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
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
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? 'Saving...' : 'Add book'}
    </Button>
  );
}

function ActionMessage({ status, message }: { status: ActionState['status']; message: string }) {
  if (!message) return null;
  const tone =
    status === 'success' ? 'text-success' :
    status === 'error'   ? 'text-primary dark:text-dark-primary' :
                           'text-body dark:text-on-dark/80';
  return <p className={`font-sans text-body-sm font-medium ${tone}`}>{message}</p>;
}
