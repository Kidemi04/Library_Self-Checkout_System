import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import type { Community, CommunityPost, CommunityMember, CommunityBookRecommendation } from '@/app/lib/supabase/types';

export async function fetchCommunities(): Promise<Community[]> {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
        .from('communities')
        .select(`
      id,
      slug,
      name,
      description,
      cover_image_url,
      visibility,
      tags,
      created_by,
      created_at,
      members:community_members(count)
    `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching communities', error);
        return [];
    }

    return (data || []).map((row: any) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        coverImageUrl: row.cover_image_url,
        visibility: row.visibility,
        tags: row.tags,
        createdBy: row.created_by,
        createdAt: row.created_at,
        memberCount: row.members?.[0]?.count || 0,
    }));
}

export async function fetchMyCommunities(userId: string): Promise<Community[]> {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
        .from('community_members')
        .select(`
      community:communities(
        id,
        slug,
        name,
        description,
        cover_image_url,
        visibility,
        tags,
        created_by,
        created_at
      )
    `)
        .eq('user_id', userId)
        .eq('status', 'approved'); // Assuming 'approved' is the status for joined members

    if (error) {
        console.error('Error fetching my communities', error);
        return [];
    }

    return (data || []).map((row: any) => ({
        id: row.community.id,
        slug: row.community.slug,
        name: row.community.name,
        description: row.community.description,
        coverImageUrl: row.community.cover_image_url,
        visibility: row.community.visibility,
        tags: row.community.tags,
        createdBy: row.community.created_by,
        createdAt: row.community.created_at,
    }));
}

export async function fetchCommunityDetails(id: string, currentUserId?: string): Promise<Community | null> {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
        .from('communities')
        .select(`
      id,
      slug,
      name,
      description,
      cover_image_url,
      visibility,
      tags,
      created_by,
      created_at,
      members:community_members(count)
    `)
        .eq('id', id)
        .single();

    if (error || !data) {
        return null;
    }

    let isMember = false;
    if (currentUserId) {
        const { data: memberData } = await supabase
            .from('community_members')
            .select('id')
            .eq('community_id', id)
            .eq('user_id', currentUserId)
            .maybeSingle();
        isMember = !!memberData;
    }

    return {
        id: data.id,
        slug: data.slug,
        name: data.name,
        description: data.description,
        coverImageUrl: data.cover_image_url,
        visibility: data.visibility,
        tags: data.tags,
        createdBy: data.created_by,
        createdAt: data.created_at,
        memberCount: data.members?.[0]?.count || 0,
        isMember,
    };
}

export async function fetchCommunityPosts(communityId: string): Promise<CommunityPost[]> {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
        .from('community_posts')
        .select(`
      id,
      community_id,
      author_id,
      type,
      title,
      body,
      pinned,
      created_at,
      author:users!community_posts_author_id_fkey(
        profile:user_profiles(
          display_name,
          avatar_url
        )
      ),
      comments:community_post_comments(count)
    `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching posts', error);
        return [];
    }

    return (data || []).map((row: any) => ({
        id: row.id,
        communityId: row.community_id,
        authorId: row.author_id,
        type: row.type,
        title: row.title,
        body: row.body,
        pinned: row.pinned,
        createdAt: row.created_at,
        author: {
            displayName: row.author?.profile?.display_name,
            avatarUrl: row.author?.profile?.avatar_url,
        },
        commentCount: row.comments?.[0]?.count || 0,
    }));
}
