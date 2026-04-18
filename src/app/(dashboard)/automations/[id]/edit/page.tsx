import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { WorkflowBuilder } from "@/components/automation/WorkflowBuilder";
import { ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EditAutomationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAutomationPage({ params }: EditAutomationPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: workflow } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", id)
    .single();

  if (!workflow) notFound();

  // Fetch Steps and Edges
  const { data: steps = [] } = await supabase
    .from("workflow_steps")
    .select("*")
    .eq("workflow_id", id)
    .order("position", { ascending: true });

  const { data: dbEdges = [] } = await supabase
    .from("workflow_edges")
    .select("*")
    .eq("workflow_id", id);

  // MIGRATION / CONVERSION to React Flow
  const nodes = (steps || []).map((s, i) => ({
    id: s.id,
    type: s.type,
    position: { x: s.canvas_x || 250, y: s.canvas_y || (i + 1) * 200 },
    data: { ...s.config, label: s.type.replace('_', ' ') }
  }));

  // Ensure Trigger node exists
  const triggerNode = {
    id: 'trigger-root', // Special ID for the root trigger
    type: 'trigger',
    position: { x: 250, y: 0 },
    data: { label: workflow.trigger_type.replace('_', ' '), triggerType: workflow.trigger_type }
  };

  const finalNodes = [triggerNode, ...nodes];

  // Convert Edges or create default linear ones if none exist in workflow_edges
  let finalEdges = (dbEdges || []).map(e => ({
    id: e.id,
    source: e.source_step_id || 'trigger-root',
    target: e.target_step_id,
    sourceHandle: e.source_handle,
    targetHandle: e.target_handle
  }));

  if (finalEdges.length === 0 && steps.length > 0) {
    // Migrate linear connections
    finalEdges = [
        { id: 'e-t-s1', source: 'trigger-root', target: steps[0].id },
        ...steps.slice(0, -1).map((s, i) => ({
            id: `e-${s.id}-${steps[i+1].id}`,
            source: s.id,
            target: steps[i+1].id
        }))
    ];
  }

  return (
    <div className="fixed inset-0 z-[50] flex flex-col bg-[#05050a]">
      {/* Professional SaaS Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/5 bg-[#08080f] px-8">
        <div className="flex items-center gap-6">
          <Link href="/automations">
            <Button variant="ghost" size="icon" className="text-white/20 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-white uppercase tracking-tight italic">
              {workflow.name}
            </h1>
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Visual Canvas Editor</span>
               <div className="h-1 w-1 rounded-full bg-white/10" />
               <span className="text-[9px] font-black text-blue-500/80 uppercase tracking-[0.2em]">{workflow.trigger_type.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">System Online</span>
          </div>
        </div>
      </header>

      {/* Builder Core */}
      <main className="flex-1 relative overflow-hidden bg-[#050505]">
        <WorkflowBuilder 
          workflowId={id}
          initialNodes={finalNodes as any}
          initialEdges={finalEdges as any}
          initialStatus={workflow.is_active ? 'active' : 'draft'}
        />
      </main>
    </div>
  );
}
