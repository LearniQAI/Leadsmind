import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { safeInternalPath } from '@/lib/security/safeInternalPath';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  // if "next" is in search params, use it as the redirection URL — validated so a crafted
  // link can't bounce the user to an external site.
  const next = safeInternalPath(searchParams.get('next'), '/dashboard');

  let originUrl = origin;
  if (originUrl.includes('leadsmind.io') && !originUrl.includes('www.')) {
    originUrl = originUrl.replace('leadsmind.io', 'www.leadsmind.io');
  }

  // PKCE code exchange — kept as a fallback for any link still using the client-side
  // supabase.auth.signUp()/resetPasswordForEmail() flow this route used to rely on exclusively.
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${originUrl}${next}`);
    }
    console.error('[auth.callback] exchangeCodeForSession failed:', error.message);
  }

  // token_hash/type — what signUpBasic()'s and forgotPassword()'s admin.generateLink() links
  // actually use: a stateless OTP that verifies from any device/browser, unlike the PKCE code
  // above which only works from the browser that started the flow.
  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      return NextResponse.redirect(`${originUrl}${next}`);
    }
    console.error('[auth.callback] verifyOtp failed:', error.message, 'type:', type);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${originUrl}/login?error=Could not authenticate user`);
}
