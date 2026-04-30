'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import clsx from 'clsx';
import { updateProfileAction, type ProfileUpdateFormState } from '@/app/profile/actions';
import { CheckIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

type ProfileEditFormProps = {
  username: string | null;
  phone: string | null;
  preferredLanguage: string | null;
  faculty: string | null;
  department: string | null;
  bio: string | null;
  isPrivileged: boolean;
};

type Faculty = 'Computer Science' | 'Engineering' | 'Art & Design' | 'Business';

const FACULTY_LIST: Faculty[] = ['Computer Science', 'Engineering', 'Art & Design', 'Business'];

const PROGRAMS: Record<Faculty, string[]> = {
  'Computer Science': [
    'Computer Science (Artificial Intelligence)',
    'Computer Science (Cybersecurity)',
    'Computer Science (Data Science)',
    'Computer Science (Interactive Media)',
    'Software Engineering',
    'Information Systems',
    'Information Technology',
  ],
  Engineering: [
    'Engineering (Electrical and Electronic)',
    'Engineering (Mechanical)',
    'Engineering (Civil)',
    'Engineering (Chemical)',
    'Engineering (Mechatronic)',
    'Engineering (Telecommunications)',
  ],
  'Art & Design': [
    'Design (Communication Design)',
    'Design (Interior Architecture)',
    'Design (Animation)',
    'Arts (Communication and Media Studies)',
    'Arts (Digital Media)',
    'Arts (Creative Media)',
  ],
  Business: [
    'Business (Accounting)',
    'Business (Finance)',
    'Business (Marketing)',
    'Business (Management)',
    'Business (Entrepreneurship)',
    'Business (Human Resource Management)',
    'Business (International Business)',
  ],
};

const FACULTY_ICONS: Record<Faculty, string> = {
  'Computer Science': '💻',
  Engineering: '⚙️',
  'Art & Design': '🎨',
  Business: '📊',
};

const messageClass = (state: ProfileUpdateFormState) => {
  if (state.status === 'success') return 'text-sm font-medium text-green-500';
  if (state.status === 'error') return 'text-sm font-medium text-rose-500';
  return 'text-sm text-swin-charcoal/50';
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
          ? 'bg-gradient-to-r from-swin-gold to-amber-500 hover:from-amber-400 hover:to-swin-gold focus:ring-swin-gold'
          : 'bg-gradient-to-r from-swin-red to-orange-600 hover:from-red-600 hover:to-orange-500 focus:ring-swin-red',
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

  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(
    () => (FACULTY_LIST.includes(faculty as Faculty) ? (faculty as Faculty) : null),
  );
  const [selectedProgram, setSelectedProgram] = useState<string>(
    () => department ?? '',
  );

  const inputClass = clsx(
    'block w-full rounded-xl border-0 py-2.5 px-4 text-swin-charcoal ring-1 ring-inset placeholder:text-swin-charcoal/30 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all duration-300',
    'bg-white/50 backdrop-blur-sm dark:bg-white/5 dark:text-white dark:placeholder:text-white/30',
    isPrivileged
      ? 'ring-swin-gold/30 focus:ring-swin-gold dark:ring-swin-gold/20 dark:focus:ring-swin-gold/50'
      : 'ring-swin-charcoal/15 focus:ring-swin-red dark:ring-white/10 dark:focus:ring-swin-red',
  );

  const labelClass = clsx(
    'block text-xs font-semibold uppercase tracking-wide mb-1.5',
    isPrivileged ? 'text-swin-charcoal/50 dark:text-white/40' : 'text-swin-charcoal/50',
  );

  const handleFacultySelect = (f: Faculty) => {
    if (selectedFaculty === f) {
      setSelectedFaculty(null);
      setSelectedProgram('');
    } else {
      setSelectedFaculty(f);
      setSelectedProgram('');
    }
  };

  const programs = selectedFaculty ? PROGRAMS[selectedFaculty] : [];

  return (
    <form action={formAction} className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Username */}
        <div>
          <label htmlFor="username" className={labelClass}>Username</label>
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
          <label htmlFor="phone" className={labelClass}>Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={phone ?? ''}
            placeholder="012 3456 7890"
            className={inputClass}
            maxLength={20}
            pattern="[0-9\s+-]+"
          />
          <p className="mt-1.5 text-xs text-swin-charcoal/40 dark:text-white/30">Format: 012 3456 7890</p>
        </div>

        {/* Preferred Language */}
        <div className="sm:col-span-2">
          <label htmlFor="preferred_language" className={labelClass}>Preferred Language</label>
          <input
            id="preferred_language"
            name="preferred_language"
            type="text"
            defaultValue={preferredLanguage ?? ''}
            placeholder="e.g. English, Mandarin, Malay"
            className={inputClass}
            maxLength={50}
          />
        </div>
      </div>

      {/* Program Selection — students only */}
      {!isPrivileged && (
        <div className="rounded-2xl border border-swin-charcoal/10 bg-slate-50/60 p-5 dark:border-white/10 dark:bg-swin-dark-bg/40">
          <div className="mb-4 flex items-center gap-2">
            <AcademicCapIcon className="h-5 w-5 text-swin-red dark:text-swin-red/70" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/45 dark:text-white/40">
                Academic
              </p>
              <h3 className="text-sm font-semibold text-swin-charcoal dark:text-white">
                Update Your Program Selection
              </h3>
            </div>
          </div>

          {/* Hidden inputs that carry the selected values */}
          <input type="hidden" name="faculty" value={selectedFaculty ?? ''} />
          <input type="hidden" name="department" value={selectedProgram} />

          {/* Faculty grid */}
          <p className={clsx(labelClass, 'mb-2')}>Faculty</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FACULTY_LIST.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => handleFacultySelect(f)}
                className={clsx(
                  'flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-center text-xs font-semibold transition-all duration-200',
                  selectedFaculty === f
                    ? 'border-swin-red bg-swin-red/5 text-swin-red dark:border-swin-red/60 dark:bg-swin-red/10 dark:text-swin-red/80'
                    : 'border-swin-charcoal/10 bg-white text-swin-charcoal/70 hover:border-swin-red/40 hover:text-swin-red dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-swin-red/40 dark:hover:text-swin-red/70',
                )}
              >
                <span className="text-xl">{FACULTY_ICONS[f]}</span>
                <span className="leading-tight">{f}</span>
              </button>
            ))}
          </div>

          {/* Program dropdown */}
          {selectedFaculty && (
            <div className="mt-4">
              <label className={clsx(labelClass, 'mb-2')}>Bachelor Program</label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className={clsx(
                  inputClass,
                  'cursor-pointer',
                  !selectedProgram && 'text-swin-charcoal/40 dark:text-white/30',
                )}
              >
                <option value="">Select your program...</option>
                {programs.map((prog) => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            </div>
          )}

          {/* Current selection summary */}
          {(selectedFaculty || faculty) && (
            <p className="mt-3 text-[11px] text-swin-charcoal/50 dark:text-white/40">
              {selectedFaculty
                ? selectedProgram
                  ? `Selected: ${selectedProgram}`
                  : `Faculty selected — choose a program above`
                : `Currently saved: ${faculty}${department ? ` · ${department}` : ''}`}
            </p>
          )}
        </div>
      )}

      {/* Bio */}
      <div>
        <label htmlFor="bio" className={labelClass}>About</label>
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
      <div className="flex flex-col sm:flex-row-reverse gap-4 items-center justify-between pt-2 border-t border-swin-charcoal/10 dark:border-white/10">
        <SubmitButton isPrivileged={isPrivileged} />
        {state.status !== 'idle' && (
          <p className={clsx('text-sm font-medium animate-pulse', messageClass(state))}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
