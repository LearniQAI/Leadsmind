'use client';

import React, { useEffect, useState } from 'react';
import { InboxIcon, MessageSquare, Loader2, ArrowRight } from 'lucide-react';
import { getConversations, getMessages, sendChatMessage, syncRecentMessages } from "@/app/actions/messaging";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function InboxPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getConversations();
        setConversations(data);
      } catch (err) {
        console.error('Failed to load inbox:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetch();
  }, []);

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Unified Inbox</h1>
        <p className="text-sm font-light text-white/50 tracking-wide">
          All your messages from WhatsApp, SMS, Meta, and Email in one place.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#6c47ff]/50 mb-4" />
          <p className="text-xs text-white/20 font-medium tracking-widest uppercase">Syncing your messages...</p>
        </div>
      ) : conversations.length === 0 ? (
        <Card className="border-white/5 bg-white/[0.02] overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/5">
              <InboxIcon className="h-10 w-10 text-white/10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No messages yet</h3>
            <p className="text-sm font-light text-white/30 max-w-xs leading-relaxed mb-8">
              Once you connect your platforms and start receiving messages, they will appear here.
            </p>
            <Button asChild className="bg-[#6c47ff] hover:bg-[#6c47ff]/90 rounded-xl font-bold">
              <Link href="/conversations">Connect Platforms</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {conversations.map((conv) => (
            <Link key={conv.id} href="/conversations">
              <Card className="group border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#6c47ff]/30 transition-all duration-300 overflow-hidden cursor-pointer relative h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-[#6c47ff] to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-[#6c47ff]/10">
                      {(conv.contacts?.first_name?.[0] || conv.title?.[0] || '?').toUpperCase()}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 group-hover:text-[#6c47ff] transition-colors">
                      {conv.platform}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-bold text-white group-hover:text-[#6c47ff] transition-colors truncate">
                      {conv.contacts ? `${conv.contacts.first_name} ${conv.contacts.last_name || ''}` : (conv.title || 'Unknown Contact')}
                    </h4>
                    <p className="text-xs text-white/40 line-clamp-2 leading-relaxed min-h-[32px]">
                      Click to view the full conversation and reply...
                    </p>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                      {conv.last_message_at ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true }) : 'No messages'}
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/0 group-hover:text-[#6c47ff] group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
