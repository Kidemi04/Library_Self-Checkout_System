'use client';

import { useFormState, useFormStatus } from 'react-dom';
import clsx from 'clsx';
import { updateProfileNamesAction, type ProfileNameFormState } from '@/app/profile/actions';

type ProfileNameFormProps = {
  displayName: string | null;
  username: string | null;
  studentId: string | null;
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
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2',
        pending ? 'opacity-80' : '',
        isPrivileged
          ? 'bg-slate-800 text-slate-100 focus:ring-slate-500 focus:ring-offset-slate-900 hover:bg-slate-700'
          : 'bg-slate-900 text-white focus:ring-slate-500 hover:bg-slate-800',
      )}
    >
      {pending ? 'Saving…' : 'Save changes'}
    </button>
  );
}

export default function ProfileNameForm({
  displayName,
  username,
  studentId,
  isPrivileged,
}: ProfileNameFormProps) {
  const [state, formAction] = useFormState(updateProfileNamesAction, {
    status: 'idle',
    message: undefined,
  } satisfies ProfileNameFormState);

  return (
    <form action={formAction} className={containerClass(isPrivileged)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="display_name" className={labelClass(isPrivileged)}>
            Display name
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            defaultValue={displayName ?? ''}
            placeholder="Preferred name"
            className={fieldClass(isPrivileged)}
            maxLength={120}
          />
          <p className={helperClass(isPrivileged)}>Shown across the application.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className={labelClass(isPrivileged)}>
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            defaultValue={username ?? ''}
            placeholder="Unique username"
            className={fieldClass(isPrivileged)}
            maxLength={60}
          />
          <p className={helperClass(isPrivileged)}>Letters, numbers, and underscores only.</p>
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="student_id" className={labelClass(isPrivileged)}>
            Student ID
          </label>
          <input
            id="student_id"
            name="student_id"
            type="text"
            value={studentId ?? ''}
            readOnly
            className={clsx(fieldClass(isPrivileged), 'cursor-not-allowed opacity-70')}
          />
          <p className={helperClass(isPrivileged)}>Student ID can only be updated by library staff.</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className={messageClass(state, isPrivileged)}>
          {state.status === 'idle' ? 'Update your public details.' : state.message}
        </p>
        <SubmitButton isPrivileged={isPrivileged} />
      </div>
    </form>
  );
}
