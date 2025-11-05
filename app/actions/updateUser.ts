'use server';

import { getSupabaseServerClient } from '@/app/lib/supabase/server';

const normalizeRole = (value: string | undefined): 'user' | 'staff' | 'admin' | undefined => {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'admin') return 'admin';
  if (normalized === 'staff' || normalized === 'librarian') return 'staff';
  return 'user';
};

type UpdateUserInput = {
  id: string;
  display_name?: string | null;
  role?: string | null;
};

export async function updateUserAction(updateData: UpdateUserInput) {
  try {
    if (!updateData.id) {
      return { success: false, error: 'User ID is required.' };
    }

    const supabase = getSupabaseServerClient();

    const updatePayload: Record<string, unknown> = {};
    const normalizedRole = normalizeRole(updateData.role ?? undefined);

    if (normalizedRole) {
      updatePayload.role = normalizedRole;
    }

    if (Object.keys(updatePayload).length > 0) {
      const { error: updateError } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', updateData.id);

      if (updateError) {
        console.error('Failed to update user record', updateError);
        return { success: false, error: updateError.message };
      }
    }

    if (typeof updateData.display_name === 'string') {
      const profilePayload = {
        user_id: updateData.id,
        display_name: updateData.display_name,
      };

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert(profilePayload, { onConflict: 'user_id' });

      if (profileError) {
        console.error('Failed to update user profile', profileError);
        return { success: false, error: profileError.message };
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Unexpected server error while updating user', err);
    return { success: false, error: err.message ?? 'Unknown server error' };
  }
}
