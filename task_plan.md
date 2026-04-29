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
- [x] Task 8: Chat 9 audit + combined commit (commit hash: backfilled below)

Decisions outside literal plan recipe logged in `findings.md` 2026-04-29 Chat 9 entries.
