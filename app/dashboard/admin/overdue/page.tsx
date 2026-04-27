import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import { fetchOverdueLoans } from '@/app/lib/supabase/queries';
import { toCsv, csvResponse } from '@/app/lib/csv';
import AdminShell from '@/app/ui/dashboard/adminShell';
import OverdueViewer from '@/app/ui/dashboard/admin/overdueViewer';
import type { OverdueBucket } from '@/app/lib/supabase/types';

interface SearchParams {
  bucket?: string;
  q?: string;
  export?: string;
}

const validBucket = (v?: string): OverdueBucket =>
  v === '1-7' || v === '8-30' || v === '30+' ? v : 'all';

export default async function OverduePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { user } = await getDashboardSession();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/dashboard');

  const params = await searchParams;
  const bucket = validBucket(params.bucket);
  const q = params.q;

  const loans = await fetchOverdueLoans({ bucket, search: q });

  if (params.export === 'csv') {
    const headers = [
      'Loan ID', 'Title', 'Author', 'ISBN', 'Copy barcode',
      'Borrower', 'Student ID', 'Email', 'Borrowed', 'Due',
      'Days overdue', 'Last reminded at', 'Last reminded by',
    ];
    const rows = loans.map((l) => [
      l.id,
      l.book?.title ?? '',
      l.book?.author ?? '',
      l.book?.isbn ?? '',
      l.copy?.barcode ?? '',
      l.borrower?.displayName ?? '',
      l.borrower?.studentId ?? '',
      l.borrower?.email ?? '',
      new Date(l.borrowedAt),
      new Date(l.dueAt),
      l.daysOverdue,
      l.lastRemindedAt ? new Date(l.lastRemindedAt) : null,
      l.lastRemindedByName ?? '',
    ]);
    const filename = `overdue-${new Date().toISOString().slice(0, 10)}.csv`;
    return csvResponse(filename, toCsv(headers, rows));
  }

  return (
    <>
      <title>Overdue loans | Admin</title>
      <AdminShell
        titleSubtitle="Circulation · Action required"
        title="Overdue loans"
        description="Loans past their due date. Send reminders or mark as contacted."
      >
        <OverdueViewer
          loans={loans}
          initialFilters={{ bucket, q: q ?? '' }}
        />
      </AdminShell>
    </>
  );
}
