import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignOutButton from '@/app/ui/dashboard/signOutButton';

const mockSignOut = jest.fn(() => Promise.resolve());
const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock('next-auth/react', () => ({
  signOut: (...args) => mockSignOut(...args),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe('SignOutButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the sign out button', () => {
    render(<SignOutButton />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/sign out/i);
  });

  it('renders power icon', () => {
    render(<SignOutButton />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('button is not disabled by default', () => {
    render(<SignOutButton />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('calls signOut with redirect false when clicked', async () => {
    render(<SignOutButton />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({ redirect: false });
    });
  });

  it('redirects to /login after signing out', async () => {
    render(<SignOutButton />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('applies custom className prop', () => {
    render(<SignOutButton className="custom-class" />);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
