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
- **Current chat:** 4 of 16 done (this chat = Chat 6 in spec numbering — Primitives B: content cards)
- **Last completed:** Tasks 15–18 (KpiCard, SectionCard, LoanCard, HoldCard, NotificationItem, TransactionReceipt, UserAvatar — all migrated to new tokens; combined commit `b13baf4`). `pnpm tsc --noEmit` clean.
- **Next step:** **Open a new chat to start Chat 7 in spec numbering (Primitives C + dev gallery).** First action: invoke `superpowers:executing-plans` against `docs/superpowers/plans/2026-04-29-ui-claude-batch-1-foundation.md` Task 19 (`BookCover.tsx`, `BarChartMini.tsx`). Tasks 19–22: BookCover, BarChartMini, IsbnLookupBox, BarcodePreview, plus create `/dev/primitives` gallery page. Single combined commit at end of Chat 7 (Task 22).

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
- **Visual confirmation pending for Chat 4 + Chat 5 + Chat 6:** Font self-host (Chat 4), interactive primitives (Chat 5), and content cards (Chat 6) have not been browser-verified. User handles UI testing per memory `feedback_testing.md`. `pnpm tsc --noEmit` clean throughout — structural pass only. Chat 7's `/dev/primitives` gallery page (Task 21) is the planned point at which all primitives become visually inspectable in one place.
- **Cormorant residue:** one real reference left in `app/ui/dashboard/primitives/BookCover.tsx` — handled by Task 19 in Chat 7, on track.
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
