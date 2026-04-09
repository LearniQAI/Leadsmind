# Sprint 4 — Authentication: Password Reset & Route Protection

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
