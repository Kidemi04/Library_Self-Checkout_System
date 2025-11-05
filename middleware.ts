import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from './auth';
import { isDevAuthBypassed } from '@/app/lib/auth/env';
import type { DashboardRole } from '@/app/lib/auth/types';

const protectedPrefixes = [
  '/dashboard',
  '/admin',
  '/staff',
  '/user',
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

export async function middleware(request: NextRequest) {
  if (isDevAuthBypassed) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) => matchesPrefix(pathname, prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  let session;
  try {
    session = await auth(request);
  } catch (error) {
    console.error('Authentication check failed in middleware', error);
  }

  if (!session?.user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  const rawRole =
    (session.user as { role?: string | null; roles?: string[] | null })?.role ??
    ((session.user as { roles?: string[] | null })?.roles?.[0] ?? null);
  const role = resolveRole(rawRole);

  const violatedRule = roleGuardRules.find(
    ({ prefix, allowed }) => matchesPrefix(pathname, prefix) && !allowed.has(role),
  );

  if (violatedRule) {
    const fallbackPath = role === 'admin' ? '/dashboard/admin' : '/dashboard';
    return NextResponse.redirect(new URL(fallbackPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/staff/:path*',
    '/user/:path*',
    '/api/checkin/:path*',
    '/api/checkout/:path*',
    '/api/sip2/:path*',
    '/api/books/:path*',
  ],
};
