"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface ExecutionLogsProps {
  workflowId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ExecutionLogs({ workflowId, isOpen, onClose }: ExecutionLogsProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("workflow_executions")
        .select(`
          *,
          contact:contacts (
            first_name,
            last_name,
            email
          )
        `)
        .eq("workflow_id", workflowId)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (data) setLogs(data);
    };

    fetchLogs();

    // Real-time subscription
    const channel = supabase
      .channel('automation_logs_updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'workflow_executions',
        filter: `workflow_id=eq.${workflowId}`
      }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workflowId, supabase]);

  return (
    <div className="absolute top-24 right-8 z-20 w-80 rounded-[32px] border border-white/5 bg-[#080812]/90 p-2 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] backdrop-blur-3xl ring-1 ring-white/10 overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/90">Audit History</h2>
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
           <Activity size={10} className="text-emerald-500 animate-pulse" />
        </div>
      </div>

      <ScrollArea className="h-[420px] px-3">
        <div className="space-y-2 pb-4">
          {logs.length === 0 && (
            <div className="py-24 text-center">
              <div className="h-16 w-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                 <Clock size={20} className="text-white/10" />
              </div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-black leading-tight">Waiting for<br/>executions...</p>
            </div>
          )}
          
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="group relative flex items-center gap-3 rounded-2xl p-3 transition-all hover:bg-white/5 border border-transparent hover:border-white/5"
            >
              <div className={cn(
                "h-2 w-2 rounded-full shrink-0",
                log.status === 'success' ? "bg-emerald-400" : 
                log.status === 'error' ? "bg-rose-500" : "bg-blue-400 animate-pulse"
              )} />
              
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-white truncate uppercase tracking-tight">
                  {log.contact?.first_name} {log.contact?.last_name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-white/30 truncate">Status: {log.current_step_id ? 'Processing' : 'End'}</span>
                  <span className="text-[9px] text-white/10">•</span>
                  <span className="text-[9px] text-white/30">{format(new Date(log.created_at), 'HH:mm:ss')}</span>
                </div>
              </div>

              {log.status === 'error' && (
                <div title={log.error_message || undefined}>
                  <XCircle size={14} className="text-rose-500 opacity-50" />
                </div>
              )}
              {log.status === 'success' && (
                <CheckCircle2 size={14} className="text-emerald-500 opacity-50" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-white/5">
        <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest group-hover:text-white">Full Audit Log</span>
          <ChevronRight size={12} className="text-white/20" />
        </button>
      </div>
    </div>
  );
}
