'use client';

import { useRef, useState, useActionState } from 'react';
import { ArrowPathIcon, CameraIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { updateProfileAvatar } from './actions';
import type { ProfileAvatarFormState } from './actions';

const getRandomDefaultAvatar = () => {
  // List of Dicebear styles we can use
  const styles = ['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei'];
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  const seed = Math.random().toString(36).substring(7);
  return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}`;
};

const initialState: ProfileAvatarFormState = { status: 'idle', message: '' };

export default function ProfileAvatarForm({
  avatarUrl,
  displayName,
  isPrivileged,
}: {
  avatarUrl: string | null;
  displayName: string | null;
  isPrivileged: boolean;
}) {
  const [state, formAction] = useActionState(updateProfileAvatar, initialState);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const defaultAvatar = avatarUrl || getRandomDefaultAvatar();

  const handleFileChange = async (e: React.ChangeEvent<HTMLFormElement>) => {
    setIsUploading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await formAction(formData);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative flex-none group">
      <div className="relative inline-block">
        <div className="relative h-24 w-24 sm:h-32 sm:w-32 transition-transform duration-300 group-hover:scale-105">
          <div className={clsx(
            "absolute -inset-0.5 rounded-full bg-gradient-to-br opacity-75 blur transition duration-300 group-hover:opacity-100",
            isPrivileged ? "from-emerald-400 to-cyan-300" : "from-swin-red to-orange-400"
          )} />
          <img
            src={defaultAvatar}
            alt={`${displayName ?? 'User'} avatar`}
            className="relative h-full w-full rounded-full object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl"
          />
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            'absolute bottom-0 right-0 rounded-full p-2.5 shadow-lg ring-4 ring-white dark:ring-slate-900 transition-all duration-300 hover:scale-110 active:scale-95',
            isPrivileged
              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
              : 'bg-swin-red text-white hover:bg-swin-red/90'
          )}
        >
          <CameraIcon className="h-5 w-5" />
        </button>
      </div>

      <form onChange={handleFileChange} className="flex flex-col items-center gap-2 mt-2">
        <input
          ref={fileInputRef}
          type="file"
          name="avatar"
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
        {state.status === 'error' && (
          <p className="text-xs font-medium text-red-500 mt-1 animate-pulse">
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}