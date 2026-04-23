-- Phase 27: CRM-8 Activity Gamification

CREATE TABLE IF NOT EXISTS activity_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    points INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    notes_added INTEGER DEFAULT 0,
    calls_logged INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(workspace_id, user_id, date)
);

-- RLS
ALTER TABLE activity_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workspace access for activity_scores" ON activity_scores FOR ALL USING (check_workspace_access(workspace_id));

-- Trigger to increment points (simplified example)
CREATE OR REPLACE FUNCTION public.update_activity_points()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_scores (workspace_id, user_id, date, points, notes_added)
    VALUES (NEW.workspace_id, NEW.created_by, CURRENT_DATE, 10, 1)
    ON CONFLICT (workspace_id, user_id, date)
    DO UPDATE SET 
        points = activity_scores.points + 10,
        notes_added = activity_scores.notes_added + 1,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
