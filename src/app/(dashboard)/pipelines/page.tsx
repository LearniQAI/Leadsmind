import { requireAuth, getCurrentWorkspace } from '@/lib/auth';
import { 
  getPipelines, 
  getPipelineStages, 
  getPipelineOpportunities 
} from '@/app/actions/pipelines';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { PipelineSelector } from '@/components/crm/PipelineSelector';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { redirect } from 'next/navigation';

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
  
  if (pipelines.length === 0) {
      // This case is handled by getPipelines (ensureDefaultPipeline)
      return <div>Setting up your first pipeline...</div>;
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
          <Button variant="outline" className="border-white/5 bg-white/3 hover:bg-white/5 text-white/60 h-11 px-5 rounded-xl gap-2 font-semibold">
            <Settings className="h-4 w-4" />
            <span>Configure</span>
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
