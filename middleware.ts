import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh the session if it exists
  const { data: { session } } = await supabase.auth.getSession();

  // If accessing a protected route and not logged in, redirect to login
  if (!session && req.nextUrl.pathname.startsWith('/foods')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/sign-in';
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Specify which routes should be protected
export const config = {
  matcher: [
    '/foods/:path*',
    '/exercise/:path*',
    '/milestones/:path*',
  ],
}; 