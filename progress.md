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

- **Current batch:** 2 (Student-facing) — Chat 9 of 4 done
- **Current chat:** 7 of 16 done (this chat = Chat 9 in spec numbering — Login + main dashboard + nav full migration)
- **Last completed:** Tasks 1–8 of Chat 9. Files migrated: `sidenav.tsx`, `mobileMenu.tsx`, `app/login/page.tsx` (no-op), `app/login/LoginClient.tsx`, `app/ui/loginForm.tsx`, `app/dashboard/page.tsx` (no-op), `app/ui/dashboard/student/studentDashboard.tsx` (option-A user-aligned scope addition), `app/ui/dashboard/student/myBooksCard.tsx`, `app/ui/dashboard/student/quickActions.tsx`, `app/ui/dashboard/summaryCards.tsx`. Combined commit `0e33402`. `pnpm tsc --noEmit` clean throughout. Per-file residue grep: 0 hits for legacy `swin-*`, `bg-white`, `text-gray|slate`, `bg-gray|slate`, `border-gray|slate`, `rounded-2xl` across all 8 in-scope files.
- **Next step:** **Open a new chat to start Chat 10 (book browse + borrow history).** First action: read this `progress.md` + `task_plan.md` + Batch 2 plan (`docs/superpowers/plans/2026-04-29-ui-claude-batch-2-student-facing.md`) "Chat 10" section, then execute via `superpowers:executing-plans`. Files in scope per spec §7 / Batch 2 plan Chat 10: `book/page`, `book/list/page`, `book/history/page+loading`, `bookListMobile`, `borrowingHistoryFilter`, `activeLoansTable`, `bookCatalogTable`. Chat 10 should also pick up `app/ui/dashboard/student/myBooksTabs.tsx` (23+ legacy hits; consumed by `app/dashboard/my-books/page.tsx` which is history-adjacent) — was discovered during Chat 9 audit, defer to Chat 10 since it's history-territory not main-dashboard.

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

## What's next (Batch 2 — Chats 10/11/12 remaining)

Chat 9 done. Three more Chats in Batch 2:
- **Chat 10** — book browse + borrow history. Files: `dashboard/book/page`, `dashboard/book/list/page`, `dashboard/book/history/page+loading`, `bookListMobile`, `borrowingHistoryFilter`, `activeLoansTable`, `bookCatalogTable`. **Plus** `app/ui/dashboard/student/myBooksTabs.tsx` (discovered Chat 9; consumed by `app/dashboard/my-books/page.tsx`; ~23+ legacy hits; history-territory).
- **Chat 11** — camera scan + profile + notifications.
- **Chat 12** — learning module + Batch 2 acceptance audit.

Plan source of truth: `docs/superpowers/plans/2026-04-29-ui-claude-batch-2-student-facing.md` (committed `24ff5f0`). Each subsequent chat reads the plan's relevant Chat section and executes via `superpowers:executing-plans`.

## Open issues / Decisions deferred

(none)

## Blockers

(none)

## Notes for next chat

- **Chat 9 of Batch 2 is COMPLETE.** Next chat starts Chat 10 (book browse + borrow history — see plan file).
- All commits are local. **User has not been asked to push.** Per user preference (memory `feedback_git_push.md`): always confirm branch + non-main destination before pushing.
- `.worktrees/` is ignored / untracked — leave alone.
- `DESIGN.md` (project root) is currently untracked. User may want to commit it separately; not part of this redesign work.
- The custom `ThemeProvider` at `app/ui/theme/themeProvider.tsx` is what drives `dark` class on `<html>`. **Do not introduce `next-themes`** — Tailwind `dark:` prefix already works against the custom provider. Note: ThemeProvider applies the `dark` class via post-hydration `useEffect` (no pre-hydration script), so dark-mode users see a brief light-mode flash on first load. Fixing this is a Batch 2/3 ThemeProvider-side cookie-read SSR change, not a per-component fix. See `findings.md` 2026-04-29 Chat 8 first entry for context.
- **No `pnpm lint` script exists in this project** — quality gate is `pnpm tsc --noEmit` only. See `findings.md` 2026-04-29 Chat 2 entry. Do not chase the missing lint setup.
- **Visual confirmation pending for Batches 1+2-Chat-9:** Font self-host, primitives, shell + chrome (Batch 1) and login + main dashboard + nav full migration (Chat 9) have not been browser-verified. User handles UI testing per memory `feedback_testing.md`. `pnpm tsc --noEmit` clean throughout — structural pass only. **The `/dev/primitives` page is live** — visit `http://localhost:3000/dev/primitives` after `pnpm dev`. The `/dashboard` and `/login` routes now show migrated UI for visual review.
- **Chat 9 known mismatches awaiting later chats:** (1) mobileMenu drawer is cream in light mode but `mobileNav.tsx` header is still dark/un-migrated (visible in light-mode mobile view) — `mobileNav.tsx` and `navLinks.tsx` are nav-shell siblings missed by Batch 1 Chat 8; pick up in Batch 3 cleanup. (2) `staffDashboard.tsx` (287 lines, 31 legacy hits) un-migrated — staff-facing, Batch 3 territory.
- **Cormorant residue:** **fully cleared** for `app/` as of Chat 7. Project-wide `grep` for `Cormorant` returns 0 results across `app/` and `tailwind.config.ts`. The `Cormorant` literal still appears in `findings.md` and `progress.md` historical notes; that's documentation, not code, so it does not block Batch 3 acceptance criteria (which targets `app/`).
- **Dev gallery scope:** `/dev/primitives` exercises `Button`, `Chip`, `StatusBadge`, `KpiCard`, plus typography + color tokens. It does NOT exercise Chat 7 primitives (`BookCover`, `BarChartMini`, `IsbnLookupBox`, `BarcodePreview`) or Chat 8 chrome (`dashboardShell`, `adminShell`, `dashboardTitleBar`, `signOutButton`, `themeToggle`). Plan templates didn't include them. Batch 2/3 may extend the gallery or retire it in Batch 3 per spec §7.
- **`rounded-pill` token:** Chat 5 added `pill: '9999px'` to `tailwind.config.ts` borderRadius to make plan-written `rounded-pill` classes resolve. Future chats can use `rounded-pill` freely.
- **`accent='gold'` / `tone='gold'` props still exist in `SectionCard` and `UserAvatar`:** they now resolve to `accent-amber`. Callers in Batches 2/3 should be reviewed: either keep the gold tone for category-style highlights, or rename the prop value to `'amber'` for clarity. Either way, no caller breaks today.
- **`<SignOutButton>` callers** in `sidenav.tsx` + `mobileMenu.tsx` cleaned up in Chat 9 — both now inherit `DEFAULT_CLASS_NAME`.
- **`themeToggle`** still icon-only-button per Batch 1 redesign; only used in `mobileNav.tsx`. `sidenav.tsx` had its unused import dropped in Chat 9. Worth visual review when `mobileNav.tsx` is migrated.
- **Dead template files still present:** `app/ui/loginForm.tsx` (migrated in Chat 9 for residue cleanliness; not imported anywhere), `app/ui/customers/*`, `app/ui/invoices/*`, `app/ui/dashboard/revenueChart.tsx`, `app/ui/dashboard/latestInvoices.tsx`, `app/ui/fonts.ts` (Lusitana/Inter from Next.js Learn template; project actually uses next/font/google in app/layout.tsx since Batch 1 Chat 4). Recommend deleting all in Batch 3 final cleanup.

---

## How to start the next chat

Chat 9 已完成。下一聊做 Chat 10（book browse + borrow history）。Batch 2 plan 已写好并提交（commit `24ff5f0`）。

Paste this into the new chat:

> 继续 UI 改造工作。Chat 9 已完成；这一聊做 Chat 10（book browse + borrow history）。
>
> 先按顺序读：
> 1. `MEMORY.md`
> 2. `progress.md`（当前进度）
> 3. `task_plan.md`（Chat 9 已全部打勾）
> 4. `docs/superpowers/plans/2026-04-29-ui-claude-batch-2-student-facing.md` 的 "Chat 10" 部分
>    —— 顶部的 "Spec deltas" 是高层 recipe；Chat 10 任务列表在中段
> 5. Batch 1 plan 顶部的 "Token Migration Reference Table" 当 class-swap 字典
>
> 读完直接调 `superpowers:executing-plans` 执行 Chat 10。
>
> Chat 10 范围 = `book/page`, `book/list/page`, `book/history/page+loading`,
> `bookListMobile`, `borrowingHistoryFilter`, `activeLoansTable`, `bookCatalogTable`,
> 加上 `app/ui/dashboard/student/myBooksTabs.tsx`（Chat 9 audit 时发现 ~23 处 legacy
> token；它服务 `app/dashboard/my-books/page.tsx`，归属 history-territory，所以推到
> Chat 10 一起做）。
>
> 注意事项：
> - 表格类组件（activeLoansTable, bookCatalogTable, myBooksTabs）按 Batch 2 plan 的
>   "Spec deltas → Card / panel recipe" + 表格 recipe 处理：surface-card wrapper +
>   surface-cream-strong 表头 + hairline-soft 行分割。
> - 对 row 级别的状态条件渲染（overdue / available 等）保留逻辑、只换 className 字符串。
> - 每动一个文件跑一次 `pnpm tsc --noEmit`，结尾合并提交一次。
