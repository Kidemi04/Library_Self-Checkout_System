export type FriendStatus = 'pending' | 'accepted' | 'declined';

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: FriendStatus;
  direction: 'outgoing' | 'incoming';
  createdAt: string;
  updatedAt: string;
  friend?: {
    id: string;
    email: string | null;
    profile?: {
      displayName: string | null;
      avatarUrl: string | null;
    } | null;
  } | null;
}

export interface BookRecommendation {
  id: string;
  fromUserId: string;
  toUserId: string;
  bookId: string;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  fromUser?: {
    id: string;
    email: string | null;
    profile?: {
      displayName: string | null;
      avatarUrl: string | null;
    } | null;
  } | null;
  book?: {
    id: string;
    title: string;
    author: string | null;
    coverImageUrl: string | null;
  } | null;
}

export interface FriendSuggestion {
  userId: string;
  commonBooks: number;
  user?: {
    email: string | null;
    profile?: {
      displayName: string | null;
      avatarUrl: string | null;
    } | null;
  } | null;
}
