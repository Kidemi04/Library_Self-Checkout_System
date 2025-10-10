'use server';

import type { Session } from 'next-auth';
import { auth } from '@/auth';
import {
  getDevBypassEmail,
  getDevBypassName,
  getDevBypassRole,
  getDevBypassUserId,
  isDevAuthBypassed,
} from '@/app/lib/auth/env';
import type { DashboardSessionResult, DashboardUserProfile, DashboardRole } from '@/app/lib/auth/types';

const toDashboardRole = (value: unknown): DashboardRole => {
  if (typeof value !== 'string') return 'student';
  return value.trim().toLowerCase() === 'staff' ? 'staff' : 'student';
};

const normalizeSessionUser = (session: Session | null): DashboardUserProfile | null => {
  if (!session?.user) return null;
  const user = session.user as Session['user'] & {
    role?: string | null;
    roles?: string[] | null;
    staff?: boolean;
  };

  const roleFromUser =
    typeof user.role === 'string'
      ? user.role
      : Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles[0]
        : user.staff
          ? 'staff'
          : null;

  return {
    id: (user as { id?: string }).id ?? '',
    name: user.name ?? null,
    email: user.email ?? null,
    role: toDashboardRole(roleFromUser),
  };
};

export const getDashboardSession = async (): Promise<DashboardSessionResult> => {
  if (isDevAuthBypassed) {
    return {
      isBypassed: true,
      user: {
        id: getDevBypassUserId(),
        name: getDevBypassName(),
        email: getDevBypassEmail(),
        role: getDevBypassRole(),
      },
    };
  }

  try {
    const session = await auth();
    return {
      isBypassed: false,
      user: normalizeSessionUser(session),
    };
  } catch (error) {
    console.error('Failed to read authentication session', error);
    return {
      isBypassed: false,
      user: null,
    };
  }
};

export const getDashboardUser = async (): Promise<DashboardUserProfile | null> => {
  const { user } = await getDashboardSession();
  return user;
};
