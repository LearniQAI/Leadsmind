'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Building2,
  Contact,
  Plus,
  GitGraph,
  MessageSquare,
  Inbox
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { handleLogout } from '@/app/actions/auth';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';

interface SidebarProps {
  className?: string;
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

const navItems: { name: string; href: string; icon: React.ComponentType<{ className?: string }>; disabled?: boolean }[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Conversations', href: '/conversations', icon: MessageSquare },
  { name: 'Inbox', href: '/inbox', icon: Inbox },
  { name: 'Contacts', href: '/contacts', icon: Contact },
  { name: 'Pipelines', href: '/pipelines', icon: GitGraph },
  { name: 'Team Members', href: '/team-members', icon: Users },
  { name: 'Settings', href: '/settings/account', icon: Building2 },
];


export function Sidebar({ className, user, workspace }: SidebarProps) {
  const pathname = usePathname();

  async function onLogout() {
    try {
      await handleLogout();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to logout');
    }
  }

  const workspaceInitials = workspace?.name?.substring(0, 2).toUpperCase() || 'LM';
  const userInitials = user?.firstName?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <aside className={cn("flex flex-col h-full bg-[#0b0b10] border-r border-white/5", className)}>
      {/* Workspace Header */}
      <div className="flex h-20 items-center px-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#6c47ff] to-[#8b5cf6] text-white font-bold shadow-lg shadow-[#6c47ff]/20 overflow-hidden ring-1 ring-white/20">
            {workspace?.logoUrl ? (
              <Image src={workspace.logoUrl} alt={workspace.name} width={40} height={40} className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm tracking-tighter">{workspaceInitials}</span>
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-lg font-extrabold tracking-tighter text-white leading-tight">
              Leads<span className="text-[#fdab3d]">Mind</span>
            </span>
            <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest truncate">
              {workspace?.name || 'Workspace'}
            </span>
          </div>
        </Link>
      </div>

      {/* Primary Action */}
      <div className="px-4 py-6">
        <Link href="/contacts/new">
          <Button className="w-full h-11 rounded-xl bg-white/5 border border-white/10 text-white font-semibold gap-2 transition-all hover:bg-white/10 hover:border-white/20 shadow-sm cursor-pointer">
            <Plus className="h-4 w-4 text-[#6c47ff]" />
            <span>New Contact</span>
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-3">
        <TooltipProvider>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            if (item.disabled) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger className="w-full">
                    <div className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white/20 transition-all cursor-not-allowed">
                      <item.icon className="h-[18px] w-[18px]" />
                      <span>{item.name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#1a1a24] border-white/10 text-white text-[11px]">
                    Coming Soon
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive 
                    ? "bg-white/5 text-[#6c47ff] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" 
                    : "text-white/50 hover:bg-white/3 hover:text-white/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("h-[18px] w-[18px] transition-colors", isActive ? "text-[#6c47ff]" : "group-hover:text-white/70")} />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-[#6c47ff] shadow-[0_0_8px_rgba(108,71,255,0.8)]" />
                )}
              </Link>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* Footer Profile */}
      <div className="mt-auto p-4 space-y-3">
        <div className="relative group overflow-hidden rounded-2xl bg-white/3 border border-white/5 p-3 transition-all hover:bg-white/5 hover:border-white/10">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 rounded-xl border border-white/10">
              <AvatarImage src={user?.avatarUrl || ''} alt={user?.firstName || 'User'} />
              <AvatarFallback className="bg-[#6c47ff]/20 text-[#6c47ff] text-xs font-bold rounded-xl">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-white/90 truncate">
                {user?.firstName || 'User'}
              </span>
              <span className="text-[10px] text-white/30 truncate">
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        <Button 
          variant="ghost" 
          className="w-full justify-start h-11 rounded-xl gap-3 text-white/40 hover:bg-white/3 hover:text-white/70 transition-all font-medium"
          onClick={onLogout}
        >
          <LogOut className="h-[18px] w-[18px]" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}
