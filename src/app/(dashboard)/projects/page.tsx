'use client';

import { 
  FolderKanban, 
  Plus, 
  MoreHorizontal, 
  Users, 
  Clock, 
  CheckCircle2,
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ProjectsPage() {
  const columns = [
    { name: 'Planning', count: 3, color: '#6c47ff' },
    { name: 'Active', count: 5, color: '#2563eb' },
    { name: 'On Hold', count: 1, color: '#f59e0b' },
    { name: 'Completed', count: 12, color: '#10b981' }
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Project Board</h1>
          <p className="text-white/50 text-sm mt-1">Track and manage client project delivery.</p>
        </div>
        <div className="flex gap-4">
           <Button className="bg-[#6c47ff] hover:bg-[#8b5cf6] text-white gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input 
            placeholder="Search projects..." 
            className="pl-10 bg-[#0b0b10] border-white/5 text-white"
          />
        </div>
        <Button variant="ghost" className="text-white/40"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px]">
        {columns.map((column) => (
          <div key={column.name} className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-3.5 rounded-full" style={{ backgroundColor: column.color }} />
                 <span className="text-sm font-bold text-white uppercase tracking-widest">{column.name}</span>
                 <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/40 font-bold">{column.count}</span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
               {[1, 2].map((card) => (
                 <div key={card} className="p-5 rounded-2xl bg-[#0b0b10] border border-white/5 hover:border-[#6c47ff]/30 transition-all cursor-grab group">
                    <div className="flex items-center justify-between mb-4">
                       <Badge variant="outline" className="text-[10px] border-white/10 text-white/30 px-2 py-0">Web App</Badge>
                       <Button variant="ghost" size="icon" className="h-6 w-6 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                         <MoreHorizontal className="h-4 w-4" />
                       </Button>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-2 leading-tight">Leadsmind UI Enhancement</h4>
                    <p className="text-[11px] text-white/40 line-clamp-2 mb-6">
                      Improving the sidebar navigation and mobile responsiveness for the core CRM app.
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                       <div className="flex -space-x-2">
                          <div className="h-6 w-6 rounded-full border-2 border-[#0b0b10] bg-[#6c47ff] text-[8px] flex items-center justify-center text-white font-bold">JD</div>
                          <div className="h-6 w-6 rounded-full border-2 border-[#0b0b10] bg-emerald-500 text-[8px] flex items-center justify-center text-white font-bold">AS</div>
                       </div>
                       <div className="flex items-center gap-1.5 text-white/30">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold">4/12</span>
                       </div>
                    </div>
                 </div>
               ))}
               
               <Button variant="ghost" className="w-full border-2 border-dashed border-white/5 hover:border-white/10 hover:bg-white/[0.02] text-white/20 h-12 rounded-2xl text-xs gap-2">
                  <Plus className="h-4 w-4" /> Add Task
               </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
