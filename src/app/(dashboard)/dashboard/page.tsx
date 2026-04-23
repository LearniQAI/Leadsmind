'use server';

import { createServerClient } from '@/lib/supabase/server';
import { getCurrentWorkspaceId, requireAuth } from '@/lib/auth';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) redirect('/login');

  const supabase = await createServerClient();

  // Fetch Live KPI Data
  const [
    { count: contactCount },
    { count: opportunityCount },
    { data: recentActivities },
    { data: revenueData },
    { count: activeSocialPosts },
    { count: taskCount }
  ] = await Promise.all([
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
    supabase.from('contact_activities').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false }).limit(5),
    supabase.from('invoices').select('total_amount').eq('workspace_id', workspaceId).eq('status', 'paid'),
    supabase.from('social_posts').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId).eq('status', 'scheduled'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId).neq('status', 'done')
  ]);

  const totalRevenue = revenueData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;

  return (
    <DashboardClient 
      stats={{
        contacts: contactCount || 0,
        opportunities: opportunityCount || 0,
        revenue: totalRevenue,
        socialQueue: activeSocialPosts || 0,
        pendingTasks: taskCount || 0
      }}
      recentActivities={recentActivities || []}
    />
  );
}
