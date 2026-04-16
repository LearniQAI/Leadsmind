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
  Maximize2,
  Minimize2,
  X,
  Sidebar as SidebarIcon,
  ChevronRight,
  RefreshCw,
  Plus,
  User,
  Phone as PhoneIcon,
  Search as SearchIcon
} from 'lucide-react';
import {
  getConversations,
  getMessages,
  sendChatMessage,
  getContacts,
  startConversation
} from '@/app/actions/conversations';
import { syncRecentMessages } from '@/app/actions/messaging';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [activePlatform, setActivePlatform] = useState<string>('all');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isNewMsgOpen, setIsNewMsgOpen] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>('sms');
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // 1. Initial Load
  useEffect(() => {
    async function load() {
      try {
        const [convData, contactData] = await Promise.all([
          getConversations(),
          getContacts()
        ]);
        setConversations(convData || []);
        setContacts(contactData || []);
      } catch (err) {
        console.error('Error loading initial data:', err);
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

        // Force a re-fetch and log results for debugging
        const data = await getConversations();
        console.log(`[Conversations] Sync complete. Resulting conversations in DB:`, data.map(d => ({ id: d.id, platform: d.platform, title: d.title })));
        setConversations(data);

        // If we found messages but local state is still empty, something is wrong with RLS or Workspace ID
        if (count > 0 && data.length === 0) {
          toast.error("Messages synced but could not be retrieved. Please check your workspace active session.");
        }
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
    const search = searchTerm.toLowerCase().trim();
    const matchesPlatform = activePlatform === 'all' || c.platform === activePlatform;

    if (!search) return matchesPlatform;

    const contactName = c.contacts
      ? (`${c.contacts.first_name || ''} ${c.contacts.last_name || ''}`).toLowerCase()
      : (c.title || 'unknown').toLowerCase();

    const matchesSearch = contactName.includes(search) || (c.external_thread_id || '').toLowerCase().includes(search);

    return matchesSearch && matchesPlatform;
  });

  return (
    <div className={cn(
      "flex bg-[#050508] border border-white/5 shadow-2xl overflow-hidden transition-all duration-500 ease-in-out",
      isFocusMode
        ? "fixed inset-4 z-[100] rounded-[40px] h-[calc(100vh-32px)]"
        : "relative rounded-[40px] h-[calc(100vh-160px)] w-full min-w-0"
    )}>
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-[#6c47ff]/5 via-transparent to-transparent pointer-events-none" />

      {/* --- Sidebar: Conversation List --- */}
      <div className={cn(
        "flex flex-col border-r border-white/5 bg-white/[0.01] transition-all duration-300 ease-in-out shrink-0 overflow-hidden",
        sidebarCollapsed ? "w-0 border-none opacity-0" : "w-full md:w-80 lg:w-96",
        activeConv && "hidden md:flex"
      )}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between shrink-0">
            <h2 className="text-xl font-black text-white tracking-tighter uppercase">Messages</h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFocusMode(!isFocusMode)}
                className="h-9 w-9 text-white/20 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                {isFocusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>

              <Dialog open={isNewMsgOpen} onOpenChange={setIsNewMsgOpen}>
                <DialogTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 bg-[#6c47ff]/10 text-[#6c47ff] hover:bg-[#6c47ff]/20 rounded-xl transition-all"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  }
                />
                <DialogContent className="bg-[#0b0b12] border-white/5 text-white max-w-md rounded-[32px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase tracking-widest text-white">Start Conversation</DialogTitle>
                    <DialogDescription className="text-white/40">Select a contact and platform to begin messaging.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Recipient</label>
                      <Select value={selectedContact} onValueChange={setSelectedContact}>
                        <SelectTrigger className="bg-white/5 border-white/5 h-12 rounded-2xl focus:ring-[#6c47ff]/50">
                          <SelectValue placeholder="Select a contact" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0b0b12] border-white/5 text-white">
                          {contacts.map((c) => (
                            <SelectItem key={c.id} value={c.id} className="focus:bg-[#6c47ff] focus:text-white">
                              {c.first_name} {c.last_name} ({c.phone || c.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Platform</label>
                      <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                        <SelectTrigger className="bg-white/5 border-white/5 h-12 rounded-2xl focus:ring-[#6c47ff]/50">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0b0b12] border-white/5 text-white">
                          <SelectItem value="sms" className="focus:bg-[#6c47ff]">SMS via Twilio</SelectItem>
                          <SelectItem value="whatsapp" className="focus:bg-[#6c47ff]">WhatsApp via Twilio</SelectItem>
                          <SelectItem value="email" className="focus:bg-[#6c47ff]">Gmail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={async () => {
                        if (!selectedContact || !selectedPlatform) {
                          toast.error('Please select both a contact and a platform');
                          return;
                        }
                        const contact = contacts.find(c => c.id === selectedContact);
                        if (!contact) return;
                        const externalId = (selectedPlatform === 'email') ? contact.email : contact.phone;
                        if (!externalId) {
                          toast.error(`Contact has no ${selectedPlatform === 'email' ? 'email' : 'phone number'}`);
                          return;
                        }
                        const res = await startConversation(contact.id, selectedPlatform, externalId);
                        if (res.success) {
                          setIsNewMsgOpen(false);
                          const updated = await getConversations();
                          setConversations(updated);
                          const target = updated.find(c => c.id === res.id);
                          if (target) setActiveConv(target);
                        } else {
                          toast.error(res.error || 'Failed to start conversation');
                        }
                      }}
                      className="w-full h-12 rounded-2xl bg-[#6c47ff] hover:bg-[#5b3ce0] text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#6c47ff]/30 transition-all active:scale-95"
                    >
                      Open Thread
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleSync}
                disabled={isLoadingConvs}
                className="h-9 w-9 text-[#6c47ff] hover:text-[#6c47ff]/80 hover:bg-[#6c47ff]/10 rounded-xl group"
              >
                <div className={cn("transition-transform duration-500", isLoadingConvs && "animate-spin")}>
                  <RefreshCw className="h-4 w-4" />
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

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 px-1 scroll-smooth">
            {[
              { id: 'all', name: 'All', icon: MessageSquare, color: 'text-white' },
              { id: 'email', name: 'Gmail', icon: Mail, color: 'text-orange-500' },
              { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-500' },
              { id: 'sms', name: 'SMS', icon: MessageSquare, color: 'text-blue-400' },
              { id: 'instagram', name: 'Insta', icon: Instagram, color: 'text-pink-500' },
              { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' }
            ].map((p) => {
              const isActive = activePlatform === p.id;
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePlatform(p.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border duration-300",
                    isActive
                      ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.15)] scale-105"
                      : "bg-white/[0.03] border-white/5 text-white/40 hover:text-white/70 hover:bg-white/[0.06] hover:border-white/10"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", !isActive && p.color)} />
                  {p.name}
                </button>
              );
            })}
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
        "flex-1 flex flex-col bg-white/[0.01] min-w-0 relative overflow-hidden h-full",
        !activeConv && "hidden md:flex items-center justify-center"
      )}>
        {activeConv && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute top-5 left-1 z-20 hidden md:flex h-10 w-6 bg-white/5 border border-white/10 hover:bg-white/10 rounded-r-lg text-white/20 hover:text-white"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
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
          <ChatArea
            activeConv={activeConv}
            messages={messages}
            isLoadingMsgs={isLoadingMsgs}
            messageText={messageText}
            setMessageText={setMessageText}
            handleSendMessage={handleSendMessage}
            isPending={isPending}
            scrollRef={scrollRef}
            onClose={() => setActiveConv(null)}
            isFocusMode={isFocusMode}
            toggleFocus={() => setIsFocusMode(!isFocusMode)}
          />
        )}
      </div>
    </div>
  );
}

// Sub-component for Chat Area to reuse in focus mode
function ChatArea({
  activeConv,
  messages,
  isLoadingMsgs,
  messageText,
  setMessageText,
  handleSendMessage,
  isPending,
  scrollRef,
  onClose,
  isFocusMode,
  toggleFocus
}: any) {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  return (
    <>
      {/* Chat Header */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white/40"
            onClick={onClose}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-xl border border-white/5 bg-white/5">
              <AvatarImage src={activeConv.contacts?.avatar_url} />
              <AvatarFallback className="text-white/40 text-xs font-bold uppercase">
                {(activeConv.contacts?.first_name?.[0] || activeConv.title?.[0] || '?').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight">
                {activeConv.contacts
                  ? `${activeConv.contacts.first_name} ${activeConv.contacts.last_name || ''}`
                  : (activeConv.title || 'Unknown')}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Circle className="h-1.5 w-1.5 fill-emerald-500 text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.1em]">Verified via {activeConv.platform}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFocus}
            className="h-10 w-10 text-white/20 hover:text-white rounded-xl transition-colors"
          >
            {isFocusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <div className="w-px h-6 bg-white/5 mx-1" />
          <Button variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-white rounded-xl">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-white rounded-xl">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <ScrollArea className="h-full px-6" ref={scrollRef}>
          {isLoadingMsgs ? (
            <div className="flex items-center justify-center h-full py-20">
              <Loader2 className="h-6 w-6 animate-spin text-[#6c47ff]/40" />
            </div>
          ) : (
            <div className="space-y-6 py-6 pb-12 max-w-4xl mx-auto">
              <div className="flex items-center justify-center py-4">
                <Badge variant="outline" className="text-[10px] font-black tracking-widest text-white/10 border-white/5 px-4 py-1.5 bg-white/[0.01] rounded-full uppercase">
                  {messages.length > 0 ? format(new Date(messages[0].sent_at), 'MMMM d, yyyy') : 'No messages yet'}
                </Badge>
              </div>

              {messages.map((msg: any, i: number) => {
                const isOutbound = msg.direction === 'outbound';
                const showAvatar = !isOutbound && (i === 0 || messages[i - 1].direction === 'outbound');

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end gap-3 max-w-[90%] md:max-w-[75%] animate-in fade-in slide-in-from-bottom-2 duration-500",
                      isOutbound ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "flex flex-col gap-1.5",
                      isOutbound ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "p-4 px-5 rounded-[24px] text-sm leading-relaxed shadow-2xl transition-all relative overflow-hidden group",
                        isOutbound
                          ? "bg-[#6c47ff] text-white rounded-br-none font-medium border border-white/10"
                          : "bg-white/[0.03] text-white/90 rounded-bl-none border border-white/5"
                      )}>
                        {/* Message content glow on hover */}
                        <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <span className="relative z-10">{msg.content}</span>
                      </div>
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em]">
                          {format(new Date(msg.sent_at), 'HH:mm')}
                        </span>
                        {isOutbound && (
                          <div className={cn(
                            "h-1 w-1 rounded-full",
                            msg.status === 'delivered' ? "bg-emerald-400" : "bg-white/10"
                          )} />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </div>
      <div className={cn(
        "p-6 pt-2 bg-linear-to-t from-[#050508] via-[#050508]/90 to-transparent",
        isFocusMode && "max-w-4xl mx-auto w-full"
      )}>
        <form
          onSubmit={handleSendMessage}

          className="relative bg-white/[0.03] border border-white/10 rounded-[28px] p-1.5 focus-within:border-[#6c47ff]/50 transition-all shadow-2xl overflow-hidden group"
        >
          <div className="absolute inset-0 bg-linear-to-br from-white/[0.02] to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
          <textarea
            rows={1}
            placeholder={`Message ${activeConv.contacts?.first_name || 'contact'}...`}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="w-full bg-transparent border-none text-white text-sm p-4 pr-36 outline-none resize-none placeholder:text-white/20 min-h-[60px] flex items-center relative z-10"
          />
          <div className="absolute right-4 bottom-3 flex items-center gap-2 z-10">
            <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-white rounded-xl">
              <Paperclip className="h-4.5 w-4.5" />
            </Button>
            <Button
              type="submit"
              disabled={isPending || !messageText.trim()}
              className="h-11 px-6 rounded-2xl bg-[#6c47ff] hover:bg-[#5b3ce0] text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#6c47ff]/30 gap-2 transition-all hover:scale-[1.02] active:scale-95 border-t border-white/10"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>Send</span>
            </Button>
          </div>
        </form>
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="text-[10px] font-black text-white/5 uppercase tracking-[0.3em] flex items-center gap-3">
            <div className="w-10 h-px bg-white/5" />
            {activeConv.platform} Connection Secured
            <div className="w-10 h-px bg-white/5" />
          </div>
        </div>
      </div>
    </>
  );
}
