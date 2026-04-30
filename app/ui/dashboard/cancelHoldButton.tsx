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
        className="rounded-pill border border-hairline dark:border-dark-hairline px-4 py-2 font-sans text-caption-uppercase font-semibold text-muted dark:text-on-dark-soft transition hover:border-primary/30 hover:text-ink dark:hover:text-on-dark disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
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
