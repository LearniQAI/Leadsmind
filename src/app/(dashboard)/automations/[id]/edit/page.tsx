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
    .from("automation_workflows")
    .select("*")
    .eq("id", id)
    .single();

  if (!workflow) notFound();

  return (
    <div className="fixed inset-0 z-[50] flex flex-col bg-[#0b0b15]">
      {/* Premium Stealth Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/5 bg-[#050510]/80 px-8 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/automations">
            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6c47ff]/10">
              <Zap className="h-4 w-4 text-[#6c47ff]" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-tight">{workflow.name}</h1>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Workflow Builder</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 border border-white/10">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Auto-saved</span>
          </div>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 relative overflow-hidden">
        <WorkflowBuilder 
          workflowId={id}
          initialNodes={workflow.nodes as any}
          initialEdges={workflow.edges as any}
          initialStatus={workflow.status}
        />
      </main>
    </div>
  );
}
