// src/app/auth/callback/route.ts
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';


export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code'); 

  if (code) {
    
    const supabase = await createSupabaseServerClient();

    
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
