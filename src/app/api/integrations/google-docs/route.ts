import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const session_id = url.searchParams.get('session_id');

  if (!code || !session_id) {
    return NextResponse.json({ error: 'Authorization code or session ID missing' }, { status: 400 });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const supabase = createRouteHandlerClient({ cookies: () => cookies() });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { error } = await supabase
      .from('user_tokens')
      .upsert([{
        user_id: user.id,
        provider: 'google-docs',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        created_at: new Date().toISOString(),
      }], { onConflict: 'user_id,provider' });

    if (error) {
      console.error('Error saving Google tokens:', error);
      return NextResponse.json({ error: 'Failed to save tokens' }, { status: 500 });
    }

    const redirectUrl = new URL('/dashboard', request.url);
    redirectUrl.searchParams.set('google_auth_success', 'true');
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error during Google OAuth:', error);
    return NextResponse.json({ error: 'Google OAuth failed' }, { status: 500 });
  }
}
