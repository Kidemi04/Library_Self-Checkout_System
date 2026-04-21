'use client';

import { useState, useTransition } from 'react';
import ConfirmModal from '@/app/ui/dashboard/confirmModal';

interface Props {
  holdId: string;
  bookTitle: string;
  cancelAction: (formData: FormData) => Promise<void>;
}

export default function CancelHoldButton({ holdId, bookTitle, cancelAction }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setShowConfirm(false);
    const fd = new FormData();
    fd.set('holdId', holdId);
    startTransition(() => {
      cancelAction(fd);
    });
  };

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setShowConfirm(true)}
        className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-400 hover:text-slate-900 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
      >
        {isPending ? 'Cancelling...' : 'Cancel hold'}
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        type="danger"
        title="Cancel reservation?"
        message={`Are you sure you want to cancel your hold on "${bookTitle}"? You will lose your place in the queue and will need to place a new hold if you change your mind.`}
        confirmText="Yes, cancel hold"
        cancelText="Keep reservation"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
