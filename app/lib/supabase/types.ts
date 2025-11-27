import type { DashboardRole } from '@/app/lib/auth/types';

export type CopyStatus =
  | 'available'
  | 'on_loan'
  | 'lost'
  | 'damaged'
  | 'processing'
  | 'hold_shelf';

export interface BookTag {
  id: string;
  name: string;
}

export interface CopyLoanSnapshot {
  id: string;
  returnedAt: string | null;
}

export interface Copy {
  id: string;
  bookId: string;
  barcode: string;
  status: CopyStatus;
  loans?: CopyLoanSnapshot[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Book {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  classification: string | null;
  coverImageUrl: string | null;
  publisher: string | null;
  publicationYear: string | null;
  tags: string[];
  copies: Copy[];
  totalCopies: number;
  availableCopies: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export type LoanStatus = 'borrowed' | 'returned' | 'overdue';

export interface Loan {
  id: string;
  copyId: string;
  bookId: string | null;
  borrowerId: string | null;
  borrowerName: string | null;
  borrowerEmail: string | null;
  borrowerIdentifier: string | null;
  borrowerRole: DashboardRole | null;
  handledBy: string | null;
  status: LoanStatus;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  renewedCount: number;
  createdAt: string | null;
  updatedAt: string | null;
  copy?: {
    id: string;
    barcode: string | null;
  } | null;
  book?: {
    id: string;
    title: string;
    author: string | null;
    isbn: string | null;
  } | null;
  handler?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export interface DashboardSummary {
  totalBooks: number;
  availableBooks: number;
  activeLoans: number;
  overdueLoans: number;
}

export type FriendStatus = 'pending' | 'accepted' | 'blocked';

export interface Friend {
  id: string;
  followerId: string;
  followedId: string;
  status: FriendStatus;
  createdAt: string;
  friendProfile?: {
    id: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
    bio: string | null;
  } | null;
}

export type CommunityVisibility = 'public' | 'private';
export type CommunityMemberRole = 'admin' | 'moderator' | 'member';
export type CommunityMemberStatus = 'pending' | 'accepted' | 'rejected';

export interface Community {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  visibility: CommunityVisibility;
  tags: string[] | null;
  createdBy: string;
  createdAt: string;
  memberCount?: number;
  isMember?: boolean;
}

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  role: CommunityMemberRole;
  status: CommunityMemberStatus;
  joinedAt: string | null;
  profile?: {
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
}

export type CommunityPostType = 'discussion' | 'announcement';

export interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  type: CommunityPostType;
  title: string | null;
  body: string | null;
  pinned: boolean;
  createdAt: string;
  author?: {
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
  commentCount?: number;
}

export interface CommunityBookRecommendation {
  id: string;
  communityId: string;
  bookId: string;
  recommendedBy: string;
  note: string | null;
  createdAt: string;
  book?: Book | null;
  recommender?: {
    displayName: string | null;
  } | null;
  voteScore?: number;
}
