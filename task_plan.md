# Active Task Plan — Batch 2 (Student-facing)

> Mirror of plan task headers, with checkboxes for in-flight tracking. Batch 1 sections retained below for historical reference.

**Plan source of truth (active):** `docs/superpowers/plans/2026-04-29-ui-claude-batch-2-student-facing.md`
**Plan source of truth (Batch 1, complete):** `docs/superpowers/plans/2026-04-29-ui-claude-batch-1-foundation.md`

---

## Chat 4 (spec numbering) — Tailwind config + fonts + globals ✅ DONE

- [x] Task 1: Add new color tokens to `tailwind.config.ts` (`8025e1f`)
- [x] Task 2: Add typography token scale to `tailwind.config.ts` (`26aebcd`)
- [x] Task 3: Add radius + spacing tokens to `tailwind.config.ts` (`5d09617`)
- [x] Task 4: Configure `next/font/google` in `app/layout.tsx` (`9197f80`)
- [x] Task 5: Update `app/ui/global.css` (`d32c05d`)
- [x] Task 6: Tailwind config sanity check (no extra commit — `pnpm tsc` + `pnpm build` clean)

## Chat 5 — Primitives A (interactive) ✅ DONE

- [x] Task 7: Migrate `app/ui/button.tsx` (`3fdcb06`)
- [x] Task 8: Migrate `Chip.tsx` (`3fdcb06`)
- [x] Task 9: Migrate `StatusBadge.tsx` (`3fdcb06`)
- [x] Task 10: Migrate `FilterPills.tsx` (`3fdcb06`)
- [x] Task 11: Migrate `ScanCtaButton.tsx` (`3fdcb06`)
- [x] Task 12: Migrate `ReminderButton.tsx` (`3fdcb06`)
- [x] Task 13: Migrate `DueDatePicker.tsx` + `RoleBadge.tsx` (`3fdcb06`)
- [x] Task 14: Combined commit `3fdcb06` (also added `rounded-pill` token to tailwind config — see `findings.md`)

## Chat 6 — Primitives B (content cards) ✅ DONE

- [x] Task 15: Migrate `KpiCard.tsx` (`b13baf4`)
- [x] Task 16: Migrate `SectionCard.tsx`, `LoanCard.tsx`, `HoldCard.tsx` (`b13baf4`)
- [x] Task 17: Migrate `NotificationItem.tsx`, `TransactionReceipt.tsx`, `UserAvatar.tsx` (`b13baf4`)
- [x] Task 18: Combined commit `b13baf4` (gold→accent-amber semantic remap, HoldCardReady brand-red→primary, TransactionReceipt gradient dropped — see commit body and progress.md for rationale)

## Chat 7 — Primitives C + dev gallery ✅ DONE

- [x] Task 19: Migrate `BookCover.tsx`, `BarChartMini.tsx`
- [x] Task 20: Migrate `IsbnLookupBox.tsx`, `BarcodePreview.tsx`
- [x] Task 21: Create `/dev/primitives` gallery page (`app/dev/layout.tsx`, `app/dev/primitives/page.tsx`)
- [x] Task 22: Combined commit — see commit hash in `progress.md`. Decisions outside literal recipe logged in `findings.md` 2026-04-29 Chat 7 entries.

## Chat 8 — Shell + chrome + final QA ✅ DONE

- [x] Task 23: Migrate `dashboardShell.tsx`
- [x] Task 24: Migrate `adminShell.tsx`, `dashboardTitleBar.tsx`
- [x] Task 25: Migrate `signOutButton.tsx`, `themeToggle.tsx`
- [x] Task 26: Final Batch 1 quality gate + commit (combined commit — see `progress.md` for hash)

---

## Batch 1 COMPLETE ✅

All 26 tasks done (Tasks 1–6 token system; 7–14 interactive primitives; 15–18 content cards; 19–22 supporting primitives + dev gallery; 23–26 shell + chrome).

---

## Chat 9 — Login + main dashboard + nav full migration ✅ DONE

- [x] Task 1: Full migration of `sidenav.tsx` + `mobileMenu.tsx` (incl. SignOutButton override removal; sidenav `ThemeToggle` unused-import dropped; mobileMenu `isDark`/`useTheme` apparatus retired)
- [x] Task 2: Migrate `app/login/page.tsx` (no-op — server-only) + `app/login/LoginClient.tsx` (display-xl hero, solid primary CTA, drop gradient/shadow/shimmer)
- [x] Task 3: Migrate `app/ui/loginForm.tsx` (dead template code; migrated for residue cleanliness; flagged for Batch 3 deletion)
- [x] Task 4: Migrate `app/dashboard/page.tsx` (no-op — server-only) + `app/ui/dashboard/student/studentDashboard.tsx` (484 lines; option-A user-aligned; preserve layout-tuned literal sizes, swap colors)
- [x] Task 5: Migrate `app/ui/dashboard/student/myBooksCard.tsx`
- [x] Task 6: Migrate `app/ui/dashboard/student/quickActions.tsx` (drop gradient icon backgrounds, use semantic icon colors)
- [x] Task 7: Migrate `app/ui/dashboard/summaryCards.tsx` (drop GlassCard wrapper for plain card recipe; semantic icons: success/accent-teal/primary)
- [x] Task 8: Chat 9 audit + combined commit (`0e33402`)

Decisions outside literal plan recipe logged in `findings.md` 2026-04-29 Chat 9 entries.

---

## Chat 10 — Book browse + borrow history ✅ DONE

- [x] Task 9: Migrate `app/dashboard/book/page.tsx` (no-op — server-only redirect to `/dashboard/book/items`)
- [x] Task 10: Migrate `app/dashboard/book/list/page.tsx` (server component; only the section header `<h2>`/caption needed token swaps)
- [x] Task 11: Migrate `app/dashboard/book/history/page.tsx` (full migration: empty state, table, history rows) + `loading.tsx` (no-op — delegates to shared `PageLoadingSkeleton`; deferred per scope decision)
- [x] Task 12: Migrate `app/ui/dashboard/bookListMobile.tsx` (card recipe rows p-5; status pills cream/primary-tint; metadata grid uses caption-uppercase + mono codes)
- [x] Task 13: Migrate `app/ui/dashboard/borrowingHistoryFilter.tsx` (form input recipe; eyebrow labels; secondary cream reset button)
- [x] Task 14: Migrate `app/ui/dashboard/activeLoansTable.tsx` + `app/ui/dashboard/bookCatalogTable.tsx` (table recipe: surface-card wrapper, surface-cream-strong header, hairline-soft row dividers; status badges remapped to semantic tokens; modal form uses form input recipe; ManageBookModal save button uses primary CTA recipe)
- [x] Task 14b: Migrate `app/ui/dashboard/student/myBooksTabs.tsx` (history-territory carry-over from Chat 9 audit; tab bar with primary underline; history table recipe; reservations card recipe)
- [x] Task 15: Chat 10 audit + combined commit (`834f48a`)

**Decisions outside literal plan recipe** (see `progress.md` Chat 10 entry):
- `book/page.tsx` is a server-side redirect — no UI to migrate.
- `book/history/loading.tsx` delegates to shared `PageLoadingSkeleton` (consumed by 6 other pages including Chat 11's `notifications/loading.tsx`); migrating the shared skeleton would silently affect Chat 11 acceptance, so deferred to Chat 11 / Batch 3 cleanup.
- `bookCatalogTable.tsx` retains 4 `text-white` literals on category-palette filter chips (`bg-blue-600 text-white`, `bg-emerald-600 text-white`, etc.) — these are domain-specific category coloring, not part of the design token system. `text-on-primary` (= `#FFFFFF`) is value-identical but semantically misleading on non-primary backgrounds.
- `bookCatalogTable.tsx` keeps the per-category Tailwind palette (`blue-300/700/950`, `emerald-300/700/950`, `purple-300/700/950`, `orange-300/700/950`) for the unselected filter chip borders/hovers — same rationale as above.

---

## Chat 11 — Camera scan + profile + notifications ✅ DONE

- [x] Pre-task: Migrate shared `app/ui/pageLoadingSkeleton.tsx` (consumed by 6 loading.tsx pages incl. Chat 11's `notifications/loading.tsx` — Chat 10 deferred decision resolved here)
- [x] Task 16: Migrate `app/dashboard/cameraScan/page.tsx` (header card recipe; `<Button>` for Start; cream secondary for Stop/Upload; crosshair ring → accent-teal; debug log inner panel keeps mono terminal look on `bg-ink`)
- [x] Task 17: Migrate `app/profile/page.tsx` (display-lg page H1 + display-sm section titles; flat `dark:` classes replace `pageWrapperClass` const; gradient blur halo on avatar dropped per spec §6.4; visibility chip → cream-strong/hairline)
- [x] Task 18: Migrate profile forms — `profileEditForm.tsx`, `profileNameForm.tsx`, `profileAvatarForm.tsx` (form input recipe; shared `<Button>` for submit; `isPrivileged` color theming retired — see findings.md; avatar camera button → `bg-primary` solid)
- [x] Task 19: `app/dashboard/notifications/loading.tsx` — no-op (already delegates to migrated shared `PageLoadingSkeleton`)
- [x] Task 20: Migrate `app/ui/dashboard/notificationPanel.tsx` (kept inline markup, NOT switched to `<NotificationItem>` primitive due to per-row mark-as-read affordance mismatch — see findings.md; per-type colors remapped to semantic tokens matching primitive's TYPE_STYLES)
- [x] Task 21: Migrate `app/ui/dashboard/notificationToast.tsx` (card recipe + retained shadow per spec §6.4 floating; per-type colors → semantic tokens; close button → cream secondary icon recipe with primary focus ring)
- [x] Task 22: Chat 11 audit + combined commit (`0519b6d`; `pnpm tsc --noEmit` clean; per-file residue grep across all 10 in-scope files = 0 hits)

**Decisions outside literal plan recipe** (see `findings.md` 2026-04-30 Chat 11 entries):
- Shared `pageLoadingSkeleton.tsx` migrated alongside Chat 11 scope (Chat 10 deferred decision resolved YES per user pre-flight recommendation).
- `isPrivileged` form theming retired across all three profile forms — single primary recipe; role distinction stays on `<RoleBadge>`. Prop kept on signatures (callers unchanged, non-breaking).
- `notificationPanel` kept inline (not switched to `<NotificationItem>` primitive) due to per-row mark-as-read affordance not exposed by the primitive. Both surfaces use matching semantic TYPE_STYLES so they look semantically identical.

---

## Chat 12 — Learning module + Batch 2 acceptance audit ✅ DONE

- [x] Task 23: Migrate `app/dashboard/learning/page.tsx` (5-line redirect — no UI; actual UI is `linkedin/page.tsx`, also migrated as part of this task — see `findings.md`)
- [x] Task 24: Migrate `app/ui/dashboard/learning/collectionsPanel.tsx`
- [x] Task 25: Migrate `app/ui/dashboard/learning/courseCard.tsx`
- [x] Task 26: Migrate `app/ui/dashboard/learning/searchForm.tsx`
- [x] Task 27: Migrate `app/ui/dashboard/learning/searchResultsPanel.tsx`
- [x] Task 28: Migrate `app/ui/dashboard/learning-path-generator.tsx` (STAGE_STYLES remap to success/warning/primary)
- [x] Task 29: Migrate `app/ui/dashboard/studentChat.tsx` (921 lines; user bubble → primary per plan literal; LinkedIn `[#0A66C2]` and Google logo SVG hex retained as third-party brand-color domain coloring)
- [x] Task 30: Chat 12 audit + Batch 2 acceptance + combined commit (`c422069`)

**Decisions outside literal plan recipe** (see `findings.md` 2026-04-30 Chat 12 entries):
- `app/dashboard/learning/page.tsx` is a redirect — actual UI lives at `linkedin/page.tsx` (mirrors Chat 10 `book/page.tsx` pattern). Migrated `linkedin/page.tsx` as part of Task 23 scope.
- `STAGE_STYLES` remapped from raw emerald/amber/rose to semantic success/warning/primary in both `learning-path-generator.tsx` and `studentChat.tsx`.
- Third-party brand colors retained: LinkedIn brand blue `[#0A66C2]`/`[#70B5F9]` for hover state on LinkedIn Learning suggestion links; Google logo SVG keeps its 4-color brand palette (`#4285F4`/`#34A853`/`#FBBC05`/`#EA4335`).
- studentChat user message bubble switched from inverted-dark Claude-imitation to `bg-primary text-on-primary` per plan literal recipe.
- **Spec gap:** 6 book sub-workflow pages (`book/holds`, `book/checkout`, `book/[id]`, `book/checkin`, `book/items`, `book/reservation`) were never in any chat scope. Per user-aligned option B, deferred all 6 to Batch 3 (mirrors Chat 9 carry-over pattern for `staffDashboard.tsx` + `mobileNav.tsx`). Narrowed Chat 12 acceptance audit to actually-in-scope files only.

---

## Chat 13 — Admin shell + dashboard + users + nav carry-overs ✅ DONE

- [x] Task 1: Migrate `app/ui/dashboard/mobileNav.tsx` + `app/ui/dashboard/navLinks.tsx` (Chat 9 carry-over). `useTheme` apparatus dropped; nav-active uses `bg-primary/10 text-primary` tint per Chat 9 sidenav decision; bottom-nav center CTA gradient + boxShadow dropped per spec §6.4 (now solid `bg-primary`); role badges remapped to semantic tokens (admin → primary, staff → accent-amber, student → cream-strong).
- [x] Task 2: Verify `app/dashboard/admin/layout.tsx` + `app/dashboard/admin/page.tsx` + `app/admin/page.tsx` — all 3 are 0-hit server-only files (layout: 13-line wrapper; page: server delegator to adminDashboard; admin/page: server redirect). No edits needed.
- [x] Task 3: Migrate `app/ui/dashboard/admin/adminDashboard.tsx` (281 lines). KPI cards + chart card + overdue alert + quick actions + recent activity + most borrowed all migrated. ACTIVITY_COLORS literal hex map replaced with className-based ACTIVITY_DOT_CLASSES (semantic tokens: borrowed → accent-amber, returned → success, held → accent-teal, overdue → primary). "Add book" inline CTA replaced with shared `<Button>`. Quick action tile hover tints kept domain-themed (Circulation → primary, Catalogue → accent-amber).
- [x] Task 4: Migrate `app/dashboard/admin/users/page.tsx` (1155 lines, ~61 hits) in 6 chunks: top "Add staff" form + status banner; section header + search + thead; desktop table cells + actions; mobile card list; pagination + delete confirmation modal; UserDetailEditor sub-component. Inline `<Button>` adopted for primary CTAs. Status banner: error → primary tokens, success → success tokens. Destructive Delete button: `border-primary/30 text-primary hover:bg-primary/5` pattern.
- [x] Task 5: Verify `app/dashboard/admin/loading.tsx` + `app/dashboard/admin/users/loading.tsx` — both no-op (delegate to migrated `PageLoadingSkeleton`).
- [x] Task 6: Chat 13 audit + combined commit (`a5962ca`).

---

## Chat 14 — Admin books management + 2 student-facing book carry-overs ✅ DONE

- [x] Task 7: Migrate `app/ui/dashboard/manageBookDrawer.tsx` (file-named "drawer" but actually a centered modal — applied modal recipe; ink/50 backdrop; card recipe panel + retained shadow per §6.4; display-sm title; cream secondary close button).
- [x] Task 8: Migrate `app/ui/dashboard/manageBookModal.tsx` (modal panel card recipe + retained shadow per §6.4; ink/50 backdrop with backdrop-blur-sm preserved; clsx-driven enter/exit transitions preserved).
- [x] Task 9: Migrate `app/ui/dashboard/manageCopiesModal.tsx` (257 lines). STATUS_STYLE remap from raw 6-color palette (green/amber/red/orange/blue/violet) to 6 semantic tokens (success/warning/primary full+tint/accent-teal/accent-amber) — extends Chat 12 STAGE_STYLES precedent, see findings.md. Modal panel card recipe + retained shadow; table recipe; form input recipe for Add-copy input; primary CTA recipe for submit; destructive primary/30 border for Remove button.
- [x] Task 10: Migrate `app/ui/dashboard/createBookForm.tsx` (187 lines). Section card recipe (drop shadow per §6.4); display-sm H2; form input recipe applied to all inputs + textarea via `replace_all` (textarea adjusted to py-2 instead of h-10 to coexist with rows={3}); SubmitButton replaced with shared `<Button>` primitive (dual `disabled`/`aria-disabled` flags); ActionMessage tone semantic remap (success → text-success, error → text-primary).
- [x] Task 11: Migrate `app/ui/dashboard/recommendations/recommendationLab.tsx` (464 lines). Migrated in chunks via replace_all on common patterns + targeted unique edits. TagChip cream-strong rounded-pill; ReasonList semantic primary BoltIcon; RecommendationCard card recipe (drop shadow, hover:border-primary/20 instead of hover:shadow-lg per §6.4); AssociationPills card recipe + primary tint badge; contentClass eyebrow chip cream-strong; main control panel card recipe + form input recipe textarea + cream-secondary quick hashtag pills + primary checkboxes; AI prototype panel cream-canvas with primary/40 dashed border; right-column heading icons (LightBulb/Sparkles) primary; "Your interests" tokens primary/10 tint; "Filters applied" sub-block cream-strong with hairline-border pills (drop white shadow chips); "How scoring works" card recipe.
- [x] Task 12: Migrate `app/dashboard/book/items/page.tsx` (Batch 2 carry-over) + **discovered consumed components** `app/ui/dashboard/bookList.tsx` (487 lines, 16 hits) and `app/ui/dashboard/bookItemsFilter.tsx` (160 lines, 9 hits) — plan said "reuse migrated BookCatalogTable + BookListMobile" but the page actually consumes `BookList` and `BookItemsFilter` (different components, not migrated). See findings.md 2026-05-01 Chat 14 entry. bookList covers grid + list variants, AvailabilityChip status remap, Borrow primary CTA, Copies cream-secondary pill, EmptyState card recipe; bookItemsFilter covers search input form recipe, category pill active/inactive (active = `bg-ink text-on-dark` neutral contrast), grid/list view-toggle.
- [x] Task 13: Migrate `app/dashboard/book/[id]/page.tsx` (Batch 2 carry-over, ~25+ hits). Back-to-catalogue cream-secondary CTA; availability + actions card recipe with display-sm numeral; semantic Available/On-loan badge (success/primary); Borrow primary CTA + Browse-more cream-secondary; metadata `<dl>` card recipe with caption-uppercase labels and font-mono code values; tags as cream-strong rounded-pill chips; admin/staff Copies sub-card with hairline-bordered per-copy rows.
- [x] Task 14: Chat 14 audit + combined commit (`6c7be12`). Project-wide `pnpm tsc --noEmit` clean throughout; per-file residue grep across all 9 in-scope files = 0 hits (extended regex incl. raw red/emerald/amber/rose/violet/orange/blue/green).

---

## Chat 15 — Admin overdue + add-book + 4 book sub-workflow carry-overs ✅ DONE

- [x] Task 15: Migrate `app/dashboard/admin/overdue/page.tsx` (server delegator no-op) + `app/ui/dashboard/admin/overdueViewer.tsx` (248 lines, ~14 hits). Filter pills (active = `bg-primary text-on-primary`, inactive = cream secondary); search input form recipe; Export CSV cream secondary; status banner success/primary tokens; table recipe (cream-strong thead, hairline-soft row dividers, hover surface-cream-strong/50); Days-overdue badge `bg-primary/15 text-primary`; due date `text-primary` (overdue indicator). "All loans on time" empty state success-tinted card.
- [x] Task 16: Migrate `app/dashboard/admin/books/new/page.tsx` (server delegator no-op) + `app/ui/dashboard/admin/addBookForm.tsx` (344 lines, ~11 hits) + `app/ui/dashboard/admin/cameraScanModal.tsx` (164 lines, ~5 hits). Form recipe everywhere; warning-tinted "duplicate exists" notice; primary destructive submit; tags input cream-strong pills + cream-canvas wrapper. cameraScanModal keeps dark panel chrome (camera viewfinder UX) with semantic dark tokens (bg-dark-canvas/text-on-dark, accent-teal/80 aim brackets per spec, warning notice for errors, primary CTA for Use button).
- [x] Task 17: Migrate `app/dashboard/book/holds/page.tsx` (Batch 2 carry-over, 243 lines). **Plan misdescribed this as "Student holds list" — it's actually staff/admin holds management** (server redirects students). Migrated only the inline stuck-holds warning section (warning-tinted notice + table per recipe); `<HoldsManagementView>` migration stays deferred to Chat 16 Task 25 as planned. See findings.md 2026-05-01 Chat 15 entry.
- [x] Task 18: Migrate `app/dashboard/book/reservation/page.tsx` (Batch 2 carry-over, 200 lines). Empty state card recipe + primary CTA "Browse catalogue"; H2 display-md; per-hold list using card recipe wrapping migrated `<HoldCard>` primitive; details `<dl>` with caption-uppercase labels; footer message uses primary tone for ready holds, muted tone for queued. **Carry-over discovery:** `app/ui/dashboard/cancelHoldButton.tsx` (1 hit) migrated to cream secondary pill recipe.
- [x] Task 19: Migrate `app/dashboard/book/checkout/page.tsx` (Batch 2 carry-over, staff-side, 138 lines). Hero gradient → solid `bg-primary` per spec §6.4 (drop boxShadow); inner cream-on-primary decorative layers preserved. **Carry-over discoveries:** `app/ui/dashboard/searchForm.tsx` (4 hits — form recipe), `app/ui/dashboard/checkOutForm.tsx` (29 hits — full migration: section card recipe, form recipe inputs/select, lookup message tones success/primary/muted, selected book preview cream-strong tile, self-checkout borrower card cream-strong tile, warnings primary/warning tones, override checkbox dashed-hairline, error tone primary, SubmitButton primary CTA), `app/ui/dashboard/patronCombobox.tsx` (16 hits — combobox form recipe with success-tinted-border-when-selected, results dropdown card recipe with shadow, primary tint for active option), `app/ui/dashboard/cameraScannerButton.tsx` (24 hits — trigger button → `bg-primary`, modal panel keeps dark chrome with semantic tokens, accent-teal/80 aim brackets, success/scan-flash, primary scan-line, primary CTA Submit button). `app/ui/dashboard/confirmModal.tsx` (11 hits, also consumed by addBookForm) — modal recipe + retained shadow, ink/50 backdrop, primary destructive CTA.
- [x] Task 20: Migrate `app/dashboard/book/checkin/page.tsx` (Batch 2 carry-over, staff-side, 185 lines). Return hero gradient → solid `bg-success` per spec §6.4 (drop boxShadow); "Returning soon" attention card warning-tinted; "Bring book to counter" info card cream-canvas; H2 display-md. **Carry-over discoveries:** `app/ui/dashboard/checkInForm.tsx` (19 hits — section card recipe, mode tabs cream-strong with active surface-card, form recipe input/select, damage chip warning-tinted, single receipt success-tinted, primary CTA, confirm modal modal-recipe with primary destructive CTA), `app/ui/dashboard/damageReportModal.tsx` (22 hits — modal recipe with shadow, primary-tinted icon container, severity option chips primary-tinted-active vs cream-secondary-inactive, preset note pills cream secondary, photo list rows hairline-bordered, primary destructive submit).
- [x] Task 21: Chat 15 audit + combined commit (`a817856`). Project-wide `pnpm tsc --noEmit` clean throughout; per-file residue grep across all 15 in-scope/carry-over files = 0 hits.

---

## Batch 2 COMPLETE ✅ (with documented carry-overs to Batch 3)

All Chat 9–12 student-facing surfaces migrated. Carry-overs to Batch 3:
- `app/dashboard/book/holds/page.tsx`
- `app/dashboard/book/checkout/page.tsx`
- `app/dashboard/book/[id]/page.tsx`
- `app/dashboard/book/checkin/page.tsx`
- `app/dashboard/book/items/page.tsx`
- `app/dashboard/book/reservation/page.tsx`
- `app/ui/dashboard/staffDashboard.tsx` (Chat 9 finding)
- `app/ui/dashboard/mobileNav.tsx` + `app/ui/dashboard/navLinks.tsx` (Chat 9 finding)

Plus Batch 3 spec scope (admin/staff per spec §7) — plan does not yet exist; new chat must invoke `superpowers:writing-plans` against spec §7 Batch 3.
