'use client';

import { useActionState, useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useFormStatus } from 'react-dom';
import clsx from 'clsx';
import { checkoutBookAction } from '@/app/dashboard/actions';
import { initialActionState } from '@/app/dashboard/action-state';
import type { ActionState } from '@/app/dashboard/action-state';
import type { Book } from '@/app/lib/supabase/types';
import CameraScannerButton from '@/app/ui/dashboard/camera-scanner-button';

interface CheckOutFormProps {
  books: Book[];
  defaultDueDate: string;
  preSelectedBookId?: string;
}

export default function CheckOutForm({ books, defaultDueDate, preSelectedBookId }: CheckOutFormProps) {
  const [state, formAction] = useActionState(checkoutBookAction, initialActionState);
  const formRef = useRef<HTMLFormElement | null>(null);
  const borrowerIdRef = useRef<HTMLInputElement | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string>(preSelectedBookId ?? '');
  const [selectedCopyId, setSelectedCopyId] = useState<string>('');
  const [selectedCopyBarcode, setSelectedCopyBarcode] = useState<string | null>(null);
  const [lookupMessage, setLookupMessage] = useState<{
    tone: 'neutral' | 'success' | 'error';
    text: string;
  } | null>(null);
  const [bookOptions, setBookOptions] = useState(() => buildBookOptions(books));
  const [bookMap, setBookMap] = useState(() => createBookMap(books));
  const contentId = 'borrow-form-panel';

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
      setSelectedBookId('');
      setSelectedCopyId('');
      setSelectedCopyBarcode(null);
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

  useEffect(() => {
    if (selectedBookId) {
      setMobileExpanded(true);
    }
  }, [selectedBookId]);

  useEffect(() => {
    if (!selectedBookId) {
      setSelectedCopyId('');
      setSelectedCopyBarcode(null);
      return;
    }

    const book = bookMap.get(selectedBookId);
    if (!book) {
      setSelectedCopyId('');
      setSelectedCopyBarcode(null);
      return;
    }

    const copy = pickPreferredCopy(book);
    setSelectedCopyId(copy?.id ?? '');
    setSelectedCopyBarcode(copy?.barcode ?? null);
  }, [selectedBookId, bookMap]);

  useEffect(() => {
    if (state.status === 'error') {
      setMobileExpanded(true);
    }
  }, [state.status]);

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

        const payload = (await response.json()) as LookupResponse;
        const book = mapApiBookToBook(payload.book);
        const explicitCopy = payload.copy
          ? { id: payload.copy.id, barcode: payload.copy.barcode ?? null }
          : null;

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

        const preferredCopy = explicitCopy ?? pickPreferredCopy(book);
        setSelectedBookId(book.id);
        setSelectedCopyId(preferredCopy?.id ?? '');
        setSelectedCopyBarcode(preferredCopy?.barcode ?? null);
        setLookupMessage({
          tone: 'success',
          text: preferredCopy?.barcode
            ? `Copy ${preferredCopy.barcode} of "${book.title}" is ready to loan.`
            : `Ready to borrow "${book.title}".`,
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
  const mobileToggleLabel = mobileExpanded ? 'Hide form' : 'Borrow a book';
  const handleMobileToggle = () => {
    setMobileExpanded((prev) => !prev);
  };

  return (
    <section className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-sm shadow-swin-charcoal/5 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100 dark:shadow-black/30">
      <div className="mb-3 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-swin-charcoal dark:text-slate-100">Borrowed Item Details</h2>
          <p className="hidden text-sm text-swin-charcoal/60 dark:text-slate-400 md:block">
            Confirm borrower credentials and title availability before finalising the loan.
          </p>
          <p className="text-xs text-swin-charcoal/60 dark:text-slate-400 md:hidden">
            Scan or search for a book, then enter who is borrowing it.
          </p>
        </div>
        <button
          type="button"
          onClick={handleMobileToggle}
          className="inline-flex h-[44px] w-full items-center justify-center rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-4 text-sm font-semibold text-swin-charcoal shadow-sm transition hover:border-swin-red hover:bg-swin-red hover:text-swin-ivory focus:outline-none focus-visible:ring-2 focus-visible:ring-swin-red focus-visible:ring-offset-2 focus-visible:ring-offset-white md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          aria-expanded={mobileExpanded}
          aria-controls={contentId}
        >
          {mobileToggleLabel}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
        <CameraScannerButton
          onDetected={(code) => {
            void handleScanDetected(code);
          }}
          modalDescription="Align the book barcode or ISBN within the frame. We will look up the title and select it automatically for borrowing."
          lastScanPrefix="Latest scan:"
          className="w-full md:w-auto"
        />
      </div>
      {lookupMessage ? (
        <p
          className={clsx(
            'mt-1 w-full text-xs font-medium text-swin-charcoal md:text-right dark:text-slate-300',
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

      <div
        id={contentId}
        className={clsx(
          'mt-4 space-y-6 md:mt-6',
          mobileExpanded ? 'block' : 'hidden',
          'md:block',
        )}
      >
        <form ref={formRef} action={formAction} className="grid gap-4 lg:grid-cols-2">
          {/* For Supabase: which copy to loan */}
          <input type="hidden" name="copyId" value={selectedCopyId} />
          {/* For SIP: itemIdentifier (usually the copy barcode) */}
          <input
            type="hidden"
            name="itemIdentifier"
            value={selectedCopyBarcode ?? ''}
          />

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-swin-charcoal dark:text-slate-100" htmlFor="bookId">
              Book to borrow
            </label>
            <select
              id="bookId"
              name="bookId"
              value={selectedBookId}
              onChange={handleBookSelection}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-swin-red focus:outline-none focus:ring-2 focus:ring-swin-red/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
                {bookOptions.length} titles ready to borrow.
              </p>
            ) : null}
            {selectedBook ? (
              <div className="mt-3 rounded-xl border border-swin-charcoal/10 bg-swin-ivory p-4 text-xs text-swin-charcoal shadow-inner shadow-swin-charcoal/5 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:shadow-black/30">
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
                      {selectedCopyBarcode ? `Barcode ${selectedCopyBarcode}` : null}
                      {selectedCopyBarcode && selectedBook.isbn ? ' – ' : ''}
                      {selectedBook.isbn ? `ISBN ${selectedBook.isbn}` : null}
                      {!selectedCopyBarcode && !selectedBook.isbn ? 'Not provided' : null}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-swin-charcoal/60">Availability</dt>
                    <dd className="text-sm">
                      {selectedBook.availableCopies} of {selectedBook.totalCopies} copies available
                    </dd>
                  </div>
                  {selectedCopyBarcode ? (
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-swin-charcoal/60">Selected copy</dt>
                      <dd className="text-sm">{selectedCopyBarcode}</dd>
                    </div>
                  ) : null}
                  {selectedBook.publisher ? (
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-swin-charcoal/60">Publisher</dt>
                      <dd className="text-sm">{selectedBook.publisher}</dd>
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
            <label className="block text-sm font-medium text-swin-charcoal dark:text-slate-200" htmlFor="borrowerIdentifier">
              Borrower ID
            </label>
          <input
            id="borrowerIdentifier"
            name="borrowerIdentifier"
            type="text"
            required
            placeholder="Scan or type borrower ID"
            ref={borrowerIdRef}
            className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-swin-charcoal focus:border-swin-red focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

          <div>
            <label className="block text-sm font-medium text-swin-charcoal dark:text-slate-200" htmlFor="borrowerName">
              Borrower name
            </label>
            <input
              id="borrowerName"
              name="borrowerName"
              type="text"
              required
              placeholder="Full name"
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-swin-charcoal focus:border-swin-red focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-swin-charcoal dark:text-slate-200" htmlFor="dueDate">
              Due date
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              defaultValue={defaultDueDate}
              required
              className="mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-swin-charcoal focus:border-swin-red focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ActionMessage status={state.status} message={state.message} />
            <SubmitButton disabled={!selectedCopyId} />
          </div>
        </form>
      </div>
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

type LookupResponse = {
  book: ApiBook;
  copy?: {
    id: string;
    barcode: string | null;
  };
};

type ApiBookCopy = {
  id: string;
  book_id: string;
  barcode: string | null;
  status: string | null;
  loans?: Array<{ id: string; returned_at: string | null }> | null;
};

type ApiBook = {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  classification: string | null;
  publisher: string | null;
  publication_year: string | null;
  cover_image_url: string | null;
  available_copies?: number | null;
  total_copies?: number | null;
  copies: ApiBookCopy[] | null;
};

const normalizeCopyStatus = (
  value: string | null | undefined,
): Book['copies'][number]['status'] => {
  if (typeof value !== 'string') return 'available';
  switch (value.trim().toUpperCase()) {
    case 'ON_LOAN':
      return 'on_loan';
    case 'LOST':
      return 'lost';
    case 'DAMAGED':
      return 'damaged';
    case 'PROCESSING':
      return 'processing';
    case 'HOLD_SHELF':
      return 'hold_shelf';
    case 'AVAILABLE':
    default:
      return 'available';
  }
};

const isCopyAvailable = (copy: Book['copies'][number]): boolean => {
  if (copy.status !== 'available') {
    return false;
  }
  return !(copy.loans ?? []).some((loan) => loan.returnedAt == null);
};

const pickPreferredCopy = (book: Book) => {
  const copy = book.copies.find((candidate) => isCopyAvailable(candidate));
  if (!copy) return null;
  return {
    id: copy.id,
    barcode: copy.barcode || null,
  };
};

const mapApiBookToBook = (apiBook: ApiBook): Book => {
  const copies =
    apiBook.copies?.map((copy) => ({
      id: copy.id,
      bookId: copy.book_id,
      barcode: copy.barcode ?? '',
      status: normalizeCopyStatus(copy.status),
      loans: (copy.loans ?? []).map((loan) => ({
        id: loan.id,
        returnedAt: loan.returned_at ?? null,
      })),
    })) ?? [];

  const availableCopies =
    typeof apiBook.available_copies === 'number'
      ? apiBook.available_copies
      : copies.filter((copy) => isCopyAvailable(copy)).length;

  const totalCopies =
    typeof apiBook.total_copies === 'number' ? apiBook.total_copies : copies.length;

  return {
    id: apiBook.id,
    title: apiBook.title,
    author: apiBook.author ?? null,
    isbn: apiBook.isbn ?? null,
    classification: apiBook.classification ?? null,
    coverImageUrl: apiBook.cover_image_url ?? null,
    publisher: apiBook.publisher ?? null,
    publicationYear: apiBook.publication_year ?? null,
    tags: [],
    copies,
    totalCopies,
    availableCopies,
    createdAt: null,
    updatedAt: null,
  };
};

type BookOption = {
  id: string;
  label: string;
};

const buildBookOption = (book: Book): BookOption => ({
  id: book.id,
  label: `${book.title}${book.author ? ` — ${book.author}` : ''}`,
});

const buildBookOptions = (bookList: Book[]): BookOption[] => bookList.map(buildBookOption);

const createBookMap = (bookList: Book[]) => {
  const map = new Map<string, Book>();
  bookList.forEach((book) => map.set(book.id, book));
  return map;
};
