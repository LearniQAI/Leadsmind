-- Phase 27: CRM-7 Forecasting & Targets

-- Enhance opportunities
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS expected_close_date DATE;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS probability INTEGER DEFAULT 50; -- 0 to 100

-- Revenue Targets
CREATE TABLE IF NOT EXISTS revenue_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_amount NUMERIC(15, 2) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE revenue_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workspace access for revenue_targets" ON revenue_targets FOR ALL USING (check_workspace_access(workspace_id));
