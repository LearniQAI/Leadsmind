# Sprint 6 — Team Member Management

**Theme:** Build the full invite-accept-manage flow for team members inside a workspace.  
**Dependency:** Sprint 5 complete. Workspace shell and admin access control must be working.

---

**Task 6.1 — Build Team Members page UI and pending invitations list**

Acceptance criteria:
- Route: `/settings/team` — Admin only
- Access denied state for non-admins (same pattern as workspace settings)
- Page heading in top bar: "Team Members"
- Invite section at the top:
  - Email input + Role dropdown (Admin / Team Member) + "Send Invite" button — all inline on one row
  - Client-side validation: email required and valid format, role required
- Pending invitations list below invite form:
  - Shows all invitations where `accepted_at` is null
  - Each row: email, role badge, date sent, "Resend" link, "Cancel" link
  - Empty state: "No pending invitations"
- Sidebar active state on "Team Members"

---

**Task 6.2 — Implement invitation sending logic and email template**

Acceptance criteria:
- On "Send Invite" click: POST to `/api/invitations/send`
- API route:
  - Checks if the email is already a workspace member → shows *"This user is already a member of this workspace"*
  - Checks if a pending (non-expired, non-accepted) invitation exists → shows *"An invitation has already been sent to this email"*
  - Generates a unique UUID token
  - Writes invitation record: `workspace_id`, `email`, `role`, `token`, `expires_at = now() + 48 hours`
  - Calls `sendEmail()` with the invitation email template
- Invitation email template (`/emails/invitation.tsx`) finalised:
  - Subject: `[Workspace Name] has invited you to join`
  - Body: who invited them, workspace name, role, CTA button linking to `/invite/accept?token=XYZ`
  - Expiry note: "This invitation expires in 48 hours"
- Resend link: regenerates token, updates `expires_at`, resends email
- Cancel link: deletes invitation record from database

---

**Task 6.3 — Build invitation acceptance flow**

Acceptance criteria:
- Route: `/invite/accept` — reads `token` from query string
- On load: validates token — if expired or already used → show *"This invitation has expired. Ask the workspace admin to send a new one."*
- If token is valid and user is already logged in and has an account:
  - Writes `workspace_members` record with the correct role
  - Marks invitation `accepted_at = now()`
  - Redirects to `/dashboard` inside the new workspace
- If token is valid and user does NOT have an account:
  - Shows a mini signup form (name, password, confirm password — email is pre-filled from invitation and read-only)
  - On submit: creates `users` record → writes `workspace_members` → marks invitation accepted → redirects to `/dashboard`
- If token is valid and user is logged in but is already a member of that workspace: shows *"You are already a member of this workspace"*

---

**Task 6.4 — Build team members table with role management and removal**

Acceptance criteria:
- Team members table columns: Avatar + Name, Email, Role badge, Joined Date, Actions
- Role badge colours: Admin = `--primary` (indigo), Member = `--muted`
- Actions — Change Role:
  - Dropdown: "Make Admin" or "Make Member" (shows the other option from current role)
  - Only visible to Admins
  - An Admin cannot change their own role
  - On change: updates `workspace_members.role` in database, updates badge in UI immediately
- Actions — Remove:
  - Red text button: "Remove"
  - Clicking shows a shadcn AlertDialog: *"Remove [name] from [workspace]? They will lose access immediately."*
  - On confirm: deletes `workspace_members` record
  - An Admin cannot remove themselves
- Empty state: *"You have not invited any team members yet. Send your first invite above."*

---

**Task 6.5 — Team member management end-to-end QA**

Acceptance criteria:
- PRD checklist #22: invite email received in inbox
- PRD checklist #23: clicking invite link adds invitee to workspace with correct role
- PRD checklist #24: accepted members appear in table with correct name, email, role, joined date
- PRD checklist #25: removing a member revokes their access — they cannot access the workspace after removal
- PRD checklist #26: promoting a Team Member to Admin — they can now access `/settings/workspace`
- Expired invitation link tested: shows correct error message
- Already-a-member invitation link tested: shows correct message
- Non-admin visiting `/settings/team` sees Access Denied
- Admin cannot remove themselves — Remove button absent on their own row
- Admin cannot change their own role — Change Role dropdown disabled on their own row

---

**PRD checklist items closed this sprint:** #22 (invite sent), #23 (invitation accepted), #24 (team list shows members), #25 (remove member), #26 (role change)
