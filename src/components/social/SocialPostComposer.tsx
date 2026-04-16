'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Calendar, 
  Camera, 
  X, 
  Smile, 
  ArrowLeft,
  ChevronRight,
  Loader2,
  Library
} from 'lucide-react';
import { FaLinkedin as LinkedIn, FaFacebook as Facebook, FaTiktok as TikTok } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createSocialPost } from '@/app/actions/social';
import { createClient } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';
import { Theme } from 'emoji-picker-react';
import { MediaSelectorDialog } from './MediaSelectorDialog';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface SocialPostComposerProps {
  initialPlatforms: string[];
}

export function SocialPostComposer({ initialPlatforms }: SocialPostComposerProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const connectedPlatforms = initialPlatforms.filter(p =>
    ['linkedin', 'facebook', 'tiktok'].includes(p)
  );

  const handleUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading('Uploading media...');
    try {
      const supabase = createClient();
      const user = (await supabase.auth.getUser()).data.user;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `social-media/${fileName}`;

      const { data, error } = await supabase.storage
        .from('workspace-assets')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('workspace-assets')
        .getPublicUrl(filePath);

      setMediaUrls(prev => [...prev, publicUrl]);
      toast.success('Media uploaded successfully', { id: toastId });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`, { id: toastId });
    }
  };

  const handleCreatePost = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
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
        scheduled_at: scheduledAt || undefined,
        media_urls: mediaUrls
      });

      if (result.success) {
        toast.success('Broadcast deployed successfully!');
        router.push('/social-posts');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to deploy broadcast');
      }
    } catch (e) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const onEmojiClick = (emojiData: any) => {
    setContent(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="text-white/40 hover:text-white transition-colors gap-2 hover:bg-white/5 rounded-2xl h-12"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Systems Nominal</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 min-h-[700px]">
        {/* Left Col: Composer */}
        <div className="flex-1 space-y-8">
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-b from-[#6c47ff]/20 to-transparent rounded-[40px] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
            <div className="relative bg-[#0b0b0b] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-[#6c47ff]/20 flex items-center justify-center border border-[#6c47ff]/30">
                    <Share2 className="h-5 w-5 text-[#6c47ff]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tighter italic">Broadcaster</h2>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Creative Composer</p>
                  </div>
                </div>
                
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all">
                      <Smile className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="end" className="p-0 border-none bg-transparent shadow-2xl">
                    <EmojiPicker 
                      onEmojiClick={onEmojiClick}
                      theme={Theme.DARK}
                      skinTonesDisabled
                      searchDisabled
                      height={400}
                      width={320}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="p-8 pb-12">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What is the story today? Craft your message here..."
                  className="min-h-[400px] bg-transparent border-none text-white text-2xl font-medium leading-relaxed resize-none focus-visible:ring-0 p-0 placeholder:text-white/5 scrollbar-hide"
                />
              </div>

              <div className="p-8 border-t border-white/5 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-8">
                  <label className="flex items-center gap-2 cursor-pointer group/label">
                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadMedia} />
                    <Camera className="h-5 w-5 text-white/20 group-hover/label:text-[#6c47ff] transition-colors" />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest group-hover/label:text-[#6c47ff]/50 transition-colors whitespace-nowrap">Upload Local</span>
                  </label>
                  
                  <div className="h-4 w-[1px] bg-white/5" />

                  <MediaSelectorDialog onSelect={(url) => setMediaUrls(prev => [...prev, url])} />
                </div>
                
                <div className="flex items-center gap-4 shrink-0">
                    <div className="text-[10px] font-black text-[#6c47ff] tracking-[0.2em] bg-[#6c47ff]/5 px-3 py-1 rounded-full border border-[#6c47ff]/10">
                        {content.length} <span className="opacity-30 text-white">/ 2200</span>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Media Grid */}
          {mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-500">
              {mediaUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-[32px] overflow-hidden border border-white/5 group shadow-2xl">
                  <img src={url} alt="Media" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <button
                    onClick={() => setMediaUrls(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-3 right-3 h-8 w-8 rounded-2xl bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 border border-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Options */}
        <div className="w-full lg:w-[400px] space-y-8">
          {/* Channel Selection */}
          <div className="bg-[#0b0b0b] border border-white/5 rounded-[40px] p-8 shadow-2xl">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <ChevronRight className="h-3 w-3 text-[#6c47ff]" /> Target Channels
            </h3>
            <div className="space-y-3">
              {[
                { id: 'linkedin', name: 'LinkedIn', icon: LinkedIn, color: '#0077b5' },
                { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877f2' },
                { id: 'tiktok', name: 'TikTok', icon: TikTok, color: '#ff0050' }
              ].map((p) => {
                const isConnected = connectedPlatforms.includes(p.id);
                const isSelected = selectedPlatforms.includes(p.id);

                return (
                  <button
                    key={p.id}
                    disabled={!isConnected}
                    onClick={() => togglePlatform(p.id)}
                    className={cn(
                      "w-full flex items-center gap-5 px-6 py-5 rounded-[28px] border transition-all relative overflow-hidden group",
                      !isConnected ? "opacity-20 grayscale cursor-not-allowed border-white/5" :
                        isSelected ? "border-[#6c47ff]/50 bg-[#6c47ff]/5 shadow-2xl shadow-[#6c47ff]/10" :
                          "border-white/5 bg-white/[0.01] hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform border border-white/5 shadow-inner">
                      <p.icon className="h-6 w-6" style={{ color: isConnected ? p.color : 'white' }} />
                    </div>
                    <div className="text-left">
                      <p className={cn("text-sm font-black tracking-tight", isSelected ? "text-white" : "text-white/40")}>{p.name}</p>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{isConnected ? 'Verified' : 'Connect Account'}</p>
                    </div>
                    {isSelected && (
                      <div className="ml-auto h-6 w-6 rounded-full bg-[#6c47ff] flex items-center justify-center shadow-lg shadow-[#6c47ff]/40">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {connectedPlatforms.length === 0 && (
                <div className="mt-8 p-6 rounded-[24px] bg-amber-500/5 border border-amber-500/10">
                    <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest text-center leading-relaxed">
                        No Verified Channels Found. Please Visit Integrations.
                    </p>
                </div>
            )}
          </div>

          {/* Schedule */}
          <div className="bg-[#0b0b0b] border border-white/5 rounded-[40px] p-8 shadow-2xl">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <ChevronRight className="h-3 w-3 text-[#6c47ff]" /> Transmission Settings
            </h3>
            <div className="space-y-6">
                <div className="space-y-3">
                    <Label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Scheduled Deployment</Label>
                    <div className="relative group/input">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none group-focus-within/input:text-[#6c47ff] transition-colors" />
                        <Input
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            className="bg-black/40 border-white/10 rounded-2xl text-white focus:ring-1 focus:ring-[#6c47ff]/50 transition-all h-14 font-black text-xs pl-12 shadow-lg"
                        />
                    </div>
                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest px-1 italic">Defaults to immediate broadcast.</p>
                </div>

                <div className="p-6 rounded-[28px] bg-gradient-to-br from-[#6c47ff]/10 to-transparent border border-[#6c47ff]/10">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertCircle className="h-4 w-4 text-[#6c47ff]" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Efficiency Tip</span>
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed font-bold italic">
                        Tuesday transmissions between <span className="text-white">9:00 AM - 11:00 AM</span> yield peak multi-platform engagement.
                    </p>
                </div>
            </div>
          </div>

          {/* Action */}
          <Button
            onClick={handleCreatePost}
            disabled={isSubmitting || connectedPlatforms.length === 0}
            className="w-full bg-white text-black hover:bg-[#6c47ff] hover:text-white font-black uppercase tracking-[0.2em] text-xs h-20 rounded-[32px] transition-all shadow-2xl group relative overflow-hidden active:scale-[0.98] duration-300"
          >
            {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Send className="mr-3 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                Deploy Broadcast
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
