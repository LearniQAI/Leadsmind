'use client';

import { useState } from 'react';
import { Task, TaskPriority, TaskStatus } from '@/types/crm.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createTask, toggleTaskStatus, deleteTask } from '@/app/actions/contacts';
import { format } from 'date-fns';
import { 
  Trash2, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Circle, 
  CheckSquare, 
  AlertCircle,
  Clock,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TasksSectionProps {
  contactId: string;
  tasks: Task[];
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
  medium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  urgent: 'bg-red-500/10 text-red-500 border-red-500/20 shadow-lg shadow-red-500/10'
};

export function TasksSection({ contactId, tasks }: TasksSectionProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleAddTask() {
    if (!title.trim()) return;
    setIsPending(true);
    try {
      const result = await createTask({ 
        contactId, 
        title,
        priority,
        dueDate: dueDate || undefined
      });
      if (result.success) {
        toast.success('Task created');
        setTitle('');
        setPriority('medium');
        setDueDate('');
        setShowForm(false);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to create task');
    } finally {
      setIsPending(false);
    }
  }

  async function handleToggle(id: string, currentStatus: TaskStatus) {
    const newStatus: TaskStatus = currentStatus === 'done' ? 'todo' : 'done';
    try {
      const result = await toggleTaskStatus(id, newStatus, contactId);
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
    <div className="space-y-6">
      <div className="bg-[#0b0b10] border border-white/5 rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center">
                    <CheckSquare className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tight">Active Tasks</h3>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{tasks.filter(t => t.status !== 'done').length} pending actions</p>
                </div>
            </div>
            <Button 
                variant="ghost" 
                onClick={() => setShowForm(!showForm)}
                className="h-10 px-4 rounded-xl gap-2 font-bold text-white/40 hover:text-white hover:bg-white/5 border border-white/5 uppercase text-[10px] tracking-widest transition-all"
            >
                <Plus className={cn("h-4 w-4 transition-transform", showForm && "rotate-45")} />
                <span>{showForm ? 'Cancel' : 'New Task'}</span>
            </Button>
        </div>

        {showForm && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <Input 
                    placeholder="What needs to be done?" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    className="bg-white/3 border-white/5 text-white h-12 rounded-xl focus:border-blue-500/30 transition-all px-4 font-medium"
                />
                
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1">Priority</label>
                        <Select value={priority} onValueChange={(val) => setPriority(val as TaskPriority)}>
                            <SelectTrigger className="h-12 bg-white/3 border-white/5 rounded-xl text-white font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0b0b10] border-white/10">
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1">Due Date</label>
                        <Input 
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="h-12 bg-white/3 border-white/5 rounded-xl text-white font-bold"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button 
                            onClick={handleAddTask} 
                            disabled={isPending || !title.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-blue-600/20 w-full md:w-auto"
                        >
                            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Task'}
                        </Button>
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="space-y-3">
        {tasks.sort((a, b) => {
            if (a.status === 'done' && b.status !== 'done') return 1;
            if (a.status !== 'done' && b.status === 'done') return -1;
            const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
            const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
            return aDate - bDate;
        }).map((task) => (
          <div key={task.id} className={cn(
            "flex items-center gap-4 bg-[#0b0b10] border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/4 group",
            task.status === 'done' && "opacity-40 grayscale"
          )}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 hover:bg-transparent shrink-0"
              onClick={() => handleToggle(task.id, task.status)}
            >
               {task.status === 'done' ? (
                 <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-black" />
                 </div>
               ) : (
                 <div className="h-6 w-6 rounded-full border-2 border-white/10 group-hover:border-blue-500 transition-colors" />
               )}
            </Button>
            
            <div className="flex-1 flex flex-col gap-1 min-w-0">
               <span className={cn(
                 "text-sm font-bold text-white transition-all truncate",
                 task.status === 'done' && "line-through text-white/40"
               )}>
                 {task.title}
               </span>
               <div className="flex items-center gap-3">
                  {task.priority && (
                    <div className={cn(
                        "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border",
                        PRIORITY_COLORS[task.priority]
                    )}>
                        {task.priority}
                    </div>
                  )}
                  {task.due_date && (
                    <div className={cn(
                        "flex items-center gap-1.5",
                        new Date(task.due_date) < new Date() && task.status !== 'done' ? "text-red-500" : "text-white/20"
                    )}>
                        <Clock className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                        {format(new Date(task.due_date), 'MMM d')}
                        </span>
                    </div>
                  )}
               </div>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 text-white/10 hover:text-red-400 hover:bg-red-400/5 opacity-0 group-hover:opacity-100 transition-all rounded-xl shrink-0"
              onClick={() => handleDelete(task.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-white/10 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/2">
             <div className="h-16 w-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
                <CheckSquare className="h-8 w-8" />
             </div>
             <h4 className="text-sm font-black uppercase tracking-widest mb-1 text-white/30">Inbox Zero</h4>
             <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">All caught up with this contact.</p>
          </div>
        )}
      </div>
    </div>
  );
}
