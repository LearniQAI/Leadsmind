'use client';

import { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  MoreHorizontal, 
  Users, 
  Clock, 
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  GripHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { createProject } from '@/app/actions/projects';
import { toast } from 'sonner';

interface ProjectsClientProps {
  initialProjects: any[];
}

const COLUMNS = [
  { id: 'planning', name: 'Planning', color: '#6c47ff' },
  { id: 'active', name: 'Active', color: '#2563eb' },
  { id: 'on_hold', name: 'On Hold', color: '#f59e0b' },
  { id: 'completed', name: 'Completed', color: '#10b981' }
];

export function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [isCreating, setIsCreating] = useState(false);

  const handleAddProject = async () => {
    const name = prompt('Project Name:');
    if (!name) return;

    setIsCreating(true);
    try {
      const newProj = await createProject({ name, status: 'planning' });
      setProjects([newProj, ...projects]);
      toast.success('Project created');
    } catch (err) {
      toast.error('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Project Board</h1>
          <p className="text-white/50 text-sm mt-1">Track and manage client project delivery.</p>
        </div>
        <div className="flex gap-4">
           <Button 
             onClick={handleAddProject}
             disabled={isCreating}
             className="bg-[#6c47ff] hover:bg-[#8b5cf6] text-white gap-2 rounded-xl h-11 px-6 font-bold shadow-lg shadow-[#6c47ff]/20"
           >
            <Plus className="h-4 w-4" />
            {isCreating ? 'Creating...' : 'New Project'}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input 
            placeholder="Search projects..." 
            className="pl-10 bg-[#0b0b10] border-white/5 text-white rounded-xl h-11"
          />
        </div>
        <Button variant="ghost" className="text-white/40"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px]">
        {COLUMNS.map((column) => {
          const colProjects = projects.filter(p => p.status === column.id);
          
          return (
            <div key={column.id} className="flex flex-col gap-6 bg-white/[0.01] rounded-3xl p-2 border border-white/[0.02]">
              <div className="flex items-center justify-between px-4 pt-2">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: column.color }} />
                   <span className="text-xs font-black text-white/90 uppercase tracking-[0.2em]">{column.name}</span>
                   <span className="px-2 py-0.5 rounded-lg bg-white/5 text-[10px] text-white/30 font-black">{colProjects.length}</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 px-2">
                 {colProjects.length === 0 ? (
                   <div className="h-24 flex items-center justify-center border border-dashed border-white/5 rounded-2xl">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/10">No projects</span>
                   </div>
                 ) : (
                   colProjects.map((project) => (
                     <div key={project.id} className="p-5 rounded-2xl bg-[#0b0b10] border border-white/5 hover:border-[#6c47ff]/30 transition-all cursor-grab group shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                           <Badge variant="outline" className="text-[9px] border-white/10 text-white/20 px-2 py-0 font-black uppercase tracking-widest">
                             {project.contact ? 'Client Project' : 'Internal'}
                           </Badge>
                           <GripHorizontal className="h-4 w-4 text-white/5 group-hover:text-white/20 transition-colors" />
                        </div>
                        <h4 className="text-sm font-bold text-white mb-2 leading-tight group-hover:text-[#6c47ff] transition-colors">{project.name}</h4>
                        <p className="text-[11px] text-white/30 line-clamp-2 mb-6 font-medium">
                          {project.description || 'No description provided for this project yet.'}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                           <div className="flex -space-x-2">
                              <div className="h-6 w-6 rounded-full border-2 border-[#0b0b10] bg-[#6c47ff] text-[8px] flex items-center justify-center text-white font-bold ring-2 ring-[#6c47ff]/20">ME</div>
                           </div>
                           <div className="flex items-center gap-1.5 text-white/20">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-black">{project.tasks?.[0]?.count || 0} Tasks</span>
                           </div>
                        </div>
                     </div>
                   ))
                 )}
                 
                 <Button variant="ghost" className="w-full border-2 border-dashed border-white/5 hover:border-white/10 hover:bg-white/[0.02] text-white/10 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest gap-2 transition-all">
                    <Plus className="h-4 w-4" /> Quick Add Project
                 </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
