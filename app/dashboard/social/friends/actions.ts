'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import { auth } from '@/auth';
import { ActionState } from '@/app/dashboard/action-state';

const success = (message: string): ActionState => ({ status: 'success', message });
const failure = (message: string): ActionState => ({ status: 'error', message });

async function getCurrentUserId() {
    const session = await auth();
    return session?.user?.id;
}

export async function sendFriendRequest(targetUserId: string): Promise<ActionState> {
    const userId = await getCurrentUserId();
    if (!userId) return failure('Not authenticated');

    if (userId === targetUserId) return failure('You cannot friend yourself');

    const supabase = getSupabaseServerClient();

    // Check if already friends or requested
    const { data: existing } = await supabase
        .from('friends')
        .select('id, status')
        .or(`and(follower_id.eq.${userId},followed_id.eq.${targetUserId}),and(follower_id.eq.${targetUserId},followed_id.eq.${userId})`)
        .maybeSingle();

    if (existing) {
        if (existing.status === 'accepted') return failure('Already friends');
        if (existing.status === 'pending') return failure('Friend request already pending');
        if (existing.status === 'blocked') return failure('Unable to send request');
    }

    const { error } = await supabase.from('friends').insert({
        follower_id: userId,
        followed_id: targetUserId,
        status: 'pending'
    });

    if (error) {
        console.error('Error sending friend request', error);
        return failure('Failed to send friend request');
    }

    revalidatePath('/dashboard/friends');
    return success('Friend request sent');
}

export async function acceptFriendRequest(friendshipId: string): Promise<ActionState> {
    const userId = await getCurrentUserId();
    if (!userId) return failure('Not authenticated');

    const supabase = getSupabaseServerClient();

    // Verify the request is for this user
    const { data: request } = await supabase
        .from('friends')
        .select('followed_id')
        .eq('id', friendshipId)
        .single();

    if (!request || request.followed_id !== userId) {
        return failure('Invalid friend request');
    }

    const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted', approved_at: new Date().toISOString() })
        .eq('id', friendshipId);

    if (error) {
        console.error('Error accepting friend request', error);
        return failure('Failed to accept friend request');
    }

    revalidatePath('/dashboard/friends');
    return success('Friend request accepted');
}

export async function removeFriend(friendshipId: string): Promise<ActionState> {
    const userId = await getCurrentUserId();
    if (!userId) return failure('Not authenticated');

    const supabase = getSupabaseServerClient();

    // Verify the user is part of this friendship
    const { data: friendship } = await supabase
        .from('friends')
        .select('follower_id, followed_id')
        .eq('id', friendshipId)
        .single();

    if (!friendship || (friendship.follower_id !== userId && friendship.followed_id !== userId)) {
        return failure('Invalid operation');
    }

    const { error } = await supabase.from('friends').delete().eq('id', friendshipId);

    if (error) {
        console.error('Error removing friend', error);
        return failure('Failed to remove friend');
    }

    revalidatePath('/dashboard/friends');
    return success('Friend removed');
}
