import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { triggerWorkflows } from '@/lib/automation/executor';

// Note: Using service role key for lead ingestion as it's a public endpoint 
// that needs to bypass RLS to insert into a specific workspace's contacts.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workspaceId, formId, firstName, lastName, email, phone, ...metadata } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
    }

    if (!email && !phone) {
      return NextResponse.json({ error: 'Email or Phone is required' }, { status: 400 });
    }

    // 1. Create the contact
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('contacts')
      .upsert({
        workspace_id: workspaceId,
        first_name: firstName || 'Form',
        last_name: lastName || 'Lead',
        email,
        phone,
        source: `Form: ${formId || 'Default'}`,
        updated_at: new Date().toISOString()
      }, { onConflict: 'workspace_id, email' })
      .select()
      .single();

    if (contactError) {
      console.error('[leads-api] Error creating contact:', contactError);
      return NextResponse.json({ error: contactError.message }, { status: 500 });
    }

    // 2. Log the activity
    await supabaseAdmin.from('contact_activities').insert({
      workspace_id: workspaceId,
      contact_id: contact.id,
      type: 'system',
      description: `Lead captured via external form ${formId || ''}`,
      metadata: metadata
    });

    // 3. Trigger Automation Workflows
    await triggerWorkflows(workspaceId, 'contact_created', contact.id);
    await triggerWorkflows(workspaceId, 'form_submitted', contact.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Lead captured successfully',
      contactId: contact.id 
    });

  } catch (error: any) {
    console.error('[leads-api] Fatal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Support pre-flight OPTIONS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
