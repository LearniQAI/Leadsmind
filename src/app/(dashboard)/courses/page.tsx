import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getCourses } from '@/app/actions/lms';
import { Button } from '@/components/ui/button';
import { Plus, GraduationCap, Users, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('workspace_id')
    .eq('id', user.id)
    .single();

  if (!profile?.workspace_id) redirect('/onboarding');

  const courses = await getCourses(profile.workspace_id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Learning Management</h1>
          <p className="mt-2 text-white/50">Build and deliver educational content to your clients.</p>
        </div>
        <Link href="/courses/new">
          <Button className="bg-[#6c47ff] hover:bg-[#5b3ce0] gap-2">
            <Plus className="h-4 w-4" />
            <span>Create Course</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white/3 border border-dashed border-white/10 rounded-3xl">
            <GraduationCap className="h-12 w-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30">No courses created yet.</p>
            <Link href="/courses/new" className="mt-4 inline-block">
              <Button variant="link" className="text-[#6c47ff]">Start your first course</Button>
            </Link>
          </div>
        ) : (
          courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}/edit`}>
              <Card className="bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer overflow-hidden group">
                {course.thumbnail_url ? (
                  <div className="aspect-video w-full overflow-hidden">
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-[#6c47ff]/10 flex items-center justify-center">
                    <GraduationCap className="h-12 w-12 text-[#6c47ff]/40" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={course.published ? 'default' : 'secondary'} className={course.published ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-white/40 border-white/10'}>
                      {course.published ? 'Published' : 'Draft'}
                    </Badge>
                    <span className="text-white/80 font-bold">${course.price}</span>
                  </div>
                  <CardTitle className="text-white group-hover:text-[#6c47ff] transition-colors">{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-white/30 text-xs">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span>Modules</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>Students</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
