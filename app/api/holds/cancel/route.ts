import { NextResponse } from 'next/server';
import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const session = await getDashboardSession();
    if (!session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { holdId } = await request.json();
    if (!holdId) {
      return NextResponse.json(
        { error: 'Hold ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Check if hold exists and belongs to user
    const { data: hold, error: fetchError } = await supabase
      .from('holds')
      .select('status, book_id')
      .eq('id', holdId)
      .eq('patron_id', session.user.id)
      .single();

    if (fetchError || !hold) {
      return NextResponse.json(
        { error: 'Hold not found or unauthorized' },
        { status: 404 }
      );
    }

    if (!['QUEUED', 'READY'].includes(hold.status)) {
      return NextResponse.json(
        { error: 'Hold cannot be canceled in its current state' },
        { status: 400 }
      );
    }

    // Cancel the hold
    const { error: updateError } = await supabase
      .from('holds')
      .update({ status: 'CANCELED' })
      .eq('id', holdId)
      .eq('patron_id', session.user.id);

    if (updateError) {
      console.error('Error canceling hold:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel hold' },
        { status: 500 }
      );
    }

    // Add audit log entry
    await supabase.from('audit_log').insert({
      event_type: 'CANCEL_HOLD',
      entity: 'hold',
      entity_id: holdId,
      actor_id: session.user.id,
      actor_role: session.role,
      source: 'ui',
      success: true,
      context: { book_id: hold.book_id }
    });

    return NextResponse.json(
      { message: 'Hold canceled successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in cancel hold API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}