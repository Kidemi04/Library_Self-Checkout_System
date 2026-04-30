import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/app/ui/button';

describe('Button component', () => {
  test('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  test('applies default classes', () => {
    render(<Button>Test</Button>);

    const button = screen.getByRole('button');

    expect(button).toHaveClass('flex');
    expect(button).toHaveClass('h-10');
    expect(button).toHaveClass('bg-blue-500');
    expect(button).toHaveClass('text-white');
  });

  test('merges custom className', () => {
    render(<Button className="custom-class">Test</Button>);

    const button = screen.getByRole('button');

    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('bg-blue-500'); // still keeps default
  });

  test('passes disabled state correctly', () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('disabled');
  });

  test('supports extra props (onClick)', () => {
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Click</Button>);

    const button = screen.getByRole('button');

    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});