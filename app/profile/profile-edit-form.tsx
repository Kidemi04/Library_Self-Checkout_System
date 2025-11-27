'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import clsx from 'clsx';
import { updateProfileAction, type ProfileUpdateFormState } from '@/app/profile/actions';
import { CheckIcon } from '@heroicons/react/24/outline';

type ProfileEditFormProps = {
  username: string | null;
  phone: string | null;
  preferredLanguage: string | null;
  faculty: string | null;
  department: string | null;
  bio: string | null;
  isPrivileged: boolean;
};

function SubmitButton({ isPrivileged }: { isPrivileged: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={clsx(
        'inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed',
        isPrivileged
          ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 focus:ring-emerald-500'
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
          Save Changes
        </span>
      )}
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

  const inputClass = clsx(
    'block w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all duration-300',
    'bg-white/50 backdrop-blur-sm dark:bg-white/5 dark:text-white',
    isPrivileged
      ? 'ring-emerald-200 focus:ring-emerald-500 dark:ring-emerald-500/30'
      : 'ring-slate-200 focus:ring-swin-red dark:ring-white/10 dark:focus:ring-swin-red'
  );

  const labelClass = clsx(
    'block text-xs font-semibold uppercase tracking-wide mb-1.5',
    isPrivileged ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'
  );

  return (
    <form action={formAction} className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Username */}
        <div>
          <label htmlFor="username" className={labelClass}>
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            defaultValue={username ?? ''}
            placeholder="Choose a username"
            className={inputClass}
            maxLength={50}
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={phone ?? ''}
            placeholder="Your phone number"
            className={inputClass}
            maxLength={20}
            pattern="[0-9\s+-]+"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Format: 012 3456 7890
          </p>
        </div>

        {/* Preferred Language */}
        <div>
          <label htmlFor="preferred_language" className={labelClass}>
            Preferred Language
          </label>
          <input
            id="preferred_language"
            name="preferred_language"
            type="text"
            defaultValue={preferredLanguage ?? ''}
            placeholder="Your preferred language"
            className={inputClass}
            maxLength={50}
          />
        </div>

        {/* Faculty */}
        <div>
          <label htmlFor="faculty" className={labelClass}>
            Faculty
          </label>
          <input
            id="faculty"
            name="faculty"
            type="text"
            defaultValue={faculty ?? ''}
            placeholder="Your faculty"
            className={inputClass}
            maxLength={100}
          />
        </div>

        {/* Department */}
        <div className="sm:col-span-2">
          <label htmlFor="department" className={labelClass}>
            Department
          </label>
          <input
            id="department"
            name="department"
            type="text"
            defaultValue={department ?? ''}
            placeholder="Your department"
            className={inputClass}
            maxLength={100}
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className={labelClass}>
          About
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={bio ?? ''}
          placeholder="Write a short bio about yourself..."
          className={clsx(inputClass, 'resize-none')}
          maxLength={500}
        />
      </div>

      {/* Submit and Status */}
      <div className="flex flex-col sm:flex-row-reverse gap-4 items-center justify-between pt-2 border-t border-slate-200/50 dark:border-white/10">
        <SubmitButton isPrivileged={isPrivileged} />
        {state.status !== 'idle' && (
          <p className={clsx(
            'text-sm font-medium animate-pulse',
            state.status === 'success' ? 'text-emerald-500' : 'text-rose-500'
          )}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
