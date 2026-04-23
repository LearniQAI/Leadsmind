import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // workspace_id

  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/emails?error=missing_code`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/integrations/oauth/callback/${provider}`;

  let tokenData: any;
  let emailAddress: string = '';

  try {
    if (provider === 'gmail') {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      tokenData = await response.json();
      
      // Fetch user email
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userData = await userRes.json();
      emailAddress = userData.email;

    } else if (provider === 'outlook') {
      const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      tokenData = await response.json();

      // Fetch user email
      const userRes = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userData = await userRes.json();
      emailAddress = userData.mail || userData.userPrincipalName;
    }

    if (!tokenData?.access_token) {
      console.error('OAuth token exchange failed:', tokenData);
      return NextResponse.redirect(`${baseUrl}/settings/emails?error=token_exchange_failed`);
    }

    // Save to DB
    const supabase = await createServerClient();
    const { error } = await supabase
      .from('email_accounts')
      .upsert({
        workspace_id: state,
        provider,
        email_address: emailAddress,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        last_synced_at: new Date().toISOString(),
        team_member_id: (await supabase.auth.getUser()).data.user?.id
      }, {
        onConflict: 'workspace_id, team_member_id, email_address'
      });

    if (error) {
      console.error('Error saving email account:', error);
      return NextResponse.redirect(`${baseUrl}/settings/emails?error=db_save_failed`);
    }

    return NextResponse.redirect(`${baseUrl}/settings/emails?success=connected`);

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(`${baseUrl}/settings/emails?error=internal_server_error`);
  }
}
