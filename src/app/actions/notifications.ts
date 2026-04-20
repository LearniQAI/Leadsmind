'use server';

import { createServerClient } from '@/lib/supabase/server';
import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getNotifications() {
  const user = await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data;
}

export async function markNotificationAsRead(id: string) {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);

  if (error) {
    console.error('Error marking notification as read:', error);
    return { success: false };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const user = await requireAuth();
  const supabase = await createServerClient();
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function createNotification(notificationData: {
  workspace_id: string;
  user_id: string;
  type: 'message' | 'contact' | 'deal' | 'system' | 'team';
  title: string;
  message: string;
  link?: string;
}) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('notifications')
    .insert(notificationData)
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true, data };
}
