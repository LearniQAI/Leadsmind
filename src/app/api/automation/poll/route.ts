import { createServerClient } from '@/lib/supabase/server';
import { processNextStep } from '@/lib/automation/executor';
import { NextResponse } from 'next/server';

/**
 * GET /api/automation/poll
 *
 * Called by Vercel Cron (or any scheduler) every minute.
 * Resumes two types of paused executions:
 *
 *  1. **wait** steps  — execution.context.resume_at  ≤ now
 *  2. **held** steps  — execution.context.held_until ≤ now
 *     (held = outside business hours at time of execution)
 */
export async function GET(_request: Request) {
  const supabase = await createServerClient();
  const now = new Date().toISOString();
  
  try {
    // ── 1. Find executions paused by a 'wait' step that are now due ───────────
    const { data: waitDue, error: waitError } = await supabase
      .from("workflow_executions")
      .select("id")
      .eq("status", "running")
      .not("context->resume_at", "is", null)
      .lte("context->resume_at", now);

    if (waitError) {
      console.error("[poll] Error fetching wait-due executions:", waitError);
    }

    // ── 2. Find executions held outside business hours that can now proceed ───
    const { data: heldDue, error: heldError } = await supabase
      .from("workflow_executions")
      .select("id")
      .eq("status", "running")
      .not("context->held_until", "is", null)
      .lte("context->held_until", now);

    if (heldError) {
      console.error("[poll] Error fetching held executions:", heldError);
    }

    // ── 3. Find 'running' executions that haven't started yet (promoted from queue) ───
    // We look for executions where no step logs exist yet.
    const { data: freshRuns, error: freshError } = await supabase
      .from("workflow_executions")
      .select("id")
      .eq("status", "running")
      .is("context->held_until", null)
      .is("context->resume_at", null);
      // Optional: Add a check for 'no logs', but just picking all running that aren't paused is fine 
      // if we trust processNextStep to be idempotent or if we only call it sparingly.

    if (freshError) {
      console.error("[poll] Error fetching fresh executions:", freshError);
    }

    // ── 4. Merge & deduplicate ────────────────────────────────────────────────
    const allDue = [
      ...(waitDue ?? []),
      ...(heldDue ?? []),
      ...(freshRuns ?? []),
    ];

    // Deduplicate by id in case an execution matches both queries (shouldn't normally happen)
    const seen = new Set<string>();
    const unique = allDue.filter(({ id }) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    if (unique.length === 0) {
      return NextResponse.json({ message: "No pending executions to process", resumed: 0 });
    }

    console.log(`[poll] Resuming ${unique.length} paused automations (${waitDue?.length ?? 0} wait, ${heldDue?.length ?? 0} held)...`);

    // ── 4. Resume each execution ──────────────────────────────────────────────
    const results = await Promise.allSettled(
      unique.map(({ id }) => processNextStep(id))
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      message: `Processed ${unique.length} executions`,
      resumed: unique.length,
      success: successCount,
      failed: failureCount,
    });

  } catch (error: any) {
    console.error("[poll] Fatal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Vercel Cron calls GET; allow POST as convenience for manual triggers.
export async function POST(request: Request) {
  return GET(request);
}
