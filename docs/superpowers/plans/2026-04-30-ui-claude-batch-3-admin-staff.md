# UI Claude-Style Redesign — Batch 3: Admin/Staff + Final QA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all remaining admin- and staff-facing surfaces to the Claude-style design system, sweep up Batch 2 carry-overs (6 book sub-workflow pages, `staffDashboard`, `mobileNav`+`navLinks`), and execute final project-level cleanup (delete dead template files, drop legacy `swin-*` tokens from `tailwind.config.ts`, retire `/dev/primitives`, drop dormant `isPrivileged` prop).

**Architecture:** Same per-chat cadence as Batches 1 + 2 — file-by-file class swaps using the Token Migration Reference Table (Batch 1 plan, lines ~61–112) + Spec Deltas (Batch 2 plan, lines ~106–183) as the canonical recipes. Each chat ends in a single combined commit. Final chat (Chat 16) adds project-wide grep audit + tailwind config purge + dead-template deletion.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, custom `ThemeProvider` (NOT `next-themes`), shared primitives from Batch 1 (`<Button>`, `<Chip>`, `<StatusBadge>`, `<KpiCard>`, `<LoanCard>`, `<HoldCard>`, `<NotificationItem>`, etc.).

**Plan source links:**
- Spec: `docs/superpowers/specs/2026-04-29-ui-claude-style-redesign-design.md` (committed `b5b39ea`) — §7 Batch 3 = Chats 13–16
- Batch 1 plan (Token Migration Reference Table — class-swap dictionary): `docs/superpowers/plans/2026-04-29-ui-claude-batch-1-foundation.md` (committed `8f94019`)
- Batch 2 plan (Spec Deltas — page/component-level recipe dictionary): `docs/superpowers/plans/2026-04-29-ui-claude-batch-2-student-facing.md` (committed `24ff5f0`)
- Progress: `progress.md` — read for current state of file inventory + carry-over context

---

## Decisions log (assumed from prior batches; reconfirm before writing code)

### Decision 1: Carry-overs distributed across Chats 13/14/15/16 by topical cohesion

Spec §7 only listed Chats 13–16 with the spec-author's scope. Three sets of carry-overs must land in Batch 3:

1. **From Chat 12 spec-gap finding (6 book sub-workflow pages):** `book/items`, `book/holds`, `book/reservation`, `book/[id]`, `book/checkout`, `book/checkin`. Distributed:
   - Chat 14 (admin books management): `book/items` (student book browse landing), `book/[id]` (book detail) — both book-data surfaces
   - Chat 15 (admin overdue + workflow): `book/holds`, `book/reservation`, `book/checkout`, `book/checkin` — workflow surfaces

2. **From Chat 9 finding (`staffDashboard.tsx` 287 lines, 30 hits + `mobileNav.tsx` 219 lines, 12 hits + `navLinks.tsx` 236 lines):** 
   - Chat 13: `mobileNav.tsx` + `navLinks.tsx` (nav-shell siblings, fits with admin layout chrome work)
   - Chat 16: `staffDashboard.tsx` (staff-themed, fits with staff history)

3. **Newly discovered (during Batch 3 plan-writing):** `app/ui/dashboard/staff/{holdsManagementView,damageReportDetailModal,damageReportsViewer,historyViewer}.tsx` + `app/dashboard/staff/damage-reports/page.tsx` — these are referenced by staff pages but NOT in spec §7. Added to Chat 16 since they're staff-side viewer components.

### Decision 2: Spec §7 Chat 15 mentions `admin/history/*`, but no such directory exists

Confirmed via `glob app/dashboard/admin/history/**` = no files. Likely a spec-author placeholder for a future feature. Drop from Chat 15 scope; document in `findings.md` as a spec discrepancy.

### Decision 3: Spec §7 Chat 16 says "remove `/dev/primitives`" — confirm before deletion

Per Batch 1 Chat 7 (commit `9a5e47f`), `/dev/primitives` was created as a developer-only gallery for visual review. Spec acceptance criterion §7 Batch 3 explicitly says "`/dev/primitives` removed". Confirm with user during Chat 16 execution before the final delete; if user wants to keep it for future component additions, mark this acceptance criterion as deferred.

### Decision 4: Legacy `swin-*` token deletion in `tailwind.config.ts` (Chat 16)

Spec §7 Batch 3 acceptance: "Legacy tokens removed: `swin-charcoal`, `swin-ivory`, `swin-gold`, `swin-dark-bg`, `swin-dark-surface` deleted from `tailwind.config.ts`". The `swin-red-brand` alias **must** stay (it's used by `acmeLogo.tsx` brand mark + login hero brand mark). Final-step audit: project-wide `grep` for any of the deleted tokens; if 0 hits, deletion is safe. If hits remain, fix them first.

### Decision 5: Dead template files retirement (Chat 16)

Per Batch 2 Chat 9 finding (commit `0e33402`), these files are `next.js learn` template artifacts not used by the app:
- `app/ui/loginForm.tsx` (migrated for residue cleanliness in Chat 9; 0 imports)
- `app/ui/customers/table.tsx`
- `app/ui/invoices/{breadcrumbs,buttons,createForm,editForm,pagination,status,table}.tsx`
- `app/ui/dashboard/revenueChart.tsx`
- `app/ui/dashboard/latestInvoices.tsx`
- `app/ui/fonts.ts` (Lusitana/Inter from template; project uses next/font/google in `app/layout.tsx` since Batch 1 Chat 4)

Verify each has 0 imports in app code before deletion; if any are imported, defer that one and document as live-dependency.

### Decision 6: `isPrivileged` prop drop (Chat 16, Chat 11 carry-over)

Per Chat 11 finding (commit `0519b6d`): `isPrivileged` was retained on `profileEditForm`, `profileNameForm`, `profileAvatarForm` signatures as dormant (no longer drives styling). Callers in `actions.ts` + `app/profile/page.tsx` still pass it. Coordinated drop = remove the prop from form signatures + remove `isPrivileged` references from callers + remove the unused `isPrivileged` arg from any helper utilities. Run `pnpm tsc --noEmit` after each touch; expect callers to fail-compile until all sites updated.

---

## Spec deltas (higher-level recipe — reused from Batch 2 plan)

**The Token Migration Reference Table from Batch 1 plan (lines ~61–112) covers class-level swaps.** **The Batch 2 plan Spec Deltas section (lines ~106–183) covers page/component-level recipes:**
- Typography map (page H1 / section H2 / subsection H3 / KPI numeral / eyebrow / body / caption / code)
- Card / panel recipe (`bg-surface-card border-hairline rounded-card p-{5|6|8}`; no `shadow-*` except floating overlays)
- Button recipe (prefer shared `<Button>`; inline cream-secondary recipe; inline primary recipe)
- Form input recipe (`bg-canvas border-hairline rounded-btn h-10 px-3.5 + primary focus ring`)
- Focus ring (universal: `focus-visible:ring-2 ring-primary/40 ring-offset-2 ring-offset-canvas dark:ring-offset-dark-canvas`)
- Logo / brand mark (preserve `swin-red-brand` for Swinburne brand glyph; UI uses `primary`)
- Conditional `isDark` apparatus (drop ternaries; use paired `dark:` Tailwind classes; matches Chat 8 dashboardShell decision)
- `<SignOutButton>` callers (drop `className` override; default class is baked in)

**Additional Batch 3-specific deltas:**

### Tables in admin pages (Chat 13 users + Chat 15 overdue)

Use the table recipe established in Chat 10 (`activeLoansTable` / `bookCatalogTable`):
```
wrapper: bg-surface-card border-hairline rounded-card overflow-hidden
thead:   bg-surface-cream-strong dark:bg-dark-surface-strong
thead th: font-sans text-caption-uppercase text-ink dark:text-on-dark px-{4|6} py-3 text-left
tbody tr: border-t border-hairline-soft dark:border-dark-hairline hover:bg-surface-cream-strong/50
tbody td: px-{4|6} py-{3|4} font-sans text-body-sm
row-level title: font-sans text-title-md text-ink dark:text-on-dark
ISBN/barcode/code cells: font-mono text-code text-muted dark:text-on-dark-soft
```

For status badges inside tables — use `<StatusBadge>` primitive (Batch 1) or the inline pattern: `bg-success/15 text-success` (success), `bg-warning/15 text-warning` (warning), `bg-primary/15 text-primary` (alert/overdue), `bg-surface-cream-strong text-ink` (default/neutral).

### Modals/Drawers (Chat 14 manageBook* + Chat 15 cameraScanModal)

Per spec §6.4 elevation strategy: modals are floating overlays — they **may** retain a single `shadow-[0_4px_16px_rgba(20,20,19,0.08)]` for elevation. Backdrop: `bg-ink/50` (light) / `bg-dark-canvas/70` (dark). Modal panel: card recipe with `p-6` (per spec §5.3 modal padding map). Header divider: `border-hairline`. Close button: cream secondary icon button (icon-only, `<button>` recipe with primary focus ring).

### Forms (Chat 14 createBookForm / Chat 15 addBookForm)

Form fields: form input recipe everywhere. Field labels: `font-sans text-body-sm font-medium text-ink dark:text-on-dark mb-2`. Helper text: `font-sans text-caption text-muted dark:text-on-dark-soft mt-1`. Validation error: `text-error font-sans text-body-sm mt-1`. Submit button: shared `<Button>` (or inline primary recipe if Button is overkill for layout). Cancel/secondary: cream secondary inline recipe.

### Camera scan modal (Chat 15 admin/cameraScanModal)

Same recipe as Chat 11 `app/dashboard/cameraScan/page.tsx` (commit `0519b6d`):
- Modal panel: card recipe `p-6` + retained shadow per §6.4 (it's a floating overlay)
- Crosshair ring: `ring-accent-teal/60`
- Scanning indicator dot: `bg-accent-teal animate-pulse`
- Debug log inner panel keeps `bg-ink text-success` mono-terminal aesthetic (intentional dark-on-light contrast)

---

## Per-chat execution cadence (same as Batches 1 + 2)

Each chat ends with a single combined commit covering all files in that chat. Within a chat:

1. Migrate files file-by-file, using token table + spec deltas
2. Run `pnpm tsc --noEmit` after each file → must be 0 errors (note: `pnpm lint` doesn't exist in this project — see findings.md 2026-04-29 Chat 2)
3. Run residue grep on each touched file → must be 0 hits (extended regex; see Audit step in each chat's last task)
4. Update `task_plan.md` checkboxes for that chat
5. Update `progress.md` "Current position" + "What's done" + (last chat) "How to start the next chat"
6. Single `git commit` per chat with body listing all migrated files and any decisions made outside the literal recipe (mirror Batch 2 commit-message style — see commit `c422069` body for template)
7. Backfill commit hash into `progress.md` and `task_plan.md`

**Do not push without explicit user confirmation** per existing user feedback memory `feedback_git_push.md`.

---

## Tasks

---

## Chat 13 — Admin shell + dashboard + users + nav carry-overs

**Files in scope (in execution order):**
- Modify: `app/ui/dashboard/mobileNav.tsx` (219 lines, ~12 legacy hits — Batch 2 Chat 9 carry-over, mobile nav header)
- Modify: `app/ui/dashboard/navLinks.tsx` (236 lines — sibling of mobileNav, renders nav items)
- Modify: `app/dashboard/admin/layout.tsx` (13 lines, ~0 hits — thin wrapper, may need light token check)
- Modify: `app/dashboard/admin/page.tsx` (36 lines, 0 hits — server-only delegator; no UI to touch unless `<title>` or Promise.all chrome needs change)
- Modify: `app/ui/dashboard/admin/adminDashboard.tsx` (281 lines, ~44 hits — actual admin landing UI)
- Modify: `app/dashboard/admin/users/page.tsx` (1155 lines, ~61 hits — user management page; LARGEST single file in this batch)
- Modify: `app/admin/page.tsx` (16 lines, 0 hits — server-only redirect; verify no UI to touch)
- Verify: `app/dashboard/admin/loading.tsx` (5 lines — should already delegate to migrated `PageLoadingSkeleton`; expected no-op)
- Verify: `app/dashboard/admin/users/loading.tsx` (5 lines — same expected no-op)

### Task 1: Migrate `app/ui/dashboard/mobileNav.tsx` and `app/ui/dashboard/navLinks.tsx`

These are nav-shell siblings of `sidenav.tsx` + `mobileMenu.tsx` (both migrated in Chat 9). `mobileNav` is the top header bar visible on mobile that contains the menu trigger button + brand mark + `<ThemeToggle>`; `navLinks` renders the actual nav-link list used by both `sidenav` and `mobileMenu`.

- [ ] **Step 1: Read both files end-to-end**

Run: `cat app/ui/dashboard/mobileNav.tsx app/ui/dashboard/navLinks.tsx`. Identify:
- mobileNav: header container background, brand mark (likely `<AcmeLogo>`), menu trigger button, theme toggle slot, divider/border
- navLinks: nav-item link styles (default, hover, active), icon color, role-conditional rendering
- any `useTheme()` / `isDark` apparatus

- [ ] **Step 2: Apply Token Migration Reference Table to `mobileNav.tsx`**

Sweep every class match per Batch 1 plan table. Pair `dark:` variants. Match `mobileMenu.tsx` light-mode cream surface (Chat 9 finding 3) so the cream-drawer-vs-dark-header mismatch is resolved.

- mobileNav header container: `bg-canvas dark:bg-dark-canvas border-b border-hairline dark:border-dark-hairline`
- Menu trigger button: cream secondary inline icon recipe (matches `dashboardTitleBar` bell button from Chat 8)
- Brand mark (`<AcmeLogo>` or inline): keep `text-swin-red-brand` (brand glyph)
- `<ThemeToggle>` slot: pre-existing primitive, no changes

- [ ] **Step 3: Apply Token Migration Reference Table to `navLinks.tsx`**

Same as Chat 9 sidenav recipe (Step 3 of Task 1 in Batch 2 plan):
- Nav item (default): `font-sans text-nav-link text-body dark:text-on-dark/80 rounded-btn px-3 h-10 transition`
- Nav item (hover): `hover:bg-surface-cream-strong dark:hover:bg-dark-surface-strong hover:text-ink dark:hover:text-on-dark`
- Nav item (active/current page): `bg-primary/10 text-primary dark:bg-dark-primary/10 dark:text-dark-primary` (matches sidenav decision per Chat 9 finding 1 — primary tint for active)
- Icon: inherits `currentColor`; default state `text-muted-soft` if icon has its own color slot

- [ ] **Step 4: Drop `useTheme()` / `isDark` apparatus in both files if present**

Replace ternary `isDark ? 'a' : 'b'` patterns with paired `a dark:b` Tailwind classes. Drop unused `useTheme()` import.

- [ ] **Step 5: tsc + per-file residue check**

Run: `pnpm tsc --noEmit`. Expected: 0 errors.

For each file, run:
```bash
grep -nE "swin-charcoal|swin-ivory|swin-gold|swin-dark-bg|swin-dark-surface|\bswin-red\b|bg-white|text-gray-|bg-gray-|text-slate-|bg-slate-|border-slate-|border-gray-|rounded-2xl|rounded-3xl" <file>
```
Expected: 0 hits, except `swin-red-brand` retained on mobileNav brand glyph.

(Commit at end of Chat 13.)

---

### Task 2: Verify `app/dashboard/admin/layout.tsx` and `app/dashboard/admin/page.tsx` and `app/admin/page.tsx`

These are thin server-side files. Expected outcome: 0 changes needed for `admin/page.tsx` (server delegator) and `app/admin/page.tsx` (server redirect). `admin/layout.tsx` is a 13-line `<div className="space-y-8">` wrapper; verify no legacy tokens.

- [ ] **Step 1: Read all three files**

Run: `cat app/dashboard/admin/layout.tsx app/dashboard/admin/page.tsx app/admin/page.tsx`.

- [ ] **Step 2: Verify each is either a no-op or apply minimal token swaps**

If any has legacy tokens, swap per the table. Otherwise skip with a comment.

- [ ] **Step 3: tsc + residue grep on the trio**

Same regex as Task 1 Step 5. Expected: 0 hits (likely no changes needed).

(Commit at end of Chat 13.)

---

### Task 3: Migrate `app/ui/dashboard/admin/adminDashboard.tsx`

Actual admin landing UI. Composes KpiCards, recent loans table, daily-loans chart, top-borrowed-books list. Likely has its own page chrome (eyebrow/H1) since `admin/page.tsx` only sets `<title>`.

- [ ] **Step 1: Read the file end-to-end**

Run: `cat app/ui/dashboard/admin/adminDashboard.tsx`. Identify: page header (likely `<AdminShell>` use, in which case chrome is already migrated), KPI grid, recent loans rendering, chart container, top-books list.

- [ ] **Step 2: Apply Token Migration Reference Table**

Sweep every class match. Pair `dark:` variants.

- [ ] **Step 3: Apply spec deltas**

- Page wrapper: if not already wrapped in `<AdminShell>`, add it OR ensure existing wrapper uses `bg-canvas dark:bg-dark-canvas`
- KPI cards: replace inline cards with `<KpiCard>` primitive (Batch 1) where structurally compatible. If KPI display is custom, use card recipe `p-8` + `font-display text-display-sm` numeral
- Recent loans table: table recipe (see Spec deltas above)
- Chart container: card recipe `p-6`; chart bar colors map raw palette to tokens — primary for active/highlight, success/warning/accent-teal as semantic, surface-cream-strong as track
- Top books list: card recipe with cream-secondary tile per item

- [ ] **Step 4: tsc + residue grep**

Same regex as Task 1 Step 5. Expected: 0 hits.

(Commit at end of Chat 13.)

---

### Task 4: Migrate `app/dashboard/admin/users/page.tsx` (LARGEST file — 1155 lines)

User management page — likely contains: search/filter bar, user table (id/name/email/role/created/actions), inline create-user form or modal trigger, role-change dropdowns, delete confirmations, pagination.

This is the single largest migration in Batch 3. Plan to do it in 4–5 chunked edits to avoid blowing tsc context.

- [ ] **Step 1: Read the file in three passes**

Run: `cat app/dashboard/admin/users/page.tsx | head -400`, then `sed -n '400,800p' app/dashboard/admin/users/page.tsx`, then `sed -n '800,1155p' app/dashboard/admin/users/page.tsx`. Identify each surface (header, search/filter, table, modals, pagination, status messages).

- [ ] **Step 2: Apply page-level token swaps (header + filter bar) — first edit chunk**

Page H1: `font-display text-display-lg text-ink dark:text-on-dark tracking-tight` (or use `<AdminShell>` if not already).
Eyebrow: `font-sans text-caption-uppercase text-muted dark:text-on-dark-soft`.
Filter bar: card recipe `p-5` containing form inputs (form input recipe).

- [ ] **Step 3: Apply table recipe — second edit chunk**

Table wrapper `bg-surface-card border-hairline rounded-card overflow-hidden`. Thead `bg-surface-cream-strong`. Header cells `font-sans text-caption-uppercase text-ink`. Row dividers `border-hairline-soft`. Hover `bg-surface-cream-strong/50`. Row-level user name `font-sans text-title-md`. Email `font-sans text-body-sm text-muted`. Role badge: use `<RoleBadge>` primitive (Batch 1 migrated) — admin = primary tone, staff = accent-amber, student = surface-card.

- [ ] **Step 4: Apply modal/dialog recipe — third edit chunk**

Any inline create-user / edit-user / delete-confirm modal: card recipe `p-6` + retained shadow per §6.4. Backdrop `bg-ink/50 dark:bg-dark-canvas/70`. Form fields use form input recipe; submit → shared `<Button>`; cancel → cream secondary inline.

- [ ] **Step 5: Apply action button recipe — fourth edit chunk**

Per-row action buttons (edit/delete): cream secondary icon recipe with primary focus ring. Inline create-user CTA at top of page: shared `<Button>`. Pagination buttons: cream secondary inline pill recipe.

- [ ] **Step 6: tsc + residue grep**

After each chunk, run tsc to catch issues incrementally. Final residue grep on the file:
```bash
grep -nE "swin-charcoal|swin-ivory|swin-gold|swin-dark-bg|swin-dark-surface|\bswin-red\b|bg-white|text-gray-|bg-gray-|text-slate-|bg-slate-|border-slate-|border-gray-|rounded-2xl|rounded-3xl|text-emerald-|bg-emerald-|text-amber-|bg-amber-|text-rose-|bg-rose-|text-red-[0-9]|bg-red-[0-9]" app/dashboard/admin/users/page.tsx
```
Expected: 0 hits.

(Commit at end of Chat 13.)

---

### Task 5: Verify admin loading.tsx files are no-op

`app/dashboard/admin/loading.tsx` and `app/dashboard/admin/users/loading.tsx` are 5 lines each — should both delegate to the shared migrated `PageLoadingSkeleton`. Confirm visually + no edit needed.

- [ ] **Step 1: Read both files**

Run: `cat app/dashboard/admin/loading.tsx app/dashboard/admin/users/loading.tsx`.

- [ ] **Step 2: Confirm both delegate to `PageLoadingSkeleton`**

If either has legacy tokens or doesn't delegate, migrate per the shared skeleton recipe (already migrated in Chat 11).

- [ ] **Step 3: No commit needed (no-op)**

---

### Task 6: Chat 13 audit + combined commit

- [ ] **Step 1: Project-wide tsc**

Run: `pnpm tsc --noEmit`. Expected: 0 errors.

- [ ] **Step 2: Per-file residue grep** across all Chat 13 files (mobileNav, navLinks, layout, page, adminDashboard, users/page, admin/page) — extended regex from Task 4 Step 6.

Expected: 0 hits (with `swin-red-brand` allowed on brand glyphs only).

- [ ] **Step 3: Update `task_plan.md`** — append Chat 13 section with checkboxes, mark Chat 13 done.

- [ ] **Step 4: Update `progress.md`** — "Current position" with chat number + last completed + next step; "What's done" section appends Chat 13 entry; "Notes for next chat" updated.

- [ ] **Step 5: Combined commit**

```bash
git add app/ui/dashboard/mobileNav.tsx app/ui/dashboard/navLinks.tsx \
        app/dashboard/admin/layout.tsx app/dashboard/admin/page.tsx \
        app/ui/dashboard/admin/adminDashboard.tsx \
        app/dashboard/admin/users/page.tsx \
        app/admin/page.tsx \
        task_plan.md progress.md
git commit -m "$(cat <<'EOF'
feat(ui): migrate Batch 3 Chat 13 — admin shell + users + nav carry-overs

Files migrated:
- app/ui/dashboard/mobileNav.tsx
- app/ui/dashboard/navLinks.tsx
- app/dashboard/admin/layout.tsx
- app/dashboard/admin/page.tsx
- app/ui/dashboard/admin/adminDashboard.tsx
- app/dashboard/admin/users/page.tsx (1155 lines, largest in Batch 3)
- app/admin/page.tsx

Recipe: Batch 1 plan Token Migration Reference Table + Batch 2 plan
Spec Deltas. Table recipe per Chat 10 establishment.
mobileNav + navLinks resolves Chat 9 cream-drawer-vs-dark-header
mismatch carry-over.

Per-file audit clean: 0 hits across all 7 files.
Project-wide pnpm tsc --noEmit clean.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 6: Backfill commit hash into task_plan.md and progress.md.**

---

## Chat 14 — Admin books management + 2 student-facing book carry-overs

**Files in scope (in execution order):**
- Modify: `app/ui/dashboard/manageBookDrawer.tsx` (79 lines)
- Modify: `app/ui/dashboard/manageBookModal.tsx` (93 lines)
- Modify: `app/ui/dashboard/manageCopiesModal.tsx` (257 lines)
- Modify: `app/ui/dashboard/createBookForm.tsx` (187 lines)
- Modify: `app/ui/dashboard/recommendations/recommendationLab.tsx` (464 lines, large)
- Modify: `app/dashboard/book/items/page.tsx` (165 lines, ~3 hits — Batch 2 carry-over, student book browse landing)
- Modify: `app/dashboard/book/[id]/page.tsx` (220 lines, ~25+ hits — Batch 2 carry-over, book detail page)

### Task 7: Migrate `app/ui/dashboard/manageBookDrawer.tsx`

Slide-out drawer for managing a book. Likely fixed-position panel with title bar + body + footer actions.

- [ ] **Step 1: Read** — `cat app/ui/dashboard/manageBookDrawer.tsx`.

- [ ] **Step 2: Apply drawer recipe**

- Drawer panel: card recipe `p-6` + retained shadow per §6.4 (floating overlay)
- Title bar: `font-display text-display-sm text-ink dark:text-on-dark` + close button (cream secondary icon)
- Body: form input recipe for editable fields; static fields use `font-sans text-body-md text-ink` + label `font-sans text-caption-uppercase text-muted`
- Footer actions: shared `<Button>` for primary; cream secondary for cancel
- Backdrop: `bg-ink/50 dark:bg-dark-canvas/70`

- [ ] **Step 3: tsc + residue grep.** Expected: 0/0.

(Commit at end of Chat 14.)

---

### Task 8: Migrate `app/ui/dashboard/manageBookModal.tsx`

Modal counterpart to the drawer. Same recipe but centered modal instead of slide-out.

- [ ] **Step 1: Read** — `cat app/ui/dashboard/manageBookModal.tsx`.

- [ ] **Step 2: Apply modal recipe**

Same as Task 7 except positioning (centered overlay). Backdrop, panel surface, title bar, footer actions all identical.

- [ ] **Step 3: tsc + residue grep.** Expected: 0/0.

(Commit at end of Chat 14.)

---

### Task 9: Migrate `app/ui/dashboard/manageCopiesModal.tsx` (257 lines)

Manages copy-level state for a book (per-copy status, location, condition).

- [ ] **Step 1: Read** — `cat app/ui/dashboard/manageCopiesModal.tsx`.

- [ ] **Step 2: Apply modal recipe**

- Modal panel: card recipe `p-6` + retained shadow
- Per-copy row: cream-secondary tile (`bg-surface-cream-strong dark:bg-dark-surface-strong rounded-card p-4`)
- Copy ID/barcode: `font-mono text-code text-muted`
- Status badge: `<StatusBadge>` primitive (success/warning/primary/accent-teal per copy state)
- Inline action button (mark-damaged / mark-lost / etc): cream secondary inline pill recipe

- [ ] **Step 3: tsc + residue grep.** Expected: 0/0.

(Commit at end of Chat 14.)

---

### Task 10: Migrate `app/ui/dashboard/createBookForm.tsx` (187 lines)

Form to create a new book record. Likely has ISBN lookup, title, author, year, genre, total copies fields.

- [ ] **Step 1: Read** — `cat app/ui/dashboard/createBookForm.tsx`.

- [ ] **Step 2: Apply form recipe**

- Form container: card recipe `p-6`
- Field labels: `font-sans text-body-sm font-medium text-ink dark:text-on-dark mb-2`
- Inputs: form input recipe everywhere
- ISBN lookup: use `<IsbnLookupBox>` primitive if not already
- Submit: shared `<Button>` (primary)
- Cancel: cream secondary inline button

- [ ] **Step 3: tsc + residue grep.** Expected: 0/0.

(Commit at end of Chat 14.)

---

### Task 11: Migrate `app/ui/dashboard/recommendations/recommendationLab.tsx` (464 lines)

Largest single file in Chat 14. Likely has a recommender control panel + per-rule editor + preview/test surface. Plan to chunk into 2–3 edits.

- [ ] **Step 1: Read in two passes** — `cat -n app/ui/dashboard/recommendations/recommendationLab.tsx | head -250` then `sed -n '250,464p' app/ui/dashboard/recommendations/recommendationLab.tsx`.

- [ ] **Step 2: Apply panel + form recipe — first chunk (header + control panel)**

- Outer container: card recipe `p-8`
- Section dividers: `border-hairline`
- Form fields: form input recipe
- Action buttons: shared `<Button>` for primary, cream secondary for secondary

- [ ] **Step 3: Apply preview/result recipe — second chunk**

- Preview card: card recipe `p-6` cream-canvas
- Result item: cream-secondary tile pattern
- "No results" empty state: `font-sans text-body-md text-muted` inside card recipe

- [ ] **Step 4: Apply rule-editor recipe — third chunk if applicable**

- Inline rule rows: cream-secondary tile or cream-strong divider rows
- Rule-type pills: `<Chip>` primitive with appropriate tone

- [ ] **Step 5: tsc + residue grep.** Expected: 0/0.

(Commit at end of Chat 14.)

---

### Task 12: Migrate `app/dashboard/book/items/page.tsx` (Batch 2 carry-over)

Student book browse landing page (target of `book/page.tsx` redirect). Likely composes search + filter + book list.

- [ ] **Step 1: Read** — `cat app/dashboard/book/items/page.tsx`.

- [ ] **Step 2: Apply page-level recipe**

- Page wrapper: `bg-canvas dark:bg-dark-canvas`
- H1: `font-display text-display-lg text-ink tracking-tight` (or `<DashboardTitleBar>` if pattern matches)
- Search/filter: form input recipe + cream secondary buttons
- Book list: reuse `<BookCatalogTable>` (Chat 10 migrated) or `<BookListMobile>` (Chat 10 migrated) per existing structure
- Quick action CTA at top (e.g., "Add new book" if shown to staff/admin): shared `<Button>`

- [ ] **Step 3: tsc + residue grep.** Expected: 0/0.

(Commit at end of Chat 14.)

---

### Task 13: Migrate `app/dashboard/book/[id]/page.tsx` (Batch 2 carry-over, ~25+ hits)

Book detail page. Composes book metadata + cover + availability + per-copy status + reservation/borrow CTAs + back-link.

- [ ] **Step 1: Read** — `cat app/dashboard/book/[id]/page.tsx`.

- [ ] **Step 2: Apply page-level + card recipe**

- Page wrapper: `bg-canvas dark:bg-dark-canvas`
- Back-link: cream secondary inline pill recipe
- Title section: card recipe `p-6` containing `font-display text-display-sm` title + author italic + `<RoleBadge>` for status
- Metadata grid (`<dl>`): card recipe `p-5` + `font-mono text-code text-muted` for values + `font-sans text-caption-uppercase text-muted` for labels
- Tags list: `<Chip>` primitive with appropriate tones
- Action panel: card recipe `p-5` containing primary CTA (`<Button>`) + secondary cream actions
- Per-copy listing: cream-secondary tile per copy with status pill

- [ ] **Step 3: tsc + residue grep.** Expected: 0/0.

(Commit at end of Chat 14.)

---

### Task 14: Chat 14 audit + combined commit

- [ ] **Step 1: Project-wide tsc.** Expected: 0.

- [ ] **Step 2: Per-file residue grep** across all 7 Chat 14 files. Same regex as Chat 13 Task 6.

- [ ] **Step 3: Update `task_plan.md` + `progress.md`.**

- [ ] **Step 4: Combined commit** (mirror Chat 13 commit-message structure; list all 7 files).

- [ ] **Step 5: Backfill commit hash.**

---

## Chat 15 — Admin overdue + add-book + 4 book sub-workflow carry-overs

**Files in scope (in execution order):**
- Modify: `app/dashboard/admin/overdue/page.tsx` (46 lines, server delegator) + `app/ui/dashboard/admin/overdueViewer.tsx` (248 lines, ~14 hits — actual UI)
- Modify: `app/dashboard/admin/books/new/page.tsx` (23 lines, server delegator) + `app/ui/dashboard/admin/addBookForm.tsx` (344 lines, ~11 hits — actual form)
- Modify: `app/ui/dashboard/admin/cameraScanModal.tsx` (164 lines, ~5 hits — used by addBookForm)
- Modify: `app/dashboard/book/holds/page.tsx` (243 lines, Batch 2 carry-over)
- Modify: `app/dashboard/book/reservation/page.tsx` (200 lines, Batch 2 carry-over)
- Modify: `app/dashboard/book/checkout/page.tsx` (138 lines, Batch 2 carry-over, staff-side)
- Modify: `app/dashboard/book/checkin/page.tsx` (185 lines, Batch 2 carry-over, staff-side)

### Task 15: Migrate `app/dashboard/admin/overdue/page.tsx` (server delegator) + `overdueViewer.tsx`

`page.tsx` likely just calls `getDashboardSession` + queries + delegates to `<OverdueViewer>`. Verify no UI to swap; main work is in viewer.

- [ ] **Step 1: Read both files** — `cat app/dashboard/admin/overdue/page.tsx app/ui/dashboard/admin/overdueViewer.tsx`.

- [ ] **Step 2: If `page.tsx` has UI, apply token swaps; otherwise no-op.**

- [ ] **Step 3: Apply table recipe to `overdueViewer.tsx`**

Same as Chat 13 users table recipe. Status badges: overdue → `<StatusBadge tone="overdue">` (solid primary fill per Chat 5/6 establishment). Days-overdue indicator: `font-mono text-code text-primary` for >7 days, `text-warning` for 1-7 days.

- [ ] **Step 4: Apply page-level recipe to viewer header**

Eyebrow + display-md H2 + body-md description; action buttons (export, send reminders) → cream secondary inline pill recipe or shared `<Button>` for primary.

- [ ] **Step 5: tsc + residue grep.** Expected: 0/0.

(Commit at end of Chat 15.)

---

### Task 16: Migrate `app/dashboard/admin/books/new/page.tsx` (server delegator) + `addBookForm.tsx` + `cameraScanModal.tsx`

`page.tsx` server-only. `addBookForm.tsx` is the actual form (344 lines). `cameraScanModal.tsx` is invoked from the form for ISBN scan.

- [ ] **Step 1: Read all three files**

- [ ] **Step 2: `page.tsx` — verify thin/no-op**

If has UI, apply minimal swaps.

- [ ] **Step 3: Apply form recipe to `addBookForm.tsx`**

Same as Chat 14 Task 10 (createBookForm). `cameraScanModal.tsx` is a child invoked via state — leave the trigger button + modal-mount logic untouched, just style.

- [ ] **Step 4: Apply scan-modal recipe to `cameraScanModal.tsx`**

- Modal panel: card recipe `p-6` + retained shadow per §6.4
- Crosshair ring: `ring-accent-teal/60`
- Scanning indicator: `bg-accent-teal animate-pulse`
- Captured ISBN display: `font-mono text-code text-success` with cream-canvas chip
- Close button: cream secondary icon recipe
- Backdrop: `bg-ink/50 dark:bg-dark-canvas/70`

- [ ] **Step 5: tsc + residue grep across all three files.** Expected: 0/0.

(Commit at end of Chat 15.)

---

### Task 17: Migrate `app/dashboard/book/holds/page.tsx` (Batch 2 carry-over, 243 lines)

Student holds list. Per Chat 12 spec-gap finding.

- [ ] **Step 1: Read** — `cat app/dashboard/book/holds/page.tsx`.

- [ ] **Step 2: Apply page + table recipe**

Same recipe as Chat 10 history page (`book/history/page.tsx`). Empty state card recipe + primary CTA. Holds list: table recipe OR card-per-hold pattern depending on existing structure. Use `<HoldCard>` primitive (Batch 1) for the per-hold card if structurally compatible.

- [ ] **Step 3: tsc + residue grep.** Expected: 0/0.

(Commit at end of Chat 15.)

---

### Task 18: Migrate `app/dashboard/book/reservation/page.tsx` (Batch 2 carry-over, 200 lines)

Student reservation list. Similar to holds page.

- [ ] **Step 1: Read** — `cat app/dashboard/book/reservation/page.tsx`.

- [ ] **Step 2: Apply same recipe as Task 17**

Use `<HoldCard>` primitive (Ready / Queued variants) per existing reservation states. Empty state with primary CTA.

- [ ] **Step 3: tsc + residue grep.** Expected: 0/0.

(Commit at end of Chat 15.)

---

### Task 19: Migrate `app/dashboard/book/checkout/page.tsx` (Batch 2 carry-over, 138 lines, staff-side)

Staff workflow for checking out a book to a patron. `app/staff/page.tsx` redirects here (since staff role lands here on login per existing logic).

- [ ] **Step 1: Read** — `cat app/dashboard/book/checkout/page.tsx`.

- [ ] **Step 2: Apply workflow page recipe**

- Page wrapper: `bg-canvas dark:bg-dark-canvas`
- H1: `font-display text-display-lg text-ink tracking-tight` (or `<DashboardTitleBar>`)
- Patron lookup section: card recipe `p-6` + form input recipe
- Selected patron card: card recipe `p-5` with `<UserAvatar>` + name (display-sm) + role (`<RoleBadge>`)
- Book scan/lookup section: card recipe + `<IsbnLookupBox>` primitive + `<ScanCtaButton>` (Batch 1)
- Selected book card: card recipe `p-5` with `<BookCover>` + title + author + status
- Checkout submit: shared `<Button>` (primary)
- Receipt-style confirmation (if shown): use `<TransactionReceipt>` primitive (Batch 1 migrated)

- [ ] **Step 3: tsc + residue grep.** Expected: 0/0.

(Commit at end of Chat 15.)

---

### Task 20: Migrate `app/dashboard/book/checkin/page.tsx` (Batch 2 carry-over, 185 lines, staff-side)

Staff workflow for returning a book. Similar pattern to checkout.

- [ ] **Step 1: Read** — `cat app/dashboard/book/checkin/page.tsx`.

- [ ] **Step 2: Apply same workflow recipe as Task 19**

Mirror checkout structure. Returned-book confirmation card: same `<TransactionReceipt>` primitive if used, or card recipe with success indicator (`text-success` + checkmark icon).

- [ ] **Step 3: tsc + residue grep.** Expected: 0/0.

(Commit at end of Chat 15.)

---

### Task 21: Chat 15 audit + combined commit

- [ ] **Step 1: Project-wide tsc.** Expected: 0.

- [ ] **Step 2: Per-file residue grep** across all 9 Chat 15 files (overdue/page, overdueViewer, books/new/page, addBookForm, cameraScanModal, holds/page, reservation/page, checkout/page, checkin/page). Same regex as Chat 13 Task 6.

- [ ] **Step 3: Update `task_plan.md` + `progress.md`.**

- [ ] **Step 4: Combined commit** (mirror Chat 13 commit-message structure; list all 9 files).

- [ ] **Step 5: Backfill commit hash.**

---

## Chat 16 — Staff dashboards + history + final QA + cleanup

**Files in scope (in execution order):**

**Migration phase:**
- Verify: `app/staff/page.tsx` (16 lines, server redirect — no-op expected)
- Modify: `app/dashboard/staff/history/page.tsx` (66 lines, likely server delegator) + `app/ui/dashboard/staff/historyViewer.tsx` (276 lines)
- Modify: `app/dashboard/staff/damage-reports/page.tsx` (79 lines, server delegator) + `app/ui/dashboard/staff/damageReportsViewer.tsx` (255 lines) + `app/ui/dashboard/staff/damageReportDetailModal.tsx` (190 lines)
- Modify: `app/ui/dashboard/staff/holdsManagementView.tsx` (201 lines, used by staff holds workflow)
- Modify: `app/ui/dashboard/staff/staffDashboard.tsx` (287 lines, ~30 hits — Chat 9 carry-over)

**Cleanup phase (in this order — order matters):**
- Drop `isPrivileged` prop coordination (Chat 11 carry-over)
- Delete dead template files
- Remove `/dev/primitives` (per spec §7 Chat 16 acceptance)
- Delete legacy `swin-*` tokens from `tailwind.config.ts`
- Project-wide audit

### Task 22: Verify `app/staff/page.tsx` is no-op

- [ ] **Step 1: Read** — `cat app/staff/page.tsx`. Confirm it's a server redirect (likely to `/dashboard/book/checkout` per current state).

- [ ] **Step 2: No edit needed.**

---

### Task 23: Migrate `app/dashboard/staff/history/page.tsx` + `historyViewer.tsx`

- [ ] **Step 1: Read both** — `cat app/dashboard/staff/history/page.tsx app/ui/dashboard/staff/historyViewer.tsx`.

- [ ] **Step 2: `page.tsx` — verify thin/no-op or apply minimal swaps.**

- [ ] **Step 3: Apply table recipe to `historyViewer.tsx`**

Same as Chat 13 users table recipe. Filter bar at top: form input recipe + cream secondary buttons. Date-range picker: use `<DueDatePicker>` primitive (Batch 1) if structurally compatible. Export button: shared `<Button>` or cream secondary inline pill.

- [ ] **Step 4: tsc + residue grep.** Expected: 0/0.

(Commit at end of Chat 16.)

---

### Task 24: Migrate `app/dashboard/staff/damage-reports/page.tsx` + `damageReportsViewer.tsx` + `damageReportDetailModal.tsx`

This trio handles staff damage-report workflow. Newly discovered during plan-writing — wasn't in spec §7 but exists.

- [ ] **Step 1: Read all three files.**

- [ ] **Step 2: `page.tsx` — verify thin/no-op or apply minimal swaps.**

- [ ] **Step 3: Apply table recipe to `damageReportsViewer.tsx`**

Per-row severity badge: `<StatusBadge>` with appropriate tone (success for resolved, warning for in-progress, primary for severe/escalated).

- [ ] **Step 4: Apply modal recipe to `damageReportDetailModal.tsx`**

Modal panel card recipe `p-6` + retained shadow per §6.4. Photo gallery (if any): cream-secondary tiles. Resolution form: form input recipe. Submit + close buttons per Chat 14 Task 7 footer recipe.

- [ ] **Step 5: tsc + residue grep across all three.** Expected: 0/0.

(Commit at end of Chat 16.)

---

### Task 25: Migrate `app/ui/dashboard/staff/holdsManagementView.tsx`

Staff-side view of holds management. Likely a tabbed list (pending / ready / cancelled) with per-hold action buttons.

- [ ] **Step 1: Read** — `cat app/ui/dashboard/staff/holdsManagementView.tsx`.

- [ ] **Step 2: Apply tab + table recipe**

Tab bar: same as Chat 10 myBooksTabs recipe (`border-hairline` underline; active tab `text-ink` + `bg-primary` underline-stripe; inactive tabs `text-muted` hover `text-muted`). Tab counts: cream-strong / primary-tint conditional pills.

Hold list: card-per-hold using `<HoldCard>` primitive where possible (Batch 1 migrated; has Ready / Queued variants). Per-hold action button (cancel / fulfil / mark-no-show): cream secondary inline pill recipe.

- [ ] **Step 3: tsc + residue grep.** Expected: 0/0.

(Commit at end of Chat 16.)

---

### Task 26: Migrate `app/ui/dashboard/staff/staffDashboard.tsx` (Chat 9 carry-over, 287 lines, ~30 hits)

Staff landing dashboard. Counterpart to `studentDashboard` (Chat 9 migrated) and `adminDashboard` (Chat 13 migrated). Likely has KPI grid + recent activity + quick-actions for staff workflows (checkout / checkin / damage / holds).

- [ ] **Step 1: Read** — `cat app/ui/dashboard/staff/staffDashboard.tsx`.

- [ ] **Step 2: Apply dashboard recipe**

Mirror Chat 9 `studentDashboard.tsx` decisions:
- Drop `isDark` apparatus if present; use paired `dark:` Tailwind classes
- KPI cards: replace inline cards with `<KpiCard>` primitive where structurally compatible
- Quick-action tiles: drop gradient icon backgrounds + scale-on-hover + hover-shadow per spec §6.4; semantic icon colors (Checkout → primary, Checkin → success, Damage → warning, Holds → accent-teal)
- Recent-activity list: card recipe `p-6` with cream-secondary rows
- Page chrome: use `<DashboardTitleBar>` (Chat 8 migrated) if structure allows

- [ ] **Step 3: tsc + residue grep.** Expected: 0/0.

(Commit at end of Chat 16.)

---

### Task 27: Drop dormant `isPrivileged` prop (Chat 11 carry-over)

Coordinate prop removal across:
- `app/profile/profileEditForm.tsx` — remove `isPrivileged` from signature
- `app/profile/profileNameForm.tsx` — same
- `app/profile/profileAvatarForm.tsx` — same
- `app/profile/page.tsx` — remove `isPrivileged` arg from form invocations
- `app/profile/actions.ts` — remove `isPrivileged` arg if it's a function parameter (verify before deleting)
- Any other caller — `grep -rn 'isPrivileged' app/profile/` to find all sites

- [ ] **Step 1: Find all `isPrivileged` references**

```bash
grep -rn 'isPrivileged' app/
```

- [ ] **Step 2: Drop from form component signatures + remove unused destructuring**

- [ ] **Step 3: Drop from caller invocations**

- [ ] **Step 4: tsc** — Expected: 0 errors. If any error, fix the missed caller.

- [ ] **Step 5: Re-grep to confirm 0 references**

```bash
grep -rn 'isPrivileged' app/
```
Expected: 0 hits.

(Commit at end of Chat 16.)

---

### Task 28: Delete dead template files

These are `next.js learn` template artifacts not used by the app. Per Decision 5 in this plan.

- [ ] **Step 1: Verify each file has 0 imports**

For each candidate:
```bash
grep -rn "from '@/app/ui/loginForm'" app/  # repeat per file
```
Expected: 0 hits (if non-zero, the file is live — defer deletion + document).

Files to verify:
- `app/ui/loginForm.tsx`
- `app/ui/customers/table.tsx`
- `app/ui/invoices/breadcrumbs.tsx`, `buttons.tsx`, `createForm.tsx`, `editForm.tsx`, `pagination.tsx`, `status.tsx`, `table.tsx`
- `app/ui/dashboard/revenueChart.tsx`
- `app/ui/dashboard/latestInvoices.tsx`
- `app/ui/fonts.ts`

- [ ] **Step 2: Delete confirmed-unused files**

```bash
rm app/ui/loginForm.tsx app/ui/customers/table.tsx
rm app/ui/invoices/breadcrumbs.tsx app/ui/invoices/buttons.tsx app/ui/invoices/createForm.tsx app/ui/invoices/editForm.tsx app/ui/invoices/pagination.tsx app/ui/invoices/status.tsx app/ui/invoices/table.tsx
rm app/ui/dashboard/revenueChart.tsx app/ui/dashboard/latestInvoices.tsx
rm app/ui/fonts.ts
```

- [ ] **Step 3: Remove now-empty directories**

```bash
rmdir app/ui/customers app/ui/invoices 2>/dev/null  # ignore if not empty
```

- [ ] **Step 4: tsc** — Expected: 0 errors.

(Commit at end of Chat 16.)

---

### Task 29: Remove `/dev/primitives` (per spec §7 Chat 16 acceptance)

**Confirm with user before executing this step** (per Decision 3).

- [ ] **Step 1: Confirm with user.** Default if no response: proceed (matches spec literal).

- [ ] **Step 2: Delete the dev gallery**

```bash
rm app/dev/primitives/page.tsx
rm app/dev/layout.tsx
rmdir app/dev/primitives app/dev 2>/dev/null
```

- [ ] **Step 3: tsc** — Expected: 0 errors.

(Commit at end of Chat 16.)

---

### Task 30: Delete legacy `swin-*` tokens from `tailwind.config.ts`

Per Decision 4 + spec §7 Batch 3 acceptance criterion.

- [ ] **Step 1: Project-wide grep audit FIRST**

```bash
grep -rnE "swin-charcoal|swin-ivory|swin-gold|swin-dark-bg|swin-dark-surface" app/
```
Expected: 0 hits in `app/`. If any hit found, fix it BEFORE proceeding (the deletion will break the build otherwise).

- [ ] **Step 2: Edit `tailwind.config.ts`**

Locate the `swin: { ... }` block in `theme.extend.colors`. Remove these keys:
- `charcoal`
- `ivory`
- `gold`
- `dark-bg`
- `dark-surface`

**Keep** `red` (= `#C82333`, used by `swin-red-brand` alias and tooling).

The block becomes:
```ts
swin: {
  red: '#C82333',
  black: '#000000',
},
```

(Or remove the whole `swin: {}` block if only the `red` is needed — and `red` is already exposed via `swin-red-brand` alias which is a top-level color key. Verify: if `swin-red-brand` resolves correctly without the `swin.red` nested key, the whole block can be deleted. If not, keep the minimal form above.)

- [ ] **Step 3: tsc + build sanity**

```bash
pnpm tsc --noEmit  # expected: 0 errors
pnpm build         # expected: build succeeds; any reference to deleted tokens fails here
```

If build fails: a leftover `swin-charcoal/ivory/gold/dark-bg/dark-surface` reference exists somewhere. Find it via the build error message + the project-wide grep, fix, re-build.

(Commit at end of Chat 16.)

---

### Task 31: Final project-wide audit + Batch 3 acceptance (per spec §7 Batch 3 criteria)

- [ ] **Step 1: Project-wide tsc.** Expected: 0 errors.

- [ ] **Step 2: Final residue grep across `app/`** (the canonical Batch 3 acceptance check):

```bash
grep -rnE "swin-charcoal|swin-ivory|swin-gold|swin-dark-bg|swin-dark-surface|\bswin-red\b|Cormorant|text-gray-|bg-gray-|text-slate-|bg-slate-|border-slate-|border-gray-" app/
```

Expected: 0 hits **except**:
- `swin-red-brand` matches inside `acmeLogo.tsx` and login brand-mark elements (intentional brand glyph — `\bswin-red\b` word-boundary excludes these by design)
- `text-white` / `bg-white` matches in `app/ui/dashboard/bookCatalogTable.tsx` lines 389-392 (4 known retentions for category-palette filter chips per Chat 10 finding)
- Third-party brand-color literals: `[#0A66C2]`, `[#70B5F9]` (LinkedIn) and the Google logo SVG hex fills `#4285F4`/`#34A853`/`#FBBC05`/`#EA4335` in `studentChat.tsx` per Chat 12 finding

Document any unexpected hits in `findings.md` and either fix or document as a deferred retention.

- [ ] **Step 3: Build sanity** — `pnpm build`. Expected: success.

- [ ] **Step 4: Update `task_plan.md`** — mark Batch 3 + entire project COMPLETE.

- [ ] **Step 5: Update `progress.md`** — final batch-complete state; "How to start the next chat" section deleted or repurposed for visual review hand-off.

- [ ] **Step 6: Combined commit** for all Chat 16 work (migration + cleanup):

```bash
git add app/dashboard/staff app/ui/dashboard/staff \
        app/profile \
        tailwind.config.ts \
        task_plan.md progress.md
# Stage deletions explicitly
git add -u app/ui/loginForm.tsx app/ui/customers app/ui/invoices \
           app/ui/dashboard/revenueChart.tsx app/ui/dashboard/latestInvoices.tsx \
           app/ui/fonts.ts \
           app/dev
git commit -m "$(cat <<'EOF'
feat(ui): complete Batch 3 Chat 16 — staff dashboards + final cleanup; v3.0.4 redesign COMPLETE

Files migrated:
- app/dashboard/staff/history/page.tsx + historyViewer.tsx
- app/dashboard/staff/damage-reports/page.tsx + damageReportsViewer.tsx + damageReportDetailModal.tsx
- app/ui/dashboard/staff/holdsManagementView.tsx
- app/ui/dashboard/staff/staffDashboard.tsx (Chat 9 carry-over)

Cleanup:
- Dropped dormant isPrivileged prop from profile forms (Chat 11 carry-over)
- Deleted dead template files (loginForm, customers/, invoices/,
  revenueChart, latestInvoices, fonts.ts)
- Removed /dev/primitives gallery per spec section 7 Batch 3 acceptance
- Deleted legacy swin-{charcoal,ivory,gold,dark-bg,dark-surface} from
  tailwind.config.ts; swin-red-brand retained for brand-mark glyph

Project-wide acceptance audit: clean (with documented retentions for
swin-red-brand brand glyph, bookCatalogTable category palette,
studentChat third-party brand colors).
pnpm tsc --noEmit clean. pnpm build clean.

Batch 3 COMPLETE. v3.0.4 Claude-style redesign COMPLETE.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 7: Backfill commit hash.**

- [ ] **Step 8: Confirm before pushing.** Default: do not push. User performs visual review of the entire migrated app surface and decides whether to push + open PR.

---

## Acceptance criteria (per spec §7 Batch 3 — project-level)

At end of Chat 16:

- [ ] **Zero token residue** (project-wide): grep for `swin-red` excluding `swin-red-brand`, `swin-charcoal`, `swin-ivory`, `swin-gold`, `Cormorant`, raw `text-gray-`, raw `bg-gray-` returns no unexpected results. Documented retentions allowed: `swin-red-brand` brand glyph; `bookCatalogTable` 4-line category palette; `studentChat` third-party brand-color literals.
- [ ] **Dark toggle**: every page light↔dark switches with no flash, no incorrect colors, no contrast failures. (User-verified via browser; assistant cannot test.)
- [ ] **WCAG AA contrast**: `primary` on `canvas`, `ink` on `canvas`, `on-primary` on `primary` all pass AA. (Already verified per spec §3.7 — re-spot-check 3 random pages.)
- [ ] **Typecheck**: `pnpm tsc --noEmit` clean. (Note: `pnpm lint` doesn't exist — see findings.md 2026-04-29 Chat 2.)
- [ ] **Lighthouse performance**: no regression vs baseline. (User-verified.)
- [ ] **Visual consistency spot check**: 10 random pages reviewed, token usage uniform. (User-verified.)
- [ ] **Legacy tokens removed**: `swin-charcoal`, `swin-ivory`, `swin-gold`, `swin-dark-bg`, `swin-dark-surface` deleted from `tailwind.config.ts` (Chat 16 Task 30).
- [ ] **`/dev/primitives` removed** (Chat 16 Task 29).

## Risks specific to Batch 3

| Severity | Risk | Mitigation |
|---|---|---|
| 🟠 Medium | `users/page.tsx` 1155-line edit chunked across 4 sub-edits — high chance of syntactic conflicts mid-chunk | Run `pnpm tsc --noEmit` after each chunk; if errors, narrow next chunk; Read fresh file state between chunks |
| 🟠 Medium | `recommendationLab.tsx` (464 lines) has complex business logic interleaved with UI; care needed not to alter logic during class swaps | Edit only `className=` strings; if a JSX expression contains conditional class logic, extract the class concatenation but keep the boolean conditions intact |
| 🟠 Medium | Newly discovered staff supporting components (`holdsManagementView`, `damageReports*`, `historyViewer`) weren't in spec §7 — additional scope vs initial estimate | Document in `findings.md` like Chat 12 spec-gap entry; user can defer one or more if Chat 16 grows too large |
| 🟡 Low | `tailwind.config.ts` legacy token deletion (Task 30) breaks build if any reference remains | Project-wide grep BEFORE deletion is a hard gate; build sanity after deletion catches anything missed |
| 🟡 Low | `isPrivileged` prop drop (Task 27) breaks fundamental form contracts | Trace all callers via `grep -rn 'isPrivileged' app/` before editing; `pnpm tsc --noEmit` after each touch flags missed sites |
| 🟡 Low | Dead template file deletion (Task 28) accidentally removes a live dependency | Per-file `grep` for imports before each `rm` is the gate |
| 🟢 Very low | `/dev/primitives` deletion (Task 29) — user may still want it for future component additions | Confirm with user before deleting; default proceed if no response |

## Hand-off

After Chat 16 commits:
- Project is feature-complete for v3.0.4 UI redesign.
- User performs full-app visual review.
- If acceptable: push branch + open PR per `feedback_git_push.md` (confirm branch name + non-main destination first).
- If issues found: log in `findings.md`; address per per-issue scope; new chat if substantial.

`progress.md` "Notes for next chat" should be repurposed to:
- Visual review check-list (10 random pages, dark/light toggle, mobile responsive, modals, focus rings)
- Push readiness gate (memory `feedback_git_push.md`)
- Removed: all "carry-over from prior chat" notes (Batch 3 absorbs them)
- Retained: ThemeProvider hydration-flash known issue (still unfixed — Batch 4 if user wants); `pnpm lint` script absent (won't fix in this redesign)

---

## Self-review (run before declaring plan complete)

**1. Spec coverage:** Spec §7 Batch 3 lists Chats 13–16 with file groups. Plan coverage:
- Chat 13 covers admin dashboard + users + admin layout + admin/page + admin loading skeleton no-ops + nav carry-overs ✅
- Chat 14 covers admin books management (drawer, modal, copies modal, createBookForm, recommendationLab) + 2 student-facing book carry-overs ✅
- Chat 15 covers admin overdue + addBook + cameraScanModal + 4 book sub-workflow carry-overs (note: spec mention of `admin/history/*` doesn't exist in repo — Decision 2 documents this) ✅
- Chat 16 covers staff history + staff page + staff supporting components (newly discovered) + final cleanup (isPrivileged drop, dead templates, /dev/primitives, legacy tokens, audit) ✅

Spec acceptance criteria coverage: zero token residue (Task 31 Step 2), dark toggle (user-verified — assistant flagged), WCAG AA (per §3.7 + spot-check), typecheck (Step 1), Lighthouse (user-verified), visual consistency (user-verified), legacy tokens removed (Task 30), `/dev/primitives` removed (Task 29). All present.

Carry-overs from prior chats absorbed: 6 book sub-workflow pages (Chat 14 + Chat 15), staffDashboard (Chat 16), mobileNav + navLinks (Chat 13), isPrivileged drop (Chat 16), dead templates (Chat 16), `<NotificationItem>` extension considered but not added (deferred — spec didn't require it). ✅

**2. Placeholder scan:** Searched for "TBD", "TODO", "implement later", "fill in details", "Add appropriate", "Similar to Task N". One acceptable forward-reference: tasks reference `<HoldCard>` / `<KpiCard>` / `<UserAvatar>` / `<TransactionReceipt>` / `<RoleBadge>` / `<DueDatePicker>` / `<IsbnLookupBox>` / `<ScanCtaButton>` / `<StatusBadge>` / `<Chip>` / `<BookCover>` primitives — all migrated in Batch 1, callable by name. No actual placeholders found.

**3. Type consistency:** Plan references `<DashboardTitleBar>`, `<AdminShell>`, `<PageLoadingSkeleton>` chrome components — all migrated in Batch 1 Chat 8 and used in Batch 2 patterns. Token names (`primary`, `canvas`, `surface-card`, `surface-cream-strong`, `hairline`, `ink`, `muted`, `accent-teal`, `accent-amber`, `success`, `warning`, `error`, `dark-canvas`, `dark-surface-card`, `dark-surface-soft`, `dark-surface-strong`, `dark-hairline`, `dark-primary`, `on-dark`, `on-dark-soft`, `on-primary`, `muted-soft`, `body`) all match `tailwind.config.ts` per Batch 1 Chat 4 commit `8025e1f`. Recipe class names (`rounded-card`, `rounded-btn`, `rounded-pill`, `text-display-{lg,md,sm,xl}`, `text-title-{md,lg,sm}`, `text-body-{md,sm}`, `text-caption`, `text-caption-uppercase`, `text-button`, `text-nav-link`, `text-code`) all match Batch 1 Chat 4 typography setup. ✅
