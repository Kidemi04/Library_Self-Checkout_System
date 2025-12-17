'use client';

import React from 'react';
import ManageBookModal from './manage-book-modal';
import { updateBook, deleteBook, type ItemStatus } from '@/app/lib/supabase/updates';
import type { CopyStatus } from '@/app/lib/supabase/types';
import { Pagination } from '@/app/ui/dashboard/pagination';

export type CatalogBook = {
  id: string;
  title: string | null;
  author: string | null;
  isbn?: string | null;
  classification?: string | null;
  publication_year?: string | number | null;
  publisher?: string | null;
  tags?: string[] | null;
  /** SIP-aligned status */
  status?: ItemStatus | null; // 'available' | 'checked_out' | 'borrowed' | 'reserved' | ...
  /** convenience cache; derived from status when saving */
  available?: boolean | null;
  cover?: string | null;
  copies_available?: number | null;
  total_copies?: number | null;
  sip_status?: CopyStatus | null;
};

/* -------------------- Main component -------------------- */

export default function BookCatalogTable({ books }: { books: CatalogBook[] }) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<CatalogBook | null>(null);
  const [sortKey, setSortKey] = React.useState<
    | 'title'
    | 'author'
    | 'isbn'
    | 'classification'
    | 'publication_year'
    | 'publisher'
    | 'status'
    | 'sip_status'
  >('title');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');

  // Local sort (client-side). You can move this server-side later if needed.
  const sorted = React.useMemo(() => {
    const key = sortKey;
    const dir = sortDir === 'asc' ? 1 : -1;
    const clone = [...books];
    clone.sort((a, b) => {
      const A = (a as any)?.[key] ?? '';
      const B = (b as any)?.[key] ?? '';
      const aS = String(A).toLowerCase();
      const bS = String(B).toLowerCase();
      if (aS < bS) return -1 * dir;
      if (aS > bS) return 1 * dir;
      return 0;
    });
    return clone;
  }, [books, sortKey, sortDir]);

  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10; // default 10 books per page

  // Compute total pages
  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  // Slice the books for current page
  const paginated = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage]);

  function toggleSort(nextKey: typeof sortKey) {
    if (nextKey === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(nextKey);
      setSortDir('asc');
    }
  }

  function sortIcon(col: typeof sortKey) {
    if (col !== sortKey) return '⇅';
    return sortDir === 'asc' ? '▲' : '▼';
    }

  /* ---------- Manage modal state ---------- */
  const [form, setForm] = React.useState({
    title: '',
    author: '',
    isbn: '',
    classification: '',
    publication_year: '',
    publisher: '',
    tags: '' as string, // comma-separated
    sip_status: 'available' as CopyStatus,
  });

  function onManage(b: CatalogBook) {
    setActive(b);
    setForm({
      title: b.title ?? '',
      author: b.author ?? '',
      isbn: b.isbn ?? '',
      classification: b.classification ?? '',
      publication_year: b.publication_year ? String(b.publication_year) : '',
      publisher: b.publisher ?? '',
      tags: (b.tags ?? []).join(', '),
      sip_status: (b.sip_status as CopyStatus) ?? 'available',
    });
    setOpen(true);
  }

  function onClose() {
    setOpen(false);
    setActive(null);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!active) return;

    // Send only numbers when present; server will omit nulls for NOT NULL columns.
    const payload = {
      id: active.id,
      title: form.title.trim(),
      author: form.author.trim() || null,
      isbn: form.isbn.trim() || null,
      classification: form.classification.trim() || null,
      publisher: form.publisher.trim() || null,
      publication_year: form.publication_year.trim() || null,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      sip_status: form.sip_status,
    };

    await updateBook(payload);
    onClose();
  }

  async function onDelete(id: string) {
    if (!confirm('Delete this book permanently?')) return;
    await deleteBook(id);
  }

  return (
    <>
      {/* Desktop/tablet: classic table */}
    <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-slate-900 dark:divide-slate-800 dark:text-slate-100">
            <thead className="bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
              <tr>
                <Th onClick={() => toggleSort('title')}>
                  <HeaderLabel label="Title" icon={sortIcon('title')} />
                </Th>
                <Th onClick={() => toggleSort('author')}>
                  <HeaderLabel label="Author" icon={sortIcon('author')} />
                </Th>
                <Th className="hidden lg:table-cell" onClick={() => toggleSort('isbn')}>
                  <HeaderLabel label="ISBN" icon={sortIcon('isbn')} />
                </Th>
                <Th className="hidden lg:table-cell" onClick={() => toggleSort('classification')}>
                  <HeaderLabel label="Call No." icon={sortIcon('classification')} />
                </Th>
                <Th className="hidden lg:table-cell" onClick={() => toggleSort('publication_year')}>
                  <HeaderLabel label="Year" icon={sortIcon('publication_year')} />
                </Th>
                <Th className="hidden xl:table-cell" onClick={() => toggleSort('publisher')}>
                  <HeaderLabel label="Publisher" icon={sortIcon('publisher')} />
                </Th>
                <Th onClick={() => toggleSort('status')}>
                  <HeaderLabel label="Status" icon={sortIcon('status')} />
                </Th>
                <Th onClick={() => toggleSort('sip_status')}>
                  <HeaderLabel label="SIP Status" icon={sortIcon('sip_status')} />
                </Th>
                <Th>Actions</Th>
              </tr>
            </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-950/60">
              {paginated.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-900 dark:text-slate-100">
                  <Td>
                    <div className="flex items-center gap-3">
                      {b.cover ? (
                        <img
                          src={b.cover}
                          alt=""
                          aria-hidden
                          className="h-12 w-8 rounded object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="h-12 w-8 rounded bg-slate-100 ring-1 ring-slate-200" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900 dark:text-slate-100">{b.title ?? 'Untitled'}</p>
                        {!!(b.tags && b.tags.length) && (
                          <p className="truncate text-xs text-slate-600 dark:text-slate-400">{b.tags.slice(0, 3).join(', ')}</p>
                        )}
                      </div>
                    </div>
                  </Td>
                  <Td className="text-slate-900 dark:text-slate-200">{b.author ?? <span className="text-slate-400 dark:text-slate-500">Unknown</span>}</Td>
                  <Td className="hidden lg:table-cell text-slate-900 dark:text-slate-200">{b.isbn ?? '-'}</Td>
                  <Td className="hidden lg:table-cell text-slate-900 dark:text-slate-200">{b.classification ?? '-'}</Td>
                  <Td className="hidden lg:table-cell text-slate-900 dark:text-slate-200">{b.publication_year ?? '-'}</Td>
                  <Td className="hidden xl:table-cell text-slate-900 dark:text-slate-200">{b.publisher ?? '-'}</Td>
                  <Td>{renderStatusBadge(b.status)}</Td>
                  <Td>{renderSipStatusBadge(b.sip_status)}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                        onClick={() => onManage(b)}
                        type="button"
                      >
                        Manage
                      </button>
                      <button
                        className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50 dark:border-red-300/40 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-500/10"
                        onClick={() => onDelete(b.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-sm text-slate-600">
                    No books found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: card list (no horizontal scrolling) */}
      <ul className="md:hidden space-y-3">
        {paginated.map((b) => (
          <li
            key={b.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
          >
            <div className="flex gap-3">
              {b.cover ? (
                <img
                  src={b.cover}
                  alt=""
                  aria-hidden
                  className="h-16 w-12 rounded object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="h-16 w-12 rounded bg-slate-100 ring-1 ring-slate-200" />
              )}

              <div className="min-w-0 flex-1">
                {/* Title + Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-900">
                      {b.title ?? 'Untitled'}
                    </h3>
                    <p className="truncate text-sm text-slate-700">
                      {b.author ?? 'Unknown'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {renderStatusBadge(b.status)}
                    {renderSipStatusBadge(b.sip_status)}
                  </div>
                </div>

                {/* Explicit, readable K/V list */}
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">ISBN</span>
                    <span className="font-medium text-slate-900 truncate">{b.isbn ?? '-'}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Call No.</span>
                    <span className="font-medium text-slate-900 truncate">{b.classification ?? '-'}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Year</span>
                    <span className="font-medium text-slate-900 truncate">
                      {b.publication_year ?? '-'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Publisher</span>
                    <span className="font-medium text-slate-900 truncate">{b.publisher ?? '-'}</span>
                  </div>
                  {!!(b.tags && b.tags.length) && (
                    <div className="flex items-start gap-3">
                      <span className="text-slate-500">Tags</span>
                      <span className="font-medium text-slate-900 truncate">
                        {b.tags.slice(0, 3).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    onClick={() => onManage(b)}
                    type="button"
                  >
                    Manage
                  </button>
                  <button
                    className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50"
                    onClick={() => onDelete(b.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
        {sorted.length === 0 && (
          <li className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200">
            No books found.
          </li>
        )}
      </ul>


      {/* Following viewport on scroll */}
      <ManageBookModal open={open} onClose={onClose} title="Manage book" lockScroll={false}>
        <form className="space-y-4" onSubmit={onSave}>
          {/* text colors forced to dark for clarity */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-200">Title</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-200">Author</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-200">ISBN</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={form.isbn}
              onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))}
            />
          </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-200">Call no.</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={form.classification}
              onChange={(e) => setForm((f) => ({ ...f, classification: e.target.value }))}
            />
          </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-200">Year</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={form.publication_year}
              onChange={(e) => setForm((f) => ({ ...f, publication_year: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-200">Publisher</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={form.publisher}
              onChange={(e) => setForm((f) => ({ ...f, publisher: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-slate-200">SIP status</label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={form.sip_status}
            onChange={(e) =>
              setForm((f) => ({ ...f, sip_status: e.target.value as CopyStatus }))
            }
          >
              <option value="available">Available</option>
              <option value="on_loan">On loan</option>
              <option value="hold_shelf">On hold shelf</option>
              <option value="processing">Processing</option>
              <option value="lost">Lost</option>
              <option value="damaged">Damaged</option>
            </select>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Applies to all copies of this book; mirrors the SIP/ILS status.
            </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-slate-200">Tags</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            placeholder="programming, ui, algorithms"
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          />
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Separate with commas</p>
        </div>

          <div className="mt-2 flex flex-wrap justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            {/* Inline delete inside modal (optional) */}
            {active && (
              <button
                type="button"
                onClick={() => onDelete(active.id)}
                className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            )}

            <button
              type="submit"
              className="rounded-xl bg-swin-charcoal px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
            >
              Save changes
            </button>
          </div>
        </form>
      </ManageBookModal>

      {/* Paging control */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}

/* -------------------- Helpers -------------------- */

function renderStatusBadge(status?: ItemStatus | null) {
  const s = status ?? 'available';
  const map: Record<ItemStatus, { text: string; cls: string }> = {
    available: { text: 'Available', cls: 'bg-green-100 text-green-700' },
    checked_out: { text: 'Checked out', cls: 'bg-amber-100 text-amber-800' },
    borrowed: { text: 'Checked out', cls: 'bg-amber-100 text-amber-800' },
    reserved: { text: 'On hold', cls: 'bg-indigo-100 text-indigo-700' },
    in_transit: { text: 'In transit', cls: 'bg-sky-100 text-sky-700' },
    on_hold: { text: 'On hold', cls: 'bg-indigo-100 text-indigo-700' },
    in_process: { text: 'In process', cls: 'bg-slate-100 text-slate-700' },
    lost: { text: 'Lost', cls: 'bg-rose-100 text-rose-700' },
    missing: { text: 'Missing', cls: 'bg-rose-100 text-rose-700' },
    maintenance: { text: 'Maintenance', cls: 'bg-yellow-100 text-yellow-800' },
  };
  const badge = map[s];
  return (
    <span className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-medium ${badge.cls}`}>
      {badge.text}
    </span>
  );
}

function renderSipStatusBadge(status?: CopyStatus | null) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
        Unknown
      </span>
    );
  }

  const map: Record<CopyStatus, { text: string; cls: string }> = {
    available: { text: 'SIP: Available', cls: 'bg-green-50 text-green-700 border border-green-200' },
    on_loan: { text: 'SIP: On loan', cls: 'bg-amber-50 text-amber-800 border border-amber-200' },
    hold_shelf: { text: 'SIP: On hold shelf', cls: 'bg-violet-50 text-violet-800 border border-violet-200' },
    processing: { text: 'SIP: Processing', cls: 'bg-slate-50 text-slate-700 border border-slate-200' },
    lost: { text: 'SIP: Lost', cls: 'bg-rose-50 text-rose-700 border border-rose-200' },
    damaged: { text: 'SIP: Damaged', cls: 'bg-orange-50 text-orange-800 border border-orange-200' },
  };

  const badge = map[status];
  return (
    <span className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-medium ${badge.cls}`}>
      {badge.text}
    </span>
  );
}

function HeaderLabel({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="flex select-none items-center gap-2 text-slate-900 dark:text-slate-100">
      <span>{label}</span>
      <span className="text-slate-500 dark:text-slate-400">{icon}</span>
    </div>
  );
}

function Th({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <th
      scope="col"
      onClick={onClick}
      className={[
        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide',
        'text-slate-700 cursor-pointer select-none dark:text-slate-100 dark:opacity-90',
        className,
      ].join(' ')}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={['px-4 py-3 align-top text-sm text-slate-900 dark:text-slate-100', className].join(' ')}>{children}</td>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="truncate font-medium text-slate-900">{children}</dd>
    </div>
  );
}