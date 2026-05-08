import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { MotionButton } from '@/app/ui/motion/MotionButton';

describe('MotionButton', () => {
  test('renders children', () => {
    render(<MotionButton variant="primary">Borrow</MotionButton>);
    expect(screen.getByRole('button', { name: 'Borrow' })).toBeInTheDocument();
  });

  test('primary variant applies primary classes', () => {
    render(<MotionButton variant="primary">A</MotionButton>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/bg-primary/);
    expect(btn.className).toMatch(/text-on-primary/);
  });

  test('secondary variant applies secondary classes', () => {
    render(<MotionButton variant="secondary">A</MotionButton>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/bg-canvas/);
    expect(btn.className).toMatch(/text-ink/);
  });

  test('icon variant uses circular shape', () => {
    render(<MotionButton variant="icon" aria-label="x">x</MotionButton>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/rounded-pill|rounded-full/);
  });

  test('destructive variant uses error color', () => {
    render(<MotionButton variant="destructive">Del</MotionButton>);
    expect(screen.getByRole('button').className).toMatch(/bg-error|text-error/);
  });

  test('disabled state when state="pending"', () => {
    render(<MotionButton variant="primary" state="pending">Save</MotionButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('onClick fires when clicked', () => {
    const onClick = jest.fn();
    render(<MotionButton variant="primary" onClick={onClick}>A</MotionButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('focus-visible class is present (a11y)', () => {
    render(<MotionButton variant="primary">A</MotionButton>);
    expect(screen.getByRole('button').className).toMatch(/focus-visible:/);
  });
});
