'use client';

import React, { useEffect, useState, useRef, useTransition } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  ChevronLeft,
  Loader2,
  Mail,
  Instagram,
  Linkedin,
  MessageCircle,
  Hash,
  Filter,
  Circle,
  Sparkles
} from 'lucide-react';
import { getConversations, getMessages, sendChatMessage } from '@/app/actions/conversations';
import { syncRecentMessages } from '@/app/actions/messaging';
import { getSmartReplySuggestions } from '@/app/actions/automation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [activePlatform, setActivePlatform] = useState<string>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // 1. Initial Load of Conversations
  useEffect(() => {
    async function load() {
      try {
        const data = await getConversations();
        setConversations(data);
      } catch (err) {
        console.error('Error loading conversations:', err);
      } finally {
        setIsLoadingConvs(false);
      }
    }
    load();
  }, []);

  // 2. Load Messages when Active Conversation changes
  useEffect(() => {
    if (!activeConv) return;

    async function load() {
      setIsLoadingMsgs(true);
      try {
        const data = await getMessages(activeConv.id);
        setMessages(data);
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setIsLoadingMsgs(false);
      }
    }
    load();

    async function loadSuggestions() {
      setIsLoadingReplies(true);
      try {
        const suggestions = await getSmartReplySuggestions(activeConv.id);
        setSmartReplies(suggestions);
      } catch (err) {
        console.error('Error loading suggestions:', err);
      } finally {
        setIsLoadingReplies(false);
      }
    }
    loadSuggestions();

    // Setup realtime subscription for messages in this conversation
    const channel = supabase
      .channel(`chat_${activeConv.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConv.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConv, supabase]);

  // 3. Scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageText.trim() || !activeConv) return;

    const content = messageText.trim();
    setMessageText('');

    startTransition(async () => {
      const result = await sendChatMessage(activeConv.id, content);
      if (!result.success) {
        toast.error(result.error || 'Failed to send message');
      }
    });
  };

  const handleSync = async () => {
    setIsLoadingConvs(true);
    try {
      const result = await syncRecentMessages();
      if (result.success) {
        const count = result.count || 0;
        if (count > 0) {
          toast.success(`Synced ${count} messages!`);
        }

        // Handle platform-specific errors
        if (result.platformErrors && result.platformErrors.length > 0) {
          result.platformErrors.forEach((err: any) => {
            toast.error(`${err.platform.toUpperCase()}: ${err.error}`, {
              duration: 5000,
            });
          });
        } else if (count === 0) {
          toast.info('Sync complete. No new messages found.');
        }

        const data = await getConversations();
        setConversations(data);
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setIsLoadingConvs(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'email': return <Mail className="h-3 w-3" />;
      case 'instagram': return <Instagram className="h-3 w-3" />;
      case 'linkedin': return <Linkedin className="h-3 w-3" />;
      case 'whatsapp': return <MessageCircle className="h-3 w-3" />;
      default: return <Hash className="h-3 w-3" />;
    }
  };

  const filteredConvs = conversations.filter(c => {
    const matchesSearch = 
      (c.contacts?.first_name + ' ' + (c.contacts?.last_name || '')).toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlatform = activePlatform === 'all' || c.platform === activePlatform;
    
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="flex bg-[#030303] border border-white/5 rounded-3xl overflow-hidden h-[calc(100vh-140px)] shadow-2xl animate-fade-up">
      {/* --- Sidebar: Conversation List --- */}
      <div className={cn(
        "flex flex-col w-full md:w-80 lg:w-96 border-r border-white/5 bg-white/[0.01]",
        activeConv && "hidden md:flex"
      )}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">Messages</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSync}
                disabled={isLoadingConvs}
                className="h-8 w-8 text-[#6c47ff] hover:text-[#6c47ff]/80 hover:bg-[#6c47ff]/10 rounded-lg group"
              >
                <div className={cn("transition-transform duration-500", isLoadingConvs && "animate-spin")}>
                  <Filter className="h-4 w-4" />
                </div>
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-10 bg-white/5 border-white/5 rounded-xl text-sm placeholder:text-white/20 focus:border-[#6c47ff]/50 transition-all"
            />
          </div>

          {/* Platform Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 px-1">
            {[
              { id: 'all', name: 'All', icon: MessageSquare },
              { id: 'email', name: 'Email', icon: Mail },
              { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle },
              { id: 'sms', name: 'SMS', icon: MessageSquare },
              { id: 'instagram', name: 'Insta', icon: Instagram },
              { id: 'linkedin', name: 'LinkedIn', icon: Linkedin }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePlatform(p.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border whitespace-nowrap",
                  activePlatform === p.id 
                    ? "bg-[#6c47ff] border-[#6c47ff] text-white shadow-lg shadow-[#6c47ff]/20" 
                    : "bg-white/[0.02] border-white/5 text-white/40 hover:text-white/70 hover:bg-white/[0.05]"
                )}
              >
                <p.icon className="h-3 w-3" />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          {isLoadingConvs ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-[#6c47ff]/40" />
              <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Syncing platforms...</p>
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-10 text-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-white/5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white/40">No conversations yet</p>
                <p className="text-xs text-white/20 leading-relaxed font-light">
                  Click the sync button above to fetch latest messages from your connected platforms.
                </p>
              </div>
              <Button
                onClick={handleSync}
                variant="outline"
                size="sm"
                className="mt-2 h-9 px-6 rounded-xl border-white/10 bg-white/5 text-white/60 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
              >
                Sync Now
              </Button>
            </div>
          ) : (
            <div className="space-y-1 px-3 pb-6">
              {filteredConvs.map((conv) => {
                const isActive = activeConv?.id === conv.id;
                const platformLabel = conv.platform === 'email' ? 'Gmail' : conv.platform;
                const contactName = conv.platform === 'email' 
                  ? conv.title // Subject for emails
                  : (conv.contacts ? `${conv.contacts.first_name} ${conv.contacts.last_name || ''}` : conv.title || 'Unknown');
                
                const initials = (conv.contacts?.first_name?.[0] || conv.title?.[0] || '?').toUpperCase();
                const subtitle = conv.platform === 'email' ? conv.external_thread_id : 'Click to view messages history...';

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConv(conv)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3.5 rounded-2xl transition-all group relative",
                      isActive
                        ? "bg-[#6c47ff]/10 border border-[#6c47ff]/20 shadow-lg shadow-[#6c47ff]/5"
                        : "hover:bg-white/[0.03] border border-transparent"
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12 rounded-xl border border-white/5">
                        <AvatarImage src={conv.contacts?.avatar_url} alt={contactName} />
                        <AvatarFallback className="bg-linear-to-br from-white/10 to-white/5 text-white/40 text-sm font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-lg bg-[#030303] flex items-center justify-center p-1 border border-white/5 shadow-lg">
                        <div className={cn(
                          "flex items-center justify-center rounded-xs w-full h-full",
                          conv.platform === 'whatsapp' ? "text-emerald-500" :
                            conv.platform === 'instagram' ? "text-pink-500" :
                              conv.platform === 'linkedin' ? "text-blue-500" : 
                                conv.platform === 'email' ? "text-orange-500" : "text-[#6c47ff]"
                        )}>
                          {getPlatformIcon(conv.platform)}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={cn(
                          "text-sm font-bold truncate",
                          isActive ? "text-white" : "text-white/70 group-hover:text-white"
                        )}>
                          {contactName}
                        </span>
                        <span className="text-[10px] font-bold text-white/20 shrink-0">
                          {conv.last_message_at ? format(new Date(conv.last_message_at), 'HH:mm') : ''}
                        </span>
                      </div>
                      <p className="text-xs text-white/30 truncate leading-relaxed">
                        {subtitle}
                      </p>
                    </div>

                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#6c47ff] rounded-r-full shadow-[0_0_12px_rgba(108,71,255,0.8)]" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* --- Main Area: Active Chat --- */}
      <div className={cn(
        "flex-1 flex flex-col bg-white/[0.01]",
        !activeConv && "hidden md:flex items-center justify-center"
      )}>
        {!activeConv ? (
          <div className="flex flex-col items-center justify-center gap-6 p-10 text-center animate-fade-in">
            <div className="h-24 w-24 rounded-[32px] bg-linear-to-br from-[#6c47ff]/20 to-transparent border border-[#6c47ff]/10 flex items-center justify-center shadow-2xl">
              <MessageSquare className="h-10 w-10 text-[#6c47ff]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">Omichannel Messaging</h3>
              <p className="text-sm text-white/30 max-w-xs font-light leading-relaxed">
                Connect with your customers on WhatsApp, SMS, Meta, and LinkedIn — all in one unified interface.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-20 px-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-white/40"
                  onClick={() => setActiveConv(null)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-xl border border-white/5">
                    <AvatarImage src={activeConv.contacts?.avatar_url} />
                    <AvatarFallback className="bg-white/5 text-white/40 text-xs font-bold">
                      {(activeConv.contacts?.first_name?.[0] || activeConv.title?.[0] || '?').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">
                      {activeConv.contacts
                        ? `${activeConv.contacts.first_name} ${activeConv.contacts.last_name || ''}`
                        : (activeConv.title || 'Unknown')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Circle className="h-1.5 w-1.5 fill-emerald-500 text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-white/20 hover:text-white rounded-xl">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-white/20 hover:text-white rounded-xl">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-white/20 hover:text-white rounded-xl">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 min-h-0 relative">
              <ScrollArea className="h-full p-6" ref={scrollRef}>
                {isLoadingMsgs ? (
                  <div className="flex items-center justify-center h-full py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-[#6c47ff]/40" />
                  </div>
                ) : (
                  <div className="space-y-6 pb-4">
                    <div className="flex items-center justify-center py-4">
                      <Badge variant="outline" className="text-[10px] font-bold text-white/20 border-white/5 px-3 py-1 bg-white/[0.02] rounded-full">
                        {messages.length > 0 ? format(new Date(messages[0].sent_at), 'MMMM d, yyyy') : 'No messages yet'}
                      </Badge>
                    </div>

                    {messages.map((msg, i) => {
                      const isOutbound = msg.direction === 'outbound';
                      const showAvatar = !isOutbound && (i === 0 || messages[i - 1].direction === 'outbound');

                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex items-end gap-3 max-w-[85%] animate-fade-up",
                            isOutbound ? "ml-auto flex-row-reverse" : "mr-auto"
                          )}
                        >
                          {!isOutbound && (
                            <div className="w-8 shrink-0">
                              {showAvatar && (
                                <Avatar className="h-8 w-8 rounded-lg border border-white/5 opacity-40 hover:opacity-100 transition-opacity">
                                  <AvatarImage src={activeConv.contacts?.avatar_url} />
                                  <AvatarFallback className="text-[10px] bg-white/5">
                                    {(activeConv.contacts?.first_name?.[0] || '?').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          )}

                          <div className={cn(
                            "flex flex-col gap-1.5",
                            isOutbound ? "items-end" : "items-start"
                          )}>
                            <div className={cn(
                              "p-3 sm:p-4 rounded-2xl text-[13px] sm:text-sm leading-relaxed shadow-sm transition-all",
                              isOutbound 
                                ? "bg-[#6c47ff] text-white rounded-br-xs font-semibold shadow-lg shadow-[#6c47ff]/20" 
                                : "bg-white/5 text-white/90 rounded-bl-xs border border-white/10"
                            )}>
                              {msg.content}
                            </div>
                            <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em] px-1">
                              {format(new Date(msg.sent_at), 'HH:m')}
                              {isOutbound && (msg.status === 'delivered' ? ' · √√' : ' · √')}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>

            <div className="p-4 sm:p-6 pt-2 bg-linear-to-t from-[#030303] via-[#030303]/90 to-transparent">
              {/* Smart Replies */}
              {smartReplies.length > 0 && (
                <div className="flex items-center gap-2 sm:gap-3 mb-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6c47ff]/10 border border-[#6c47ff]/20 text-[9px] font-black text-[#6c47ff] uppercase tracking-[0.15em] shrink-0 shadow-[0_0_15px_rgba(108,71,255,0.1)]">
                    <Sparkles className="h-3 w-3" />
                    <span className="hidden xs:inline">AI Suggests</span>
                  </div>
                  {smartReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => setMessageText(reply)}
                      className="whitespace-nowrap px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/40 hover:text-white hover:bg-white/10 hover:border-[#6c47ff]/50 transition-all font-medium active:scale-95"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              <form 
                onSubmit={handleSendMessage}
                className="relative bg-white/5 border border-white/10 rounded-2xl p-1 focus-within:border-[#6c47ff]/50 transition-all shadow-2xl"
              >
                <textarea
                  rows={1}
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="w-full bg-transparent border-none text-white text-sm p-4 pr-32 outline-none resize-none placeholder:text-white/20 min-h-[56px] flex items-center"
                />
                <div className="absolute right-3 bottom-2 flex items-center gap-2">
                  <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-white rounded-xl">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending || !messageText.trim()}
                    className="h-10 px-5 rounded-xl bg-[#6c47ff] hover:bg-[#5b3ce0] text-white font-bold shadow-lg shadow-[#6c47ff]/20 gap-2 transition-all hover:scale-105"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span>Send</span>
                  </Button>
                </div>
              </form>
              <div className="mt-3 flex items-center justify-center gap-4">
                <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Hash className="h-3 w-3" />
                  Messaging via {activeConv.platform}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
