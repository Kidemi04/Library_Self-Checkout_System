import { NextResponse } from 'next/server';
import { getDashboardSession } from '@/app/lib/auth/session';
import { searchPatrons } from '@/app/lib/supabase/queries';

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
  const q = searchParams.get('q') ?? '';
  const limitRaw = Number.parseInt(searchParams.get('limit') ?? '8', 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 20) : 8;

  try {
    const results = await searchPatrons(q, limit);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('[api/patrons/search] failed', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
