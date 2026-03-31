import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const sessionId = request.cookies.get('sessionId')?.value;
  const path = request.nextUrl.pathname;

  const isPublicRoute = 
    path === '/' || 
    path.startsWith('/login') || 
    path.startsWith('/signup') || 
    path.startsWith('/seed-data');
  
  if (!sessionId && !isPublicRoute) {
    // Attempting to access protected route without a session cookie
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
