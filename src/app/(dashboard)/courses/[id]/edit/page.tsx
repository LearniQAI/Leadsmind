import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { getCourseModules } from '@/app/actions/lms';
import { CourseBuilder } from '@/components/lms/CourseBuilder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, BookOpen, Users, BarChart3, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/courses">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-white/50 hover:text-white rounded-xl bg-white/5 border border-white/5">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">{course.title}</h1>
            <p className="text-sm text-white/40">Editing course curriculum and settings.</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="curriculum" className="space-y-8">
        <TabsList className="bg-[#0b0b10] border border-white/5 p-1 rounded-2xl h-14">
          <TabsTrigger value="curriculum" className="rounded-xl px-6 data-[state=active]:bg-white/5 data-[state=active]:text-[#6c47ff] gap-2 font-bold transition-all">
            <BookOpen className="h-4 w-4" />
            <span>Curriculum</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="rounded-xl px-6 data-[state=active]:bg-white/5 data-[state=active]:text-[#6c47ff] gap-2 font-bold transition-all">
            <Users className="h-4 w-4" />
            <span>Students</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl px-6 data-[state=active]:bg-white/5 data-[state=active]:text-[#6c47ff] gap-2 font-bold transition-all">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl px-6 data-[state=active]:bg-white/5 data-[state=active]:text-[#6c47ff] gap-2 font-bold transition-all">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CourseBuilder courseId={id} initialModules={modules} />
        </TabsContent>

        <TabsContent value="students" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="py-20 text-center bg-white/3 border border-dashed border-white/10 rounded-3xl">
            <Users className="h-12 w-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30">No students enrolled yet.</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className="py-20 text-center bg-white/3 border border-dashed border-white/10 rounded-3xl">
            <BarChart3 className="h-12 w-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30">Analytics will appear here once you have students.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-8 bg-white/3 border border-white/5 rounded-3xl space-y-6">
             <h3 className="text-lg font-bold text-white">General Settings</h3>
             <div className="space-y-4">
               <div>
                 <label className="text-sm font-medium text-white/70">Course Title</label>
                 <Input defaultValue={course.title} className="bg-white/5 border-white/10 text-white mt-1" />
               </div>
               <div>
                 <label className="text-sm font-medium text-white/70">Description</label>
                 <textarea className="w-full bg-white/5 border border-white/10 text-white mt-1 rounded-xl p-3 h-32" defaultValue={course.description}></textarea>
               </div>
               <div className="flex items-center gap-4">
                 <div className="flex-1">
                   <label className="text-sm font-medium text-white/70">Price (USD)</label>
                   <Input type="number" defaultValue={course.price} className="bg-white/5 border-white/10 text-white mt-1" />
                 </div>
                 <div className="flex-1">
                   <label className="text-sm font-medium text-white/70">Status</label>
                   <div className="flex items-center h-10 px-3 bg-white/5 border border-white/10 rounded-xl mt-1 text-white">
                     {course.published ? 'Published' : 'Draft'}
                   </div>
                 </div>
               </div>
             </div>
             <Button className="bg-[#6c47ff] hover:bg-[#5b3ce0]">Save Course Settings</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
