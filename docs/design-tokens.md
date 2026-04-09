# Design Tokens
## SaaS CRM + LMS Platform

> Extracted from `globals.css` — use these tokens consistently across all components.  
> All colours use the `oklch()` colour space for perceptual uniformity. Font: **Poppins**.

---

## 1. Colour Tokens

### 1.1 Base / Surface

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--background` | `oklch(1 0 0)` — pure white | `oklch(0.145 0 0)` — near black | Page background |
| `--foreground` | `oklch(0.145 0 0)` — near black | `oklch(0.985 0 0)` — near white | Body text |
| `--card` | `oklch(1 0 0)` — white | `oklch(0.205 0 0)` — dark grey | Card backgrounds |
| `--card-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Text inside cards |
| `--popover` | `oklch(1 0 0)` — white | `oklch(0.269 0 0)` — medium dark | Dropdown / popover bg |
| `--popover-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Text inside popovers |

---

### 1.2 Brand / Interactive

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--primary` | `oklch(0.5866 0.2282 276.74)` — **violet/indigo** | `oklch(0.922 0 0)` — light grey | Primary buttons, links, active states |
| `--primary-foreground` | `oklch(0.985 0 0)` — near white | `oklch(0.205 0 0)` — dark | Text on primary elements |
| `--secondary` | `#fdab3d` — **amber/orange** | `oklch(0.269 0 0)` — dark grey | Secondary buttons, highlights, badges |
| `--secondary-foreground` | `oklch(0.205 0 0)` — dark | `oklch(0.985 0 0)` — near white | Text on secondary elements |
| `--accent` | `oklch(0.6038 0.2419 296.40)` — **purple** | `oklch(0.371 0 0)` — mid grey | Hover states, decorative accents |
| `--accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on accent elements |

> **Brand palette summary:**
> - **Primary:** Violet/Indigo — main CTAs, active nav items, focus rings
> - **Secondary:** Amber `#fdab3d` — secondary actions, warning badges, highlights
> - **Accent:** Purple — hover states, decorative use

---

### 1.3 Semantic

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--destructive` | `oklch(0.577 0.245 27.33)` — **red** | `oklch(0.704 0.191 22.22)` — lighter red | Delete buttons, error states, danger zone |
| `--destructive-foreground` | `oklch(1 0 0)` — white | `oklch(0.985 0 0)` — near white | Text on destructive elements |

---

### 1.4 Neutral / Utility

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--muted` | `oklch(0.970 0 0)` — very light grey | `oklch(0.269 0 0)` — dark grey | Muted backgrounds, disabled states |
| `--muted-foreground` | `oklch(0.556 0 0)` — mid grey | `oklch(0.708 0 0)` — light grey | Placeholder text, secondary labels |
| `--border` | `oklch(0.922 0 0)` — light grey | `oklch(0.275 0 0)` — dark grey | All borders |
| `--input` | `oklch(0.922 0 0)` — light grey | `oklch(0.325 0 0)` — dark | Input field borders/backgrounds |
| `--ring` | `oklch(0.708 0 0)` — mid grey | `oklch(0.556 0 0)` — mid grey | Focus ring on interactive elements |

---

### 1.5 Sidebar

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--sidebar` | `oklch(0.985 0 0)` — near white | `oklch(0.205 0 0)` — dark grey | Sidebar background |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Sidebar text and icons |
| `--sidebar-primary` | `oklch(0.205 0 0)` — dark | `oklch(0.488 0.243 264.38)` — indigo | Active nav item background |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` | Text on active nav item |
| `--sidebar-accent` | `oklch(0.970 0 0)` — light grey | `oklch(0.269 0 0)` — dark grey | Hovered nav item background |
| `--sidebar-accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on hovered nav item |
| `--sidebar-border` | `oklch(0.922 0 0)` | `oklch(0.275 0 0)` | Sidebar dividers and borders |
| `--sidebar-ring` | `oklch(0.708 0 0)` | `oklch(0.439 0 0)` | Focus rings inside sidebar |

> **Note:** The PRD specifies a dark sidebar (`#1E2532`). In dark mode, `--sidebar` maps to `oklch(0.205 0 0)` which is close to this value. For a custom dark sidebar in light mode, override `--sidebar` locally on the sidebar component.

---

### 1.6 Chart / Data Visualisation

| Token | Value | Usage |
|---|---|---|
| `--chart-1` | `oklch(0.810 0.100 252)` — light blue | First data series |
| `--chart-2` | `oklch(0.620 0.190 260)` — medium blue | Second data series |
| `--chart-3` | `oklch(0.550 0.220 263)` — blue/indigo | Third data series |
| `--chart-4` | `oklch(0.490 0.220 264)` — indigo | Fourth data series |
| `--chart-5` | `oklch(0.420 0.180 266)` — deep indigo | Fifth data series |

> Chart colours are the same in both light and dark mode — they are designed to remain legible on any background.

---

## 2. Typography Tokens

| Token | Value | Usage |
|---|---|---|
| `--font-sans` | `Poppins, ui-sans-serif, sans-serif, system-ui` | **Primary font** — all body text, UI labels, headings |
| `--font-serif` | `ui-serif, Georgia, Cambria, Times New Roman, Times, serif` | Reserved — not in primary use |
| `--font-mono` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace` | Code blocks, token display |

> **Poppins** must be loaded via Google Fonts or self-hosted. Add to `layout.tsx`:
> ```html
> <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
> ```

---

## 3. Spacing Token

| Token | Value | Usage |
|---|---|---|
| `--spacing` | `0.25rem` (4px) | Base spacing unit — Tailwind's default spacing scale multiplier |

The platform uses Tailwind's spacing scale. Key values derived from the base:

| Tailwind Class | Value | Common Usage |
|---|---|---|
| `p-2` | 8px | Compact padding (badges, tight elements) |
| `p-4` | 16px | Standard component padding |
| `p-6` | 24px | Card padding |
| `p-8` | 32px | Page/section padding (dashboard content area) |
| `gap-4` | 16px | Standard gap between form fields |
| `gap-6` | 24px | Gap between cards in a grid |

---

## 4. Border Radius Tokens

| Token | Value | Usage |
|---|---|---|
| `--radius` | `0.625rem` (10px) | Base radius |
| `--radius-sm` | `calc(0.625rem - 4px)` = `0.375rem` (6px) | Small elements: badges, tags, chips |
| `--radius-md` | `calc(0.625rem - 2px)` = `0.5rem` (8px) | Inputs, small buttons |
| `--radius-lg` | `0.625rem` (10px) | Cards, modals, panels |
| `--radius-xl` | `calc(0.625rem + 4px)` = `1.0rem` (16px) | Large cards, hero elements |

---

## 5. Shadow Tokens

| Token | Value | Usage |
|---|---|---|
| `--shadow-2xs` | `0 1px 3px 0px hsl(0 0% 0% / 5%)` | Barely-there lift (subtle cards) |
| `--shadow-xs` | `0 1px 3px 0px hsl(0 0% 0% / 5%)` | Same as 2xs — minimal elevation |
| `--shadow-sm` | `0 1px 3px / 10%, 0 1px 2px -1px / 10%` | Default card shadow |
| `--shadow` | `0 1px 3px / 10%, 0 1px 2px -1px / 10%` | Standard shadow |
| `--shadow-md` | `0 1px 3px / 10%, 0 2px 4px -1px / 10%` | Hover state elevation |
| `--shadow-lg` | `0 1px 3px / 10%, 0 4px 6px -1px / 10%` | Dropdowns, floating panels |
| `--shadow-xl` | `0 1px 3px / 10%, 0 8px 10px -1px / 10%` | Modals, dialogs |
| `--shadow-2xl` | `0 1px 3px 0px hsl(0 0% 0% / 25%)` | High-elevation overlays |

Shadow base variables (for custom shadows):

| Variable | Value |
|---|---|
| `--shadow-x` | `0` |
| `--shadow-y` | `1px` |
| `--shadow-blur` | `3px` |
| `--shadow-spread` | `0px` |
| `--shadow-opacity` | `0.1` |
| `--shadow-color` | `oklch(0 0 0)` — black |

---

## 6. Component Token Map

Quick reference — what token to use for common UI elements:

| Component | Background | Text | Border | Shadow |
|---|---|---|---|---|
| Page | `--background` | `--foreground` | — | — |
| Card | `--card` | `--card-foreground` | `--border` | `--shadow-sm` |
| Primary Button | `--primary` | `--primary-foreground` | — | `--shadow-sm` |
| Secondary Button | `--secondary` | `--secondary-foreground` | — | `--shadow-sm` |
| Destructive Button | `--destructive` | `--destructive-foreground` | — | `--shadow-sm` |
| Input field | `--background` | `--foreground` | `--input` | — |
| Input placeholder | — | `--muted-foreground` | — | — |
| Dropdown / Popover | `--popover` | `--popover-foreground` | `--border` | `--shadow-lg` |
| Modal | `--card` | `--card-foreground` | `--border` | `--shadow-xl` |
| Sidebar | `--sidebar` | `--sidebar-foreground` | `--sidebar-border` | — |
| Active nav item | `--sidebar-primary` | `--sidebar-primary-foreground` | — | — |
| Hovered nav item | `--sidebar-accent` | `--sidebar-accent-foreground` | — | — |
| Badge — Admin | `--primary` | `--primary-foreground` | — | — |
| Badge — Member | `--muted` | `--muted-foreground` | — | — |
| Badge — Danger | `--destructive` | `--destructive-foreground` | — | — |
| Disabled state | `--muted` | `--muted-foreground` | `--border` | — |
| Focus ring | — | — | `--ring` | — |
| Divider / Rule | — | — | `--border` | — |

---

## 7. Dark Mode

Dark mode is activated by adding the `.dark` class to the `<html>` element. All tokens above automatically switch. Implementation in Next.js:

```tsx
// Recommended: use next-themes
// npm install next-themes

// layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

The `@custom-variant dark (&:is(.dark *))` declaration in `globals.css` ensures all Tailwind `dark:` variants respect the `.dark` class on the `<html>` element rather than the OS media query alone.

---

## 8. Tailwind Usage Examples

```tsx
// Primary button
<button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 shadow-sm">
  Get Started
</button>

// Secondary / amber button
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-md px-4 py-2">
  Learn More
</button>

// Destructive button
<button className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md px-4 py-2">
  Delete Workspace
</button>

// Card
<div className="bg-card text-card-foreground border border-border rounded-lg shadow-sm p-6">
  Card content
</div>

// Input
<input className="bg-background border border-input rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />

// Muted label
<p className="text-muted-foreground text-sm">Helper text or placeholder label</p>

// Admin role badge
<span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-sm">
  Admin
</span>

// Member role badge
<span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-sm">
  Member
</span>
```

---

*Design Tokens — SaaS CRM + LMS Platform | April 2026*
