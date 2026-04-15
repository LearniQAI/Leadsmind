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
    const storedState = cookieStore.get('meta_auth_state')?.value;

    if (!code || !state || !storedState || state !== storedState) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/account?error=invalid_meta_auth`);
    }

    const clientId = process.env.META_APP_ID || process.env.FACEBOOK_APP_ID;
    const clientSecret = process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET;

    // 1. Exchange code for user access token
    const tokenResponse = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`)}&client_secret=${clientSecret}&code=${code}`);
    
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) throw new Error(tokenData.error?.message || 'Failed to exchange Meta token');

    const userAccessToken = tokenData.access_token;

    // 2. Get pages managed by the user
    const pagesResponse = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`);
    const pagesData = await pagesResponse.json();
    
    if (!pagesResponse.ok) throw new Error('Failed to fetch Facebook pages');

    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) throw new Error('No active workspace');

    const supabase = await createServerClient();

    // For simplicity, we'll take the first page. In a real app, you might want to let the user choose.
    const page = pagesData.data?.[0];
    if (!page) {
        // Even if no page, we can store the user token for Instagram if linked, 
        // but usually you need a page.
        throw new Error('No Facebook pages found for this account.');
    }

    const credentials = {
      accessToken: page.access_token, // Page Access Token
      pageId: page.id,
      pageName: page.name,
      userAccessToken: userAccessToken
    };

    // Store for Facebook
    await supabase.from('platform_connections').upsert({
      workspace_id: workspaceId,
      platform: 'facebook',
      credentials,
      status: 'connected',
      updated_at: new Date().toISOString()
    }, { onConflict: 'workspace_id, platform' });

    // Optional: Check for Instagram Business Account linked to this page
    const igResponse = await fetch(`https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`);
    const igData = await igResponse.json();

    if (igData.instagram_business_account) {
        await supabase.from('platform_connections').upsert({
            workspace_id: workspaceId,
            platform: 'instagram',
            credentials: {
                ...credentials,
                instagramBusinessAccountId: igData.instagram_business_account.id
            },
            status: 'connected',
            updated_at: new Date().toISOString()
        }, { onConflict: 'workspace_id, platform' });
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/account?success=meta_connected`);
  } catch (error: any) {
    console.error('[meta-callback] Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/account?error=meta_callback_failed&message=${encodeURIComponent(error.message)}`);
  }
}
