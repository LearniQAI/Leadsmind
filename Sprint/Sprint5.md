# Sprint 5 — Dashboard Shell & Workspace Settings

**Theme:** Build the main app shell that wraps every protected page, and the workspace settings page.  
**Dependency:** Sprint 4 complete. Route protection middleware must be working.

---

**Task 5.1 — Build the Dashboard Shell (sidebar + top bar)**

Acceptance criteria:
- `DashboardShell.tsx` created in `/components/layout/`
- `/(dashboard)/layout.tsx` wraps all dashboard routes in the shell
- Left sidebar (240px, `--sidebar` background):
  - Top: workspace logo or initials fallback
  - Nav links with icons: Dashboard, Contacts (greyed out — "Coming Soon" tooltip), Team Members, Settings
  - Active item: `--sidebar-primary` background highlight
  - Bottom: logged-in user avatar (initials fallback) + first name + Logout button
  - Collapses to hamburger menu on mobile (< 768px)
- Top bar (60px, white, 1px bottom border):
  - Left: current page title (dynamic per page)
  - Right: workspace name badge + user avatar with initials
- Main content area: fills remaining space, `--background` bg, 32px padding
- Shell only renders if user has a valid session (middleware handles redirect)

---

**Task 5.2 — Build the Dashboard home page (`/dashboard`)**

Acceptance criteria:
- Route: `/dashboard` — inside `/(dashboard)` layout with full shell
- Page heading in top bar: "Dashboard"
- Placeholder welcome card: "Welcome back, [first name]!" + current workspace name
- 4 placeholder stat cards (greyed out with "Coming Soon"): Contacts, Active Deals, Emails Sent, Active Courses
- Quick actions section: "Invite a Team Member" button → `/settings/team`, "Workspace Settings" → `/settings/workspace`
- Empty state is clean and professional — does not look broken
- Page renders correctly with the sidebar active state on "Dashboard"

---

**Task 5.3 — Build Workspace Settings — General and Branding sections**

Acceptance criteria:
- Route: `/settings/workspace` — Admin only
- Access denied state: if role is not `admin`, hide all form content, show "Access Denied" message with a back button
- General Settings section:
  - Workspace Name text input — pre-filled with current value
  - Workspace Slug text input — pre-filled, with explanation text
  - "Save Changes" button — on success shows green toast *"Workspace settings saved"*, updates database
- Branding section:
  - Logo upload area (drag and drop or click to upload)
  - Accepts PNG and JPG only — shows error for other file types
  - Current logo preview shown
  - Logo stored in Supabase Storage, `logo_url` updated in `workspaces` table
  - Updated logo appears in sidebar immediately after save

---

**Task 5.4 — Build Workspace Settings — Plan & Billing and Danger Zone sections**

Acceptance criteria:
- Plan & Billing section:
  - Current plan badge: "Free Plan"
  - 3-item feature list for the free plan
  - "Upgrade" button: disabled, shows "Coming Soon" tooltip on hover
- Danger Zone section:
  - Red-bordered section with clear warning text
  - "Delete Workspace" button: red, outlined
  - Clicking opens a confirmation modal (shadcn Dialog component)
  - Modal requires user to type the workspace name exactly to enable the confirm button
  - On confirm: deletes workspace and all associated data, logs user out, redirects to `/signup`
  - An Admin cannot delete a workspace if they are not the `owner_id`

---

**Task 5.5 — Dashboard shell and workspace settings QA**

Acceptance criteria:
- PRD checklist #17: dashboard shell loads — sidebar, top bar, content area all render
- PRD checklist #18: sidebar shows logged-in user's first name and avatar initials
- PRD checklist #19: Team Member navigating to `/settings/workspace` sees Access Denied
- PRD checklist #20: workspace name change saves and persists after page reload
- PRD checklist #21: logo upload appears in sidebar after upload
- Sidebar active state updates correctly when navigating between pages
- Mobile hamburger menu opens and closes correctly
- Logout button in sidebar destroys session and redirects to `/login`

---

**PRD checklist items closed this sprint:** #17 (dashboard shell), #18 (sidebar user display), #19 (workspace settings admin only), #20 (workspace settings save), #21 (logo upload)
