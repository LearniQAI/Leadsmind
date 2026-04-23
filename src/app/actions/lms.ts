'use server';

import { createServerClient } from '@/lib/supabase/server';
import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { ActionResult } from '@/types/crm.types';
import { revalidatePath } from 'next/cache';

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

// Certificates
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
