'use server';

import { createServerClient } from '@/lib/supabase/server';
import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getReviews() {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return [];

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[reputation] Error fetching reviews:', error);
    return [];
  }
}

export async function replyToReview(reviewId: string, response: string) {
  try {
    await requireAuth();
    const workspaceId = await getCurrentWorkspaceId();
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('reviews')
      .update({ 
        response_text: response,
        responded_at: new Date().toISOString(),
        status: 'responded'
      })
      .eq('id', reviewId)
      .eq('workspace_id', workspaceId);

    if (error) throw error;

    revalidatePath('/reputation');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendReviewRequest(contactId: string, platform: 'google' | 'facebook') {
  try {
    await requireAuth();
    const workspaceId = await getCurrentWorkspaceId();
    const supabase = await createServerClient();

    // 1. Get contact & workspace settings
    const { data: contact } = await supabase.from('contacts').select('email, first_name').eq('id', contactId).single();
    const { data: workspace } = await supabase.from('workspaces').select('name, review_link_google, review_link_facebook').eq('id', workspaceId).single();

    if (!contact?.email) throw new Error('Contact email not found');
    
    const reviewLink = platform === 'google' ? workspace?.review_link_google : workspace?.review_link_facebook;
    if (!reviewLink) throw new Error(`${platform} review link not configured in settings`);

    // 2. Log the request
    await supabase.from('review_requests').insert({
      workspace_id: workspaceId,
      contact_id: contactId,
      platform,
      status: 'sent'
    });

    // 3. Send the Email via our global truth-based engine
    const { sendEmail } = await import('@/lib/email');
    await sendEmail({
      to: contact.email,
      subject: `How did we do at ${workspace?.name}?`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; text-align: center; color: #111;">
          <h2>We value your feedback!</h2>
          <p>Hi ${contact.first_name}, thank you for choosing ${workspace?.name}. Could you spare a minute to leave us a review on ${platform}?</p>
          <div style="margin-top: 30px;">
            <a href="${reviewLink}" style="background: #6c47ff; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">Leave a Review</a>
          </div>
        </div>
      `
    });

    revalidatePath('/reputation');
    return { success: true };
  } catch (error: any) {
    console.error('[reputation] Request failed:', error);
    return { success: false, error: error.message };
  }
}
