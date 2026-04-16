import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Clock, Activity, User, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface LogsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LogsPage({ params }: LogsPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch workflow details
  const { data: workflow } = await supabase
    .from("automation_workflows")
    .select("name")
    .eq("id", id)
    .single();

  if (!workflow) notFound();

  // Fetch logs
  const { data: logs } = await supabase
    .from("automation_logs")
    .select(`
      *,
      contacts (
        first_name,
        last_name,
        email
      )
    `)
    .eq("workflow_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/automations">
            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white rounded-xl">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">Execution Audit</h1>
            <p className="text-sm text-white/40 mt-1">Activity logs for "{workflow.name}"</p>
          </div>
        </div>
        
        <Link href={`/automations/${id}/edit`}>
          <Button variant="secondary" className="bg-white/5 border-white/10 text-white gap-2 rounded-xl">
            <Activity size={16} className="text-[#6c47ff]" />
            Return to Builder
          </Button>
        </Link>
      </div>

      <div className="bg-white/3 border border-white/5 rounded-[32px] overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/2 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Clock className="text-white/20" size={18} />
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Recent Runs</h2>
            </div>
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3">
                Found {logs?.length || 0} events
            </Badge>
        </div>

        <div className="divide-y divide-white/5">
          {!logs || logs.length === 0 ? (
            <div className="py-20 text-center">
              <Clock size={48} className="mx-auto text-white/5 mb-4" />
              <p className="text-white/30 font-bold uppercase tracking-widest">No activity recorded yet</p>
              <p className="text-xs text-white/10 mt-2">Trigger this workflow manually or via event to see logs.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div 
                key={log.id} 
                className="p-6 flex items-center gap-6 hover:bg-white/2 transition-all group"
              >
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center border",
                  log.status === 'success' ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" : 
                  log.status === 'error' ? "bg-rose-500/5 border-rose-500/10 text-rose-500" : 
                  "bg-blue-500/5 border-blue-500/10 text-blue-400"
                )}>
                    {log.status === 'success' ? <CheckCircle2 size={24} /> : 
                     log.status === 'error' ? <XCircle size={24} /> : 
                     <Activity size={24} className="animate-pulse" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                        {log.contacts ? `${log.contacts.first_name} ${log.contacts.last_name}` : 'System Task'}
                    </span>
                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-white/10 text-white/40">
                        {log.node_id.split('-')[0]}
                    </Badge>
                  </div>
                  <p className="text-xs text-white/30 mt-1">
                    {log.error_message || `Action "${log.node_id}" completed successfully at ${format(new Date(log.created_at), 'HH:mm:ss')}`}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-mono text-white/20">
                    {format(new Date(log.created_at), 'MMM dd, yyyy')}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-white/40">
                    <User size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">
                        {log.contacts?.email || 'SYSTEM'}
                    </span>
                  </div>
                </div>

                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-all text-white/20 hover:text-white">
                    <ChevronRight size={16} />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
