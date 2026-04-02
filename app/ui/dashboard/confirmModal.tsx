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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onCancel} 
      />

      <div className="relative w-full max-w-md transform overflow-hidden rounded-xl 
                      bg-swin-ivory dark:bg-swin-dark-surface 
                      border border-gray-200 dark:border-swin-charcoal/30
                      shadow-2xl transition-all animate-in fade-in zoom-in duration-200">
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-swin-charcoal dark:text-swin-ivory">
              {title}
            </h3>

            <div className={`p-2 rounded-full ${type === 'danger' ? 'bg-swin-red/10' : 'bg-blue-500/10'}`}>
              <svg className={`w-6 h-6 ${type === 'danger' ? 'text-swin-red' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-swin-dark-bg/50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium transition-colors rounded-lg
                       text-swin-charcoal hover:bg-gray-200 
                       dark:text-gray-300 dark:hover:bg-swin-charcoal"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold text-white transition-all rounded-lg shadow-sm
                       ${type === 'danger' 
                          ? 'bg-swin-red hover:bg-red-700 active:scale-95' 
                          : 'bg-swin-charcoal dark:bg-swin-ivory dark:text-swin-black hover:opacity-90 active:scale-95'
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