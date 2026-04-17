import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { LinearWorkflowBuilder } from "@/components/automation/LinearWorkflowBuilder";
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
               <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Linear Workflow Engine</span>
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
        <LinearWorkflowBuilder 
          workflowId={id}
          initialWorkflow={workflow}
        />
      </main>
    </div>
  );
}
