import type { DashboardRole } from '@/app/lib/auth/types';

const TRUTHY_VALUES = new Set(['1', 'true', 'yes', 'on']);

export const parseEnvBoolean = (value: string | undefined) => {
  if (!value) return false;
  return TRUTHY_VALUES.has(value.trim().toLowerCase());
};

export const isDevelopment = process.env.NODE_ENV === 'development';

export const isDevAuthBypassed = isDevelopment && parseEnvBoolean(process.env.DEV_BYPASS_AUTH);

export const getDevBypassRole = (): DashboardRole => {
  const role = (process.env.DEV_BYPASS_ROLE ?? '').trim().toLowerCase();
  return role === 'staff' ? 'staff' : 'student';
};

export const getDevBypassEmail = () =>
  process.env.DEV_BYPASS_EMAIL ?? 'library.dev@example.com';

export const getDevBypassName = () => process.env.DEV_BYPASS_NAME ?? 'Library Developer';

export const getDevBypassUserId = () => process.env.DEV_BYPASS_USER_ID ?? 'dev-user';
