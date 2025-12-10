import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from NextAuth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Handle home route - redirect based on authentication
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Public paths that don't require authentication
  const publicPaths = [
    '/admin/login',
    '/admin/forgot-password',
    '/admin/reset-password',
  ];

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // If trying to access login while already authenticated, redirect to admin dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // If trying to access protected route without authentication, redirect to login
  if (!isPublicPath && pathname.startsWith('/admin') && !token) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*'],
};
