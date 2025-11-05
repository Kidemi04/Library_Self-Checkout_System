import type { DashboardRole } from '@/app/lib/auth/types';

export type CopyStatus =
  | 'available'
  | 'loaned'
  | 'checked_out'
  | 'reserved'
  | 'on_hold'
  | 'maintenance'
  | 'lost'
  | 'missing';

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
  location: string | null;
  lastInventoryAt: string | null;
  loans?: CopyLoanSnapshot[];
}

export interface Book {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  classification: string | null;
  location: string | null;
  coverImageUrl: string | null;
  description?: string | null;
  publisher?: string | null;
  publicationYear?: string | null;
  tags: string[];
  copies: Copy[];
  totalCopies: number;
  availableCopies: number;
  lastTransactionAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type LoanStatus = 'borrowed' | 'returned' | 'overdue';

export interface Loan {
  id: string;
  copyId: string;
  bookId: string | null;
  borrowerId: string | null;
  borrowerIdentifier: string | null;
  borrowerName: string | null;
  borrowerEmail: string | null;
  borrowerRole: DashboardRole | null;
  handledBy: string | null;
  status: LoanStatus;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  copy?: {
    id: string;
    barcode: string;
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
