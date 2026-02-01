import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to login page with success message
      return NextResponse.redirect(new URL('/login?verified=true', requestUrl.origin));
    }
  }

  // If there's an error, redirect to login with error
  return NextResponse.redirect(new URL('/login?error=verification_failed', requestUrl.origin));
}
