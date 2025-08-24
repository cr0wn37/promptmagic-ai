// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // This refreshes the user's session and makes the session cookie available
  // to server components. This line is crucial.
  await supabase.auth.getSession();

  // Redirect authenticated users from the auth page to the dashboard
  const { data: { session } } = await supabase.auth.getSession();
  if (session && req.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Protect dashboard routes: Redirect unauthenticated users to the auth page
  // This also applies to any sub-route within /dashboard
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  return res;
}

export const config = {
  // This matcher ensures the middleware runs on all routes except static files, API routes, etc.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
