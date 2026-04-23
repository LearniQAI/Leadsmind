-- Phase 27: CRM Enhancements (Notes & Deduplication)

-- Enhance contact_notes
ALTER TABLE contact_notes ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE contact_notes ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'standard'; -- standard, template, call_log

-- CRM-5: Deduplication Logging
CREATE TABLE IF NOT EXISTS duplicate_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    scanned_at TIMESTAMPTZ DEFAULT now(),
    total_records INTEGER,
    duplicates_found INTEGER,
    status TEXT DEFAULT 'completed', -- running, completed, failed
    created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS duplicate_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES duplicate_scans(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    contact_ids UUID[] DEFAULT '{}',
    match_criteria TEXT, -- e.g. 'email', 'phone', 'name'
    status TEXT DEFAULT 'pending', -- pending, merged, ignored
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE duplicate_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace access for duplicate_scans" ON duplicate_scans FOR ALL USING (check_workspace_access(workspace_id));
CREATE POLICY "Workspace access for duplicate_groups" ON duplicate_groups FOR ALL USING (check_workspace_access(workspace_id));
