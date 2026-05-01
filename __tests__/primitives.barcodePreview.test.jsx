import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BarcodePreview from '@/app/ui/dashboard/primitives/BarcodePreview';

describe('BarcodePreview', () => {
  it('renders single barcode', () => {
    render(<BarcodePreview barcodes={['SWI-00213']} />);
    expect(screen.getByText(/SWI-00213/)).toBeInTheDocument();
  });
  it('renders range when multiple', () => {
    render(<BarcodePreview barcodes={['SWI-00213', 'SWI-00214', 'SWI-00215']} />);
    expect(screen.getByText(/SWI-00213/)).toBeInTheDocument();
    expect(screen.getByText(/SWI-00215/)).toBeInTheDocument();
  });
  it('shows loading state when null', () => {
    render(<BarcodePreview barcodes={null} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
