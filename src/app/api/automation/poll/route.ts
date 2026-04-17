import { createServerClient } from '@/lib/supabase/server';
import { processNextStep } from '@/lib/automation/executor';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createServerClient();
  
  try {
    // 1. Find all running executions that have a resume_at timestamp in the past
    // Note: We use a raw filter or check context->>resume_at
    const { data: pendingExecutions, error: fetchError } = await supabase
      .from("workflow_executions")
      .select("id")
      .eq("status", "running")
      .not("context->resume_at", "is", null)
      .lte("context->resume_at", new Date().toISOString());

    if (fetchError) {
      console.error("Error fetching pending executions:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!pendingExecutions || pendingExecutions.length === 0) {
      return NextResponse.json({ message: "No pending executions to process" });
    }

    console.log(`Processing ${pendingExecutions.length} pending automations...`);

    // 2. Resume each execution
    const results = await Promise.allSettled(
      pendingExecutions.map(exec => processNextStep(exec.id))
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      message: `Processed ${pendingExecutions.length} executions`,
      success: successCount,
      failed: failureCount
    });

  } catch (error: any) {
    console.error("Fatal error in automation poll route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
