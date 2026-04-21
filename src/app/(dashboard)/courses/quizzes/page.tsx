import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Brain, ArrowRight, Play, Settings } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function QuizzesListPage() {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return null;

  const supabase = await createClient();
  
  // Fetch all quizzes in the workspace
  const { data: quizzes } = await supabase
    .from('lms_quizzes')
    .select('*, course:courses(title)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <div className="h-5 w-5 rounded-md bg-[#6c47ff]/10 flex items-center justify-center border border-[#6c47ff]/20">
                <Brain className="h-3.5 w-3.5 text-[#6c47ff]" />
             </div>
             <span className="text-[10px] font-black text-[#6c47ff] uppercase tracking-widest">Assessment Portfolio</span>
           </div>
           <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Quizzes & Assessments</h1>
           <p className="mt-2 text-white/50 italic">Manage your industrial-grade assessments and knowledge checks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(!quizzes || quizzes.length === 0) ? (
          <div className="col-span-full py-20 text-center bg-white/3 border border-dashed border-white/10 rounded-3xl">
            <Brain className="h-12 w-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 italic">No quizzes created yet. Manage them within your courses.</p>
            <Button variant="link" className="text-[#6c47ff]" asChild>
               <Link href="/courses">Go to Learning Management</Link>
            </Button>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <Card key={quiz.id} className="bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group overflow-hidden">
              <CardHeader className="pb-4">
                 <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-[#6c47ff]/10 text-[#6c47ff] border-[#6c47ff]/20">
                       {quiz.course?.title || 'Standalone'}
                    </Badge>
                    <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Passing: {quiz.passing_score}%</span>
                 </div>
                 <CardTitle className="text-lg font-bold text-white group-hover:text-[#6c47ff] transition-colors">{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center">
                       <span className="text-[10px] text-white/20 uppercase font-black">Time Limit</span>
                       <span className="text-sm font-bold text-white">{quiz.time_limit_minutes}m</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center">
                       <span className="text-[10px] text-white/20 uppercase font-black">Max Retakes</span>
                       <span className="text-sm font-bold text-white">{quiz.max_retakes === -1 ? '∞' : quiz.max_retakes}</span>
                    </div>
                 </div>
                 
                 <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1 bg-white/5 border-white/10 text-white gap-2 h-10 rounded-xl text-xs font-bold" asChild>
                       <Link href={`/courses/${quiz.course_id}/edit`}>
                          <Settings className="h-3.5 w-3.5" />
                          Designer
                       </Link>
                    </Button>
                    <Button className="flex-1 bg-[#6c47ff] hover:bg-[#5b3ce0] text-white gap-2 h-10 rounded-xl text-xs font-bold" asChild>
                       <Link href={`/courses/${quiz.course_id}`}>
                          <Play className="h-3.5 w-3.5" />
                          Preview
                       </Link>
                    </Button>
                 </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
