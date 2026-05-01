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
  category: string | null;
  level?: number | null;
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

export interface Course {
  id: string;
  schemeName: string;
  schemeYear: number;
  faculty: string;
  programName: string;
  major: string | null;
  programCode: string | null;
  mqaCode: string | null;
  mqaExpiry: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}


// ─── v3.0.3 — Overdue page ─────────────────────────────────────
export type OverdueBucket = 'all' | '1-7' | '8-30' | '30+';

export type OverdueLoan = {
  id: string;
  borrowedAt: string;
  dueAt: string;
  daysOverdue: number;
  lastRemindedAt: string | null;
  lastRemindedByName: string | null;
  copy: { id: string; barcode: string | null } | null;
  book: {
    id: string;
    title: string;
    author: string | null;
    isbn: string | null;
    coverImageUrl: string | null;
  } | null;
  borrower: {
    id: string;
    displayName: string | null;
    studentId: string | null;
    email: string | null;
  } | null;
};

export type OverdueFilters = {
  bucket?: OverdueBucket;
  search?: string;
};

// ─── v3.0.3 — Loan history page ────────────────────────────────
// Reuses the existing LoanStatus ('borrowed' | 'returned' | 'overdue') from above.
// UI layer renames 'borrowed' → "Active" for admin display.
export type HistoryStatusFilter = 'all' | LoanStatus;
export type HistoryRange = 'all' | '30d' | '6m' | 'semester' | 'custom';

export type HistoryFilters = {
  status?: HistoryStatusFilter;
  range?: HistoryRange;
  rangeStart?: string;
  rangeEnd?: string;
  borrowerQ?: string;
  bookQ?: string;
  handlerQ?: string;
};

export type HistoryLoan = {
  id: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  durationDays: number;
  status: LoanStatus;
  copy: { id: string; barcode: string | null } | null;
  book: {
    id: string;
    title: string;
    author: string | null;
    isbn: string | null;
    coverImageUrl: string | null;
  } | null;
  borrower: {
    id: string;
    displayName: string | null;
    studentId: string | null;
  } | null;
  handler: {
    id: string;
    displayName: string | null;
    isSelfCheckout: boolean;
  } | null;
};

export type HistoryPage = {
  rows: HistoryLoan[];
  total: number;
  active: number;
  returned: number;
  overdue: number;
  page: number;
  pageSize: number;
};
