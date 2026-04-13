import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentWorkspaceId } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/account?error=no_code_provided`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

    // 1. Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('[google-callback] Token exchange error:', tokenData);
      throw new Error(tokenData.error_description || 'Failed to exchange Google code');
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    // 2. Fetch user email
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const userData = await userResponse.json();

    if (!userData.email) {
      throw new Error('Could not retrieve email from Google');
    }

    // 3. Find current workspace
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) throw new Error('No active workspace');

    const supabase = await createServerClient();
    
    // 4. Store/Update connection
    const credentials = {
      provider: 'gmail',
      accessToken: access_token,
      refreshToken: refresh_token || null, // Refresh token is only sent on the first consent
      expiresAt: Date.now() + (expires_in * 1000),
      email: userData.email
    };

    const { data: existing } = await supabase
      .from('platform_connections')
      .select('id, credentials')
      .eq('workspace_id', workspaceId)
      .eq('platform', 'email')
      .single();

    if (existing) {
      // If we didn't get a new refresh token (e.g. re-login without prompt=consent), keep the old one
      const mergedCredentials = {
        ...credentials,
        refreshToken: refresh_token || existing.credentials.refreshToken
      };

      await supabase
        .from('platform_connections')
        .update({ 
          credentials: mergedCredentials, 
          status: 'connected', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('platform_connections')
        .insert({ 
          workspace_id: workspaceId, 
          platform: 'email', 
          credentials, 
          status: 'connected' 
        });
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/account?success=gmail_connected`);
  } catch (error: any) {
    console.error('[google-callback] Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/account?error=google_callback_failed&message=${encodeURIComponent(error.message)}`);
  }
}
