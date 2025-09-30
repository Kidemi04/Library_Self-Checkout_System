import type { Loan } from '@/app/lib/supabase/types';
import QuickCheckInButton from '@/app/ui/dashboard/quick-check-in-button';

const dateFormatter = new Intl.DateTimeFormat('en-MY', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const formatDate = (value: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '—';
  return dateFormatter.format(date);
};

const isOverdue = (loan: Loan) => {
  if (loan.status === 'overdue') return true;
  const due = new Date(loan.due_at);
  return !Number.isNaN(due.valueOf()) && due.getTime() < Date.now();
};

export default function ActiveLoansTable({ loans }: { loans: Loan[] }) {
  if (!loans.length) {
    return (
      <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 text-center text-sm text-swin-charcoal/60">
        There are no active loans right now.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-swin-charcoal/10 bg-white shadow-sm shadow-swin-charcoal/5">
      <table className="min-w-full divide-y divide-swin-charcoal/10">
        <thead className="bg-swin-ivory">
          <tr className="text-left text-xs font-semibold uppercase tracking-wider text-swin-charcoal/70">
            <th className="px-6 py-3">Borrower</th>
            <th className="px-6 py-3">Book</th>
            <th className="px-6 py-3">Due</th>
            <th className="px-6 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-swin-charcoal/10 bg-white text-sm">
          {loans.map((loan) => {
            const overdue = isOverdue(loan);

            return (
              <tr key={loan.id} className="transition hover:bg-swin-ivory">
                <td className="px-6 py-4">
                  <div className="font-medium text-swin-charcoal">{loan.borrower_name}</div>
                  <p className="text-xs capitalize text-swin-charcoal/60">
                    {loan.borrower_type} · ID {loan.borrower_identifier}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-swin-charcoal">
                    {loan.book?.title ?? 'Untitled'}
                  </div>
                  <p className="text-xs text-swin-charcoal/60">
                    {loan.book?.barcode ? `Barcode ${loan.book.barcode}` : loan.book?.isbn ? `ISBN ${loan.book.isbn}` : '—'}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      overdue ? 'bg-swin-red/10 text-swin-red' : 'bg-swin-charcoal/10 text-swin-charcoal'
                    }`}
                  >
                    {formatDate(loan.due_at)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <QuickCheckInButton loanId={loan.id} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
