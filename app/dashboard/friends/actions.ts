'use server';

import { revalidatePath } from 'next/cache';
import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import {
  createFriendRequest,
  handleFriendRequest as handleRequest,
} from '@/app/lib/supabase/friend-queries';

const FRIENDS_PATH = '/dashboard/friends';

export async function addFriend(formData: FormData) {
  const [{ user }, supabase] = await Promise.all([
    getDashboardSession(),
    Promise.resolve(getSupabaseServerClient()),
  ]);

  if (!user) {
    throw new Error('You must be signed in to add friends.');
  }

  const friendId = formData.get('friendId');
  const friendIdentifier =
    formData.get('friendIdentifier') ?? formData.get('friendEmail');

  let targetUserId: string | null = null;

  if (typeof friendId === 'string' && friendId.trim().length > 0) {
    targetUserId = friendId.trim();
  } else if (typeof friendIdentifier === 'string' && friendIdentifier.trim().length > 0) {
    const identifier = friendIdentifier.trim();

    if (identifier.includes('@')) {
      const normalizedEmail = identifier.toLowerCase();
      const { data: friendUser, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle<{ id: string }>();

      if (error) {
        console.error('Failed to lookup friend by email', error);
        throw new Error('Unable to look up that email address.');
      }

      if (!friendUser) {
        throw new Error('No user exists with that email address.');
      }

      targetUserId = friendUser.id;
    } else {
      const normalizedUsername = identifier.toLowerCase();
      const { data: profileRow, error } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('username', normalizedUsername)
        .maybeSingle<{ user_id: string }>();

      if (error) {
        console.error('Failed to lookup friend by username', error);
        throw new Error('Unable to look up that username.');
      }

      if (!profileRow) {
        throw new Error('No user exists with that username.');
      }

      targetUserId = profileRow.user_id;
    }
  }

  if (!targetUserId) {
    throw new Error('Please provide a valid email or user id.');
  }

  if (targetUserId === user.id) {
    throw new Error('You cannot send a friend request to yourself.');
  }

  try {
    await createFriendRequest(user.id, targetUserId);
    revalidatePath(FRIENDS_PATH);
  } catch (error: any) {
    console.error('Failed to add friend:', error);
    throw new Error(error?.message ?? 'Failed to send friend request.');
  }
}

export async function handleFriendRequest(formData: FormData) {
  const { user } = await getDashboardSession();
  if (!user) {
    throw new Error('You must be signed in to manage friend requests.');
  }

  const requestId = formData.get('requestId');
  const action = formData.get('action');

  if (typeof requestId !== 'string' || (action !== 'accept' && action !== 'decline')) {
    throw new Error('Invalid request data.');
  }

  try {
    await handleRequest(user.id, requestId, action);
    revalidatePath(FRIENDS_PATH);
  } catch (error: any) {
    console.error('Failed to handle friend request:', error);
    throw new Error(error?.message ?? `Failed to ${action} friend request.`);
  }
}
