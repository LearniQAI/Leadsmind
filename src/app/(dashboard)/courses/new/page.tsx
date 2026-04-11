'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCourse } from '@/app/actions/lms';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap, Loader2 } from 'lucide-react';
import { getCurrentWorkspace } from '@/lib/auth';

export default function NewCoursePage() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const workspace = await getCurrentWorkspace();

      if (!workspace) throw new Error('No workspace found');

      const course = await createCourse(workspace.id, title);
      toast.success('Course created successfully');
      router.push(`/courses/${course.id}/edit`);
    } catch (error) {
      toast.error('Failed to create course');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-up">
      <div className="w-full max-w-md bg-white/3 border border-white/5 p-8 rounded-[32px] space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-2xl bg-[#6c47ff]/10 flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-[#6c47ff]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Create New Course</h1>
          <p className="text-sm text-white/40 mt-1">Ready to share your knowledge with the world?</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Course Title</label>
            <Input
              placeholder="e.g. Masterclass in Marketing"
              className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <Button
            onClick={handleCreate}
            disabled={loading || !title.trim()}
            className="w-full h-12 bg-[#6c47ff] hover:bg-[#5b3ce0] text-white font-bold rounded-xl shadow-lg shadow-[#6c47ff]/20"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Course & Continue'}
          </Button>

          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="w-full text-white/30 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
