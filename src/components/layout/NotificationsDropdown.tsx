'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Check, MessageSquare, UserPlus, Info, Handshake, Users } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '@/app/actions/notifications';
import { toast } from 'sonner';
import Link from 'next/link';

type Notification = {
  id: string;
  type: 'message' | 'contact' | 'deal' | 'system' | 'team';
  title: string;
  message: string;
  link?: string;
  created_at: string;
  read: boolean;
};

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();

    // Setup realtime subscription to the notifications table
    const supabase = createClient();
    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(c => c + 1);
          
          // Show a toast for the new notification
          toast.info(newNotif.title, {
            description: newNotif.message,
            action: newNotif.link ? {
              label: 'View',
              onClick: () => window.location.href = newNotif.link!
            } : undefined
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    const data = await getNotifications();
    if (data) {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter(n => !n.read).length);
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsRead();
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      await markNotificationAsRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    }
    if (notif.link) {
      setOpen(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="h-4 w-4 text-[#6c47ff]" />;
      case 'contact': return <Users className="h-4 w-4 text-emerald-500" />;
      case 'deal': return <Handshake className="h-4 w-4 text-amber-500" />;
      case 'team': return <UserPlus className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-white/40" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 text-foreground/40 hover:text-foreground/80 transition-colors">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#6c47ff] ring-2 ring-background animate-pulse" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[400px] p-0 bg-[#16161e] border-white/10 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
          <div>
            <h4 className="font-bold text-white text-base">Notifications</h4>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">
              {unreadCount} UNREAD UPDATES
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="ghost" size="sm" className="h-8 text-xs text-[#6c47ff] hover:text-white hover:bg-[#6c47ff]/10 rounded-lg">
              <Check className="h-3.5 w-3.5 mr-1.5" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/20 text-center">
              <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 opacity-50">
                <Bell className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold tracking-wide">You&apos;re all caught up!</p>
              <p className="text-xs font-light mt-1">New updates will appear here in real-time.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    "flex items-start gap-4 p-5 border-b border-white/5 last:border-0 transition-all hover:bg-white/[0.04] cursor-pointer relative group",
                    !notif.read && "bg-[#6c47ff]/5"
                  )}
                >
                  {!notif.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6c47ff]" />
                  )}
                  <div className="mt-1 bg-white/5 p-2.5 rounded-xl border border-white/10 group-hover:bg-white/10 transition-colors">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-start justify-between">
                       <p className={cn("text-sm transition-colors pr-2 truncate", !notif.read ? "text-white font-bold" : "text-white/60 font-medium")}>
                         {notif.title}
                       </p>
                       <span className="text-[10px] text-white/20 whitespace-nowrap font-bold">
                         {formatDistanceToNow(new Date(notif.created_at), { addSuffix: false })}
                       </span>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-2 italic">
                      {notif.message}
                    </p>
                    {notif.link && (
                      <Link 
                        href={notif.link} 
                        className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-[#6c47ff] mt-2 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationClick(notif);
                        }}
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-3 border-t border-white/5 bg-black/40">
          <Button variant="ghost" className="w-full h-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-white hover:bg-white/5 rounded-xl">
            See all activity
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
