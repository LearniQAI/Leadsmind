'use server';

import { createServerClient } from '@/lib/supabase/server';
import { getCurrentWorkspaceId, requireAdmin } from '@/lib/auth';
import { Form, FormSubmission } from '@/types/forms.types';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email';

export async function fetchForms() {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return [];

  const supabase = await createServerClient();
  const { data } = await supabase
    .from('forms')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function fetchFormById(id: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}

export async function createForm(values: Partial<Form>) {
  await requireAdmin();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) throw new Error('No active workspace');

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('forms')
    .insert({
      ...values,
      workspace_id: workspaceId,
      status: 'draft',
      submission_count: 0
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/forms');
  return data;
}

export async function updateForm(id: string, updates: Partial<Form>) {
  await requireAdmin();
  const workspaceId = await getCurrentWorkspaceId();
  const supabase = await createServerClient();

  const { error } = await supabase
    .from('forms')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('workspace_id', workspaceId);

  if (error) throw error;
  revalidatePath('/forms');
  revalidatePath(`/forms/${id}`);
  return { success: true };
}

export async function deleteForm(id: string) {
  await requireAdmin();
  const workspaceId = await getCurrentWorkspaceId();
  const supabase = await createServerClient();

  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', id)
    .eq('workspace_id', workspaceId);

  if (error) throw error;
  revalidatePath('/forms');
  return { success: true };
}

export async function fetchSubmissions(formId: string) {
  const workspaceId = await getCurrentWorkspaceId();
  const supabase = await createServerClient();

  const { data } = await supabase
    .from('form_submissions')
    .select('*, contacts(first_name, last_name, email)')
    .eq('form_id', formId)
    .eq('workspace_id', workspaceId)
    .order('submitted_at', { ascending: false });

  return data || [];
}

// Public Form Submission Action
export async function submitForm(formId: string, data: Record<string, any>, meta: { sourceUrl?: string; ipAddress?: string }) {
  const supabase = await createServerClient();
  
  // 1. Fetch form settings
  const { data: form } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .single();

  if (!form || form.status !== 'published') {
    throw new Error('Form not found or not published');
  }

  const workspaceId = form.workspace_id;
  
  // 2. Handle contact creation/update
  let contactId = null;
  const emailField = form.fields.find((f: any) => f.type === 'email');
  const email = emailField ? data[emailField.id] : null;

  if (email && (form.settings.createContact || form.settings.updateContact)) {
    // Check for existing contact
    const { data: existing } = await supabase
      .from('contacts')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('email', email)
      .maybeSingle();

    if (existing && form.settings.updateContact) {
      contactId = existing.id;
      // Update contact with new data (mapping might be needed)
      // For now just logging the link
    } else if (!existing && form.settings.createContact) {
      const firstNameField = form.fields.find((f: any) => f.label.toLowerCase().includes('first name'));
      const lastNameField = form.fields.find((f: any) => f.label.toLowerCase().includes('last name'));
      
      const { data: newContact } = await supabase
        .from('contacts')
        .insert({
          workspace_id: workspaceId,
          email,
          first_name: firstNameField ? data[firstNameField.id] : '',
          last_name: lastNameField ? data[lastNameField.id] : '',
          source: `Form: ${form.name}`
        })
        .select('id')
        .single();
      
      if (newContact) contactId = newContact.id;
    }
  }

  // 3. Record submission
  const { error: submitErr } = await supabase
    .from('form_submissions')
    .insert({
      workspace_id: workspaceId,
      form_id: formId,
      contact_id: contactId,
      data,
      source_url: meta.sourceUrl,
      ip_address: meta.ipAddress
    });

  if (submitErr) throw submitErr;

  // 4. Handle Pipeline Action
  if (contactId && form.settings.pipelineAction) {
    const { pipelineId, stageId } = form.settings.pipelineAction;
    await supabase.from('opportunities').insert({
      workspace_id: workspaceId,
      contact_id: contactId,
      pipeline_id: pipelineId,
      stage_id: stageId,
      title: `Submission from ${form.name}`
    });
  }

  // 5. Handle Workflow Trigger
  if (contactId && form.settings.workflowTriggerId) {
    // Log automation enrollment (logic would be in automation engine)
    await supabase.from('workflow_enrollments').insert({
      workspace_id: workspaceId,
      workflow_id: form.settings.workflowTriggerId,
      contact_id: contactId,
      status: 'pending'
    });
  }

  // 6. Handle Auto-Responder
  if (email && form.settings.emailResponder?.enabled) {
    const { subject, body, bodyHtml } = form.settings.emailResponder;
    const firstName = data[form.fields.find((f: any) => f.label.toLowerCase().includes('first name'))?.id || ''] || '';
    
    // Simple variable replacement
    const personalizedBody = body.replace(/{first_name}/g, firstName);
    const personalizedHtml = bodyHtml?.replace(/{first_name}/g, firstName);

    try {
      await sendEmail({
        to: email,
        subject: subject || `Thank you for contacting ${form.name}`,
        text: personalizedBody,
        html: personalizedHtml || undefined
      });
    } catch (err) {
      console.error('Failed to send auto-responder email:', err);
    }
  }

  return { success: true, settings: form.settings };
}
