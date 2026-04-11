'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import { ConnectPlatformsModal } from './ConnectPlatformsModal';

export function DashboardHeaderActions() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="h-11 rounded-xl border-white/10 bg-white/5 px-5 font-bold text-white transition-all hover:bg-white/10 gap-2 shadow-lg"
        onClick={() => setModalOpen(true)}
      >
        <MessageSquarePlus className="h-4 w-4 text-[#6c47ff]" />
        Connect Platforms
      </Button>

      <ConnectPlatformsModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
      />
    </>
  );
}
