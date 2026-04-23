'use server';

import { createServerClient } from '@/lib/supabase/server';
import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { ActionResult } from '@/types/crm.types';
import { revalidatePath } from 'next/cache';

// --- Courses ---
export async function getCourses() {
  const workspaceId = await getCurrentWorkspaceId();
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('workspace_id', workspaceId!)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createCourse(workspaceId: string, title: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('courses')
    .insert({ workspace_id: workspaceId, title })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/courses');
  return data;
}

// --- Modules ---
export async function getCourseModules(courseId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('course_modules')
    .select(`
      *,
      lessons(*)
    `)
    .eq('course_id', courseId)
    .order('position');

  if (error) throw error;
  return data;
}

export async function createModule(courseId: string, title: string, position: number) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('course_modules')
    .insert({ course_id: courseId, title, position })
    .select()
    .single();

  if (error) throw error;
  revalidatePath(`/courses/${courseId}/edit`);
  return data;
}

// --- Lessons ---
export async function createLesson(moduleId: string, title: string, orderIndex: number) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('lessons')
    .insert({ module_id: moduleId, title, order_index: orderIndex })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveLesson(formData: FormData) {
  const supabase = await createServerClient();
  
  const lessonId = formData.get('lessonId') as string;
  const workspaceId = formData.get('workspaceId') as string;
  const title = formData.get('title') as string;
  const contentType = formData.get('contentType') as string;
  const youtubeUrl = formData.get('youtubeUrl') as string;
  const contentHtml = formData.get('contentHtml') as string;
  const isPreview = formData.get('isPreview') === 'true';
  const duration = parseInt(formData.get('duration') as string || '0');

  const updates: any = {
    title: title || undefined,
    content_type: contentType || undefined,
    youtube_url: youtubeUrl || null,
    content_html: contentHtml || null,
    is_preview: isPreview,
    duration_minutes: duration || 0
  };

  const { data, error } = await supabase
    .from('lessons')
    .update(updates)
    .eq('id', lessonId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteLesson(lessonId: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
  if (error) throw error;
}

// --- Enrollment & Progress ---
export async function enrollStudent(courseId: string, contactId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('enrollments')
    .insert({ course_id: courseId, contact_id: contactId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProgress(contactId: string, lessonId: string, completed: boolean, timeSpent: number) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert({ 
      contact_id: contactId, 
      lesson_id: lessonId, 
      completed, 
      time_spent: timeSpent,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- Quiz Engine ---
export async function saveQuiz(payload: any) {
  const supabase = await createServerClient();
  const { quizId, ...rest } = payload;
  
  const record = {
    workspace_id: rest.workspaceId,
    course_id: rest.courseId,
    module_id: rest.moduleId,
    title: rest.title,
    description: rest.description,
    passing_score: rest.passingScore,
    time_limit_minutes: rest.timeLimitMinutes,
    max_retakes: rest.maxRetakes,
    is_required: rest.isRequired,
    bank_enabled: rest.bankEnabled,
    question_count: rest.questionCount,
    updated_at: new Date().toISOString()
  };

  if (quizId) {
    const { data, error } = await supabase
      .from('lms_quizzes')
      .update(record)
      .eq('id', quizId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('lms_quizzes')
      .insert({ ...record, id: crypto.randomUUID() })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function saveQuestions(quizId: string, questions: any[]) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('lms_questions')
    .upsert(questions.map(q => ({
      ...q,
      quiz_id: quizId,
      updated_at: new Date().toISOString()
    })))
    .select();

  if (error) throw error;
  return data;
}

export async function generateAIQuestions(sourceText: string, config: { count: number; difficulty: 'easy' | 'balanced' | 'advanced' }) {
  // Mock AI logic
  await new Promise(resolve => setTimeout(resolve, 1000));
  return Array.from({ length: config.count }).map((_, i) => ({
    id: crypto.randomUUID(),
    type: 'multiple_choice',
    question_text: `Question ${i+1} based on source material...`,
    difficulty: config.difficulty,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correct_answer: 0,
    explanation: 'AI generated explanation.'
  }));
}

export async function saveAdaptiveRule(quizId: string, rule: any) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('lms_adaptive_rules')
    .insert({ ...rule, quiz_id: quizId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function saveCertificateTemplate(design: any) {
    const supabase = await createServerClient();
    const { data, error } = await supabase
        .from('lms_certificate_templates')
        .upsert({ ...design, updated_at: new Date().toISOString() })
        .select()
        .single();
    if (error) throw error;
    return data;
}

// --- Phase 27 New Actions ---

// Assignments
export async function submitAssignment(assignmentId: string, contactId: string, content: string, fileUrl?: string): Promise<ActionResult> {
    const supabase = await createServerClient();
    const { error } = await supabase
        .from('assignment_submissions')
        .insert({
            assignment_id: assignmentId,
            contact_id: contactId,
            content,
            submission_url: fileUrl
        });

    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<ActionResult> {
    const user = await requireAuth();
    const supabase = await createServerClient();
    const { error } = await supabase
        .from('assignment_submissions')
        .update({
            grade,
            feedback,
            graded_by: user.id,
            graded_at: new Date().toISOString()
        })
        .eq('id', submissionId);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

// Certificates (Phase 27 issuance)
export async function issueCertificate(courseId: string, contactId: string, certificateUrl: string): Promise<ActionResult> {
    const workspaceId = await getCurrentWorkspaceId();
    const supabase = await createServerClient();
    const { error } = await supabase
        .from('certificates')
        .insert({
            workspace_id: workspaceId,
            course_id: courseId,
            contact_id: contactId,
            certificate_url: certificateUrl
        });

    if (error) return { success: false, error: error.message };
    return { success: true };
}

// Forums
export async function createForumPost(forumId: string, title: string, content: string, parentId?: string): Promise<ActionResult> {
    const user = await requireAuth();
    const supabase = await createServerClient();
    const { error } = await supabase
        .from('forum_posts')
        .insert({
            forum_id: forumId,
            author_id: user.id,
            title,
            content,
            parent_id: parentId
        });

    if (error) return { success: false, error: error.message };
    revalidatePath(`/community/forums/${forumId}`);
    return { success: true };
}
