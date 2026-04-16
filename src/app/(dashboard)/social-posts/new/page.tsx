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
  
  // Get connected platforms
  const { data: platformsData } = await supabase
    .from('integrations')
    .select('platform')
    .eq('workspace_id', workspaceId)
    .in('platform', ['linkedin', 'facebook', 'tiktok']);

  const connectedPlatforms = platformsData?.map(p => p.platform) || [];

  return (
    <div className="min-h-screen bg-[#030303] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <SocialPostComposer initialPlatforms={connectedPlatforms} />
      </div>
    </div>
  );
}
