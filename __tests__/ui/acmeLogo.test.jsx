import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AcmeLogo from '@/app/ui/acmeLogo';

jest.mock('@heroicons/react/24/outline', () => ({
  BuildingLibraryIcon: () => <svg data-testid="logo-icon" />,
}));

jest.mock('@/app/ui/fonts', () => ({
  lusitana: {
    className: 'mock-font',
  },
}));

describe('AcmeLogo', () => {
  test('renders logo container', () => {
    const { container } = render(<AcmeLogo />);

    expect(container.firstChild).toBeInTheDocument();
  });

  test('renders building library icon', () => {
    render(<AcmeLogo />);

    expect(screen.getByTestId('logo-icon')).toBeInTheDocument();
  });

  test('applies font class', () => {
    const { container } = render(<AcmeLogo />);

    expect(container.firstChild).toHaveClass('mock-font');
  });

  test('applies layout classes', () => {
    const { container } = render(<AcmeLogo />);

    const div = container.firstChild;

    expect(div).toHaveClass('flex');
    expect(div).toHaveClass('items-center');
    expect(div).toHaveClass('flex-row');
  });
});