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

export type FriendStatus = 'pending' | 'accepted' | 'declined';

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendStatus;
  friend_username?: string;
  friend_display_name?: string;
  friend_avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface BookRecommendation {
  id: string;
  from_user_id: string;
  to_user_id: string;
  book_id: string;
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface FriendSuggestion {
  user_id: string;
  common_books: number;
}
