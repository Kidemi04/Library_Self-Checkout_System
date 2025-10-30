'use client';

import React from 'react';
import ManageBookModal from '@/app/ui/dashboard/manage-book-modal';
import { updateBook } from '@/app/lib/supabase/updates'; // server action below

export type CatalogBook = {
  id: string;
  title: string | null;
  author: string | null;
  isbn?: string | null;
  classification?: string | null;   // call number
  location?: string | null;         // shelf / branch
  year?: string | number | null;
  publisher?: string | null;
  tags?: string[] | null;
  available?: boolean | null;
  cover?: string | null;
  copies_available?: number | null;
  total_copies?: number | null;
};

export default function BookCatalogTable({ books }: { books: CatalogBook[] }) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<CatalogBook | null>(null);

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
    tags: '' as string, // comma-separated
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

    const copiesAvail = Number(form.copiesAvailable) || 0;
    const totalCopies = Number(form.totalCopies) || 0;
    if (copiesAvail > totalCopies) {
      alert('Copies available cannot exceed total copies');
      return;
    }

    const payload = {
      id: active.id,
      title: form.title.trim(),
      classification: form.classification.trim(),
      location: form.location.trim(),
      available: form.available,
      copies_available: copiesAvail,
      total_copies: totalCopies,
      author: form.author.trim(),
      isbn: form.isbn.trim(),
      year: form.year.trim(),
      publisher: form.publisher.trim(),
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    // Server action – update DB
    try {
      await updateBook(payload);
      onClose();
      // Optional: toast + refresh list in parent via router.refresh() or SWR mutate
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? 'Failed to update book');
    }
  }

  return (
    <>
      {/* Table */}
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

      {/* Centered modal that follows viewport scroll */}
      <ManageBookModal
        open={open}
        onClose={onClose}
        title="Manage book"
        lockScroll={false} // set true if you want to freeze background
      >
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
                type="number"
                inputMode="numeric"
                min={0}
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
                type="number"
                inputMode="numeric"
                min={0}
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
                type="number"
                inputMode="numeric"
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

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
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
        </form>
      </ManageBookModal>
    </>
  );
}

/* ---- tiny table cell helpers ---- */

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
    <td className={['px-4 py-3 align-top text-sm text-slate-700', className].join(' ')}>
      {children}
    </td>
  );
}
