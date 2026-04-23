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
  Receipt,
  Sparkles,
  Brain,
  Award,
  BarChart3,
  Globe,
  Filter,
  FileText,
  User,
  Settings,
  Users2,
  Palette,
  ChevronDown,
  ChevronRight,
  Share2,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  MessageCircle,
  KanbanSquare,
  BookOpen,
  Send,
  ClipboardList,
  Star,
  Megaphone,
  Package,
  ShoppingBag,
  FolderKanban,
  FileSignature,
  LifeBuoy,
  Code2,
  Webhook,
  Store,
  Shield,
  Plug,
  Mail,
  Box,
} from 'lucide-react';


import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { handleLogout } from '@/app/actions/auth';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/info-tooltip';
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

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  adminOnly?: boolean;
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
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Tasks', href: '/tasks', icon: CheckSquare },
      { name: 'Conversations', href: '/conversations', icon: MessageSquare },
      { name: 'Inbox', href: '/inbox', icon: MessageCircle },
    ]
  },
  {
    name: 'Relations',
    items: [
      { name: 'Contacts', href: '/contacts', icon: Users },
      { name: 'Pipelines', href: '/pipelines', icon: KanbanSquare },
      { name: 'Proposals', href: '/proposals', icon: FileSignature },
      { name: 'Invoices', href: '/invoices', icon: Receipt, adminOnly: true },
    ]
  },
  {
    name: 'Scheduling',
    items: [
      { name: 'Calendars', href: '/calendar', icon: CalendarDays },
      { name: 'Waitlists', href: '/calendar/waitlist', icon: Users },
    ]
  },
  {
    name: 'Marketing',
    items: [
      { name: 'Websites', href: '/websites', icon: Globe },
      { name: 'Funnels', href: '/funnels', icon: Filter },
      { name: 'Campaigns', href: '/campaigns', icon: Send },
      { name: 'Forms', href: '/forms', icon: ClipboardList },
      { name: 'Social', href: '/social', icon: Share2 },
      { name: 'Reputation', href: '/reputation', icon: Star },
      { name: 'Ads', href: '/ads', icon: Megaphone, adminOnly: true },
    ]
  },
  {
    name: 'Commerce',
    items: [
      { name: 'Products', href: '/products', icon: Package },
      { name: 'Orders', href: '/orders', icon: ShoppingBag },
    ]
  },
  {
    name: 'Business',
    items: [
      { name: 'Projects', href: '/projects', icon: FolderKanban },
      { name: 'Support', href: '/support', icon: LifeBuoy },
      { name: 'Automations', href: '/automations', icon: Zap, adminOnly: true },
      { name: 'Learning', href: '/courses', icon: GraduationCap },
      { name: 'Media Center', href: '/media', icon: FolderOpen },
    ]
  },
  {
    name: 'Analytics',
    items: [
      { name: 'Reporting', href: '/analytics', icon: BarChart3, adminOnly: true },
    ]
  },
  {
    name: 'Account',
    items: [
      { name: 'Account', href: '/settings/account', icon: User },
      { name: 'Workspace', href: '/settings/workspace', icon: Settings, adminOnly: true },
      { name: 'Team', href: '/team-members', icon: Users2, adminOnly: true },
      { name: 'Branding', href: '/settings/branding', icon: Palette, adminOnly: true },
      { name: 'Billing', href: '/settings/billing', icon: CreditCard, adminOnly: true },
      { name: 'Email Sync', href: '/settings/emails', icon: Mail, adminOnly: true },
      { name: 'Custom Objects', href: '/settings/objects', icon: Box, adminOnly: true },
      { name: 'API & Webhooks', href: '/settings/api', icon: Code2, adminOnly: true },
      { name: 'Integrations', href: '/settings/integrations', icon: Plug, adminOnly: true },
      { name: 'SaaS Mode', href: '/settings/saas', icon: Store, adminOnly: true },
      { name: 'Compliance', href: '/settings/gdpr', icon: Shield, adminOnly: true },
    ]
  }
];


export function Sidebar({ className, user, workspace, role, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [isLogoutOpen, ReactSetIsLogoutOpen] = React.useState(false);

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

  const workspaceInitials = workspace?.branding?.platformName?.substring(0, 2).toUpperCase() || workspace?.name?.substring(0, 2).toUpperCase() || 'WS';

  const userInitials = user?.firstName?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <>
      <aside className={cn(
        "flex flex-col h-full bg-[#0b0b10] border-r border-white/5 transition-all duration-300 relative",
        isCollapsed ? "w-[80px]" : "w-[280px]",
        className
      )}>
        {/* Subtle Background Glow */}
        {!isCollapsed && (
          <div 
            className="absolute top-0 left-0 w-full h-[500px] opacity-50 pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(circle at top left, rgba(108, 71, 255, 0.08), transparent 70%)' }}
          />
        )}


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
                <span className="text-sm tracking-tighter">{workspaceInitials}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden animate-in fade-in duration-500">
                <span className="text-lg font-extrabold tracking-tighter text-white leading-tight">
                  {workspace?.branding?.platformName || workspace?.name || 'Platform'}
                </span>
                <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest truncate">
                  {workspace?.branding?.platformName ? workspace?.name : 'Workspace'}
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-6 px-4 scrollbar-none">
          <nav className={cn("space-y-1.5 transition-all duration-300", isCollapsed ? "mt-4" : "mt-2")}>
            <TooltipProvider delay={0}>
              {navGroups.map((group) => {
                const isGroupCollapsed = collapsedGroups.includes(group.name);

                return (
                  <div key={group.name} className="space-y-3 mb-6">
                    {!isCollapsed && (
                      <button
                        onClick={() => toggleGroup(group.name)}
                        className="flex items-center justify-between w-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/20 hover:text-white/60 transition-all group/header animate-in fade-in duration-500"
                      >
                        <span className="flex items-center gap-2">
                           <div className="w-1 h-3 rounded-full bg-[#6c47ff]/20 group-hover/header:bg-[#6c47ff]/60 transition-all" />
                           {group.name}
                           <InfoTooltip 
                             content={
                               group.name === 'Main' ? 'Core daily operations and messaging.' :
                               group.name === 'Relations' ? 'Manage your leads, pipelines, and financial documents.' :
                               group.name === 'Scheduling' ? 'Calendar booking and waitlist management.' :
                               group.name === 'Marketing' ? 'Social planner, ad manager, and lead capture tools.' :
                               group.name === 'Commerce' ? 'Product inventory and order tracking.' :
                               group.name === 'Business' ? 'Projects, learning management, and automations.' :
                               group.name === 'Account' ? 'Platform settings and developer configurations.' :
                               'Platform module group'
                             } 
                             size={10}
                           />
                        </span>
                        <div className="p-1 rounded-md group-hover/header:bg-white/5 transition-all">
                           {isGroupCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </div>
                      </button>
                    )}

                    {isCollapsed && (
                      <div className="h-px bg-white/5 mx-2 my-6" />
                    )}


                    {(!isGroupCollapsed || isCollapsed) && (
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          if (item.adminOnly && role !== 'admin') return null;
                          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                          const content = (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "group flex items-center rounded-xl transition-all duration-300 relative",
                                isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2.5 text-[13px] font-semibold",
                                isActive
                                  ? "bg-white/5 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_0_20px_rgba(108,71,255,0.1)]"
                                  : "text-white/40 hover:bg-white/3 hover:text-white/80"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                   "flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-500",
                                    isActive ? "bg-[#6c47ff]/20 text-[#6c47ff]" : "group-hover:bg-white/5 group-hover:text-white/70"
                                )}>
                                  <item.icon className={cn("h-[18px] w-[18px]", isActive ? "scale-110" : "")} />
                                </div>
                                {!isCollapsed && <span className="relative z-10 animate-in fade-in duration-500 whitespace-nowrap" style={{ color: isActive ? 'white' : undefined }}>{item.name}</span>}
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
                            <Tooltip key={item.name}>
                              <TooltipTrigger render={content} />
                              <TooltipContent side="right" className="bg-[#1a1a24] border-white/10 text-white text-[11px] font-bold">
                                {item.name}
                              </TooltipContent>
                            </Tooltip>
                          ) : content;
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
        <div className="mt-auto p-4 space-y-4 border-t border-white/5">
          <div className={cn(
            "relative group overflow-hidden rounded-2xl bg-white/[0.03] border border-white/5 p-3 transition-all hover:bg-white/[0.05] hover:border-white/10",
            isCollapsed ? "p-2 aspect-square flex items-center justify-center" : "p-3"
          )}>
            <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "")}>
              <Avatar className="h-10 w-10 rounded-xl border border-white/10 shrink-0">
                <AvatarImage src={user?.avatarUrl || ''} alt={user?.firstName || 'User'} />
                <AvatarFallback className="bg-[#6c47ff]/20 text-[#6c47ff] text-xs font-bold rounded-xl">{userInitials}</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden animate-in fade-in duration-500">
                  <span className="text-sm font-bold text-white/90 truncate">
                    {user?.firstName || 'User'}
                  </span>
                  <span className="text-[11px] font-medium text-white/20 truncate lowercase">
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
