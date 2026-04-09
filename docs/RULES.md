# AI Development Rules
## SaaS CRM + LMS Platform — Phase 1

> This file is the single source of truth for how code must be written in this project.
> Read this file in full before writing any code. Follow every rule without exception.
> When in doubt, refer back here before making a decision.

---

## 1. Project Context

You are building Phase 1 of a multi-tenant SaaS CRM + LMS platform. The full spec lives in:
- `PRD_Phase1_Auth_Multitenant.md` — feature requirements, routes, data model, checklist
- `design-tokens.md` — all colours, typography, spacing, shadows, radii
- `sprint-plan.md` — task breakdown with acceptance criteria

**Tech stack:**
- Framework: Next.js 14 (App Router)
- Language: TypeScript (strict mode — no `any`)
- Styling: Tailwind CSS v4 with custom CSS variables
- Components: shadcn/ui
- Database: Supabase (Postgres)
- Auth: Supabase Auth
- Email: Resend
- Font: Poppins (all weights via Google Fonts)

**Never suggest replacing any part of this stack.** If a library is needed that is not listed, ask before installing it.

---

## 2. TypeScript Rules

### 2.1 Strict typing always
```typescript
// ✅ CORRECT
interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: 'admin' | 'member' | 'client'
  joinedAt: string
}

// ❌ WRONG — never use any
const member: any = {}

// ❌ WRONG — never use implicit any
function getRole(member) { return member.role }
```

### 2.2 Define types for everything
- Every function parameter must be typed
- Every function return type must be declared explicitly
- Every API response must be typed — never trust raw JSON
- All Supabase query results must be typed using the generated database types

### 2.3 Use union types for roles and statuses — never raw strings
```typescript
// ✅ CORRECT
type UserRole = 'admin' | 'member' | 'client'
type InvitationStatus = 'pending' | 'accepted' | 'expired'

// ❌ WRONG
const role = 'admin' // untyped literal used inline
```

### 2.4 Use `interface` for object shapes, `type` for unions and primitives
```typescript
// ✅ interfaces for data shapes
interface User {
  id: string
  email: string
  firstName: string
}

// ✅ types for unions
type Theme = 'light' | 'dark'
```

### 2.5 Never use non-null assertion (`!`) without a comment explaining why it is safe
```typescript
// ✅ Acceptable only with explanation
const userId = session.user!.id // Safe: session is validated before this point

// ❌ Never
const userId = user!.id
```

---

## 3. File and Folder Structure Rules

Always place files in the correct location. Never create files outside the established structure.

```
/app
  /(marketing)       — public pages: /, /pricing, /about, /contact, /privacy, /terms
  /(auth)            — auth pages: /login, /signup, /forgot-password, /reset-password
  /(dashboard)       — protected pages: /dashboard, /settings/*
  /api               — API routes (server-side only)
  /403               — access denied page
/components
  /ui                — shadcn/ui components only, never modified
  /marketing         — Navbar, Footer, HeroSection, PricingCard, etc.
  /layout            — DashboardShell, Sidebar, TopBar
  /auth              — LoginForm, SignupForm, WorkspacePicker
  /shared            — components used across multiple sections
/lib
  supabase.ts        — Supabase client (browser + server)
  auth.ts            — session helpers, getSession, requireAuth, requireAdmin
  roles.ts           — role constants and permission helpers
  email.ts           — sendEmail() wrapper around Resend
/emails              — React Email templates: invitation, password-reset, contact-form
/types               — global TypeScript types and interfaces
/docs                — QA results, notes
middleware.ts        — route protection — this file only, never split
```

### File naming rules
- Pages: `page.tsx` (Next.js convention — never rename)
- Layouts: `layout.tsx`
- Components: `PascalCase.tsx` — e.g. `WorkspacePicker.tsx`
- Utilities/helpers: `camelCase.ts` — e.g. `supabase.ts`, `auth.ts`
- Types: `camelCase.types.ts` — e.g. `workspace.types.ts`
- API routes: `route.ts` (Next.js convention — never rename)

---

## 4. Component Rules

### 4.1 Always use shadcn/ui components — never build from scratch what shadcn provides
```typescript
// ✅ Use shadcn Dialog for modals
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// ❌ Never build a custom modal div from scratch
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
```

Available shadcn components to use: Button, Input, Label, Card, Dialog, AlertDialog, DropdownMenu, Select, Tabs, Toast/Sonner, Badge, Avatar, Separator, Accordion, Form, Tooltip, Popover.

### 4.2 Component structure — always in this order
```typescript
// 1. Imports (external libraries first, then internal)
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { WorkspaceMember } from '@/types/workspace.types'

// 2. Types/interfaces for this component's props
interface TeamMemberRowProps {
  member: WorkspaceMember
  currentUserRole: UserRole
  onRoleChange: (memberId: string, newRole: UserRole) => Promise<void>
  onRemove: (memberId: string) => Promise<void>
}

// 3. Component function (named, never anonymous default exports)
export function TeamMemberRow({ member, currentUserRole, onRoleChange, onRemove }: TeamMemberRowProps) {
  // 4. State declarations
  const [isLoading, setIsLoading] = useState(false)

  // 5. Derived values / computed data
  const isCurrentUser = member.userId === currentUserId
  const canChangeRole = currentUserRole === 'admin' && !isCurrentUser

  // 6. Event handlers
  async function handleRoleChange(newRole: UserRole) { ... }
  async function handleRemove() { ... }

  // 7. JSX return
  return ( ... )
}
```

### 4.3 Every component that fetches data must handle three states
```typescript
// ✅ CORRECT — always handle loading, error, and success
if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage message={error.message} />
return <TeamTable members={members} />

// ❌ WRONG — never render with undefined data
return <TeamTable members={members} /> // members could be undefined
```

### 4.4 Loading states on every interactive element
```typescript
// ✅ Every button that triggers an async action must show a loading state
<Button disabled={isLoading} onClick={handleSubmit}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : (
    'Save Changes'
  )}
</Button>
```

### 4.5 Empty states must be explicit and friendly
```typescript
// ✅ Always handle empty arrays
{members.length === 0 ? (
  <EmptyState
    title="No team members yet"
    description="Invite your first team member above."
  />
) : (
  <TeamTable members={members} />
)}
```

---

## 5. Styling Rules

### 5.1 Design tokens only — never hardcode colours, never use arbitrary Tailwind values for colours
```typescript
// ✅ CORRECT — use semantic token classes
<div className="bg-card text-card-foreground border border-border rounded-lg shadow-sm">

// ❌ WRONG — never hardcode hex or RGB
<div style={{ backgroundColor: '#1E2532' }}>

// ❌ WRONG — never use arbitrary Tailwind colour values
<div className="bg-[#1E2532]">

// ❌ WRONG — never use Tailwind's built-in colour palette directly
<div className="bg-blue-600 text-white">
```

### 5.2 Use the token map — always refer to `design-tokens.md` for the correct token per element

| Element | Required token |
|---|---|
| Page background | `bg-background` |
| Body text | `text-foreground` |
| Cards | `bg-card text-card-foreground border-border` |
| Primary button | `bg-primary text-primary-foreground` |
| Secondary button | `bg-secondary text-secondary-foreground` |
| Destructive button | `bg-destructive text-destructive-foreground` |
| Inputs | `border-input bg-background` |
| Placeholder text | `text-muted-foreground` |
| Disabled elements | `bg-muted text-muted-foreground` |
| Sidebar | `bg-sidebar text-sidebar-foreground` |
| Active nav item | `bg-sidebar-primary text-sidebar-primary-foreground` |

### 5.3 Spacing must use Tailwind's scale — never arbitrary pixel values
```typescript
// ✅ CORRECT
<div className="p-6 gap-4 mt-8">

// ❌ WRONG
<div style={{ padding: '24px', gap: '16px' }}>

// ❌ WRONG
<div className="p-[24px]">
```

### 5.4 Always mobile-first — write base styles for mobile, then add `md:` and `lg:` overrides
```typescript
// ✅ CORRECT — mobile first
<div className="flex flex-col gap-4 md:flex-row md:gap-6 lg:gap-8">

// ❌ WRONG — desktop first
<div className="flex flex-row gap-8 sm:flex-col">
```

### 5.5 Dark mode — use `dark:` variants for any value that must differ in dark mode
```typescript
// ✅ CORRECT — if a value doesn't invert automatically via CSS variables, add dark: variant
<div className="border border-border dark:border-border">
// Note: most CSS variable tokens handle dark mode automatically — only add dark: when needed
```

### 5.6 Never use inline styles except for truly dynamic values (e.g. calculated widths)
```typescript
// ✅ Acceptable — dynamic value that cannot be a Tailwind class
<div style={{ width: `${progressPercent}%` }}>

// ❌ Never — static values must be Tailwind classes
<div style={{ padding: '16px', color: 'red' }}>
```

---

## 6. Supabase Rules

### 6.1 Always use the correct client — never mix browser and server clients
```typescript
// For Server Components, Server Actions, API Routes:
import { createServerClient } from '@/lib/supabase'

// For Client Components (browser):
import { createBrowserClient } from '@/lib/supabase'
```

### 6.2 Always handle Supabase errors explicitly — never assume success
```typescript
// ✅ CORRECT
const { data, error } = await supabase
  .from('workspace_members')
  .select('*')
  .eq('workspace_id', workspaceId)

if (error) {
  console.error('Failed to fetch workspace members:', error.message)
  throw new Error('Could not load team members')
}

return data

// ❌ WRONG — never destructure without checking error
const { data } = await supabase.from('workspace_members').select('*')
return data // data could be null if there was an error
```

### 6.3 Always filter by workspace_id — never query without it on workspace-scoped data
```typescript
// ✅ CORRECT — always scope to the workspace
const { data } = await supabase
  .from('workspace_members')
  .select('*')
  .eq('workspace_id', workspaceId) // always required

// ❌ WRONG — missing workspace scope = data leak risk
const { data } = await supabase
  .from('workspace_members')
  .select('*')
```

### 6.4 Never expose the service role key to the browser — ever
- `SUPABASE_SERVICE_ROLE_KEY` is only used in API routes and Server Actions
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the only key that can appear in client-side code
- Never import `/lib/supabase` server client inside a `'use client'` component

### 6.5 Use database types — generate and import them
```typescript
// ✅ Always type Supabase responses with generated types
import type { Database } from '@/types/supabase.types'
type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row']

// ❌ Never type Supabase responses manually when generated types exist
interface WorkspaceMember { id: string; ... } // redundant, can drift from schema
```

### 6.6 All mutations must happen in Server Actions or API routes — never directly from client components
```typescript
// ✅ CORRECT — mutation in a Server Action
'use server'
export async function inviteMember(email: string, role: UserRole) {
  const supabase = createServerClient()
  const { error } = await supabase.from('invitations').insert({ ... })
  if (error) throw new Error('Failed to send invitation')
}

// ❌ WRONG — never mutate from a client component directly
'use client'
async function handleInvite() {
  const supabase = createBrowserClient()
  await supabase.from('invitations').insert({ ... }) // bypasses server validation
}
```

---

## 7. Authentication & Security Rules

### 7.1 Every protected page must verify session server-side — never rely on client-side checks alone
```typescript
// ✅ CORRECT — verify in the Server Component before rendering
export default async function WorkspaceSettingsPage() {
  const user = await requireAuth()       // redirects to /login if no session
  const role = await requireAdmin()      // redirects to /dashboard if not admin
  return <WorkspaceSettingsForm />
}
```

### 7.2 The `middleware.ts` is the first line of defence — but not the only one
- `middleware.ts` handles redirects for unauthenticated/unauthorised users
- Server Components must still call `requireAuth()` or `requireAdmin()` — middleware can be bypassed in edge cases
- Never assume a page is safe because middleware exists

### 7.3 Never expose sensitive data in client components
- Never pass `password_hash`, `token`, or `service_role_key` to client components
- Never log sensitive data to the console in production
- Use `console.error` only for errors, never for data inspection in production code

### 7.4 Password rules — enforced consistently everywhere
- Minimum 8 characters — enforced on signup, reset, and change password
- Hashing is handled by Supabase Auth — never hash manually
- Never store, log, or transmit plain text passwords

### 7.5 Token rules — for invitation and password reset tokens
- Tokens must be UUIDs generated with `crypto.randomUUID()` — never predictable strings
- Tokens must have an `expires_at` set — invitation: 48 hours, reset: 1 hour
- Tokens must be marked `accepted_at = now()` immediately on use
- Every token validation must check: exists + not expired + not already accepted

### 7.6 Error messages must never reveal internal state
```typescript
// ✅ CORRECT — generic message
throw new Error('Email or password is incorrect')

// ❌ WRONG — reveals whether email exists
throw new Error('No account found with this email address')
throw new Error('Wrong password for this account')
```

---

## 8. API Route Rules

### 8.1 Every API route must validate its input before doing anything
```typescript
// ✅ CORRECT
export async function POST(request: Request) {
  const body = await request.json()

  if (!body.email || typeof body.email !== 'string') {
    return Response.json({ error: 'Email is required' }, { status: 400 })
  }

  if (!body.role || !['admin', 'member'].includes(body.role)) {
    return Response.json({ error: 'Invalid role' }, { status: 400 })
  }

  // proceed with validated data
}
```

### 8.2 Every API route must verify authentication before processing
```typescript
export async function POST(request: Request) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return Response.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // proceed
}
```

### 8.3 API routes must return consistent response shapes
```typescript
// ✅ Success
return Response.json({ success: true, data: result }, { status: 200 })

// ✅ Error
return Response.json({ success: false, error: 'Human-readable message' }, { status: 400 })

// ❌ Never return raw error objects or stack traces
return Response.json({ error: err }, { status: 500 }) // could expose internals
```

### 8.4 HTTP status codes must be correct
| Situation | Status code |
|---|---|
| Success with data | 200 |
| Created a resource | 201 |
| No content to return | 204 |
| Bad input / validation failed | 400 |
| Not authenticated | 401 |
| Authenticated but not authorised | 403 |
| Resource not found | 404 |
| Server error | 500 |

---

## 9. Form and Validation Rules

### 9.1 Use React Hook Form + Zod for all forms — never build custom validation logic
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'member'], { required_error: 'Please select a role' }),
})

type InviteFormValues = z.infer<typeof inviteSchema>
```

### 9.2 Validation schemas must be defined outside the component and reused
```typescript
// ✅ Define at module level, reuse in component and API route
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
```

### 9.3 Error messages must be user-friendly — no technical jargon
```typescript
// ✅ CORRECT
email: z.string().email('Please enter a valid email address')
password: z.string().min(8, 'Password must be at least 8 characters')

// ❌ WRONG — Zod default messages are too technical
email: z.string().email() // shows "Invalid email"
```

### 9.4 Disable submit button while form is submitting — always
```typescript
const { formState: { isSubmitting } } = useForm()

<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save Changes'}
</Button>
```

---

## 10. Error Handling Rules

### 10.1 Use try/catch on every async operation
```typescript
// ✅ CORRECT
try {
  await inviteMember(email, role)
  toast.success('Invitation sent')
} catch (error) {
  toast.error(error instanceof Error ? error.message : 'Something went wrong')
}

// ❌ WRONG — unhandled promise
inviteMember(email, role)
```

### 10.2 User-facing errors must use toast notifications — not alert() or console.log()
```typescript
// ✅ CORRECT — use sonner toast (included with shadcn)
import { toast } from 'sonner'

toast.success('Profile updated')
toast.error('Failed to save. Please try again.')

// ❌ WRONG
alert('Saved!')
console.log('Error:', error)
```

### 10.3 Distinguish between user errors and system errors in toast messages
```typescript
// User error (their input was wrong) — tell them what to fix
toast.error('An account with this email already exists')

// System error (our fault) — generic message, log internally
console.error('Supabase insert failed:', error)
toast.error('Something went wrong. Please try again.')
```

### 10.4 Every page must have an error boundary
- Use Next.js `error.tsx` files in each route segment
- The error boundary must show a friendly message and a "Try again" or "Go to Dashboard" button
- Never let an error render a blank or broken page

---

## 11. Server vs Client Component Rules

### 11.1 Default to Server Components — only add `'use client'` when required
Use `'use client'` only when the component needs:
- `useState` or `useReducer`
- `useEffect`
- Browser APIs (`window`, `document`, `localStorage`)
- Event handlers (`onClick`, `onChange`, etc.)
- shadcn interactive components that require client hooks

### 11.2 Data fetching happens in Server Components — never in useEffect
```typescript
// ✅ CORRECT — fetch in a Server Component
export default async function TeamPage() {
  const members = await getWorkspaceMembers(workspaceId)
  return <TeamTable members={members} />
}

// ❌ WRONG — never fetch in useEffect
useEffect(() => {
  fetch('/api/members').then(r => r.json()).then(setMembers)
}, [])
```

### 11.3 Server Actions for mutations — never raw fetch() calls to your own API from client components
```typescript
// ✅ CORRECT — call a Server Action
import { inviteMember } from '@/app/actions/team'
await inviteMember(email, role)

// ❌ WRONG — fetch to your own API route from a client component
await fetch('/api/invitations/send', { method: 'POST', body: JSON.stringify({ email, role }) })
```

---

## 12. Email Rules

### 12.1 All emails must use React Email templates — never build HTML strings
```typescript
// ✅ CORRECT
import { InvitationEmail } from '@/emails/invitation'
import { render } from '@react-email/render'

const html = render(<InvitationEmail workspaceName={name} inviteUrl={url} role={role} />)
```

### 12.2 Every email template must have these props typed
```typescript
interface InvitationEmailProps {
  workspaceName: string
  inviterName: string
  inviteUrl: string
  role: UserRole
  expiresIn: string // e.g. "48 hours"
}
```

### 12.3 Never hardcode the app URL in email templates — always use the environment variable
```typescript
// ✅ CORRECT
const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${token}`

// ❌ WRONG
const inviteUrl = `https://myapp.com/invite/accept?token=${token}`
```

---

## 13. Naming Conventions

### Variables and functions
```typescript
// camelCase for variables and functions
const workspaceId = '...'
function getCurrentUser() {}
async function handleSubmit() {}
```

### Constants
```typescript
// SCREAMING_SNAKE_CASE for true constants
const MAX_FILE_SIZE_MB = 5
const INVITATION_EXPIRY_HOURS = 48
const PASSWORD_MIN_LENGTH = 8
```

### Types and interfaces
```typescript
// PascalCase
interface WorkspaceMember {}
type UserRole = 'admin' | 'member' | 'client'
```

### Database column references in code
```typescript
// Always use camelCase in TypeScript even though Postgres uses snake_case
// The Supabase type generator handles this mapping
member.workspaceId  // ✅ TypeScript
// workspace_id     // ✅ SQL only
```

### Boolean variables — always prefix with `is`, `has`, `can`, or `should`
```typescript
// ✅ CORRECT
const isLoading = false
const hasPermission = true
const canRemoveMember = currentUserRole === 'admin'
const shouldShowPicker = workspaces.length > 1

// ❌ WRONG
const loading = false
const permission = true
```

---

## 14. Performance Rules

### 14.1 Images — always use Next.js `<Image>` component, never `<img>`
```typescript
// ✅ CORRECT
import Image from 'next/image'
<Image src={logoUrl} alt="Workspace logo" width={40} height={40} className="rounded-full" />

// ❌ WRONG
<img src={logoUrl} alt="Workspace logo" />
```

### 14.2 Never block the main thread with synchronous operations in components
```typescript
// ✅ CORRECT — use Suspense for async data
<Suspense fallback={<TeamTableSkeleton />}>
  <TeamTable />
</Suspense>
```

### 14.3 Avoid unnecessary re-renders — memoize expensive computations
```typescript
// ✅ Use useMemo for expensive derived values
const sortedMembers = useMemo(
  () => members.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt)),
  [members]
)
```

### 14.4 Skeleton loaders over spinners for content areas
```typescript
// ✅ Use skeleton placeholders for lists and tables
// ❌ Never show a full-page spinner for data that loads section by section
```

---

## 15. Git and Code Quality Rules

### 15.1 Commit messages must follow Conventional Commits format
```
feat: add workspace settings logo upload
fix: prevent admin from demoting themselves
chore: add Resend email helper function
refactor: extract session validation to lib/auth.ts
test: add invitation acceptance flow QA checklist
```

### 15.2 One concern per file — never mix unrelated logic
- A component file contains one component only
- A helper file contains related helpers only — not a dumping ground
- API routes handle one resource only — e.g. `/api/invitations/send` only handles sending invitations

### 15.3 No commented-out code in committed files
- If code is being removed, delete it — git history preserves it
- If code is temporarily disabled, add a `// TODO:` comment explaining why and when it will be re-enabled

### 15.4 Environment variables — never commit real values
- `.env.local` is in `.gitignore` — never commit it
- `.env.example` is committed with placeholder values only
- If a secret is accidentally committed, rotate it immediately

### 15.5 No `console.log` in committed code — only `console.error` for genuine errors
```typescript
// ✅ Acceptable in committed code
console.error('Supabase RLS policy blocked query:', error.message)

// ❌ Remove before committing
console.log('user:', user)
console.log('testing this thing')
```

---

## 16. Accessibility Rules

### 16.1 Every interactive element must be keyboard accessible
- Buttons must be `<button>` elements — never `<div onClick={}>`
- Links must be `<a>` or Next.js `<Link>` elements
- Modals must trap focus and close on Escape key (shadcn Dialog handles this automatically)

### 16.2 Every image must have a meaningful `alt` attribute
```typescript
// ✅ CORRECT
<Image src={avatar} alt={`${member.firstName}'s profile photo`} />
<Image src={logo} alt={`${workspace.name} logo`} />

// ❌ WRONG
<Image src={logo} alt="" />
<Image src={logo} alt="logo" />
```

### 16.3 Form inputs must always have associated labels
```typescript
// ✅ CORRECT — shadcn Form + Label handles this
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email address</FormLabel>
      <FormControl>
        <Input placeholder="you@example.com" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 16.4 Colour contrast — never use muted colours for essential information
- Use `text-muted-foreground` only for helper text and secondary labels
- Error messages must use `text-destructive` — never muted colours
- Active states must be visually distinct (not colour alone — also use bold, border, or icon)

---

## 17. What Never To Do

These are absolute prohibitions. No exceptions, no matter the reason given.

| Never | Why |
|---|---|
| Use `any` in TypeScript | Defeats the purpose of TypeScript — use `unknown` and narrow the type |
| Query Supabase without `workspace_id` filter on scoped data | Data isolation violation — can expose other tenants' data |
| Use `SUPABASE_SERVICE_ROLE_KEY` in client-side code | Security vulnerability — full database access from the browser |
| Use `alert()` or `confirm()` for UI feedback | Blocks the thread, looks unprofessional — use shadcn Dialog or toast |
| Hardcode colours, URLs, or secrets | Breaks design tokens and makes config unmanageable |
| Mutate state without error handling | Silent failures confuse users and hide bugs |
| Skip loading states on async operations | Users think the app is broken — always show feedback |
| Install new packages without checking with the user | Scope creep and potential conflicts |
| Modify files in `/components/ui/` | shadcn components are source-controlled — update via CLI only |
| Write raw HTML strings for emails | Unmaintainable and error-prone — use React Email templates |
| Use `<img>` instead of Next.js `<Image>` | Misses optimisation, LCP impact |
| Push `.env.local` to git | Exposes secrets — rotate immediately if it happens |
| Build custom validation logic instead of Zod | Inconsistent, duplicated, harder to maintain |
| Use `useEffect` for data fetching | Anti-pattern in App Router — use Server Components |
| Leave `console.log` in committed code | Pollutes logs and can leak sensitive data |

---

*AI Rules — Phase 1 Auth & Multi-Tenant | SaaS CRM + LMS Platform | April 2026*
