import React from 'react';
import { SocialPostComposer } from '@/components/social/SocialPostComposer';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getCurrentWorkspaceId } from '@/lib/auth';

export const metadata = {
  title: 'New Broadcast | Leadsmind',
  description: 'Create and schedule a new social media post.',
};

export default async function NewSocialPostPage() {
  const supabase = await createServerClient();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) redirect('/login');
  
  // Get connected platforms from table: platform_connections
  const { data: platformsData } = await supabase
    .from('platform_connections')
    .select('platform')
    .eq('workspace_id', workspaceId)
    .in('platform', ['linkedin', 'facebook', 'tiktok', 'instagram', 'twitter']);

  const connectedPlatforms = platformsData?.map(p => p.platform) || [];

  return (
    <div className="py-12">
      <div className="max-w-5xl mx-auto">
        <SocialPostComposer initialPlatforms={connectedPlatforms} />
      </div>
    </div>
  );
}
