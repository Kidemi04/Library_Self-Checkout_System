'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import clsx from 'clsx';
import { checkoutBookAction } from '@/app/dashboard/actions';
import { initialActionState } from '@/app/dashboard/action-state';
import type { ActionState } from '@/app/dashboard/action-state';
import type { Book } from '@/app/lib/supabase/types';
import CheckOutScanPanel from '@/app/ui/dashboard/check-out-scan-panel';

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
  const borrowerIdRef = useRef<HTMLInputElement | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [lookupMessage, setLookupMessage] = useState<{ tone: 'neutral' | 'success' | 'error'; text: string } | null>(null);
  const [bookOptions, setBookOptions] = useState(() => buildBookOptions(books));
  const [bookMap, setBookMap] = useState(() => createBookMap(books));

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
      setSelectedBookId('');
      setLookupMessage(null);
      borrowerIdRef.current?.focus();
    }
  }, [state.status]);

  useEffect(() => {
    setBookOptions((prev) => {
      const base = buildBookOptions(books);
      const extras = prev.filter((option) => !base.some((item) => item.id === option.id));
      return [...base, ...extras];
    });
    setBookMap((prev) => {
      const next = new Map(prev);
      books.forEach((book) => next.set(book.id, book));
      return next;
    });
  }, [books]);

  const handleBookSelection = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedBookId(event.target.value);
  }, []);

  const handleScanDetected = useCallback(
    async (code: string) => {
      if (!code) return;
      setLookupMessage({ tone: 'neutral', text: `Looking up ${code}…` });

      try {
        const response = await fetch(`/api/books/lookup?code=${encodeURIComponent(code)}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          const message = payload?.error ?? 'No available book matched that code.';
          setLookupMessage({ tone: 'error', text: message });
          return;
        }

        const payload = (await response.json()) as { book: Book };
        const book = payload.book;

        setBookOptions((prev) => {
          if (prev.some((option) => option.id === book.id)) {
            return prev;
          }
          return [...prev, buildBookOption(book)];
        });

        setBookMap((prev) => {
          const next = new Map(prev);
          next.set(book.id, book);
          return next;
        });

        setSelectedBookId(book.id);
        setLookupMessage({
          tone: 'success',
          text: `Ready to borrow “${book.title}”.`,
        });
        borrowerIdRef.current?.focus();
      } catch (error) {
        console.error('Failed to lookup scanned book', error);
        setLookupMessage({
          tone: 'error',
          text: 'Unable to look up that code. Try again or search manually.',
        });
      }
    },
    [],
  );

  const selectedBook = selectedBookId ? bookMap.get(selectedBookId) : null;

  return (
    <section className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-sm shadow-swin-charcoal/5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-swin-charcoal">Borrowed Item Details</h2>
          <p className="text-sm text-swin-charcoal/60">
            Confirm borrower credentials and title availability before finalising the loan.
          </p>
        </div>
      </div>
      <CheckOutScanPanel onDetected={handleScanDetected} />

      <form ref={formRef} action={formAction} className="grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-swin-charcoal" htmlFor="bookId">
            Book to borrow
          </label>
          <select
            id="bookId"
            name="bookId"
            value={selectedBookId}
            onChange={handleBookSelection}
            className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-swin-charcoal focus:border-swin-red focus:outline-none"
            required
          >
            <option value="" disabled>
              {bookOptions.length ? 'Select a book' : 'No titles available'}
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
          {lookupMessage ? (
            <p
              className={clsx(
                'mt-2 text-xs font-medium',
                lookupMessage.tone === 'success'
                  ? 'text-emerald-600'
                  : lookupMessage.tone === 'error'
                    ? 'text-swin-red'
                    : 'text-swin-charcoal/70',
              )}
            >
              {lookupMessage.text}
            </p>
          ) : null}
          {selectedBook ? (
            <div className="mt-3 rounded-xl border border-swin-charcoal/10 bg-swin-ivory p-4 text-xs text-swin-charcoal shadow-inner shadow-swin-charcoal/5">
              <p className="text-sm font-semibold text-swin-charcoal">Selected title</p>
              <dl className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-swin-charcoal/60">Title</dt>
                  <dd className="text-sm font-medium">{selectedBook.title}</dd>
                </div>
                {selectedBook.author ? (
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-swin-charcoal/60">Author</dt>
                    <dd className="text-sm">{selectedBook.author}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-swin-charcoal/60">Identifiers</dt>
                  <dd className="text-sm">
                    {selectedBook.barcode ? `Barcode ${selectedBook.barcode}` : null}
                    {selectedBook.barcode && selectedBook.isbn ? ' · ' : ''}
                    {selectedBook.isbn ? `ISBN ${selectedBook.isbn}` : null}
                    {!selectedBook.barcode && !selectedBook.isbn ? 'Not provided' : null}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-swin-charcoal/60">Availability</dt>
                  <dd className="text-sm">
                    {Math.max(0, selectedBook.available_copies ?? 0)} of {Math.max(1, selectedBook.total_copies ?? 1)} copies available
                  </dd>
                </div>
                {selectedBook.location ? (
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-swin-charcoal/60">Location</dt>
                    <dd className="text-sm">{selectedBook.location}</dd>
                  </div>
                ) : null}
                {selectedBook.classification ? (
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-swin-charcoal/60">Classification</dt>
                    <dd className="text-sm">{selectedBook.classification}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
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
            ref={borrowerIdRef}
            className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-swin-charcoal focus:border-swin-red focus:outline-none"
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
            className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-swin-charcoal focus:border-swin-red focus:outline-none"
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
            className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-swin-charcoal focus:border-swin-red focus:outline-none"
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
            className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-swin-charcoal focus:border-swin-red focus:outline-none"
          />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ActionMessage status={state.status} message={state.message} />
          <SubmitButton disabled={!bookOptions.length} />
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
      {pending ? 'Processing…' : 'Borrow book'}
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

type BookOption = {
  id: string;
  label: string;
};

const buildBookOption = (book: Book): BookOption => ({
  id: book.id,
  label: `${book.title}${book.author ? ` · ${book.author}` : ''}`,
});

const buildBookOptions = (bookList: Book[]): BookOption[] => bookList.map(buildBookOption);

const createBookMap = (bookList: Book[]) => {
  const map = new Map<string, Book>();
  bookList.forEach((book) => map.set(book.id, book));
  return map;
};
