import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TabSwitch from '@/app/ui/dashboard/tabSwitch';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockTabs = [
  { label: 'Communities', value: 'communities', href: '/dashboard/social/communities' },
  { label: 'Friends', value: 'friends', href: '/dashboard/social/friends' },
];

describe('TabSwitch', () => {
  it('renders all tab labels', () => {
    render(<TabSwitch tabs={mockTabs} activeTab="communities" />);
    expect(screen.getByText('Communities')).toBeInTheDocument();
    expect(screen.getByText('Friends')).toBeInTheDocument();
  });

  it('renders correct number of tab links', () => {
    render(<TabSwitch tabs={mockTabs} activeTab="communities" />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
  });

  it('marks the active tab with aria-current="page"', () => {
    render(<TabSwitch tabs={mockTabs} activeTab="communities" />);
    const activeLink = screen.getByText('Communities').closest('a');
    expect(activeLink).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark inactive tab with aria-current', () => {
    render(<TabSwitch tabs={mockTabs} activeTab="communities" />);
    const inactiveLink = screen.getByText('Friends').closest('a');
    expect(inactiveLink).not.toHaveAttribute('aria-current');
  });

  it('links point to correct hrefs', () => {
    render(<TabSwitch tabs={mockTabs} activeTab="friends" />);
    expect(screen.getByText('Communities').closest('a')).toHaveAttribute(
      'href',
      '/dashboard/social/communities',
    );
    expect(screen.getByText('Friends').closest('a')).toHaveAttribute(
      'href',
      '/dashboard/social/friends',
    );
  });

  it('renders badge count when count > 0', () => {
    const tabsWithBadge = [
      { label: 'Friends', value: 'friends', href: '/friends', count: 3 },
      { label: 'Communities', value: 'communities', href: '/communities', count: 0 },
    ];
    render(<TabSwitch tabs={tabsWithBadge} activeTab="friends" />);
    expect(screen.getByText('3')).toBeInTheDocument();
    // count 0 should not render a badge
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('applies custom className to wrapper', () => {
    const { container } = render(
      <TabSwitch tabs={mockTabs} activeTab="communities" className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
