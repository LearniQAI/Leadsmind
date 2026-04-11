'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// --- Courses ---
export async function getCourses(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createCourse(workspaceId: string, title: string) {
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('modules')
    .select(`
      *,
      lessons(*)
    `)
    .eq('course_id', courseId)
    .order('order_index');

  if (error) throw error;
  return data;
}

export async function createModule(courseId: string, title: string, orderIndex: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('modules')
    .insert({ course_id: courseId, title, order_index: orderIndex })
    .select()
    .single();

  if (error) throw error;
  revalidatePath(`/courses/${courseId}/edit`);
  return data;
}

// --- Lessons ---
export async function createLesson(moduleId: string, title: string, orderIndex: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('lessons')
    .insert({ module_id: moduleId, title, order_index: orderIndex })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateLesson(lessonId: string, updates: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('lessons')
    .update(updates)
    .eq('id', lessonId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- Enrollment & Progress ---
export async function enrollStudent(courseId: string, contactId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('enrollments')
    .insert({ course_id: courseId, contact_id: contactId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProgress(contactId: string, lessonId: string, completed: boolean, timeSpent: number) {
  const supabase = await createClient();
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

// --- Quizzes ---
export async function getLessonQuiz(lessonId: string) {
  const supabase = await createClient();
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('lesson_id', lessonId)
    .single();

  if (quizError && quizError.code !== 'PGRST116') throw quizError;
  if (!quiz) return null;

  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quiz.id)
    .order('order_index');

  if (questionsError) throw questionsError;
  return { ...quiz, questions };
}

export async function submitQuizAttempt(quizId: string, contactId: string, score: number, passed: boolean) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({ quiz_id: quizId, contact_id: contactId, score, passed })
    .select()
    .single();

  if (error) throw error;
  return data;
}
