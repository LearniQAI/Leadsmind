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
    const { error } = await supabase
      .from('social_posts')
      .insert({
        workspace_id: workspaceId,
        content: values.content,
        platforms: values.platforms,
        media_urls: values.media_urls || [],
        scheduled_at: values.scheduled_at,
        status: values.scheduled_at ? 'scheduled' : 'draft',
      });

    if (error) throw error;

    revalidatePath('/social-posts');
    return { success: true };
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
  // This would integrate with LinkedIn/Facebook/TikTok APIs
  // For now, we'll just mark it as published
  try {
    await requireAdmin();
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: 'No active workspace' };

    const supabase = await createServerClient();
    
    // Update status to publishing
    await supabase.from('social_posts').update({ status: 'publishing' }).eq('id', id);

    // MOCK API CALLS
    // In reality, you'd call social platforms here
    
    const { error } = await supabase
      .from('social_posts')
      .update({ 
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('workspace_id', workspaceId);

    if (error) throw error;

    revalidatePath('/social-posts');
    return { success: true };
  } catch (error: any) {
    console.error('[social-posts] Error publishing post:', error);
    return { success: false, error: error.message };
  }
}
