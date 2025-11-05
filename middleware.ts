import { NextResponse } from 'next/server';
import { auth } from './auth';
import { isDevAuthBypassed } from '@/app/lib/auth/env';
import type { DashboardRole } from '@/app/lib/auth/types';

const protectedPrefixes = [
  '/dashboard',
  '/admin',
  '/staff',
  '/user',
  '/profile',
  '/api/checkin',
  '/api/checkout',
  '/api/sip2',
  '/api/books',
];

const roleGuardRules: Array<{ prefix: string; allowed: Set<DashboardRole> }> = [
  { prefix: '/admin', allowed: new Set<DashboardRole>(['admin']) },
  { prefix: '/staff', allowed: new Set<DashboardRole>(['staff', 'admin']) },
  { prefix: '/user', allowed: new Set<DashboardRole>(['user', 'staff', 'admin']) },
  { prefix: '/dashboard/admin', allowed: new Set<DashboardRole>(['admin']) },
  { prefix: '/dashboard/staff', allowed: new Set<DashboardRole>(['staff', 'admin']) },
];

const matchesPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

const resolveRole = (value: unknown): DashboardRole => {
  if (typeof value !== 'string') return 'user';
  const normalized = value.trim().toLowerCase();
  if (normalized === 'admin') return 'admin';
  if (normalized === 'staff' || normalized === 'librarian') return 'staff';
  return 'user';
};

const buildCallbackUrl = (url: { pathname: string; search: string }) => url.pathname + url.search;

export default auth((request) => {
  if (isDevAuthBypassed) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) => matchesPrefix(pathname, prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionUser = request.auth?.user as
    | { role?: string | null; roles?: string[] | null }
    | undefined;

  if (!sessionUser) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', buildCallbackUrl(request.nextUrl));
    return NextResponse.redirect(loginUrl);
  }

  const rawRole = sessionUser.role ?? sessionUser.roles?.[0] ?? null;
  const role = resolveRole(rawRole);

  const violatedRule = roleGuardRules.find(
    ({ prefix, allowed }) => matchesPrefix(pathname, prefix) && !allowed.has(role),
  );

  if (violatedRule) {
    const fallbackPath = role === 'admin' ? '/dashboard/admin' : '/dashboard';
    return NextResponse.redirect(new URL(fallbackPath, request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/staff/:path*',
    '/user/:path*',
    '/profile/:path*',
    '/api/checkin/:path*',
    '/api/checkout/:path*',
    '/api/sip2/:path*',
    '/api/books/:path*',
  ],
};
