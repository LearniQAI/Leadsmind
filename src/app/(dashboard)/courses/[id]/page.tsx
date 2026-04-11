import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { getCourseModules } from '@/app/actions/lms';
import { CoursePlayer } from '@/components/lms/CoursePlayer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Settings } from 'lucide-react';
import Link from 'next/link';

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (!course) notFound();

  const modules = await getCourseModules(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/courses/${id}/edit`}>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-white/50 hover:text-white rounded-xl bg-white/5 border border-white/5">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <span className="text-[10px] font-black text-[#6c47ff] uppercase tracking-[0.3em]">Student View Preview</span>
            <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase italic">{course.title}</h1>
          </div>
        </div>
        <Link href={`/courses/${id}/edit`}>
          <Button variant="outline" className="bg-white/5 border-white/10 text-white rounded-xl gap-2">
            <Settings className="h-4 w-4" />
            Back to Editor
          </Button>
        </Link>
      </div>

      <CoursePlayer course={course} modules={modules} />
    </div>
  );
}
