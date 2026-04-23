-- Phase 27: CRM Missing Features Migration (Robust Version)

-- 0. DEFENSIVE INFRASTRUCTURE (Ensures dependencies exist)
CREATE TABLE IF NOT EXISTS workspaces (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS contacts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id UUID REFERENCES workspaces(id), first_name TEXT, last_name TEXT, email TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS courses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id UUID REFERENCES workspaces(id), title TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS course_modules (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), course_id UUID REFERENCES courses(id), title TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS invoices (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id UUID REFERENCES workspaces(id), contact_id UUID REFERENCES contacts(id), total_amount NUMERIC(15, 2), status TEXT, created_at TIMESTAMPTZ DEFAULT now());

-- 1. CRM-1: Two-Way Email Sync
CREATE TABLE IF NOT EXISTS email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    team_member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook')),
    email_address TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    sync_enabled BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(workspace_id, team_member_id, email_address)
);

CREATE TABLE IF NOT EXISTS contact_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    message_id TEXT UNIQUE NOT NULL,
    thread_id TEXT NOT NULL,
    subject TEXT,
    from_email TEXT NOT NULL,
    to_emails TEXT[] DEFAULT '{}',
    cc_emails TEXT[] DEFAULT '{}',
    body_html TEXT,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    has_attachments BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID NOT NULL REFERENCES contact_emails(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CRM-3: Unified Task Management
-- Note: Expanding from contact_tasks to a more global tasks table
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'cancelled');
CREATE TYPE task_related_type AS ENUM ('invoice', 'ticket', 'deal', 'quote', 'contact');

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    related_type task_related_type,
    related_id UUID,
    priority task_priority DEFAULT 'medium',
    status task_status DEFAULT 'todo',
    due_date DATE,
    due_time TIME,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule TEXT, -- RRULE format
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CRM-6: Custom Objects Foundation
CREATE TABLE IF NOT EXISTS custom_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name_singular TEXT NOT NULL,
    name_plural TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(workspace_id, name_singular)
);

CREATE TABLE IF NOT EXISTS custom_object_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    object_id UUID NOT NULL REFERENCES custom_objects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'number', 'date', 'dropdown', 'currency', 'lookup')),
    lookup_target TEXT, -- e.g. 'contact'
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(object_id, name)
);

CREATE TABLE IF NOT EXISTS custom_object_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    object_id UUID NOT NULL REFERENCES custom_objects(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RLS POLICIES

-- Enable RLS
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_object_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_object_records ENABLE ROW LEVEL SECURITY;

-- Helper Function (reuse if exists or create)
CREATE OR REPLACE FUNCTION public.check_workspace_access(target_workspace_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = target_workspace_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Policies
CREATE POLICY "Workspace access for email_accounts" ON email_accounts FOR ALL USING (check_workspace_access(workspace_id));
CREATE POLICY "Workspace access for contact_emails" ON contact_emails FOR ALL USING (check_workspace_access(workspace_id));
CREATE POLICY "Workspace access for email_attachments" ON email_attachments FOR ALL USING (
    EXISTS (SELECT 1 FROM contact_emails WHERE id = email_id AND check_workspace_access(workspace_id))
);
CREATE POLICY "Workspace access for tasks" ON tasks FOR ALL USING (check_workspace_access(workspace_id));
CREATE POLICY "Workspace access for custom_objects" ON custom_objects FOR ALL USING (check_workspace_access(workspace_id));
CREATE POLICY "Workspace access for custom_object_fields" ON custom_object_fields FOR ALL USING (
    EXISTS (SELECT 1 FROM custom_objects WHERE id = object_id AND check_workspace_access(workspace_id))
);
CREATE POLICY "Workspace access for custom_object_records" ON custom_object_records FOR ALL USING (check_workspace_access(workspace_id));

-- 5. TRIGGERS for updated_at
CREATE TRIGGER tr_email_accounts_updated_at BEFORE UPDATE ON email_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_custom_objects_updated_at BEFORE UPDATE ON custom_objects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_custom_object_records_updated_at BEFORE UPDATE ON custom_object_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
