'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  FileText, 
  Youtube, 
  Loader2, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Eye
} from 'lucide-react';
import { saveLesson } from '@/app/actions/lms';
import { toast } from 'sonner';

interface LessonSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: any;
  workspaceId: string;
  onSave: (updatedLesson: any) => void;
}

export function LessonSettingsModal({ open, onOpenChange, lesson, workspaceId, onSave }: LessonSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState(lesson.content_type || 'text');
  const [title, setTitle] = useState(lesson.title || '');
  const [youtubeUrl, setYoutubeUrl] = useState(lesson.youtube_url || '');
  const [duration, setDuration] = useState(lesson.duration_minutes?.toString() || '0');
  const [isPreview, setIsPreview] = useState(lesson.is_preview || false);
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('lessonId', lesson.id);
      formData.append('workspaceId', workspaceId);
      formData.append('title', title);
      formData.append('contentType', contentType);
      formData.append('youtubeUrl', youtubeUrl);
      formData.append('duration', duration);
      formData.append('isPreview', isPreview.toString());
      
      if (videoFile) formData.append('videoFile', videoFile);
      if (pdfFile) formData.append('pdfFile', pdfFile);

      const updated = await saveLesson(formData);
      onSave(updated);
      toast.success('Lesson saved successfully');
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-2xl bg-[#0b0b10] border-white/5 p-0 overflow-hidden rounded-[28px] shadow-2xl transition-all duration-300">
        <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.01]">
          <DialogTitle className="text-xl md:text-2xl font-black italic tracking-tighter uppercase">Lesson Settings</DialogTitle>
        </DialogHeader>

        <div className="p-4 md:p-8 space-y-8 max-h-[75vh] md:max-h-[80vh] overflow-y-auto scrollbar-none">
          {/* General info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Lesson Title</Label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/5 border-white/10 rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Duration (Minutes)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input 
                  type="number"
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)}
                  className="bg-white/5 border-white/10 rounded-xl h-11 pl-10"
                />
              </div>
            </div>
          </div>

          {/* Content Type Tabs */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Content Type</Label>
            <Tabs value={contentType} onValueChange={setContentType} className="w-full">
              <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl h-12 w-full grid grid-cols-4">
                <TabsTrigger value="video" className="rounded-lg data-[state=active]:bg-[#6c47ff] data-[state=active]:text-white gap-2 font-bold transition-all">
                  <Video className="h-4 w-4" />
                  <span className="hidden sm:inline">Video</span>
                </TabsTrigger>
                <TabsTrigger value="pdf" className="rounded-lg data-[state=active]:bg-[#6c47ff] data-[state=active]:text-white gap-2 font-bold transition-all">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">PDF</span>
                </TabsTrigger>
                <TabsTrigger value="youtube" className="rounded-lg data-[state=active]:bg-[#6c47ff] data-[state=active]:text-white gap-2 font-bold transition-all">
                  <Youtube className="h-4 w-4" />
                  <span className="hidden sm:inline">YouTube</span>
                </TabsTrigger>
                <TabsTrigger value="text" className="rounded-lg data-[state=active]:bg-[#6c47ff] data-[state=active]:text-white gap-2 font-bold transition-all">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Text</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="video" className="animate-in fade-in duration-300">
                  <div className="space-y-4">
                    <div className="group relative border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-[#6c47ff]/50 transition-all bg-white/[0.02]">
                      <input 
                        type="file" 
                        accept="video/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      />
                      {videoFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                          <p className="font-bold text-white">{videoFile.name}</p>
                          <p className="text-xs text-white/40">Click to replace video file</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-10 w-10 text-white/20 group-hover:text-[#6c47ff] transition-colors" />
                          <p className="font-bold text-white">Upload Video Lesson</p>
                          <p className="text-xs text-white/40">MP4, MOV supported. Max size 200MB (Stripe Basic Limit)</p>
                        </div>
                      )}
                    </div>
                    {lesson.video_path && !videoFile && (
                      <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs text-emerald-500 font-bold">Current video is saved on server</span>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="pdf" className="animate-in fade-in duration-300">
                   <div className="space-y-4">
                    <div className="group relative border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-[#6c47ff]/50 transition-all bg-white/[0.02]">
                      <input 
                        type="file" 
                        accept="application/pdf" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                      />
                      {pdfFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                          <p className="font-bold text-white">{pdfFile.name}</p>
                          <p className="text-xs text-white/40">Click to replace PDF file</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-10 w-10 text-white/20 group-hover:text-[#6c47ff] transition-colors" />
                          <p className="font-bold text-white">Upload Lesson Handout (PDF)</p>
                          <p className="text-xs text-white/40">Upload resources for your students</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="youtube" className="animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-white/70">YouTube Video URL</Label>
                    <div className="relative">
                      <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                      <Input 
                        placeholder="https://youtube.com/watch?v=..." 
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="bg-white/5 border-white/10 rounded-xl h-11 pl-10"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="text" className="animate-in fade-in duration-300">
                  <div className="py-20 text-center bg-white/2 border border-dashed border-white/10 rounded-2xl">
                    <p className="text-white/40 text-sm">Rich text editor integration coming soon.<br/>Title and duration will be saved.</p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Preview Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Free Preview Lesson</p>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Allow non-enrolled users to see this</p>
              </div>
            </div>
            <button 
              onClick={() => setIsPreview(!isPreview)}
              className={`w-12 h-6 rounded-full transition-all relative ${isPreview ? 'bg-[#6c47ff]' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isPreview ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <DialogFooter className="p-6 bg-white/[0.02] border-t border-white/5">
          <Button 
            disabled={loading}
            onClick={handleSave}
            className="w-full h-12 bg-[#6c47ff] hover:bg-[#5b3ce0] text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-[#6c47ff]/20"
          >
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save & Publish Lesson'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
