'use server';

import { revalidatePath } from 'next/cache';
import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';

export type ProfileNameFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

export async function updateProfileNamesAction(
  _prevState: ProfileNameFormState,
  formData: FormData,
): Promise<ProfileNameFormState> {
  try {
    const session = await getDashboardSession();
    const user = session.user;

    if (!user) {
      return { status: 'error', message: 'You must be signed in to update your profile.' };
    }

    const displayNameInput = formData.get('display_name');
    const usernameInput = formData.get('username');

    const displayName =
      typeof displayNameInput === 'string' ? displayNameInput.trim() : '';
    const username =
      typeof usernameInput === 'string' ? usernameInput.trim() : '';

    if (displayName.length > 120) {
      return {
        status: 'error',
        message: 'Display name is too long. Please keep it under 120 characters.',
      };
    }

    if (username.length > 60) {
      return {
        status: 'error',
        message: 'Username is too long. Please keep it under 60 characters.',
      };
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          user_id: user.id,
          display_name: displayName.length > 0 ? displayName : null,
          username: username.length > 0 ? username : null,
        },
        { onConflict: 'user_id' },
      );

    if (error) {
      if (error.code === '23505') {
        return {
          status: 'error',
          message: 'That username is already taken. Please choose another one.',
        };
      }

      console.error('Failed to update profile names', error);
      return {
        status: 'error',
        message: 'Unable to update your profile right now. Please try again later.',
      };
    }

    revalidatePath('/profile');
    revalidatePath('/dashboard/profile');

    return {
      status: 'success',
      message: 'Profile details updated.',
    };
  } catch (error) {
    console.error('Unexpected error updating profile names', error);
    return {
      status: 'error',
      message: 'An unexpected error occurred.',
    };
  }
}
