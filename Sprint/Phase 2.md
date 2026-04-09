# Sprint 7 — User Account Settings & Final QA

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

**PRD checklist items closed this sprint:** #27 (account settings save), #28 (change password), #32 (data isolation — final verification), and all remaining open items
