'use client';

import { useState } from 'react';
import { 
  Plus, 
  GripVertical, 
  Video, 
  FileText, 
  Youtube,
  Settings, 
  Eye, 
  Save,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createModule, createLesson, deleteLesson } from '@/app/actions/lms';
import { toast } from 'sonner';
import { LessonSettingsModal } from './LessonSettingsModal';
import Link from 'next/link';

interface CourseBuilderProps {
  courseId: string;
  initialModules: any[];
  workspaceId?: string; // Add workspaceId to props
}

export function CourseBuilder({ courseId, initialModules, workspaceId = '' }: CourseBuilderProps) {
  const [modules, setModules] = useState(initialModules);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [editingLesson, setEditingLesson] = useState<any>(null);

  const handleAddModule = async () => {
    if (!newModuleName.trim()) return;
    try {
      const newModule = await createModule(courseId, newModuleName, modules.length);
      setModules([...modules, { ...newModule, lessons: [] }]);
      setNewModuleName('');
      setIsAddingModule(false);
      toast.success('Module added');
    } catch (error) {
      toast.error('Failed to add module');
    }
  };

  const handleAddLesson = async (moduleId: string) => {
    try {
      const moduleIndex = modules.findIndex(m => m.id === moduleId);
      const lessonTitle = `New Lesson ${modules[moduleIndex].lessons.length + 1}`;
      const newLesson = await createLesson(moduleId, lessonTitle, modules[moduleIndex].lessons.length);
      
      const updatedModules = [...modules];
      updatedModules[moduleIndex].lessons.push(newLesson);
      setModules(updatedModules);
      toast.success('Lesson added');
      setEditingLesson(newLesson); // Open newly created lesson
    } catch (error) {
      toast.error('Failed to add lesson');
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    try {
      await deleteLesson(lessonId);
      const updatedModules = modules.map(m => {
        if (m.id === moduleId) {
          return { ...m, lessons: m.lessons.filter((l: any) => l.id !== lessonId) };
        }
        return m;
      });
      setModules(updatedModules);
      toast.success('Lesson deleted');
    } catch (error) {
      toast.error('Failed to delete lesson');
    }
  };

  const handleLessonUpdate = (updatedLesson: any) => {
    const updatedModules = modules.map(m => ({
      ...m,
      lessons: m.lessons.map((l: any) => l.id === updatedLesson.id ? updatedLesson : l)
    }));
    setModules(updatedModules);
  };

  return (
    <div className="space-y-6">
      {editingLesson && (
        <LessonSettingsModal 
          open={!!editingLesson}
          onOpenChange={(open) => !open && setEditingLesson(null)}
          lesson={editingLesson}
          workspaceId={workspaceId}
          onSave={handleLessonUpdate}
        />
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">Course Curriculum</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href={`/courses/${courseId}`} className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white rounded-xl">
              <Eye className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </Link>
          <Button className="flex-1 sm:flex-none bg-[#6c47ff] hover:bg-[#5b3ce0] rounded-xl">
            <Save className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Save Changes</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {modules.map((module, mIndex) => (
          <Card key={module.id} className="bg-white/3 border-white/5 overflow-hidden">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-white/5 border-b border-white/5">
              <div className="flex items-center gap-2 sm:gap-3">
                <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-white/20 cursor-grab shrink-0" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 shrink-0">
                  <span className="text-[9px] sm:text-xs font-bold text-[#6c47ff] uppercase tracking-wider">Module {mIndex + 1}</span>
                  <h3 className="font-bold text-white text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">{module.title}</h3>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={() => handleAddLesson(module.id)}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {module.lessons.map((lesson: any, lIndex: number) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 sm:p-4 pl-10 sm:pl-12 hover:bg-white/2 transition-colors group cursor-pointer" onClick={() => setEditingLesson(lesson)}>
                    <div className="flex items-center gap-3">
                      {lesson.content_type === 'video' ? <Video className="h-3 w-3 sm:h-4 sm:w-4 text-[#6c47ff]" /> : 
                       lesson.content_type === 'pdf' ? <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" /> :
                       lesson.content_type === 'youtube' ? <Youtube className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" /> :
                       <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white/40" />}
                      <span className="text-xs sm:text-sm font-medium text-white/80 group-hover:text-white transition-colors">{lesson.title}</span>
                      {lesson.is_preview && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-black uppercase tracking-widest border border-blue-500/20">Preview</span>}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-white/30 hover:text-red-400 rounded-lg" onClick={(e) => { e.stopPropagation(); handleDeleteLesson(module.id, lesson.id); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => handleAddLesson(module.id)}
                className="w-full py-4 text-[10px] sm:text-xs font-bold text-white/30 hover:text-[#6c47ff] hover:bg-[#6c47ff]/5 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                <Plus className="h-3 w-3" />
                Add Lesson
              </button>
            </CardContent>
          </Card>
        ))}

        {isAddingModule ? (
          <Card className="bg-white/3 border-[#6c47ff]/50 border-dashed">
            <CardContent className="p-4 flex items-center gap-4">
              <Input 
                autoFocus
                placeholder="Enter module title..." 
                className="bg-white/5 border-white/10 text-white"
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
              />
              <Button onClick={handleAddModule} className="bg-[#6c47ff] hover:bg-[#5b3ce0]">Add</Button>
              <Button variant="ghost" onClick={() => setIsAddingModule(false)}>Cancel</Button>
            </CardContent>
          </Card>
        ) : (
          <Button 
            variant="outline" 
            className="w-full h-16 border-dashed border-white/10 bg-white/3 text-white/40 hover:bg-white/5 hover:border-white/20 hover:text-white transition-all rounded-2xl"
            onClick={() => setIsAddingModule(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Module
          </Button>
        )}
      </div>
    </div>
  );
}
