# Sprint 3 — Authentication: Signup & Login

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
