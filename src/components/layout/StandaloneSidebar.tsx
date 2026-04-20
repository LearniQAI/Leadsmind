'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  Plus,
  Zap,
  LogOut,
  FileSearch,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { handleLogout } from '@/app/actions/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';

interface StandaloneSidebarProps {
  user?: any;
  workspace?: any;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/invoice/dashboard', icon: LayoutDashboard },
  { name: 'Invoices', href: '/invoice/invoices', icon: FileText },
  { name: 'Quotes', href: '/invoice/quotes', icon: FileSearch },
  { name: 'Clients', href: '/invoice/clients', icon: Users },
  { name: 'Analytics', href: '/invoice/analytics', icon: BarChart3 },
];

const secondaryItems: any[] = [];

export function StandaloneSidebar({ user, workspace, isCollapsed = false, onToggleCollapse }: StandaloneSidebarProps) {
  const pathname = usePathname();

  const userInitials = (user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase();

  return (
    <aside className={cn(
      "flex flex-col h-full bg-[#050510] border-r border-white/5 transition-all duration-300",
      isCollapsed ? "w-[80px]" : "w-[260px]"
    )}>
      {/* Branding */}
      <div className={cn("flex h-[80px] min-h-[80px] items-center px-6 transition-all", isCollapsed && "justify-center px-0")}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-primary/20">
            L
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-black text-white tracking-tighter uppercase whitespace-nowrap">LeadsMind</span>
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Invoice</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action */}
      <div className="p-4">
        <Link href="/invoice/invoices/new">
          <Button className={cn(
            "h-12 !bg-[#6c47ff] hover:bg-[#5b3ce0] text-white rounded-xl gap-2 font-black uppercase tracking-widest shadow-xl shadow-[#6c47ff]/20 transition-all border-none",
            isCollapsed ? "w-12 p-0 justify-center" : "w-full"
          )}>
            <Plus size={18} strokeWidth={3} />
            {!isCollapsed && <span>New Invoice</span>}
          </Button>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                isActive ? "bg-primary/10 text-primary" : "text-white/40 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <item.icon size={20} className={cn(isActive ? "text-primary" : "text-white/20 group-hover:text-white/60")} />
              {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          );
        })}

        <div className="my-6 border-t border-white/5 mx-3" />

        {secondaryItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                isActive ? "bg-white/5 text-white" : "text-white/40 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <item.icon size={20} className="text-white/20 group-hover:text-white/60" />
              {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Banner */}
      {!isCollapsed && (
        <div className="m-4 p-4 rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-white/5 space-y-3">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Growth Plan</span>
          </div>
          <p className="text-[11px] text-white/80 font-medium leading-relaxed">
            Upgrade to full CRM to unlock automation & pipelines.
          </p>
          <Link href="/invoice/upgrade">
            <Button variant="secondary" className="w-full h-8 text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white border-white/10">
              Explore CRM
            </Button>
          </Link>
        </div>
      )}

      {/* Profile */}
      <div className="p-4 mt-auto border-t border-white/5">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-xl border border-white/10">
            <AvatarFallback className="bg-primary/20 text-primary font-black uppercase">{userInitials}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white truncate">{user?.firstName || 'User'}</span>
              <span className="text-[10px] text-white/30 truncate">{user?.email}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
