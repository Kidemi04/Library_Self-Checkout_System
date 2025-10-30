'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ManageBookModal from './manage-book-modal';
import { updateBook, deleteBook, type ItemStatus } from '@/app/lib/supabase/updates';

export type CatalogBook = {
  id: string;
  title: string | null;
  author: string | null;
  isbn?: string | null;
  classification?: string | null;
  location?: string | null;
  publication_year?: string | number | null;
  publisher?: string | null;
  tags?: string[] | null;
  status?: ItemStatus | null;
  available?: boolean | null;
  cover?: string | null;
  copies_available?: number | null;
  total_copies?: number | null;
};

export default function BookCatalogTable({ books }: { books: CatalogBook[] }) {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<CatalogBook | null>(null);

  const [form, setForm] = React.useState({
    title: '',
    classification: '',
    location: '',
    status: 'available' as ItemStatus,
    copiesAvailable: '',
    totalCopies: '',
    author: '',
    isbn: '',
    publicationYear: '',
    publisher: '',
    tags: '' as string, // comma-separated
  });

  function onManage(b: CatalogBook) {
    setActive(b);
    setForm({
      title: b.title ?? '',
      classification: b.classification ?? '',
      location: b.location ?? '',
      status: (b.status ?? 'available') as ItemStatus,
      copiesAvailable: b.copies_available != null ? String(b.copies_available) : '',
      totalCopies: b.total_copies != null ? String(b.total_copies) : '',
      author: b.author ?? '',
      isbn: b.isbn ?? '',
      publicationYear: b.publication_year ? String(b.publication_year) : '',
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

    await updateBook({
      id: active.id,
      title: form.title.trim(),
      classification: form.classification.trim() || null,
      location: form.location.trim() || null,
      status: form.status,
      copies_available: form.copiesAvailable ? Number(form.copiesAvailable) : null,
      total_copies: form.totalCopies ? Number(form.totalCopies) : null,
      author: form.author.trim() || null,
      isbn: form.isbn.trim() || null,
      publication_year: form.publicationYear.trim() || null,
      publisher: form.publisher.trim() || null,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });

    onClose();
    // ✅ refresh server data so status/text changes are visible immediately
    router.refresh();
  }

  async function onDelete() {
    if (!active) return;
    const ok = confirm(`Delete "${active.title ?? 'Untitled'}"? This cannot be undone.`);
    if (!ok) return;

    await deleteBook(active.id);
    onClose();
    router.refresh();
  }

  return (
    <>
      {/* Table wrapper (scroll on small screens) */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <Th>Title</Th>
                <Th>Author</Th>
                <Th className="hidden lg:table-cell">ISBN</Th>
                <Th className="hidden lg:table-cell">Call No.</Th>
                <Th className="hidden md:table-cell">Location</Th>
                <Th className="hidden lg:table-cell">Year</Th>
                <Th className="hidden xl:table-cell">Publisher</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {books.map((b) => (
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
                          <p className="truncate text-xs text-slate-600">
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
                  <Td className="hidden lg:table-cell">{b.publication_year ?? '-'}</Td>
                  <Td className="hidden xl:table-cell">{b.publisher ?? '-'}</Td>

                  <Td>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(
                        b.status,
                      )}`}
                    >
                      {statusLabel(b.status)}
                    </span>
                  </Td>

                  <Td className="whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                        onClick={() => onManage(b)}
                        type="button"
                      >
                        Manage
                      </button>
                      {/* Optional inline delete; you can remove if you only want it in the modal */}
                      <button
                        className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50"
                        onClick={async () => {
                          const ok = confirm(
                            `Delete "${b.title ?? 'Untitled'}"? This cannot be undone.`,
                          );
                          if (!ok) return;
                          await deleteBook(b.id);
                          router.refresh();
                        }}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
              {books.length === 0 && (
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

      {/* Modal follows viewport on scroll; form text is black for readability */}
      <ManageBookModal
        open={open}
        onClose={onClose}
        title="Manage book"
        lockScroll={false}
      >
        <form className="space-y-4 text-slate-900" onSubmit={onSave}>
          <div>
            <label className="block text-sm font-medium text-slate-800">Title</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-800">Classification</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                value={form.classification}
                onChange={(e) => setForm((f) => ({ ...f, classification: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-800">Location</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-800">Status</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ItemStatus }))}
              >
                <option value="available">Available</option>
                <option value="checked_out">Checked out</option>
                <option value="borrowed">Checked out (Borrowed)</option>
                <option value="reserved">Reserved</option>
                <option value="in_transit">In transit</option>
                <option value="on_hold">On hold</option>
                <option value="in_process">In process</option>
                <option value="maintenance">Maintenance</option>
                <option value="lost">Lost</option>
                <option value="missing">Missing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800">ISBN</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                value={form.isbn}
                onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-800">Copies available</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                value={form.copiesAvailable}
                onChange={(e) => setForm((f) => ({ ...f, copiesAvailable: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-800">Total copies</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                value={form.totalCopies}
                onChange={(e) => setForm((f) => ({ ...f, totalCopies: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-800">Author</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-800">Publication year</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                value={form.publicationYear}
                onChange={(e) => setForm((f) => ({ ...f, publicationYear: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">Publisher</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
              value={form.publisher}
              onChange={(e) => setForm((f) => ({ ...f, publisher: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">Tags</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
              placeholder="programming, typescript, ui"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            />
            <p className="mt-1 text-xs text-slate-600">Separate with commas</p>
          </div>

          <div className="flex flex-wrap justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-swin-charcoal px-4 py-2 text-sm text-swin-ivory hover:opacity-95"
              >
                Save changes
              </button>
            </div>
          </div>
        </form>
      </ManageBookModal>
    </>
  );
}

/* ---- helpers ---- */

function Th({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
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

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={['px-4 py-3 align-top text-sm text-slate-800', className].join(' ')}>
      {children}
    </td>
  );
}

function statusLabel(s?: ItemStatus | null) {
  switch (s) {
    case 'available': return 'Available';
    case 'checked_out':
    case 'borrowed':  return 'Checked out';
    case 'reserved':  return 'Reserved';
    case 'in_transit':return 'In transit';
    case 'on_hold':   return 'On hold';
    case 'in_process':return 'In process';
    case 'maintenance': return 'Maintenance';
    case 'lost':      return 'Lost';
    case 'missing':   return 'Missing';
    default:          return 'Unknown';
  }
}

function statusBadgeClass(s?: ItemStatus | null) {
  switch (s) {
    case 'available':   return 'bg-green-100 text-green-700';
    case 'checked_out':
    case 'borrowed':    return 'bg-amber-100 text-amber-800';
    case 'reserved':    return 'bg-fuchsia-100 text-fuchsia-700';
    case 'in_transit':  return 'bg-blue-100 text-blue-700';
    case 'on_hold':     return 'bg-violet-100 text-violet-700';
    case 'in_process':  return 'bg-slate-100 text-slate-700';
    case 'maintenance': return 'bg-gray-200 text-gray-800';
    case 'lost':
    case 'missing':     return 'bg-red-100 text-red-700';
    default:            return 'bg-slate-100 text-slate-700';
  }
}
