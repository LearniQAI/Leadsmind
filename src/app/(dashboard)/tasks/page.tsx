import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { getTasks } from '@/app/actions/contacts';
import { Button } from '@/components/ui/button';
import { 
  CheckSquare, 
  Plus, 
  Filter, 
  LayoutGrid, 
  List, 
  Calendar as CalendarIcon,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { GlobalTaskList } from '@/components/crm/GlobalTaskList';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) redirect('/login');

  const { status, q } = await searchParams;
  const result = await getTasks({
    status: status as any
  });

  const tasks = result.success ? (result.data ?? []) : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Task Center</h1>
          <p className="text-sm text-white/40 font-medium">Manage your workspace actions and follow-ups.</p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-11 px-6 rounded-xl gap-2 font-bold text-white/40 hover:text-white hover:bg-white/5 border border-white/5 uppercase text-[10px] tracking-widest transition-all">
              <Filter size={16} />
              <span>Filters</span>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-6 rounded-xl gap-2 font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Plus className="h-5 w-5" />
              <span>New Task</span>
            </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 relative group w-full md:w-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500/50">
            <Search className="h-4 w-4 text-white/10" />
          </div>
          <Input 
            placeholder="Search tasks..." 
            className="pl-11 h-12 bg-[#08080f] border-white/5 text-white placeholder:text-white/10 rounded-xl focus:border-white/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#08080f] border border-white/5 p-1 rounded-xl">
            <Button variant="ghost" size="sm" className="h-9 px-3 rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/5">
                <List size={14} className="text-blue-500" />
                List
            </Button>
            <Button variant="ghost" size="sm" className="h-9 px-3 rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white hover:bg-white/5">
                <LayoutGrid size={14} />
                Board
            </Button>
            <Button variant="ghost" size="sm" className="h-9 px-3 rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white hover:bg-white/5">
                <CalendarIcon size={14} />
                Calendar
            </Button>
        </div>
      </div>

      <GlobalTaskList tasks={tasks} />
    </div>
  );
}
