'use client';

import React, { useState } from 'react';
import { StandaloneSidebar } from '@/components/layout/StandaloneSidebar';
import { TopBar } from '@/components/layout/TopBar';
import { AuthProvider } from '@/components/providers/AuthProvider';

export default function ClientInvoiceLayout({
  children,
  user,
  workspace
}: {
  children: React.ReactNode;
  user: any;
  workspace: any;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <AuthProvider user={user} workspace={workspace}>
      <div className="flex h-screen bg-[#020205] overflow-hidden">
        <StandaloneSidebar 
          user={user} 
          workspace={workspace} 
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar user={user} workspace={workspace} />
          <main className="flex-1 overflow-y-auto bg-[#020205]">
            <div className="p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
