import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationsFilter from '@/app/ui/dashboard/notificationFilter';

describe('NotificationsFilter', () => {
  it('renders the search input', () => {
    render(<NotificationsFilter />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('renders Apply and Reset buttons', () => {
    render(<NotificationsFilter />);
    expect(screen.getByTitle('Apply')).toBeInTheDocument();
    expect(screen.getByTitle('Reset')).toBeInTheDocument();
  });

  it('renders filter, sort, and order selects on desktop', () => {
    render(<NotificationsFilter />);
    const selects = screen.getAllByRole('combobox');
    // 6 selects total: 3 visible desktop + 3 hidden mobile overlay
    expect(selects.length).toBeGreaterThanOrEqual(3);
  });

  it('filter select has correct options', () => {
    render(<NotificationsFilter />);
    expect(screen.getAllByRole('option', { name: /all/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('option', { name: /seen/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('option', { name: /unseen/i }).length).toBeGreaterThan(0);
  });

  it('sort select includes Date, Title, Author options', () => {
    render(<NotificationsFilter />);
    expect(screen.getAllByRole('option', { name: /date/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('option', { name: /title/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('option', { name: /author/i }).length).toBeGreaterThan(0);
  });

  it('populates search input with default value', () => {
    render(<NotificationsFilter defaults={{ q: 'overdue' }} />);
    expect(screen.getByDisplayValue('overdue')).toBeInTheDocument();
  });

  it('renders as a form element', () => {
    const { container } = render(<NotificationsFilter action="/dashboard/notifications" />);
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute('method', 'get');
    expect(form).toHaveAttribute('action', '/dashboard/notifications');
  });
});
