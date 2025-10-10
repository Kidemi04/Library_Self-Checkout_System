import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from './auth';
import { isDevAuthBypassed } from '@/app/lib/auth/env';

const protectedPaths = ['/dashboard', '/api/checkin', '/api/checkout', '/api/sip2', '/api/books'];

export async function middleware(request: NextRequest) {
  if (isDevAuthBypassed) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  let session;
  try {
    session = await auth();
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
  const isStaff = typeof rawRole === 'string' ? rawRole.trim().toLowerCase() === 'staff' : false;

  if (pathname.startsWith('/dashboard/admin') && !isStaff) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/checkin/:path*',
    '/api/checkout/:path*',
    '/api/sip2/:path*',
    '/api/books/:path*',
  ],
};
