import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import IsbnLookupBox from '@/app/ui/dashboard/primitives/IsbnLookupBox';

describe('IsbnLookupBox', () => {
  it('calls onLookup when Lookup pressed', () => {
    const onLookup = jest.fn();
    render(<IsbnLookupBox value="9781234567890" onChange={() => {}} onLookup={onLookup} onScan={() => {}} pending={false} />);
    fireEvent.click(screen.getByRole('button', { name: /^lookup$/i }));
    expect(onLookup).toHaveBeenCalled();
  });
  it('disables Lookup when ISBN is empty', () => {
    render(<IsbnLookupBox value="" onChange={() => {}} onLookup={() => {}} onScan={() => {}} pending={false} />);
    expect(screen.getByRole('button', { name: /^lookup$/i })).toBeDisabled();
  });
  it('shows "Looking up..." when pending', () => {
    render(<IsbnLookupBox value="9781234567890" onChange={() => {}} onLookup={() => {}} onScan={() => {}} pending={true} />);
    expect(screen.getByText(/looking up/i)).toBeInTheDocument();
  });
});
