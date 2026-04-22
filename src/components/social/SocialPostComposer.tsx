'use client';

import { useState, useRef } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Send, 
  Clock, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter,
  AlertCircle,
  Hash,
  Smile,
  MapPin,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { createSocialPost, publishSocialPost } from '@/app/actions/social';
import { toast } from 'sonner';

interface SocialPostComposerProps {
  connectedPlatforms: string[];
  onClose: () => void;
  onPostCreated: (post: any) => void;
}

export function SocialPostComposer({ connectedPlatforms, onClose, onPostCreated }: SocialPostComposerProps) {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(connectedPlatforms.slice(0, 1));
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PLATFORMS = [
    { id: 'facebook', icon: Facebook, color: 'text-blue-500' },
    { id: 'instagram', icon: Instagram, color: 'text-pink-500' },
    { id: 'linkedin', icon: Linkedin, color: 'text-blue-700' },
    { id: 'twitter', icon: Twitter, color: 'text-sky-500' },
  ];

  const handleTogglePlatform = (id: string) => {
    if (!connectedPlatforms.includes(id)) {
      toast.error(`${id} is not connected. Go to settings to link account.`);
      return;
    }
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (publishNow: boolean = false) => {
    if (selectedPlatforms.length === 0) {
      toast.error('Select at least one platform');
      return;
    }
    if (!content.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createSocialPost({
        content,
        platforms: selectedPlatforms,
        scheduled_at: publishNow ? null : scheduledAt,
        status: publishNow ? 'published' : 'scheduled'
      });

      if (result.success && result.id) {
        if (publishNow) {
          await publishSocialPost(result.id);
          toast.success('Post published live!');
        } else {
          toast.success('Post scheduled successfully');
        }
        onPostCreated({
          id: result.id,
          content,
          platforms: selectedPlatforms,
          scheduled_at: scheduledAt,
          status: publishNow ? 'published' : 'scheduled'
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0b0b10] border border-white/5 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-white tracking-tight">Create Social Post</h3>
            <p className="text-[10px] text-white/20 uppercase font-black tracking-widest leading-none">Multi-Platform Campaign</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/5 text-white/40">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-8 space-y-8">
          {/* Platform Selector */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Select Destinations</label>
            <div className="flex flex-wrap gap-3">
              {PLATFORMS.map(platform => {
                const isConnected = connectedPlatforms.includes(platform.id);
                const isSelected = selectedPlatforms.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    onClick={() => handleTogglePlatform(platform.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all relative overflow-hidden group",
                      isSelected ? "bg-white/5 border-white/10 text-white" : "border-white/5 text-white/20 hover:border-white/10"
                    )}
                  >
                    <platform.icon className={cn("h-4 w-4", isConnected && isSelected && platform.color)} />
                    <span className="text-xs font-bold capitalize">{platform.id}</span>
                    {isSelected && (
                      <div className="absolute top-0 right-0 p-1">
                        <Check className="h-2 w-2 text-emerald-500" />
                      </div>
                    )}
                    {!isConnected && (
                       <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <AlertCircle className="h-3 w-3 text-white/40" />
                       </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-3">
            <div className="relative group">
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening? Share it across your platforms..."
                className="w-full min-h-[160px] bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#6c47ff]/50 focus:bg-white/[0.03] transition-all scrollbar-none"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                <button className="text-white/20 hover:text-white transition-colors"><Smile size={16} /></button>
                <button className="text-white/20 hover:text-white transition-colors"><Hash size={16} /></button>
                <button className="text-white/20 hover:text-white transition-colors"><MapPin size={16} /></button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="border-white/5 bg-white/5 hover:bg-white/10 text-white/60 h-10 px-4 rounded-xl text-xs gap-2"
              >
                <ImageIcon className="h-4 w-4" /> Add Media
              </Button>
              <input type="file" ref={fileInputRef} hidden multiple />
              
              <div className="h-10 border-l border-white/5 mx-2" />
              
              <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-xl px-4 border border-white/5">
                <Clock className="h-3.5 w-3.5 text-[#6c47ff]" />
                <input 
                  type="datetime-local" 
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="bg-transparent border-none text-[10px] font-bold text-white/60 outline-none h-10 w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/[0.02] flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full", content.length > 280 ? "bg-red-500" : "bg-emerald-500")} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
                {content.length} / 280 characters
              </span>
           </div>
           
           <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting || !scheduledAt}
                className="h-11 rounded-xl text-xs font-bold text-white/40 hover:text-white"
              >
                Schedule Release
              </Button>
              <Button 
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting || !content.trim()}
                className="bg-white text-black hover:bg-white/90 h-11 px-8 rounded-xl font-black text-xs uppercase tracking-widest gap-2"
              >
                {isSubmitting ? '...' : <><Send className="h-3.5 w-3.5" /> Post Now</>}
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
