import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotFound from '@/app/notFound';

jest.mock('next/link', () => {
  return ({ children, href, ...props }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock('@heroicons/react/24/outline', () => ({
  MagnifyingGlassIcon: () => <svg data-testid="search-icon" />,
  HomeIcon: () => <svg data-testid="home-icon" />,
}));

describe('NotFound Page', () => {
  test('renders 404 text and message', () => {
    render(<NotFound />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The page you are looking for does not exist or may have been moved.'
      )
    ).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    render(<NotFound />);

    const dashboardLink = screen.getByRole('link', {
      name: /go to dashboard/i,
    });

    const browseLink = screen.getByRole('link', {
      name: /browse books/i,
    });

    expect(dashboardLink).toBeInTheDocument();
    expect(browseLink).toBeInTheDocument();
  });

  test('links have correct href', () => {
    render(<NotFound />);

    const dashboardLink = screen.getByRole('link', {
      name: /go to dashboard/i,
    });

    const browseLink = screen.getByRole('link', {
      name: /browse books/i,
    });

    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(browseLink).toHaveAttribute('href', '/dashboard/book/items');
  });

  test('icons are rendered', () => {
    render(<NotFound />);

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });
});