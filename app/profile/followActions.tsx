'use server';

import { revalidatePath } from 'next/cache';
import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';

type FollowActionResult = {
  status: 'success' | 'error';
  message?: string;
};

const SOCIAL_PATHS = ['/profile', '/dashboard/profile', '/profile/follows/followers', '/profile/follows/following'];

const sanitizeUserId = (value: string | undefined | null) => value?.trim() ?? '';

const revalidateSocialViews = () => {
  SOCIAL_PATHS.forEach((path) => {
    revalidatePath(path);
  });
};

export async function followUserAction(targetUserId: string): Promise<FollowActionResult> {
  const session = await getDashboardSession();
  const me = session.user;

  if (!me) {
    return { status: 'error', message: 'You must be signed in to follow other readers.' };
  }

  const sanitizedTarget = sanitizeUserId(targetUserId);
  if (!sanitizedTarget) {
    return { status: 'error', message: 'Missing person to follow.' };
  }

  if (sanitizedTarget === me.id) {
    return { status: 'error', message: 'You cannot follow yourself.' };
  }

  const supabase = getSupabaseServerClient();

  const { data: targetExists, error: targetError } = await supabase
    .from('users')
    .select('id')
    .eq('id', sanitizedTarget)
    .maybeSingle();

  if (targetError) {
    console.error('Failed to verify follow target', targetError);
    return { status: 'error', message: 'Unable to follow that user right now.' };
  }

  if (!targetExists) {
    return { status: 'error', message: 'That user could not be found.' };
  }

  const now = new Date().toISOString();

  const { error } = await supabase
    .from('friends')
    .upsert(
      {
        follower_id: me.id,
        followed_id: sanitizedTarget,
        status: 'accepted',
        approved_at: now,
        actioned_by: me.id,
      },
      { onConflict: 'follower_id,followed_id' },
    );

  if (error) {
    console.error('Failed to follow user', error);
    return { status: 'error', message: 'Unable to follow that user right now.' };
  }

  revalidateSocialViews();
  return { status: 'success', message: 'Followed user.' };
}

export async function unfollowUserAction(targetUserId: string): Promise<FollowActionResult> {
  const session = await getDashboardSession();
  const me = session.user;

  if (!me) {
    return { status: 'error', message: 'You must be signed in to unfollow someone.' };
  }

  const sanitizedTarget = sanitizeUserId(targetUserId);
  if (!sanitizedTarget) {
    return { status: 'error', message: 'Missing follow target.' };
  }

  if (sanitizedTarget === me.id) {
    return { status: 'error', message: 'You cannot unfollow yourself.' };
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('follower_id', me.id)
    .eq('followed_id', sanitizedTarget);

  if (error) {
    console.error('Failed to unfollow user', error);
    return { status: 'error', message: 'Unable to unfollow right now.' };
  }

  revalidateSocialViews();
  return { status: 'success' };
}

export async function removeFollowerAction(targetUserId: string): Promise<FollowActionResult> {
  const session = await getDashboardSession();
  const me = session.user;

  if (!me) {
    return { status: 'error', message: 'You must be signed in to remove followers.' };
  }

  const sanitizedTarget = sanitizeUserId(targetUserId);
  if (!sanitizedTarget) {
    return { status: 'error', message: 'Missing follower to remove.' };
  }

  if (sanitizedTarget === me.id) {
    return { status: 'error', message: 'You cannot remove yourself.' };
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('follower_id', sanitizedTarget)
    .eq('followed_id', me.id);

  if (error) {
    console.error('Failed to remove follower', error);
    return { status: 'error', message: 'Unable to remove follower right now.' };
  }

  revalidateSocialViews();
  return { status: 'success' };
}
