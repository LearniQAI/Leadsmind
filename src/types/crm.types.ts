export type ActionResult<T = void> = 
  | { success: true; data?: T }
  | { success: false; error: string };

export const CRM_VERSION = '1.0.0';

export type Contact = {
  id: string;
  workspace_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  owner_id: string | null;
  tags: string[];
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface ContactActivity {
  id: string;
  workspace_id: string;
  contact_id: string;
  type: 'note' | 'task' | 'deal' | 'system';
  description: string;
  metadata: any;
  created_by: string | null;
  created_at: string;
}

export interface ContactNote {
  id: string;
  workspace_id: string;
  contact_id: string;
  content: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactTask {
  id: string;
  workspace_id: string;
  contact_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: 'todo' | 'completed';
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pipeline {
  id: string;
  workspace_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

export interface PipelineStage {
  id: string;
  workspace_id: string;
  pipeline_id: string;
  name: string;
  position: number;
  created_at: string;
}

export interface Opportunity {
  id: string;
  workspace_id: string;
  contact_id: string | null;
  stage_id: string;
  title: string;
  value: number;
  status: 'open' | 'won' | 'lost';
  owner_id: string | null;
  stage_entered_at: string;
  position: number;
  created_at: string;
  updated_at: string;
}
