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

export async function createCommunity(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const userId = await getCurrentUserId();
    if (!userId) return failure('Not authenticated');

    const name = formData.get('name')?.toString().trim();
    const description = formData.get('description')?.toString().trim();
    const visibility = formData.get('visibility')?.toString() || 'public';

    if (!name) return failure('Community name is required');

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
        .from('communities')
        .insert({
            name,
            slug,
            description,
            visibility,
            created_by: userId,
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error creating community', error);
        return failure('Failed to create community');
    }

    // Auto-join the creator
    await supabase.from('community_members').insert({
        community_id: data.id,
        user_id: userId,
        role: 'admin',
        status: 'accepted', // Assuming 'accepted' is the valid enum value for joined members based on typical logic, though schema said 'pending' default. Creator should be accepted.
        joined_at: new Date().toISOString(),
    });

    revalidatePath('/dashboard/communities');
    return success('Community created successfully');
}

export async function joinCommunity(communityId: string): Promise<ActionState> {
    const userId = await getCurrentUserId();
    if (!userId) return failure('Not authenticated');

    const supabase = getSupabaseServerClient();

    const { error } = await supabase.from('community_members').insert({
        community_id: communityId,
        user_id: userId,
        role: 'member',
        status: 'accepted', // For public communities, auto-accept. For private, might need 'pending'.
        joined_at: new Date().toISOString(),
    });

    if (error) {
        console.error('Error joining community', error);
        return failure('Failed to join community');
    }

    revalidatePath(`/dashboard/communities/${communityId}`);
    revalidatePath('/dashboard/communities');
    return success('Joined community');
}

export async function leaveCommunity(communityId: string): Promise<ActionState> {
    const userId = await getCurrentUserId();
    if (!userId) return failure('Not authenticated');

    const supabase = getSupabaseServerClient();

    const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error leaving community', error);
        return failure('Failed to leave community');
    }

    revalidatePath(`/dashboard/communities/${communityId}`);
    revalidatePath('/dashboard/communities');
    return success('Left community');
}

export async function createPost(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const userId = await getCurrentUserId();
    if (!userId) return failure('Not authenticated');

    const communityId = formData.get('communityId')?.toString();
    const title = formData.get('title')?.toString().trim();
    const body = formData.get('body')?.toString().trim();

    if (!communityId || !body) return failure('Message body is required');

    const supabase = getSupabaseServerClient();

    const { error } = await supabase.from('community_posts').insert({
        community_id: communityId,
        author_id: userId,
        title: title || null,
        body,
        type: 'discussion',
    });

    if (error) {
        console.error('Error creating post', error);
        return failure('Failed to create post');
    }

    revalidatePath(`/dashboard/communities/${communityId}`);
    return success('Post created');
}
