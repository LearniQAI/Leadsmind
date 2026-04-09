# Sprint 2 — Public Marketing Pages (Part 2) & Legal Pages

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
