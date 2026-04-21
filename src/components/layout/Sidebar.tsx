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
  CalendarDays,
  FolderOpen,
  GraduationCap,
  CreditCard,
  Zap,
  FileText,
  User,
  Settings,
  Users2,
  Palette,
  Home,
  MessageCircle,
  KanbanSquare,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { handleLogout } from '@/app/actions/auth';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
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
    plan?: string;
    branding?: {
      platformName?: string | null;
      logoUrl?: string | null;
      primaryColor?: string | null;
    } | null;
  } | null;
  role?: string | null;
}

import {
  ChevronRight,
  Share2,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface NavItem {
  label: string;
  route: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  adminOnly?: boolean;
}


const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',   icon: Home,          route: '/dashboard',          adminOnly: false },
  { label: 'Contacts',    icon: Users,         route: '/contacts',           adminOnly: false },
  { label: 'Pipelines',   icon: KanbanSquare,  route: '/pipelines',          adminOnly: false },
  { label: 'Inbox',       icon: MessageCircle, route: '/inbox',              adminOnly: false },
  { label: 'Automations', icon: Zap,           route: '/automations',        adminOnly: true  },
  { label: 'Courses',     icon: BookOpen,      route: '/courses',            adminOnly: false },
  { label: 'Analytics',   icon: BarChart3,     route: '/analytics',          adminOnly: true  },
  { label: 'Invoices',    icon: FileText,      route: '/invoices',           adminOnly: true  },
];

const SETTINGS_ITEMS: NavItem[] = [
  { label: 'Account',     icon: User,          route: '/settings/account',   adminOnly: false },
  { label: 'Workspace',   icon: Settings,      route: '/settings/workspace', adminOnly: true  },
  { label: 'Team',        icon: Users2,        route: '/settings/team',      adminOnly: true  },
  { label: 'Branding',    icon: Palette,       route: '/settings/branding',  adminOnly: true  },
  { label: 'Billing',     icon: CreditCard,    route: '/settings/billing',   adminOnly: true  },
];

export function Sidebar({ className, user, workspace, role, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [isLogoutOpen, ReactSetIsLogoutOpen] = React.useState(false);

  const toggleGroup = () => {};

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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white font-bold overflow-hidden ring-1 ring-white/20" style={{ background: 'var(--primary, linear-gradient(to bottom right, #6c47ff, #8b5cf6))', boxShadow: '0 4px 14px 0 rgba(var(--primary-rgb, 108, 71, 255), 0.39)' }}>
              {workspace?.branding?.logoUrl || workspace?.logoUrl ? (
                <img src={workspace?.branding?.logoUrl || workspace?.logoUrl || ''} alt={workspace?.branding?.platformName || workspace?.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm tracking-tighter">{workspace?.branding?.platformName?.substring(0,2).toUpperCase() || workspaceInitials}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden animate-in fade-in duration-500">
                <span className="text-lg font-extrabold tracking-tighter text-white leading-tight">
                  {workspace?.branding?.platformName ? (
                     <>{workspace.branding.platformName}</>
                  ) : (
                     <>Leads<span style={{ color: 'var(--primary, #fdab3d)' }}>Mind</span></>
                  )}
                </span>
                <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest truncate">
                  {workspace?.name || 'Workspace'}
                </span>
                {workspace?.plan === 'enterprise' && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Badge className="text-[8px] px-1.5 py-0 rounded-full font-black uppercase tracking-tighter" style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary, #6c47ff)', borderColor: 'rgba(var(--primary-rgb), 0.2)' }}>
                      Enterprise
                    </Badge>
                  </div>
                )}
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
            )} style={{ borderColor: 'var(--primary, #6c47ff)22' }}>
              <Plus className="h-4 w-4" style={{ color: 'var(--primary, #6c47ff)' }} />
              {!isCollapsed && <span className="animate-in fade-in duration-500 whitespace-nowrap">New Contact</span>}
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2 pb-6 px-3 scrollbar-none">
          <nav className={cn("space-y-1 transition-all duration-300", isCollapsed ? "mt-4" : "mt-2")}>
            <TooltipProvider delay={0}>
              {/* Main Navigation Items */}
              {NAV_ITEMS.map((item) => {
                if (item.adminOnly && role !== 'admin') return null;
                const isActive = pathname === item.route || pathname.startsWith(item.route + '/');

                const content = (
                  <Link
                    key={item.route}
                    href={item.route}
                    className={cn(
                      "group flex items-center rounded-xl transition-all duration-300 relative",
                      isCollapsed ? "justify-center p-2.5" : "justify-between px-4 py-2 text-sm font-medium",
                      isActive
                        ? "bg-white/5 text-[#6c47ff] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                        : "text-white/40 hover:bg-white/3 hover:text-white/80"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("h-[18px] w-[18px] transition-all duration-300", isActive ? "scale-110" : "group-hover:text-white/70")} style={{ color: isActive ? 'var(--primary, #6c47ff)' : undefined }} />
                      {!isCollapsed && <span className="relative z-10 animate-in fade-in duration-500 whitespace-nowrap" style={{ color: isActive ? 'var(--primary, #6c47ff)' : undefined }}>{item.label}</span>}
                    </div>
                    {!isCollapsed && isActive && (
                      <div className="h-1.5 w-1.5 rounded-full shadow-[0_0_12px_rgba(108,71,255,0.8)]" style={{ backgroundColor: 'var(--primary, #6c47ff)' }} />
                    )}
                    {isActive && isCollapsed && (
                      <div className="absolute left-0 w-1 h-5 rounded-r-full shadow-[0_0_15px_rgba(108,71,255,0.5)]" style={{ backgroundColor: 'var(--primary, #6c47ff)' }} />
                    )}
                  </Link>
                );

                return isCollapsed ? (
                  <Tooltip key={item.label}>
                    <TooltipTrigger render={content} />
                    <TooltipContent side="right" className="bg-[#1a1a24] border-white/10 text-white text-[11px] font-bold">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : content;
              })}

              {!isCollapsed && (
                <div className="px-4 mt-6 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Settings</span>
                </div>
              )}
              {isCollapsed && <div className="h-px bg-white/5 mx-2 my-4" />}

              {/* Settings Items */}
              {SETTINGS_ITEMS.map((item) => {
                if (item.adminOnly && role !== 'admin') return null;
                const isActive = pathname === item.route || pathname.startsWith(item.route + '/');

                const content = (
                  <Link
                    key={item.route}
                    href={item.route}
                    className={cn(
                      "group flex items-center rounded-xl transition-all duration-300 relative",
                      isCollapsed ? "justify-center p-2.5" : "justify-between px-4 py-2 text-sm font-medium",
                      isActive
                        ? "bg-white/5 text-[#6c47ff] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                        : "text-white/40 hover:bg-white/3 hover:text-white/80"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("h-[18px] w-[18px] transition-all duration-300", isActive ? "scale-110" : "group-hover:text-white/70")} style={{ color: isActive ? 'var(--primary, #6c47ff)' : undefined }} />
                      {!isCollapsed && <span className="relative z-10 animate-in fade-in duration-500 whitespace-nowrap" style={{ color: isActive ? 'var(--primary, #6c47ff)' : undefined }}>{item.label}</span>}
                    </div>
                    {!isCollapsed && isActive && (
                      <div className="h-1.5 w-1.5 rounded-full shadow-[0_0_12px_rgba(108,71,255,0.8)]" style={{ backgroundColor: 'var(--primary, #6c47ff)' }} />
                    )}
                    {isActive && isCollapsed && (
                      <div className="absolute left-0 w-1 h-5 rounded-r-full shadow-[0_0_15px_rgba(108,71,255,0.5)]" style={{ backgroundColor: 'var(--primary, #6c47ff)' }} />
                    )}
                  </Link>
                );

                return isCollapsed ? (
                  <Tooltip key={item.label}>
                    <TooltipTrigger render={content} />
                    <TooltipContent side="right" className="bg-[#1a1a24] border-white/10 text-white text-[11px] font-bold">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : content;
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
              onClick={() => ReactSetIsLogoutOpen(true)}
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

      <AlertDialog open={isLogoutOpen} onOpenChange={ReactSetIsLogoutOpen}>
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
