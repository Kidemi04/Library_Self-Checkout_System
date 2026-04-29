# UI Claude-Style Redesign — Progress Tracker

> **For new chats picking up this work:** Read this file FIRST, then `task_plan.md`, then the spec and plan referenced below. Resume from "Next step" without re-discussing decisions.

---

## Project state

- **Branch:** `Kelvin-v3.0.4-EnhanceUIColour` (created 2026-04-29 from `Kelvin-v3.0.3-AdminPages`)
- **Spec:** `docs/superpowers/specs/2026-04-29-ui-claude-style-redesign-design.md` (commit `b5b39ea`)
- **Plan (Batch 1):** `docs/superpowers/plans/2026-04-29-ui-claude-batch-1-foundation.md` (commit `8f94019`)
- **Plan (Batch 2):** `docs/superpowers/plans/2026-04-29-ui-claude-batch-2-student-facing.md` (commit `24ff5f0`)
- **Plan (Batch 3):** Not yet written.

## Current position

- **Current batch:** 2 (Student-facing) — Chat 11 of 4 done
- **Current chat:** 11 of 16 done (this chat = Chat 11 in spec numbering — Camera scan + profile + notifications)
- **Last completed:** Tasks 16–22 of Chat 11 + the deferred shared skeleton from Chat 10. Files migrated: `app/ui/pageLoadingSkeleton.tsx` (shared — affects 6 consumer loading.tsx pages), `app/dashboard/cameraScan/page.tsx`, `app/profile/page.tsx` (the actual profile page; `app/dashboard/profile/page.tsx` is a one-line re-export, untouched), `app/profile/profileEditForm.tsx`, `app/profile/profileNameForm.tsx`, `app/profile/profileAvatarForm.tsx`, `app/ui/dashboard/notificationPanel.tsx`, `app/ui/dashboard/notificationToast.tsx`. `app/dashboard/notifications/loading.tsx` is a no-op (already delegates to shared `PageLoadingSkeleton`). Combined commit hash backfilled below. `pnpm tsc --noEmit` clean throughout. Per-file residue grep: 0 hits across all 10 in-scope files (legacy `swin-*|bg-white|text-white|text-gray-|bg-gray-|text-slate-|bg-slate-|border-slate-|border-gray-|border-white|rounded-2xl` plus the per-type raw palettes from old notification configs `text-blue-|bg-blue-|text-emerald-|bg-emerald-|text-amber-|bg-amber-|text-violet-|bg-violet-|text-sky-|bg-sky-|text-rose-|text-orange-|bg-orange-|from-swin|to-orange|from-emerald|to-teal|focus:ring-swin|focus:ring-emerald|ring-emerald|ring-slate|ring-white`).
- **Next step:** **Open a new chat to start Chat 12 (learning module).** First action: read this `progress.md` + `task_plan.md` + Batch 2 plan "Chat 12" section, then execute via `superpowers:executing-plans`. Files in scope per spec §7 / Batch 2 plan Chat 12: `app/dashboard/learning/page.tsx`, `app/ui/dashboard/learning/collectionsPanel.tsx`, `app/ui/dashboard/learning/courseCard.tsx`, `app/ui/dashboard/learning/searchForm.tsx`, `app/ui/dashboard/learning/searchResultsPanel.tsx`, `app/ui/dashboard/learning-path-generator.tsx`, `app/ui/dashboard/studentChat.tsx`. Chat 12 also includes the Batch 2 acceptance audit at end.

## What's done

- [x] Brainstorming session — 6 design decisions resolved
- [x] Design spec written + self-reviewed + approved
- [x] Spec committed (`b5b39ea`)
- [x] Batch 1 implementation plan written
- [x] Plan committed (`8f94019`)
- [x] Progress files initialized (`c1adfe8`)
- [x] **Chat 4 (spec) — Tailwind tokens + fonts + globals** (commits `8025e1f`, `26aebcd`, `5d09617`, `9197f80`, `d32c05d`)
  - [x] Task 1: Color tokens (light + dark)
  - [x] Task 2: Typography scale + var-driven font families
  - [x] Task 3: Radius + spacing tokens
  - [x] Task 4: `next/font/google` self-host (Newsreader / Inter / JetBrains Mono)
  - [x] Task 5: `app/ui/global.css` cleanup
  - [x] Task 6: Final sanity (`pnpm tsc --noEmit` clean, `pnpm build` clean)
- [x] **Chat 5 (spec) — Primitives A: interactive elements** (combined commit `3fdcb06`)
  - [x] Task 7: `Button` — solid primary CTA, focus ring, dark-primary
  - [x] Task 8: `Chip` — surface-card/primary/accent tones with rounded-pill
  - [x] Task 9: `StatusBadge` — cream surface + leading colored dot pattern (OVERDUE keeps solid primary)
  - [x] Task 10: `FilterPills` — surface-card/cream-strong active/inactive, drop borders
  - [x] Task 11: `ScanCtaButton` — solid primary (red) / success (green), gradient + shadow removed
  - [x] Task 12: `ReminderButton` — secondary cream button, primary-disabled state
  - [x] Task 13: `DueDatePicker` (cream preset pills + canvas date input) + `RoleBadge` (chip-tone pattern)
  - [x] Task 14: Quality gate (`pnpm tsc` clean, ReminderButton tests 6/6 green), commit, progress update
  - **Side change:** `tailwind.config.ts` borderRadius gained `pill: '9999px'` to make plan-written `rounded-pill` resolve. See `findings.md` 2026-04-29 Chat 5.
- [x] **Chat 6 (spec) — Primitives B: content cards** (combined commit `b13baf4`)
  - [x] Task 15: `KpiCard` — surface-card + hairline + display-sm numeral
  - [x] Task 16: `SectionCard` (red→primary, gold→accent-amber accent), `LoanCard`, `HoldCard` (Ready brand-red→primary, queue gold→accent-amber)
  - [x] Task 17: `NotificationItem` (full TYPE_STYLES remap to semantic tokens), `TransactionReceipt` (gradient dropped per plan recipe), `UserAvatar` (charcoal tone→cream-strong, gold tone→accent-amber)
  - [x] Task 18: Quality gate (`pnpm tsc --noEmit` clean), residue grep (0 hits), commit, progress update
  - **Decisions outside plan literal text:** spec §3.6 removes `swin-gold`; mapped to `accent-amber` to keep callers' `accent='gold'` / `tone='gold'` props working until Batches 2/3 retire them. HoldCardReady's hardcoded `#C82333` was an alert color, not a brand mark — swapped to `primary`.
- [x] **Chat 7 (spec) — Primitives C: supporting + dev gallery** (combined commit `9a5e47f`)
  - [x] Task 19: `BookCover` (drop multi-layer boxShadow per §6.4; Cormorant fontFamily → `var(--font-newsreader)`; gradient artwork left intact — see findings), `BarChartMini` (last-bar `bg-primary`, track `bg-surface-cream-strong`, opacity ramp preserved)
  - [x] Task 20: `IsbnLookupBox` (Lookup adopts shared `<Button>` with dual `disabled`/`aria-disabled` flags; cream secondary Scan button; canvas/hairline-tinted input), `BarcodePreview` (`p-3` → `p-6` per §5.3; `border-hairline`; tokenized typography)
  - [x] Task 21: `app/dev/layout.tsx` (NODE_ENV-gated 404 in production) + `app/dev/primitives/page.tsx` (Buttons/Chips/StatusBadges/KpiCards/Typography ladder/Color swatch — both light + dark sections)
  - [x] Task 22: Quality gate (`pnpm tsc --noEmit` clean), residue grep across 6 touched files (0 hits), commit, progress update
  - **Decisions outside plan literal text:** see `findings.md` 2026-04-29 Chat 7 — five entries covering (1) BookCover gradient-art kept as-is, (2) BarChartMini track may read faint per literal recipe, (3) IsbnLookupBox Lookup needs both `disabled` + `aria-disabled` for current Button styling, (4) BarcodePreview padding upsized per §5.3, (5) dev gallery imports from canonical paths.
- [x] **Chat 8 (spec) — Shell + global chrome + final Batch 1 QA** (combined commit `24f0310`)
  - [x] Task 23: `dashboardShell` (conditional `isDark` className → static `bg-canvas text-ink dark:bg-dark-canvas dark:text-on-dark`; `useTheme`/`mounted` apparatus dropped per plan's "simplifies to a plain JSX block" branch — see findings)
  - [x] Task 24: `adminShell`, `dashboardTitleBar` (border `swin-charcoal/10` → `hairline`; eyebrow `font-mono [10px]` → `font-sans text-caption-uppercase text-muted`; H1 → `font-display text-display-lg text-ink tracking-tight`; description → `text-body-md text-body`; bell icon button → cream secondary pattern with `hover:border-primary/20`; bell-dot alert indicator → `bg-primary` with `ring-canvas/dark:ring-dark-canvas`)
  - [x] Task 25: `signOutButton` (recipe baked as `DEFAULT_CLASS_NAME`; `className ?? DEFAULT` so callers' override still wins — non-breaking, see findings), `themeToggle` (rewritten pill→single round icon button per recipe; dead `context='sidebar'` prop removed — see findings)
  - [x] Task 26: Quality gate (`pnpm tsc --noEmit` clean; `grep` for `Cormorant` in `app/` + `tailwind.config.ts` = 0; `grep` for `swin-charcoal|swin-ivory|swin-gold|swin-dark-bg|swin-dark-surface` across 7 Batch 1 paths = 0; supplementary check `bg-white|text-white|bg-slate|text-slate|border-slate|border-white` in 4 Chat 8 files = 0); commit, progress update
  - **Decisions outside plan literal text:** see `findings.md` 2026-04-29 Chat 8 — four entries covering (1) `dashboardShell` apparatus retired, (2) `signOutButton` default-class pattern preserves caller overrides, (3) `themeToggle` redesigned to single icon button, (4) bell-dot in headers maps to `bg-primary` (alert), not `swin-red-brand` (brand).
- [x] **Chat 9 (spec) — Login + main dashboard + nav full migration** (combined commit hash backfilled below)
  - [x] Task 1: Full migration of `sidenav.tsx` (active nav uses `bg-primary/10 text-primary` tint per spec §3.5 — plan-author was conservatively wrong; admin badge → primary; staff badge → accent-amber; inline labeled theme toggle preserved; unused `ThemeToggle` import dropped) + `mobileMenu.tsx` (drawer migrated to cream-in-light per Claude design; trigger button keeps light-text-on-dark since it lives in still-un-migrated `mobileNav.tsx` header; backdrop uses literal `bg-black/60` since no spec token is "always dark"; brand accent stripe gradient kept with primary tokens, dark-mode emerald variation dropped; `useTheme`/`isDark` apparatus retired)
  - [x] Task 2: `app/login/page.tsx` (no-op — server-only) + `app/login/LoginClient.tsx` (display-xl hero, solid primary CTA, drop gradient/shadow/shimmer per spec §6.2/§6.4)
  - [x] Task 3: `app/ui/loginForm.tsx` — dead template code (not imported anywhere); migrated for residue cleanliness; flagged for Batch 3 deletion alongside other `app/ui/customers/*`, `app/ui/invoices/*`, `app/ui/dashboard/revenueChart.tsx`, `app/ui/dashboard/latestInvoices.tsx`, `app/ui/fonts.ts` template artifacts
  - [x] Task 4: `app/dashboard/page.tsx` (no-op — server-only) + `app/ui/dashboard/student/studentDashboard.tsx` (option-A user-aligned addition; 484 lines / was 57 legacy hits; preserve layout-tuned literal sizes — `text-[56px]` desktop hero, `text-[32px]`/`text-[26px]` mobile — and only swap colors; `isDark` apparatus retired except for icon-swap + aria-label non-className uses; pickup-ready banner shadow dropped per spec §6.4)
  - [x] Task 5: `myBooksCard.tsx` (state-tinted borders: overdue → `border-primary/30`, dueSoon → `border-warning/40`, default → hairline; status pills use `bg-primary text-on-primary` for overdue and `bg-surface-cream-strong text-ink` for dueSoon)
  - [x] Task 6: `quickActions.tsx` (dropped gradient icon backgrounds + scale-on-hover + hover-shadow per spec §6.4; semantic icon colors: Borrow → primary, Return → muted, Browse → accent-teal)
  - [x] Task 7: `summaryCards.tsx` (dropped GlassCard wrapper for plain card recipe — glass on cream is barely visible; semantic icon colors per spec §3.5: totalBooks → muted, availableBooks → success, activeLoans → accent-teal, overdueLoans → primary; KPI numeral uses `font-display text-display-sm` per spec §6.2)
  - [x] Task 8: Quality gate — `pnpm tsc --noEmit` clean throughout; per-file residue grep on all 8 in-scope files = 0 hits across `swin-charcoal|swin-ivory|swin-gold|swin-dark-bg|swin-dark-surface|swin-red|bg-white|text-white|text-gray-|bg-gray-|text-slate-|bg-slate-|border-slate-|border-gray-|rounded-2xl`; combined commit, progress update.
  - **Decisions outside plan literal text:** see `findings.md` 2026-04-29 Chat 9 — three entries covering (1) sidenav active nav uses primary tint (plan author was conservative — spec §3.5 sanctions primary for active state), (2) sidenav inline labeled theme toggle preserved (better UX in vertical sidebar than icon-only ThemeToggle), (3) mobileMenu drawer goes cream-in-light per Claude design with documented temporary mismatch against still-dark mobileNav header.
- [x] **Chat 10 (spec) — Book browse + borrow history** (combined commit `834f48a`)
  - [x] Task 9: `app/dashboard/book/page.tsx` (no-op — server-only redirect to `/dashboard/book/items`)
  - [x] Task 10: `app/dashboard/book/list/page.tsx` (server component composing `<DashboardTitleBar>` + `<SearchForm>` + `<CreateBookForm>` + `<BookCatalogTable>`; only the inline section heading `<h2>Catalogue</h2>` + "Showing N records" caption needed token swaps — h2 → `font-display text-display-md text-ink dark:text-on-dark`, caption → `font-sans text-body-sm text-muted dark:text-on-dark-soft`)
  - [x] Task 11: `app/dashboard/book/history/page.tsx` (full migration: EmptyState card recipe + primary CTA, HistoryRow per table recipe with row title `font-sans text-title-md`, author italic `text-body-sm muted`, mono date cells with returned-date in `text-success`, table thead `bg-surface-cream-strong`, header cells `text-caption-uppercase text-ink`, table wrapper `rounded-card border-hairline bg-surface-card`, h2 "Past loans" → `font-display text-display-md`) + `loading.tsx` (NO-OP — delegates to shared `app/ui/pageLoadingSkeleton.tsx` which is consumed by 6 pages including Chat 11's `notifications/loading.tsx`; migrating would silently affect Chat 11 audit, so deferred)
  - [x] Task 12: `app/ui/dashboard/bookListMobile.tsx` (full migration: outer wrapper card recipe; row hover `hover:bg-surface-cream-strong` with `p-5` per LoanCard density; status pills cream-strong/primary-tint conditional; description as `text-body-sm body`; metadata grid uses `text-caption-uppercase` labels with `font-mono text-code` values; tags as cream-strong rounded-pill chips)
  - [x] Task 13: `app/ui/dashboard/borrowingHistoryFilter.tsx` (full migration: form container card recipe minus shadow; eyebrow desktop labels; search input form recipe with primary focus ring; mobile filter icon backgrounds → `bg-surface-cream-strong`; reset link → secondary cream button responsive (round on mobile, btn on desktop))
  - [x] Task 14: `app/ui/dashboard/activeLoansTable.tsx` + `app/ui/dashboard/bookCatalogTable.tsx` (table recipe: `surface-card` wrapper, `surface-cream-strong` thead band, `hairline-soft` row dividers, hover `surface-cream-strong/50`; row-level title `text-title-md`, ISBN/barcode `font-mono text-code`; status pills overdue → solid primary fill, default → cream-strong; `bookCatalogTable.tsx` modal form fields use form input recipe; Save → primary CTA recipe; Manage/Cancel → secondary cream; Delete buttons → `border-primary/20 text-primary hover:bg-primary/5`; `renderStatusBadge` + `renderSipStatusBadge` remapped to semantic tokens (success/warning/accent-teal/primary); `Th`/`Td`/`HeaderLabel`/`Field` helpers all migrated)
  - [x] Task 14b: `app/ui/dashboard/student/myBooksTabs.tsx` (history-territory carry-over from Chat 9 audit; tab bar with `border-hairline` underline; active tab text-ink with `bg-primary` underline-stripe; inactive tabs muted-soft hover muted; tab-count badges cream/primary-tint conditional; History panel uses table recipe + row-level title `text-title-md`, author italic `text-body-sm muted`, mono date cells with returned-date `text-success`; Reservations panel uses card recipe per hold with cancel-action divider `border-hairline-soft`; both empty states use card recipe + display-sm + primary CTA)
  - [x] Task 15: Chat 10 audit + combined commit. Project-wide `pnpm tsc --noEmit` clean. Per-file residue grep across all 9 in-scope files = 0 hits for `swin-*|bg-white|text-gray|bg-gray|text-slate|bg-slate|border-slate|border-gray|rounded-2xl`. **Retained 4 `text-white` literals** in `bookCatalogTable.tsx` lines 389-392 for category-palette filter chips (`bg-blue-600 text-white`, `bg-emerald-600 text-white`, `bg-purple-600 text-white`, `bg-orange-600 text-white`) — these are intentional domain-color category badges; `text-on-primary` (= `#FFFFFF`) is value-identical but semantic mismatch on non-primary backgrounds.
  - **Decisions outside plan literal text:**
    - `book/history/loading.tsx` left untouched because it delegates to shared `PageLoadingSkeleton`. Migrating the shared skeleton would silently change 6 pages (incl. Chat 11's `notifications/loading.tsx` which is in scope for Chat 11 audit). Defer to Chat 11 or Batch 3 cleanup.
    - `bookCatalogTable.tsx` category-palette colors (blue/emerald/purple/orange tints with `text-white` solids) preserved as domain coloring. The audit grep against the 4 lines is documented as known retention.
    - `bookCatalogTable.tsx` `renderStatusBadge` had domain status colors (`bg-green-100/text-green-700`, `bg-amber-100/text-amber-800`, `bg-indigo-*`, `bg-rose-*`, `bg-yellow-*`, `bg-sky-*`, `bg-violet-*`, `bg-orange-*`) remapped to semantic design tokens (`success/warning/accent-teal/primary`). This loses the per-status hue contrast but stays inside the design system. If visual review reveals the consolidated palette is too uniform, Batch 3 may extend the token system with more semantic hues.
    - `bookCatalogTable.tsx` `Field` helper component is defined but I see no usage — migrated for consistency / future use. Left in place rather than deleted (Batch 3 dead-code sweep can remove if confirmed unused).
- [x] **Chat 11 (spec) — Camera scan + profile + notifications** (combined commit `0519b6d`)
  - [x] Pre-task: Migrate shared `app/ui/pageLoadingSkeleton.tsx` (Chat 10 deferred decision resolved YES — consumed by 6 loading.tsx pages incl. Chat 11's `notifications/loading.tsx`. Slate palette → cream tokens, `rounded-2xl` → `rounded-card`, shimmer overlay swapped to canvas/on-dark variants. Six consumer pages inherit the visual update without touching their own files.)
  - [x] Task 16: `app/dashboard/cameraScan/page.tsx` (header card recipe, `<Button>` for Start, cream secondary inline buttons for Stop + Upload, crosshair ring `accent-teal/60`, scanning indicator dot `bg-accent-teal animate-pulse`, debug log inner panel keeps `bg-ink text-success` mono-terminal aesthetic)
  - [x] Task 17: `app/profile/page.tsx` (the actual page; `app/dashboard/profile/page.tsx` is a one-line re-export, intentionally untouched. display-lg page H1 with caption-uppercase eyebrow, display-sm section titles, flat `dark:` classes replace `pageWrapperClass` ternary const, gradient blur halo on avatar dropped per spec §6.4, visibility chip → cream-strong/hairline pill)
  - [x] Task 18: `profileEditForm.tsx`, `profileNameForm.tsx`, `profileAvatarForm.tsx` (form input recipe across the board, shared `<Button>` for submit, **`isPrivileged` color theming retired** — see findings.md; avatar camera button → `bg-primary` solid with `ring-canvas` ring)
  - [x] Task 19: `app/dashboard/notifications/loading.tsx` — no-op (already delegates to shared `PageLoadingSkeleton`, which we migrated as the pre-task)
  - [x] Task 20: `app/ui/dashboard/notificationPanel.tsx` (kept inline markup, **NOT** switched to `<NotificationItem>` primitive — see findings.md; per-type colors remapped to semantic tokens matching the primitive's TYPE_STYLES; unread row tint `bg-primary/5`; mark-all-as-read link → `text-primary`; per-row mark-read affordance preserved)
  - [x] Task 21: `app/ui/dashboard/notificationToast.tsx` (card recipe + retained shadow per spec §6.4 floating; per-type icon colors → semantic `success/warning/accent-amber/accent-teal/primary`; close button → cream secondary icon recipe with primary focus ring)
  - [x] Task 22: Chat 11 audit + combined commit. Project-wide `pnpm tsc --noEmit` clean. Per-file residue grep across all 10 in-scope files = 0 hits. Three findings logged.
  - **Decisions outside plan literal text:** see `findings.md` 2026-04-30 Chat 11 — three entries covering (1) shared `pageLoadingSkeleton` migration timing, (2) `isPrivileged` form theming retirement, (3) `notificationPanel` kept inline rather than switched to `<NotificationItem>` primitive due to per-row mark-as-read affordance mismatch.

## What's next (Batch 2 — Chat 12 remaining)

Chat 11 done. One more Chat in Batch 2:
- **Chat 12** — learning module + Batch 2 acceptance audit. Files: `app/dashboard/learning/page.tsx`, `app/ui/dashboard/learning/collectionsPanel.tsx`, `app/ui/dashboard/learning/courseCard.tsx`, `app/ui/dashboard/learning/searchForm.tsx`, `app/ui/dashboard/learning/searchResultsPanel.tsx`, `app/ui/dashboard/learning-path-generator.tsx`, `app/ui/dashboard/studentChat.tsx`.

Plan source of truth: `docs/superpowers/plans/2026-04-29-ui-claude-batch-2-student-facing.md` (committed `24ff5f0`). Each subsequent chat reads the plan's relevant Chat section and executes via `superpowers:executing-plans`.

## Open issues / Decisions deferred

(none)

## Blockers

(none)

## Notes for next chat

- **Chat 11 of Batch 2 is COMPLETE.** Next chat starts Chat 12 (learning module + Batch 2 acceptance audit — see plan file).
- All commits are local. **User has not been asked to push.** Per user preference (memory `feedback_git_push.md`): always confirm branch + non-main destination before pushing.
- `.worktrees/` is ignored / untracked — leave alone.
- `DESIGN.md` (project root) is currently untracked. User may want to commit it separately; not part of this redesign work.
- The custom `ThemeProvider` at `app/ui/theme/themeProvider.tsx` is what drives `dark` class on `<html>`. **Do not introduce `next-themes`** — Tailwind `dark:` prefix already works against the custom provider. Note: ThemeProvider applies the `dark` class via post-hydration `useEffect` (no pre-hydration script), so dark-mode users see a brief light-mode flash on first load. Fixing this is a Batch 2/3 ThemeProvider-side cookie-read SSR change, not a per-component fix. See `findings.md` 2026-04-29 Chat 8 first entry for context.
- **No `pnpm lint` script exists in this project** — quality gate is `pnpm tsc --noEmit` only. See `findings.md` 2026-04-29 Chat 2 entry. Do not chase the missing lint setup.
- **Visual confirmation pending for Batches 1+2-Chat-9+10+11:** Font self-host, primitives, shell + chrome (Batch 1), login + main dashboard + nav (Chat 9), book browse + borrow history (Chat 10), and camera scan + profile + notifications (Chat 11) have not been browser-verified. User handles UI testing per memory `feedback_testing.md`. `pnpm tsc --noEmit` clean throughout — structural pass only. **The `/dev/primitives` page is live** — visit `http://localhost:3000/dev/primitives` after `pnpm dev`. Routes now showing migrated UI: `/login`, `/dashboard`, `/dashboard/book/list`, `/dashboard/book/history`, `/dashboard/my-books`, `/dashboard/cameraScan`, `/dashboard/profile` (and `/profile`), `/dashboard/notifications`. Six other loading.tsx pages also gain the migrated cream skeleton (admin, admin/users, dashboard, book/items, book/history, notifications).
- **Chat 9 known mismatches awaiting later chats:** (1) mobileMenu drawer is cream in light mode but `mobileNav.tsx` header is still dark/un-migrated (visible in light-mode mobile view) — `mobileNav.tsx` and `navLinks.tsx` are nav-shell siblings missed by Batch 1 Chat 8; pick up in Batch 3 cleanup. (2) `staffDashboard.tsx` (287 lines, 31 legacy hits) un-migrated — staff-facing, Batch 3 territory.
- **Chat 10 deferred items resolved in Chat 11:**
  - ~~Shared `app/ui/pageLoadingSkeleton.tsx`~~ — **migrated in Chat 11** (resolved YES per user pre-flight recommendation).
  - **`bookCatalogTable.tsx` category palette** retains 4 `text-white` literals on saturated category buttons (`bg-{blue|emerald|purple|orange}-600`). These are intentional domain coloring; do not chase in subsequent residue grep audits.
- **Chat 11 carry-over notes for Chat 12 / Batch 3:**
  - **`isPrivileged` prop in profile forms** is still on the component signatures but no longer drives styling. Either keep dormant (current state, non-breaking) or drop the parameter in Batch 3 dead-code sweep. Decision: leave for now — `actions.ts` and `app/profile/page.tsx` still pass it, removing requires a coordinated multi-file change that's not worth the diff in this batch.
  - **`notificationPanel` ↔ `<NotificationItem>` primitive divergence** — both surfaces share the semantic TYPE_STYLES color mapping but render via different markup paths (per-row mark-as-read affordance only on the panel). If a future UX pass wants a single source of truth, extend `<NotificationItem>` to accept a `secondaryAction` prop; until then, keep both.
  - **`app/dashboard/profile/page.tsx`** is a one-line re-export of `@/app/profile/page` — left untouched in Chat 11 (no UI to migrate). Both URL paths (`/profile` and `/dashboard/profile`) render the same migrated page.
- **Cormorant residue:** **fully cleared** for `app/` as of Chat 7. Project-wide `grep` for `Cormorant` returns 0 results across `app/` and `tailwind.config.ts`. The `Cormorant` literal still appears in `findings.md` and `progress.md` historical notes; that's documentation, not code, so it does not block Batch 3 acceptance criteria (which targets `app/`).
- **Dev gallery scope:** `/dev/primitives` exercises `Button`, `Chip`, `StatusBadge`, `KpiCard`, plus typography + color tokens. It does NOT exercise Chat 7 primitives (`BookCover`, `BarChartMini`, `IsbnLookupBox`, `BarcodePreview`) or Chat 8 chrome (`dashboardShell`, `adminShell`, `dashboardTitleBar`, `signOutButton`, `themeToggle`). Plan templates didn't include them. Batch 2/3 may extend the gallery or retire it in Batch 3 per spec §7.
- **`rounded-pill` token:** Chat 5 added `pill: '9999px'` to `tailwind.config.ts` borderRadius to make plan-written `rounded-pill` classes resolve. Future chats can use `rounded-pill` freely.
- **`accent='gold'` / `tone='gold'` props still exist in `SectionCard` and `UserAvatar`:** they now resolve to `accent-amber`. Callers in Batches 2/3 should be reviewed: either keep the gold tone for category-style highlights, or rename the prop value to `'amber'` for clarity. Either way, no caller breaks today.
- **`<SignOutButton>` callers** in `sidenav.tsx` + `mobileMenu.tsx` cleaned up in Chat 9 — both now inherit `DEFAULT_CLASS_NAME`.
- **`themeToggle`** still icon-only-button per Batch 1 redesign; only used in `mobileNav.tsx`. `sidenav.tsx` had its unused import dropped in Chat 9. Worth visual review when `mobileNav.tsx` is migrated.
- **Dead template files still present:** `app/ui/loginForm.tsx` (migrated in Chat 9 for residue cleanliness; not imported anywhere), `app/ui/customers/*`, `app/ui/invoices/*`, `app/ui/dashboard/revenueChart.tsx`, `app/ui/dashboard/latestInvoices.tsx`, `app/ui/fonts.ts` (Lusitana/Inter from Next.js Learn template; project actually uses next/font/google in app/layout.tsx since Batch 1 Chat 4). Recommend deleting all in Batch 3 final cleanup.

---

## How to start the next chat

Chat 11 已完成。下一聊做 Chat 12（learning module + Batch 2 acceptance audit）。Batch 2 plan 已写好并提交（commit `24ff5f0`）。

Paste this into the new chat:

> 继续 UI 改造工作。Chat 11 已完成；这一聊做 Chat 12（learning module + Batch 2 acceptance audit）。
>
> 先按顺序读：
> 1. `MEMORY.md`
> 2. `progress.md`（当前进度）
> 3. `task_plan.md`（Chat 11 已全部打勾）
> 4. `docs/superpowers/plans/2026-04-29-ui-claude-batch-2-student-facing.md` 的 "Chat 12" 部分
>    —— 顶部的 "Spec deltas" 是高层 recipe；Chat 12 任务列表在 Tasks 23–29 段
> 5. Batch 1 plan 顶部的 "Token Migration Reference Table" 当 class-swap 字典
>
> 读完直接调 `superpowers:executing-plans` 执行 Chat 12。
>
> Chat 12 范围 = `app/dashboard/learning/page.tsx`, `app/ui/dashboard/learning/collectionsPanel.tsx`,
> `app/ui/dashboard/learning/courseCard.tsx`, `app/ui/dashboard/learning/searchForm.tsx`,
> `app/ui/dashboard/learning/searchResultsPanel.tsx`, `app/ui/dashboard/learning-path-generator.tsx`,
> `app/ui/dashboard/studentChat.tsx`。末尾还有 Batch 2 acceptance audit。
>
> 注意事项：
> - 表单/输入按 form input recipe；CTA 用 shared `<Button>`。
> - 课程卡 (`courseCard`) 跟 chat surface (`studentChat`) 视情况看是否能复用 `<LoanCard>` /
>   message-bubble pattern；不能复用就按 card recipe inline。
> - **Chat 11 已留下的 carry-overs**：`isPrivileged` 在 profile 表单签名上 dormant；
>   `notificationPanel` ↔ `<NotificationItem>` 走的不同 markup（per-row mark-read affordance）。
>   两者都是 Batch 3 territory，本聊不动。
> - **`bookCatalogTable.tsx` 4 处 `text-white` retention** 仍是 category palette domain color —
>   audit grep 时不要去清。
> - 每动一个文件跑一次 `pnpm tsc --noEmit`，结尾合并提交一次 + Batch 2 acceptance audit。
