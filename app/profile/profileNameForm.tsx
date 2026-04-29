'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import clsx from 'clsx';
import { updateProfileNamesAction, type ProfileNameFormState } from '@/app/profile/actions';
import { PencilSquareIcon, CheckIcon } from '@heroicons/react/24/outline';

type ProfileNameFormProps = {
  displayName: string | null;
  username: string | null;
  isPrivileged: boolean;
};

const fieldClass = (isPrivileged: boolean) =>
  clsx(
    'w-full rounded-md border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2',
    'border-swin-charcoal/20 bg-white text-swin-charcoal focus:ring-swin-charcoal/30 focus:ring-offset-1 focus:ring-offset-white',
    'dark:border-white/10 dark:bg-swin-dark-surface dark:text-white dark:focus:ring-white/20 dark:focus:ring-offset-swin-dark-bg',
    isPrivileged && 'focus:ring-swin-gold/40 dark:focus:ring-swin-gold/30',
  );

const labelClass = (isPrivileged: boolean) =>
  clsx(
    'text-xs font-semibold uppercase tracking-wide',
    isPrivileged ? 'text-swin-charcoal/80 dark:text-white/70' : 'text-swin-charcoal/60',
  );

const helperClass = (isPrivileged: boolean) =>
  clsx('text-xs', isPrivileged ? 'text-white/40 dark:text-white/40' : 'text-swin-charcoal/50');

const messageClass = (state: ProfileNameFormState, isPrivileged: boolean) => {
  if (state.status === 'success') {
    return 'text-sm font-medium text-green-500';
  }
  if (state.status === 'error') {
    return 'text-sm font-medium text-rose-500';
  }
  return clsx('text-sm', isPrivileged ? 'text-white/60' : 'text-swin-charcoal/50');
};

function SubmitButton({ isPrivileged }: { isPrivileged: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={clsx(
        'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed',
        isPrivileged
          ? 'bg-gradient-to-r from-swin-gold to-amber-500 hover:from-amber-400 hover:to-swin-gold focus:ring-swin-gold'
          : 'bg-gradient-to-r from-swin-red to-orange-600 hover:from-red-600 hover:to-orange-500 focus:ring-swin-red'
      )}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Saving...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <CheckIcon className="h-4 w-4" />
          Save
        </span>
      )}
    </button>
  );
}

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
      <div className="w-full sm:w-auto">
        <SubmitButton isPrivileged={isPrivileged} />
      </div>
    </form>
  );
}
