# UI Claude-Style Redesign — Batch 2 (Student-facing) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate every student-facing page and student-only primitive to the cream + warmed-red + Newsreader visual language established in Batch 1, so a logged-in student sees a coherent redesigned UI end-to-end (login → dashboard → book browse → history → camera scan → profile → notifications → learning).

**Architecture:** Token-replacement refactor identical to Batch 1. New tokens already exist in `tailwind.config.ts` (Chat 4 commit `8025e1f`/etc.); legacy `swin-*` tokens remain as aliases until Batch 3 cleanup. Each file is migrated using the **Token Migration Reference Table at the top of the Batch 1 plan** as the canonical class-swap recipe, plus the Spec-Delta Recipe in §"Spec deltas" below for higher-level patterns (page H1 → `font-display text-display-lg`, KPI numerals, focus rings, etc.). Each chat bundles ~4–8 files into one combined commit; per-task commits are not used (matches Batch 1 cadence — see commit hashes `3fdcb06`, `b13baf4`, `9a5e47f`, `24f0310`).

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS 3.4, custom `ThemeProvider` (NOT `next-themes`), TypeScript, pnpm.

**Spec reference:** `docs/superpowers/specs/2026-04-29-ui-claude-style-redesign-design.md` §7 "Batch 2 — Student-facing"
**Token recipe:** `docs/superpowers/plans/2026-04-29-ui-claude-batch-1-foundation.md` "Token Migration Reference Table" (top of file). Do NOT re-read the rest of the Batch 1 plan during execution — it's historical record.

---

## Prerequisites

Before starting any task, the engineer must have:

- [ ] Confirmed current branch is `Kelvin-v3.0.4-EnhanceUIColour` (`git branch --show-current`)
- [ ] Read `progress.md` (project root) — current state pointer
- [ ] Read this plan's "Spec deltas" section AND the "Token Migration Reference Table" in the Batch 1 plan
- [ ] Confirmed Batch 1 is complete — `pnpm tsc --noEmit` clean before starting

## Codebase facts that inform this plan

- **Token system is already extended** — Batch 1 added all canvas/surface/ink/primary/accent/dark/semantic tokens to `tailwind.config.ts` and added `rounded-pill`/`rounded-btn`/`rounded-card`/`rounded-hero` aliases. Batch 2 only consumes them.
- **Fonts are self-hosted via `next/font/google`** — `var(--font-newsreader)`, `var(--font-inter)`, `var(--font-jetbrains-mono)`. Tailwind classes `font-display` / `font-sans` / `font-mono` already point at these.
- **`accent='gold'` and `tone='gold'` props on `<SectionCard>` and `<UserAvatar>` still resolve to `accent-amber`** post-Batch-1. Caller code touching these in Batch 2 may either keep the prop literal or rename to `'amber'` for clarity — design call. Default: keep the literal `'gold'` to minimize diff churn unless the surrounding context obviously reads as amber.
- **`<SignOutButton>` now ships with a `DEFAULT_CLASS_NAME`** that bakes the secondary CTA recipe. Callers that pass `className` override it; callers that omit `className` inherit the new look. See Task 1.
- **Custom `ThemeProvider`** sets `dark` class on `<html>` post-hydration. There is a **brief light-mode flash on first load** for dark-mode users — known issue, not a Batch 2 fix. Don't try to address it inside individual components.
- **No `pnpm lint` script exists.** Quality gate is `pnpm tsc --noEmit` only.
- **`/dev/primitives` exists** at `app/dev/primitives/page.tsx` (NODE_ENV-gated 404 in production via `app/dev/layout.tsx`). Do not delete; it survives until Batch 3 final cleanup.
- **User handles all UI/browser testing themselves.** Do not run preview tools or claim visual correctness — `pnpm tsc --noEmit` is the only automated gate.

## File Structure

### Files Modified (by chat)

#### Chat 9 — Login + main dashboard + nav full migration (~9 files)

| Path | Purpose |
|---|---|
| `app/ui/dashboard/sidenav.tsx` | Sidebar nav — full migration (also drops `<SignOutButton>` className override) |
| `app/ui/dashboard/mobileMenu.tsx` | Mobile drawer nav — full migration (also drops `<SignOutButton>` className override; retires `isDark` apparatus) |
| `app/login/page.tsx` | Login route shell (server component) |
| `app/login/LoginClient.tsx` | Login client wrapper |
| `app/ui/loginForm.tsx` | Login form fields, brand mark (`swin-red-brand` retained) |
| `app/dashboard/page.tsx` | Student dashboard server entry |
| `app/ui/dashboard/student/myBooksCard.tsx` | "Your loans" card |
| `app/ui/dashboard/student/quickActions.tsx` | Quick-action tile grid |
| `app/ui/dashboard/summaryCards.tsx` | KPI summary row |

#### Chat 10 — Book browse + borrow history (~7 files)

| Path | Purpose |
|---|---|
| `app/dashboard/book/page.tsx` | Book browse landing |
| `app/dashboard/book/list/page.tsx` | Full catalog list view |
| `app/dashboard/book/history/page.tsx` | History page |
| `app/dashboard/book/history/loading.tsx` | History loading skeleton |
| `app/ui/dashboard/bookListMobile.tsx` | Mobile book list |
| `app/ui/dashboard/borrowingHistoryFilter.tsx` | History filter row |
| `app/ui/dashboard/activeLoansTable.tsx` | Active loans table |
| `app/ui/dashboard/bookCatalogTable.tsx` | Book catalog table |

#### Chat 11 — Camera scan + profile + notifications (~9 files)

| Path | Purpose |
|---|---|
| `app/dashboard/cameraScan/page.tsx` | Camera scan page |
| `app/dashboard/profile/page.tsx` | Profile page server entry |
| `app/profile/profileEditForm.tsx` | Profile edit wrapper |
| `app/profile/profileNameForm.tsx` | Name edit form |
| `app/profile/profileAvatarForm.tsx` | Avatar edit form |
| `app/dashboard/notifications/loading.tsx` | Notifications loading skeleton |
| `app/ui/dashboard/notificationPanel.tsx` | Notification center panel |
| `app/ui/dashboard/notificationToast.tsx` | Toast notification component |

#### Chat 12 — Learning module (~7 files)

| Path | Purpose |
|---|---|
| `app/dashboard/learning/page.tsx` | Learning landing page |
| `app/ui/dashboard/learning/collectionsPanel.tsx` | Curated collections panel |
| `app/ui/dashboard/learning/courseCard.tsx` | Course tile |
| `app/ui/dashboard/learning/searchForm.tsx` | Learning search input |
| `app/ui/dashboard/learning/searchResultsPanel.tsx` | Search results panel |
| `app/ui/dashboard/learning-path-generator.tsx` | Learning-path generator UI |
| `app/ui/dashboard/studentChat.tsx` | Student chat surface |

### Files Created

None. Batch 2 is migration-only.

### Files Deleted

None in Batch 2. `tailwind.config.ts` legacy `swin-*` tokens are deleted in Batch 3.

### Decision aligned 2026-04-29: full migration of `sidenav.tsx` + `mobileMenu.tsx` in Chat 9

`app/ui/dashboard/sidenav.tsx` and `app/ui/dashboard/mobileMenu.tsx` are not listed in spec §7 Batch 1 Chat 8 or in spec §7 Batch 2, but they contain ~37 legacy-token hits combined (sidenav.tsx 23 hits; mobileMenu.tsx 14 hits across `swin-*`, `bg-white`, `text-gray|slate`, `bg-gray|slate`, `border-gray|slate`, `rounded-lg|2xl`). User chose **option B** during plan alignment: full migration in this batch (rather than deferring to Batch 3 cleanup), since these are the navs every dashboard page renders and Batch 2's intent is "student-visible surfaces are coherent". Task 1 covers both files end-to-end, including the `<SignOutButton>` override removal as one step among many.

---

## Spec deltas (higher-level recipe)

The Token Migration Reference Table covers class-level swaps. These are the **page/component-level patterns** to apply on top of the table:

### Typography map

| Element class today | Replace with |
|---|---|
| `<h1 className="text-3xl/4xl font-bold ...">` (page title) | `<h1 className="font-display text-display-lg text-ink tracking-tight dark:text-on-dark">` |
| `<h2 className="text-2xl ...">` (section title) | `<h2 className="font-display text-display-md text-ink dark:text-on-dark">` |
| `<h3 className="text-xl ...">` (subsection) | `<h3 className="font-display text-display-sm text-ink dark:text-on-dark">` or `font-sans text-title-lg` if it's a card subtitle, not a display heading |
| Large KPI numeral | `<span className="font-display text-display-sm text-ink dark:text-on-dark">` |
| Eyebrow / SECTION LABEL | `<span className="font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">` |
| Default body paragraph | `<p className="font-sans text-body-md text-body dark:text-on-dark/80">` |
| Helper / description text | `<p className="font-sans text-body-sm text-body dark:text-on-dark/70">` |
| Caption / metadata | `<span className="font-sans text-caption text-muted dark:text-on-dark-soft">` |
| Code / barcode / ISBN | `<code className="font-mono text-code text-muted dark:text-on-dark-soft">` |

### Card / panel recipe

```
bg-surface-card dark:bg-dark-surface-card
border border-hairline dark:border-dark-hairline
rounded-card
p-{5|6|8}     // 5 = LoanCard/HoldCard, 6 = scan/preview/modal, 8 = KpiCard/SectionCard
```

Hover (cards/panels with action affordance): add `transition hover:border-primary/20 dark:hover:border-dark-primary/30`. **No `shadow-*`** — elevation comes from cream surface hierarchy, not shadows. Floating overlays (modals, drawers, toasts) keep `shadow-[0_4px_16px_rgba(20,20,19,0.08)]` only.

### Button recipe

**Prefer the shared `<Button>` from `app/ui/button.tsx`** for any new CTA placement. If a file already uses inline button classes, replace with `<Button>` if the design intent is "primary CTA" or "secondary cream CTA"; keep inline only when the visual is genuinely bespoke (e.g., a chip-style filter pill).

Inline primary button (when `<Button>` is overkill):
```
bg-primary hover:bg-primary-active text-on-primary
rounded-btn px-5 h-10 font-sans text-button
focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas
disabled:bg-primary-disabled disabled:text-muted disabled:cursor-not-allowed
```

Inline secondary cream button:
```
bg-surface-card hover:bg-surface-cream-strong text-ink
border border-hairline dark:bg-dark-surface-card dark:hover:bg-dark-surface-strong dark:border-dark-hairline dark:text-on-dark
rounded-btn px-5 h-10 font-sans text-button
focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas
```

### Form input recipe

```
bg-canvas dark:bg-dark-surface-soft
border border-hairline dark:border-dark-hairline
rounded-btn px-3.5 h-10 font-sans text-body-md text-ink dark:text-on-dark
placeholder:text-muted-soft dark:placeholder:text-on-dark-soft
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas
disabled:bg-surface-soft disabled:cursor-not-allowed
```

### Focus ring (universal, repeat for clarity)

```
focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas
```

### Logo / brand mark

Anything that *is* the Swinburne brand mark (login page mark, `acmeLogo`) keeps **`text-swin-red-brand`** (`#C82333`). General CTAs and body accents use **`text-primary`** / **`bg-primary`** (`#B83A35`). When in doubt: if removing this element would weaken Swinburne brand recognition on this surface, it's brand; otherwise it's UI.

### Conditional `isDark` apparatus

If a file uses `useTheme()` + `mounted` boolean + ternary classNames keyed on `isDark`, **drop the apparatus** and replace with paired `bg-... dark:bg-...` / `text-... dark:text-...` Tailwind classes (matches Batch 1 Chat 8 `dashboardShell` decision — see `findings.md` 2026-04-29 Chat 8 entry 1). Keep `useTheme()` only if a non-className behavior depends on it (e.g., conditional asset paths, programmatic theme toggle). Toggling appearance via Tailwind paired classes works against the custom ThemeProvider's `dark` class on `<html>`.

### `<SignOutButton>` callers

`<SignOutButton>` now has `DEFAULT_CLASS_NAME` baked in. Callers passing `className` override it. **Drop the `className` prop** to inherit the redesigned secondary cream button look. The `labelClassName` prop is independent and may stay if a caller intentionally hides the label (e.g., icon-only sidebar use).

---

## Per-chat execution cadence

Each chat ends with a single combined commit covering all files in that chat (matches Batch 1 cadence). Within a chat:

1. Migrate files file-by-file, using token table + spec deltas
2. Run `pnpm tsc --noEmit` → must be 0 errors
3. Run residue grep across the touched files → must be 0 hits (see Audit step in each chat's last task)
4. Update `task_plan.md` checkboxes for that chat
5. Update `progress.md` "Current position" section with chat number, last completed, next step
6. Single `git commit` per chat with body listing all migrated files and any decisions made outside the literal recipe (mirror Batch 1 commit-message style — see commit `24f0310` body for template)
7. Backfill commit hash into `progress.md` and `task_plan.md`

Do **not** push without explicit user confirmation per existing user feedback memory.

---

## Tasks

---

## Chat 9 — Login + main dashboard

### Task 1: Full migration of `sidenav.tsx` and `mobileMenu.tsx`

**Files:**
- Modify: `app/ui/dashboard/sidenav.tsx`
- Modify: `app/ui/dashboard/mobileMenu.tsx`

Both nav files were skipped by Batch 1 Chat 8 (spec §7 listed only `dashboardShell`/`adminShell`/`dashboardTitleBar`/`signOutButton`/`themeToggle`). Per user-aligned option B, this Task migrates them end-to-end. Pre-audit (2026-04-29): sidenav.tsx 23 legacy-token hits, mobileMenu.tsx 14 hits.

- [ ] **Step 1: Read `sidenav.tsx` end-to-end**

Run: `cat app/ui/dashboard/sidenav.tsx`. Identify:
- nav container background, border, padding
- nav item link styles (default, hover, active)
- nav item icon color
- collapsed/expanded states (if applicable)
- the user-info footer block (lines ~218–227 currently): name, email, avatar
- the `<SignOutButton>` call at line ~228 with override
- any `useTheme()` / `isDark` apparatus

- [ ] **Step 2: Apply Token Migration Reference Table to `sidenav.tsx` class swaps**

Sweep every class match per the table at the top of the Batch 1 plan. Dark variants must stay paired (e.g., `bg-canvas dark:bg-dark-canvas`).

- [ ] **Step 3: Apply spec deltas to `sidenav.tsx`**

- Nav container: `bg-canvas dark:bg-dark-canvas border-r border-hairline dark:border-dark-hairline`
- Nav item (default): `font-sans text-nav-link text-body dark:text-on-dark/80 rounded-btn px-3 h-10 transition`
- Nav item (hover): `hover:bg-surface-cream-strong dark:hover:bg-dark-surface-strong hover:text-ink dark:hover:text-on-dark`
- Nav item (active/current page): `bg-surface-cream-strong dark:bg-dark-surface-strong text-ink dark:text-on-dark` (cream emphasis, not primary fill — primary is reserved for CTAs)
- Nav item icon: inherits `currentColor`; default state stays at `text-muted-soft` if the icon has its own color slot
- User name in footer: `font-sans text-title-sm text-ink dark:text-on-dark` (was `text-[13px] font-semibold text-swin-charcoal dark:text-white`)
- User email: `font-mono text-code text-muted-soft dark:text-on-dark-soft` (was `font-mono text-[11px] text-swin-charcoal/40 dark:text-white/40`)
- User-info footer divider: `border-t border-hairline dark:border-dark-hairline`

- [ ] **Step 4: Drop `<SignOutButton>` className override in `sidenav.tsx`**

Find at line ~228:
```tsx
<SignOutButton
  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-swin-charcoal/40 transition hover:text-swin-red dark:text-white/40 dark:hover:text-red-400"
  labelClassName="hidden"
/>
```

Replace with:
```tsx
<SignOutButton labelClassName="hidden" />
```

(Keep `labelClassName="hidden"` — it intentionally hides the text label for the icon-only sidebar footer. Drop only the `className` so the button inherits its baked `DEFAULT_CLASS_NAME` from Batch 1.)

- [ ] **Step 5: Drop `useTheme()` / `isDark` apparatus in `sidenav.tsx` if present**

Per spec deltas: replace ternary `isDark ? 'a' : 'b'` patterns with paired `a dark:b` Tailwind classes. If after that `useTheme()` has no remaining consumer, drop the import + the `const { theme } = useTheme()` line.

- [ ] **Step 6: tsc + per-file residue check (`sidenav.tsx`)**

Run: `pnpm tsc --noEmit`. Expected: 0 errors.

Run residue grep on `sidenav.tsx`:
```bash
grep -nE "swin-charcoal|swin-ivory|swin-gold|swin-dark-bg|swin-dark-surface|\bswin-red\b|bg-white|text-gray-|bg-gray-|text-slate-|bg-slate-|border-slate-|border-gray-|rounded-lg(?!\\s*\\b)|rounded-2xl" app/ui/dashboard/sidenav.tsx
```
Expected: 0 hits.

- [ ] **Step 7: Read `mobileMenu.tsx` end-to-end**

Run: `cat app/ui/dashboard/mobileMenu.tsx`. Identify:
- drawer overlay/backdrop
- drawer panel (likely uses `isDark` ternary heavily — note: there's a known pre-existing bug at line ~135–137 where both branches of `isDark ? 'border-white/10' : 'border-white/10'` are identical)
- nav item rendering (similar to sidenav items)
- the `<SignOutButton>` call at line ~139 with override

- [ ] **Step 8: Apply Token Migration Reference Table to `mobileMenu.tsx` class swaps**

Same as Step 2 but on `mobileMenu.tsx`.

- [ ] **Step 9: Apply spec deltas to `mobileMenu.tsx`**

- Backdrop: `bg-ink/50 dark:bg-dark-canvas/70` (semi-opaque overlay)
- Drawer panel: `bg-canvas dark:bg-dark-canvas`
- Drawer header / footer dividers: `border-hairline dark:border-dark-hairline`
- Nav items: same recipe as `sidenav.tsx` Step 3
- "Sign out" footer divider: `border-t border-hairline dark:border-dark-hairline px-4 py-3` (the previous identical-branches bug becomes a clean tokenized divider)

- [ ] **Step 10: Drop `<SignOutButton>` className override in `mobileMenu.tsx`**

Find at line ~139:
```tsx
<SignOutButton
  className={clsx(
    'inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition',
    isDark
      ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
      : 'border-white/20 bg-white/10 text-white hover:bg-white/20',
  )}
  labelClassName="text-sm font-semibold"
/>
```

Replace with:
```tsx
<SignOutButton />
```

(Drop both `className` and `labelClassName` — the mobile-drawer wants a full-width-ish secondary CTA, which `DEFAULT_CLASS_NAME` already provides. The label shows by default.)

- [ ] **Step 11: Drop `useTheme()` / `isDark` apparatus in `mobileMenu.tsx`**

After Steps 8–10, all `isDark` ternaries should be gone. Drop the `const { theme } = useTheme()` line and any unused `clsx` import:
- Run `grep -c clsx app/ui/dashboard/mobileMenu.tsx` — if 1 (only the import), remove the import line
- Run `grep -c useTheme app/ui/dashboard/mobileMenu.tsx` — if 1 (only the import), remove the import line

- [ ] **Step 12: tsc + per-file residue check (`mobileMenu.tsx`)**

Run: `pnpm tsc --noEmit`. Expected: 0 errors.

Run residue grep on `mobileMenu.tsx`:
```bash
grep -nE "swin-charcoal|swin-ivory|swin-gold|swin-dark-bg|swin-dark-surface|\bswin-red\b|bg-white|text-gray-|bg-gray-|text-slate-|bg-slate-|border-slate-|border-gray-|rounded-lg(?!\\s*\\b)|rounded-2xl" app/ui/dashboard/mobileMenu.tsx
```
Expected: 0 hits.

(Commit happens at end of Chat 9 alongside other tasks.)

---

### Task 2: Migrate `app/login/page.tsx` and `app/login/LoginClient.tsx`

**Files:**
- Modify: `app/login/page.tsx`
- Modify: `app/login/LoginClient.tsx`

`page.tsx` is likely a thin server component wrapping `<LoginClient>`. Read both and apply the token table + spec deltas.

- [ ] **Step 1: Read both files**

Run: `cat app/login/page.tsx app/login/LoginClient.tsx`. Note any `swin-*`, `bg-white`, `text-gray-*`, `bg-gray-*`, `text-slate-*`, `border-gray-*`, `rounded-lg`, `rounded-2xl`, `font-bold` (for headings) usage.

- [ ] **Step 2: Apply Token Migration Reference Table to all class-level swaps**

For each match, swap to the new token per the table.

- [ ] **Step 3: Apply spec deltas**

- Page-level wrapper background: `bg-canvas dark:bg-dark-canvas`
- Login hero/welcome heading: `font-display text-display-xl text-ink dark:text-on-dark tracking-tight` (`display-xl` is reserved for login hero per spec §4.2)
- Subtitle: `font-sans text-body-md text-body dark:text-on-dark/80`
- Container card (if any): card recipe with `p-16` (per spec §5.3 "Login hero band") OR `p-8` if it's a tighter form-only card

- [ ] **Step 4: tsc**

Run: `pnpm tsc --noEmit`. Expected: 0 errors.

- [ ] **Step 5: Per-file residue check**

Run for each file: `grep -E "swin-charcoal|swin-ivory|swin-gold|swin-dark-bg|swin-dark-surface|bg-white|text-gray|bg-gray|text-slate-(?!.*\bdark\b)|border-gray" <file>`
Expected: 0 hits, except intentionally retained `swin-red-brand` in brand-mark elements.

(Commit at end of Chat 9.)

---

### Task 3: Migrate `app/ui/loginForm.tsx`

**Files:**
- Modify: `app/ui/loginForm.tsx`

Login form has a brand mark (preserve `swin-red-brand`), email/password inputs, submit button, and likely "forgot password" link.

- [ ] **Step 1: Read the file**

Run: `cat app/ui/loginForm.tsx`. Identify: brand mark element, input fields, submit button, helper text, error state.

- [ ] **Step 2: Apply class-level swaps from token table**

Skip any element that is the Swinburne brand mark (`text-swin-red` on logo glyph, `bg-swin-red` on a brand banner) — those become **`text-swin-red-brand`** / **`bg-swin-red-brand`**.

- [ ] **Step 3: Apply input + button recipes from "Spec deltas" section**

- Inputs: form input recipe (cream-canvas bg, hairline border, primary focus ring)
- Submit: replace any inline button classes with the shared `<Button>` component from `app/ui/button.tsx`. If the form must keep an inline button for accessibility/server-action wiring, apply the inline primary button recipe.
- Validation error: `text-error font-sans text-body-sm`
- "Forgot password" link: `text-primary hover:text-primary-active font-sans text-body-sm dark:text-dark-primary`

- [ ] **Step 4: tsc**

Run: `pnpm tsc --noEmit`. Expected: 0 errors.

- [ ] **Step 5: Per-file residue check**

Same grep as Task 2, allowing `swin-red-brand` only.

(Commit at end of Chat 9.)

---

### Task 4: Migrate `app/dashboard/page.tsx`

**Files:**
- Modify: `app/dashboard/page.tsx`

Student dashboard server entry. Likely composes `<SummaryCards>`, `<MyBooksCard>`, `<QuickActions>`, plus a heading band.

- [ ] **Step 1: Read the file**

Run: `cat app/dashboard/page.tsx`.

- [ ] **Step 2: Apply token table swaps + spec deltas**

- Page wrapper (if any direct styling here): `bg-canvas dark:bg-dark-canvas`
- Welcome / page heading: `font-display text-display-lg text-ink dark:text-on-dark tracking-tight`
- Section titles: `font-display text-display-md text-ink dark:text-on-dark`
- Eyebrow labels: `font-sans text-caption-uppercase text-muted dark:text-on-dark-soft`

- [ ] **Step 3: Drop any `isDark` apparatus** per spec deltas section.

- [ ] **Step 4: tsc + residue**

Run: `pnpm tsc --noEmit`, then per-file grep. Expected: 0 errors, 0 residue.

(Commit at end of Chat 9.)

---

### Task 5: Migrate `app/ui/dashboard/student/myBooksCard.tsx`

**Files:**
- Modify: `app/ui/dashboard/student/myBooksCard.tsx`

"Your loans" / "My Books" card component on the dashboard.

- [ ] **Step 1: Read the file**

Run: `cat app/ui/dashboard/student/myBooksCard.tsx`.

- [ ] **Step 2: Apply card recipe**

Container → `bg-surface-card dark:bg-dark-surface-card border border-hairline dark:border-dark-hairline rounded-card p-8` (since this is a dashboard-prominent card, use `p-8` per spec §5.3).

- [ ] **Step 3: Apply typography**

- Card title: `font-display text-display-sm text-ink dark:text-on-dark` (it's a section title within a dashboard card, not a page H1)
- Book title within row: `font-sans text-title-md text-ink dark:text-on-dark`
- Author / metadata: `font-sans text-body-sm text-muted dark:text-on-dark-soft`
- Due date < 3 days: `text-warning`; otherwise `text-muted`. Overdue: `text-primary` (or use `<StatusBadge status="overdue">` if already a badge)

- [ ] **Step 4: Token table swaps for everything else**

- [ ] **Step 5: tsc + residue**

Expected: 0 errors, 0 residue.

(Commit at end of Chat 9.)

---

### Task 6: Migrate `app/ui/dashboard/student/quickActions.tsx`

**Files:**
- Modify: `app/ui/dashboard/student/quickActions.tsx`

Quick-action tiles (e.g., "Scan to borrow", "View history").

- [ ] **Step 1: Read the file** — `cat app/ui/dashboard/student/quickActions.tsx`.

- [ ] **Step 2: Apply tile recipe**

Each tile → card recipe with `p-6` (not `p-8` — these are smaller action tiles, not full content cards). Hover state: `transition hover:border-primary/20 dark:hover:border-dark-primary/30`. **No shadow.** If the existing version uses `shadow-md`/`shadow-lg`, drop it.

- [ ] **Step 3: Apply typography**

- Tile label: `font-sans text-title-sm text-ink dark:text-on-dark`
- Tile description: `font-sans text-body-sm text-body dark:text-on-dark/70`
- Icon color: `text-primary` (action accent)

- [ ] **Step 4: Token table swaps for everything else.**

- [ ] **Step 5: tsc + residue.** Expected: 0/0.

(Commit at end of Chat 9.)

---

### Task 7: Migrate `app/ui/dashboard/summaryCards.tsx`

**Files:**
- Modify: `app/ui/dashboard/summaryCards.tsx`

KPI summary row at the top of the dashboard. Likely wraps `<KpiCard>` (already migrated in Batch 1) — so this file may be light: just outer grid + spacing. Confirm by reading.

- [ ] **Step 1: Read the file** — `cat app/ui/dashboard/summaryCards.tsx`.

- [ ] **Step 2:** If it only composes `<KpiCard>`, the migration is a token sweep on any wrapper `<div>` styling (background, border, gap classes). KpiCard internals were already migrated in Batch 1 (commit `b13baf4`).

- [ ] **Step 3:** If it inlines KPI markup (no `<KpiCard>` use), apply the `KpiCard` recipe from spec §6.2:
  - Container: `bg-surface-card dark:bg-dark-surface-card border border-hairline dark:border-dark-hairline rounded-card p-8`
  - Eyebrow: `font-sans text-caption-uppercase text-muted dark:text-on-dark-soft`
  - Numeral: `font-display text-display-sm text-ink dark:text-on-dark`
  - Sub: `font-sans text-body-sm text-body dark:text-on-dark/70`
  - Trend up/down: `text-success` / `text-error`

- [ ] **Step 4: tsc + residue.** Expected: 0/0.

(Commit at end of Chat 9.)

---

### Task 8: Chat 9 audit + commit

**Files:**
- All Chat 9 files above plus `task_plan.md` and `progress.md`.

- [ ] **Step 1: Project-wide tsc**

Run: `pnpm tsc --noEmit`. Expected: 0 errors.

- [ ] **Step 2: Residue grep across all Chat 9 files**

Run:
```bash
grep -nE "swin-charcoal|swin-ivory|swin-gold|swin-dark-bg|swin-dark-surface" \
  app/login/page.tsx app/login/LoginClient.tsx app/ui/loginForm.tsx \
  app/dashboard/page.tsx app/ui/dashboard/student/myBooksCard.tsx \
  app/ui/dashboard/student/quickActions.tsx app/ui/dashboard/summaryCards.tsx \
  app/ui/dashboard/sidenav.tsx app/ui/dashboard/mobileMenu.tsx
```
Expected: 0 hits across all listed files for the listed legacy tokens. (`swin-red-brand` is a separate token and will not match.)

Run also (raw-color residue):
```bash
grep -nE "bg-white|text-white(?!\\b)|bg-slate-|text-slate-|border-slate-|border-white/" \
  <same file list>
```
Expected: 0 hits, **except** `text-on-dark` / `dark:text-on-dark` (those contain "white"-like literals only as token names, but the regex above does not match them — sanity check).

- [ ] **Step 3: Update `task_plan.md`**

Append a Chat 9 section listing all 7 tasks with checkboxes ticked. Use Batch 1's `task_plan.md` Chat 5/6/7/8 sections as the template (✅ DONE marker, commit hash placeholder).

- [ ] **Step 4: Update `progress.md`**

- "Current position" → Current batch: 2; Current chat: 9 of 16 done; Last completed: list of 7 files; Next step: Chat 10
- "What's done" → add Chat 9 entry with bullets per task and any decisions outside literal recipe (e.g., "dropped `clsx` import in mobileMenu.tsx after `isDark` apparatus retired")

- [ ] **Step 5: Combined commit**

```bash
git add app/login app/ui/loginForm.tsx app/dashboard/page.tsx \
        app/ui/dashboard/student app/ui/dashboard/summaryCards.tsx \
        app/ui/dashboard/sidenav.tsx app/ui/dashboard/mobileMenu.tsx \
        task_plan.md progress.md
git commit -m "$(cat <<'EOF'
feat(ui): migrate Batch 2 Chat 9 — login + dashboard student surfaces

Files migrated:
- app/login/page.tsx, app/login/LoginClient.tsx, app/ui/loginForm.tsx
- app/dashboard/page.tsx
- app/ui/dashboard/student/myBooksCard.tsx
- app/ui/dashboard/student/quickActions.tsx
- app/ui/dashboard/summaryCards.tsx
- app/ui/dashboard/sidenav.tsx (full migration; SignOutButton override removed)
- app/ui/dashboard/mobileMenu.tsx (full migration; SignOutButton override removed; isDark apparatus retired)

Recipe: Batch 1 plan Token Migration Reference Table + Batch 2 plan Spec Deltas.
Per-file tsc + residue grep clean. No shadow added on cards/tiles per spec §6.4.

Next: Chat 10 (book browse + history).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 6: Backfill commit hash**

After commit, run `git log -1 --format=%H` and paste the SHA into both `task_plan.md` Chat 9 section and `progress.md` Chat 9 entry.

- [ ] **Step 7: Confirm with user before pushing.** Per user feedback memory: always confirm branch + non-main destination before pushing. Default action: do not push; wait for user.

---

## Chat 10 — Book browse + borrow history

### Task 9: Migrate `app/dashboard/book/page.tsx`

**Files:**
- Modify: `app/dashboard/book/page.tsx`

Book browse landing page.

- [ ] **Step 1: Read the file** — `cat app/dashboard/book/page.tsx`.

- [ ] **Step 2: Apply token table swaps + spec deltas:**

- Page wrapper bg: `bg-canvas dark:bg-dark-canvas`
- Page H1: `font-display text-display-lg text-ink dark:text-on-dark tracking-tight`
- Section titles: `font-display text-display-md text-ink dark:text-on-dark`
- Filter rail / sidebar: card recipe
- Drop any `isDark` apparatus.

- [ ] **Step 3: tsc + per-file residue.** Expected: 0/0.

(Commit at end of Chat 10.)

---

### Task 10: Migrate `app/dashboard/book/list/page.tsx`

**Files:**
- Modify: `app/dashboard/book/list/page.tsx`

Full catalog list view.

- [ ] **Step 1: Read** — `cat app/dashboard/book/list/page.tsx`.

- [ ] **Step 2: Apply token swaps + page H1 typography.**

If the page composes `<BookCatalogTable>` (migrated in Task 14 below) and `<FilterPills>` (Batch 1 — already migrated), the migration here is shell-level only.

- [ ] **Step 3: tsc + residue.** Expected: 0/0.

(Commit at end of Chat 10.)

---

### Task 11: Migrate `app/dashboard/book/history/page.tsx` and `loading.tsx`

**Files:**
- Modify: `app/dashboard/book/history/page.tsx`
- Modify: `app/dashboard/book/history/loading.tsx`

History page + its skeleton.

- [ ] **Step 1: Read both files.**

- [ ] **Step 2: Apply page recipe to `page.tsx`.**

- Page H1: `font-display text-display-lg text-ink dark:text-on-dark`
- Subtitle / description: `font-sans text-body-md text-body dark:text-on-dark/80`

- [ ] **Step 3: Apply skeleton recipe to `loading.tsx`.**

Skeleton blocks: per spec §6.3, `bg-surface-cream-strong dark:bg-dark-surface-strong` (NOT `bg-gray-200`). Add subtle `animate-pulse` if the file already uses it; do not introduce new animation.

- [ ] **Step 4: tsc + residue per file.** Expected: 0/0.

(Commit at end of Chat 10.)

---

### Task 12: Migrate `app/ui/dashboard/bookListMobile.tsx`

**Files:**
- Modify: `app/ui/dashboard/bookListMobile.tsx`

Mobile book list (compact card list view).

- [ ] **Step 1: Read** — `cat app/ui/dashboard/bookListMobile.tsx`.

- [ ] **Step 2: Apply card recipe per row** with `p-5` (LoanCard-class density per spec §5.3).

- [ ] **Step 3: Apply typography**

- Book title: `font-sans text-title-md text-ink dark:text-on-dark`
- Author: `font-sans text-body-sm text-muted dark:text-on-dark-soft`
- ISBN/barcode: `font-mono text-code text-muted dark:text-on-dark-soft`
- Status badge: prefer using shared `<StatusBadge>` (Batch 1) if not already.

- [ ] **Step 4: tsc + residue.** Expected: 0/0.

(Commit at end of Chat 10.)

---

### Task 13: Migrate `app/ui/dashboard/borrowingHistoryFilter.tsx`

**Files:**
- Modify: `app/ui/dashboard/borrowingHistoryFilter.tsx`

Filter row for history page (date range, status, etc.).

- [ ] **Step 1: Read** — `cat app/ui/dashboard/borrowingHistoryFilter.tsx`.

- [ ] **Step 2: Apply form input recipe** to all inputs/selects. Apply filter pill pattern (already migrated as `<FilterPills>` in Batch 1) if pills are used; otherwise use the cream secondary button recipe for filter buttons.

- [ ] **Step 3: Eyebrow / label text**: `font-sans text-caption-uppercase text-muted dark:text-on-dark-soft`.

- [ ] **Step 4: tsc + residue.** Expected: 0/0.

(Commit at end of Chat 10.)

---

### Task 14: Migrate `app/ui/dashboard/activeLoansTable.tsx` and `bookCatalogTable.tsx`

**Files:**
- Modify: `app/ui/dashboard/activeLoansTable.tsx`
- Modify: `app/ui/dashboard/bookCatalogTable.tsx`

Tabular components.

- [ ] **Step 1: Read both files.**

- [ ] **Step 2: Apply table recipe**

- Table wrapper: `bg-surface-card dark:bg-dark-surface-card border border-hairline dark:border-dark-hairline rounded-card overflow-hidden`
- Table header `<th>`: `bg-surface-cream-strong dark:bg-dark-surface-strong text-ink dark:text-on-dark font-sans text-caption-uppercase`
- Table cell `<td>`: `font-sans text-body-sm text-body dark:text-on-dark/80 border-t border-hairline-soft dark:border-dark-hairline`
- Hover row: `hover:bg-surface-cream-strong/50 dark:hover:bg-dark-surface-strong/50`
- Numeric/ISBN cells: `font-mono text-code text-muted dark:text-on-dark-soft`
- Action cell buttons: shared `<Button>` size="sm" if available, else inline primary button recipe scaled to height 32px (`h-8 px-3 text-button`).

- [ ] **Step 3: tsc + per-file residue.** Expected: 0/0.

(Commit at end of Chat 10.)

---

### Task 15: Chat 10 audit + commit

**Files:**
- All Chat 10 files plus `task_plan.md` and `progress.md`.

- [ ] **Step 1: Project-wide tsc.** Expected: 0.

- [ ] **Step 2: Residue grep across all Chat 10 files** — same regex pair as Chat 9 audit.

- [ ] **Step 3: Update `task_plan.md` Chat 10 section** (template per Chat 9 audit).

- [ ] **Step 4: Update `progress.md`** — Current position → Chat 10 done, next step Chat 11.

- [ ] **Step 5: Combined commit**

```bash
git add app/dashboard/book app/ui/dashboard/bookListMobile.tsx \
        app/ui/dashboard/borrowingHistoryFilter.tsx \
        app/ui/dashboard/activeLoansTable.tsx \
        app/ui/dashboard/bookCatalogTable.tsx \
        task_plan.md progress.md
git commit -m "$(cat <<'EOF'
feat(ui): migrate Batch 2 Chat 10 — book browse + borrow history

Files migrated:
- app/dashboard/book/page.tsx
- app/dashboard/book/list/page.tsx
- app/dashboard/book/history/page.tsx, loading.tsx
- app/ui/dashboard/bookListMobile.tsx
- app/ui/dashboard/borrowingHistoryFilter.tsx
- app/ui/dashboard/activeLoansTable.tsx
- app/ui/dashboard/bookCatalogTable.tsx

Recipe: Batch 1 plan Token Migration Reference Table + Batch 2 plan Spec Deltas.
Tables use surface-card wrapper, surface-cream-strong header bands, hairline-soft row dividers.
Per-file tsc + residue grep clean.

Next: Chat 11 (camera scan + profile + notifications).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 6: Backfill commit hash into task_plan.md and progress.md.**

- [ ] **Step 7: Confirm before pushing.** Default: do not push.

---

## Chat 11 — Camera scan + profile + notifications

### Task 16: Migrate `app/dashboard/cameraScan/page.tsx`

**Files:**
- Modify: `app/dashboard/cameraScan/page.tsx`

Camera scan UI page. Composes `<ScanCtaButton>` (Batch 1 migrated), `<BarcodePreview>` (Batch 1 migrated), `<IsbnLookupBox>` (Batch 1 migrated). This file is mostly shell.

- [ ] **Step 1: Read** — `cat app/dashboard/cameraScan/page.tsx`.

- [ ] **Step 2: Apply page-level shell**

- Wrapper bg: `bg-canvas dark:bg-dark-canvas`
- Page H1: `font-display text-display-lg text-ink dark:text-on-dark tracking-tight`
- Camera frame container (if styled here): card recipe with `p-6`. Active "scanning" indicator → `text-accent-teal` (per spec §3.5: accent-teal = "active connection / camera-scan ready").
- Status / instruction text: `font-sans text-body-md text-body dark:text-on-dark/80`

- [ ] **Step 3: Drop `isDark` apparatus** if present.

- [ ] **Step 4: tsc + residue.** Expected: 0/0.

(Commit at end of Chat 11.)

---

### Task 17: Migrate `app/dashboard/profile/page.tsx`

**Files:**
- Modify: `app/dashboard/profile/page.tsx`

Profile page server entry. Composes profile forms (Task 18).

- [ ] **Step 1: Read** — `cat app/dashboard/profile/page.tsx`.

- [ ] **Step 2: Apply page recipe**

- Page H1: `font-display text-display-lg text-ink dark:text-on-dark tracking-tight`
- Section titles: `font-display text-display-md` or `text-title-lg` depending on whether they're hero-tier or card-tier
- Wrapper: `bg-canvas dark:bg-dark-canvas`

- [ ] **Step 3: tsc + residue.** Expected: 0/0.

(Commit at end of Chat 11.)

---

### Task 18: Migrate profile forms

**Files:**
- Modify: `app/profile/profileEditForm.tsx`
- Modify: `app/profile/profileNameForm.tsx`
- Modify: `app/profile/profileAvatarForm.tsx`

Form components for editing name + avatar.

- [ ] **Step 1: Read all three files.**

- [ ] **Step 2: For each form:**

- Form container: card recipe with `p-6`
- Form field group: `space-y-1.5` (label above input)
- Label: `font-sans text-caption-uppercase text-muted dark:text-on-dark-soft`
- Input: form input recipe
- Submit button: shared `<Button>` from `app/ui/button.tsx` (primary)
- Cancel/secondary action (if any): inline secondary cream button recipe
- Avatar preview: card recipe `p-4`; uploaded image inside a `rounded-card` frame with `border-hairline`
- Validation error text: `text-error font-sans text-body-sm`
- Success/saved toast (if inline): `text-success font-sans text-body-sm`

- [ ] **Step 3: tsc + per-file residue.** Expected: 0/0 for each file.

(Commit at end of Chat 11.)

---

### Task 19: Migrate `app/dashboard/notifications/loading.tsx`

**Files:**
- Modify: `app/dashboard/notifications/loading.tsx`

Notifications page loading skeleton.

- [ ] **Step 1: Read** — `cat app/dashboard/notifications/loading.tsx`.

- [ ] **Step 2: Apply skeleton recipe**

- Skeleton background: `bg-surface-cream-strong dark:bg-dark-surface-strong`
- Container: card recipe `p-6` if a wrapping card; otherwise just the skeleton tiles
- Optional `animate-pulse` retained if already used

- [ ] **Step 3: tsc + residue.** Expected: 0/0.

(Commit at end of Chat 11.)

---

### Task 20: Migrate `app/ui/dashboard/notificationPanel.tsx`

**Files:**
- Modify: `app/ui/dashboard/notificationPanel.tsx`

Notification center panel (slide-out or inline list of notifications).

- [ ] **Step 1: Read** — `cat app/ui/dashboard/notificationPanel.tsx`.

- [ ] **Step 2: Apply panel recipe**

- Panel container: card recipe with `p-6`. If it's a floating panel/dropdown, add `shadow-[0_4px_16px_rgba(20,20,19,0.08)]`. Inline panels: no shadow.
- Panel title: `font-display text-display-sm text-ink dark:text-on-dark` or `font-sans text-title-lg` depending on prominence
- Notification item rows: composed of `<NotificationItem>` (Batch 1 migrated). If this file inlines item markup instead of using the primitive, consider migrating to the primitive — log decision in `findings.md` if you do.
- Empty state: `font-sans text-body-md text-muted dark:text-on-dark-soft`
- "Mark all as read" action: text link `text-primary hover:text-primary-active dark:text-dark-primary font-sans text-body-sm`

- [ ] **Step 3: tsc + residue.** Expected: 0/0.

(Commit at end of Chat 11.)

---

### Task 21: Migrate `app/ui/dashboard/notificationToast.tsx`

**Files:**
- Modify: `app/ui/dashboard/notificationToast.tsx`

Toast component for transient notifications.

- [ ] **Step 1: Read** — `cat app/ui/dashboard/notificationToast.tsx`.

- [ ] **Step 2: Apply toast recipe**

- Toast container: `bg-surface-card dark:bg-dark-surface-card border border-hairline dark:border-dark-hairline rounded-card p-4 shadow-[0_4px_16px_rgba(20,20,19,0.08)]` (toast is genuinely floating, so shadow is allowed per spec §6.4)
- Toast title: `font-sans text-title-sm text-ink dark:text-on-dark`
- Toast body: `font-sans text-body-sm text-body dark:text-on-dark/80`
- Icon by type:
  - success → `text-success`
  - warning → `text-warning`
  - error → `text-error`
  - info → `text-accent-teal`
- Dismiss button: secondary cream icon button (`h-7 w-7 rounded-full bg-surface-card hover:bg-surface-cream-strong border-hairline`) with primary focus ring

- [ ] **Step 3: tsc + residue.** Expected: 0/0.

(Commit at end of Chat 11.)

---

### Task 22: Chat 11 audit + commit

**Files:**
- All Chat 11 files plus `task_plan.md` and `progress.md`.

- [ ] **Step 1: Project-wide tsc.** Expected: 0.

- [ ] **Step 2: Residue grep across all Chat 11 files** — same regex pair as Chat 9 audit.

- [ ] **Step 3: Update `task_plan.md` Chat 11 section.**

- [ ] **Step 4: Update `progress.md`** — Current position → Chat 11 done, next step Chat 12.

- [ ] **Step 5: Combined commit**

```bash
git add app/dashboard/cameraScan app/dashboard/profile app/profile \
        app/dashboard/notifications/loading.tsx \
        app/ui/dashboard/notificationPanel.tsx app/ui/dashboard/notificationToast.tsx \
        task_plan.md progress.md
git commit -m "$(cat <<'EOF'
feat(ui): migrate Batch 2 Chat 11 — camera scan + profile + notifications

Files migrated:
- app/dashboard/cameraScan/page.tsx
- app/dashboard/profile/page.tsx
- app/profile/profileEditForm.tsx, profileNameForm.tsx, profileAvatarForm.tsx
- app/dashboard/notifications/loading.tsx
- app/ui/dashboard/notificationPanel.tsx
- app/ui/dashboard/notificationToast.tsx

Recipe: Batch 1 plan Token Migration Reference Table + Batch 2 plan Spec Deltas.
Toast retains shadow per spec §6.4 (genuinely floating); inline panels do not.
Camera-scan "active" indicator uses accent-teal per spec §3.5.
Per-file tsc + residue grep clean.

Next: Chat 12 (learning module).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 6: Backfill commit hash.**

- [ ] **Step 7: Confirm before pushing.** Default: do not push.

---

## Chat 12 — Learning module

### Task 23: Migrate `app/dashboard/learning/page.tsx`

**Files:**
- Modify: `app/dashboard/learning/page.tsx`

Learning landing page. Composes the panels migrated in Tasks 24–28.

- [ ] **Step 1: Read** — `cat app/dashboard/learning/page.tsx`.

- [ ] **Step 2: Apply page shell**

- Wrapper bg: `bg-canvas dark:bg-dark-canvas`
- Page H1: `font-display text-display-lg text-ink dark:text-on-dark tracking-tight`
- Subtitle: `font-sans text-body-md text-body dark:text-on-dark/80`
- Section gap: standard spacing (`space-y-8` or whatever is already there)

- [ ] **Step 3: tsc + residue.** Expected: 0/0.

(Commit at end of Chat 12.)

---

### Task 24: Migrate `app/ui/dashboard/learning/collectionsPanel.tsx`

**Files:**
- Modify: `app/ui/dashboard/learning/collectionsPanel.tsx`

Curated collections panel.

- [ ] **Step 1: Read** — `cat app/ui/dashboard/learning/collectionsPanel.tsx`.

- [ ] **Step 2: Apply panel recipe**

- Panel container: card recipe with `p-8`
- Panel title: `font-display text-display-sm text-ink dark:text-on-dark`
- Eyebrow: `font-sans text-caption-uppercase text-muted dark:text-on-dark-soft`
- Collection tile within panel: cream-secondary card-tile (`bg-surface-cream-strong dark:bg-dark-surface-strong rounded-card p-5 transition hover:border-primary/20`)

- [ ] **Step 3: tsc + residue.** Expected: 0/0.

(Commit at end of Chat 12.)

---

### Task 25: Migrate `app/ui/dashboard/learning/courseCard.tsx`

**Files:**
- Modify: `app/ui/dashboard/learning/courseCard.tsx`

Course tile card.

- [ ] **Step 1: Read** — `cat app/ui/dashboard/learning/courseCard.tsx`.

- [ ] **Step 2: Apply card recipe**

- Container: `bg-surface-card dark:bg-dark-surface-card border border-hairline dark:border-dark-hairline rounded-card p-5 transition hover:border-primary/20 dark:hover:border-dark-primary/30`
- Course title: `font-sans text-title-md text-ink dark:text-on-dark`
- Course subtitle / instructor: `font-sans text-body-sm text-muted dark:text-on-dark-soft`
- Category badge: use shared `<Chip>` (Batch 1 migrated) with appropriate tone — `accent` for highlighted, `surface-card` default
- Progress / metadata: `font-sans text-caption text-muted`
- Cover image (if any): `rounded-card overflow-hidden border border-hairline`

- [ ] **Step 3: tsc + residue.** Expected: 0/0.

(Commit at end of Chat 12.)

---

### Task 26: Migrate `app/ui/dashboard/learning/searchForm.tsx`

**Files:**
- Modify: `app/ui/dashboard/learning/searchForm.tsx`

Learning-specific search input.

- [ ] **Step 1: Read** — `cat app/ui/dashboard/learning/searchForm.tsx`.

- [ ] **Step 2: Apply form input recipe** to the search input. Submit button → shared `<Button>` (primary). Search icon → `text-muted-soft` inside the input.

- [ ] **Step 3: tsc + residue.** Expected: 0/0.

(Commit at end of Chat 12.)

---

### Task 27: Migrate `app/ui/dashboard/learning/searchResultsPanel.tsx`

**Files:**
- Modify: `app/ui/dashboard/learning/searchResultsPanel.tsx`

Search results panel.

- [ ] **Step 1: Read** — `cat app/ui/dashboard/learning/searchResultsPanel.tsx`.

- [ ] **Step 2: Apply panel + result-row recipe**

- Panel container: card recipe `p-6`
- Result row: each row = card recipe `p-5` OR cream-secondary tile per design call. Add hover border.
- Result title: `font-sans text-title-md text-ink dark:text-on-dark`
- Result snippet: `font-sans text-body-sm text-body dark:text-on-dark/80`
- "No results" empty state: `font-sans text-body-md text-muted dark:text-on-dark-soft`

- [ ] **Step 3: tsc + residue.** Expected: 0/0.

(Commit at end of Chat 12.)

---

### Task 28: Migrate `app/ui/dashboard/learning-path-generator.tsx`

**Files:**
- Modify: `app/ui/dashboard/learning-path-generator.tsx`

Learning-path generator UI (likely a multi-step form/AI prompt surface).

- [ ] **Step 1: Read** — `cat app/ui/dashboard/learning-path-generator.tsx`.

- [ ] **Step 2: Apply generator-card recipe**

- Outer container: card recipe with `p-8`
- Step indicators / progress: tokenized chips or numbered dots; `bg-primary text-on-primary` for active step, `bg-surface-cream-strong text-muted` for inactive
- Form inputs: form input recipe
- Generate / submit button: shared `<Button>` primary
- Generated output card (the "your path" rendering): cream-secondary card with `p-6`
- Loading state: skeleton recipe — `bg-surface-cream-strong` blocks with optional `animate-pulse`

- [ ] **Step 3: tsc + residue.** Expected: 0/0.

(Commit at end of Chat 12.)

---

### Task 29: Migrate `app/ui/dashboard/studentChat.tsx`

**Files:**
- Modify: `app/ui/dashboard/studentChat.tsx`

Student chat surface (AI-assistant chat for students).

- [ ] **Step 1: Read** — `cat app/ui/dashboard/studentChat.tsx`.

- [ ] **Step 2: Apply chat recipe**

- Chat container: card recipe with `p-6`. Internal scrollable region: `overflow-y-auto`.
- User message bubble: `bg-primary text-on-primary rounded-card px-4 py-3 max-w-[75%] self-end font-sans text-body-md`
- Assistant message bubble: `bg-surface-cream-strong dark:bg-dark-surface-strong text-ink dark:text-on-dark rounded-card px-4 py-3 max-w-[75%] self-start font-sans text-body-md`
- Typing indicator: `text-muted dark:text-on-dark-soft font-sans text-caption italic`
- Input bar: form input recipe + send button (shared `<Button>` primary or icon-only primary)
- Avatar (if shown next to messages): use existing `<UserAvatar>` (Batch 1 migrated) with default tone

- [ ] **Step 3: tsc + residue.** Expected: 0/0.

(Commit at end of Chat 12.)

---

### Task 30: Chat 12 audit + Batch 2 acceptance

**Files:**
- All Chat 12 files plus `task_plan.md` and `progress.md`.

- [ ] **Step 1: Project-wide tsc.** Expected: 0.

- [ ] **Step 2: Residue grep across all Chat 12 files** — same regex pair as Chat 9 audit.

- [ ] **Step 3: Cross-batch acceptance audit per spec §7 Batch 2 acceptance criteria**

Run **across all Batch 2 files** combined:
```bash
grep -rnE "swin-charcoal|swin-ivory|swin-gold|swin-dark-bg|swin-dark-surface|\bswin-red\b" \
  app/login app/dashboard/page.tsx app/dashboard/book app/dashboard/cameraScan \
  app/dashboard/profile app/dashboard/notifications app/dashboard/learning \
  app/profile app/ui/loginForm.tsx app/ui/dashboard/student \
  app/ui/dashboard/summaryCards.tsx app/ui/dashboard/bookListMobile.tsx \
  app/ui/dashboard/borrowingHistoryFilter.tsx app/ui/dashboard/activeLoansTable.tsx \
  app/ui/dashboard/bookCatalogTable.tsx app/ui/dashboard/notificationPanel.tsx \
  app/ui/dashboard/notificationToast.tsx app/ui/dashboard/learning \
  app/ui/dashboard/learning-path-generator.tsx app/ui/dashboard/studentChat.tsx
```
Expected: 0 hits **except** `swin-red-brand` matches inside login brand-mark elements. Note: the `\bswin-red\b` regex word-boundary excludes `swin-red-brand` matches.

```bash
grep -rnE "text-gray-|bg-gray-|text-slate-|bg-slate-|border-slate-|border-gray-" \
  <same path list>
```
Expected: 0 hits.

If any unexpected residue is found, log in `findings.md` and fix before commit.

- [ ] **Step 4: Update `task_plan.md`** — replace Batch 1 sections with Batch 2 sections (or append Batch 2 at the bottom — match whatever Chat 9 introduced as the convention). Mark Batch 2 COMPLETE.

- [ ] **Step 5: Update `progress.md`**

- "Current position" → Current batch: 2 (COMPLETE); Current chat: 12 of 16 done; Last completed: full Batch 2 file list; Next step: open new chat to start Batch 3 (admin/staff — Chats 13–16 in spec numbering); Batch 3 plan does NOT yet exist.
- "What's done" → add Chat 12 entry + a "**Batch 2 COMPLETE**" marker
- "What's next (Batch 3)" → list spec §7 Batch 3 file scope; note that the Batch 3 plan must be written via `superpowers:writing-plans` against spec §7 Batch 3
- "How to start the next chat" → write a Chinese-hand-off block mirroring the Batch 1→2 hand-off at the bottom of `progress.md`, but pointing at Batch 3

- [ ] **Step 6: Combined commit**

```bash
git add app/dashboard/learning app/ui/dashboard/learning \
        app/ui/dashboard/learning-path-generator.tsx \
        app/ui/dashboard/studentChat.tsx \
        task_plan.md progress.md
git commit -m "$(cat <<'EOF'
feat(ui): migrate Batch 2 Chat 12 — learning module; complete Batch 2

Files migrated:
- app/dashboard/learning/page.tsx
- app/ui/dashboard/learning/collectionsPanel.tsx
- app/ui/dashboard/learning/courseCard.tsx
- app/ui/dashboard/learning/searchForm.tsx
- app/ui/dashboard/learning/searchResultsPanel.tsx
- app/ui/dashboard/learning-path-generator.tsx
- app/ui/dashboard/studentChat.tsx

Recipe: Batch 1 plan Token Migration Reference Table + Batch 2 plan Spec Deltas.
Chat bubbles use primary/on-primary for user, surface-cream-strong for assistant.
Cross-batch audit clean: 0 swin-* residue (except brand-mark swin-red-brand),
0 raw text-gray/bg-gray/text-slate.

Batch 2 COMPLETE. Next: Batch 3 (admin/staff) — plan does not yet exist;
new chat must invoke superpowers:writing-plans against spec §7 Batch 3.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 7: Backfill commit hash into task_plan.md and progress.md.**

- [ ] **Step 8: Confirm before pushing.** Default: do not push. User will handle visual review of the entire Batch 2 surface and decide whether to push.

---

## Acceptance criteria (per spec §7 Batch 2)

At end of Chat 12:

- [ ] All student-facing pages render coherently in both light + dark (visual review by user, not automated)
- [ ] No element references legacy class `swin-red` (the new `swin-red-brand` alias is allowed only in logo/brand-mark components — login page brand mark is the single expected match)
- [ ] No element references `swin-charcoal`, `swin-ivory`, `swin-gold`, `swin-dark-bg`, `swin-dark-surface`
- [ ] No raw `text-gray-*` / `bg-gray-*` / `text-slate-*` / `bg-slate-*` across any Batch 2 file (including sidenav.tsx + mobileMenu.tsx, which Chat 9 fully migrates)
- [ ] All form focus rings render in `primary` / `dark-primary`
- [ ] Button hover/active/disabled three states correct everywhere — covered by either `<Button>` primitive (Batch 1) or inline-button-recipe instances
- [ ] `pnpm tsc --noEmit` clean

## Risks specific to Batch 2

| Severity | Risk | Mitigation |
|---|---|---|
| 🟠 Medium | Migrating tables (Task 14) without breaking row-level conditional styling | Read `bookCatalogTable.tsx` carefully for status-based row tints; preserve the conditional logic, only swap the className strings |
| 🟠 Medium | Profile avatar form may handle file uploads with bespoke styling | Verify `<input type="file">` styling separately; browser-default file inputs ignore most CSS — accept that the file picker button looks native |
| 🟡 Low | StudentChat bubble overflow in dark mode | Dark variant `bg-dark-surface-strong` may be too close to `bg-dark-surface-card` parent; if visually indistinct, escalate by using `bg-dark-surface-card` for assistant bubbles and a `border` for separation |
| 🟡 Low | Learning-path-generator AI loading state animation | If existing animation is `bg-gradient-to-r animate-pulse`, replace with cream-strong skeleton + `animate-pulse`; do not introduce new gradients per spec §6.4 |
| 🟢 Very low | `swin-red-brand` accidentally swept by overzealous regex | Audit regex uses `\bswin-red\b` word-boundary to exclude `swin-red-brand` |

## Hand-off

Each chat ends per "Per-chat execution cadence" section above. After Chat 12 commits, the next chat opens Batch 3 (admin/staff pages). Batch 3 plan must be written via `superpowers:writing-plans` against spec §7 Batch 3 — it does not yet exist.

`progress.md` "Notes for next chat" should retain:
- Visual confirmation pending for Batch 2 (assistant-side claim of structural correctness only)
- `<SignOutButton>` callers cleaned up + `sidenav.tsx` / `mobileMenu.tsx` fully migrated in Chat 9 — these notes from prior chats can be **removed** after Chat 9
- Custom ThemeProvider hydration-flash known issue — retain
- No `pnpm lint` script — retain
- `accent='gold'` / `tone='gold'` props still resolve to amber — retain until Batch 3 prop-rename pass
