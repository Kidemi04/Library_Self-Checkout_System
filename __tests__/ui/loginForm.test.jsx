import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '@/app/ui/loginForm';

jest.mock('@heroicons/react/24/outline', () => ({
  AtSymbolIcon: () => <svg data-testid="email-icon" />,
  KeyIcon: () => <svg data-testid="password-icon" />,
}));

jest.mock('@heroicons/react/20/solid', () => ({
  ArrowRightIcon: () => <svg data-testid="arrow-icon" />,
}));

jest.mock('@/app/ui/fonts', () => ({
  lusitana: {
    className: 'mock-font',
  },
}));

describe('LoginForm', () => {
  test('renders login title', () => {
    render(<LoginForm />);
    expect(
      screen.getByText(/please log in to continue/i)
    ).toBeInTheDocument();
  });

  test('renders email and password inputs', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('renders email input with correct attributes', () => {
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText(/enter your email address/i);

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toBeRequired();
  });

  test('renders password input with minLength', () => {
    render(<LoginForm />);

    const passwordInput = screen.getByPlaceholderText(/enter password/i);

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('minLength', '6');
  });

  test('renders login button', () => {
    render(<LoginForm />);

    const button = screen.getByRole('button', { name: /log in/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/log in/i);
  });

  test('renders icons', () => {
    render(<LoginForm />);

    expect(screen.getByTestId('email-icon')).toBeInTheDocument();
    expect(screen.getByTestId('password-icon')).toBeInTheDocument();
    expect(screen.getByTestId('arrow-icon')).toBeInTheDocument();
  });
});