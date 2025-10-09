import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from './auth';

const isDevelopment = process.env.NODE_ENV === 'development';

const protectedPaths = ['/dashboard', '/checkin', '/checkout', '/admin'];

export async function middleware(request: NextRequest) {
  if (isDevelopment) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const session = await auth();

  if (!session?.user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/checkin', '/checkout', '/admin'],
};
