# Product Requirements Document
## Phase 1 — Auth & Multi-Tenant Foundation
**SaaS CRM + LMS Platform**

---

| Field | Detail |
|---|---|
| Version | 1.0 |
| Status | Draft |
| Date | April 2026 |
| Phase | Phase 1 of N |
| Next Phase | Phase 2 — CRM Contacts & Pipelines |

---

## 1. Overview

This document defines the requirements for Phase 1 of a SaaS CRM + LMS platform. Phase 1 establishes the entire authentication and multi-tenant foundation that every subsequent feature depends on. No contacts, workflows, emails, pipelines, or courses can be built correctly without this layer being solid.

Phase 1 covers five core concerns:

- **Public Marketing Pages** — the landing page, pricing, about, and legal pages that any visitor sees before signing up
- **Authentication** — how users sign up, log in, reset passwords, and log out
- **Workspaces (Tenancy)** — how each organisation gets its own isolated environment
- **User Roles** — how different users have different levels of access within a workspace
- **Data Scoping** — how every piece of data is tagged and filtered by workspace so nothing leaks between tenants

---

## 2. Goals & Success Criteria

### Goals

- Any new user can self-serve sign up and immediately have a fully isolated workspace
- Existing users can log in securely, switch between workspaces, and have their session persist correctly
- Admins can invite team members, manage roles, and control workspace settings
- Every route in the application is protected at the correct permission level
- No data from Workspace A is ever visible when a user is logged into Workspace B

### Success Criteria

All 22 items on the Phase 1 completion checklist must pass manual testing before this phase is considered done. Key pass conditions:

- Signup creates both a `users` record and a `workspaces` record atomically
- Login with multiple workspaces surfaces a workspace picker
- Password reset tokens expire after 1 hour and can only be used once
- A Team Member navigating to `/settings/workspace` sees an access denied state
- Logging out destroys the session and redirects to `/login`
- Data from one workspace never appears in another workspace's views

---

## 3. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend Framework | Next.js 14 (App Router) | Native middleware for route protection, server components, file-based routing maps directly to page structure |
| Styling | Tailwind CSS | Utility-first, pairs well with AI IDE code generation |
| Component Library | shadcn/ui | Pre-built modals, toasts, dropdowns, tables — covers most UI needs in this phase |
| Backend / Database | Supabase (Postgres) | Built-in auth, row-level security for data isolation, storage for logo uploads |
| ORM | Prisma (optional) | Typed database queries, cleaner AI IDE output |
| Email | Resend | Invitation emails, password reset emails — simple API, generous free tier |
| Auth Layer | Supabase Auth | Sessions, JWT tokens, password hashing, email verification |
| Route Protection | Next.js `middleware.ts` | Single file, runs on every request before page load |

---

## 4. Data Model

### 4.1 Tables

#### `users`
Stores every person who can log into the platform.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | Primary key, auto-generated |
| email | text | Unique, not null |
| password_hash | text | Not null |
| first_name | text | Not null |
| last_name | text | |
| avatar_url | text | |
| created_at | timestamptz | Default: now() |

---

#### `workspaces`
One row per organisation or account. Every workspace is isolated.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | Primary key, auto-generated |
| name | text | Not null |
| slug | text | Unique, not null |
| logo_url | text | |
| owner_id | uuid | Foreign key → users.id |
| plan | text | Default: 'free' |
| created_at | timestamptz | Default: now() |

---

#### `workspace_members`
The join table linking users to workspaces with a role.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | Primary key, auto-generated |
| workspace_id | uuid | Foreign key → workspaces.id |
| user_id | uuid | Foreign key → users.id |
| role | text | Enum: 'admin', 'member', 'client' |
| joined_at | timestamptz | Default: now() |

Unique constraint on `(workspace_id, user_id)` — a user can only have one role per workspace.

---

#### `invitations`
Pending invitations sent to email addresses to join a workspace.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | Primary key, auto-generated |
| workspace_id | uuid | Foreign key → workspaces.id |
| email | text | Not null |
| role | text | Enum: 'admin', 'member', 'client' |
| token | text | Unique, not null |
| expires_at | timestamptz | Not null (current time + 48 hours) |
| accepted_at | timestamptz | Null until accepted |
| created_at | timestamptz | Default: now() |

---

#### `sessions`
Active login sessions. Acts as the user's digital ID card.

| Column | Type | Constraints |
|---|---|---|
| id | uuid | Primary key, auto-generated |
| user_id | uuid | Foreign key → users.id |
| workspace_id | uuid | Foreign key → workspaces.id |
| token | text | Unique, not null |
| expires_at | timestamptz | Not null |
| created_at | timestamptz | Default: now() |

> **Note:** If using Supabase Auth natively, session management is handled automatically. The `sessions` table above applies if building a custom session layer.

---

### 4.2 Row-Level Security (Data Scoping)

Every table that contains workspace-specific data must have a Postgres Row-Level Security (RLS) policy applied:

```sql
-- Example: workspace_members
CREATE POLICY "Users can only see members of their workspace"
ON workspace_members
FOR SELECT
USING (workspace_id = current_user_workspace_id());
```

This is the mechanism that makes data isolation bulletproof. It must be applied to every future table as well (contacts, deals, courses, etc.).

---

## 5. Feature Requirements

### 5.1 Landing Page — Marketing Homepage

**Route:** `/`
**Access:** Fully public (no redirect for logged-in users, but show "Go to Dashboard" in nav if session exists)

The landing page is the first thing any visitor sees. Its only job is to communicate what the platform does and convert visitors into signups.

**Navigation bar:**
- Left: Platform logo
- Centre: Nav links — Features, Pricing, About (smooth scroll or separate pages)
- Right: "Log In" link + "Get Started" CTA button (primary, blue)
- If user is already logged in: replace auth buttons with "Go to Dashboard" button

**Hero section:**
- Headline (large, bold): value proposition — e.g. *"The all-in-one CRM + LMS for modern teams"*
- Subheadline: one-sentence description of what the platform does
- Two CTA buttons: "Start for Free" (primary) → `/signup`, "See how it works" (secondary, outline) → smooth scroll to Features
- Hero image or illustration on the right (placeholder in Phase 1)

**Features section:**
- Section heading: "Everything you need in one place"
- 3–6 feature cards in a grid, each with: icon, feature name, one-sentence description
- Phase 1 feature highlights: CRM contacts, pipelines, team management, course builder (mark LMS as "Coming Soon" if not yet built)

**Social proof section (placeholder in Phase 1):**
- Heading: "Trusted by teams like yours"
- 3 placeholder testimonial cards with dummy name, role, and quote
- Note in code: replace with real testimonials in Phase 2+

**Pricing preview section:**
- Brief mention of free plan with a "See full pricing" link → `/pricing`
- Or embed the full pricing table (see 5.2 below)

**Footer:**
- Logo + tagline
- Links: Features, Pricing, About, Privacy Policy, Terms of Service
- Copyright line

---

### 5.2 Pricing Page

**Route:** `/pricing`
**Access:** Fully public

**Layout:**
- Page heading: "Simple, transparent pricing"
- Subheading: "Start free. Upgrade when you're ready."
- Billing toggle: Monthly / Annual (annual shows discount badge e.g. "Save 20%")

**Pricing tiers (3 columns):**

| Tier | Price | Target |
|---|---|---|
| Free | $0/month | Individuals, getting started |
| Pro | $X/month | Small teams |
| Enterprise | Custom | Large organisations |

Each pricing card includes:
- Plan name and price
- Short description of who it's for
- Feature list (bullet points with check icons)
- CTA button: Free → "Get Started" (`/signup`), Pro → "Start Free Trial" (`/signup`), Enterprise → "Contact Us" (`/contact`)
- Most popular badge on the recommended plan

**FAQ section:**
- 5–8 common questions about pricing, billing, cancellation, and data
- Accordion/collapsible format

---

### 5.3 About Page

**Route:** `/about`
**Access:** Fully public

**Sections:**
- **Mission statement** — one paragraph on why the platform exists
- **The team** — placeholder cards (name, role, avatar) in Phase 1; replace with real team photos later
- **Company values** — 3–4 short value statements with icons
- **CTA banner** — "Ready to get started?" with a "Sign Up Free" button → `/signup`

---

### 5.4 Contact Page

**Route:** `/contact`
**Access:** Fully public

**Content:**
- Page heading: "Get in touch"
- Contact form with fields: Name, Email, Subject (dropdown: General, Sales, Support, Partnership), Message textarea, Submit button
- On submit: send email to support inbox via Resend, show success message: *"Thanks! We'll get back to you within 1 business day."*
- Alternatively: embed a link to an external support tool (e.g. Crisp, Intercom) if preferred

---

### 5.5 Privacy Policy Page

**Route:** `/privacy`
**Access:** Fully public

**Content:**
- Standard privacy policy covering: data collected, how it is used, third-party services (Supabase, Resend), cookies, user rights, contact details for data requests
- Plain English format
- Last updated date at the top
- Note: a lawyer should review this before launch. Use a privacy policy generator (e.g. Termly, iubenda) as a starting point.

---

### 5.6 Terms of Service Page

**Route:** `/terms`
**Access:** Fully public

**Content:**
- Standard SaaS terms covering: acceptable use, account responsibility, payment terms, cancellation, limitation of liability, governing law
- Last updated date at the top
- Note: a lawyer should review this before launch.

---

### 5.7 Signup — New User Creates an Account

**Route:** `/signup`  
**Access:** Public only (redirect to `/dashboard` if already logged in)

**Form fields:**
- Full Name (required)
- Email address (required, validated format)
- Password (required, minimum 8 characters)
- Confirm Password (required, must match Password)

**On submission:**
1. Validate all fields client-side before submit
2. Check if email already exists — if yes, show: *"An account with this email already exists"*
3. Hash the password
4. Write a new `users` record
5. Write a new `workspaces` record with the user as owner
6. Write a new `workspace_members` record with role `admin`
7. Create a session
8. Redirect to `/dashboard`

**UI states:**
- Loading spinner on button while submitting
- Inline validation errors under each field
- Generic success: redirect (no success message needed)

---

### 5.8 Login — Returning User Logs In

**Route:** `/login`  
**Access:** Public only (redirect to `/dashboard` if already logged in)

**Form fields:**
- Email address (required)
- Password (required)
- Remember me (checkbox)
- Forgot password link → `/forgot-password`

**On submission:**
1. Validate credentials against database
2. On failure: show *"Email or password is incorrect"* — do not indicate which field is wrong
3. On success with one workspace: create session, redirect to `/dashboard`
4. On success with multiple workspaces: show workspace picker modal
5. Store `workspace_id` in session

**Workspace picker modal:**
- Lists all workspaces the user belongs to
- Shows workspace name, logo, and user's role in each
- Clicking a workspace enters it and redirects to `/dashboard`
- Remembers last-used workspace for next login

---

### 5.9 Forgot Password — Reset Flow

**Route:** `/forgot-password` and `/reset-password`  
**Access:** Public only

**Page 1 — Request reset (`/forgot-password`):**
- Email input field
- On submit: generate a unique token, store with `expires_at = now() + 1 hour`, send email with reset link
- Always show: *"If an account exists with this email, a reset link has been sent"* — never reveal whether the email is registered
- Link in email format: `yourdomain.com/reset-password?token=XYZ`

**Page 2 — Set new password (`/reset-password`):**
- New Password field (minimum 8 characters)
- Confirm New Password field
- On load: validate the token from URL — if expired or already used, show: *"This link has expired. Please request a new one."*
- On success: update password hash, mark token as used (`accepted_at = now()`), log user in, redirect to `/dashboard`

---

### 5.10 Dashboard Shell — Main App Wrapper

**Route:** `/dashboard` and all sub-routes  
**Access:** Must be logged in

**Layout structure:**

```
┌─────────────┬──────────────────────────────┐
│             │ TOP BAR (60px)               │
│  SIDEBAR    ├──────────────────────────────│
│  (240px)    │                              │
│             │  MAIN CONTENT AREA           │
│             │  (padding: 32px)             │
│             │                              │
└─────────────┴──────────────────────────────┘
```

**Sidebar (`#1E2532` background, white text/icons):**
- Top: platform logo / workspace logo
- Nav links: Dashboard, Contacts (disabled in Phase 1), Team Members, Settings
- Bottom: logged-in user avatar + first name + Logout button
- Active item: blue background highlight
- Mobile: collapses to hamburger menu

**Top bar (white, 1px bottom border):**
- Left: current page title
- Right: workspace name badge + user avatar with initials

**Security check:** If no valid session exists, redirect immediately to `/login` before any page content renders.

---

### 5.11 Workspace Settings

**Route:** `/settings/workspace`  
**Access:** Admin only

**Sections:**

**General Settings**
- Workspace Name — editable text input with Save button
- Workspace Slug — editable, shown with explanation of where it appears in the URL

**Branding**
- Logo upload — drag and drop or click, accepts PNG/JPG, shows current logo preview

**Plan & Billing**
- Current plan badge (e.g. "Free Plan")
- Plan features list
- Upgrade button — disabled with "Coming Soon" label in Phase 1

**Danger Zone**
- Delete Workspace button (red, outlined)
- Confirmation modal: user must type workspace name to confirm
- Action is irreversible

**Access control:** If logged-in user's role is not `admin`, show "Access Denied" and hide all form content.

---

### 5.12 Team Member Management

**Route:** `/settings/team`  
**Access:** Admin only

**Invite section:**
- Email input + Role dropdown (Admin / Team Member) + Send Invite button (inline row)
- Pending invites list below: email, role, date sent, Resend link, Cancel link

**Invitation flow:**
1. Admin enters email and role, clicks Send
2. System generates a unique token, creates an `invitations` record with 48-hour expiry
3. Resend sends an invitation email with the accept link
4. If invitee already has an account: clicking link adds them to workspace directly
5. If invitee has no account: they are prompted to sign up first, then added to workspace
6. If link is expired: show "This invitation has expired. Ask the workspace admin to send a new one."
7. If user is already a workspace member: show "You are already a member of this workspace."

**Team members table columns:**
- Avatar + Name
- Email
- Role (pill badge: Admin = blue, Member = grey)
- Joined Date
- Actions: Change Role dropdown, Remove button

**Role change rules:**
- Only Admins can change roles
- An Admin cannot demote themselves

**Remove member rules:**
- Confirmation modal required before removal
- An Admin cannot remove themselves

**Empty state:** If no members besides the Admin, show a prompt to send the first invite.

---

### 5.13 User Account Settings

**Route:** `/settings/account`  
**Access:** All logged-in users regardless of role

**Profile section:**
- Circular avatar upload (click or drag and drop)
- First Name (editable)
- Last Name (editable)
- Email (read-only, with note: "Contact support to change your email")
- Save Profile button

**Change password section:**
- Current Password field
- New Password field (minimum 8 characters)
- Confirm New Password field
- On wrong current password: *"Current password is incorrect"*
- On mismatch: error under Confirm field
- On success: green success banner *"Password updated successfully"*

**Your Workspaces section:**
- List of all workspaces this user belongs to
- Each row: workspace logo, name, user's role, "Switch to this workspace" button
- Link at bottom: "Create a new workspace"

---

### 5.14 Route Protection

Implemented in a single `middleware.ts` file that runs before every page load.

**Protection levels:**

| Level | Behaviour |
|---|---|
| Public only | Redirect to `/dashboard` if user is already logged in |
| Must be logged in | Redirect to `/login` if no valid session |
| Admin only | Redirect to `/dashboard` with toast error if user is not Admin |

**Route map:**

| Route | Protection Level |
|---|---|
| `/` | Fully public (show "Go to Dashboard" if logged in) |
| `/pricing` | Fully public |
| `/about` | Fully public |
| `/contact` | Fully public |
| `/privacy` | Fully public |
| `/terms` | Fully public |
| `/login` | Public only (redirect to `/dashboard` if logged in) |
| `/signup` | Public only (redirect to `/dashboard` if logged in) |
| `/forgot-password` | Public only (redirect to `/dashboard` if logged in) |
| `/reset-password` | Public only (redirect to `/dashboard` if logged in) |
| `/dashboard` | Must be logged in |
| `/settings/account` | Must be logged in |
| `/settings/workspace` | Must be logged in + Admin only |
| `/settings/team` | Must be logged in + Admin only |

**Additional:** A `/403` page must exist with a friendly access denied message and a button returning to `/dashboard`.

**Toast error message for unauthorised access:** *"You don't have permission to access this page."*

---

## 6. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| Security | Passwords must be hashed (bcrypt or Supabase Auth default). Reset tokens must be single-use and time-limited. Session tokens must be invalidated on logout. |
| Data isolation | Row-Level Security must be enforced at the database level, not just the application level. |
| Performance | All auth operations (login, token validation) must complete in under 500ms. |
| Email delivery | Invitation and password reset emails must deliver within 60 seconds. |
| Mobile responsiveness | All pages must be usable on screens 375px and wider. Sidebar collapses on mobile. |
| Error handling | All user-facing error messages must be generic enough to not leak system information (e.g. never reveal whether an email is registered). |
| Session expiry | Sessions expire after 30 days. "Remember me" extends to 90 days. |

---

## 7. Page & Route Index

| Page | Route | Access Level |
|---|---|---|
| Landing Page | `/` | Fully public |
| Pricing | `/pricing` | Fully public |
| About | `/about` | Fully public |
| Contact | `/contact` | Fully public |
| Privacy Policy | `/privacy` | Fully public |
| Terms of Service | `/terms` | Fully public |
| Signup | `/signup` | Public only |
| Login | `/login` | Public only |
| Forgot Password | `/forgot-password` | Public only |
| Reset Password | `/reset-password` | Public only |
| Dashboard | `/dashboard` | Logged in |
| Workspace Settings | `/settings/workspace` | Admin only |
| Team Members | `/settings/team` | Admin only |
| Account Settings | `/settings/account` | Logged in |
| Access Denied | `/403` | Public |

---

## 8. Folder Structure

```
/app
  /(marketing)               ← public pages layout (no sidebar)
    /page.tsx                ← landing page /
    /pricing
    /about
    /contact
    /privacy
    /terms
  /(auth)                    ← auth pages (no sidebar, redirect if logged in)
    /login
    /signup
    /forgot-password
    /reset-password
  /(dashboard)               ← protected pages (dashboard shell wrapper)
    /dashboard
    /settings
      /workspace
      /team
      /account
  /403
/components
  /ui                        ← shadcn components
  /marketing
    Navbar.tsx
    Footer.tsx
    HeroSection.tsx
    PricingCard.tsx
    FeatureCard.tsx
    TestimonialCard.tsx
  /layout
    Sidebar.tsx
    TopBar.tsx
    DashboardShell.tsx
  /auth
    LoginForm.tsx
    SignupForm.tsx
    WorkspacePicker.tsx
/lib
  /supabase.ts
  /auth.ts
  /roles.ts
middleware.ts                ← all route protection logic lives here
```

---

## 9. Email Templates

### Invitation Email
- **Subject:** `[Workspace Name] has invited you to join`
- **Content:** Who invited them, which workspace, their assigned role, a CTA button linking to the accept URL
- **Expiry note:** "This invitation expires in 48 hours."

### Password Reset Email
- **Subject:** `Reset your password`
- **Content:** A CTA button with the reset URL
- **Expiry note:** "This link expires in 1 hour and can only be used once."

---

### Contact Form Email
- **Subject:** `New contact form submission — [Subject]`
- **Content:** Sender name, email, subject, and message body
- **Recipient:** Platform support inbox
- **Auto-reply to sender:** *"Thanks for reaching out! We'll get back to you within 1 business day."*

---

## 10. Phase 1 Completion Checklist

| # | Task | Verification |
|---|---|---|
| 1 | Landing page loads | `/` renders hero, features, pricing preview, and footer correctly |
| 2 | Landing page nav CTA | "Get Started" → `/signup`, "Log In" → `/login`, logo → `/` |
| 3 | Logged-in landing page nav | Logged-in user sees "Go to Dashboard" instead of auth buttons |
| 4 | Pricing page renders | All 3 tiers display with correct features and CTA buttons |
| 5 | Billing toggle works | Monthly/Annual switch updates displayed prices |
| 6 | About page loads | Mission, team placeholders, and values section render |
| 7 | Contact form submits | Form submission sends email to support inbox and shows success message |
| 8 | Privacy Policy loads | Page content renders, last updated date visible |
| 9 | Terms of Service loads | Page content renders, last updated date visible |
| 10 | Footer links work | All footer links navigate to correct pages |
| 11 | Signup creates user + workspace | Both records exist in database after signup |
| 12 | Login works | Correct credentials → dashboard. Wrong credentials → generic error |
| 13 | Multi-workspace picker | User in 2 workspaces sees picker on login |
| 14 | Forgot password email sends | Reset link arrives in inbox |
| 15 | Password reset works | New password accepted, old password rejected |
| 16 | Reset link single-use | Second click shows expired message |
| 17 | Dashboard shell loads | Sidebar, top bar, content area all render post-login |
| 18 | Sidebar shows current user | First name and avatar initials visible in sidebar |
| 19 | Workspace settings: Admin only | Team Member sees Access Denied at `/settings/workspace` |
| 20 | Workspace settings: save works | Name change persists after page reload |
| 21 | Logo upload works | Logo appears in sidebar after upload |
| 22 | Invite team member | Invite email received by invitee |
| 23 | Accept invitation | Invitee added to workspace with correct role |
| 24 | Team list shows all members | All accepted members appear with correct data |
| 25 | Remove team member | Removed user loses workspace access |
| 26 | Role change works | Promoted user gains Admin access to restricted pages |
| 27 | Account settings saves | Name and photo persist after reload |
| 28 | Change password works | Old password rejected after change |
| 29 | Logged-out redirect | Navigating to `/dashboard` while logged out → `/login` |
| 30 | Logged-in redirect | Navigating to `/login` while logged in → `/dashboard` |
| 31 | Logout clears session | Post-logout, `/dashboard` redirects to `/login` |
| 32 | Data isolation | Workspace A's data is never visible in Workspace B |

---

## 11. Out of Scope for Phase 1

The following are explicitly not part of this phase and should not be built yet:

- CRM Contacts and Pipelines
- Email sending / campaigns
- Workflows and automations
- Courses and LMS features
- Billing and subscription management (UI placeholder only)
- Client portal login
- API key management
- Audit logs
- Two-factor authentication

---

## 12. Dependencies & Risks

| Item | Detail |
|---|---|
| Email service configuration | Resend (or equivalent) must be configured before invitation and reset flows can be tested. Without this, Steps 3 and 6 cannot be verified. |
| Supabase project setup | A Supabase project must exist with the correct tables and RLS policies before any frontend work can be connected. |
| Environment variables | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `RESEND_API_KEY`, and `NEXTAUTH_SECRET` must be set in `.env.local` before the app runs. |
| Data isolation risk | If RLS is not configured at the database level, data scoping is only enforced in the application layer — which is insufficient. RLS must be verified independently. |

---

*Phase 1 Build Guide — Auth & Multi-Tenant | SaaS CRM + LMS Platform | April 2026*
