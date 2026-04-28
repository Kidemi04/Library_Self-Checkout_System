# UI Claude-Style Redesign — Progress Tracker

> **For new chats picking up this work:** Read this file FIRST, then `task_plan.md`, then the spec and plan referenced below. Resume from "Next step" without re-discussing decisions.

---

## Project state

- **Branch:** `Kelvin-v3.0.4-EnhanceUIColour` (created 2026-04-29 from `Kelvin-v3.0.3-AdminPages`)
- **Spec:** `docs/superpowers/specs/2026-04-29-ui-claude-style-redesign-design.md` (commit `b5b39ea`)
- **Plan (Batch 1):** `docs/superpowers/plans/2026-04-29-ui-claude-batch-1-foundation.md` (commit `8f94019`)
- **Plans (Batch 2/3):** Not yet written.

## Current position

- **Current batch:** 1 (Foundation) — **COMPLETE ✅**
- **Current chat:** 6 of 16 done (this chat = Chat 8 in spec numbering — Shell + global chrome + final Batch 1 QA)
- **Last completed:** Tasks 23–26 (`dashboardShell`, `adminShell`, `dashboardTitleBar`, `signOutButton`, `themeToggle` migrated; Batch 1 grep audit — 0 residue across all 7 audited Batch 1 paths, 0 `Cormorant` matches in `app/` or `tailwind.config.ts`; combined commit `24f0310`). `pnpm tsc --noEmit` clean.
- **Next step:** **Open a new chat to start Batch 2 (student-facing pages — Chats 9–12 in spec numbering).** First action: invoke `superpowers:writing-plans` against the spec at `docs/superpowers/specs/2026-04-29-ui-claude-style-redesign-design.md` §7 "Batch 2 — Student-facing" to generate `docs/superpowers/plans/2026-04-29-ui-claude-batch-2-student-facing.md`. Then execute that plan. The Token Migration Reference Table at the top of the Batch 1 plan is the canonical recipe; Batch 2 plan should reference it rather than duplicate. Caller-side fix-ups expected during Batch 2: drop the `className` overrides on `<SignOutButton>` in `sidenav.tsx:228` and `mobileMenu.tsx:139` so they inherit the new `DEFAULT_CLASS_NAME` (or replace those classNames with new tokens — design call).

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

## What's next (Batch 2)

Batch 1 plan complete. Batch 2 = student-facing pages (Chats 9–12 in spec numbering). Plan file does NOT yet exist. Next chat must:
1. Invoke `superpowers:writing-plans` against spec §7 "Batch 2 — Student-facing"
2. Write `docs/superpowers/plans/2026-04-29-ui-claude-batch-2-student-facing.md`
3. Execute that plan via `superpowers:executing-plans`

Files in scope per spec §7 Batch 2: `login/page`, `LoginClient`, `loginForm`, `dashboard/page`, `student/myBooksCard`, `student/quickActions`, `summaryCards`, `dashboard/book/page`, `dashboard/book/list/page`, `dashboard/book/history/*`, `bookListMobile`, `borrowingHistoryFilter`, `activeLoansTable`, `bookCatalogTable`, `dashboard/cameraScan/page`, `dashboard/profile/page`, `profileEditForm/profileNameForm/profileAvatarForm`, `notifications/loading`, `notificationPanel`, `notificationToast`, `dashboard/learning/page`, `learning/collectionsPanel`, `learning/courseCard`, `learning/searchForm`, `learning/searchResultsPanel`, `learning-path-generator`, `studentChat`. Also: caller-side cleanup of `<SignOutButton>` overrides in `sidenav.tsx` + `mobileMenu.tsx`.

## Open issues / Decisions deferred

(none)

## Blockers

(none)

## Notes for next chat

- **Batch 1 is COMPLETE.** Next chat starts Batch 2 (student-facing pages — Chats 9–12 in spec numbering). The Batch 2 plan does NOT yet exist; the next chat must invoke `superpowers:writing-plans` against spec §7 Batch 2 first.
- All commits are local. **User has not been asked to push.** Per user preference (memory `feedback_git_push.md`): always confirm branch + non-main destination before pushing.
- `.worktrees/` is ignored / untracked — leave alone.
- `DESIGN.md` (project root) is currently untracked. User may want to commit it separately; not part of this redesign work.
- The custom `ThemeProvider` at `app/ui/theme/themeProvider.tsx` is what drives `dark` class on `<html>`. **Do not introduce `next-themes`** — Tailwind `dark:` prefix already works against the custom provider. Note: ThemeProvider applies the `dark` class via post-hydration `useEffect` (no pre-hydration script), so dark-mode users see a brief light-mode flash on first load. Fixing this is a Batch 2/3 ThemeProvider-side cookie-read SSR change, not a per-component fix. See `findings.md` 2026-04-29 Chat 8 first entry for context.
- **No `pnpm lint` script exists in this project** — quality gate is `pnpm tsc --noEmit` only. See `findings.md` 2026-04-29 Chat 2 entry. Do not chase the missing lint setup.
- **Visual confirmation pending for Batch 1 (Chats 4–8):** Font self-host, interactive primitives, content cards, supporting primitives + gallery, and shell + chrome have not been browser-verified. User handles UI testing per memory `feedback_testing.md`. `pnpm tsc --noEmit` clean throughout — structural pass only. **The `/dev/primitives` page is now live** — visit `http://localhost:3000/dev/primitives` after `pnpm dev` to inspect migrated primitives in light + dark side-by-side. Page is dev-only (404s in production via `app/dev/layout.tsx`); deleted at end of Batch 3 per spec §7.
- **Cormorant residue:** **fully cleared** for `app/` as of Chat 7. Project-wide `grep` for `Cormorant` returns 0 results across `app/` and `tailwind.config.ts`. The `Cormorant` literal still appears in `findings.md` and `progress.md` historical notes; that's documentation, not code, so it does not block Batch 3 acceptance criteria (which targets `app/`).
- **Dev gallery scope:** `/dev/primitives` exercises `Button`, `Chip`, `StatusBadge`, `KpiCard`, plus typography + color tokens. It does NOT exercise Chat 7 primitives (`BookCover`, `BarChartMini`, `IsbnLookupBox`, `BarcodePreview`) or Chat 8 chrome (`dashboardShell`, `adminShell`, `dashboardTitleBar`, `signOutButton`, `themeToggle`). Plan templates didn't include them. Batch 2/3 may extend the gallery or retire it in Batch 3 per spec §7.
- **`rounded-pill` token:** Chat 5 added `pill: '9999px'` to `tailwind.config.ts` borderRadius to make plan-written `rounded-pill` classes resolve. Future chats can use `rounded-pill` freely.
- **`accent='gold'` / `tone='gold'` props still exist in `SectionCard` and `UserAvatar`:** they now resolve to `accent-amber`. Callers in Batches 2/3 should be reviewed: either keep the gold tone for category-style highlights, or rename the prop value to `'amber'` for clarity. Either way, no caller breaks today.
- **`<SignOutButton>` callers (`sidenav.tsx:228`, `mobileMenu.tsx:139`) still pass overriding classNames** that consume legacy `swin-charcoal` / `swin-red` tokens. The button itself now has a `DEFAULT_CLASS_NAME` carrying the secondary CTA recipe; callers will inherit it once Batch 2 drops the `className` prop on these call sites (or migrates the prop classes to new tokens — design call).
- **`themeToggle` redesigned** from sliding-pill to single round icon button per plan recipe. Dropped dead `context='sidebar'` prop. Only caller is `mobileNav.tsx:139` (`<ThemeToggle size="sm" />`); `sidenav.tsx` had an unused import. Worth visual review during Batch 2 since this is a UX change beyond pure token swap. See `findings.md` 2026-04-29 Chat 8 third entry.

---

## How to start the next chat

Batch 1 已完成。下一聊要做 Batch 2（学生端页面）。Batch 2 实施计划文件**还不存在** —— 必须先写出来再执行。

Paste this into the new chat:

> 继续 UI 改造工作。Batch 1 已完成；这一聊要做 Batch 2（学生端页面）。
>
> 先按顺序读：
> 1. `MEMORY.md`
> 2. `progress.md`（当前进度）
> 3. `task_plan.md`（当前 batch 步骤；Batch 1 已全部打勾）
> 4. `docs/superpowers/specs/2026-04-29-ui-claude-style-redesign-design.md`（设计决定）
> 5. `docs/superpowers/plans/2026-04-29-ui-claude-batch-1-foundation.md`
>    —— 只用顶部的 "Token Migration Reference Table" 当迁移配方，
>       其他部分是 Batch 1 的历史记录，跳过即可
>
> 读完不要立即写代码：
>
> 第一步：调用 `superpowers:writing-plans`，根据 spec §7 "Batch 2 — Student-facing"
>        写出 `docs/superpowers/plans/2026-04-29-ui-claude-batch-2-student-facing.md`。
>        计划要复用 Batch 1 plan 的 Token Migration Reference Table，不要重复抄写。
>        Batch 2 范围 = login + 主 dashboard + book browse/history + scan + profile
>        + notifications + learning module；spec §7 表格里有完整文件清单。
>
> 第二步：跟我对齐计划（Batch 2 一聊就能写完，但执行要分 4 聊 = spec 编号 9–12）。
>
> 第三步：等我点头后，调用 `superpowers:executing-plans` 执行 Chat 9 部分。
>
> 顺带：Batch 2 也要清理 `<SignOutButton>` 在 `sidenav.tsx:228` 和 `mobileMenu.tsx:139`
>       的 className override —— 现在 SignOutButton 自带 `DEFAULT_CLASS_NAME`，
>       调用方只要把 `className` prop 拿掉就会继承新外观。
