# UI Claude-Style Redesign — Progress Tracker

> **For new chats picking up this work:** Read this file FIRST, then `task_plan.md`, then the spec and plan referenced below. Resume from "Next step" without re-discussing decisions.

---

## Project state

- **Branch:** `Kelvin-v3.0.4-EnhanceUIColour` (created 2026-04-29 from `Kelvin-v3.0.3-AdminPages`)
- **Spec:** `docs/superpowers/specs/2026-04-29-ui-claude-style-redesign-design.md` (commit `b5b39ea`)
- **Plan (Batch 1):** `docs/superpowers/plans/2026-04-29-ui-claude-batch-1-foundation.md` (commit `8f94019`)
- **Plans (Batch 2/3):** Not yet written.

## Current position

- **Current batch:** 1 (Foundation)
- **Current chat:** 5 of 16 done (this chat = Chat 7 in spec numbering — Primitives C: supporting + dev gallery)
- **Last completed:** Tasks 19–22 (BookCover, BarChartMini, IsbnLookupBox, BarcodePreview migrated to new tokens; `/dev/primitives` gallery + `app/dev/layout.tsx` NODE_ENV gate created; combined commit pending hash). `pnpm tsc --noEmit` clean. Residue grep across the 6 touched files returned 0 hits.
- **Next step:** **Open a new chat to start Chat 8 in spec numbering (Shell + global chrome + final Batch 1 QA).** First action: invoke `superpowers:executing-plans` against `docs/superpowers/plans/2026-04-29-ui-claude-batch-1-foundation.md` Task 23 (`dashboardShell.tsx`). Tasks 23–26: `dashboardShell`, `adminShell`, `dashboardTitleBar`, `signOutButton`, `themeToggle`, then Batch 1 quality gate (project-wide grep audit per spec §7 Batch 1 acceptance criteria) + final commit.

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
- [x] **Chat 7 (spec) — Primitives C: supporting + dev gallery** (combined commit pending hash)
  - [x] Task 19: `BookCover` (drop multi-layer boxShadow per §6.4; Cormorant fontFamily → `var(--font-newsreader)`; gradient artwork left intact — see findings), `BarChartMini` (last-bar `bg-primary`, track `bg-surface-cream-strong`, opacity ramp preserved)
  - [x] Task 20: `IsbnLookupBox` (Lookup adopts shared `<Button>` with dual `disabled`/`aria-disabled` flags; cream secondary Scan button; canvas/hairline-tinted input), `BarcodePreview` (`p-3` → `p-6` per §5.3; `border-hairline`; tokenized typography)
  - [x] Task 21: `app/dev/layout.tsx` (NODE_ENV-gated 404 in production) + `app/dev/primitives/page.tsx` (Buttons/Chips/StatusBadges/KpiCards/Typography ladder/Color swatch — both light + dark sections)
  - [x] Task 22: Quality gate (`pnpm tsc --noEmit` clean), residue grep across 6 touched files (0 hits), commit, progress update
  - **Decisions outside plan literal text:** see `findings.md` 2026-04-29 Chat 7 — five entries covering (1) BookCover gradient-art kept as-is, (2) BarChartMini track may read faint per literal recipe, (3) IsbnLookupBox Lookup needs both `disabled` + `aria-disabled` for current Button styling, (4) BarcodePreview padding upsized per §5.3, (5) dev gallery imports from canonical paths.

## What's next (Batch 1, in order)

See `task_plan.md` for the live checklist. Tasks 7–26 in `docs/superpowers/plans/2026-04-29-ui-claude-batch-1-foundation.md`.

## Open issues / Decisions deferred

(none)

## Blockers

(none)

## Notes for next chat

- The plan refers to "chats 4–8" in spec numbering. The chat that picks up next is **Chat 5 in actual session numbering = Chat 7 in spec numbering** (Primitives C — supporting + dev gallery).
- All commits are local. **User has not been asked to push.** Per user preference (memory `feedback_git_push.md`): always confirm branch + non-main destination before pushing.
- `.worktrees/` is ignored / untracked — leave alone.
- `DESIGN.md` (project root) is currently untracked. User may want to commit it separately; not part of this redesign work.
- The custom `ThemeProvider` at `app/ui/theme/themeProvider.tsx` is what drives `dark` class on `<html>`. **Do not introduce `next-themes`** — Tailwind `dark:` prefix already works against the custom provider.
- **No `pnpm lint` script exists in this project** — quality gate is `pnpm tsc --noEmit` only. See `findings.md` 2026-04-29 Chat 2 entry. Do not chase the missing lint setup.
- **Visual confirmation pending for Chats 4–7:** Font self-host (Chat 4), interactive primitives (Chat 5), content cards (Chat 6), and supporting primitives + gallery (Chat 7) have not been browser-verified. User handles UI testing per memory `feedback_testing.md`. `pnpm tsc --noEmit` clean throughout — structural pass only. **The `/dev/primitives` page is now live** — visit `http://localhost:3000/dev/primitives` after `pnpm dev` to inspect all migrated primitives in light + dark side-by-side. Page is dev-only (404s in production via `app/dev/layout.tsx`); deleted at end of Batch 3 per spec §7.
- **Cormorant residue:** **fully cleared** for `app/ui/**` primitives as of Chat 7. `BookCover` was the last reference — swapped to `var(--font-newsreader)`. Project-wide `grep` for `Cormorant` should now return 0 results across `app/`. The `Cormorant` literal still appears in `findings.md` and `progress.md` historical notes; that's documentation, not code, so it does not block Batch 3 acceptance criteria (which targets `app/`).
- **Pending Chat 8 inheritance:** the dev gallery currently exercises `Button`, `Chip`, `StatusBadge`, `KpiCard`, plus typography + color tokens. It does **not** yet exercise the Chat 7 primitives (`BookCover`, `BarChartMini`, `IsbnLookupBox`, `BarcodePreview`). Plan template did not include them either. Chat 8 may want to extend the gallery, or the gallery can simply be retired in Batch 3 as planned. No blocker — just visibility.
- **`rounded-pill` token:** Chat 5 added `pill: '9999px'` to `tailwind.config.ts` borderRadius to make plan-written `rounded-pill` classes resolve. Spec §5.1 had labelled it "(existing)" but Tailwind's stock 9999px is `rounded-full`. Future chats can use `rounded-pill` freely now.
- **`accent='gold'` / `tone='gold'` props still exist in `SectionCard` and `UserAvatar`:** they now resolve to `accent-amber`. Callers in Batches 2/3 should be reviewed: either keep the gold tone for category-style highlights, or rename the prop value to `'amber'` for clarity. Either way, no caller breaks today.

---

## How to start the next chat

Paste this into the new chat:

> 继续 UI 改造工作。先读 `MEMORY.md`，然后按顺序读：
> 1. `progress.md`（当前进度，知道做到哪步）
> 2. `task_plan.md`（当前批次的步骤）
> 3. `docs/superpowers/specs/2026-04-29-ui-claude-style-redesign-design.md`（设计决定）
> 4. `docs/superpowers/plans/2026-04-29-ui-claude-batch-1-foundation.md`（实施计划）
>
> 读完直接从 progress.md 标记的下一步开始执行，不要问"我们之前做到哪里"。
