'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle2, Plug } from 'lucide-react';
import { ConnectPlatformsModal } from '@/components/dashboard/ConnectPlatformsModal';
import { getConnectedPlatforms } from '@/app/actions/messaging';
import { cn } from '@/lib/utils';

export function IntegrationsList() {
  const [isOpen, setIsOpen] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlatforms = async () => {
    setIsLoading(true);
    try {
      const platforms = await getConnectedPlatforms();
      setConnectedPlatforms(platforms.map(p => p.platform));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, [isOpen]); // Refresh when modal closes

  return (
    <>
      <Card className="bg-[#111111] border-white/5 text-white shadow-xl shadow-black/20">
        <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-white/5 space-y-0">
          <div>
            <CardTitle className="text-xl font-extrabold flex items-center gap-2 tracking-tight">
              <Plug className="h-5 w-5 text-indigo-400" />
              Platform Integrations
            </CardTitle>
            <CardDescription className="text-white/40 font-light mt-1 text-sm">
              Connect your external messaging platforms (Meta, Twilio, LinkedIn) down below to route messages into your CRM.
            </CardDescription>
          </div>
          <Button 
            onClick={() => setIsOpen(true)}
            className="bg-[#6c47ff] hover:bg-[#5638cc] text-white font-bold h-10 px-5 rounded-xl transition-all shadow-lg shadow-[#6c47ff]/20 shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Manage Connections
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex animate-pulse gap-3">
               <div className="h-10 w-24 bg-white/5 rounded-lg"></div>
               <div className="h-10 w-24 bg-white/5 rounded-lg"></div>
            </div>
          ) : connectedPlatforms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-white/5 rounded-2xl">
              <p className="text-sm font-semibold text-white/50 tracking-wide">No platforms connected yet.</p>
              <p className="text-xs font-light text-white/30 mt-2 max-w-sm">Click the button above to safely add WhatsApp, Meta, Webhooks, or Twilio integration keys.</p>
            </div>
          ) : (
            <div className="flex flex-row gap-3 flex-wrap">
              {connectedPlatforms.map((platform) => (
                <div key={platform} className="px-5 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-inner">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {platform} Connected
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <ConnectPlatformsModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
