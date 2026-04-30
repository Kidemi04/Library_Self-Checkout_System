import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminShell from '@/app/ui/dashboard/adminShell';

// mock next/link
jest.mock('next/link', () => {
  return ({ href, children }) => <a href={href}>{children}</a>;
});

// mock heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  BellIcon: () => <svg data-testid="bell-icon" />,
}));

describe('AdminShell', () => {
  const defaultProps = {
    titleSubtitle: 'Dashboard',
    title: 'Admin Panel',
    description: 'Manage everything here',
    primaryAction: <button>Action</button>,
  };

  test('renders title subtitle and title', () => {
    render(
      <AdminShell {...defaultProps}>
        <div>Content</div>
      </AdminShell>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  test('renders description when provided', () => {
    render(
      <AdminShell {...defaultProps}>
        <div>Content</div>
      </AdminShell>
    );

    expect(screen.getByText('Manage everything here')).toBeInTheDocument();
  });

  test('does not render description when missing', () => {
    const props = { ...defaultProps, description: undefined };

    render(
      <AdminShell {...props}>
        <div>Content</div>
      </AdminShell>
    );

    expect(
      screen.queryByText('Manage everything here')
    ).not.toBeInTheDocument();
  });

  test('renders children content', () => {
    render(
      <AdminShell {...defaultProps}>
        <div data-testid="child">Child Content</div>
      </AdminShell>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('renders primary action', () => {
    render(
      <AdminShell {...defaultProps}>
        <div>Content</div>
      </AdminShell>
    );

    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  test('renders notification bell link', () => {
    render(
      <AdminShell {...defaultProps}>
        <div>Content</div>
      </AdminShell>
    );

    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/dashboard/notifications'
    );
  });
});