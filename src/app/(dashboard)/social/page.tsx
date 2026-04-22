'use server';

import { getCurrentWorkspaceId, requireAuth } from '@/lib/auth';
import { getConnectedPlatforms } from '@/app/actions/messaging';
import { getSocialPosts } from '@/app/actions/social';
import SocialPlannerClient from '@/components/social/SocialPlannerClient';
import { redirect } from 'next/navigation';

export default async function SocialPage() {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) redirect('/login');

  const [connectedPlatforms, initialPosts] = await Promise.all([
    getConnectedPlatforms(),
    getSocialPosts()
  ]);

  return (
    <SocialPlannerClient 
      connectedPlatforms={connectedPlatforms.map(p => p.platform)} 
      initialPosts={initialPosts}
    />
  );
}
