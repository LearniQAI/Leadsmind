import { createServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import { calculateLeadScore } from "@/app/actions/automation";

export const AutomationActions = {
  send_email: async (workspaceId: string, contactId: string, config: any) => {
    const supabase = await createServerClient();
    
    // Fetch contact
    const { data: contact } = await supabase
      .from("contacts")
      .select("email, first_name")
      .eq("id", contactId)
      .single();

    if (!contact?.email) throw new Error("Contact has no email address");

    // Fetch workspace settings
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("resend_api_key, email_from_name, email_from_address")
      .eq("id", workspaceId)
      .single();

    await sendEmail({
      to: contact.email,
      subject: config.subject || "Important Update",
      react: config.body || `Hello ${contact.first_name}, this is an automated message.`,
      config: {
        apiKey: workspace?.resend_api_key,
        fromEmail: workspace?.email_from_address,
        fromName: workspace?.email_from_name,
      }
    } as any);
  },

  send_sms: async (workspaceId: string, contactId: string, config: any) => {
    const supabase = await createServerClient();
    
    // Fetch contact
    const { data: contact } = await supabase
      .from("contacts")
      .select("phone")
      .eq("id", contactId)
      .single();

    if (!contact?.phone) throw new Error("Contact has no phone number");

    // Fetch workspace settings
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("twilio_sid, twilio_token, twilio_number")
      .eq("id", workspaceId)
      .single();

    await sendSMS({
      to: contact.phone,
      message: config.message || "Hi, this is an automated message.",
      config: {
        accountSid: workspace?.twilio_sid,
        authToken: workspace?.twilio_token,
        fromNumber: workspace?.twilio_number,
      }
    });
  },

  apply_tag: async (workspaceId: string, contactId: string, config: any) => {
    if (!config?.tag || typeof config.tag !== 'string') {
      console.warn("Automation: apply_tag called without a valid tag string");
      return;
    }

    const supabase = await createServerClient();
    
    // Fetch contact with workspace security check
    const { data: contact } = await supabase
      .from("contacts")
      .select("tags")
      .eq("id", contactId)
      .eq("workspace_id", workspaceId)
      .single();

    if (!contact) {
      console.warn(`Automation: contact ${contactId} not found in workspace ${workspaceId}`);
      return;
    }

    const currentTags = contact.tags || [];
    const tagName = config.tag.trim();
    
    if (currentTags.includes(tagName)) return; // Tag already exists

    const newTags = [...currentTags, tagName];

    const { error } = await supabase
      .from("contacts")
      .update({ tags: newTags })
      .eq("id", contactId)
      .eq("workspace_id", workspaceId);

    if (error) throw error;
  },

  lead_score: async (workspaceId: string, contactId: string) => {
    await calculateLeadScore(contactId);
  }
};
