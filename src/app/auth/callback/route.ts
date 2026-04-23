import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/dashboard';

  let originUrl = origin;
  if (originUrl.includes('leadsmind.io') && !originUrl.includes('www.')) {
    originUrl = originUrl.replace('leadsmind.io', 'www.leadsmind.io');
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${originUrl}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${originUrl}/login?error=Could not authenticate user`);
}
