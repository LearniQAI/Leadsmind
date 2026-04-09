'use client';

import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TopBarProps {
  user?: {
    id: string;
    email?: string;
    firstName?: string;
    avatarUrl?: string | null;
  } | null;
  workspace?: {
    id: string;
    name: string;
    logoUrl?: string | null;
  } | null;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/settings/workspace': 'Workspace Settings',
  '/settings/team': 'Team Members',
  '/settings/account': 'Account Settings',
};

export function TopBar({ user, workspace }: TopBarProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'Dashboard';
  
  const userInitials = user?.firstName?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <header className="flex h-20 w-full items-center justify-between px-8 bg-background/50 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-bold tracking-tight text-foreground/90">{title}</h1>
        
        {/* Global Search Placeholder */}
        <div className="hidden lg:flex relative items-center max-w-sm">
          <Search className="absolute left-3 h-4 w-4 text-foreground/20" />
          <Input 
            placeholder="Search leads, tasks..." 
            className="h-10 w-[300px] pl-10 bg-white/3 border-white/5 rounded-full text-sm placeholder:text-foreground/20 focus:border-[#6c47ff]/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-10">
        <div className="flex items-center gap-4">
          {/* Notifications Placeholder */}
          <button className="relative p-2 text-foreground/40 hover:text-foreground/80 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#6c47ff] ring-2 ring-background" />
          </button>
          
          <div className="h-6 w-px bg-white/5 mx-2" />
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-foreground/80 uppercase tracking-widest leading-none mb-1">
                {workspace?.name || 'Workspace'}
              </span>
              <Badge variant="outline" className="h-5 px-1.5 bg-green-500/10 text-green-500 border-none text-[10px] font-bold uppercase tracking-tight">
                Active
              </Badge>
            </div>
            <Avatar className="h-9 w-9 rounded-xl border border-white/10 shadow-lg ring-2 ring-[#6c47ff]/5">
              <AvatarImage src={user?.avatarUrl || ''} alt={user?.firstName || 'User'} />
              <AvatarFallback className="bg-[#6c47ff]/10 text-[#6c47ff] text-xs font-extrabold">{userInitials}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
