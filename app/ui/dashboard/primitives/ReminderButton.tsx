'use client';

import clsx from 'clsx';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default function ReminderButton({
  lastRemindedAt,
  onSend,
  pending,
}: {
  lastRemindedAt: string | null;
  onSend: () => void;
  pending: boolean;
}) {
  const recent =
    lastRemindedAt && Date.now() - new Date(lastRemindedAt).getTime() < ONE_DAY_MS;
  const disabled = pending || !!recent;

  return (
    <button
      type="button"
      onClick={onSend}
      disabled={disabled}
      title={recent ? 'Reminded recently — wait until tomorrow to resend' : undefined}
      className={clsx(
        'inline-flex h-10 items-center rounded-btn border px-4 font-sans text-button transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas',
        disabled
          ? 'cursor-not-allowed border-transparent bg-primary-disabled text-muted'
          : 'border-hairline bg-surface-card text-ink hover:bg-surface-cream-strong dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark dark:hover:bg-dark-surface-strong',
      )}
    >
      {pending ? 'Sending…' : recent ? 'Reminded recently' : 'Send reminder'}
    </button>
  );
}
