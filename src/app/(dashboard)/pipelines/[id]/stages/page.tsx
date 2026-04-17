import { requireAdmin, getCurrentWorkspace } from '@/lib/auth';
import { getPipelineStages, getPipelines } from '@/app/actions/pipelines';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StageManager } from '@/components/crm/StageManager';

export const dynamic = 'force-dynamic';

export default async function PipelineStagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  
  const workspace = await getCurrentWorkspace();
  const [pipelinesResult, stagesResult] = await Promise.all([
    getPipelines(),
    getPipelineStages(id),
  ]);

  if (!pipelinesResult.success) {
      return <div>Error loading pipeline</div>;
  }

  const pipeline = pipelinesResult.data?.find(p => p.id === id);
  if (!pipeline) {
      notFound();
  }

  const stages = stagesResult.success ? (stagesResult.data ?? []) : [];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="text-white/40 hover:text-white">
          <Link href="/pipelines">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            {pipeline.name} Stages
          </h1>
          <p className="text-sm text-white/40 font-medium">Define the steps in your sales process</p>
        </div>
      </div>

      <div className="bg-[#0b0b10] border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl space-y-6">
        <StageManager pipelineId={id} initialStages={stages} />
      </div>

      <div className="p-6 rounded-2xl bg-[#6c47ff]/5 border border-[#6c47ff]/20">
        <p className="text-xs text-[#6c47ff] font-medium leading-relaxed">
          <span className="font-bold uppercase tracking-wider mr-2">Pro Tip:</span> 
          Keep your pipeline simple (3-7 stages). Most leads get lost in overly complex workflows. 
          You can drag and drop stages to reorder them in the next update.
        </p>
      </div>
    </div>
  );
}
