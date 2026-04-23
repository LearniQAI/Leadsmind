"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { renderCraftToHtml } from '@/lib/builder/renderer';
import { getCurrentWorkspaceId } from '@/lib/auth';
import { getTemplateById } from '@/lib/builder/templates';

const BLANK_PAGE = '{"ROOT":{"type":{"resolvedName":"Container"},"isCanvas":true,"props":{"className":"min-h-screen bg-white"},"nodes":[]}}';

export async function createWebsite(name: string, subdomain: string, templateId?: string) {
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId();

  try {
    const { data: website, error } = await supabase
      .from('websites')
      .insert({
        workspace_id: workspaceId,
        name,
        subdomain,
        is_published: false
      })
      .select()
      .single();

    if (error) throw error;

    // Create a default home page
    const { data: page } = await supabase
      .from('website_pages')
      .insert({
        website_id: website.id,
        name: 'Home',
        path_name: '/',
      })
      .select()
      .single();

    // Initialize content
    let initialContent = BLANK_PAGE;
    if (templateId) {
        const hardcoded = getTemplateById(templateId);
        if (hardcoded) {
            initialContent = hardcoded.content;
        } else {
            const { data: dbTpl } = await supabase
                .from('templates')
                .select('content')
                .eq('id', templateId)
                .single();
            if (dbTpl) initialContent = typeof dbTpl.content === 'string' ? dbTpl.content : JSON.stringify(dbTpl.content);
        }
    }

    const { data: newPage } = await supabase.from('pages').insert({
        workspace_id: workspaceId,
        website_page_id: page.id,
        name: 'Home Page',
        is_published: !!templateId,
        is_draft: !templateId,
        content: initialContent || BLANK_PAGE
    }).select().single();

    revalidatePath('/websites');
    return { success: true, websiteId: website.id, pageId: newPage.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createFunnel(name: string, templateId?: string) {
    const supabase = await createClient();
    const workspaceId = await getCurrentWorkspaceId();
  
    try {
      const { data: funnel, error } = await supabase
        .from('funnels')
        .insert({
          workspace_id: workspaceId,
          name,
          is_published: false
        })
        .select()
        .single();
  
      if (error) throw error;
  
      // Create first step
      const { data: step } = await supabase
        .from('funnel_steps')
        .insert({
          funnel_id: funnel.id,
          name: 'Opt-in Page',
          path_name: '/optin',
          order: 1
        })
        .select()
        .single();
  
      // Initialize content
      let initialContent = BLANK_PAGE;
      if (templateId) {
          const hardcoded = getTemplateById(templateId);
          if (hardcoded) {
              initialContent = hardcoded.content;
          } else {
              const { data: dbTpl } = await supabase
                  .from('templates')
                  .select('content')
                  .eq('id', templateId)
                  .single();
              if (dbTpl) initialContent = typeof dbTpl.content === 'string' ? dbTpl.content : JSON.stringify(dbTpl.content);
          }
      }

      const { data: newPage } = await supabase.from('pages').insert({
          workspace_id: workspaceId,
          funnel_step_id: step.id,
          name: 'Opt-in',
          is_published: !!templateId,
          is_draft: !templateId,
          content: initialContent || BLANK_PAGE
      }).select().single();

  
      revalidatePath('/funnels');
      return { success: true, funnelId: funnel.id, pageId: newPage.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
}

export async function updatePageContent(pageId: string, content: any) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('pages')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', pageId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Update error:', error);
    return { success: false, error: error.message };
  }
}

export async function publishPage(pageId: string, content?: any) {
  const supabase = await createClient();

  try {
    // 1. If content is provided, save it first
    if (content) {
        console.log('DEBUG: Publishing with content length:', content.length);
        await supabase
            .from('pages')
            .update({ content })
            .eq('id', pageId);
    }

    // 2. Get the current page content
    const { data: page, error: fetchError } = await supabase
      .from('pages')
      .select('*, workspace:workspaces(slug)')
      .eq('id', pageId)
      .single();

    if (fetchError || !page) throw new Error("Page not found");

    // 3. Render to static HTML
    console.log('DEBUG: Rendering node ROOT...');
    const renderedHtml = renderCraftToHtml(page.content, page.id, page.workspace_id);
    console.log('DEBUG: Rendered HTML Length:', renderedHtml.length);
    console.log('DEBUG: Rendered HTML Snippet:', renderedHtml.substring(0, 500));

    // 3. Update the page record
    const { error: updateError } = await supabase
      .from('pages')
      .update({
        rendered_html: renderedHtml,
        is_published: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', pageId);

    if (updateError) throw updateError;

    revalidatePath(`/websites`);
    revalidatePath(`/funnels`);
    
    return { success: true };
  } catch (error: any) {
    console.error('Publish error:', error);
    return { success: false, error: error.message };
  }
}

export async function handlePageFormSubmission(formData: any, pageId: string, workspaceId: string) {
  const supabase = await createClient();

  const email = formData.email?.toLowerCase().trim();
  if (!email) {
    throw new Error("Email is required for submission");
  }

  try {
    // 1. Find or Create Contact
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('email', email)
      .maybeSingle();

    let contactId = existingContact?.id;

    if (!contactId) {
      const { data: newContact, error: createError } = await supabase
        .from('contacts')
        .insert({
          workspace_id: workspaceId,
          email,
          first_name: formData.name || formData.first_name || 'Web',
          last_name: formData.last_name || 'Lead',
          phone: formData.phone || formData.tel || null,
          source: 'Website Form',
        })
        .select('id')
        .single();

      if (createError) throw createError;
      contactId = newContact.id;
    }

    // 2. Log Page Submission
    const { error: submissionError } = await supabase
      .from('page_submissions')
      .insert({
        workspace_id: workspaceId,
        page_id: pageId,
        contact_id: contactId,
        form_data: formData,
        metadata: {
            // Future: capture IP/UserAgent if needed
        }
      });

    if (submissionError) throw submissionError;

    // 3. Log Activity for Contact
    await supabase.from('contact_activities').insert({
        workspace_id: workspaceId,
        contact_id: contactId,
        type: 'system',
        description: `Submitted form on page: ${pageId}`,
    });

    // 4. Trigger Workflows
    try {
        const { triggerWorkflows } = await import('@/lib/automation/executor');
        // Trigger both 'contact_created' and a custom 'form_submitted' if it exists
        await triggerWorkflows(workspaceId, 'contact_created', contactId);
        await triggerWorkflows(workspaceId, 'form_submitted', contactId);
    } catch (err) {
        console.error('Automation trigger failed:', err);
    }

    return { success: true, contactId };
  } catch (error: any) {
    console.error('Submission error:', error);
    return { success: false, error: error.message };
  }
}

export async function cloneTemplate(templateId: string, workspaceId: string, targetType: 'website' | 'funnel', parentId: string) {
  const supabase = await createClient();

  try {
    // 1. Get the template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) throw new Error("Template not found");

    // 2. Create the new page record
    const { data: newPage, error: createError } = await supabase
      .from('pages')
      .insert({
        workspace_id: workspaceId,
        name: `${template.name} (Clone)`,
        content: template.content,
        type: 'standard',
        website_page_id: targetType === 'website' ? parentId : null,
        funnel_step_id: targetType === 'funnel' ? parentId : null,
        is_draft: true,
        is_published: false
      })
      .select()
      .single();

    if (createError) throw createError;

    return { success: true, pageId: newPage.id };
  } catch (error: any) {
    console.error('Clone error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateWebsiteSettings(websiteId: string, updates: { name?: string, subdomain?: string, favicon_url?: string, config?: any }) {
    const supabase = await createClient();
    
    const { error } = await supabase
        .from('websites')
        .update(updates)
        .eq('id', websiteId);

    if (error) throw new Error(error.message);

    revalidatePath('/builder');
    revalidatePath(`/websites`);
    
    return { success: true };
}

export async function updateFunnelSettings(funnelId: string, updates: { name?: string, config?: any }) {
    const supabase = await createClient();
    
    const { error } = await supabase
        .from('funnels')
        .update(updates)
        .eq('id', funnelId);

    if (error) throw new Error(error.message);

    revalidatePath('/builder');
    revalidatePath(`/funnels`);
    
    return { success: true };
}

export async function createPage(name: string, websiteId?: string, funnelId?: string) {
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId();

  // Generate slug from name
  const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  const path_name = `/${slug}`;

  try {
    let parentPageId;
    
    if (websiteId) {
        const { data: websitePage, error } = await supabase
            .from('website_pages')
            .insert({
                website_id: websiteId,
                name,
                path_name,
            })
            .select()
            .single();
        if (error) throw error;
        parentPageId = websitePage.id;
    } else if (funnelId) {
        const { data: step, error } = await supabase
            .from('funnel_steps')
            .insert({
                funnel_id: funnelId,
                name,
                path_name,
                order: 10 // Temporary order
            })
            .select()
            .single();
        if (error) throw error;
        parentPageId = step.id;
    }

    const { data: page, error: pageError } = await supabase
      .from('pages')
      .insert({
          workspace_id: workspaceId,
          website_page_id: websiteId ? parentPageId : null,
          funnel_step_id: funnelId ? parentPageId : null,
          name,
          is_published: false,
          is_draft: true,
          content: { ROOT: { type: { resolvedName: 'Container' }, props: { className: 'p-8 flex flex-col gap-4 min-h-screen' }, nodes: [] } }
      })
      .select()
      .single();

    if (pageError) throw pageError;

    revalidatePath('/builder');
    return { success: true, pageId: page.id };
  } catch (error: any) {
    console.error('Create page error:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePageSettings(pageId: string, settings: { 
    name?: string, 
    seo_title?: string, 
    seo_description?: string, 
    og_image_url?: string,
    type?: string,
    author?: string,
    category?: string,
    tags?: string[],
    excerpt?: string
}) {
    const supabase = await createClient();
    
    const { error } = await supabase
        .from('pages')
        .update(settings)
        .eq('id', pageId);

    if (error) throw new Error(error.message);
    
    revalidatePath('/builder');
    return { success: true };
}

export async function deleteWebsite(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('websites').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/websites');
    return { success: true };
}

export async function deleteFunnel(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('funnels').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/funnels');
    return { success: true };
}

export async function duplicateWebsite(id: string) {
    const supabase = await createClient();
    const workspaceId = await getCurrentWorkspaceId();

    try {
        // 1. Get original website
        const { data: original, error: fetchError } = await supabase
            .from('websites')
            .select('*, website_pages(*, pages(*))')
            .eq('id', id)
            .single();

        if (fetchError || !original) throw new Error("Website not found");

        // 2. Create new website
        const { data: newWs, error: wsError } = await supabase
            .from('websites')
            .insert({
                workspace_id: workspaceId,
                name: `${original.name} (Copy)`,
                subdomain: `${original.subdomain}-copy-${Math.random().toString(36).substr(2, 4)}`,
                config: original.config,
                favicon_url: original.favicon_url,
                is_published: false
            })
            .select()
            .single();

        if (wsError) throw wsError;

        // 3. Clone pages
        if (original.website_pages) {
            for (const wp of original.website_pages) {
                const { data: newWp } = await supabase
                    .from('website_pages')
                    .insert({
                        website_id: newWs.id,
                        name: wp.name,
                        path_name: wp.path_name,
                    })
                    .select()
                    .single();

                if (newWp && wp.pages) {
                    for (const page of wp.pages) {
                        await supabase.from('pages').insert({
                            workspace_id: workspaceId,
                            website_page_id: newWp.id,
                            name: page.name,
                            content: page.content,
                            is_published: false,
                            is_draft: true
                        });
                    }
                }
            }
        }

        revalidatePath('/websites');
        return { success: true, websiteId: newWs.id };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function duplicateFunnel(id: string) {
    const supabase = await createClient();
    const workspaceId = await getCurrentWorkspaceId();

    try {
        // 1. Get original funnel
        const { data: original, error: fetchError } = await supabase
            .from('funnels')
            .select('*, funnel_steps(*, pages(*))')
            .eq('id', id)
            .single();

        if (fetchError || !original) throw new Error("Funnel not found");

        // 2. Create new funnel
        const { data: newFn, error: fnError } = await supabase
            .from('funnels')
            .insert({
                workspace_id: workspaceId,
                name: `${original.name} (Copy)`,
                is_published: false
            })
            .select()
            .single();

        if (fnError) throw fnError;

        // 3. Clone steps
        if (original.funnel_steps) {
            for (const step of original.funnel_steps) {
                const { data: newStep } = await supabase
                    .from('funnel_steps')
                    .insert({
                        funnel_id: newFn.id,
                        name: step.name,
                        path_name: step.path_name,
                        order: step.order
                    })
                    .select()
                    .single();

                if (newStep && step.pages) {
                    for (const page of step.pages) {
                        await supabase.from('pages').insert({
                            workspace_id: workspaceId,
                            funnel_step_id: newStep.id,
                            name: page.name,
                            content: page.content,
                            is_published: false,
                            is_draft: true
                        });
                    }
                }
            }
        }

        revalidatePath('/funnels');
        return { success: true, funnelId: newFn.id };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getTemplates(category?: 'website' | 'funnel' | 'both') {
    const supabase = await createClient();
    
    let query = supabase.from('templates').select('*');
    
    if (category && category !== 'both') {
        query = query.or(`category.eq.${category},category.eq.both`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
}
