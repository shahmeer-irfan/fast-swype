import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') ?? '/login?verified=true';

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (!error) {
      // Redirect to login page with success message
      return NextResponse.redirect(new URL('/login?verified=true', requestUrl.origin));
    }
  }

  // If there's an error, redirect to login with error
  return NextResponse.redirect(new URL('/login?error=verification_failed', requestUrl.origin));
}
