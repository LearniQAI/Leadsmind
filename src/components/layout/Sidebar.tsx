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
  Inbox,
  FolderOpen,
  GraduationCap,
  CreditCard,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { handleLogout } from '@/app/actions/auth';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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

import {
  ChevronDown,
  ChevronRight,
  Share2,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

interface NavGroup {
  name: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    name: 'Main',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Conversations', href: '/conversations', icon: MessageSquare },
      { name: 'Inbox', href: '/inbox', icon: Inbox },
    ]
  },
  {
    name: 'Relations',
    items: [
      { name: 'Contacts', href: '/contacts', icon: Contact },
      { name: 'Pipelines', href: '/pipelines', icon: GitGraph },
    ]
  },
  {
    name: 'Marketing',
    items: [
      { name: 'Social Posts', href: '/social-posts', icon: Share2 },
      { name: 'Lead Forms', href: '/forms', icon: LayoutDashboard },
      { name: 'Automations', href: '/automations', icon: Zap },
    ]
  },
  {
    name: 'Workspace',
    items: [
      { name: 'Media Center', href: '/media', icon: FolderOpen },
      { name: 'Learning', href: '/courses', icon: GraduationCap },
      { name: 'Team Members', href: '/team-members', icon: Users },
    ]
  },
  {
    name: 'Account',
    items: [
      { name: 'Billing', href: '/settings/billing', icon: CreditCard },
      { name: 'Settings', href: '/settings/account', icon: Building2 },
      { name: 'Automation', href: '/settings/automation', icon: Zap },
    ]
  }
];

export function Sidebar({ className, user, workspace, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [isLogoutOpen, setIsLogoutOpen] = React.useState(false);
  const [collapsedGroups, setCollapsedGroups] = React.useState<string[]>(() => {
    // Collapse all groups except the one containing the active item
    return navGroups
      .filter(group => !group.items.some(item => 
        pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
      ))
      .map(group => group.name);
  });

  const toggleGroup = (name: string) => {
    if (isCollapsed) return; // Don't toggle groups when sidebar is collapsed
    setCollapsedGroups(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  async function onLogout() {
    try {
      await handleLogout();
    } catch (error) {
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        return;
      }
      toast.error('An unexpected error occurred during logout');
    }
  }

  const workspaceInitials = workspace?.name?.substring(0, 2).toUpperCase() || 'LM';
  const userInitials = user?.firstName?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || 'U';
  
  // Auto-expand group if it contains the active item when pathname changes
  React.useEffect(() => {
    const activeGroup = navGroups.find(group => 
      group.items.some(item => 
        pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
      )
    );
    
    if (activeGroup && collapsedGroups.includes(activeGroup.name)) {
      setCollapsedGroups(prev => prev.filter(name => name !== activeGroup.name));
    }
  }, [pathname]);

  return (
    <>
      <aside className={cn(
        "flex flex-col h-full bg-[#0b0b10] border-r border-white/5 transition-all duration-300",
        isCollapsed ? "w-[80px]" : "w-[280px]",
        className
      )}>
        {/* Workspace Header */}
        <div className={cn(
          "flex h-20 items-center border-b border-white/5 transition-all duration-300",
          isCollapsed ? "justify-center px-0" : "px-6"
        )}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#6c47ff] to-[#8b5cf6] text-white font-bold shadow-lg shadow-[#6c47ff]/20 overflow-hidden ring-1 ring-white/20">
              {workspace?.logoUrl ? (
                <Image src={workspace.logoUrl} alt={workspace.name} width={40} height={40} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm tracking-tighter">{workspaceInitials}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden animate-in fade-in duration-500">
                <span className="text-lg font-extrabold tracking-tighter text-white leading-tight">
                  Leads<span className="text-[#fdab3d]">Mind</span>
                </span>
                <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest truncate">
                  {workspace?.name || 'Workspace'}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Primary Action */}
        <div className={cn("py-6 transition-all duration-300", isCollapsed ? "px-4" : "px-4")}>
          <Link href="/contacts/new">
            <Button className={cn(
              "h-11 rounded-xl bg-white/5 border border-white/10 text-white font-semibold gap-2 transition-all hover:bg-white/10 hover:border-white/20 shadow-sm cursor-pointer",
              isCollapsed ? "w-10 p-0 justify-center mx-auto flex" : "w-full"
            )}>
              <Plus className="h-4 w-4 text-[#6c47ff]" />
              {!isCollapsed && <span className="animate-in fade-in duration-500 whitespace-nowrap">New Contact</span>}
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2 pb-6 px-3 scrollbar-none">
          <nav className={cn("transition-all duration-300", isCollapsed ? "space-y-4" : "space-y-6")}>
            <TooltipProvider delay={0}>
              {navGroups.map((group) => {
                const isGroupCollapsed = collapsedGroups.includes(group.name);

                return (
                  <div key={group.name} className="space-y-2">
                    {!isCollapsed && (
                      <button
                        onClick={() => toggleGroup(group.name)}
                        className="flex items-center justify-between w-full px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors animate-in fade-in duration-500"
                      >
                        {group.name}
                        {isGroupCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    )}

                    {isCollapsed && (
                      <div className="h-px bg-white/5 mx-2 my-4" />
                    )}

                    {(!isGroupCollapsed || isCollapsed) && (
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                          const content = (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "group flex items-center rounded-xl transition-all duration-300 relative",
                                isCollapsed ? "justify-center p-2.5" : "justify-between px-4 py-2 text-sm font-medium",
                                isActive
                                  ? "bg-white/5 text-[#6c47ff] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                                  : "text-white/40 hover:bg-white/3 hover:text-white/80"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <item.icon className={cn("h-[18px] w-[18px] transition-all duration-300", isActive ? "text-[#6c47ff] scale-110" : "group-hover:text-white/70")} />
                                {!isCollapsed && <span className="relative z-10 animate-in fade-in duration-500 whitespace-nowrap">{item.name}</span>}
                              </div>
                              {!isCollapsed && isActive && (
                                <div className="h-1.5 w-1.5 rounded-full bg-[#6c47ff] shadow-[0_0_12px_rgba(108,71,255,0.8)]" />
                              )}
                              {isActive && isCollapsed && (
                                <div className="absolute left-0 w-1 h-5 bg-[#6c47ff] rounded-r-full shadow-[0_0_15px_rgba(108,71,255,0.5)]" />
                              )}
                            </Link>
                          );

                          if (isCollapsed) {
                            return (
                              <Tooltip key={item.name}>
                                <TooltipTrigger render={content} />
                                <TooltipContent side="right" className="bg-[#1a1a24] border-white/10 text-white text-[11px] font-bold">
                                  {item.name}
                                </TooltipContent>
                              </Tooltip>
                            );
                          }

                          return content;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </TooltipProvider>
          </nav>
        </div>

        {/* Footer Profile & Toggle */}
        <div className="mt-auto p-4 space-y-3">
          <div className={cn(
            "relative group overflow-hidden rounded-2xl bg-white/3 border border-white/5 p-3 transition-all hover:bg-white/5 hover:border-white/10",
            isCollapsed ? "p-2 aspect-square flex items-center justify-center" : "p-3"
          )}>
            <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "")}>
              <Avatar className="h-9 w-9 rounded-xl border border-white/10 shrink-0">
                <AvatarImage src={user?.avatarUrl || ''} alt={user?.firstName || 'User'} />
                <AvatarFallback className="bg-[#6c47ff]/20 text-[#6c47ff] text-xs font-bold rounded-xl">{userInitials}</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden animate-in fade-in duration-500">
                  <span className="text-sm font-bold text-white/90 truncate">
                    {user?.firstName || 'User'}
                  </span>
                  <span className="text-[10px] text-white/30 truncate">
                    {user?.email}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              className={cn(
                "w-full h-11 rounded-xl text-white/40 hover:bg-white/3 hover:text-white/70 transition-all font-medium",
                isCollapsed ? "justify-center px-0" : "justify-start gap-3"
              )}
              onClick={() => setIsLogoutOpen(true)}
            >
              <LogOut className="h-[18px] w-[18px]" />
              {!isCollapsed && <span className="animate-in fade-in duration-500">Sign Out</span>}
            </Button>

            {onToggleCollapse && (
              <Button
                variant="ghost"
                className={cn(
                  "w-full h-11 rounded-xl text-white/20 hover:bg-white/3 hover:text-white/70 transition-all font-medium",
                  isCollapsed ? "justify-center px-0" : "justify-start gap-3"
                )}
                onClick={onToggleCollapse}
              >
                {isCollapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
                {!isCollapsed && <span className="animate-in fade-in duration-500">Collapse Sidebar</span>}
              </Button>
            )}
          </div>
        </div>
      </aside>

      <AlertDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <AlertDialogContent className="bg-[#0b0b10] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              You will need to sign back in to access your dashboard and conversations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
