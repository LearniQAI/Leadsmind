import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentWorkspaceId } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const cookieStore = await cookies();
    const storedState = cookieStore.get('linkedin_auth_state')?.value;

    if (!code || !state || !storedState || state !== storedState) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/account?error=invalid_linkedin_auth`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || 'Failed to exchange LinkedIn token');
    }

    const { access_token, expires_in, refresh_token } = tokenData;

    // Get user info from LinkedIn
    const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const userData = await userResponse.json();

    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) throw new Error('No active workspace');

    const supabase = await createServerClient();
    
    // Store credentials in platform_connections
    const credentials = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + (expires_in * 1000),
      name: userData.name,
      sub: userData.sub,
      email: userData.email
    };

    const { data: existing } = await supabase
      .from('platform_connections')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('platform', 'linkedin')
      .single();

    if (existing) {
      await supabase
        .from('platform_connections')
        .update({ credentials, status: 'connected', updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('platform_connections')
        .insert({ workspace_id: workspaceId, platform: 'linkedin', credentials, status: 'connected' });
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/account?success=linkedin_connected`);
  } catch (error: any) {
    console.error('[linkedin-callback] Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/account?error=linkedin_callback_failed&message=${encodeURIComponent(error.message)}`);
  }
}
