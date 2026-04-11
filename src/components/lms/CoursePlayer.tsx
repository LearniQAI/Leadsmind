'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  FileText, 
  CheckCircle2, 
  Lock,
  Download,
  Video,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getSignedUrl } from '@/app/actions/media';

interface CoursePlayerProps {
  course: any;
  modules: any[];
}

export function CoursePlayer({ course, modules }: CoursePlayerProps) {
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Set first lesson as default
  useEffect(() => {
    if (modules.length > 0 && modules[0].lessons.length > 0) {
      setActiveLesson(modules[0].lessons[0]);
    }
  }, [modules]);

  // Load media when lesson changes
  useEffect(() => {
    if (!activeLesson) return;
    
    const loadMedia = async () => {
      setVideoUrl(null);
      setPdfUrl(null);

      if (activeLesson.content_type === 'video' && activeLesson.video_path) {
        const url = await getSignedUrl(activeLesson.video_path);
        setVideoUrl(url);
      } else if (activeLesson.content_type === 'pdf' && activeLesson.pdf_path) {
        const url = await getSignedUrl(activeLesson.pdf_path);
        setPdfUrl(url);
      }
    };
    
    loadMedia();
  }, [activeLesson]);

  if (!activeLesson) return null;

  return (
    <div className="flex h-[calc(100vh-120px)] bg-[#030303] rounded-3xl overflow-hidden border border-white/5 relative">
      {/* Sidebar Toggle (Mobile) */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl md:hidden"
      >
        {isSidebarOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
      </button>

      {/* Sidebar Curriculum */}
      <aside className={cn(
        "bg-[#0b0b10] border-r border-white/5 transition-all duration-300 z-40",
        isSidebarOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full md:w-0"
      )}>
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-black italic tracking-tighter text-white uppercase truncate">{course.title}</h2>
          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#6c47ff] w-[30%] shadow-[0_0_10px_rgba(108,71,255,0.5)]" />
          </div>
          <p className="text-[10px] text-white/30 font-bold uppercase mt-2">30% Complete</p>
        </div>

        <ScrollArea className="h-[calc(100%-120px)]">
          <div className="p-4 space-y-6">
            {modules.map((module, mIndex) => (
              <div key={module.id} className="space-y-2">
                <p className="px-2 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Module {mIndex + 1}: {module.title}</p>
                <div className="space-y-1">
                  {module.lessons.map((lesson: any) => (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all group relative overflow-hidden",
                        activeLesson.id === lesson.id 
                          ? "bg-[#6c47ff]/10 border border-[#6c47ff]/20 text-white" 
                          : "text-white/40 hover:bg-white/5 border border-transparent"
                      )}
                    >
                      {activeLesson.id === lesson.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6c47ff]" />
                      )}
                      {lesson.content_type === 'video' || lesson.content_type === 'youtube' ? (
                        <Video className={cn("h-4 w-4 shrink-0", activeLesson.id === lesson.id ? "text-[#6c47ff]" : "text-white/20")} />
                      ) : (
                        <FileText className={cn("h-4 w-4 shrink-0", activeLesson.id === lesson.id ? "text-emerald-500" : "text-white/20")} />
                      )}
                      <span className="text-xs font-bold text-left truncate">{lesson.title}</span>
                      {activeLesson.id === lesson.id && <CheckCircle2 className="h-3 w-3 text-[#6c47ff] ml-auto shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-black">
        <div className="flex-1 overflow-y-auto">
          {/* Content Presenter */}
          <div className="aspect-video w-full bg-[#050505] relative border-b border-white/5">
            {activeLesson.content_type === 'video' && videoUrl && (
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-full object-contain"
                controlsList="nodownload" 
              />
            )}
            
            {activeLesson.content_type === 'youtube' && activeLesson.youtube_url && (
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeID(activeLesson.youtube_url)}`}
                className="w-full h-full"
                allowFullScreen
              />
            )}

            {activeLesson.content_type === 'pdf' && pdfUrl && (
              <div className="w-full h-full flex flex-col bg-[#111]">
                <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-bold text-white uppercase italic">{activeLesson.title}</span>
                  </div>
                  <Button onClick={() => window.open(pdfUrl, '_blank')} className="h-8 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 gap-2 rounded-lg px-4 text-xs font-bold uppercase">
                    <Download className="h-3 w-3" /> Download
                  </Button>
                </div>
                <iframe
                  src={`${pdfUrl}#toolbar=0`}
                  className="flex-1 w-full border-none"
                  title="PDF Document"
                />
              </div>
            )}

            {!videoUrl && activeLesson.content_type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c47ff]" />
              </div>
            )}
          </div>

          <div className="p-8 md:p-12 space-y-8 max-w-4xl">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-black text-[#6c47ff] uppercase tracking-[0.3em] bg-[#6c47ff]/10 px-3 py-1 rounded-full border border-[#6c47ff]/20">Active Lesson</span>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{activeLesson.duration_minutes} Minutes</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-6 leading-none">{activeLesson.title}</h1>
              <div 
                className="prose prose-invert max-w-none text-white/60 leading-relaxed text-lg"
                dangerouslySetInnerHTML={{ __html: activeLesson.content_html || '<p>No description provided for this lesson.</p>' }}
              />
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <footer className="p-6 bg-[#0b0b10] border-t border-white/5 flex items-center justify-between">
          <Button variant="ghost" className="text-white/40 hover:text-white gap-2 font-bold uppercase tracking-widest text-xs">
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#6c47ff]" />
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Mark as Completed</span>
          </div>
          <Button className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white gap-2 font-bold uppercase tracking-widest text-xs rounded-xl px-6 h-11 shadow-lg shadow-[#6c47ff]/10">
            Next Lesson <ChevronRight className="h-4 w-4" />
          </Button>
        </footer>
      </main>
    </div>
  );
}

function getYouTubeID(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
