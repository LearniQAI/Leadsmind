'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface DashboardShellProps {
  children: React.ReactNode;
  user?: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string | null;
    avatarUrl?: string | null;
  } | null;
  workspace?: {
    id: string;
    name: string;
    logoUrl?: string | null;
  } | null;
}

export function DashboardShell({ children, user, workspace }: DashboardShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#030303]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r border-white/5 bg-[#0b0b10] md:block md:w-[280px] fixed top-0 left-0 bottom-0 overflow-y-auto z-50">
        <Sidebar user={user} workspace={workspace} className="h-full" />
      </div>

      <div className="flex flex-1 flex-col md:pl-[280px]">
        {/* Top Bar with Mobile Menu Trigger */}
        <header className="sticky top-0 z-40 flex h-20 items-center bg-[#030303]/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-0">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger render={
              <Button variant="ghost" size="icon" className="md:hidden ml-4 text-white/50 hover:text-white">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            } />
            <SheetContent side="left" className="p-0 w-[280px] bg-[#0b0b10] border-r border-white/5">
              <Sidebar user={user} workspace={workspace} className="h-full" />
            </SheetContent>
          </Sheet>
          
          <div className="flex-1 w-full">
            <TopBar user={user} workspace={workspace} />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8 md:p-12">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
