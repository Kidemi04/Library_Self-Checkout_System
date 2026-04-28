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
- **Current chat:** 2 of 16 done (this chat = Chat 4 in spec numbering — Tailwind config + fonts + globals)
- **Last completed:** Tasks 1–6 (color tokens, typography scale, radius/spacing, next/font self-host, global.css cleanup, sanity check). Production `pnpm build` passes.
- **Next step:** **Open a new chat to start Chat 5 in spec numbering (Primitives A — interactive elements).** First action: invoke `superpowers:executing-plans` against `docs/superpowers/plans/2026-04-29-ui-claude-batch-1-foundation.md` Task 7 (`app/ui/button.tsx`). Tasks 7–14 are all primitives: `Button`, `Chip`, `StatusBadge`, `FilterPills`, `ScanCtaButton`, `ReminderButton`, `DueDatePicker`, `RoleBadge`. Single combined commit at end of Chat 5 (Task 14).

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

## What's next (Batch 1, in order)

See `task_plan.md` for the live checklist. Tasks 7–26 in `docs/superpowers/plans/2026-04-29-ui-claude-batch-1-foundation.md`.

## Open issues / Decisions deferred

(none)

## Blockers

(none)

## Notes for next chat

- The plan refers to "chats 4–8" in spec numbering. The chat that picks up next is **Chat 3 in actual session numbering = Chat 5 in spec numbering**.
- All commits are local. **User has not been asked to push.** Per user preference (memory `feedback_git_push.md`): always confirm branch + non-main destination before pushing.
- `.worktrees/` is ignored / untracked — leave alone.
- `DESIGN.md` (project root) is currently untracked. User may want to commit it separately; not part of this redesign work.
- The custom `ThemeProvider` at `app/ui/theme/themeProvider.tsx` is what drives `dark` class on `<html>`. **Do not introduce `next-themes`** — Tailwind `dark:` prefix already works against the custom provider.
- **No `pnpm lint` script exists in this project** — quality gate is `pnpm tsc --noEmit` only. See `findings.md` 2026-04-29 Chat 2 entry. Do not chase the missing lint setup.
- **Visual confirmation pending:** Task 4's font self-host has not been browser-verified (no requests to `fonts.googleapis.com`). User handles UI testing per memory `feedback_testing.md`. Production `pnpm build` succeeded, which is a structural pass.
- **Cormorant residue:** one real reference left in `app/ui/dashboard/primitives/BookCover.tsx` — handled by Task 19 in Chat 7, on track.

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
