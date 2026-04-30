'use client';

import { useActionState } from 'react';
import clsx from 'clsx';
import { updateProfileNamesAction, type ProfileNameFormState } from '@/app/profile/actions';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

type ProfileNameFormProps = {
  displayName: string | null;
  username: string | null;
  isPrivileged: boolean;
};


export default function ProfileNameForm({
  displayName,
  username,
  isPrivileged,
}: ProfileNameFormProps) {
  const [state, formAction] = useActionState(updateProfileNamesAction, {
    status: 'idle',
    message: undefined,
  } satisfies ProfileNameFormState);

  return (
    <form action={formAction} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full">
      <div className="relative flex-1 w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <PencilSquareIcon className="h-4 w-4 text-swin-charcoal/30 dark:text-white/30" aria-hidden="true" />
        </div>
        <input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={displayName ?? ''}
          placeholder="Display Name"
          className={clsx(
            'block w-full rounded-xl border-0 py-2.5 pl-10 pr-4 text-swin-charcoal ring-1 ring-inset placeholder:text-swin-charcoal/30 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all duration-300',
            'bg-white/50 backdrop-blur-sm dark:bg-white/5 dark:text-white dark:placeholder:text-white/30',
            isPrivileged
              ? 'ring-swin-gold/30 focus:ring-swin-gold dark:ring-swin-gold/20 dark:focus:ring-swin-gold/50'
              : 'ring-swin-charcoal/15 focus:ring-swin-red dark:ring-white/10 dark:focus:ring-swin-red'
          )}
          maxLength={120}
        />
        {state.status !== 'idle' && (
          <p className={clsx(
            'absolute -bottom-5 left-0 text-xs font-medium',
            state.status === 'success' ? 'text-green-500' : 'text-rose-500'
          )}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
