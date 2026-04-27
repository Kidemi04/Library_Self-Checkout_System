# Task Plan: v3.0.2 Bug Fixes

**Branch:** `Kelvin-v3.0.2-Combined`
**Worktree:** `.worktrees/Kelvin-v3.0.2-Combined/`
**Started:** 2026-04-27

## Goal

Fix 15 bugs reported by the user during UI testing of v3.0.2 (combined v3.0 + v3.0.1).
Verification commands must pass at the end:
- `pnpm build`
- `npx tsc --noEmit`
- `pnpm test`

User must do final UI re-test in browser before merge.

## Scope Decision

**Admin missing pages (overdue list, full history, add-book) are OUT OF SCOPE for this branch.**
- They are new features, not bugs
- Should be designed properly via brainstorming → plan
- Will be tracked separately on a future branch (`Kelvin-v3.0.3-AdminPages` or similar)

## Phases

### Phase 1: Diagnose all bugs — `complete`

Read code paths, log root cause hypotheses to `findings.md`. No code changes yet.

Status: complete (initial pass; deeper investigation happens per-bug in later phases)

### Phase 2: Critical DB schema bug (Staff #3) — `pending`

**Bug:** `invalid input value for enum "CopyStatus": "needs_inspection"`
**Approach decision needed:** map to existing enum vs add new enum value

Tasks:
- [ ] Read `app/dashboard/actions.ts:770` and surrounding context
- [ ] Confirm `Copies.status` column type in Supabase
- [ ] Decide: map `needs_inspection` → `PROCESSING` OR add `NEEDS_INSPECTION` to enum
- [ ] Apply fix
- [ ] Verify with type-check + build

### Phase 3: "Processing stuck" (Student #3 + Staff #1) — `pending`

Likely same root cause: action returns success but client `useFormStatus` / `useTransition` doesn't transition back to idle, or no `revalidatePath` triggers UI refresh.

Tasks:
- [ ] Inspect borrow flow client component + action revalidation
- [ ] Inspect return flow client component + action revalidation
- [ ] Check whether `useActionState` is being used correctly
- [ ] Apply fix
- [ ] User to UI re-verify

### Phase 4: CSS / Theme bugs (Student #1, #8) — `pending`

- Student #1: 404 page text is invisible (likely `text-foreground` missing in dark mode)
- Student #8: Notifications top-right date/newest has weird black border

Tasks:
- [ ] Locate 404 component (`app/notFound.tsx` or similar)
- [ ] Locate notifications filter component
- [ ] Audit Tailwind classes for dark-mode coverage

### Phase 5: Search improvements (Student #2, #5) — `pending`

- #2: Support fuzzy / partial matching
- #5: Highlight matched keyword + show result count

Tasks:
- [ ] Locate book search component + query
- [ ] Decide: client-side filter (Fuse.js) vs Postgres `ILIKE` / FTS / trigram
- [ ] Add highlight render
- [ ] Add count badge

### Phase 6: Catalogue navigation (Student #4, #6) — `pending`

- #4: Clicking a book in catalogue opens info/add page instead of borrow page
- #6: Sometimes clicking a book doesn't navigate at all

Tasks:
- [ ] Locate catalogue items list + click handler
- [ ] Confirm intended behavior with user (probably: click → book detail → "Borrow" CTA)
- [ ] Fix routing

### Phase 7: Sidebar update (Student #7) — `pending`

- Sidebar not refreshed for v3.0.2 layout
- Active state bug: clicking "My Books" also lights up "Reservation" (because Reservation is a child of My Books)
- Need explicit "Borrow" and "Return" entries in sidebar

Tasks:
- [ ] Locate sidebar nav config
- [ ] Fix `isActive` check (prefix vs exact match)
- [ ] Add Borrow / Return entries
- [ ] Confirm Reservation is correctly nested under My Books

### Phase 8: Profile avatar (Student #9) — `pending`

Avatar fails to load on `/profile` or `/dashboard/profile`.

Tasks:
- [ ] Check avatar URL source (Supabase storage? Azure AD? Gravatar?)
- [ ] Check `next.config.ts` for `images.remotePatterns` whitelist
- [ ] Add fallback initials avatar

### Phase 9: Staff UX — quick condition notes (Staff #2) — `pending`

Add a few preset note buttons in damage-report modal so staff don't always have to type.

Tasks:
- [ ] Locate `damageReportModal.tsx`
- [ ] Add preset buttons: "Water damage", "Torn pages", "Missing cover", "Highlighting", "Loose binding"
- [ ] Clicking a preset appends to the notes textarea

### Phase 11: Sign-out account picker — `pending` (NEW)

User-reported request: when signing out, allow signing back in as a different account (currently auto-uses the cached Microsoft account).

Tasks:
- [ ] Locate sign-out flow (likely `auth.ts` + `app/api/auth/azure-signout` + `app/auth/azure-logout`)
- [ ] Add `prompt=select_account` parameter to next sign-in URL OR call Microsoft logout endpoint to clear MS session before redirect
- [ ] Test: log out, then log in → should see Microsoft account picker

### Phase 12: Damage reports viewer (admin/staff) — `pending` (NEW)

User-reported question: how do admin/staff view submitted damage reports? Currently NO UI exists for this — reports are saved but invisible.

**Decision needed (similar to Admin missing pages):**
- **A**: Quick add to this branch — small list page or section in admin dashboard
- **B**: Defer to a separate branch (`Kelvin-v3.0.3-AdminPages`) along with the other admin missing pages, design properly via brainstorming

Tentative tasks if A is chosen:
- [ ] New route `/dashboard/admin/damage-reports`
- [ ] List view: table of reports (severity, date, copy, reported_by) with filter/sort
- [ ] Detail modal or row expand: show notes + photos via signed URLs
- [ ] Wire into admin sidebar nav

### Phase 10: Verification — `pending`

- [ ] `pnpm build`
- [ ] `npx tsc --noEmit`
- [ ] `pnpm test`
- [ ] Commit fixes (one logical commit per phase, or grouped)
- [ ] Hand off to user for UI re-test

## Errors Encountered

| Error | Phase | Attempt | Resolution |
|-------|-------|---------|------------|
| _none yet_ | | | |

## Decision Log

| Decision | Reason |
|----------|--------|
| Admin missing pages excluded from this branch | New features need design pass, not bug fix |
| Bug list lives in `findings.md` | Detailed analysis amplifies on every tool call if in `task_plan.md` (planning-with-files security rule) |
