import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MediaBrowser } from '@/components/media/MediaBrowser';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentWorkspace } from '@/lib/auth';

export default async function MediaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect('/login');
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Media Center</h1>
        <p className="mt-2 text-white/50">Manage your workspace assets, documents, and marketing materials.</p>
      </div>

      <Suspense fallback={<MediaSkeleton />}>
        <MediaBrowser workspaceId={workspace.id} />
      </Suspense>
    </div>
  );
}

function MediaSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-4">
        <Skeleton className="h-10 w-96 bg-white/5" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 bg-white/5" />
          <Skeleton className="h-10 w-32 bg-white/5" />
        </div>
      </div>
      <div className="grid grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-2xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
