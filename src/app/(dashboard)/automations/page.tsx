import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getWorkflows } from '@/app/actions/automation';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Zap,
  Play,
  Settings,
  Clock,
  ArrowRight,
  MoreVertical,
  Edit,
  History
} from 'lucide-react';
import Link from 'next/link';
import { DeleteAutomationItem } from '@/components/automation/DeleteAutomationItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { getCurrentWorkspace } from '@/lib/auth';

export default async function AutomationsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect('/login');

  const workflows = await getWorkflows(workspace.id);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Automations</h1>
          <p className="text-sm text-white/40 font-medium">Create and manage automated workflows for your workspace.</p>
        </div>
        <Link href="/automations/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 h-11 rounded-xl shadow-lg shadow-blue-600/20 gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="h-4 w-4" />
            <span>New Automation</span>
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <WorkflowsTable workflows={workflows} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/5">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
           <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Total Executions</p>
           <p className="text-2xl font-bold text-white">1,284</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
           <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Success Rate</p>
           <p className="text-2xl font-bold text-emerald-400">99.2%</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
           <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Active Workflows</p>
           <p className="text-2xl font-bold text-blue-400">{workflows.filter(w => w.is_active).length}</p>
        </div>
      </div>
    </div>
  );
}
