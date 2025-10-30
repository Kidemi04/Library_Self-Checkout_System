'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ManageBookModal from './manage-book-modal';
import { updateBook, deleteBook } from '@/app/lib/supabase/updates';

export type CatalogBook = {
  id: string;
  title: string | null;
  author: string | null;
  isbn?: string | null;
  classification?: string | null;
  location?: string | null;
  year?: string | number | null;
  publisher?: string | null;
  tags?: string[] | null;
  available?: boolean | null;
  cover?: string | null;
  copies_available?: number | null;
  total_copies?: number | null;
};

type SortKey =
  | 'title'
  | 'author'
  | 'isbn'
  | 'classification'
  | 'location'
  | 'year'
  | 'publisher'
  | 'available';

type SortDir = 'asc' | 'desc';

export default function BookCatalogTable({ books }: { books: CatalogBook[] }) {
  const router = useRouter();

  // ---------- sort state (works for both desktop and mobile views) ----------
  const [sortKey, setSortKey] = React.useState<SortKey>('title');
  const [sortDir, setSortDir] = React.useState<SortDir>('asc');

  const sorted = React.useMemo(() => {
    const toStr = (v: unknown) => (v === null || v === undefined ? '' : String(v).toLowerCase());
    const copy = [...books];
    copy.sort((a, b) => {
      let A: string | number = '';
      let B: string | number = '';

      if (sortKey === 'available') {
        A = a.available ? 1 : 0;
        B = b.available ? 1 : 0;
      } else {
        A = toStr((a as any)[sortKey]);
        B = toStr((b as any)[sortKey]);
      }

      if (A < B) return sortDir === 'asc' ? -1 : 1;
      if (A > B) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [books, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // ---------- modal + form state ----------
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<CatalogBook | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const [form, setForm] = React.useState({
    title: '',
    classification: '',
    location: '',
    available: true,
    copiesAvailable: '1',
    totalCopies: '1',
    author: '',
    isbn: '',
    year: '',
    publisher: '',
    tags: '' as string,
  });

  function onManage(b: CatalogBook) {
    setActive(b);
    setForm({
      title: b.title ?? '',
      classification: b.classification ?? '',
      location: b.location ?? '',
      available: Boolean(b.available ?? true),
      copiesAvailable: String(b.copies_available ?? 1),
      totalCopies: String(b.total_copies ?? 1),
      author: b.author ?? '',
      isbn: b.isbn ?? '',
      year: b.year ? String(b.year) : '',
      publisher: b.publisher ?? '',
      tags: (b.tags ?? []).join(', '),
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
    try {
      setSaving(true);
      await updateBook({
        id: active.id,
        title: form.title.trim(),
        classification: form.classification.trim(),
        location: form.location.trim(),
        available: form.available,
        copies_available: Number(form.copiesAvailable) || 0,
        total_copies: Number(form.totalCopies) || 0,
        author: form.author.trim(),
        isbn: form.isbn.trim(),
        year: form.year.trim(),
        publisher: form.publisher.trim(),
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      onClose();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!active) return;
    const ok = confirm(`Delete "${active.title ?? 'this book'}"? This cannot be undone.`);
    if (!ok) return;
    try {
      setDeleting(true);
      await deleteBook(active.id);
      onClose();
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  // ---------- Desktop table header helpers ----------
  const Arrow = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <span className="text-slate-400">⇅</span>;
    return <span className="text-slate-700">{sortDir === 'asc' ? '▲' : '▼'}</span>;
  };

  const ariaSort = (col: SortKey): React.AriaAttributes['aria-sort'] =>
    sortKey === col ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none';

  return (
    <>
      {/* ---------- Mobile controls (<= md) ---------- */}
      <div className="mb-3 grid gap-2 md:hidden">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-medium text-slate-700">Sort by</label>
            <select
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="isbn">ISBN</option>
              <option value="classification">Call No.</option>
              <option value="location">Location</option>
              <option value="year">Year</option>
              <option value="publisher">Publisher</option>
              <option value="available">Status</option>
            </select>

            <button
              type="button"
              onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 shadow-sm"
              aria-label="Toggle sort direction"
            >
              {sortDir === 'asc' ? '▲ A→Z' : '▼ Z→A'}
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Mobile card list (<= md) ---------- */}
      <ul className="grid gap-3 md:hidden">
        {sorted.map((b) => (
          <li key={b.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              {b.cover ? (
                <img
                  src={b.cover}
                  alt=""
                  aria-hidden
                  className="h-16 w-12 shrink-0 rounded object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="h-16 w-12 shrink-0 rounded bg-slate-100 ring-1 ring-slate-200" />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-500">{b.author ?? 'Unknown'}</p>
                <h3 className="line-clamp-2 font-semibold text-slate-900">{b.title ?? 'Untitled'}</h3>

                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                  <div className="min-w-0">
                    <dt className="sr-only">ISBN</dt>
                    <dd className="truncate">{b.isbn ?? '-'}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="sr-only">Call No.</dt>
                    <dd className="truncate">{b.classification ?? '-'}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="sr-only">Location</dt>
                    <dd className="truncate">{b.location ?? '-'}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="sr-only">Year</dt>
                    <dd className="truncate">{b.year ?? '-'}</dd>
                  </div>
                </dl>

                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={[
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                      b.available ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800',
                    ].join(' ')}
                  >
                    {b.available ? 'Available' : 'On loan'}
                  </span>

                  <button
                    type="button"
                    onClick={() => onManage(b)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
        {sorted.length === 0 && (
          <li className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
            No books found.
          </li>
        )}
      </ul>

      {/* ---------- Desktop table (>= md) ---------- */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <SortableTh
                  activeKey={sortKey}
                  dir={sortDir}
                  colKey="title"
                  onClick={toggleSort}
                  ariaSort={ariaSort('title')}
                >
                  Title <Arrow col="title" />
                </SortableTh>

                <SortableTh
                  activeKey={sortKey}
                  dir={sortDir}
                  colKey="author"
                  onClick={toggleSort}
                  ariaSort={ariaSort('author')}
                >
                  Author <Arrow col="author" />
                </SortableTh>

                <SortableTh
                  className="hidden lg:table-cell"
                  activeKey={sortKey}
                  dir={sortDir}
                  colKey="isbn"
                  onClick={toggleSort}
                  ariaSort={ariaSort('isbn')}
                >
                  ISBN <Arrow col="isbn" />
                </SortableTh>

                <SortableTh
                  className="hidden lg:table-cell"
                  activeKey={sortKey}
                  dir={sortDir}
                  colKey="classification"
                  onClick={toggleSort}
                  ariaSort={ariaSort('classification')}
                >
                  Call No. <Arrow col="classification" />
                </SortableTh>

                <SortableTh
                  className="hidden md:table-cell"
                  activeKey={sortKey}
                  dir={sortDir}
                  colKey="location"
                  onClick={toggleSort}
                  ariaSort={ariaSort('location')}
                >
                  Location <Arrow col="location" />
                </SortableTh>

                <SortableTh
                  className="hidden lg:table-cell"
                  activeKey={sortKey}
                  dir={sortDir}
                  colKey="year"
                  onClick={toggleSort}
                  ariaSort={ariaSort('year')}
                >
                  Year <Arrow col="year" />
                </SortableTh>

                <SortableTh
                  className="hidden xl:table-cell"
                  activeKey={sortKey}
                  dir={sortDir}
                  colKey="publisher"
                  onClick={toggleSort}
                  ariaSort={ariaSort('publisher')}
                >
                  Publisher <Arrow col="publisher" />
                </SortableTh>

                <SortableTh
                  activeKey={sortKey}
                  dir={sortDir}
                  colKey="available"
                  onClick={toggleSort}
                  ariaSort={ariaSort('available')}
                >
                  Status <Arrow col="available" />
                </SortableTh>

                <Th>Actions</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {sorted.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
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
                        <p className="truncate font-medium text-slate-900">
                          {b.title ?? 'Untitled'}
                        </p>
                        {!!(b.tags && b.tags.length) && (
                          <p className="truncate text-xs text-slate-500">
                            {b.tags.slice(0, 3).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Td>
                  <Td>{b.author ?? <span className="text-slate-400">Unknown</span>}</Td>
                  <Td className="hidden lg:table-cell">{b.isbn ?? '-'}</Td>
                  <Td className="hidden lg:table-cell">{b.classification ?? '-'}</Td>
                  <Td className="hidden md:table-cell">{b.location ?? '-'}</Td>
                  <Td className="hidden lg:table-cell">{b.year ?? '-'}</Td>
                  <Td className="hidden xl:table-cell">{b.publisher ?? '-'}</Td>
                  <Td>
                    {b.available ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        On loan
                      </span>
                    )}
                  </Td>
                  <Td>
                    <button
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                      onClick={() => onManage(b)}
                      type="button"
                    >
                      Manage
                    </button>
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

      {/* ---------- Manage Modal (with Delete inside) ---------- */}
      <ManageBookModal open={open} onClose={onClose} title="Manage book" lockScroll={false}>
        <form className="space-y-4" onSubmit={onSave}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Classification</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={form.classification}
                onChange={(e) => setForm((f) => ({ ...f, classification: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Location</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Availability</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={form.available ? 'available' : 'on_loan'}
                onChange={(e) =>
                  setForm((f) => ({ ...f, available: e.target.value === 'available' }))
                }
              >
                <option value="available">Available</option>
                <option value="on_loan">On loan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Copies available</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={form.copiesAvailable}
                onChange={(e) => setForm((f) => ({ ...f, copiesAvailable: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Total copies</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={form.totalCopies}
                onChange={(e) => setForm((f) => ({ ...f, totalCopies: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">ISBN</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={form.isbn}
                onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Author</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Year</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Publisher</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={form.publisher}
              onChange={(e) => setForm((f) => ({ ...f, publisher: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Tags</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              placeholder="programming, typescript, ui"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            />
            <p className="mt-1 text-xs text-slate-500">Separate with commas</p>
          </div>

          <div className="flex justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-swin-charcoal px-4 py-2 text-sm text-swin-ivory hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      </ManageBookModal>
    </>
  );
}

/* ---------- Table cell helpers ---------- */
function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={[
        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600',
        className,
      ].join(' ')}
    >
      {children}
    </th>
  );
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={['px-4 py-3 align-top text-sm text-slate-700', className].join(' ')}>{children}</td>;
}

/* Clickable sortable <th> for desktop */
function SortableTh({
  children,
  className = '',
  colKey,
  activeKey,
  dir,
  onClick,
  ariaSort,
}: {
  children: React.ReactNode;
  className?: string;
  colKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onClick: (k: SortKey) => void;
  ariaSort: React.AriaAttributes['aria-sort'];
}) {
  const isActive = activeKey === colKey;
  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={[
        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600',
        className,
      ].join(' ')}
    >
      <button
        type="button"
        onClick={() => onClick(colKey)}
        className={[
          'inline-flex items-center gap-1 rounded px-1 py-0.5 transition',
          isActive ? 'bg-slate-200 text-slate-900' : 'hover:bg-slate-100',
        ].join(' ')}
        aria-label={`Sort by ${colKey} ${isActive ? (dir === 'asc' ? 'ascending' : 'descending') : ''}`}
      >
        {children}
      </button>
    </th>
  );
}
