'use client';

import { useState } from 'react';
import { Workspace } from '@/types/workspace.types';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ChevronRight } from 'lucide-react';

interface WorkspacePickerProps {
  workspaces: (Workspace & { role: string })[];
  onSelect: (workspace: Workspace) => void;
}

export function WorkspacePicker({ workspaces, onSelect }: WorkspacePickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  const handleSelect = (workspace: Workspace) => {
    setSelectedId(workspace.id);
    onSelect(workspace);
  };

  return (
    <div className="w-full">
      <CardHeader className="space-y-1 px-0 pb-8 text-center">
        <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">Pick a workspace</CardTitle>
        <CardDescription className="text-sm font-light text-foreground/40">
          Select where you want to continue your work today.
        </CardDescription>
      </CardHeader>
      
      <div className="space-y-3">
        {workspaces.map((workspace) => (
          <button
            key={workspace.id}
            disabled={selectedId !== null}
            onClick={() => handleSelect(workspace)}
            className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-[20px] border p-4 transition-all duration-300 ${
              selectedId === workspace.id 
                ? 'border-[#6c47ff] bg-[#6c47ff]/10 shadow-[0_0_20px_rgba(108,71,255,0.2)]' 
                : 'border-white/5 bg-white/3 hover:border-[#6c47ff]/30 hover:bg-white/5 hover:-translate-y-0.5'
            }`}
          >
            <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(108,71,255,0.05)_0%,transparent_70%)] opacity-0 transition-opacity group-hover:opacity-100 ${selectedId === workspace.id ? 'opacity-100' : ''}`} />
            
            <Avatar className="h-12 w-12 border border-white/10 shadow-sm">
              {workspace.logoUrl && (
                <AvatarImage src={workspace.logoUrl} alt={workspace.name} />
              )}
              <AvatarFallback className="bg-linear-to-br from-[#6c47ff] to-[#8b5cf6] text-sm font-bold text-white">
                {getInitials(workspace.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-start overflow-hidden text-left">
              <span className="w-full truncate text-[0.95rem] font-bold tracking-tight text-foreground">
                {workspace.name}
              </span>
              <span className="text-[0.7rem] font-medium uppercase tracking-wider text-foreground/30 group-hover:text-[#6c47ff]/60 transition-colors">
                {workspace.role === 'admin' ? 'Workspace Owner' : workspace.role}
              </span>
            </div>

            <div className="ml-auto">
              {selectedId === workspace.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#6c47ff]" />
              ) : (
                <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-[#6c47ff] transition-all group-hover:translate-x-0.5" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-[0.7rem] font-medium text-foreground/20">
          Need a new workspace? <span className="text-foreground/40 hover:text-[#6c47ff] cursor-pointer underline underline-offset-4">Create one here</span>
        </p>
      </div>
    </div>
  );
}
