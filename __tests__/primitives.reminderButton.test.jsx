import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReminderButton from '@/app/ui/dashboard/primitives/ReminderButton';

describe('ReminderButton', () => {
  it('shows "Send reminder" when never reminded', () => {
    render(<ReminderButton lastRemindedAt={null} onSend={() => {}} pending={false} />);
    expect(screen.getByRole('button', { name: /send reminder/i })).toBeEnabled();
  });
  it('disables and shows "Reminded recently" when within 24h', () => {
    const recent = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    render(<ReminderButton lastRemindedAt={recent} onSend={() => {}} pending={false} />);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/reminded recently/i)).toBeInTheDocument();
  });
  it('shows "Sending..." when pending', () => {
    render(<ReminderButton lastRemindedAt={null} onSend={() => {}} pending={true} />);
    expect(screen.getByText(/sending/i)).toBeInTheDocument();
  });
});
