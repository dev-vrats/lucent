import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for Firebase session cookie
  const hasSession = req.cookies.has('__session') || req.cookies.has('firebase-auth');

  const isProtected =
    pathname.startsWith('/dashboard') || pathname.startsWith('/jobs');

  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/jobs/:path*'],
};
