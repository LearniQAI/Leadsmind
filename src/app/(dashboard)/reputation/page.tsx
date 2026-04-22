'use server';

import { getCurrentWorkspaceId, requireAuth } from '@/lib/auth';
import { getReviews } from '@/app/actions/reputation';
import { ReputationClient } from '@/components/reputation/ReputationClient';
import { redirect } from 'next/navigation';

export default async function ReputationPage() {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) redirect('/login');

  const reviews = await getReviews();

  return (
    <ReputationClient initialReviews={reviews} />
  );
}
