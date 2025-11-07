import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import type {
  Friend,
  FriendStatus,
  BookRecommendation,
  FriendSuggestion,
} from './friends';

type RawProfile = {
  display_name: string | null;
  avatar_url: string | null;
} | null;

type RawUserRef = {
  id: string;
  email: string | null;
  profile: RawProfile;
} | null;

type RawFriendRow = {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  requester?: RawUserRef;
  recipient?: RawUserRef;
};

type RawRecommendationRow = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  book_id: string;
  message: string | null;
  created_at: string;
  updated_at: string;
  from_user?: {
    id: string;
    email: string | null;
    profile?: {
      display_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
  book?: {
    id: string;
    title: string;
    author: string | null;
    cover_image_url: string | null;
  } | null;
};

type RawFriendSuggestionRow = {
  user_id: string;
  common_books: number;
};

type RawUserWithProfile = {
  id: string;
  email: string | null;
  profile?: RawProfile;
} | null;

type RawUserRow = {
  id: string;
  email: string | null;
  profile?: RawProfile;
};

const toFriendUser = (user: RawUserRef | undefined | null) =>
  user
    ? {
        id: user.id,
        email: user.email,
        profile: user.profile
          ? {
              displayName: user.profile.display_name,
              avatarUrl: user.profile.avatar_url,
            }
          : null,
      }
    : null;

const mapFriendRow = (row: RawFriendRow, currentUserId: string): Friend => {
  const isOutgoing = row.user_id === currentUserId;
  const otherUser = isOutgoing ? row.recipient : row.requester;

  return {
    id: row.id,
    userId: row.user_id,
    friendId: row.friend_id,
    status: row.status as FriendStatus,
    direction: isOutgoing ? 'outgoing' : 'incoming',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    friend: toFriendUser(otherUser),
  };
};

const mapRecommendationRow = (row: RawRecommendationRow): BookRecommendation => ({
  id: row.id,
  fromUserId: row.from_user_id,
  toUserId: row.to_user_id,
  bookId: row.book_id,
  message: row.message,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  fromUser: row.from_user
    ? {
        id: row.from_user.id,
        email: row.from_user.email,
        profile: row.from_user.profile
          ? {
              displayName: row.from_user.profile.display_name,
              avatarUrl: row.from_user.profile.avatar_url,
            }
          : null,
      }
    : null,
      book: row.book
    ? {
        id: row.book.id,
        title: row.book.title,
        author: row.book.author,
        coverImageUrl: row.book.cover_image_url,
      }
    : null,
});

const mapSuggestionRow = (
  row: RawFriendSuggestionRow,
  userRecord: RawUserWithProfile | undefined | null,
): FriendSuggestion => ({
  userId: row.user_id,
  commonBooks: row.common_books,
  user: userRecord
    ? {
        email: userRecord.email,
        profile: userRecord.profile
          ? {
              displayName: userRecord.profile.display_name,
              avatarUrl: userRecord.profile.avatar_url,
            }
          : null,
      }
    : null,
});

export async function getFriends(
  currentUserId: string,
  status?: FriendStatus,
  search?: string,
): Promise<Friend[]> {
  const supabase = getSupabaseServerClient();

  let query = supabase
    .from('friends')
    .select(
      `
        id,
        user_id,
        friend_id,
        status,
        created_at,
        updated_at,
        requester:users!friends_user_id_fkey(
          id,
          email,
          profile:user_profiles(
            display_name,
            avatar_url
          )
        ),
        recipient:users!friends_friend_id_fkey(
          id,
          email,
          profile:user_profiles(
            display_name,
            avatar_url
          )
        )
      `,
    )
    .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;

  const friends = ((data ?? []) as unknown as RawFriendRow[]).map((row) =>
    mapFriendRow(row, currentUserId),
  );

  if (!search) return friends;

  const lowered = search.toLowerCase();
  return friends.filter(
    (friend) =>
      friend.friend?.email?.toLowerCase().includes(lowered) ||
      friend.friend?.profile?.displayName?.toLowerCase().includes(lowered),
  );
}

export async function createFriendRequest(
  currentUserId: string,
  friendId: string,
): Promise<Friend> {
  const supabase = getSupabaseServerClient();

  const { data: existing, error: existingError } = await supabase
    .from('friends')
    .select('id, status')
    .or(
      `and(user_id.eq.${currentUserId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${currentUserId})`,
    )
    .maybeSingle<{ id: string; status: string }>();

  if (existingError) throw existingError;

  if (existing) {
    throw new Error('A friend relationship already exists with this user.');
  }

  const { data, error } = await supabase
    .from('friends')
    .insert({
      user_id: currentUserId,
      friend_id: friendId,
    })
    .select(
      `
        id,
        user_id,
        friend_id,
        status,
        created_at,
        updated_at,
        requester:users!friends_user_id_fkey(
          id,
          email,
          profile:user_profiles(
            display_name,
            avatar_url
          )
        ),
        recipient:users!friends_friend_id_fkey(
          id,
          email,
          profile:user_profiles(
            display_name,
            avatar_url
          )
        )
      `,
    )
    .single();

  if (error) throw error;
  return mapFriendRow(data as unknown as RawFriendRow, currentUserId);
}

export async function handleFriendRequest(
  currentUserId: string,
  requestId: string,
  action: 'accept' | 'decline',
): Promise<Friend> {
  const supabase = getSupabaseServerClient();

  const { data: existing, error: fetchError } = await supabase
    .from('friends')
    .select('id, user_id, friend_id')
    .eq('id', requestId)
    .single<{ id: string; user_id: string; friend_id: string }>();

  if (fetchError) throw fetchError;

  if (
    existing.user_id !== currentUserId &&
    existing.friend_id !== currentUserId
  ) {
    throw new Error('You are not allowed to modify this friend request.');
  }

  const nextStatus: FriendStatus = action === 'accept' ? 'accepted' : 'declined';

  const { data, error } = await supabase
    .from('friends')
    .update({ status: nextStatus })
    .eq('id', requestId)
    .select(
      `
        id,
        user_id,
        friend_id,
        status,
        created_at,
        updated_at,
        requester:users!friends_user_id_fkey(
          id,
          email,
          profile:user_profiles(
            display_name,
            avatar_url
          )
        ),
        recipient:users!friends_friend_id_fkey(
          id,
          email,
          profile:user_profiles(
            display_name,
            avatar_url
          )
        )
      `,
    )
    .single();

  if (error) throw error;
  return mapFriendRow(data as unknown as RawFriendRow, currentUserId);
}

export async function getRecommendations(
  currentUserId: string,
  received = true,
): Promise<BookRecommendation[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from('book_recommendations')
    .select(
      `
        id,
        from_user_id,
        to_user_id,
        book_id,
        message,
        created_at,
        updated_at,
        from_user:users!book_recommendations_from_user_id_fkey(
          id,
          email,
          profile:user_profiles(
            display_name,
            avatar_url
          )
        ),
        book:books(
          id,
          title,
          author,
          cover_image_url
        )
      `,
    )
    .eq(received ? 'to_user_id' : 'from_user_id', currentUserId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as RawRecommendationRow[]).map(mapRecommendationRow);
}

export async function createRecommendation(
  currentUserId: string,
  toUserId: string,
  bookId: string,
  message?: string,
): Promise<BookRecommendation> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from('book_recommendations')
    .insert({
      from_user_id: currentUserId,
      to_user_id: toUserId,
      book_id: bookId,
      message,
    })
    .select(
      `
        id,
        from_user_id,
        to_user_id,
        book_id,
        message,
        created_at,
        updated_at,
        from_user:users!book_recommendations_from_user_id_fkey(
          id,
          email,
          profile:user_profiles(
            display_name,
            avatar_url
          )
        ),
        book:books(
          id,
          title,
          author,
          cover_image_url
        )
      `,
    )
    .single();

  if (error) throw error;
  return mapRecommendationRow(data as unknown as RawRecommendationRow);
}

export async function getFriendSuggestions(
  currentUserId: string,
  limit = 5,
): Promise<FriendSuggestion[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .rpc('get_friend_suggestions', { p_user_id: currentUserId, p_limit: limit });

  if (error) throw error;

  const suggestions = (data ?? []) as RawFriendSuggestionRow[];
  if (suggestions.length === 0) {
    return [];
  }

  const userIds = suggestions.map((row) => row.user_id);

  const { data: userRows, error: userError } = await supabase
    .from('users')
    .select(
      `
        id,
        email,
        profile:user_profiles(
          display_name,
          avatar_url
        )
      `,
    )
    .in('id', userIds);

  if (userError) throw userError;

  const userMap = new Map<string, RawUserWithProfile>();
  (userRows ?? [])
    .map((row) => row as unknown as RawUserRow)
    .forEach((user) => {
      userMap.set(user.id, user);
    });

  return suggestions.map((row) => mapSuggestionRow(row, userMap.get(row.user_id)));
}

export async function deleteRecommendation(
  currentUserId: string,
  id: string,
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from('book_recommendations')
    .delete()
    .match({ id, from_user_id: currentUserId });
  if (error) throw error;
}
