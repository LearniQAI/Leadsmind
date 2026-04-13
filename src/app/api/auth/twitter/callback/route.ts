import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { TwitterApi } from 'twitter-api-v2';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentWorkspaceId } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const cookieStore = await cookies();
    const storedState = cookieStore.get('twitter_auth_state')?.value;
    const codeVerifier = cookieStore.get('twitter_code_verifier')?.value;

    if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/account?error=invalid_twitter_auth`);
    }

    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    const { client: loggedClient, accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
    });

    // Get user info to show in the UI
    const { data: user } = await loggedClient.v2.me();

    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) throw new Error('No active workspace');

    const supabase = await createServerClient();
    
    // Store credentials in platform_connections
    const credentials = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + (expiresIn * 1000),
      username: user.username,
      userId: user.id
    };

    const { data: existing } = await supabase
      .from('platform_connections')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('platform', 'twitter')
      .single();

    if (existing) {
      await supabase
        .from('platform_connections')
        .update({ credentials, status: 'connected', updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('platform_connections')
        .insert({ workspace_id: workspaceId, platform: 'twitter', credentials, status: 'connected' });
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/account?success=twitter_connected`);
  } catch (error) {
    console.error('[twitter-callback] Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/account?error=twitter_callback_failed`);
  }
}
