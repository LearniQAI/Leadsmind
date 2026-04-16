import { createServerClient } from "@/lib/supabase/server";
import { AutomationActions } from "./actions_registry";

export async function triggerWorkflows(workspaceId: string, triggerType: string, contactId: string) {
  const supabase = await createServerClient();
  
  const { data: workflows } = await supabase
    .from("automation_workflows")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("trigger_type", triggerType)
    .eq("status", "active");

  if (!workflows || workflows.length === 0) return;

  for (const workflow of workflows) {
    await executeWorkflow(workflow, contactId);
  }
}

async function executeWorkflow(workflow: any, contactId: string) {
  const { nodes, edges, workspace_id, id: workflowId } = workflow;
  const supabase = await createServerClient();

  // 1. Find the trigger node
  const triggerNode = nodes.find((n: any) => n.type === 'trigger');
  if (!triggerNode) return;

  // 2. Start traversal from the trigger node's outputs
  const startEdges = edges.filter((e: any) => e.source === triggerNode.id);
  
  for (const edge of startEdges) {
    await processNode(edge.target, nodes, edges, workspace_id, workflowId, contactId, supabase);
  }
}

async function processNode(
  nodeId: string, 
  nodes: any[], 
  edges: any[], 
  workspaceId: string, 
  workflowId: string, 
  contactId: string, 
  supabase: any
) {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return;

  try {
    let nextNodeIds: string[] = [];

    // Log start
    await supabase.from("automation_logs").insert({
      workspace_id: workspaceId,
      workflow_id: workflowId,
      contact_id: contactId,
      node_id: nodeId,
      status: 'running'
    });

    if (node.type === 'action') {
      const actionType = node.data.actionType;
      const handler = (AutomationActions as any)[actionType];
      if (handler) {
        await handler(workspaceId, contactId, node.data);
      }
      nextNodeIds = edges.filter(e => e.source === nodeId).map(e => e.target);

    } else if (node.type === 'condition') {
      const { data: contact } = await supabase.from("contacts").select("*").eq("id", contactId).single();
      
      const { field = 'email', operator = 'contains', value = '' } = node.data;
      let conditionMet = false;

      const fieldValue = contact[field];
      
      if (operator === 'exists') conditionMet = !!fieldValue;
      else if (operator === 'equals') conditionMet = String(fieldValue) === String(value);
      else if (operator === 'contains') conditionMet = String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
      else if (operator === 'greater_than') conditionMet = Number(fieldValue) > Number(value);
      
      const edgeId = conditionMet ? 'true' : 'false';
      nextNodeIds = edges.filter(e => e.source === nodeId && e.sourceHandle === edgeId).map(e => e.target);

    } else if (node.type === 'delay') {
      const { durationValue = 1, durationUnit = 'hours' } = node.data;
      
      const resumeAt = new Date();
      if (durationUnit === 'minutes') resumeAt.setMinutes(resumeAt.getMinutes() + Number(durationValue));
      else if (durationUnit === 'hours') resumeAt.setHours(resumeAt.getHours() + Number(durationValue));
      else if (durationUnit === 'days') resumeAt.setDate(resumeAt.getDate() + Number(durationValue));

      await supabase.from("automation_executions").insert({
        workspace_id: workspaceId,
        workflow_id: workflowId,
        contact_id: contactId,
        current_node_id: nodeId,
        status: 'paused',
        resume_at: resumeAt.toISOString(),
      });

      // Terminate this branch of execution
      return;
    }

    // Update log to success
    await supabase.from("automation_logs").update({ status: 'success' })
      .eq("workflow_id", workflowId)
      .eq("contact_id", contactId)
      .eq("node_id", nodeId);

    // Recursively process next nodes
    for (const nextId of nextNodeIds) {
      await processNode(nextId, nodes, edges, workspaceId, workflowId, contactId, supabase);
    }

  } catch (error: any) {
    console.error(`Error in automation node ${nodeId}:`, error);
    await supabase.from("automation_logs").update({ 
      status: 'error', 
      error_message: error.message 
    })
    .eq("workflow_id", workflowId)
    .eq("contact_id", contactId)
    .eq("node_id", nodeId);
  }
}

export async function resumeExecution(executionId: string) {
  const supabase = await createServerClient();

  const { data: execution, error: fetchError } = await supabase
    .from("automation_executions")
    .select("*, workflow:automation_workflows(*)")
    .eq("id", executionId)
    .single();

  if (fetchError || !execution) {
    console.error("Failed to fetch execution for resumption:", fetchError);
    return;
  }

  const { workflow, contact_id, current_node_id, workspace_id } = execution;
  const { nodes, edges } = workflow;

  // Mark running
  await supabase
    .from("automation_executions")
    .update({ status: 'running', updated_at: new Date().toISOString() })
    .eq("id", executionId);

  // Find next nodes after the delay
  const nextNodeIds = edges.filter((e: any) => e.source === current_node_id).map((e: any) => e.target);

  for (const nextId of nextNodeIds) {
    await processNode(nextId, nodes, edges, workspace_id, workflow.id, contact_id, supabase);
  }

  // Clear execution state once finished
  await supabase
    .from("automation_executions")
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq("id", executionId);
}
