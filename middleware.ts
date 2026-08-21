import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Detect any URL with .php extension (e.g., /answerkey.php, /rrb/answerkey.php, /index.php)
  if (pathname.endsWith('.php')) {
    let cleanPath = pathname.slice(0, -4); // Strip '.php'

    // Handle index.php -> root /
    if (cleanPath === '/index' || cleanPath === '') {
      cleanPath = '/';
    }

    const targetUrl = new URL(`${cleanPath}${search}`, request.url);
    // 301 Permanent Redirect preserves SEO ranking and link equity
    return NextResponse.redirect(targetUrl, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
