'use server';

import { createServerClient } from '@/lib/supabase/server';
import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * --- HELPER: STANDARD ACTION WRAPPER ---
 * Ensures consistent error handling and response format across all actions.
 */
async function executeAction<T>(action: (supabase: any, workspaceId: string) => Promise<T>) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: 'No active workspace' };
    
    const supabase = await createServerClient();
    const data = await action(supabase, workspaceId);
    return { success: true, data };
  } catch (err: any) {
    console.error('[CalendarAction Error]:', err.message);
    return { success: false, error: err.message || 'Operation failed' };
  }
}

/**
 * --- CALENDAR MANAGEMENT ---
 */

export async function createCalendar(payload: {
  name: string;
  slug: string;
  description?: string;
  timezone?: string;
  slotDuration?: number;
  bufferTime?: number;
}) {
  const user = await requireAuth(); // Calendar creation requires auth
  return executeAction(async (supabase, workspaceId) => {
    const { data, error } = await supabase
      .from('booking_calendars')
      .insert({
        workspace_id: workspaceId,
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        timezone: payload.timezone || 'UTC',
        slot_duration: payload.slotDuration || 30,
        buffer_time: payload.bufferTime || 0
      })
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/calendar');
    return data;
  });
}

/**
 * --- BOOKING & APPOINTMENTS ---
 */

export async function createBooking(payload: {
  calendarId: string;
  contactId: string;
  title: string;
  startTime: string;
  endTime: string;
  outcomeId?: string;
}) {
  return executeAction(async (supabase, workspaceId) => {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        workspace_id: workspaceId,
        calendar_id: payload.calendarId,
        contact_id: payload.contactId,
        title: payload.title,
        start_time: payload.startTime,
        end_time: payload.endTime,
        outcome_id: payload.outcomeId,
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger Async Goal Check
    import('@/lib/automation/executor').then(({ checkActiveWorkflowGoals }) => {
      checkActiveWorkflowGoals(workspaceId, payload.contactId, 'appointment_booked');
    }).catch(err => console.error("[calendar-action] Goal check failure:", err));

    return data;
  });
}

export async function updateAppointmentStatus(id: string, status: string) {
  return executeAction(async (supabase, workspaceId) => {
    const { data: apt, error: fetchErr } = await supabase
      .from('appointments')
      .select('*, contact:contacts(full_name, email), calendar:booking_calendars(name)')
      .eq('id', id)
      .single();

    if (fetchErr) throw fetchErr;

    const { error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('workspace_id', workspaceId);

    if (error) throw error;

    // 1. Log CRM Activity
    await supabase.from('activities').insert({
       workspace_id: workspaceId,
       contact_id: apt.contact_id,
       type: status === 'no_show' ? 'booking_noshow' : 'meeting',
       subject: `Appointment Status: ${status}`,
       description: `Meeting '${apt.title}' marked as ${status}.`
    });

    // 2. Fire Automation Trigger
    if (status === 'showed_up') {
       await supabase.rpc('fn_trigger_automation', { 
          p_event: 'post_meeting_workflow', 
          p_contact_id: apt.contact_id,
          p_data: { appointment_id: id, calendar_name: apt.calendar.name }
       });
    }

    revalidatePath('/calendar');
    return true;
  });
}

/**
 * --- INTELLIGENT ROUTING (OUTCOMES) ---
 */

export async function createOutcome(payload: {
  calendarId: string;
  label: string;
  description?: string;
  durationMinutes?: number;
  assignedUserIds?: string[];
  pipelineStageId?: string;
  postMeetingWorkflowId?: string;
}) {
  return executeAction(async (supabase, workspaceId) => {
    const { data, error } = await supabase
      .from('booking_outcomes')
      .insert({
        workspace_id: workspaceId,
        calendar_id: payload.calendarId,
        label: payload.label,
        description: payload.description,
        duration_minutes: payload.durationMinutes || 30,
        assigned_user_ids: payload.assignedUserIds || [],
        pipeline_stage_id: payload.pipelineStageId,
        post_meeting_workflow_id: payload.postMeetingWorkflowId
      })
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/calendar');
    return data;
  });
}

export async function getCalendarOutcomes(calendarId: string) {
  return executeAction(async (supabase) => {
    const { data, error } = await supabase
      .from('booking_outcomes')
      .select('*')
      .eq('calendar_id', calendarId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data;
  });
}

// --- INTAKE FORMS ---

export async function saveIntakeForm(calendarId: string, fields: any[]) {
  return executeAction(async (supabase, workspaceId) => {
    const { data, error } = await supabase
      .from('booking_intake_forms')
      .upsert({
        workspace_id: workspaceId,
        calendar_id: calendarId,
        fields,
        updated_at: new Date().toISOString()
      }, { onConflict: 'calendar_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function getIntakeForm(calendarId: string) {
  return executeAction(async (supabase) => {
    const { data, error } = await supabase
      .from('booking_intake_forms')
      .select('*')
      .eq('calendar_id', calendarId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore not found
    return data;
  });
}

export async function submitIntakeResponse(appointmentId: string, responses: any) {
  return executeAction(async (supabase, workspaceId) => {
    // Get contact_id from appointment first
    const { data: apt } = await supabase.from('appointments').select('contact_id').eq('id', appointmentId).single();
    if (!apt) throw new Error('Appointment not found');

    const { data, error } = await supabase
      .from('booking_intake_responses')
      .insert({
        workspace_id: workspaceId,
        appointment_id: appointmentId,
        contact_id: apt.contact_id,
        responses,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function getComprehensiveCalendarAnalytics() {
  return executeAction(async (supabase, workspaceId) => {
    // 1. Fetch Month/Total Stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [allApts, monthApts, slotAnalytics, teamStats, revenueStats] = await Promise.all([
      supabase.from('appointments').select('*').eq('workspace_id', workspaceId),
      supabase.from('appointments').select('*').eq('workspace_id', workspaceId).gte('start_time', startOfMonth.toISOString()),
      supabase.from('booking_slot_analytics').select('*').eq('workspace_id', workspaceId),
      supabase.from('appointments').select('created_by, id, status, start_time').eq('workspace_id', workspaceId),
      supabase.from('credit_ledger').select('amount, action').eq('workspace_id', workspaceId)
    ]);

    // Process Day of Week Distribution
    const dowDist = [0, 0, 0, 0, 0, 0, 0];
    allApts.data?.forEach((a: any) => {
       const d = new Date(a.start_time).getUTCDay();
       dowDist[d]++;
    });

    // Process Hour Distribution
    const hourDist = Array(24).fill(0);
    allApts.data?.forEach((a: any) => {
       const h = new Date(a.start_time).getUTCHours();
       hourDist[h]++;
    });

    // Analyze Revenue
    let packageRevenue = 0;
    let sessionRevenue = 0; // Single session payments
    revenueStats.data?.forEach((r: any) => {
       if (r.action === 'purchase') packageRevenue += 100; // Mocking price for now
       if (r.action === 'usage' && r.amount < 0) sessionRevenue += 20; // Mocking single rate
    });

    return {
      totalBookings: allApts.data?.length || 0,
      monthBookings: monthApts.data?.length || 0,
      showUpRate: allApts.data?.length ? (allApts.data.filter((a: any) => a.status === 'showed_up').length / allApts.data.length) * 100 : 0,
      dowDistribution: dowDist,
      hourDistribution: hourDist,
      slotAnalytics: slotAnalytics.data || [],
      revenueComparison: {
         package: packageRevenue,
         session: sessionRevenue
      },
      teamPerformance: []
    };
  });
}

/**
 * --- PUBLIC PERSONALIZATION (SSR) ---
 */

export async function getPersonalizedBookingData(calendarSlug: string, contactId?: string) {
  return executeAction(async (supabase, workspaceId) => {
    // 1. Fetch Core Calendar
    const { data: calendar, error: calErr } = await supabase
      .from('booking_calendars')
      .select('*')
      .eq('slug', calendarSlug)
      .single();

    if (calErr || !calendar) throw new Error('Calendar not found');

    const [contactRes, outcomesRes, popularRes] = await Promise.all([
      // Contact & History
      contactId ? supabase.from('contacts').select('*').eq('id', contactId).single() : Promise.resolve({ data: null }),
      // Outcomes
      supabase.from('booking_outcomes').select('*').eq('calendar_id', calendar.id).order('position', { ascending: true }),
      // Intelligence Slot Patterns
      supabase.from('booking_slot_analytics').select('slot_day_of_week, slot_hour').eq('workspace_id', calendar.workspace_id).order('conversion_rate', { ascending: false }).limit(3)
    ]);

    // Fetch Last Appointment if contact exists
    let lastAppointment = null;
    let preferredSlots = [];
    if (contactRes.data) {
      const { data: lastApt } = await supabase
        .from('appointments')
        .select('*')
        .eq('contact_id', contactId)
        .order('start_time', { ascending: false })
        .limit(1)
        .single();
      
      lastAppointment = lastApt;

      const { data: history } = await supabase.from('appointments').select('start_time').eq('contact_id', contactId).limit(5);
      preferredSlots = history?.map((h: any) => ({ day: new Date(h.start_time).getUTCDay(), hour: new Date(h.start_time).getUTCHours() })) || [];
    }

    return {
      calendar,
      contact: contactRes.data,
      lastAppointment,
      preferredSlots,
      outcomes: outcomesRes.data || [],
      popularSlots: popularRes.data || []
    };
  });
}

/**
 * --- ANALYTICS ---
 */

export async function getBookingAnalytics(workspaceId: string) {
  return executeAction(async (supabase) => {
    const { data, error } = await supabase
      .from('booking_slot_analytics')
      .select('*')
      .eq('workspace_id', workspaceId);

    if (error) throw error;
    return data;
  });
}

// --- SESSION PACKAGES & CREDITS ---

export async function createPackage(payload: {
  name: string;
  description?: string;
  totalCredits: number;
  price: number;
}) {
  return executeAction(async (supabase, workspaceId) => {
    const { data, error } = await supabase
      .from('booking_packages')
      .insert({
        workspace_id: workspaceId,
        name: payload.name,
        description: payload.description,
        total_credits: payload.totalCredits,
        price: payload.price
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  });
}

export async function buyPackage(contactId: string, packageId: string) {
  return executeAction(async (supabase, workspaceId) => {
    // 1. Get package details
    const { data: pkg } = await supabase.from('booking_packages').select('*').eq('id', packageId).single();
    if (!pkg) throw new Error('Package not found');

    // 2. Add credits (Upsert)
    const { data: balance, error: creditErr } = await supabase
      .from('contact_credits')
      .upsert({
        workspace_id: workspaceId,
        contact_id: contactId,
        remaining_credits: pkg.total_credits, // In a real system, we'd add to existing
        last_updated: new Date().toISOString()
      }, { onConflict: 'contact_id,workspace_id,calendar_id' })
      .select()
      .single();

    if (creditErr) throw creditErr;

    // 3. Log to Ledger
    await supabase.from('credit_ledger').insert({
      workspace_id: workspaceId,
      contact_id: contactId,
      amount: pkg.total_credits,
      action: 'purchase',
      reference_id: packageId
    });

    return balance;
  });
}

export async function getContactCredits(contactId: string) {
  return executeAction(async (supabase) => {
    const { data, error } = await supabase
      .from('contact_credits')
      .select('*')
      .eq('contact_id', contactId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  });
}
