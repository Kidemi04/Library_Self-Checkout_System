import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import type { Friend } from '@/app/lib/supabase/types';

export async function fetchFriends(userId: string): Promise<Friend[]> {
    const supabase = getSupabaseServerClient();

    // Fetch where user is follower
    const { data: following, error: followingError } = await supabase
        .from('friends')
        .select(`
      id,
      follower_id,
      followed_id,
      status,
      created_at,
      friend:users!friends_friend_id_fkey(
        id,
        email,
        profile:user_profiles(
          display_name,
          avatar_url,
          bio
        )
      )
    `)
        .eq('follower_id', userId)
        .eq('status', 'accepted');

    if (followingError) {
        console.error('Error fetching following', followingError);
        return [];
    }

    // Fetch where user is followed
    const { data: followers, error: followersError } = await supabase
        .from('friends')
        .select(`
      id,
      follower_id,
      followed_id,
      status,
      created_at,
      friend:users!friends_user_id_fkey(
        id,
        email,
        profile:user_profiles(
          display_name,
          avatar_url,
          bio
        )
      )
    `)
        .eq('followed_id', userId)
        .eq('status', 'accepted');

    if (followersError) {
        console.error('Error fetching followers', followersError);
        return [];
    }

    const mapFriend = (row: any, isFollower: boolean): Friend => {
        const profile = row.friend?.profile;
        return {
            id: row.id,
            followerId: row.follower_id,
            followedId: row.followed_id,
            status: row.status,
            createdAt: row.created_at,
            friendProfile: {
                id: row.friend?.id,
                name: profile?.display_name ?? row.friend?.email,
                email: row.friend?.email,
                avatarUrl: profile?.avatar_url,
                bio: profile?.bio,
            },
        };
    };

    const followingList = (following || []).map(f => mapFriend(f, false));
    const followersList = (followers || []).map(f => mapFriend(f, true));

    // Combine and deduplicate (though in a pure friend system, usually it's one record, but here it seems directional 'follower_id', 'followed_id' might imply twitter style, but 'friends' table name implies bidirectional. 
    // The schema has 'follower_id' and 'followed_id'. 
    // If it's a mutual friend system, we usually check both directions.
    // For now, let's return all unique connections.

    const allFriends = [...followingList, ...followersList];
    // Deduplicate by friendProfile.id
    const uniqueFriends = Array.from(new Map(allFriends.map(item => [item.friendProfile?.id, item])).values());

    return uniqueFriends as Friend[];
}

export async function fetchFriendRequests(userId: string): Promise<Friend[]> {
    const supabase = getSupabaseServerClient();

    // Incoming requests: user is 'followed_id' and status is 'pending'
    const { data, error } = await supabase
        .from('friends')
        .select(`
      id,
      follower_id,
      followed_id,
      status,
      created_at,
      friend:users!friends_user_id_fkey(
        id,
        email,
        profile:user_profiles(
          display_name,
          avatar_url,
          bio
        )
      )
    `)
        .eq('followed_id', userId)
        .eq('status', 'pending');

    if (error) {
        console.error('Error fetching friend requests', error);
        return [];
    }

    return (data || []).map((row: any) => ({
        id: row.id,
        followerId: row.follower_id,
        followedId: row.followed_id,
        status: row.status,
        createdAt: row.created_at,
        friendProfile: {
            id: row.friend?.id,
            name: row.friend?.profile?.display_name ?? row.friend?.email,
            email: row.friend?.email,
            avatarUrl: row.friend?.profile?.avatar_url,
            bio: row.friend?.profile?.bio,
        },
    }));
}

export async function searchUsers(query: string, currentUserId: string) {
    const supabase = getSupabaseServerClient();

    if (!query || query.length < 2) return [];

    const { data, error } = await supabase
        .from('user_profiles')
        .select(`
      user_id,
      display_name,
      avatar_url,
      bio,
      user:users(email)
    `)
        .or(`display_name.ilike.%${query}%,student_id.ilike.%${query}%`)
        .neq('user_id', currentUserId)
        .limit(10);

    if (error) {
        console.error('Error searching users', error);
        return [];
    }

    // Check friendship status for each
    const results = await Promise.all((data || []).map(async (profile: any) => {
        // Check if there is a friendship record
        const { data: friendship } = await supabase
            .from('friends')
            .select('status, follower_id, followed_id')
            .or(`and(follower_id.eq.${currentUserId},followed_id.eq.${profile.user_id}),and(follower_id.eq.${profile.user_id},followed_id.eq.${currentUserId})`)
            .maybeSingle();

        return {
            id: profile.user_id,
            name: profile.display_name ?? profile.user?.email,
            avatarUrl: profile.avatar_url,
            bio: profile.bio,
            friendshipStatus: friendship ? friendship.status : 'none',
            isSender: friendship?.follower_id === currentUserId
        };
    }));

    return results;
}

export async function fetchSuggestedUsers(currentUserId: string) {
    const supabase = getSupabaseServerClient();

    // Get IDs of people already friends or requested
    const { data: existing } = await supabase
        .from('friends')
        .select('follower_id, followed_id')
        .or(`follower_id.eq.${currentUserId},followed_id.eq.${currentUserId}`);

    const excludedIds = new Set([currentUserId]);
    existing?.forEach(f => {
        excludedIds.add(f.follower_id);
        excludedIds.add(f.followed_id);
    });

    // Fetch random users (limit 20)
    const { data: profiles } = await supabase
        .from('user_profiles')
        .select(`
            user_id,
            display_name,
            avatar_url,
            bio,
            user:users(email)
        `)
        .limit(20);

    if (!profiles) return [];

    // Filter out excludedIds and map to result format
    const candidates = profiles.filter(p => !excludedIds.has(p.user_id)).slice(0, 10);

    return candidates.map(p => {
        const userAny = p.user as any;
        const userEmail = Array.isArray(userAny) ? userAny[0]?.email : userAny?.email;
        return {
            id: p.user_id,
            name: p.display_name ?? userEmail,
            avatarUrl: p.avatar_url,
            bio: p.bio,
            friendshipStatus: 'none' as const,
            isSender: false
        };
    });
}
