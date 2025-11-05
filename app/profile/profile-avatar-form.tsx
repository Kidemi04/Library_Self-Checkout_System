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

  const buttonBaseClass = clsx(
    'flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2',
    isPrivileged
      ? 'bg-white/10 text-white hover:bg-white/20 focus:ring-white'
      : 'bg-swin-red text-white hover:bg-swin-red/90 focus:ring-swin-red'
  );

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
    <div className="relative flex-none">
      <div className="relative">
        <img
          src={defaultAvatar}
          alt={`${displayName ?? 'User'} avatar`}
          className="h-16 w-16 sm:h-24 sm:w-24 rounded-full object-cover ring-2 ring-white/10"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            'absolute bottom-0 right-0 rounded-full p-1.5 sm:p-2 shadow-lg',
            isPrivileged
              ? 'bg-slate-800 text-white hover:bg-slate-700'
              : 'bg-swin-red text-white hover:bg-swin-red/90'
          )}
        >
          <CameraIcon className="h-4 w-4" />
        </button>
      </div>

      <form onChange={handleFileChange} className="flex flex-col items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          name="avatar"
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />
        {isUploading && (
          <div className={buttonBaseClass}>
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
            <span>Uploading...</span>
          </div>
        )}
        {state.status === 'error' && (
          <p className={clsx(
            'text-sm',
            isPrivileged ? 'text-red-400' : 'text-red-600'
          )}>
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}