'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getCurrentWorkspaceId } from '@/lib/auth';

export async function getProjects() {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      contact:contacts(first_name, last_name, email),
      tasks:project_tasks(count)
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return data;
}

export async function getProjectTasks(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createProject(values: any) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) throw new Error('No workspace');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...values,
      workspace_id: workspaceId
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/projects');
  return data;
}

export async function updateProjectStatus(projectId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', projectId);

  if (error) throw error;
  revalidatePath('/projects');
}
