'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Settings2, 
  MessageSquare,
  MessageCircle,
  Mail,
  MoreVertical,
  Paperclip,
  Send as SendIcon,
  Phone,
  Video,
  Loader2
} from 'lucide-react';
import { FaInstagram as Instagram, FaTwitter as Twitter, FaFacebook as Facebook } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ConnectPlatformsModal } from '@/components/dashboard/ConnectPlatformsModal';
import { getConversations, getMessages, sendChatMessage } from '@/app/actions/conversations';
import { format } from 'date-fns';

type PlatformTab = 'All' | 'email' | 'sms' | 'whatsapp' | 'instagram' | 'twitter' | 'facebook';

export default function ConversationsPage() {
  const [activeTab, setActiveTab] = useState<PlatformTab>('All');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchConversations() {
      setIsLoadingChats(true);
      try {
        const data = await getConversations();
        setConversations(data);
      } catch (err) {
        toast.error('Failed to load conversations.');
      } finally {
        setIsLoadingChats(false);
      }
    }
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    
    async function fetchChatMessages() {
      setIsLoadingMessages(true);
      try {
        const data = await getMessages(selectedChat!);
        setMessages(data);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } catch (err) {
        toast.error('Failed to load messages.');
      } finally {
        setIsLoadingMessages(false);
      }
    }
    fetchChatMessages();
  }, [selectedChat]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !selectedChat) return;
    
    setIsSending(true);
    const content = messageInput;
    setMessageInput('');
    
    const tempMsg = {
      id: `temp-${Date.now()}`,
      content,
      direction: 'outbound',
      sent_at: new Date().toISOString(),
      status: 'sending'
    };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
      const res = await sendChatMessage(selectedChat, content);
      if (res.success && res.message) {
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.message : m));
      } else {
        toast.error(res.error || 'Failed to send message');
        setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        setMessageInput(content);
      }
    } catch (e) {
      toast.error('An error occurred.');
    } finally {
      setIsSending(false);
    }
  };

  const tabs: { id: PlatformTab; name: string; icon?: React.ComponentType<{ className?: string }> }[] = [
    { id: 'All', name: 'All' },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'sms', name: 'SMS', icon: MessageSquare },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle },
    { id: 'instagram', name: 'Instagram', icon: Instagram },
    { id: 'twitter', name: 'Twitter', icon: Twitter },
    { id: 'facebook', name: 'Facebook', icon: Facebook },
  ];

  const filteredConversations = activeTab === 'All' 
    ? conversations 
    : conversations.filter(c => c.platform === activeTab);

  const activeConv = conversations.find(c => c.id === selectedChat);

  const getContactName = (conv: any) => {
    if (conv.contacts && conv.contacts.first_name) {
      return `${conv.contacts.first_name} ${conv.contacts.last_name || ''}`.trim();
    }
    return conv.title || conv.external_thread_id || 'Unknown Contact';
  };

  const getContactInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return '?';
  };

  const formatTime = (ts: string) => {
    if (!ts) return '';
    const d = new Date(ts);
    if (new Date().toDateString() === d.toDateString()) {
      return format(d, 'h:mm a');
    }
    return format(d, 'MMM d');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-light text-white/50 tracking-wide">
          Unified messaging across WhatsApp, Instagram, Twitter, Facebook, SMS, and Email
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden bg-[#0a0a0f] border border-white/10 rounded-3xl shadow-2xl">
        {/* Left Sidebar (Inbox List) */}
        <div className="w-[380px] flex flex-col border-r border-white/5 shrink-0 bg-white/[0.02]">
          <div className="p-6 pb-4 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Inbox</h2>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-xl gap-2 font-medium transition-all"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings2 className="h-4 w-4" />
              Settings
            </Button>
          </div>

          <div className="px-6 pb-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-[#6c47ff] transition-colors" />
              <Input 
                placeholder="Search messages..." 
                className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus-visible:ring-1 focus-visible:ring-[#6c47ff]/50 focus-visible:border-[#6c47ff]/50 transition-all font-medium"
              />
            </div>
          </div>

          <div className="px-6 pb-2 border-b border-white/5">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max space-x-2 pb-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                        activeTab === tab.id
                          ? "bg-[#6c47ff] text-white border-[#6c47ff] shadow-lg shadow-[#6c47ff]/20"
                          : "bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10"
                      )}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {tab.name}
                    </button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="h-1.5 opacity-0 hover:opacity-100 transition-opacity" />
            </ScrollArea>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoadingChats ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-white/20 mb-2" />
                <p className="text-xs text-white/30 font-medium tracking-wide">Syncing conversations...</p>
              </div>
            ) : filteredConversations.length > 0 ? (
              <div className="flex flex-col">
                {filteredConversations.map((conv) => {
                  const PlatformIcon = tabs.find(t => t.id === conv.platform)?.icon || MessageSquare;
                  const name = getContactName(conv);
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedChat(conv.id)}
                      className={cn(
                        "flex items-center gap-4 p-5 border-b border-white/5 transition-all text-left group hover:px-6 relative overflow-hidden",
                        selectedChat === conv.id 
                          ? "bg-white/[0.04] border-l-2 border-l-[#6c47ff]" 
                          : "hover:bg-white/[0.02] border-l-2 border-l-transparent"
                      )}
                    >
                      <div className="relative">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#6c47ff]/80 to-purple-600/80 flex items-center justify-center text-white font-black tracking-wider text-sm shadow-xl shadow-[#6c47ff]/10">
                          {getContactInitials(name)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 border-[3px] border-[#0a0a0f] rounded-full"></div>
                        <div className="absolute -top-2 -right-2 h-6 w-6 bg-[#1a1a24] rounded-lg border-2 border-[#0a0a0f] flex items-center justify-center shadow-sm">
                          <PlatformIcon className="h-3.5 w-3.5 text-white/80" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-white text-sm truncate pr-2">{name}</span>
                          <span className="text-[10px] text-white/30 whitespace-nowrap font-bold uppercase tracking-wider">
                            {formatTime(conv.last_message_at)}
                          </span>
                        </div>
                        <p className="text-xs truncate max-w-[90%] text-white/40 font-light">
                          Click to view messages...
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in duration-500">
                <div className="h-16 w-16 mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                   <MessageSquare className="h-6 w-6 text-white/20" />
                </div>
                <p className="text-sm font-semibold text-white/50 tracking-wide">No conversations found.</p>
                <p className="text-xs font-light text-white/30 mt-2">When a prospect replies to your SMS, WhatsApp, Twitter or Facebook, it will securely appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Content Area (Message View) */}
        <div className="flex-1 flex flex-col bg-transparent relative w-full h-full">
          {activeConv ? (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
              {/* Chat Header */}
              <div className="min-h-[80px] border-b border-white/5 flex items-center justify-between px-8 bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#6c47ff]/80 to-purple-600/80 flex items-center justify-center text-white font-black shadow-lg">
                    {getContactInitials(getContactName(activeConv))}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">{getContactName(activeConv)}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-md">
                        {activeConv.platform}
                      </span>
                      <p className="text-[11px] text-emerald-400 font-bold tracking-wide flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                        Live Connection
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-10 w-10 border border-transparent rounded-xl text-white/40 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 border border-transparent rounded-xl text-white/40 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all">
                    <Video className="h-4 w-4" />
                  </Button>
                  <div className="h-6 w-px bg-white/10 mx-1"></div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 border border-transparent rounded-xl text-white/40 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                 <div className="flex flex-col items-center mb-8">
                   <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/40 font-bold uppercase tracking-widest shadow-inner">
                     Conversation History
                   </div>
                 </div>

                 {isLoadingMessages ? (
                   <div className="flex items-center justify-center p-8">
                     <Loader2 className="h-6 w-6 animate-spin text-white/20" />
                   </div>
                 ) : messages.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-40 text-white/20 font-light text-sm">
                     Start sending messages below...
                   </div>
                 ) : (
                   messages.map(msg => {
                     const isOutbound = msg.direction === 'outbound';
                     return (
                       <div key={msg.id} className={cn("flex flex-col gap-1.5 max-w-[80%]", isOutbound ? "items-end ml-auto" : "items-start")}>
                          <div className={cn(
                            "p-5 text-[13px] leading-relaxed shadow-sm",
                            isOutbound 
                              ? "bg-gradient-to-br from-[#6c47ff] to-blue-600 rounded-3xl rounded-br-sm text-white shadow-xl shadow-[#6c47ff]/20 border border-white/10"
                              : "bg-white/[0.04] border border-white/5 rounded-3xl rounded-bl-sm text-white/80"
                          )}>
                            {msg.content}
                          </div>
                          {isOutbound && (
                            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#6c47ff] mr-2">
                              {msg.status === 'sending' ? (
                                <><Loader2 className="h-2.5 w-2.5 animate-spin" /> Sending</>
                              ) : (
                                formatTime(msg.sent_at)
                              )}
                            </span>
                          )}
                          {!isOutbound && (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 ml-2">
                              {formatTime(msg.sent_at)}
                            </span>
                          )}
                       </div>
                     );
                   })
                 )}
                 <div ref={messagesEndRef} />
              </div>
              
              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-6 bg-[#0a0a0f] border-t border-white/10 z-10">
                <div className="relative flex items-center bg-white/[0.02] border border-white/10 rounded-2xl shadow-inner focus-within:border-[#6c47ff]/50 focus-within:ring-1 focus-within:ring-[#6c47ff]/50 transition-all p-1.5">
                  <Button type="button" size="icon" variant="ghost" className="h-10 w-10 text-white/40 hover:text-white hover:bg-white/10 rounded-xl shrink-0 absolute left-2">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Reply directly via ${activeConv.platform}...`}
                    className="pl-12 pr-32 h-12 bg-transparent border-none text-white placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                  />
                  <div className="absolute right-2 flex items-center gap-1.5">
                    <Button 
                      type="submit" 
                      disabled={isSending || !messageInput.trim()} 
                      size="sm" 
                      className="h-10 px-5 bg-white text-black hover:bg-white/90 disabled:opacity-50 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-lg flex items-center gap-2"
                    >
                      {isSending ? <Loader2 className="h-3 w-3 animate-spin text-black" /> : <>Send <SendIcon className="h-3 w-3" /></>}
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between px-2">
                  <p className="text-[10px] text-white/30 truncate flex-1 font-medium tracking-wide">
                    Press <kbd className="font-sans px-1.5 py-0.5 bg-white/10 rounded-md text-white border border-white/10 mx-1">Enter</kbd> to send directly to {activeConv.platform}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2 border border-emerald-400/20 bg-emerald-400/5 px-2.5 py-1 rounded-full">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                    </span>
                    Live Connection Active
                  </p>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
              <div className="h-24 w-24 rounded-3xl bg-white/[0.02] flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                <MessageSquare className="h-8 w-8 text-white/10" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">No conversation selected</h3>
              <p className="text-sm font-light text-white/30 max-w-sm leading-relaxed">
                Select a conversation from the left menu to view the message history and reply directly from LeadsMind.
              </p>
            </div>
          )}
        </div>
      </div>

      <ConnectPlatformsModal 
        open={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen} 
      />
    </div>
  );
}
