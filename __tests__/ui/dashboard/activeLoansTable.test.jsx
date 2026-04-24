import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActiveLoansTable from '@/app/ui/dashboard/activeLoansTable';

// mock child component
jest.mock('@/app/ui/dashboard/quickCheckInButton', () => ({
  __esModule: true,
  default: ({ loanId }) => (
    <button data-testid={`return-${loanId}`}>Return</button>
  ),
}));

const mockLoans = [
  {
    id: '1',
    borrowerName: 'Alice',
    borrowerRole: 'staff',
    borrowerIdentifier: 'S001',
    dueAt: '2099-12-31',
    book: {
      title: 'Clean Code',
      isbn: '123',
    },
    copy: {
      barcode: 'B001',
    },
    status: 'active',
  },
];

describe('ActiveLoansTable', () => {
  test('renders empty state when no loans', () => {
    render(<ActiveLoansTable loans={[]} />);

    expect(
      screen.getByText(/no books are currently on loan/i)
    ).toBeInTheDocument();
  });

  test('renders table when loans exist', () => {
    render(<ActiveLoansTable loans={mockLoans} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Clean Code')).toBeInTheDocument();
    expect(screen.getByText(/staff/i)).toBeInTheDocument();
  });

  test('renders return button when showActions is true', () => {
    render(<ActiveLoansTable loans={mockLoans} showActions />);
  
    expect(screen.getByTestId('return-1')).toBeInTheDocument();
  });
  
  test('hides return column when showActions is false', () => {
    render(<ActiveLoansTable loans={mockLoans} showActions={false} />);

    expect(screen.queryByText('Return')).not.toBeInTheDocument();
  });

  test('renders borrower fallback values', () => {
    const brokenLoan = [
      {
        ...mockLoans[0],
        borrowerName: null,
        borrowerRole: 'user',
        borrowerIdentifier: null,
        book: null,
        copy: null,
      },
    ];

    render(<ActiveLoansTable loans={brokenLoan} />);

    expect(screen.getByText(/unknown borrower/i)).toBeInTheDocument();
    expect(screen.getByText(/user/i)).toBeInTheDocument();
    expect(screen.getByText(/untitled/i)).toBeInTheDocument();
  });
});