import type { Book } from '@/app/lib/supabase/types';

const dateFormatter = new Intl.DateTimeFormat('en-MY', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const formatDateTime = (value: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '—';
  return dateFormatter.format(date);
};

const statusStyle: Record<string, string> = {
  available: 'bg-emerald-500/10 text-emerald-600',
  checked_out: 'bg-swin-red/10 text-swin-red',
  reserved: 'bg-amber-500/10 text-amber-600',
  maintenance: 'bg-slate-400/10 text-slate-600',
};

export default function BookCatalogTable({ books }: { books: Book[] }) {
  if (!books.length) {
    return (
      <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 text-center text-sm text-swin-charcoal/60">
        No books in the catalogue yet. Add your first title.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-swin-charcoal/10 bg-white shadow-sm shadow-swin-charcoal/5">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-swin-charcoal/10">
          <thead className="bg-swin-ivory">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-swin-charcoal/70">
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Availability</th>
              <th className="px-6 py-3">Classification</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Last activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-swin-charcoal/10 bg-white text-sm">
          {books.map((book) => (
            <tr key={book.id} className="transition hover:bg-swin-ivory">
              <td className="px-6 py-4">
                <div className="font-semibold text-swin-charcoal">{book.title}</div>
                <p className="text-xs text-swin-charcoal/60">
                  {book.author ?? 'Unknown author'} · {book.barcode ?? (book.isbn ? `ISBN ${book.isbn}` : 'No barcode')}
                </p>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyle[book.status] ?? 'bg-swin-charcoal/10 text-swin-charcoal'
                    }`}
                  >
                    {book.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-swin-charcoal/60">
                    {book.available_copies ?? 0}/{book.total_copies ?? 0} available
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-swin-charcoal/70">
                {book.classification ?? '—'}
              </td>
              <td className="px-6 py-4 text-swin-charcoal/70">{book.location ?? '—'}</td>
              <td className="px-6 py-4 text-swin-charcoal/70">{formatDateTime(book.last_transaction_at)}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
