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
        'rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition',
        disabled
          ? 'cursor-not-allowed border border-slate-200 bg-slate-50 text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white/40'
          : 'border border-swin-red bg-swin-red text-white hover:bg-swin-red/90 dark:border-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500',
      )}
    >
      {pending ? 'Sending…' : recent ? 'Reminded recently' : 'Send reminder'}
    </button>
  );
}
