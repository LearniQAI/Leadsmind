import { requireAdmin, getCurrentWorkspace } from '@/lib/auth';
import { getPipelineStages, getPipelines } from '@/app/actions/pipelines';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Pipeline Flow</h2>
          <Button className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white rounded-xl gap-2 font-bold px-4">
            <Plus className="h-4 w-4" />
            <span>Add Stage</span>
          </Button>
        </div>

        <div className="space-y-3">
          {stages.map((stage, index) => (
            <div 
              key={stage.id} 
              className="flex items-center justify-between p-5 rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white/20 group-hover:text-[#6c47ff] transition-colors">
                  {index + 1}
                </div>
                <span className="text-base font-semibold text-white/80 group-hover:text-white transition-colors">
                  {stage.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-white/20 hover:text-white/60 text-xs">Edit</Button>
                <div className="h-4 w-px bg-white/5" />
                <Button variant="ghost" size="sm" className="text-red-400/40 hover:text-red-400 text-xs">Remove</Button>
              </div>
            </div>
          ))}

          {stages.length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center text-center space-y-2 border-2 border-dashed border-white/5 rounded-2xl">
              <p className="text-sm text-white/20">No stages defined for this pipeline</p>
              <Button variant="link" className="text-[#6c47ff] font-bold">Create first stage</Button>
            </div>
          )}
        </div>
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
