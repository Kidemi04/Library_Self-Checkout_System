import React, { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
}) => {

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div
        className="fixed inset-0 bg-ink/50 dark:bg-dark-canvas/70 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-md transform overflow-hidden rounded-card
                      bg-surface-card dark:bg-dark-surface-card
                      border border-hairline dark:border-dark-hairline
                      shadow-[0_4px_16px_rgba(20,20,19,0.08)] transition-all animate-in fade-in zoom-in duration-200">

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-display-sm text-ink dark:text-on-dark">
              {title}
            </h3>

            <div className={`p-2 rounded-pill ${type === 'danger' ? 'bg-primary/10 dark:bg-dark-primary/15' : 'bg-accent-teal/15'}`}>
              <svg className={`w-6 h-6 ${type === 'danger' ? 'text-primary dark:text-dark-primary' : 'text-accent-teal'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <p className="font-sans text-body-md text-body dark:text-on-dark/80 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-hairline-soft dark:border-dark-hairline bg-surface-cream-strong dark:bg-dark-surface-strong">
          <button
            onClick={onCancel}
            className="rounded-btn border border-hairline dark:border-dark-hairline bg-surface-card dark:bg-dark-surface-card px-4 py-2 font-sans text-button text-ink dark:text-on-dark hover:bg-surface-cream-strong dark:hover:bg-dark-surface-strong transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`rounded-btn px-4 py-2 font-sans text-button text-on-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas
                       ${type === 'danger'
                          ? 'bg-primary hover:bg-primary-active active:scale-95'
                          : 'bg-ink hover:bg-ink/90 dark:bg-on-dark dark:text-ink dark:hover:bg-on-dark/90 active:scale-95'
                       }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;