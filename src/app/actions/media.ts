'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getMediaFiles(workspaceId: string, parentId: string | null = null) {
  const supabase = await createClient();
  
  let query = supabase
    .from('media_files')
    .select('*')
    .eq('workspace_id', workspaceId);
  
  if (parentId) {
    query = query.eq('parent_id', parentId);
  } else {
    query = query.is('parent_id', null);
  }

  const { data, error } = await query.order('type', { ascending: false }).order('name');
  
  if (error) throw error;
  return data;
}

export async function createFolder(workspaceId: string, name: string, parentId: string | null = null) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('media_files')
    .insert({
      workspace_id: workspaceId,
      name,
      type: 'folder',
      parent_id: parentId,
      path: parentId ? `${parentId}/${name}` : name,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/media');
  return data;
}

export async function uploadFile(formData: FormData) {
  const supabase = await createClient();
  
  const workspaceId = formData.get('workspaceId') as string;
  const parentId = formData.get('parentId') as string | null;
  const file = formData.get('file') as File;

  if (!file || !workspaceId) throw new Error('Missing file or workspace ID');
  
  const fileExt = file.name.split('.').pop();
  const filePath = `${workspaceId}/${Date.now()}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('media_files')
    .insert({
      workspace_id: workspaceId,
      name: file.name,
      type: 'file',
      mime_type: file.type,
      size: file.size,
      path: filePath,
      parent_id: parentId || null,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/media');
  return data;
}

export async function deleteMediaFile(id: string, path: string, type: 'file' | 'folder') {
  const supabase = await createClient();

  if (type === 'file') {
    const { error: storageError } = await supabase.storage
      .from('media')
      .remove([path]);
    
    if (storageError) console.error('Storage delete error:', storageError);
  }

  const { error } = await supabase
    .from('media_files')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/media');
}

export async function getSignedUrl(path: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from('media')
    .createSignedUrl(path, 3600); // 1 hour

  if (error) throw error;
  return data.signedUrl;
}

export async function searchMediaFiles(workspaceId: string, query: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('media_files')
    .select('*')
    .eq('workspace_id', workspaceId)
    .ilike('name', `%${query}%`)
    .limit(20);

  if (error) throw error;
  return data;
}

export async function linkFileToContact(contactId: string, fileId: string, type: string = 'document') {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('contact_documents')
    .insert({
      contact_id: contactId,
      file_id: fileId,
      type
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath(`/contacts/${contactId}`);
  return data;
}

export async function getContactDocuments(contactId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('contact_documents')
    .select(`
      *,
      file:media_files(*)
    `)
    .eq('contact_id', contactId);

  if (error) throw error;
  return data;
}
