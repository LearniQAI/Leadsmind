'use server';

import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin, getCurrentWorkspaceId } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getSocialPosts() {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return [];

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[social-posts] Error fetching posts:', error);
    return [];
  }
}

export async function createSocialPost(values: {
  content: string;
  platforms: string[];
  media_urls?: string[];
  scheduled_at?: string;
}) {
  try {
    await requireAdmin();
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: 'No active workspace' };

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('social_posts')
      .insert({
        workspace_id: workspaceId,
        content: values.content,
        platforms: values.platforms,
        media_urls: values.media_urls || [],
        scheduled_at: values.scheduled_at,
        status: values.scheduled_at ? 'scheduled' : 'draft',
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/social-posts');
    return { success: true, id: data.id };
  } catch (error: any) {
    console.error('[social-posts] Error creating post:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteSocialPost(id: string) {
  try {
    await requireAdmin();
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: 'No active workspace' };

    const supabase = await createServerClient();
    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', id)
      .eq('workspace_id', workspaceId);

    if (error) throw error;

    revalidatePath('/social-posts');
    return { success: true };
  } catch (error: any) {
    console.error('[social-posts] Error deleting post:', error);
    return { success: false, error: error.message };
  }
}

export async function publishSocialPost(id: string) {
  try {
    await requireAdmin();
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: 'No active workspace' };

    const supabase = await createServerClient();
    
    // 1. Get the post
    const { data: post, error: postErr } = await supabase
      .from('social_posts')
      .select('*')
      .eq('id', id)
      .eq('workspace_id', workspaceId)
      .single();

    if (postErr || !post) throw new Error('Post not found');

    // 2. Update status to publishing
    await supabase.from('social_posts').update({ status: 'publishing' }).eq('id', id);

    // 3. Get connections
    const { data: connections } = await supabase
      .from('platform_connections')
      .select('platform, credentials')
      .eq('workspace_id', workspaceId)
      .in('platform', post.platforms);

    const platformErrors: string[] = [];

    // 4. Publish to each platform
    for (const platform of post.platforms) {
      const conn = connections?.find(c => c.platform === platform);
      if (!conn) {
        platformErrors.push(`${platform}: Not connected`);
        continue;
      }

      try {
        if (platform === 'linkedin') {
          await publishToLinkedIn(post, conn.credentials);
        } else if (platform === 'facebook') {
          await publishToFacebook(post, conn.credentials);
        } else if (platform === 'tiktok') {
          await publishToTikTok(post, conn.credentials);
        } else if (platform === 'instagram') {
          await publishToInstagram(post, conn.credentials);
        }
      } catch (err: any) {
        console.error(`Error publishing to ${platform}:`, err);
        platformErrors.push(`${platform}: ${err.message}`);
      }
    }

    // 5. Update final status
    const isTotalFailure = platformErrors.length === post.platforms.length;
    const finalStatus = isTotalFailure ? 'failed' : 'published';
    
    const { error } = await supabase
      .from('social_posts')
      .update({ 
        status: finalStatus,
        published_at: isTotalFailure ? null : new Date().toISOString(),
        error_message: platformErrors.length > 0 ? platformErrors.join('; ') : null
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/social-posts');
    return { 
      success: !isTotalFailure, 
      errors: platformErrors.length > 0 ? platformErrors : undefined 
    };
  } catch (error: any) {
    console.error('[social-posts] Error publishing post:', error);
    return { success: false, error: error.message };
  }
}

// HELPER FUNCTIONS FOR PUBLISHING

async function publishToLinkedIn(post: any, credentials: any) {
    const { accessToken, sub } = credentials;
    if (!accessToken || !sub) throw new Error('LinkedIn credentials missing (token or sub)');

    const body = {
        author: `urn:li:person:${sub}`,
        commentary: post.content,
        visibility: "PUBLIC",
        distribution: {
            feedDistribution: "MAIN_FEED",
            targetEntities: [],
            thirdPartyDistributionChannels: []
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false
    };

    // Note: LinkdedIn API Versioning is required. Using a recent one.
    const response = await fetch('https://api.linkedin.com/rest/posts', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'LinkedIn-Version': '202401',
            'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || `LinkedIn API error: ${response.status}`);
    }
}

async function publishToFacebook(post: any, credentials: any) {
    const { accessToken, pageId } = credentials;
    if (!accessToken || !pageId) throw new Error('Facebook credentials missing (token or pageId)');

    const url = `https://graph.facebook.com/v19.0/${pageId}/feed`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: post.content,
            access_token: accessToken
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || `Facebook API error: ${response.status}`);
    }
}

async function publishToTikTok(post: any, credentials: any) {
    // TikTok direct posting is complex (requires video/image upload first)
    // For now, we'll suggest using their Direct Post API
    // Implementation placeholder for when they have a video URL or similar
    console.log('TikTok posting triggered for post:', post.id);
    throw new Error('TikTok Direct Post implementation pending media upload flow.');
}

async function publishToInstagram(post: any, credentials: any) {
    const { accessToken, instagramBusinessAccountId } = credentials;
    if (!accessToken || !instagramBusinessAccountId) throw new Error('Instagram credentials missing');
    
    // Instagram requires a container first for images/videos
    throw new Error('Instagram publishing requires media container initialization.');
}
