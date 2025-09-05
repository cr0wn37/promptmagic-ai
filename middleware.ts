// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';
export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function middleware(req: NextRequest) {
  try {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

   
  await supabase.auth.getSession();

  
  const { data: { session } } = await supabase.auth.getSession();
  if (session && req.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  
   
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  return res;
}catch (err) {
    console.error("MIDDLEWARE ERROR:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export const config = {
 
  matcher: ["/dashboard/:path*", "/auth/:path*"], // adjust to your app’s needs
};
