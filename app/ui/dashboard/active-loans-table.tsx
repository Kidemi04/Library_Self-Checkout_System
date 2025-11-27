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
  const due = new Date(loan.dueAt);
  return !Number.isNaN(due.valueOf()) && due.getTime() < Date.now();
};

const roleLabel = (role: Loan['borrowerRole']): string => {
  if (role === 'admin') return 'Admin';
  if (role === 'staff') return 'Staff';
  return 'User';
};

export default function ActiveLoansTable({
  loans,
  showActions = true,
}: {
  loans: Loan[];
  showActions?: boolean;
}) {
  if (!loans.length) {
    return (
      <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 text-center text-sm text-swin-charcoal/60 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200/80">
        No books are currently on loan.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-swin-charcoal/10 bg-white shadow-sm shadow-swin-charcoal/5 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20">
      <div className="rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-swin-charcoal/10 dark:divide-slate-800">
            <thead className="bg-swin-ivory dark:bg-slate-900">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-swin-charcoal/70 dark:text-slate-200/80">
                <th className="px-6 py-3">Borrower</th>
                <th className="px-6 py-3">Book</th>
                <th className="px-6 py-3">Due</th>
                {showActions ? <th className="px-6 py-3 text-right">Return</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-swin-charcoal/10 bg-white text-sm dark:divide-slate-800 dark:bg-slate-900 dark:text-slate-200">
              {loans.map((loan) => {
                const overdue = isOverdue(loan);

                return (
                  <tr key={loan.id} className="transition hover:bg-swin-ivory dark:hover:bg-slate-800/80">
                    <td className="px-6 py-4">
                      <div className="font-medium text-swin-charcoal dark:text-slate-100">{loan.borrowerName ?? 'Unknown borrower'}</div>
                      <p className="text-xs capitalize text-swin-charcoal/60 dark:text-slate-400">
                        {roleLabel(loan.borrowerRole)} · ID {loan.borrowerIdentifier ?? '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-swin-charcoal dark:text-slate-100">
                        {loan.book?.title ?? 'Untitled'}
                      </div>
                      <p className="text-xs text-swin-charcoal/60 dark:text-slate-400">
                        {loan.copy?.barcode
                          ? `Barcode ${loan.copy.barcode}`
                          : loan.book?.isbn
                            ? `ISBN ${loan.book.isbn}`
                            : '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          overdue
                            ? 'bg-swin-red/10 text-swin-red dark:bg-swin-red/25 dark:text-red-100'
                            : 'bg-swin-charcoal/10 text-swin-charcoal dark:bg-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {formatDate(loan.dueAt)}
                      </span>
                    </td>
                    {showActions ? (
                      <td className="px-6 py-4 text-right">
                        <QuickCheckInButton loanId={loan.id} />
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
