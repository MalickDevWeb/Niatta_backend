import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect every /admin route
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      const loginUrl = new URL('/', request.nextUrl.origin);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};