'use server';

import { createServerClient } from '@/lib/supabase/server';
import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';

export async function getDashboardMetrics() {
    const user = await requireAuth();
    let workspaceId = await getCurrentWorkspaceId();
    
    const supabase = await createServerClient();

    if (!workspaceId) {
        const { data: membership } = await supabase
            .from('workspace_members')
            .select('workspace_id')
            .eq('user_id', user.id)
            .limit(1)
            .single();
        
        if (membership) {
            workspaceId = membership.workspace_id;
        }
    }

    if (!workspaceId) return null;

    const [contactsCount, dealsCount, wonDealsSum, recentActivities, conversationsCount, platformsCount] = await Promise.all([
        supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
        supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId).eq('status', 'open'),
        supabase.from('opportunities').select('value').eq('workspace_id', workspaceId).eq('status', 'won'),
        supabase.from('contact_activities').select('*, contacts(first_name, last_name)').eq('workspace_id', workspaceId).order('created_at', { ascending: false }).limit(10),
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
        supabase.from('platform_connections').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId).eq('status', 'connected'),
    ]);

    const totalWon = wonDealsSum.data?.reduce((acc, curr) => acc + (curr.value || 0), 0) || 0;

    return {
        totalContacts: contactsCount.count || 0,
        openDeals: dealsCount.count || 0,
        wonValue: totalWon,
        recentActivities: recentActivities.data || [],
        activeConversations: conversationsCount.count || 0,
        connectedPlatforms: platformsCount.count || 0,
    };
}
