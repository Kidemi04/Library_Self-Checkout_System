import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBar from '@/app/ui/searchBar';

// ===== MOCK next/navigation =====
const mockReplace = jest.fn();
let mockSearchParams = new URLSearchParams('query=initial');

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/dashboard',
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('use-debounce', () => ({
  useDebouncedCallback: (fn) => fn,
}));
describe('SearchBar', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  test('renders input with placeholder and default value', () => {
    render(<SearchBar placeholder="Search users..." />);

    const input = screen.getByPlaceholderText('Search users...');

    expect(input).toBeInTheDocument();
    expect(input.value).toBe('initial');
  });

  test('updates query param when typing', () => {
    render(<SearchBar placeholder="Search..." />);

    const input = screen.getByPlaceholderText('Search...');

    fireEvent.change(input, { target: { value: 'john' } });

    expect(mockReplace).toHaveBeenCalledWith('/dashboard?query=john');
  });

  test('removes query param when input is cleared', () => {
    render(<SearchBar placeholder="Search..." />);

    const input = screen.getByPlaceholderText('Search...');

    fireEvent.change(input, { target: { value: '' } });

    expect(mockReplace).toHaveBeenCalledWith('/dashboard?');
  });

  test('preserves other params when updating query', () => {
    mockSearchParams = new URLSearchParams('page=2');
  
    render(<SearchBar placeholder="Search..." />);
  
    const input = screen.getByPlaceholderText('Search...');
  
    fireEvent.change(input, { target: { value: 'test' } });
  
    expect(mockReplace).toHaveBeenCalledWith('/dashboard?page=2&query=test');
  });
});