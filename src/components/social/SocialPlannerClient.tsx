'use client';

import { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  List, 
  Clock, 
  ExternalLink, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { SocialPostComposer } from './SocialPostComposer';

interface SocialPlannerClientProps {
  connectedPlatforms: string[];
  initialPosts: any[];
}

export default function SocialPlannerClient({ connectedPlatforms, initialPosts }: SocialPlannerClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState(initialPosts);
  const [showComposer, setShowComposer] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState<string | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getPostsForDay = (day: Date) => {
    return posts.filter(post => isSameDay(new Date(post.scheduled_at || post.published_at), day));
  };

  const PLATFORMS = [
    { id: 'facebook', icon: Facebook, color: 'text-blue-500' },
    { id: 'instagram', icon: Instagram, color: 'text-pink-500' },
    { id: 'linkedin', icon: Linkedin, color: 'text-blue-700' },
    { id: 'twitter', icon: Twitter, color: 'text-sky-500' },
  ];

  return (
    <div className="flex h-full flex-col bg-[#030303] overflow-hidden p-8 gap-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Social Planner</h1>
          <p className="text-white/40 text-sm mt-1">Manage, schedule and analyze your social media presence.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowComposer(true)}
            className="bg-[#6c47ff] hover:bg-[#8b5cf6] text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-[#6c47ff]/20"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Post
          </Button>
        </div>
      </div>

      {/* Platform Status Bar */}
      <div className="flex items-center gap-4 bg-[#0b0b10] border border-white/5 rounded-2xl p-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mr-2">Connected:</span>
        {PLATFORMS.map(platform => {
          const isConnected = connectedPlatforms.includes(platform.id);
          return (
            <div 
              key={platform.id}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all",
                isConnected ? "bg-white/5 border-white/10 text-white" : "opacity-30 grayscale border-transparent"
              )}
            >
              <platform.icon className={cn("h-3.5 w-3.5", isConnected && platform.color)} />
              <span className="text-[10px] font-bold uppercase">{platform.id}</span>
              {isConnected && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
            </div>
          );
        })}
        <Button variant="ghost" size="sm" className="ml-auto text-[10px] uppercase font-black tracking-widest text-[#6c47ff] hover:text-[#6c47ff]/80">
          Sync Accounts <ExternalLink className="h-3 w-3 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-1 overflow-hidden">
        {/* Calendar Main Grid */}
        <div className="col-span-9 flex flex-col gap-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              {format(currentDate, 'MMMM yyyy')}
              <div className="flex items-center gap-1 ml-4 bg-white/5 rounded-lg p-0.5">
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="h-7 w-7 text-white/40 hover:text-white">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="h-7 w-7 text-white/40 hover:text-white">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </h2>
            <div className="flex bg-white/5 rounded-xl p-1">
              <Button size="sm" variant="ghost" className="h-8 rounded-lg text-xs font-bold bg-white/10 text-white">Month</Button>
              <Button size="sm" variant="ghost" className="h-8 rounded-lg text-xs font-bold text-white/40">Week</Button>
              <Button size="sm" variant="ghost" className="h-8 rounded-lg text-xs font-bold text-white/40">Day</Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-none pb-8">
            <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-[#0b0b10] py-3 text-center text-[10px] font-black uppercase tracking-widest text-white/20">
                  {day}
                </div>
              ))}
              
              {/* Padding for month start */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`pad-${i}`} className="bg-[#0b0b10]/40 min-h-[140px]" />
              ))}

              {days.map((day, i) => {
                const dayPosts = getPostsForDay(day);
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "bg-[#0b0b10] min-h-[140px] p-3 transition-colors hover:bg-white/[0.02] flex flex-col gap-2",
                      !isSameMonth(day, currentDate) && "opacity-20",
                      isToday(day) && "ring-1 ring-inset ring-[#6c47ff]/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-xs font-bold",
                        isToday(day) ? "text-[#6c47ff]" : "text-white/40"
                      )}>
                        {format(day, 'd')}
                      </span>
                      {dayPosts.length > 0 && (
                        <span className="text-[10px] font-black text-[#6c47ff] bg-[#6c47ff]/10 px-1.5 py-0.5 rounded">
                          {dayPosts.length}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1">
                      {dayPosts.map(post => (
                        <div key={post.id} className="group relative bg-white/5 border border-white/5 rounded-lg p-2 transition-all hover:border-[#6c47ff]/30 cursor-pointer">
                          <div className="flex items-center gap-1.5 mb-1">
                             {post.platforms?.map((p: string) => {
                               const PIcon = PLATFORMS.find(pl => pl.id === p)?.icon || Facebook;
                               return <PIcon key={p} className="h-2.5 w-2.5 text-white/20" />;
                             })}
                          </div>
                          <p className="text-[10px] text-white/60 line-clamp-1 leading-tight">{post.content}</p>
                          {post.status === 'scheduled' && <Clock className="absolute top-2 right-2 h-2.5 w-2.5 text-[#6c47ff]" />}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar - Stats & Feed */}
        <aside className="col-span-3 space-y-6">
          <Card className="bg-[#0b0b10] border-white/5 shadow-none rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Recent Success
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {posts.filter(p => p.status === 'published').slice(0, 3).map(post => (
                 <div key={post.id} className="flex gap-3">
                   <div className="w-10 h-10 rounded-lg bg-white/5 shrink-0 flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-white/20" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/80 line-clamp-2 leading-snug">{post.content}</p>
                      <span className="text-[10px] text-emerald-500 uppercase font-black tracking-widest mt-1 block">Live Engagement</span>
                   </div>
                 </div>
               ))}
            </CardContent>
          </Card>

          <Card className="bg-[#0b0b10] border-white/5 shadow-none rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white">Queue Health</CardTitle>
              <CardDescription className="text-[10px] uppercase font-black tracking-tighter text-white/20">Next 7 Days</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                 {[
                   { label: 'Published', val: posts.filter(p => p.status === 'published').length, color: 'bg-emerald-500' },
                   { label: 'Scheduled', val: posts.filter(p => p.status === 'scheduled').length, color: 'bg-[#6c47ff]' },
                   { label: 'Drafts', val: posts.filter(p => p.status === 'draft').length, color: 'bg-amber-500' },
                 ].map(item => (
                   <div key={item.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-white/40">{item.label}</span>
                        <span className="text-white">{item.val}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${(item.val / Math.max(posts.length, 1)) * 100}%` }} />
                      </div>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {showComposer && (
        <SocialPostComposer 
          connectedPlatforms={connectedPlatforms}
          onClose={() => setShowComposer(false)}
          onPostCreated={(post) => {
            setPosts([post, ...posts]);
            setShowComposer(false);
          }}
        />
      )}
    </div>
  );
}
