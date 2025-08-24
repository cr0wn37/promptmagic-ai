// src/app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// This is a GET request handler because Supabase redirects with GET requests for callbacks
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code'); // Get the 'code' parameter from the URL

  if (code) {
    // Create a Supabase client configured to read and write cookies
    // This is crucial for Supabase to manage the user's session
    const supabase = createRouteHandlerClient({ cookies });

    // Exchange the 'code' for a session
    // This completes the OAuth / email confirmation / password reset flow
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      // You might want to redirect to an error page or login with an error message
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  // URL to redirect to after the sign-in/sign-up/password reset process
  // This should typically be your dashboard or a success page
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}

// You might also need a POST handler if you're using certain OAuth providers or custom flows
// export async function POST(request: Request) {
//   // ... similar logic as GET, but parse body if needed
// }
