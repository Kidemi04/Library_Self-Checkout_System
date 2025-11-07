import { NextResponse } from 'next/server';
import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const session = await getDashboardSession();
    if (!session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Get the search parameters
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('history') === 'true';

    const query = supabase
      .from('holds')
      .select(`
        *,
        books (
          title,
          author,
          isbn
        )
      `)
      .eq('patron_id', session.user.id);

    // If not including history, only show active holds
    if (!includeHistory) {
      query.in('status', ['QUEUED', 'READY']);
    }

    // Order by placed_at date, most recent first
    query.order('placed_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching holds:', error);
      return NextResponse.json(
        { error: 'Failed to fetch holds' },
        { status: 500 }
      );
    }

    return NextResponse.json({ holds: data });
  } catch (error) {
    console.error('Unexpected error in get holds API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}