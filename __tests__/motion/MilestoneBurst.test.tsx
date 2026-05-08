import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MilestoneBurst } from '@/app/ui/motion/MilestoneBurst';

jest.mock('canvas-confetti', () => ({ __esModule: true, default: jest.fn() }));

describe('MilestoneBurst', () => {
  test('does not render when trigger is false', () => {
    render(<MilestoneBurst trigger={false} milestone={undefined} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('renders with role=status when trigger=true', () => {
    render(
      <MilestoneBurst
        trigger={true}
        milestone={{ kind: 'first_borrow', display: 'Your first borrow!' }}
      />,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Your first borrow!')).toBeInTheDocument();
  });

  test('clicking overlay closes it', () => {
    const onClose = jest.fn();
    render(
      <MilestoneBurst
        trigger={true}
        milestone={{ kind: 'first_borrow', display: 'X' }}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByTestId('milestone-overlay'));
    expect(onClose).toHaveBeenCalled();
  });

  test('ESC key closes it', () => {
    const onClose = jest.fn();
    render(
      <MilestoneBurst
        trigger={true}
        milestone={{ kind: 'first_borrow', display: 'X' }}
        onClose={onClose}
      />,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  test('auto-closes after 1.2s', () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    render(
      <MilestoneBurst
        trigger={true}
        milestone={{ kind: 'first_borrow', display: 'X' }}
        onClose={onClose}
      />,
    );
    act(() => { jest.advanceTimersByTime(1300); });
    expect(onClose).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
