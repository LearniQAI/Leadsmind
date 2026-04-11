import { requireAuth, getCurrentWorkspace } from '@/lib/auth';
import { 
  getPipelines, 
  getPipelineStages, 
  getPipelineOpportunities 
} from '@/app/actions/pipelines';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { PipelineSelector } from '@/components/crm/PipelineSelector';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Target } from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PipelinesPage({
  searchParams,
}: {
  searchParams: Promise<{ pipelineId?: string }>;
}) {
  await requireAuth();
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect('/login');

  const pipelinesResult = await getPipelines();
  const pipelines = pipelinesResult.success ? pipelinesResult.data || [] : [];
  const pipelineError = !pipelinesResult.success ? pipelinesResult.error : undefined;
  
  if (pipelines.length === 0) {
    return (
      <div className="flex flex-col h-[calc(100vh-200px)] items-center justify-center text-center space-y-6">
        <div className="h-24 w-24 rounded-3xl bg-[#6c47ff]/10 border border-[#6c47ff]/20 flex items-center justify-center shadow-xl shadow-[#6c47ff]/5">
          <Target className="h-10 w-10 text-[#6c47ff]/60" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">No pipelines yet</h2>
          <p className="text-sm font-light text-white/40 max-w-sm leading-relaxed">
            Create your first sales pipeline to start tracking deals and moving prospects through stages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white h-11 px-6 rounded-xl gap-2 font-bold shadow-lg shadow-[#6c47ff]/20" asChild>
            <Link href="/pipelines/new">
              <Plus className="h-4 w-4" />
              Create Pipeline
            </Link>
          </Button>
        </div>
        <p className="text-xs text-white/20 font-medium">
          {pipelineError ? `Error: ${pipelineError}` : 'Refresh the page if your pipeline just got set up.'}
        </p>
      </div>
    );
  }

  const { pipelineId } = await searchParams;
  const activePipelineId = pipelineId || pipelines[0].id;

  const [stagesResult, opportunitiesResult] = await Promise.all([
    getPipelineStages(activePipelineId),
    getPipelineOpportunities(activePipelineId)
  ]);

  const stages = stagesResult.success ? stagesResult.data || [] : [];
  const opportunities = opportunitiesResult.success ? opportunitiesResult.data || [] : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Pipelines</h1>
            <p className="text-sm text-white/40 font-medium">Track and manage your sales opportunities</p>
          </div>
          <PipelineSelector 
            pipelines={pipelines} 
            activePipelineId={activePipelineId} 
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/5 bg-white/3 hover:bg-white/5 text-white/60 h-11 px-5 rounded-xl gap-2 font-semibold" asChild>
            <Link href={`/pipelines/${activePipelineId}/stages`}>
              <Settings className="h-4 w-4" />
              <span>Configure</span>
            </Link>
          </Button>
          <Button className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white h-11 px-5 rounded-xl gap-2 font-bold shadow-lg shadow-[#6c47ff]/20">
            <Plus className="h-5 w-5" />
            <span>New Deal</span>
          </Button>
        </div>
      </div>

      <KanbanBoard stages={stages} opportunities={opportunities} />
    </div>
  );
}
