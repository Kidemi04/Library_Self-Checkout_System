'use server';

import { getSessionUser, UnauthorizedError } from '@/auth';
import {
  getDevBypassEmail,
  getDevBypassName,
  getDevBypassRole,
  getDevBypassUserId,
  isDevAuthBypassed,
} from '@/app/lib/auth/env';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import type { DashboardRole, DashboardSessionResult, DashboardUserProfile } from '@/app/lib/auth/types';

const toDashboardRole = (value: unknown): DashboardRole => {
  if (typeof value !== 'string') return 'user';
  const normalized = value.trim().toLowerCase();
  if (normalized === 'admin') return 'admin';
  if (normalized === 'staff' || normalized === 'librarian') return 'staff';
  return 'user';
};

type MyProfileRow = {
  user_id: string;
  email?: string | null;
  role?: string | null;
  display_name?: string | null;
  username?: string | null;
  faculty?: string | null;
  department?: string | null;
};

const loadProfileFromView = async (
  userId: string,
): Promise<{ profile: DashboardUserProfile | null; profileLoaded: boolean }> => {
  const supabase = getSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from('my_profile')
      .select(
        `
          user_id,
          email,
          role,
          display_name,
          username,
          faculty,
          department
        `,
      )
      .eq('user_id', userId)
      .maybeSingle<MyProfileRow>();

    if (error) {
      console.error('Failed to load profile view for user', error);
      return { profile: null, profileLoaded: false };
    }

    if (!data) {
      return { profile: null, profileLoaded: true };
    }

    const displayName = data.display_name ?? null;

    return {
      profile: {
        id: data.user_id ?? userId,
        email: data.email ?? null,
        name: displayName,
        role: toDashboardRole(data.role),
        username: data.username ?? null,
        faculty: data.faculty ?? null,
        department: data.department ?? null,
      },
      profileLoaded: true,
    };
  } catch (error) {
    console.error('Unexpected failure while reading profile view', error);
    return { profile: null, profileLoaded: false };
  }
};

export const getDashboardSession = async (): Promise<DashboardSessionResult> => {
  if (isDevAuthBypassed) {
    const role = getDevBypassRole();
    return {
      isBypassed: true,
      profileLoaded: true,
      role,
      user: {
        id: getDevBypassUserId(),
        name: getDevBypassName(),
        email: getDevBypassEmail(),
        role,
      },
    };
  }

  try {
    const baseUser = await getSessionUser();
    const { profile, profileLoaded } = await loadProfileFromView(baseUser.id);

    if (!profile) {
      return {
        isBypassed: false,
        profileLoaded,
        role: baseUser.role,
        user: {
          id: baseUser.id,
          name: null,
          email: baseUser.email,
          role: baseUser.role,
        },
      };
    }

    const role = profile.role ?? baseUser.role;
    return {
      isBypassed: false,
      profileLoaded,
      role,
      user: {
        id: profile.id,
        name: profile.name ?? null,
        email: profile.email ?? baseUser.email,
        role,
        username: profile.username,
        faculty: profile.faculty,
        department: profile.department,
      },
    };
  } catch (error) {
    if (!(error instanceof UnauthorizedError)) {
      console.error('Failed to read authentication session', error);
    }
    return {
      isBypassed: false,
      user: null,
      profileLoaded: false,
      role: 'user', // Default to user role when not authenticated
    };
  }
};

export const getDashboardUser = async (): Promise<DashboardUserProfile | null> => {
  const { user } = await getDashboardSession();
  return user;
};

