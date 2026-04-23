-- Phase 27: Remaining LMS & Accounting Features

-- 1. CRM-9 & CRM-10: NPS & Referrals
CREATE TABLE IF NOT EXISTS surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('nps', 'csat', 'general')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    score INTEGER, -- 0-10 for NPS, 1-5 for CSAT
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    referrer_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'rewarded')),
    reward_details TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. LMS MODULE ENHANCEMENTS
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    certificate_url TEXT NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    max_points INTEGER DEFAULT 100,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    submission_url TEXT,
    content TEXT,
    grade INTEGER,
    feedback TEXT,
    graded_by UUID REFERENCES auth.users(id),
    submitted_at TIMESTAMPTZ DEFAULT now(),
    graded_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS community_forums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id UUID NOT NULL REFERENCES community_forums(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES forum_posts(id), -- For replies
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ACCOUNTING MODULE
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    merchant TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    receipt_url TEXT,
    description TEXT,
    tax_deductible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tax_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    tax_name TEXT NOT NULL, -- VAT, GST, Sales Tax
    rate NUMERIC(5, 2) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    UNIQUE(workspace_id, tax_name)
);

-- 4. RLS POLICIES
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace access for surveys" ON surveys FOR ALL USING (check_workspace_access(workspace_id));
CREATE POLICY "Workspace access for survey_responses" ON survey_responses FOR ALL USING (EXISTS (SELECT 1 FROM surveys WHERE id = survey_id AND check_workspace_access(workspace_id)));
CREATE POLICY "Workspace access for referrals" ON referrals FOR ALL USING (check_workspace_access(workspace_id));
CREATE POLICY "Workspace access for certificates" ON certificates FOR ALL USING (check_workspace_access(workspace_id));
CREATE POLICY "Workspace access for assignments" ON assignments FOR ALL USING (EXISTS (SELECT 1 FROM course_modules m JOIN courses c ON m.course_id = c.id WHERE m.id = module_id AND check_workspace_access(c.workspace_id)));
CREATE POLICY "Workspace access for submissions" ON assignment_submissions FOR ALL USING (EXISTS (SELECT 1 FROM assignments a JOIN course_modules m ON a.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE a.id = assignment_id AND check_workspace_access(c.workspace_id)));
CREATE POLICY "Workspace access for forums" ON community_forums FOR ALL USING (check_workspace_access(workspace_id));
CREATE POLICY "Workspace access for forum_posts" ON forum_posts FOR ALL USING (EXISTS (SELECT 1 FROM community_forums WHERE id = forum_id AND check_workspace_access(workspace_id)));
CREATE POLICY "Workspace access for expenses" ON expenses FOR ALL USING (check_workspace_access(workspace_id));
CREATE POLICY "Workspace access for tax_settings" ON tax_settings FOR ALL USING (check_workspace_access(workspace_id));
