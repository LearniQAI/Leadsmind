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
    const storedState = cookieStore.get('tiktok_auth_state')?.value;

    if (!code || !state || !storedState || state !== storedState) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/account?error=invalid_tiktok_auth`);
    }

    // Exchange code for access token
    const clientKey = process.env.TIKTOK_CLIENT_KEY || process.env.TIKTOK_CLIENT_ID;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey!,
        client_secret: clientSecret!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tiktok/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('[tiktok-callback] Token exchange error:', tokenData);
      throw new Error(tokenData.error_description || tokenData.message || 'Failed to exchange TikTok token');
    }

    const { access_token, refresh_token, expires_in, open_id } = tokenData;

    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) throw new Error('No active workspace');

    const supabase = await createServerClient();
    
    // Store credentials in platform_connections
    const credentials = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + (expires_in * 1000),
      openId: open_id,
    };

    const { data: existing } = await supabase
      .from('platform_connections')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('platform', 'tiktok')
      .single();

    if (existing) {
      await supabase
        .from('platform_connections')
        .update({ credentials, status: 'connected', updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('platform_connections')
        .insert({ workspace_id: workspaceId, platform: 'tiktok', credentials, status: 'connected' });
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/account?success=tiktok_connected`);
  } catch (error: any) {
    console.error('[tiktok-callback] Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/account?error=tiktok_callback_failed&message=${encodeURIComponent(error.message)}`);
  }
}
