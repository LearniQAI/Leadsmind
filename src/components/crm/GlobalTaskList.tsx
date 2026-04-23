'use client';

import { Task, TaskPriority, TaskStatus } from '@/types/crm.types';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { 
  Trash2, 
  CheckCircle2, 
  CheckSquare, 
  Clock,
  ExternalLink,
  User,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleTaskStatus, deleteTask } from '@/app/actions/contacts';
import { toast } from 'sonner';
import Link from 'next/link';

interface GlobalTaskListProps {
  tasks: Task[];
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
  medium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  urgent: 'bg-red-500/10 text-red-500 border-red-500/20 shadow-lg shadow-red-500/10'
};

export function GlobalTaskList({ tasks }: GlobalTaskListProps) {
  
  async function handleToggle(id: string, currentStatus: TaskStatus) {
    const newStatus: TaskStatus = currentStatus === 'done' ? 'todo' : 'done';
    try {
      const result = await toggleTaskStatus(id, newStatus);
      if (result.success) {
        toast.success(newStatus === 'done' ? 'Task completed' : 'Task reopened');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to update task');
    }
  }

  async function handleDelete(id: string) {
    try {
      const result = await deleteTask(id);
      if (result.success) {
        toast.success('Task deleted');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to delete task');
    }
  }

  return (
    <div className="space-y-4">
      {tasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={cn(
                "group relative bg-[#0b0b10] border border-white/5 rounded-2xl p-4 flex items-center gap-6 transition-all hover:bg-white/3 hover:border-white/10",
                task.status === 'done' && "opacity-40 grayscale"
              )}
            >
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 p-0 hover:bg-transparent shrink-0"
                    onClick={() => handleToggle(task.id, task.status)}
                >
                    {task.status === 'done' ? (
                        <div className="h-7 w-7 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                            <CheckCircle2 className="h-4 w-4 text-black" />
                        </div>
                    ) : (
                        <div className="h-7 w-7 rounded-full border-2 border-white/10 group-hover:border-blue-500 transition-all duration-300" />
                    )}
                </Button>

                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-3">
                        <span className={cn(
                            "text-base font-bold text-white transition-all truncate",
                            task.status === 'done' && "line-through text-white/40"
                        )}>
                            {task.title}
                        </span>
                        {task.priority && (
                            <div className={cn(
                                "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border shrink-0",
                                PRIORITY_COLORS[task.priority]
                            )}>
                                {task.priority}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        {task.due_date && (
                            <div className={cn(
                                "flex items-center gap-1.5",
                                new Date(task.due_date) < new Date() && task.status !== 'done' ? "text-red-500" : "text-white/20"
                            )}>
                                <Clock className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {format(new Date(task.due_date), 'MMM d, yyyy')}
                                </span>
                            </div>
                        )}

                        {task.contact_id && (
                            <Link href={`/contacts/${task.contact_id}`} className="flex items-center gap-1.5 text-white/20 hover:text-blue-400 transition-colors">
                                <User className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Contact Link</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                            </Link>
                        )}

                        {task.related_type && task.related_id && task.related_type !== 'contact' && (
                            <div className="flex items-center gap-1.5 text-white/20">
                                <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-white/5 rounded-md">
                                    {task.related_type}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl text-white/20 hover:text-white hover:bg-white/5"
                    >
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-white/10 hover:text-red-400 hover:bg-red-400/5 rounded-xl shrink-0"
                        onClick={() => handleDelete(task.id)}
                    >
                        <Trash2 className="h-4.5 w-4.5" />
                    </Button>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-white/10 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2">
             <div className="h-20 w-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-6">
                <CheckSquare className="h-10 w-10" />
             </div>
             <h4 className="text-xl font-black uppercase italic tracking-tight mb-2 text-white/30">Everything is clear</h4>
             <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">No pending tasks found in this view.</p>
        </div>
      )}
    </div>
  );
}
