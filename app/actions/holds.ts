'use server';

import { revalidatePath } from 'next/cache';
import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';

export type HoldActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

export async function placeHold(
  bookId: string,
): Promise<HoldActionState> {
  try {
    const session = await getDashboardSession();
    if (!session.user) {
      return {
        status: 'error',
        message: 'You must be logged in to place a hold.',
      };
    }

    const supabase = getSupabaseServerClient();

    // Check if user already has an active hold for this book
    const { data: existingHold } = await supabase
      .from('holds')
      .select()
      .eq('patron_id', session.user.id)
      .eq('book_id', bookId)
      .in('status', ['QUEUED', 'READY'])
      .single();

    if (existingHold) {
      return {
        status: 'error',
        message: 'You already have an active hold for this book.',
      };
    }

    // Place the hold
    const { error } = await supabase.from('holds').insert({
      patron_id: session.user.id,
      book_id: bookId,
      status: 'QUEUED',
      placed_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error placing hold:', error);
      return {
        status: 'error',
        message: 'Unable to place hold. Please try again.',
      };
    }

    // Add to audit log
    await supabase.from('audit_log').insert({
      event_type: 'PLACE_HOLD',
      entity: 'hold',
      entity_id: bookId,
      actor_id: session.user.id,
      actor_role: session.role,
      source: 'ui',
      success: true,
      context: { book_id: bookId },
    });

    revalidatePath('/dashboard/holds');
    return {
      status: 'success',
      message: 'Hold placed successfully.',
    };
  } catch (error) {
    console.error('Error in placeHold:', error);
    return {
      status: 'error',
      message: 'An unexpected error occurred.',
    };
  }
}

export async function cancelHold(
  holdId: string,
): Promise<HoldActionState> {
  try {
    const session = await getDashboardSession();
    if (!session.user) {
      return {
        status: 'error',
        message: 'You must be logged in to cancel a hold.',
      };
    }

    const supabase = getSupabaseServerClient();

    // Get the hold to verify ownership and current status
    const { data: hold, error: fetchError } = await supabase
      .from('holds')
      .select('status, book_id')
      .eq('id', holdId)
      .eq('patron_id', session.user.id)
      .single();

    if (fetchError || !hold) {
      return {
        status: 'error',
        message: 'Hold not found or you do not have permission to cancel it.',
      };
    }

    if (!['QUEUED', 'READY'].includes(hold.status)) {
      return {
        status: 'error',
        message: 'This hold cannot be canceled.',
      };
    }

    // Cancel the hold
    const { error } = await supabase
      .from('holds')
      .update({ status: 'CANCELED' })
      .eq('id', holdId)
      .eq('patron_id', session.user.id);

    if (error) {
      console.error('Error canceling hold:', error);
      return {
        status: 'error',
        message: 'Unable to cancel hold. Please try again.',
      };
    }

    // Add to audit log
    await supabase.from('audit_log').insert({
      event_type: 'CANCEL_HOLD',
      entity: 'hold',
      entity_id: holdId,
      actor_id: session.user.id,
      actor_role: session.role,
      source: 'ui',
      success: true,
      context: { book_id: hold.book_id },
    });

    revalidatePath('/dashboard/holds');
    return {
      status: 'success',
      message: 'Hold canceled successfully.',
    };
  } catch (error) {
    console.error('Error in cancelHold:', error);
    return {
      status: 'error',
      message: 'An unexpected error occurred.',
    };
  }
}

export async function getHolds(userId: string, includeHistory = false) {
  const supabase = getSupabaseServerClient();

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
    .eq('patron_id', userId);

  if (!includeHistory) {
    query.in('status', ['QUEUED', 'READY']);
  }

  const { data, error } = await query.order('placed_at', { ascending: false });

  if (error) {
    console.error('Error fetching holds:', error);
    throw new Error('Failed to fetch holds');
  }

  return data;
}