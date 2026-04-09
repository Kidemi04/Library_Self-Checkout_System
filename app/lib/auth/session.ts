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

  const logError = (message: string, error: unknown) => {
    const errMessage =
      error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string'
        ? (error as any).message
        : String(error);
    const details =
      error && typeof error === 'object'
        ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
        : undefined;

    console.error(message, errMessage, details ? `Details: ${details}` : undefined);
  };

  try {
    const { data, error } = await supabase
      .from('MyProfile')
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
      logError('Failed to load profile view for user', error);

      if (error && typeof error === 'object' && 'code' in error && (error as any).code === 'PGRST205') {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('Users')
          .select(
            `
              id,
              email,
              role,
              UserProfile (
                username,
                display_name
              )
            `,
          )
          .eq('id', userId)
          .maybeSingle<
            MyProfileRow & {
              UserProfile?: { username?: string | null; display_name?: string | null } | null;
            }
          >();

        if (fallbackError) {
          logError('Failed to load fallback profile for user', fallbackError);
          return { profile: null, profileLoaded: false };
        }

        if (!fallbackData) {
          return { profile: null, profileLoaded: true };
        }

        return {
          profile: {
            id: fallbackData.id,
            email: fallbackData.email ?? null,
            name: fallbackData.UserProfile?.display_name ?? null,
            role: toDashboardRole(fallbackData.role),
            username: fallbackData.UserProfile?.username ?? null,
            faculty: null,
            department: null,
          },
          profileLoaded: true,
        };
      }

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
    logError('Unexpected failure while reading profile view', error);
    return { profile: null, profileLoaded: false };
  }
};

export const getDashboardSession = async (): Promise<DashboardSessionResult> => {
  if (isDevAuthBypassed) {
    return {
      isBypassed: true,
      profileLoaded: true,
      user: {
        id: getDevBypassUserId(),
        name: getDevBypassName(),
        email: getDevBypassEmail(),
        role: getDevBypassRole(),
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
        user: {
          id: baseUser.id,
          name: null,
          email: baseUser.email,
          role: baseUser.role,
        },
      };
    }

    return {
      isBypassed: false,
      profileLoaded,
      user: {
        id: profile.id,
        name: profile.name ?? null,
        email: profile.email ?? baseUser.email,
        role: profile.role ?? baseUser.role,
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
    };
  }
};

export const getDashboardUser = async (): Promise<DashboardUserProfile | null> => {
  const { user } = await getDashboardSession();
  return user;
};

