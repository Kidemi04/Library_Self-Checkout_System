'use client';

import { useActionState, useState } from 'react';
import { updateUserInterest } from '@/app/dashboard/actions';
import { CheckIcon } from '@heroicons/react/24/outline';
import type { ActionState } from '@/app/dashboard/actionState';

const INTEREST_OPTIONS = [
  { id: 'computer_science', label: 'Computer Science', icon: '💻' },
  { id: 'engineering', label: 'Engineering', icon: '⚙️' },
  { id: 'business', label: 'Business', icon: '📊' },
  { id: 'design', label: 'Design', icon: '🎨' },
];

export default function InterestSetupModal() {
  const [selected, setSelected] = useState<string | null>(null);
  const initialState: ActionState = {
    status: 'idle',
    message: '',
  };

  const [state, formAction, isPending] = useActionState(
    updateUserInterest, 
    initialState
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md p-8 rounded-2xl border shadow-2xl 
                    bg-swin-ivory text-swin-black border-gray-200
                    dark:bg-swin-dark-surface dark:text-swin-ivory dark:border-swin-charcoal">
        
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
          <p className="text-sm opacity-70">
            Please select your field of interest to personalize your experience.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="interest" value={selected ?? ''} />
          
          <div className="grid grid-cols-1 gap-3">
            {INTEREST_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelected(opt.id)}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all
                  ${selected === opt.id 
                    ? 'border-swin-red bg-swin-red/5 ring-1 ring-swin-red' 
                    : 'border-transparent bg-gray-100 dark:bg-swin-dark-bg hover:bg-gray-200 dark:hover:bg-swin-charcoal'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{opt.icon}</span>
                  <span className="font-medium">{opt.label}</span>
                </div>
                {selected === opt.id && (
                  <CheckIcon className="w-5 h-5 text-swin-red" />
                )}
              </button>
            ))}
          </div>

          {state.status === 'error' && (
            <p className="text-swin-red text-xs mt-2 text-center">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={!selected || isPending}
            className="w-full mt-6 py-3 px-4 rounded-xl font-bold text-white transition-all
                     bg-swin-red hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                     shadow-lg shadow-swin-red/20"
          >
            {isPending ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}