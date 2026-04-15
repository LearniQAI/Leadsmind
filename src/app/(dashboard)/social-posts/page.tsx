'use server';

import { createServerClient } from '@/lib/supabase/server';
import { getCurrentWorkspaceId } from '@/lib/auth';
import { SocialPostsClient } from '@/components/social/SocialPostsClient';
import { getConnectedPlatforms } from '@/app/actions/messaging';
import { getSocialPosts } from '@/app/actions/social';

export default async function SocialPostsPage() {
  const workspaceId = await getCurrentWorkspaceId();
  const connectedPlatforms = await getConnectedPlatforms();
  const initialPosts = await getSocialPosts();

  return (
    <SocialPostsClient 
      initialPlatforms={connectedPlatforms.map(p => p.platform)} 
      initialPosts={initialPosts}
    />
  );
}
