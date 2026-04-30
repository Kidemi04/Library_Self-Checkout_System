import type { Loan } from '@/app/lib/supabase/types';

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

const resolveStatus = (loan: Loan) => {
  const now = Date.now();
  const dueDate = new Date(loan.dueAt);
  const dueTime = dueDate.valueOf();

  if (loan.status === 'returned') {
    const returned = loan.returnedAt ?? loan.updatedAt ?? loan.dueAt;
    return {
      label: `Returned ${formatDate(returned)}`,
      className: 'bg-success/15 text-success',
    };
  }

  if (loan.status === 'overdue' || (Number.isFinite(dueTime) && dueTime < now)) {
    return {
      label: `Overdue since ${formatDate(loan.dueAt)}`,
      className: 'bg-primary/15 text-primary',
    };
  }

  return {
    label: `Due ${formatDate(loan.dueAt)}`,
    className: 'bg-surface-cream-strong text-ink dark:bg-dark-surface-strong dark:text-on-dark',
  };
};

const roleLabel = (role: Loan['borrowerRole']) => {
  if (role === 'admin') return 'Admin';
  if (role === 'staff') return 'Staff';
  return 'User';
};

export default function RecentLoans({ loans }: { loans: Loan[] }) {
  if (!loans.length) {
    return (
      <div className="rounded-card border border-hairline bg-surface-card p-8 text-center font-sans text-body-sm text-muted dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark-soft">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-hairline bg-surface-card dark:border-dark-hairline dark:bg-dark-surface-card">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-surface-cream-strong dark:bg-dark-surface-strong">
            <tr className="text-left">
              {['Borrower', 'Book', 'Borrowed', 'Status'].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 font-sans text-caption-uppercase text-ink dark:text-on-dark"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => {
              const status = resolveStatus(loan);
              return (
                <tr
                  key={loan.id}
                  className="border-t border-hairline-soft transition hover:bg-surface-cream-strong/50 dark:border-dark-hairline dark:hover:bg-dark-surface-strong/50"
                >
                  <td className="px-6 py-4">
                    <div className="font-sans text-body-sm font-medium text-ink dark:text-on-dark">
                      {loan.borrowerName ?? 'Unknown borrower'}
                    </div>
                    <p className="font-sans text-caption capitalize text-muted dark:text-on-dark-soft">
                      {roleLabel(loan.borrowerRole)} · ID {loan.borrowerIdentifier ?? '—'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-sans text-body-sm font-medium text-ink dark:text-on-dark">
                      {loan.book?.title ?? 'Untitled'}
                    </div>
                    <p className="font-mono text-code text-muted dark:text-on-dark-soft">
                      {loan.copy?.barcode
                        ? `Barcode ${loan.copy.barcode}`
                        : loan.book?.isbn
                          ? `ISBN ${loan.book.isbn}`
                          : '—'}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-mono text-code text-muted dark:text-on-dark-soft">
                    {formatDate(loan.borrowedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-pill px-3 py-1 font-sans text-caption-uppercase ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
