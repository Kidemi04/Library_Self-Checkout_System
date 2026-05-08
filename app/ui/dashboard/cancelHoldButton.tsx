'use client';

import { useState, useTransition } from 'react';
import ConfirmModal from '@/app/ui/dashboard/confirmModal';
import { MotionButton } from '@/app/ui/motion/MotionButton';

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
      <MotionButton
        variant="destructive"
        type="button"
        state={isPending ? 'pending' : 'idle'}
        onClick={() => setShowConfirm(true)}
        className="rounded-pill px-4 py-2 font-sans text-caption-uppercase font-semibold"
      >
        {isPending ? 'Cancelling...' : 'Cancel hold'}
      </MotionButton>

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
