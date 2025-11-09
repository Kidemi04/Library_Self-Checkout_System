'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import clsx from 'clsx';
import { updateProfileNamesAction, type ProfileNameFormState } from '@/app/profile/actions';

type ProfileNameFormProps = {
  displayName: string | null;
  username: string | null;
  isPrivileged: boolean;
};

const containerClass = (isPrivileged: boolean) =>
  clsx(
    'rounded-xl border p-4 sm:p-5',
    isPrivileged ? 'border-slate-700/70 bg-slate-900/60' : 'border-slate-200 bg-white',
  );

const fieldClass = (isPrivileged: boolean) =>
  clsx(
    'w-full rounded-md border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2',
    isPrivileged
      ? 'border-slate-700 bg-slate-900 text-slate-100 focus:ring-slate-300 focus:ring-offset-1 focus:ring-offset-slate-900'
      : 'border-slate-300 bg-white text-slate-900 focus:ring-slate-400 focus:ring-offset-1 focus:ring-offset-white',
  );

const labelClass = (isPrivileged: boolean) =>
  clsx(
    'text-xs font-semibold uppercase tracking-wide',
    isPrivileged ? 'text-slate-200' : 'text-slate-600',
  );

const helperClass = (isPrivileged: boolean) =>
  clsx('text-xs', isPrivileged ? 'text-slate-400' : 'text-slate-500');

const messageClass = (state: ProfileNameFormState, isPrivileged: boolean) => {
  if (state.status === 'success') {
    return 'text-sm font-medium text-emerald-500';
  }
  if (state.status === 'error') {
    return 'text-sm font-medium text-rose-500';
  }
  return clsx('text-sm', isPrivileged ? 'text-slate-300' : 'text-slate-500');
};

function SubmitButton({ isPrivileged }: { isPrivileged: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={clsx(
        'w-full sm:w-auto inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2',
        pending ? 'opacity-80' : '',
        isPrivileged
          ? 'bg-slate-800 text-slate-100 focus:ring-slate-500 focus:ring-offset-slate-900 hover:bg-slate-700'
          : 'bg-swin-red text-white focus:ring-swin-red hover:bg-swin-red/90',
      )}
    >
      {pending ? 'Saving…' : 'Save changes'}
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
    <form action={formAction} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={displayName ?? ''}
          placeholder="Enter your display name"
          className={clsx(
            fieldClass(isPrivileged),
            'w-full'
          )}
          maxLength={120}
        />
        {state.status !== 'idle' && (
          <p className={clsx(messageClass(state, isPrivileged), 'mt-1 text-xs')}>
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
