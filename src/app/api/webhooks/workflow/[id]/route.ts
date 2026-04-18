import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { triggerWorkflows } from "@/lib/automation/executor";

// We use the service role key to manage contacts across workspaces safely via webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const signature = req.headers.get("x-webhook-signature");

    // 1. Fetch Workflow & Secret
    const { data: workflow, error: wfError } = await supabaseAdmin
      .from("workflows")
      .select("*")
      .eq("id", id)
      .single();

    if (wfError || !workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // 2. Fetch Trigger Step Config (for graph-based settings)
    const { data: triggerStep } = await supabaseAdmin
      .from("workflow_steps")
      .select("config")
      .eq("workflow_id", id)
      .eq("type", "trigger")
      .single();

    const config = triggerStep?.config || {};
    const secret = config.webhook_secret || workflow.webhook_secret;
    const mapping = config.webhook_mapping || workflow.webhook_mapping || {};

    // 3. Validate Signature if secret exists
    if (secret && signature) {
      const hmac = crypto.createHmac("sha256", secret);
      const digest = hmac.update(JSON.stringify(body)).digest("hex");
      if (signature !== digest) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    // 4. Map Fields to Contact
    const contactData: Record<string, any> = {
      workspace_id: workflow.workspace_id,
    };

    // Example mapping: { "user_email": "email", "full_name": "first_name" }
    for (const [jsonKey, contactField] of Object.entries(mapping)) {
      if (body[jsonKey]) {
        contactData[contactField as string] = body[jsonKey];
      }
    }

    // We must at least have an email or phone to identify/create a contact
    if (!contactData.email && !contactData.phone) {
       // Optional: Log error or just proceed if the trigger doesn't require contact creation
    }

    // 4. Upsert Contact
    let finalContactId = null;
    if (contactData.email) {
      const { data: contact, error: upsertError } = await supabaseAdmin
        .from("contacts")
        .upsert(contactData, { onConflict: "workspace_id,email" })
        .select("id")
        .single();
        
      if (upsertError) throw upsertError;
      finalContactId = contact.id;
    }

    // 5. Trigger Workflow
    if (finalContactId) {
       await triggerWorkflows(workflow.workspace_id, "webhook", finalContactId);
    }

    return NextResponse.json({ success: true, contact_id: finalContactId });
  } catch (err: any) {
    console.error("[webhook-api] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
