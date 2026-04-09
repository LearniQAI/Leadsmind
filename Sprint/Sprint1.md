# Sprint 1 — Public Marketing Pages (Part 1)

**Theme:** Build the visitor-facing entry points — the pages any potential customer sees before signing up.  
**Dependency:** Sprint 0 complete.

---

**Task 1.1 — Build Navbar and Footer components [COMPLETED]**

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

**Task 1.2 — Build the Landing Page (`/`) [COMPLETED]**

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
