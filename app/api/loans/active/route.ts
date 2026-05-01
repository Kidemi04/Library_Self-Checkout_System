import { NextResponse } from 'next/server';
import { getDashboardSession } from '@/app/lib/auth/session';
import { fetchActiveLoans } from '@/app/lib/supabase/queries';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { user } = await getDashboardSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.role !== 'staff' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const loans = await fetchActiveLoans(undefined, userId);
    const now = Date.now();
    const shaped = loans.map((loan) => ({
      id: loan.id,
      title: loan.book?.title ?? 'Unknown title',
      barcode: loan.copy?.barcode ?? null,
      dueAt: loan.dueAt ?? null,
      overdue: loan.dueAt ? new Date(loan.dueAt).getTime() < now : false,
    }));
    return NextResponse.json({ loans: shaped });
  } catch (error) {
    console.error('[api/loans/active] failed', error);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
}
