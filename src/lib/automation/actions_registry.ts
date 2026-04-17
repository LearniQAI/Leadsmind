import { createServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import { calculateLeadScore } from "@/app/actions/automation";
import { publishSocialPost } from "@/app/actions/social";
import { enrollStudent, updateProgress } from "@/app/actions/lms";

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

  add_tag: async (workspaceId: string, contactId: string, config: any) => {
    return (AutomationActions as any).apply_tag(workspaceId, contactId, config);
  },

  lead_score: async (workspaceId: string, contactId: string) => {
    await calculateLeadScore(contactId);
  },

  social_post: async (workspaceId: string, contactId: string, config: any) => {
    const { content, platforms } = config;
    if (!content || !platforms) return;

    // Create and publish social post
    const result = await (await import("@/app/actions/social")).createSocialPost({
      content,
      platforms
    });

    if (result.success && result.id) {
      await (await import("@/app/actions/social")).publishSocialPost(result.id);
    }
  },

  lms_enroll: async (workspaceId: string, contactId: string, config: any) => {
    const { courseId } = config;
    if (!courseId) return;
    await enrollStudent(courseId, contactId);
  },

  lms_update_progress: async (workspaceId: string, contactId: string, config: any) => {
    const { lessonId, completed } = config;
    if (!lessonId) return;
    await updateProgress(contactId, lessonId, !!completed, 0);
  },

  update_field: async (workspaceId: string, contactId: string, config: any) => {
    const { field, value } = config;
    if (!field) return;

    const supabase = await createServerClient();
    const { error } = await supabase
      .from("contacts")
      .update({ [field]: value })
      .eq("id", contactId)
      .eq("workspace_id", workspaceId);

    if (error) throw error;
  },

  move_to_stage: async (workspaceId: string, contactId: string, config: any) => {
    const { stageId } = config;
    if (!stageId) return;

    const supabase = await createServerClient();
    
    // Find the latest opportunity for this contact
    const { data: opportunity } = await supabase
      .from("opportunities")
      .select("id")
      .eq("contact_id", contactId)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (opportunity) {
      await supabase
        .from("opportunities")
        .update({ stage_id: stageId })
        .eq("id", opportunity.id);
    }
  },

  notify_team: async (workspaceId: string, contactId: string, config: any) => {
    const { message, type = "info" } = config;
    const supabase = await createServerClient();

    // Fetch contact name for the notification
    const { data: contact } = await supabase
      .from("contacts")
      .select("first_name, last_name")
      .eq("id", contactId)
      .single();

    const contactName = contact ? `${contact.first_name} ${contact.last_name}` : "A contact";
    const finalMessage = message?.replace("{contact_name}", contactName) || `Automation alert for ${contactName}`;

    await supabase.from("notifications").insert({
      workspace_id: workspaceId,
      title: "Automation Triggered",
      message: finalMessage,
      type: type,
      link: `/contacts/${contactId}`
    });
  }
};
