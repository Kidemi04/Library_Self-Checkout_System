import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlobalError from '@/app/error';

// ===== mock next/link =====
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// ===== mock heroicons =====
jest.mock('@heroicons/react/24/outline', () => ({
  ExclamationTriangleIcon: () => <svg data-testid="error-icon" />,
  ArrowPathIcon: () => <svg data-testid="retry-icon" />,
  HomeIcon: () => <svg data-testid="home-icon" />,
}));

describe('GlobalError Page', () => {
  const mockReset = jest.fn();

  beforeEach(() => {
    mockReset.mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders error message', () => {
    render(<GlobalError error={new Error('Test error')} reset={mockReset} />);

    expect(
      screen.getByText('Oops, something went wrong')
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'An unexpected error occurred. You can try again or return to the home page.'
      )
    ).toBeInTheDocument();
  });

  test('renders error digest when provided', () => {
    const error = new Error('Test error');
    error.digest = '12345';

    render(<GlobalError error={error} reset={mockReset} />);

    expect(screen.getByText(/Error ID: 12345/)).toBeInTheDocument();
  });

  test('does not render digest when not provided', () => {
    render(<GlobalError error={new Error('Test error')} reset={mockReset} />);

    expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument();
  });

  test('calls reset when clicking "Try again"', () => {
    render(<GlobalError error={new Error('Test error')} reset={mockReset} />);

    const button = screen.getByRole('button', { name: /try again/i });

    fireEvent.click(button);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  test('renders home link with correct href', () => {
    render(<GlobalError error={new Error('Test error')} reset={mockReset} />);

    const link = screen.getByRole('link', { name: /go home/i });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });

  test('renders icons', () => {
    render(<GlobalError error={new Error('Test error')} reset={mockReset} />);

    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    expect(screen.getByTestId('retry-icon')).toBeInTheDocument();
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  test('logs error to console', () => {
    const error = new Error('Console test');

    render(<GlobalError error={error} reset={mockReset} />);

    expect(console.error).toHaveBeenCalledWith('[Global Error]', error);
  });
});