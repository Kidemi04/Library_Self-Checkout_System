export type BookStatus = 'available' | 'checked_out' | 'reserved' | 'maintenance';

export interface Book {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  barcode: string | null;
  classification: string | null;
  total_copies: number;
  available_copies: number;
  status: BookStatus;
  location: string | null;
  cover_image_url: string | null;
  last_transaction_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type BorrowerType = 'student' | 'staff';

export interface Loan {
  id: string;
  book_id: string;
  book_title?: string | null;
  borrower_identifier: string;
  borrower_name: string;
  borrower_type: BorrowerType;
  status: 'borrowed' | 'returned' | 'overdue';
  borrowed_at: string;
  due_at: string;
  returned_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  book?: Pick<Book, 'title' | 'barcode' | 'isbn'> | null;
}

export interface DashboardSummary {
  totalBooks: number;
  availableBooks: number;
  activeLoans: number;
  overdueLoans: number;
}
