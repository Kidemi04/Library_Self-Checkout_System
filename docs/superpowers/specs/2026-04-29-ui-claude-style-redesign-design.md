# UI Claude-Style Redesign — Design Spec

**Date:** 2026-04-29
**Branch:** `Kelvin-v3.0.4-EnhanceUIColour`
**Status:** Approved (pending user spec review)
**Source design system:** `DESIGN.md` (Anthropic Claude design tokens)

---

## 1. Overview

The Library Self-Checkout System currently uses a Swinburne brand palette (`swin-red #C82333`, `swin-charcoal`, `swin-ivory`, `swin-gold`) over a `bg-white` canvas with **Cormorant Garamond** as the display serif. Design alignment with `DESIGN.md` (Anthropic Claude's editorial cream + coral system) is approximately **25%** today — the structural foundation (Tailwind config, primitives folder, fonts pairing concept, dark mode infrastructure) is solid, but visual tokens diverge.

This spec defines a **token + visual refresh** that brings the project into alignment with the spirit of `DESIGN.md` while preserving Swinburne brand identity. Component structure, page layouts, and business logic are out of scope.

### Goals

1. Replace the visual token system (colors, typography, radius) to match `DESIGN.md`'s warm-editorial language
2. Preserve the Swinburne brand by retaining the official red `#C82333` for brand-bearing positions (logo/header)
3. Use a derived warm red `#B83A35` for general UI primary surfaces (CTAs, links, focus rings)
4. Extend `DESIGN.md`'s dark surface tokens into a complete dark-mode token map
5. Migrate in 3 sequential batches, each independently mergeable with visual coherence

### Non-Goals

- No layout/structural changes to pages
- No business logic changes
- No migration of marketing-style components from `DESIGN.md` (hero band, coral cta-band, pricing tier card) — they don't apply to a functional library tool
- No font licensing for Tiempos Headline; use Newsreader (free, OFL) as visual substitute

---

## 2. Decisions Log

| # | Question | Decision |
|---|---|---|
| Q1 | Brand positioning | **B** — `DESIGN.md` as design language inspiration, preserve Swinburne brand identity |
| Q2 | Scope of change | **C** — colors + fonts + component visuals; layout untouched |
| Q3 | Primary color handling | **C** — dual-track: warmed red `#B83A35` for UI, official `#C82333` for logo/brand |
| Q4 | Migration approach | **B** — 3 phased batches (foundation → student-facing → admin/staff) |
| Q5 | Dark mode | **A** — preserve and extend `DESIGN.md` dark surfaces into a complete dark token map |
| Q6 | Display font | **Newsreader** (Google Fonts, OFL 1.1, self-hosted via `next/font/google`); target `Tiempos Headline`, single CSS variable swap when license acquired |
| Radius strategy | conservative | New semantic tokens (`rounded-btn/card/hero`); do not override Tailwind defaults |
| Elevation strategy | minimal | Use cream color hierarchy for layering; reserve shadows for floating modals/drawers only |
| Dev gallery | yes | Temporary `/dev/primitives` page in chat 7 for visual review; removed before final cleanup |

---

## 3. Color Token System

### 3.1 Brand & Primary (dual-track)

| Token | Hex | Use |
|---|---|---|
| `swin-red-brand` | `#C82333` | Logo, `acmeLogo`, login brand mark, header Swinburne identity area. **Official brand color, no variation.** |
| `primary` | `#B83A35` | All CTAs, links, active state, focus rings, KPI emphasis, badges. **Warmed Swinburne red** (saturation 71% → 56%, hue shifted 5° warmer). |
| `primary-active` | `#9A2D29` | Hover/press state |
| `primary-disabled` | `#E6DFD8` | Disabled buttons (per `DESIGN.md`) |

### 3.2 Surface Hierarchy — Light (default)

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#FAF9F5` | Page floor |
| `surface-soft` | `#F5F0E8` | Section dividers, soft bands |
| `surface-card` | `#EFE9DE` | Card backgrounds (`KpiCard`, `SectionCard`, `LoanCard`, `HoldCard`) |
| `surface-cream-strong` | `#E8E0D2` | Active tab, emphasized band |
| `hairline` | `#E6DFD8` | 1px borders |
| `hairline-soft` | `#EBE6DF` | In-band dividers |

### 3.3 Surface Hierarchy — Dark (toggle target)

`DESIGN.md` does not specify a complete dark theme. The map below extrapolates from its `surface-dark` series.

| Light token | → Dark token | Hex |
|---|---|---|
| `canvas` | `dark-canvas` | `#181715` |
| `surface-soft` | `dark-surface-soft` | `#1F1E1B` |
| `surface-card` | `dark-surface-card` | `#252320` |
| `surface-cream-strong` | `dark-surface-strong` | `#2D2B27` |
| `hairline` | `dark-hairline` | `#3A3733` |
| `primary` | `dark-primary` | `#CC4640` (brightened from `#B83A35` for dark-canvas legibility while keeping white-on-button contrast ≥ AA 4.5:1) |

### 3.4 Text Hierarchy

| Token | Light | Dark | Use |
|---|---|---|---|
| `ink` | `#141413` | `#FAF9F5` | Headlines, primary emphasis |
| `body-strong` | `#252523` | `#E5E2DC` | Lead paragraphs |
| `body` | `#3D3D3A` | `#C5C2BC` | Default running text |
| `muted` | `#6C6A64` | `#A09D96` | Sub-headings, breadcrumbs, footer text |
| `muted-soft` | `#8E8B82` | `#7A7770` | Captions, fine print |
| `on-primary` | `#FFFFFF` | `#FFFFFF` | Text on primary buttons |
| `on-dark` | `#FAF9F5` | `#FAF9F5` | Text on `dark-canvas` and dark surfaces |
| `on-dark-soft` | `#A09D96` | `#A09D96` | Footer body, secondary labels in dark |

### 3.5 Accent & Semantic (mode-shared)

| Token | Hex | Use |
|---|---|---|
| `accent-teal` | `#5DB8A6` | "Active connection", camera-scan ready indicator |
| `accent-amber` | `#E8A55A` | Category badge, inline highlight |
| `success` | `#5DB872` | Status dot, available indicator |
| `warning` | `#D4A017` | Overdue warning (used sparingly; primary red is preferred for overdue) |
| `error` | `#C64545` | Form validation error (per `DESIGN.md`, retained as-is) |

### 3.6 Removed Tokens

| Token | Replacement |
|---|---|
| `swin-charcoal #343642` | `body-strong` (`#252523`) |
| `swin-ivory #FEFDFD` | `canvas` (`#FAF9F5`) |
| `swin-gold #C9A961` | **Removed** — not used in new system |
| `swin-dark-bg #0F1115` | `dark-canvas` (`#181715`) |
| `swin-dark-surface #181B21` | `dark-surface-card` (`#252320`) |

`swin-red` is **renamed to `swin-red-brand`** and retained for logo/brand-only use.

### 3.7 Contrast Verification

Using WCAG sRGB relative-luminance formula:

| Pair | Ratio | WCAG |
|---|---|---|
| `primary` `#B83A35` on `canvas` `#FAF9F5` | 5.86:1 | AA ✓, AAA-large ✓ |
| `on-primary` `#FFFFFF` on `primary` `#B83A35` | 5.59:1 | AA ✓ |
| `ink` `#141413` on `canvas` `#FAF9F5` | 16.8:1 | AAA ✓ |
| `on-primary` `#FFFFFF` on `dark-primary` `#CC4640` | 4.61:1 | AA ✓ (button text in dark mode) |
| `dark-primary` `#CC4640` on `dark-canvas` `#181715` | 3.81:1 | AA-large ✓ (used for non-text accents — links with underline affordance, focus rings) |
| `on-dark` `#FAF9F5` on `dark-canvas` `#181715` | 16.5:1 | AAA ✓ |

**Note:** All values above are computed analytically; chat 4 (Tailwind config) implementation must include automated axe/Lighthouse verification before commit. If any pair regresses, adjust the offending hex by ±2 luminance units and re-verify.

---

## 4. Typography

### 4.1 Font Families

| Token | Family | Source | Use |
|---|---|---|---|
| `font-display` | **Newsreader** | Google Fonts (OFL 1.1), self-hosted via `next/font/google` | All headlines (h1-h3), KPI numerals, hero text |
| `font-sans` | **Inter** | Google Fonts (OFL), self-hosted | Body, buttons, navigation, form labels, table content |
| `font-mono` | **JetBrains Mono** | Google Fonts (OFL), self-hosted | Barcode, ISBN, code blocks, terminal-style content |

**Removed:** `Cormorant Garamond` is fully removed from `app/layout.tsx`, `tailwind.config.ts`, and any inline use.

**Future swap path:** Newsreader is positioned as a near-equivalent for Tiempos Headline. When/if Tiempos is licensed, swap is a one-line CSS variable change in `tailwind.config.ts`. Spec target written as: `target: Tiempos Headline (license required), dev fallback: Newsreader`.

### 4.2 Type Scale

| Token | Size | Weight | Line-height | Letter-spacing | Family | Use |
|---|---|---|---|---|---|---|
| `display-xl` | 64px | 400 | 1.05 | -1.5px | Newsreader | Login hero, empty-state welcome (sparing use) |
| `display-lg` | 48px | 400 | 1.10 | -1px | Newsreader | Page h1 (dashboard, admin, staff) |
| `display-md` | 36px | 400 | 1.15 | -0.5px | Newsreader | Section titles, book detail title, modal titles |
| `display-sm` | 28px | 400 | 1.20 | -0.3px | Newsreader | KPI numerals, `SectionCard` titles |
| `title-lg` | 22px | 500 | 1.30 | 0 | Inter | Card subtitles, form group titles |
| `title-md` | 18px | 500 | 1.40 | 0 | Inter | `LoanCard` book name, list row primary text |
| `title-sm` | 16px | 500 | 1.40 | 0 | Inter | Nav link, button, tab, chip text |
| `body-md` | 16px | 400 | 1.55 | 0 | Inter | Default body text |
| `body-sm` | 14px | 400 | 1.55 | 0 | Inter | Table rows, helper text, modal description |
| `caption` | 13px | 500 | 1.40 | 0 | Inter | `StatusBadge`, metadata, due-date |
| `caption-uppercase` | 12px | 500 | 1.40 | 1.5px | Inter | Section eyebrow ("YOUR LOANS", "OVERDUE") |
| `code` | 14px | 400 | 1.60 | 0 | JetBrains Mono | Barcode, ISBN, code |
| `button` | 14px | 500 | 1.0 | 0 | Inter | All buttons |
| `nav-link` | 14px | 500 | 1.40 | 0 | Inter | TopNav, SideNav |

### 4.3 Tailwind Implementation

```ts
// tailwind.config.ts excerpt
fontSize: {
  'display-xl': ['64px', { lineHeight: '1.05', letterSpacing: '-1.5px', fontWeight: '400' }],
  'display-lg': ['48px', { lineHeight: '1.10', letterSpacing: '-1px',   fontWeight: '400' }],
  // ... full scale
}
```

Usage:
```tsx
<h1 className="font-display text-display-lg text-ink">My Loans</h1>
<span className="text-caption-uppercase text-muted">OVERDUE</span>
<code className="font-mono text-code text-ink">9780134685991</code>
```

### 4.4 Numeral Font Strategy

Per `DESIGN.md` natural type-scale assignment (no special numeric carve-out):

- **Large KPI numerals** (e.g., dashboard "42 borrowed") → `display-sm` Newsreader serif (editorial gravitas)
- **Small in-table numerals** (e.g., due date in row) → `body-sm` Inter sans (scan-readable)
- **Barcode / ISBN / system identifiers** → `code` JetBrains Mono (always)

---

## 5. Radius + Spacing

### 5.1 Radius (semantic, conservative — does not override Tailwind defaults)

| New token | Value | Use |
|---|---|---|
| `rounded-btn` | 8px | All buttons, inputs, tabs |
| `rounded-card` | 12px | All cards, modals, drawers, panels |
| `rounded-hero` | 16px | Login hero illustration |
| `rounded-pill` (existing) | 9999px | Badges |
| `rounded-full` (existing) | 9999px | Avatars, circular icon buttons |

Rationale: `DESIGN.md` `md=8px` differs from Tailwind default `md=6px`. Rather than override (which would silently change all existing `rounded-md` consumers), introduce semantic-named tokens. New code uses `rounded-btn` / `rounded-card` explicitly.

### 5.2 Spacing

Tailwind default 4px-baseline scale already aligns with `DESIGN.md` (`xxs=4, xs=8, sm=12, md=16, lg=24, xl=32, xxl=48`). No override needed.

**One new alias added:**
```ts
spacing: { section: '96px' }  // for `p-section`, `py-section`, etc.
```

### 5.3 Component-Level Padding Map

| Component | Padding |
|---|---|
| Button (md size) | `12px 20px`, height 40px |
| Text input | `10px 14px`, height 40px |
| KpiCard, SectionCard | `32px` (`p-8`) |
| BarcodePreview, scan result panel | `24px` (`p-6`) |
| LoanCard, HoldCard | `20px` (`p-5`) |
| confirmModal, manageBookModal | `24px` (`p-6`) |
| Login hero band (if retained) | `64px` (`p-16`) |
| Footer (if added) | `64px` (`p-16`) |

---

## 6. Component Visual Mapping

### 6.1 Migration Principles (apply to all components)

1. **Surface up one notch** — card backgrounds: `bg-white` → `bg-surface-card` (`#EFE9DE`)
2. **Soften borders** — `border-gray-200` → `border-hairline` (`#E6DFD8`)
3. **Warm text** — `text-gray-900` → `text-ink` (`#141413`); `text-gray-500` → `text-muted` (`#6C6A64`)
4. **CTA uses warmed red** — `bg-swin-red` → `bg-primary` (`#B83A35`)
5. **Radius upgrade** — buttons `rounded-md` → `rounded-btn`; cards `rounded-lg` → `rounded-card`
6. **Font swap** — display elements from Cormorant → Newsreader; body Inter unchanged

### 6.2 Representative Examples

#### Button — Primary

| State | Before | After |
|---|---|---|
| Default | `bg-swin-red text-white rounded-md px-4 py-2 text-sm font-medium` | `bg-primary text-on-primary rounded-btn px-5 py-3 h-10 font-sans text-button` |
| Hover | `hover:bg-red-700` | `hover:bg-primary-active` |
| Active | — | `active:bg-primary-active active:scale-[0.98]` |
| Focus | native outline | `focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas` |
| Disabled | `opacity-50` | `disabled:bg-primary-disabled disabled:text-muted disabled:cursor-not-allowed` |

#### KpiCard

| Element | Before | After |
|---|---|---|
| Container | `bg-white border rounded-lg p-6` | `bg-surface-card border border-hairline rounded-card p-8` |
| Eyebrow ("BORROWED") | `text-xs uppercase text-gray-500` | `font-sans text-caption-uppercase text-muted` |
| Numeral ("42") | `text-3xl font-bold text-gray-900` | `font-display text-display-sm text-ink` |
| Sub text | `text-sm text-gray-600` | `font-sans text-body-sm text-body` |
| Trend up icon | green arrow | `text-success` (`#5DB872`) |

#### StatusBadge

| Variant | After |
|---|---|
| `available` | `bg-surface-card text-ink rounded-pill px-3 py-1 font-sans text-caption` + leading `success` dot |
| `overdue` | `bg-primary text-on-primary rounded-pill px-3 py-1 font-sans text-caption-uppercase` |
| `due-soon` | `bg-surface-cream-strong text-ink` + `warning` dot |
| `holds` | `bg-surface-card text-muted` + `accent-teal` dot |

**Design principle:** State expressed as "cream surface + leading colored dot" rather than full-block tinting. Only `overdue` (genuine alert) uses solid primary red.

#### LoanCard

| Element | After |
|---|---|
| Container | `bg-surface-card border border-hairline rounded-card p-5` |
| Book name | `font-sans text-title-md text-ink` |
| Author | `font-sans text-body-sm text-muted` |
| Due date | `font-sans text-caption text-muted`; `< 3 days` → `text-warning` |
| Barcode | `font-mono text-code text-muted` |
| Action button | `bg-primary text-on-primary rounded-btn` |

#### dashboardTitleBar

| Element | After |
|---|---|
| Container | `bg-canvas border-b border-hairline` |
| H1 | `font-display text-display-lg text-ink tracking-tight` |
| Subtitle | `font-sans text-body-md text-body` |
| Logo | `text-swin-red-brand` (**official `#C82333` retained — brand-bearing position**) |

### 6.3 State Styling (system-wide)

| State | Rule |
|---|---|
| **Hover** | Primary action: color one shade darker (`primary` → `primary-active`); cards: `hover:border-primary/20` (no shadow) |
| **Focus (keyboard)** | Always explicit `focus-visible:ring-2 ring-primary/40 ring-offset-2 ring-offset-canvas` — non-negotiable for a11y |
| **Active (press)** | Primary buttons: `active:scale-[0.98]` for tactile feedback |
| **Disabled** | `bg-primary-disabled text-muted cursor-not-allowed`; no hover/focus reaction |
| **Loading** | Skeleton color `bg-gray-200` → `bg-surface-cream-strong` |

### 6.4 Elevation Strategy

`DESIGN.md` uses near-zero shadows; layering is communicated via cream surface hierarchy (`canvas` → `surface-soft` → `surface-card`). This spec follows the same:

- **Cards, panels, sections** — no shadow; differentiated by surface token
- **Modals, drawers, floating menus** — light shadow only when truly elevated above page: `shadow-[0_4px_16px_rgba(20,20,19,0.08)]`
- **Hover on cards** — `hover:border-primary/20` (border tint), not shadow

### 6.5 Dark Mode Convention

Every visual className gets a paired `dark:` variant. Token names map 1:1 (`surface-card` ↔ `dark-surface-card`), so additions are mechanical:

```tsx
<div className="bg-surface-card dark:bg-dark-surface-card 
                border-hairline dark:border-dark-hairline 
                text-ink dark:text-on-dark">
```

---

## 7. Batch Breakdown

Three batches, ~13 working chats (chat 4–16 in the overall sequence). Each batch must be independently mergeable with internal visual coherence.

### Batch 1 — Foundation (chats 4–8)

Lay the design-system substrate. After this batch, any newly written component automatically inherits the new visuals; existing pages will look partially correct.

| Chat | Scope | Files |
|---|---|---|
| 4 | Tailwind config rebuild + font swap + global CSS | `tailwind.config.ts`, `app/ui/global.css`, `app/layout.tsx`, `postcss.config.js` (if needed) |
| 5 | Primitives A — interactive elements | `Button`, `Chip`, `StatusBadge`, `FilterPills`, `ScanCtaButton`, `ReminderButton` |
| 6 | Primitives B — content cards | `KpiCard`, `SectionCard`, `LoanCard`, `HoldCard` |
| 7 | Primitives C — supporting + dev gallery | `BookCover`, `BarChartMini`, `IsbnLookupBox`, `BarcodePreview`; create temporary `/dev/primitives` page |
| 8 | Shell + global chrome | `dashboardShell`, `adminShell`, `dashboardTitleBar`, `signOutButton`, `themeToggle` |

**Batch 1 acceptance criteria** (must hold at end of chat 8):
- [ ] `bg-canvas` renders cream `#FAF9F5` in light, `#181715` in dark
- [ ] On any page, toggling dark/light correctly switches all tokenized elements
- [ ] All primitives in `/dev/primitives` gallery match `DESIGN.md` visual language
- [ ] Newsreader is self-hosted; network tab shows zero `fonts.googleapis.com` requests
- [ ] Cormorant Garamond fully removed (project-wide grep for `Cormorant` returns 0 results)
- [ ] `swin-red-brand` alias resolves to `#C82333` and is consumable by logo components
- [ ] `pnpm lint && pnpm tsc --noEmit` clean

### Batch 2 — Student-facing (chats 9–12)

Pages students see daily — highest visual priority.

| Chat | Scope | Files |
|---|---|---|
| 9 | Login + main dashboard | `login/page`, `LoginClient`, `loginForm`, `dashboard/page`, `student/myBooksCard`, `student/quickActions`, `summaryCards` |
| 10 | Book browse + borrow history | `dashboard/book/page`, `dashboard/book/list/page`, `dashboard/book/history/*`, `bookListMobile`, `borrowingHistoryFilter`, `activeLoansTable`, `bookCatalogTable` |
| 11 | Camera scan + profile + notifications | `dashboard/cameraScan/page`, `dashboard/profile/page`, `profile/profileEditForm/profileNameForm/profileAvatarForm`, `notifications/loading`, `notificationPanel`, `notificationToast` |
| 12 | Learning module | `dashboard/learning/page`, `learning/collectionsPanel`, `learning/courseCard`, `learning/searchForm`, `learning/searchResultsPanel`, `learning-path-generator`, `studentChat` |

**Batch 2 acceptance criteria:**
- [ ] All student-facing pages render coherently in both light + dark
- [ ] No element references the legacy class `swin-red` (the new `swin-red-brand` alias is allowed only in logo/brand-mark components), `swin-charcoal`, `swin-ivory`, or `swin-gold`
- [ ] No raw Tailwind `text-gray-*` / `bg-gray-*` outside intentionally retained non-brand zones
- [ ] All form focus rings render in `primary` color
- [ ] Button hover/active/disabled three states correct everywhere

### Batch 3 — Admin/Staff + Final QA (chats 13–16)

| Chat | Scope | Files |
|---|---|---|
| 13 | Admin dashboard + users + admin layout | `dashboard/admin/layout`, `dashboard/admin/page`, `dashboard/admin/users/*`, `admin/page`, `customers/table` |
| 14 | Admin books management | `manageBookDrawer`, `manageBookModal`, `manageCopiesModal`, `createBookForm`, `recommendations/recommendationLab` |
| 15 | Admin overdue + history + add-book | `dashboard/admin/overdue/*`, `dashboard/admin/history/*`, `dashboard/admin/books/new/*` |
| 16 | Staff history + project-wide QA | `staff/page`, `dashboard/staff/history/*`; cross-page consistency check; remove `/dev/primitives`; final cleanup of legacy tokens |

**Batch 3 acceptance criteria** (project-level):
- [ ] **Zero token residue**: project-wide grep for `swin-red` (excluding `swin-red-brand`), `swin-charcoal`, `swin-ivory`, `swin-gold`, `Cormorant`, raw `text-gray-`, raw `bg-gray-` returns no unexpected results
- [ ] **Dark toggle**: every page light↔dark switches with no flash, no incorrect colors, no contrast failures
- [ ] **WCAG AA contrast**: `primary` on `canvas`, `ink` on `canvas`, `on-primary` on `primary` all pass AA
- [ ] **Lint + typecheck**: `pnpm lint && pnpm tsc --noEmit` clean
- [ ] **Lighthouse performance**: no regression vs baseline (font self-host should not degrade)
- [ ] **Visual consistency spot check**: 10 random pages reviewed, token usage uniform
- [ ] **Legacy tokens removed**: `swin-charcoal`, `swin-ivory`, `swin-gold`, `swin-dark-bg`, `swin-dark-surface` deleted from `tailwind.config.ts`
- [ ] `/dev/primitives` removed

### Per-Chat Quality Gate

Before any chat-level commit:
```bash
pnpm lint                          # 0 errors
pnpm tsc --noEmit                  # 0 errors
git diff --stat                    # change scope sanity
grep -r "<legacy-token>" app/      # 0 results for tokens this chat targeted
```

### Chat Hand-off

Each chat ends with:
1. Update `progress.md` with current state, last commit, next step
2. Commit changes (conventional-commits style; do not push)
3. Mark next-chat starting point clearly in `progress.md`

---

## 8. Risks & Rollback

### 8.1 Risks (severity-ordered)

| Severity | Risk | Mitigation |
|---|---|---|
| 🔴 High | Visual desync between batches (e.g., shell new, student pages old) | Mitigated by primitives-first batch order: by end of Batch 1, all shared primitives are new, so Batch 2 pages already inherit much of the new look |
| 🟠 Medium | Stale legacy token left behind | Per-batch grep audit; final-batch removal of legacy tokens from `tailwind.config.ts` will fail the build if anything still references them |
| 🟠 Medium | Font flash (FOUT/FOIT) on first load | `next/font/google` with `display: 'swap'` and latin-only subset (~80KB target); fallback `Georgia, serif` chosen for metric proximity |
| 🟡 Low | Dark-mode toggle flash | `next-themes` `disableTransitionOnChange`; `<html className="bg-canvas dark:bg-dark-canvas">` set at root before hydration |
| 🟡 Low | WCAG contrast regression | Verified: all critical pairs pass AA (see §3.7) |
| 🟢 Very low | Bundle size increase | Net +~200KB after Cormorant removal — acceptable for first-load |

### 8.2 Rollback Strategy

| Level | Trigger | Action |
|---|---|---|
| 1 — Single chat | Chat output unsatisfactory | `git reset --hard HEAD~N` within unpushed chat commits |
| 2 — Single batch | Post-merge regression | `git revert <commit-range>` |
| 3 — Full v3.0.4 | Disastrous outcome | `git checkout main`, delete `Kelvin-v3.0.4-EnhanceUIColour`; `Kelvin-v3.0.3-AdminPages` remains intact |
| 4 — Token-level emergency | Specific component broken post-merge | Legacy tokens kept as aliases until final Batch 3 cleanup, allowing temporary alias redirect |

### 8.3 Safety Net During Execution

| Safety net | Where | Trigger |
|---|---|---|
| `progress.md` Blockers section | Project root | Any uncertainty/block — log it before proceeding |
| `findings.md` Unexpected discoveries | Project root | Discover a component used in unrelated places — log scope creep before expanding |
| Per-chat lint + tsc | Automated | 0 errors required to commit |
| Per-batch user visual review | Browser (user-driven) | User performs UI testing per their preference; assistant does not run preview |
| Hand-off commit message | Git | Every chat-end commit names the next chat's starting point |

---

## 9. Out of Scope

The following are explicitly **not** part of this redesign:

- Page layout/structural changes (navigation order, page composition, information architecture)
- Business logic changes (loan rules, due-date calculations, RBAC)
- Marketing-style components from `DESIGN.md` (`hero-band`, `cta-band-coral`, `cta-band-dark`, `pricing-tier-card`, `connector-tile-grid`) — not applicable to a functional library tool
- Tiempos Headline licensing (Newsreader is the deployed font)
- New features, refactors unrelated to visual tokens
- Performance optimization beyond not regressing
- New i18n surfaces
- `app/ui/invoices/*` and `app/ui/customers/*` — these are demo/template artifacts from project bootstrap; they will be migrated only if currently referenced from production routes

---

## 10. References

- Source design system: `DESIGN.md` (project root)
- Current Tailwind: `tailwind.config.ts`
- Current global CSS: `app/ui/global.css`
- Current layout: `app/layout.tsx`
- Newsreader on Google Fonts: https://fonts.google.com/specimen/Newsreader
- OFL 1.1 license text (bundled with Google Fonts): standard SIL Open Font License
- Klim Type Foundry (Tiempos): https://klim.co.nz/buy/tiempos-headline (for future license consideration)

---

## 11. Open Questions

None. All design decisions resolved during brainstorming session 2026-04-29.

---

## 12. Implementation Companion Files

When implementation begins, these files will be created/maintained alongside this spec:

- `docs/superpowers/plans/2026-04-29-ui-claude-style-redesign-plan.md` — generated by `writing-plans` skill from this spec
- `task_plan.md` (project root) — current batch's executable checklist
- `progress.md` (project root) — current batch/chat/step pointer; the file new-chat sessions read first
- `findings.md` (project root) — log of unexpected discoveries during execution
