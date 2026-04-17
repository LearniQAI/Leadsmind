"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  Zap, 
  Play, 
  Clock,
  ExternalLink,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateWorkflowStatus, deleteWorkflow, duplicateWorkflow } from "@/app/actions/automation";

interface WorkflowsTableProps {
  workflows: any[];
}

export function WorkflowsTable({ workflows }: WorkflowsTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    try {
      const result = await updateWorkflowStatus(id, !currentStatus);
      if (result.success) {
        toast.success(`Workflow ${!currentStatus ? 'activated' : 'deactivated'}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this automation?")) return;
    
    setLoadingId(id);
    try {
      const result = await deleteWorkflow(id);
      if (result.success) {
        toast.success("Automation deleted");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setLoadingId(id);
    try {
      const result = await duplicateWorkflow(id);
      if (result.success) {
        toast.success("Automation duplicated");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to duplicate");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-white/5 bg-[#05050a] overflow-hidden">
      <Table>
        <TableHeader className="bg-white/[0.02]">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-white/40 font-bold uppercase text-[10px] tracking-widest py-4">Name</TableHead>
            <TableHead className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Trigger</TableHead>
            <TableHead className="text-white/40 font-bold uppercase text-[10px] tracking-widest text-center">Status</TableHead>
            <TableHead className="text-white/40 font-bold uppercase text-[10px] tracking-widest text-center">Steps</TableHead>
            <TableHead className="text-white/40 font-bold uppercase text-[10px] tracking-widest text-center">Times Ran</TableHead>
            <TableHead className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Last Run</TableHead>
            <TableHead className="w-[80px] text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workflows.map((wf) => (
            <TableRow key={wf.id} className="border-white/5 hover:bg-white/[0.01] transition-colors group">
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <Link href={`/automations/${wf.id}/edit`} className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                    {wf.name}
                  </Link>
                  <span className="text-[10px] text-white/30 truncate max-w-[200px]">
                    {wf.description || "No description provided"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Zap size={12} className="text-blue-400" />
                  </div>
                  <span className="text-[11px] font-bold text-white/60 uppercase tracking-tight">
                    {wf.trigger_type.replace('_', ' ')}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Switch 
                    checked={wf.is_active} 
                    onCheckedChange={() => handleStatusToggle(wf.id, wf.is_active)}
                    disabled={loadingId === wf.id}
                  />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="bg-white/5 border-white/5 text-[10px] font-bold">
                  {wf.steps_count || 0}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <span className="text-xs font-medium text-white/40">
                  {wf.execution_count || 0}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-xs text-white/40 font-medium">
                  {wf.last_run_at ? format(new Date(wf.last_run_at), 'MMM d, HH:mm') : 'Never'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/20 hover:text-white hover:bg-white/5">
                      {loadingId === wf.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                    </Button>
                  } />
                  <DropdownMenuContent align="end" className="bg-[#0c0c14] border-white/10 text-white min-w-[160px]">
                    <Link href={`/automations/${wf.id}/edit`}>
                      <DropdownMenuItem className="gap-2 cursor-pointer py-2">
                        <Edit size={14} className="text-white/40" />
                        <span>Edit Logic</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className="gap-2 cursor-pointer py-2" onClick={() => handleDuplicate(wf.id)}>
                      <Copy size={14} className="text-white/40" />
                      <span>Duplicate</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem 
                      className="gap-2 cursor-pointer py-2 text-rose-400 focus:text-rose-400"
                      onClick={() => handleDelete(wf.id)}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {workflows.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-64 text-center">
                <div className="flex flex-col items-center gap-4 text-white/20">
                  <Zap size={40} className="opacity-20" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white/40">No workflows found</p>
                    <p className="text-xs">Create your first automation to start saving time.</p>
                  </div>
                  <Button variant="outline" className="mt-2 border-white/10 hover:bg-white/5" asChild>
                    <Link href="/automations/new">Create Automation</Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
