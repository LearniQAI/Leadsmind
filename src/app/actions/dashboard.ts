'use server';

import { createServerClient } from '@/lib/supabase/server';
import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';

export async function getDashboardMetrics() {
    await requireAuth();
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return null;

    const supabase = await createServerClient();

    const [contactsCount, dealsCount, wonDealsSum, recentActivities] = await Promise.all([
        supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
        supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId).eq('status', 'open'),
        supabase.from('opportunities').select('value').eq('workspace_id', workspaceId).eq('status', 'won'),
        supabase.from('contact_activities').select('*, contacts(first_name, last_name)').eq('workspace_id', workspaceId).order('created_at', { ascending: false }).limit(10)
    ]);

    const totalWon = wonDealsSum.data?.reduce((acc, curr) => acc + (curr.value || 0), 0) || 0;

    return {
        totalContacts: contactsCount.count || 0,
        openDeals: dealsCount.count || 0,
        wonValue: totalWon,
        recentActivities: recentActivities.data || []
    };
}
