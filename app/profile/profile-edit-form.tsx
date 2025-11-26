'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import clsx from 'clsx';
import { updateProfileAction, type ProfileUpdateFormState } from '@/app/profile/actions';

type ProfileEditFormProps = {
  username: string | null;
  phone: string | null;
  preferredLanguage: string | null;
  faculty: string | null;
  department: string | null;
  bio: string | null;
  isPrivileged: boolean;
};

const fieldClass = (isPrivileged: boolean) =>
  clsx(
    'w-full rounded-md border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2',
    'border-slate-300 bg-white text-slate-900 focus:ring-slate-400 focus:ring-offset-1 focus:ring-offset-white',
    'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-slate-300 dark:focus:ring-offset-slate-900',
    isPrivileged && 'focus:ring-slate-500 dark:focus:ring-slate-300',
  );

const labelClass = (isPrivileged: boolean) =>
  clsx(
    'block text-xs uppercase mb-1',
    isPrivileged ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500',
  );

const messageClass = (state: ProfileUpdateFormState, isPrivileged: boolean) => {
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
      ? 'bg-slate-900 text-white focus:ring-slate-500 focus:ring-offset-slate-900 hover:bg-slate-800'
      : 'bg-swin-red text-white focus:ring-swin-red hover:bg-swin-red/90',
      )}
    >
      {pending ? 'Saving…' : 'Save changes'}
    </button>
  );
}

export default function ProfileEditForm({
  username,
  phone,
  preferredLanguage,
  faculty,
  department,
  bio,
  isPrivileged,
}: ProfileEditFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, {
    status: 'idle',
    message: undefined,
  } satisfies ProfileUpdateFormState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Username */}
        <div>
          <label htmlFor="username" className={labelClass(isPrivileged)}>
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            defaultValue={username ?? ''}
            placeholder="Choose a username"
            className={fieldClass(isPrivileged)}
            maxLength={50}
          />
        </div>

        {/* Phone */}
        <div className="sm:col-span-2">
          <label htmlFor="phone" className={labelClass(isPrivileged)}>
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={phone ?? ''}
            placeholder="Your phone number"
            className={fieldClass(isPrivileged)}
            maxLength={20}
            pattern="[0-9\s+-]+"
          />
          <p
            className={clsx(
              'mt-1 text-xs',
              isPrivileged ? 'text-slate-400' : 'text-slate-500',
            )}
          >
            Format: Include your full number (e.g., 012 3456 7890).
          </p>
        </div>

        {/* Preferred Language */}
        <div>
          <label htmlFor="preferred_language" className={labelClass(isPrivileged)}>
            Preferred Language
          </label>
          <input
            id="preferred_language"
            name="preferred_language"
            type="text"
            defaultValue={preferredLanguage ?? ''}
            placeholder="Your preferred language"
            className={fieldClass(isPrivileged)}
            maxLength={50}
          />
        </div>

        {/* Faculty */}
        <div>
          <label htmlFor="faculty" className={labelClass(isPrivileged)}>
            Faculty
          </label>
          <input
            id="faculty"
            name="faculty"
            type="text"
            defaultValue={faculty ?? ''}
            placeholder="Your faculty"
            className={fieldClass(isPrivileged)}
            maxLength={100}
          />
        </div>

        {/* Department */}
        <div>
          <label htmlFor="department" className={labelClass(isPrivileged)}>
            Department
          </label>
          <input
            id="department"
            name="department"
            type="text"
            defaultValue={department ?? ''}
            placeholder="Your department"
            className={fieldClass(isPrivileged)}
            maxLength={100}
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className={labelClass(isPrivileged)}>
          About
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={bio ?? ''}
          placeholder="Write a short bio about yourself"
          className={clsx(fieldClass(isPrivileged), 'resize-none')}
          maxLength={500}
        />
      </div>

      {/* Submit and Status */}
      <div className="flex flex-col sm:flex-row-reverse gap-4 items-center justify-between">
        <SubmitButton isPrivileged={isPrivileged} />
        {state.status !== 'idle' && (
          <p className={messageClass(state, isPrivileged)}>{state.message}</p>
        )}
      </div>
    </form>
  );
}
