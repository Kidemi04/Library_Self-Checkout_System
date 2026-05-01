import { NextRequest, NextResponse } from 'next/server';
import { getDashboardSession } from '@/app/lib/auth/session';
import { fetchAllLoansHistory } from '@/app/lib/supabase/queries';
import { toCsv, csvResponse } from '@/app/lib/csv';
import type {
  HistoryStatusFilter,
  HistoryRange,
  HistoryLoan,
} from '@/app/lib/supabase/types';

const validStatus = (v?: string | null): HistoryStatusFilter =>
  v === 'borrowed' || v === 'returned' || v === 'overdue' ? v : 'all';

const validRange = (v?: string | null): HistoryRange =>
  v === '30d' || v === '6m' || v === 'semester' || v === 'all' || v === 'custom'
    ? v
    : '30d';

export async function GET(request: NextRequest) {
  const { user } = await getDashboardSession();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));
  if (user.role !== 'staff' && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const params = request.nextUrl.searchParams;
  const filters = {
    status: validStatus(params.get('status')),
    range: validRange(params.get('range')),
    rangeStart: params.get('rangeStart') ?? undefined,
    rangeEnd: params.get('rangeEnd') ?? undefined,
    borrowerQ: params.get('borrower') ?? undefined,
    bookQ: params.get('book') ?? undefined,
    handlerQ: params.get('handler') ?? undefined,
  };

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
