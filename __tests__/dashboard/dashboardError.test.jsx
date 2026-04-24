import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardError from '@/app/dashboard/error';

// ===== mock heroicons =====
jest.mock('@heroicons/react/24/outline', () => ({
  ExclamationTriangleIcon: () => <svg data-testid="error-icon" />,
  ArrowPathIcon: () => <svg data-testid="retry-icon" />,
}));

describe('DashboardError', () => {
  const mockReset = jest.fn();

  beforeEach(() => {
    mockReset.mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders error message', () => {
    render(<DashboardError error={new Error('Test error')} reset={mockReset} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    expect(
      screen.getByText(
        'An unexpected error occurred while loading this page. Please try again.'
      )
    ).toBeInTheDocument();
  });

  test('renders digest when provided', () => {
    const error = new Error('Test error');
    error.digest = 'abc123';

    render(<DashboardError error={error} reset={mockReset} />);

    expect(screen.getByText(/Error ID: abc123/)).toBeInTheDocument();
  });

  test('does not render digest when not provided', () => {
    render(<DashboardError error={new Error('Test error')} reset={mockReset} />);

    expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument();
  });

  test('calls reset when clicking button', () => {
    render(<DashboardError error={new Error('Test error')} reset={mockReset} />);

    const button = screen.getByRole('button', { name: /try again/i });

    fireEvent.click(button);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  test('renders icons', () => {
    render(<DashboardError error={new Error('Test error')} reset={mockReset} />);

    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    expect(screen.getByTestId('retry-icon')).toBeInTheDocument();
  });

  test('logs error to console', () => {
    const error = new Error('Console test');

    render(<DashboardError error={error} reset={mockReset} />);

    expect(console.error).toHaveBeenCalledWith('[Dashboard Error]', error);
  });
});