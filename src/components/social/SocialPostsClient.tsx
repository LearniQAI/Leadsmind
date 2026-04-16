'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Trash2,
  Share2,
  Calendar,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { FaLinkedin as LinkedIn, FaFacebook as Facebook, FaTiktok as TikTok } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { deleteSocialPost, publishSocialPost } from '@/app/actions/social';

interface SocialPost {
  id: string;
  workspace_id: string;
  content: string;
  platforms: string[];
  media_urls?: string[];
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
}

interface SocialPostsClientProps {
  initialPlatforms: string[];
  initialPosts: any[];
}

export function SocialPostsClient({ initialPlatforms, initialPosts }: SocialPostsClientProps) {
  const [posts, setPosts] = useState<SocialPost[]>(initialPosts);

  const handleDeletePost = async (id: string) => {
    try {
      const result = await deleteSocialPost(id);
      if (result.success) {
        setPosts(posts.filter(p => p.id !== id));
        toast.success('Post deleted');
      } else {
        toast.error(result.error);
      }
    } catch (e) {
      toast.error('Failed to delete post');
    }
  };

  const handlePublishPost = async (id: string) => {
    toast.promise(publishSocialPost(id), {
      loading: 'Publishing post across platforms...',
      success: 'Post published successfully!',
      error: 'Failed to publish post'
    });
    setTimeout(() => window.location.reload(), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-400" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-rose-500" />;
      case 'publishing': return <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />;
      default: return <Clock className="h-4 w-4 text-white/30" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin': return <LinkedIn className="h-3.5 w-3.5" />;
      case 'facebook': return <Facebook className="h-3.5 w-3.5" />;
      case 'tiktok': return <TikTok className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight italic">Social Multi-Poster</h1>
          <p className="text-white/40 text-sm mt-1 font-medium">Manage and schedule broadcasts across LinkedIn, Facebook, and TikTok.</p>
        </div>
        <Link href="/social-posts/new" passHref>
          <Button
            className="bg-white text-black hover:bg-[#6c47ff] hover:text-white font-black h-12 px-8 rounded-2xl transition-all shadow-xl shadow-white/5 group"
          >
            <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90 duration-500" />
            New Broadcast
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
            <div className="h-24 w-24 rounded-[32px] bg-gradient-to-br from-[#6c47ff]/20 to-transparent flex items-center justify-center mb-6 border border-[#6c47ff]/10 shadow-2xl">
              <Share2 className="h-10 w-10 text-[#6c47ff]" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">No transmissions yet</h3>
            <p className="text-white/30 text-sm max-w-xs text-center mb-10 font-medium italic">Ready to broadcast? Create your first multi-platform transmission today.</p>
            <Link href="/social-posts/new" passHref>
              <Button 
                  className="rounded-2xl bg-white text-black hover:bg-[#6c47ff] hover:text-white font-black px-10 h-14 transition-all"
              >
                  Launch First Post
              </Button>
            </Link>
          </div>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="bg-[#0b0b0b] border-white/5 text-white shadow-2xl hover:border-[#6c47ff]/30 transition-all duration-500 overflow-hidden group rounded-[32px] flex flex-col h-full ring-1 ring-white/5">
              <CardHeader className="pb-4 pt-8 px-8 flex-1">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex -space-x-2">
                    {post.platforms.map(p => (
                      <div key={p} className="h-12 w-12 rounded-2xl bg-black border-4 border-[#0b0b0b] flex items-center justify-center shadow-2xl relative z-10 transition-transform group-hover:-translate-y-1" title={p}>
                        <div className="scale-125">
                          {getPlatformIcon(p)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full flex items-center gap-2 border-none backdrop-blur-md shadow-lg",
                    post.status === 'published' ? "bg-emerald-500/10 text-emerald-400" :
                      post.status === 'scheduled' ? "bg-blue-500/10 text-blue-400" :
                        "bg-white/5 text-white/30"
                  )}>
                    <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", 
                        post.status === 'published' ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : 
                        post.status === 'scheduled' ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "bg-white/30"
                    )} />
                    {post.status}
                  </Badge>
                </div>
                
                <div className="space-y-5">
                    {post.media_urls && post.media_urls.length > 0 && (
                        <div className="relative aspect-video rounded-[24px] overflow-hidden border border-white/5 mb-4 group-hover:border-[#6c47ff]/20 transition-all duration-500 shadow-2xl">
                            <img src={post.media_urls[0]} alt="Post media" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            {post.media_urls.length > 1 && (
                                <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-[10px] font-black text-white border border-white/10 shadow-2xl">
                                    +{post.media_urls.length - 1} MORE
                                </div>
                            )}
                        </div>
                    )}
                    <div className="text-lg font-bold leading-relaxed line-clamp-4 text-white/80 group-hover:text-white transition-colors tracking-tight">
                    {post.content}
                    </div>
                </div>
              </CardHeader>
              <CardFooter className="pt-0 pb-8 px-8 flex items-center justify-between border-t border-white/5 mt-auto group-hover:bg-white/[0.01] transition-colors h-24">
                <div className="flex items-center gap-3 text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">
                  <Calendar className="h-3.5 w-3.5 text-[#6c47ff]" />
                  {post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : new Date(post.created_at).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  {post.status !== 'published' && post.status !== 'publishing' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-12 w-12 p-0 rounded-2xl hover:bg-emerald-500/10 hover:text-emerald-400 text-white/20 transition-all active:scale-95 border border-transparent hover:border-emerald-500/20"
                      onClick={() => handlePublishPost(post.id)}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="sm" className="h-12 w-12 p-0 rounded-2xl hover:bg-white/5 text-white/20 transition-all active:scale-95 border border-transparent hover:border-white/10">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="bg-[#16161e] border-white/10 text-white min-w-[180px] p-2 rounded-2xl shadow-2xl backdrop-blur-xl">
                      <DropdownMenuItem className="text-rose-500 focus:text-rose-500 focus:bg-rose-500/10 cursor-pointer h-12 rounded-xl font-black text-[10px] uppercase tracking-widest" onClick={() => handleDeletePost(post.id)}>
                        <Trash2 className="mr-3 h-4 w-4" /> Delete Transmission
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
