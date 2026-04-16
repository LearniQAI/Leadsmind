"use client";

import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface AutomationLog {
  id: string;
  node_id: string;
  status: 'success' | 'error' | 'running' | 'skipped' | 'paused';
  error_message?: string;
  created_at: string;
  workflow?: {
    name: string;
  };
}

export function AutomationLogsSection({ logs }: { logs: any[] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl border border-dashed border-white/5 bg-white/[0.02]">
        <Zap className="h-10 w-10 text-white/10 mb-4" />
        <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest">No Automations Triggered</h3>
        <p className="text-xs text-white/20 mt-1">This lead hasn&apos;t entered any automated workflows yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Execution History</h3>
        <span className="text-[10px] font-bold text-[#6c47ff] bg-[#6c47ff]/10 px-2 py-0.5 rounded-full ring-1 ring-[#6c47ff]/20">
          {logs.length} Steps
        </span>
      </div>

      <div className="space-y-3">
        {logs.map((log) => (
          <div 
            key={log.id} 
            className="group relative flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-[#050510]/40 backdrop-blur-xl transition-all hover:bg-white/5 hover:border-white/10"
          >
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
              log.status === 'success' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
              log.status === 'error' && "bg-red-500/10 border-red-500/20 text-red-500",
              (log.status === 'running' || log.status === 'paused') && "bg-blue-500/10 border-blue-500/20 text-blue-500",
              log.status === 'skipped' && "bg-white/5 border-white/10 text-white/30"
            )}>
              {log.status === 'success' && <CheckCircle2 size={14} />}
              {log.status === 'error' && <XCircle size={14} />}
              {(log.status === 'running' || log.status === 'paused') && <Clock size={14} className="animate-pulse" />}
              {log.status === 'skipped' && <ChevronRight size={14} />}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-white uppercase tracking-tight">
                  {log.workflow?.name || 'Unknown Workflow'} 
                  <span className="mx-2 text-white/20">•</span>
                  <span className="text-white/40 font-medium normal-case tracking-normal">Node: {log.node_id}</span>
                </p>
                <span className="text-[10px] text-white/20">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </span>
              </div>
              
              {log.error_message ? (
                <p className="text-[10px] text-red-400/80 leading-relaxed font-mono">
                  Error: {log.error_message}
                </p>
              ) : (
                <p className="text-[10px] text-white/30 leading-relaxed">
                  Step completed successfully in {log.status === 'paused' ? 'Paused' : 'Active'} mode.
                </p>
              )}
            </div>

            {/* Status Hover Detail */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 ring-1 ring-inset ring-white/10 pointer-events-none transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}
