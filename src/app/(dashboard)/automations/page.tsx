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
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect('/login');

  const workflows = await getWorkflows(workspace.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Automations</h1>
          <p className="mt-2 text-white/50">Streamline your workflow with powerful If-This-Then-That logic.</p>
        </div>
        <Link href="/automations/new">
          <Button className="bg-[#6c47ff] hover:bg-[#5b3ce0] gap-2">
            <Plus className="h-4 w-4" />
            <span>New Automation</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white/3 border border-dashed border-white/10 rounded-3xl">
            <Zap className="h-12 w-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30">No automations created yet.</p>
            <Link href="/automations/new" className="mt-4 inline-block">
              <Button variant="link" className="text-[#6c47ff]">Create your first workflow</Button>
            </Link>
          </div>
        ) : (
          workflows.map((wf) => (
            <Card key={wf.id} className="bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10 transition-all border-l-4 border-l-[#6c47ff]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg">{wf.name}</CardTitle>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mt-1">
                    Trigger: {wf.trigger_type}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/30">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  } />
                  <DropdownMenuContent align="end" className="bg-[#1a1a24] border-white/5 text-white">
                    <DropdownMenuItem>Edit Logic</DropdownMenuItem>
                    <DropdownMenuItem>View Logs</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-[#6c47ff]/20 flex items-center justify-center">
                    <Zap className="h-3 w-3 text-[#6c47ff]" />
                  </div>
                  <ArrowRight className="h-3 w-3 text-white/10" />
                  <div className="flex -space-x-1">
                    <div className="h-6 w-6 rounded-lg bg-green-500/20 flex items-center justify-center border border-[#0b0b10]">
                      <Clock className="h-3 w-3 text-green-400" />
                    </div>
                    <div className="h-6 w-6 rounded-lg bg-blue-500/20 flex items-center justify-center border border-[#0b0b10]">
                      <Play className="h-3 w-3 text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {wf.status === 'active' ? (
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-white/5 text-white/40 border-white/10">
                      Draft
                    </Badge>
                  )}

                  <Link href={`/automations/${wf.id}/edit`}>
                    <Button variant="ghost" className="text-xs text-[#6c47ff] hover:text-[#5b3ce0] hover:bg-transparent p-0">
                      Customize Workflow
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
