# Progress Log

## 2026-04-27 — Session 1: Branch combine + verification

- Created `Kelvin-v3.0.2-Combined` branch from `origin/Kelvin-v3.0.1-Issue-Fix`
- v3.0.1 was strictly linear-ahead of v3.0 (no merge conflict possible)
- Worktree at `.worktrees/Kelvin-v3.0.2-Combined/`
- Verification:
  - `pnpm install` ✅ 21s
  - `npx tsc --noEmit` ✅ no errors
  - `pnpm build` ✅ 44/44 pages
  - `pnpm test` ✅ 28/28 tests
- Local commits NOT pushed (per user preference: confirm before push)

## 2026-04-27 — Session 2: Bug intake + planning

- User did UI testing, reported 15 issues across user/staff/admin
- Initial code investigation:
  - Confirmed Staff #3 root cause: `actions.ts:770` writes invalid enum value `needs_inspection` to `Copies.status`
  - Located damage handling: `app/dashboard/actions.ts` lines 608-871
- Created `task_plan.md`, `findings.md`, `progress.md`
- Decided Admin missing pages (3 issues) are out-of-scope for this bug-fix branch — they're new features
- Next: start Phase 2 (DB enum fix), then Phase 3 (processing stuck) — likely highest user-visible impact

## Open Questions for User

1. Phase 2 fix approach — preferred direction?
   - **A**: Map `needs_inspection` → `PROCESSING` in code (no migration). Fast, safe.
   - **B**: Add `NEEDS_INSPECTION` to `CopyStatus` enum via Supabase migration. More semantic but heavier.
2. Sidebar (Phase 7) — confirm: should "Borrow" and "Return" be top-level sidebar items, or under "Books"?
3. Catalogue click (Phase 6) — confirm intended behavior:
   - Click book card → book detail page (with "Borrow" CTA inside)?
   - OR click book card → directly into borrow flow with that book preselected?

## Test Results Log

| Date | Command | Result |
|------|---------|--------|
| 2026-04-27 | `pnpm install` | ✅ |
| 2026-04-27 | `npx tsc --noEmit` | ✅ clean |
| 2026-04-27 | `pnpm build` | ✅ 44/44 pages |
| 2026-04-27 | `pnpm test` | ✅ 28 / 28 |

## Files Created / Modified This Session

| File | Action | Phase |
|------|--------|-------|
| `.gitignore` (main worktree) | Added `.worktrees/` | Pre-Phase 1 |
| `task_plan.md` | Created | Phase 1 |
| `findings.md` | Created | Phase 1 |
| `progress.md` | Created | Phase 1 |
| `app/dashboard/actions.ts` | Added `CopyStatus` import + `needs_inspection → 'processing'` mapping | Phase 2 |
| `lib/sip2.ts` | Added `AbortController` 5s timeout (configurable via `SIP2_TIMEOUT_MS`) | Phase 3 |
| `app/notFound.tsx → app/not-found.tsx` | Renamed (Next.js App Router convention; previous file was never picked up) | Phase 4 |
| `app/ui/dashboard/notificationFilter.tsx` | Softened outer `border-2` → `border`, dark border `slate-800` → `slate-700/60` | Phase 4 |
| `app/ui/dashboard/damageReportModal.tsx` | Added 6 preset note chips (Water damage, Torn pages, etc.) above textarea | Phase 9 |

## Phase Completion Summary

| Phase | Bugs Covered | Status |
|-------|--------------|--------|
| 2 | Staff #3 (enum) | ✅ done — type-checked |
| 3 | Student #3 + Staff #1 (processing stuck) | ✅ done — type-checked, needs UI re-test |
| 4 | Student #1 (404) + Student #8 (notif border) | ✅ done — type-checked |
| 9 | Staff #2 (preset notes) | ✅ done — type-checked |
| 5 | Student #2 + #5 (search) | ⏸ blocked on UX decision |
| 6 | Student #4 + #6 (catalogue click) | ⏸ blocked on UX decision |
| 7 | Student #7 (sidebar) | ⏸ pending — has assumed defaults |
| 8 | Student #9 (avatar) | ⏸ pending |
| 10 | Final verify | ⏸ pending |

## Pending User Decisions

1. **Search approach (Phase 5):**
   - **A**: Server-side Postgres `ILIKE '%term%'` on title/author/ISBN — simple, scales fine
   - **B**: Client-side Fuse.js fuzzy match — handles typos but loads all books to client
2. **Catalogue click target (Phase 6):**
   - **A**: Card click → book detail page with "Borrow" CTA inside
   - **B**: Card click → directly into borrow flow with this book preselected
3. **Sidebar Borrow/Return placement (Phase 7):**
   - **A**: Top-level entries (preferred per user request)
   - **B**: Nested under "Books" section
