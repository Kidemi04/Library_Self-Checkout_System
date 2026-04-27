import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import { fetchAllLoansHistory } from '@/app/lib/supabase/queries';
import { toCsv, csvResponse } from '@/app/lib/csv';
import AdminShell from '@/app/ui/dashboard/adminShell';
import HistoryViewer from '@/app/ui/dashboard/staff/historyViewer';
import type {
  HistoryStatusFilter,
  HistoryRange,
  HistoryLoan,
} from '@/app/lib/supabase/types';

interface SearchParams {
  status?: string;
  range?: string;
  rangeStart?: string;
  rangeEnd?: string;
  borrower?: string;
  book?: string;
  handler?: string;
  page?: string;
  export?: string;
}

const validStatus = (v?: string): HistoryStatusFilter =>
  v === 'borrowed' || v === 'returned' || v === 'overdue' ? v : 'all';

const validRange = (v?: string): HistoryRange =>
  v === '30d' || v === '6m' || v === 'semester' || v === 'all' || v === 'custom'
    ? v
    : '30d';

export default async function LoanHistoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { user } = await getDashboardSession();
  if (!user) redirect('/login');
  if (user.role !== 'staff' && user.role !== 'admin') redirect('/dashboard');

  const params = await searchParams;
  const filters = {
    status: validStatus(params.status),
    range: validRange(params.range),
    rangeStart: params.rangeStart,
    rangeEnd: params.rangeEnd,
    borrowerQ: params.borrower,
    bookQ: params.book,
    handlerQ: params.handler,
  };
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  if (params.export === 'csv') {
    // fetchAllLoansHistory uses zero-based paging; loop p from 1 and pass p-1.
    const allRows: HistoryLoan[] = [];
    for (let p = 1; p <= 200; p++) {
      const chunk = await fetchAllLoansHistory(filters, p - 1);
      allRows.push(...chunk.rows);
      if (chunk.rows.length < chunk.pageSize) break;
      if (allRows.length >= 10000) break;
    }
    const headers = [
      'Loan ID', 'Title', 'Author', 'ISBN', 'Copy barcode',
      'Borrower', 'Student ID', 'Borrowed', 'Due', 'Returned',
      'Duration days', 'Status', 'Handler',
    ];
    const csvRows = allRows.slice(0, 10000).map((r) => [
      r.id,
      r.book?.title ?? '',
      r.book?.author ?? '',
      r.book?.isbn ?? '',
      r.copy?.barcode ?? '',
      r.borrower?.displayName ?? '',
      r.borrower?.studentId ?? '',
      new Date(r.borrowedAt),
      new Date(r.dueAt),
      r.returnedAt ? new Date(r.returnedAt) : null,
      r.durationDays,
      r.status === 'borrowed' ? 'Active' : (r.status[0].toUpperCase() + r.status.slice(1)),
      r.handler?.isSelfCheckout ? 'Self-checkout' : (r.handler?.displayName ?? ''),
    ]);
    const filename = `loan-history-${new Date().toISOString().slice(0, 10)}.csv`;
    return csvResponse(filename, toCsv(headers, csvRows));
  }

  // fetchAllLoansHistory uses zero-based paging; UI uses 1-based.
  const result = await fetchAllLoansHistory(filters, page - 1);

  return (
    <>
      <title>Loan history | Library</title>
      <AdminShell
        titleSubtitle="Circulation · Archive"
        title="Loan history"
        description="All borrowing records. Filter, search, and export."
      >
        <HistoryViewer result={result} initialFilters={{ ...filters, page }} />
      </AdminShell>
    </>
  );
}
