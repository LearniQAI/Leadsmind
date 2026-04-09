# Sprint Plan
## Phase 1 — Auth & Multi-Tenant Foundation
**SaaS CRM + LMS Platform**

---

| Field | Detail |
|---|---|
| Total Sprints | 8 |
| Total Tasks | 40 |
| Sprint Length | 1 week (recommended) |
| Total Estimated Duration | 8 weeks |
| Coverage | Full Phase 1 PRD |

> **How to read this document:**
> Each sprint has a clear theme, a list of exactly 5 tasks, acceptance criteria per task, and a list of PRD checklist items it closes. Complete every acceptance criterion before marking a task done. Do not start the next sprint until all 5 tasks in the current sprint pass.

---

## Sprint 0 — Project Setup & Infrastructure

**Theme:** Get the project running locally with all tools, services, and structure in place before writing a single feature.  
**Dependency:** Every other sprint depends on this one being complete.

---

**Task 0.1 — Initialise Next.js project with Tailwind and shadcn/ui**

Set up the base project with the correct folder structure as defined in the PRD.

Acceptance criteria:
- `npx create-next-app` with App Router, TypeScript, and Tailwind CSS
- shadcn/ui installed and initialised (`npx shadcn@latest init`)
- Folder structure created: `/(marketing)`, `/(auth)`, `/(dashboard)`, `/components/marketing`, `/components/layout`, `/components/auth`, `/lib`
- `globals.css` populated with the full design token file (all CSS variables, light and dark mode)
- Poppins font loaded in `layout.tsx` via Google Fonts
- App runs locally at `localhost:3000` with no errors

---

**Task 0.2 — Set up Supabase project and create all database tables**

Create the Supabase project and run the SQL migrations to create all 5 core tables.

Acceptance criteria:
- Supabase project created and accessible in the dashboard
- All 5 tables created with correct columns, types, and constraints:
  - `users` — id, email, password_hash, first_name, last_name, avatar_url, created_at
  - `workspaces` — id, name, slug, logo_url, owner_id, plan, created_at
  - `workspace_members` — id, workspace_id, user_id, role, joined_at
  - `invitations` — id, workspace_id, email, role, token, expires_at, accepted_at, created_at
  - `sessions` — id, user_id, workspace_id, token, expires_at, created_at
- Unique constraint on `workspace_members(workspace_id, user_id)` confirmed
- Unique constraints on `users.email`, `workspaces.slug`, `invitations.token` confirmed
- Tables visible and correct in Supabase table editor

---

**Task 0.3 — Configure Row-Level Security (RLS) policies**

Apply data scoping at the database level so workspace data is always isolated.

Acceptance criteria:
- RLS enabled on `workspace_members`, `workspaces`, `invitations`, and `sessions`
- Policy on `workspace_members`: users can only SELECT/INSERT/UPDATE/DELETE rows where `workspace_id` matches their active workspace
- Policy on `workspaces`: users can only SELECT workspaces they are a member of
- Policy on `invitations`: admins can only see invitations belonging to their workspace
- RLS tested manually in Supabase SQL editor — a query without the correct workspace context returns zero rows
- Policies documented in a `/lib/rls-notes.md` file for future reference

---

**Task 0.4 — Configure environment variables and connect Supabase to Next.js**

Wire up all external services so the app can communicate with Supabase and Resend.

Acceptance criteria:
- `.env.local` created with all required variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `NEXTAUTH_SECRET`
  - `NEXT_PUBLIC_APP_URL`
- `.env.example` created with placeholder values (committed to repo, `.env.local` is not)
- `/lib/supabase.ts` created with browser and server Supabase client exports
- `/lib/auth.ts` created as a placeholder for auth helper functions
- `/lib/roles.ts` created with role constants: `ADMIN`, `MEMBER`, `CLIENT`
- `console.log` test confirms Supabase connection returns no errors on app start

---

**Task 0.5 — Set up Resend and configure base email infrastructure**

Ensure the email service is connected and able to send before the invitation and password reset flows are built.

Acceptance criteria:
- Resend account created and API key added to `.env.local`
- Resend npm package installed: `npm install resend`
- `/lib/email.ts` created with a `sendEmail()` helper function wrapping the Resend client
- A test email successfully delivered to a real inbox using the helper function
- Sending domain configured in Resend (or a subdomain added and verified for production use)
- `/emails/` folder created with placeholder files: `invitation.tsx`, `password-reset.tsx`, `contact-form.tsx`

---

**PRD checklist items closed this sprint:** None (infrastructure sprint — enables all others)

---

## Sprint 1 — Public Marketing Pages (Part 1)

**Theme:** Build the visitor-facing entry points — the pages any potential customer sees before signing up.  
**Dependency:** Sprint 0 complete.

---

**Task 1.1 — Build Navbar and Footer components**

These are shared across all marketing pages and must be built before the pages themselves.

Acceptance criteria:
- `Navbar.tsx` built in `/components/marketing/`
  - Logo on the left
  - Nav links in the centre: Features (anchor), Pricing (`/pricing`), About (`/about`)
  - Auth buttons on the right: "Log In" (`/login`), "Get Started" CTA (`/signup`)
  - If user session exists: replace auth buttons with "Go to Dashboard" (`/dashboard`)
  - Fully responsive — collapses to hamburger on mobile (< 768px)
- `Footer.tsx` built in `/components/marketing/`
  - Logo and tagline
  - Links: Features, Pricing, About, Privacy Policy (`/privacy`), Terms (`/terms`)
  - Copyright line with current year
- Both components use correct design tokens from `globals.css`

---

**Task 1.2 — Build the Landing Page (`/`)**

The primary conversion page for new visitors.

Acceptance criteria:
- Route: `/` — rendered inside `/(marketing)` layout with Navbar and Footer
- Hero section: headline, subheadline, two CTA buttons ("Start for Free" → `/signup`, "See how it works" → `#features` anchor)
- Features section (`id="features"`): heading + 6 feature cards in a responsive grid, each with icon, name, and description
- Social proof section: 3 placeholder testimonial cards (name, role, quote)
- Pricing preview: brief mention of free plan with "See full pricing" link → `/pricing`
- Page is fully responsive at 375px, 768px, and 1280px breakpoints
- All colours, fonts, and spacing use design tokens only — no hardcoded hex values

---

**Task 1.3 — Build the Pricing Page (`/pricing`)**

Acceptance criteria:
- Route: `/pricing` — inside `/(marketing)` layout
- Page heading and subheading rendered correctly
- Monthly/Annual billing toggle — clicking Annual shows a "Save 20%" badge and updates displayed prices
- 3 pricing tier cards: Free, Pro (marked "Most Popular"), Enterprise
- Each card contains: plan name, price, description, feature checklist, and CTA button
- CTA buttons: Free → `/signup`, Pro → `/signup`, Enterprise → `/contact`
- FAQ section: 5 questions in accordion/collapsible format using shadcn Accordion component
- Fully responsive

---

**Task 1.4 — Build the About Page (`/about`)**

Acceptance criteria:
- Route: `/about` — inside `/(marketing)` layout
- Mission statement section with one paragraph of placeholder copy
- Team section: 3 placeholder cards (avatar circle with initials, name, role)
- Company values: 3–4 value statements with icons
- CTA banner at the bottom: "Ready to get started?" with "Sign Up Free" button → `/signup`
- Fully responsive

---

**Task 1.5 — Build the Contact Page (`/contact`) with working form submission**

Acceptance criteria:
- Route: `/contact` — inside `/(marketing)` layout
- Contact form fields: Name, Email, Subject (dropdown with 4 options), Message textarea, Submit button
- Client-side validation: all fields required, email format validated
- On submit: POST to a Next.js API route (`/api/contact`) that calls `sendEmail()` from `/lib/email.ts`
- Email delivered to support inbox using Resend
- Success state: form hides, success message appears — *"Thanks! We'll get back to you within 1 business day."*
- Error state: if send fails, show error banner without hiding the form
- Auto-reply email sent to the person who submitted the form
- Fully responsive

---

**PRD checklist items closed this sprint:** #10 (footer links work), partial #1 (landing page loads), #6 (about page loads), #7 (contact form submits)

---

## Sprint 2 — Public Marketing Pages (Part 2) & Legal Pages

**Theme:** Complete the public page set with legal pages and remaining marketing pages.  
**Dependency:** Sprint 1 complete (Navbar and Footer components exist).

---

**Task 2.1 — Build Privacy Policy page (`/privacy`)**

Acceptance criteria:
- Route: `/privacy` — inside `/(marketing)` layout with Navbar and Footer
- "Last updated: April 2026" displayed at the top
- Content sections: Data Collected, How It Is Used, Third-Party Services (Supabase, Resend), Cookies, User Rights, Contact for Data Requests
- Content is written in plain English
- Page is readable on mobile — font size minimum 16px, adequate line height
- A prominent note at the top: *"This policy should be reviewed by a legal professional before launch"*

---

**Task 2.2 — Build Terms of Service page (`/terms`)**

Acceptance criteria:
- Route: `/terms` — inside `/(marketing)` layout with Navbar and Footer
- "Last updated: April 2026" displayed at the top
- Content sections: Acceptable Use, Account Responsibility, Payment Terms, Cancellation, Limitation of Liability, Governing Law
- Plain English format with numbered sections for easy reference
- A prominent note at the top: *"These terms should be reviewed by a legal professional before launch"*
- `/signup` page updated to include: "By creating an account you agree to our Terms of Service and Privacy Policy" with working links below the signup button

---

**Task 2.3 — Complete the Landing Page — verify all sections and run full page QA**

Acceptance criteria:
- All landing page sections verified against PRD spec: Hero, Features, Social Proof, Pricing Preview, Footer
- "Get Started" CTA button navigates to `/signup`
- "Log In" in Navbar navigates to `/login`
- "See how it works" smooth-scrolls to `#features`
- "See full pricing" navigates to `/pricing`
- Page loads in under 2 seconds (check with browser DevTools network tab)
- No console errors on load
- Tested on Chrome, Safari, and Firefox
- Tested on mobile (375px), tablet (768px), and desktop (1280px)

---

**Task 2.4 — Build the `/(marketing)` layout wrapper**

Ensure all marketing pages share a consistent layout and the correct Navbar/Footer behaviour.

Acceptance criteria:
- `/(marketing)/layout.tsx` created
- Navbar and Footer rendered on every page inside `/(marketing)` automatically
- Marketing layout does NOT include the sidebar or dashboard top bar
- Background defaults to `--background` token
- Smooth scroll behaviour enabled globally (`scroll-behavior: smooth` in CSS)
- Open Graph meta tags set in the marketing layout: title, description, and placeholder image
- `/(marketing)` layout confirmed working for: `/`, `/pricing`, `/about`, `/contact`, `/privacy`, `/terms`

---

**Task 2.5 — Responsive QA pass across all public pages**

Acceptance criteria:
- Every public page tested at 375px (mobile), 768px (tablet), 1280px (desktop)
- Navbar hamburger menu opens and closes correctly on mobile
- No horizontal scroll on any page at any breakpoint
- All links in Navbar and Footer navigate to correct routes
- Pricing toggle (monthly/annual) works correctly
- FAQ accordion opens and closes correctly
- Contact form submits successfully end-to-end
- All pages render correctly in dark mode (toggle `.dark` class on `<html>`)

---

**PRD checklist items closed this sprint:** #1 (landing page fully verified), #2 (landing page nav CTAs), #8 (Privacy Policy loads), #9 (Terms of Service loads), #10 (footer links fully verified)

---

## Sprint 3 — Authentication: Signup & Login

**Theme:** Build the core auth flows — signup, login, and workspace picker — fully wired to Supabase.  
**Dependency:** Sprints 0–2 complete. Supabase tables and RLS from Sprint 0 must exist.

---

**Task 3.1 — Build the Signup page and wire to Supabase**

Acceptance criteria:
- Route: `/signup` — inside `/(auth)` layout (no sidebar, centered card, max-width 440px)
- Form fields: Full Name, Email, Password (min 8 chars), Confirm Password
- Link below form: "Already have an account? Log in" → `/login`
- Legal consent line: "By creating an account you agree to our Terms and Privacy Policy"
- Client-side validation with inline errors under each field
- On submit: loading spinner on button
- On success: writes `users` record → writes `workspaces` record (owner = new user) → writes `workspace_members` record (role = admin) → creates session → redirects to `/dashboard`
- On duplicate email: shows *"An account with this email already exists"*
- On password mismatch: shows error under Confirm Password field
- If user already has a valid session: redirect to `/dashboard` immediately (do not show form)

---

**Task 3.2 — Build the Login page and wire to Supabase**

Acceptance criteria:
- Route: `/login` — inside `/(auth)` layout (centered card, max-width 420px)
- Form fields: Email, Password, Remember Me checkbox
- Links: "Forgot your password?" → `/forgot-password`, "Don't have an account? Sign up" → `/signup`
- On submit: loading spinner on button
- On wrong credentials: *"Email or password is incorrect"* — same message regardless of which field is wrong
- On success with 1 workspace: create session, store `workspace_id`, redirect to `/dashboard`
- On success with multiple workspaces: show workspace picker modal (Task 3.3)
- Remember Me: session expires in 90 days if checked, 30 days if not
- If user already has a valid session: redirect to `/dashboard` immediately

---

**Task 3.3 — Build the Workspace Picker modal**

Acceptance criteria:
- `WorkspacePicker.tsx` built in `/components/auth/`
- Modal appears after successful login when user belongs to 2+ workspaces
- Modal lists all workspaces the user belongs to — each row shows: workspace logo (or initials fallback), workspace name, user's role in that workspace
- Clicking a workspace: sets `workspace_id` in session, closes modal, redirects to `/dashboard`
- Last-used workspace is stored in localStorage and pre-highlighted on next login
- Modal cannot be dismissed without selecting a workspace (no X button, no outside click to close)
- Fully responsive — on mobile the modal takes full screen width

---

**Task 3.4 — Implement session management helpers**

Acceptance criteria:
- `/lib/auth.ts` completed with the following helper functions:
  - `getSession()` — retrieves the current session from Supabase
  - `getCurrentUser()` — returns the logged-in user object
  - `getCurrentWorkspace()` — returns the active workspace object
  - `getUserRole()` — returns the user's role in the current workspace: `admin`, `member`, or `client`
  - `requireAuth()` — throws/redirects if no valid session (for use in server components)
  - `requireAdmin()` — throws/redirects if user is not admin (for use in server components)
- `logout()` function: destroys Supabase session, clears localStorage, redirects to `/login`
- Logout button in the `/(auth)` pages calls this function correctly

---

**Task 3.5 — Verify signup + login end-to-end and run auth QA**

Acceptance criteria:
- Signup flow tested end-to-end: form submission → database records confirmed in Supabase → redirect to `/dashboard`
- Login flow tested: correct credentials → dashboard, wrong credentials → generic error
- Multi-workspace picker tested: create 2 accounts, invite account A to account B's workspace, log in as A → picker appears → selecting a workspace enters it correctly
- PRD checklist items #11, #12, #13 all pass
- Session persists across browser refresh
- Logging out destroys session — navigating to `/dashboard` redirects to `/login`
- Navigating to `/login` or `/signup` while logged in redirects to `/dashboard`

---

**PRD checklist items closed this sprint:** #3 (logged-in landing nav), #11 (signup creates user + workspace), #12 (login works), #13 (multi-workspace picker)

---

## Sprint 4 — Authentication: Password Reset & Route Protection

**Theme:** Complete the auth system with password reset and lock every route at the correct permission level.  
**Dependency:** Sprint 3 complete. Session helpers in `/lib/auth.ts` must exist.

---

**Task 4.1 — Build Forgot Password page (request reset)**

Acceptance criteria:
- Route: `/forgot-password` — inside `/(auth)` layout
- Single email input field + "Send Reset Link" button + "Return to login" link
- On submit: generates a unique token, writes to `invitations`-style or separate `password_resets` table with `expires_at = now() + 1 hour`
- Calls `sendEmail()` with the password reset email template — link format: `{APP_URL}/reset-password?token=XYZ`
- Always shows success message regardless of whether email is registered: *"If an account exists with this email, a reset link has been sent."*
- If user already logged in: redirect to `/dashboard`

---

**Task 4.2 — Build Reset Password page (set new password) and complete email template**

Acceptance criteria:
- Route: `/reset-password` — inside `/(auth)` layout
- On page load: reads `token` from URL query string, validates it against database
- If token is expired or already used: show error *"This link has expired. Please request a new one."* with a link back to `/forgot-password`
- If token is valid: show New Password + Confirm New Password fields
- On submit: validates passwords match and meet minimum length
- On success: updates `password_hash` in `users` table, marks token as used (`accepted_at = now()`), creates new session, redirects to `/dashboard`
- Password reset email template in `/emails/password-reset.tsx` finalised: subject line, CTA button, expiry note

---

**Task 4.3 — Implement `middleware.ts` route protection**

Acceptance criteria:
- `middleware.ts` created at project root
- Three protection levels implemented as per PRD:
  - **Fully public** — no redirect logic: `/`, `/pricing`, `/about`, `/contact`, `/privacy`, `/terms`
  - **Public only** — redirect to `/dashboard` if logged in: `/login`, `/signup`, `/forgot-password`, `/reset-password`
  - **Must be logged in** — redirect to `/login` if no session: `/dashboard`, `/settings/account`
  - **Admin only** — redirect to `/dashboard` with toast error if not admin: `/settings/workspace`, `/settings/team`
- Middleware runs before page content loads — no flash of protected content
- Toast notification shown on admin-only redirect: *"You don't have permission to access this page."*
- `middleware.ts` uses the `getCurrentUser()` and `getUserRole()` helpers from `/lib/auth.ts`

---

**Task 4.4 — Build `/403` access denied page and logout flow**

Acceptance criteria:
- Route: `/403` — fully public, no layout restriction
- Page content: friendly heading ("Access Denied"), explanation ("You don't have permission to view this page"), and a "Go to Dashboard" button
- Page uses marketing layout (Navbar optional, clean centred card layout)
- Logout flow fully implemented:
  - Logout button in sidebar calls `logout()` from `/lib/auth.ts`
  - Session destroyed in Supabase
  - localStorage cleared
  - Redirected to `/login`
  - Navigating back to `/dashboard` after logout redirects to `/login`
  - Browser back button after logout redirects to `/login` (session check on every load)

---

**Task 4.5 — Password reset and route protection QA**

Acceptance criteria:
- PRD checklist #14: forgot password email arrives in inbox
- PRD checklist #15: new password accepted, old password rejected
- PRD checklist #16: reset link used twice — second use shows expired message
- PRD checklist #29: navigating to `/dashboard` while logged out → `/login`
- PRD checklist #30: navigating to `/login` while logged in → `/dashboard`
- PRD checklist #31: logout clears session — subsequent `/dashboard` visit redirects
- Admin-only route test: log in as a Team Member, navigate to `/settings/workspace` → redirected to `/dashboard` with toast message
- All redirects happen before any page content is visible (no flash)

---

**PRD checklist items closed this sprint:** #14 (reset email), #15 (reset works), #16 (reset link single-use), #29 (logged-out redirect), #30 (logged-in redirect), #31 (logout clears session)

---

## Sprint 5 — Dashboard Shell & Workspace Settings

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

---

## Sprint 6 — Team Member Management

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

---

## Sprint 7 — User Account Settings & Final QA

**Theme:** Build the personal account settings page and run the full Phase 1 completion checklist.  
**Dependency:** Sprints 0–6 all complete.

---

**Task 7.1 — Build Account Settings — Profile section**

Acceptance criteria:
- Route: `/settings/account` — accessible to ALL logged-in users regardless of role
- Page heading in top bar: "Account Settings"
- Profile section:
  - Circular avatar upload (96px diameter) — click or drag and drop
  - Accepts PNG and JPG — rejects other formats with an error message
  - On upload: stores image in Supabase Storage, updates `avatar_url` in `users` table, updates avatar in sidebar immediately (no page reload required)
  - First Name input — pre-filled, editable
  - Last Name input — pre-filled, editable
  - Email — read-only field with note: *"Contact support to change your email"*
  - "Save Profile" button — on success shows green toast *"Profile updated"*, updates database
  - On failure: shows red toast *"Something went wrong. Please try again."*

---

**Task 7.2 — Build Account Settings — Change Password section**

Acceptance criteria:
- Change Password section below Profile on the same `/settings/account` page
- Fields: Current Password, New Password (min 8 chars), Confirm New Password
- "Update Password" button
- On wrong current password: inline error *"Current password is incorrect"*
- On new password mismatch: inline error under Confirm New Password field
- On new password < 8 characters: inline error *"Password must be at least 8 characters"*
- On success: all three fields cleared, green toast *"Password updated successfully"*
- Old password rejected on next login after a successful change

---

**Task 7.3 — Build Account Settings — Your Workspaces section**

Acceptance criteria:
- Your Workspaces section below Change Password on `/settings/account`
- Lists all workspaces the logged-in user belongs to (from `workspace_members` joined with `workspaces`)
- Each workspace row: workspace logo (or initials fallback), workspace name, user's role badge in that workspace, "Switch to this workspace" button
- "Switch to this workspace": updates `workspace_id` in session, redirects to `/dashboard` inside that workspace
- Currently active workspace is highlighted with a badge or border
- Link at the bottom of the section: "Create a new workspace" — clicking triggers the workspace creation flow (new workspace name prompt → creates `workspaces` and `workspace_members` records → switches to new workspace)

---

**Task 7.4 — Run the full Phase 1 completion checklist (items 1–32)**

Work through every item in the PRD checklist manually. Log results in a test run document.

Acceptance criteria:
- All 32 checklist items in the PRD tested manually and documented as Pass or Fail
- Any Fail items logged as bugs with: description of the failure, steps to reproduce, expected vs actual behaviour
- Bugs are prioritised: P1 (blocks launch) vs P2 (polish/minor)
- All P1 bugs fixed before Sprint 7 is considered done
- Test run document saved as `/docs/phase1-qa-results.md`
- Tested in: Chrome, Safari (if available), and on mobile (iOS or Android)
- Tested in both light mode and dark mode

---

**Task 7.5 — Fix P1 bugs, polish UI, and prepare for staging deployment**

Acceptance criteria:
- All P1 bugs from Task 7.4 resolved and re-tested
- UI consistency pass: verify all pages use design tokens only (no hardcoded colours), all shadows, radii, and spacing match the design token file
- Loading states verified on all forms — no button should be clickable twice during a submission
- Error boundaries added: if a page crashes, it shows a friendly error with a "Reload" option rather than a blank screen
- App deployed to a staging environment (e.g. Vercel preview deployment)
- Staging URL tested end-to-end by going through the entire Phase 1 checklist one more time
- `README.md` updated with: local setup instructions, environment variables guide, and how to run the app

---

**PRD checklist items closed this sprint:** #4 (landing page nav — if not done), #5 (pricing billing toggle), #27 (account settings save), #28 (change password), #32 (data isolation — final verification), and all remaining open items

---

## Summary

| Sprint | Theme | Tasks | Key PRD Items Closed |
|---|---|---|---|
| Sprint 0 | Project Setup & Infrastructure | 5 | — (enables all) |
| Sprint 1 | Public Marketing Pages Part 1 | 5 | #1, #6, #7, #10 |
| Sprint 2 | Public Marketing Pages Part 2 & Legal | 5 | #1, #2, #8, #9, #10 |
| Sprint 3 | Authentication: Signup & Login | 5 | #3, #11, #12, #13 |
| Sprint 4 | Auth: Password Reset & Route Protection | 5 | #14, #15, #16, #29, #30, #31 |
| Sprint 5 | Dashboard Shell & Workspace Settings | 5 | #17, #18, #19, #20, #21 |
| Sprint 6 | Team Member Management | 5 | #22, #23, #24, #25, #26 |
| Sprint 7 | Account Settings & Final QA | 5 | #27, #28, #32 + all remaining |
| **Total** | | **40 tasks** | **All 32 PRD checklist items** |

---

## Definition of Done

A sprint is only complete when:

- All 5 tasks have every acceptance criterion met
- No P1 bugs outstanding from that sprint
- All relevant PRD checklist items pass manual testing
- Code is committed and pushed to the main branch
- The next sprint's dependencies are confirmed as ready

---

*Sprint Plan — Phase 1 Auth & Multi-Tenant | SaaS CRM + LMS Platform | April 2026*
