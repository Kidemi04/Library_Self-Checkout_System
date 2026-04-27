# Findings: v3.0.2 Bug Investigation

## Bug Inventory

### 🔴 Critical — DB schema mismatch

#### Staff #3 — `needs_inspection` enum violation

**Symptom (user-reported error log):**
```
Failed to update copy during return processing {
  code: '22P02',
  message: 'invalid input value for enum "CopyStatus": "needs_inspection"'
}
```

**Root cause (confirmed by code reading):**
- `app/dashboard/actions.ts:770-771` does `.from('Copies').update({ status: copyStatusFinal })`
- `copyStatusFinal` type: `'available' | 'damaged' | 'lost' | 'needs_inspection'` (line 652)
- DB `CopyStatus` enum (per `README.md` and migrations): `'AVAILABLE','ON_LOAN','LOST','DAMAGED','PROCESSING','HOLD_SHELF'`
- `needs_inspection` is **not** a valid enum value → Postgres 22P02 invalid_text_representation
- The new `DamageReports` table (migration `20260423_damage_reports.sql`) accepts `severity IN ('damaged','lost','needs_inspection')` via CHECK constraint, but that's a separate column

**Fix options:**
1. **Map `needs_inspection` → `PROCESSING`** at the action layer (semantically: copy needs further review before re-shelving). DamageReport row still records `needs_inspection` as severity. **Preferred** — no migration needed.
2. Add `NEEDS_INSPECTION` to the `CopyStatus` enum via new migration. Heavier; requires running migration in Supabase.

**Suspicious side-issue (resolved):** Initially worried code sends lowercase but README enum was UPPERCASE. Confirmed via `app/lib/supabase/types.ts:3` — actual `CopyStatus` type is lowercase (`available, on_loan, lost, damaged, processing, hold_shelf`). README is stale; the running DB matches the lowercase TypeScript type. No case mismatch bug.

**Files involved:**
- `app/dashboard/actions.ts` (lines 608-871)
- `app/lib/supabase/queries.ts` (`normalizeCopyStatus` line 22, `DamageSeverity` type line 1161)
- `app/ui/dashboard/damageReportModal.tsx`
- `app/ui/dashboard/checkInForm.tsx`

**Status:** ✅ FIXED 2026-04-27 — `app/dashboard/actions.ts` now imports `CopyStatus` and maps `needs_inspection → 'processing'` before writing to the `Copies.status` column. DamageReports row still records `needs_inspection` as severity (separate column with its own check constraint, untouched).

---

### 🟠 Same root cause — async state stuck

#### Student #3 — Borrow shows "processing" forever, manual refresh sometimes needed
#### Staff #1 — Return shows "processing" forever after success

**Hypothesis:**
Action succeeds server-side, but:
- (a) the form's `pending` flag never clears (missing reset of `useActionState`)
- (b) `revalidatePath` not called for the right path
- (c) optimistic UI doesn't reconcile with server response

**Pattern:** "sometimes refresh needed" suggests race condition — action sometimes finishes before `pending` flag is observed by React, sometimes after.

**Files to investigate:**
- `app/dashboard/actionState.ts`
- Borrow form (probably `app/ui/dashboard/checkOutForm.tsx`)
- Return form (`app/ui/dashboard/checkInForm.tsx`)
- `app/dashboard/actions.ts` — `revalidatePath` calls

**Status:** ✅ FIXED 2026-04-27

**Actual root cause:** `lib/sip2.ts` request() called `fetch()` with **no timeout**. When SIP2 emulator is slow / unreachable / unresponsive, fetch blocks for 30+ seconds (system TCP timeout), and the server action stays awaited that whole time. Forms use `useActionState`, so `pending` correctly reflects this — UI shows "Processing…" until the action finally returns. The reported "manual refresh sometimes works" pattern matches: user gets impatient, refreshes, page reloads from server with the actually-already-completed DB state.

The forms (`checkOutForm.tsx`, `checkInForm.tsx`) and `useActionState` hook are working **correctly** — the bug is server-side, in the SIP2 client.

**Fix:** Added `AbortController` with 5-second timeout (configurable via `SIP2_TIMEOUT_MS`) in `lib/sip2.ts`. Worst-case UI wait is now ~5s instead of 30s+. SIP2 timeouts already weren't fatal to the action (try/catch swallows them; "Supabase is source of truth"), so capping doesn't change correctness — only latency.

---

### 🟡 CSS / Theme

#### Student #1 — 404 page text is fully white / invisible

**Hypothesis:** Component uses hard-coded `text-white` instead of `text-foreground`, breaking on light theme. Or background is also white.

**Files to investigate:**
- `app/notFound.tsx` (project root)
- `app/dashboard/error.tsx`

#### Student #8 — Notifications "date / newest" filter has odd black border

**Status:** ✅ FIXED 2026-04-27 (after one wrong attempt)

**First attempt (wrong file):** Modified `app/ui/dashboard/notificationFilter.tsx` outer wrapper. User confirmed border was still there.

**Actual location:** `app/ui/dashboard/notificationList.tsx` lines 203-220 — the Date / Newest sort `<select>` elements. They had no `border-*` Tailwind class, so the `@tailwindcss/forms` plugin applied its default 1px gray border. On dark backgrounds (`dark:bg-swin-dark-surface`) the gray default looked black.

**Fix:** Added `border-0 focus:ring-0` to both selects so the forms-plugin defaults don't apply.

**Lesson:** The notifications page has TWO different filter components — the AdminShell-level `notificationFilter.tsx` (top of page, search/filter form) and the per-list `notificationList.tsx` (inside the inbox showing date/newest). The user-reported "right top corner" was inside the list, not the page header.

---

### 🟢 Search

#### Student #2 — Catalogue search needs fuzzy / partial matching
#### Student #5 — No keyword highlight or result count

**Hypothesis:** Current implementation is exact match or simple `includes()`. Need:
- Fuzzy: client-side Fuse.js OR Postgres `ILIKE '%term%'` / pg_trgm
- Highlight: wrap matched substrings in `<mark>`
- Count: simple `.length` of results

**Files to investigate:**
- `app/dashboard/book/items/` (catalogue page)
- `app/dashboard/book/list/`
- Search bar component (likely shared in `app/ui/`)

---

### 🟢 Catalogue navigation

#### Student #4 — Clicking book opens "add book info" page instead of borrow
#### Student #6 — Sometimes clicking book doesn't navigate at all

**Hypothesis:**
- #4: Click handler is wired to admin "edit book" route by mistake; OR all roles share same component but routing condition is missing
- #6: Race condition or missing onClick on certain card variants

**Files to investigate:**
- Book card component (likely `app/ui/` or `app/dashboard/book/` shared)
- Catalogue list page

---

### 🔵 Sidebar

#### Student #7 — Sidebar issues:
1. Not updated to v3.0.2 layout
2. Clicking "My Books" → "Reservation" also highlights (Reservation is a child of My Books, shouldn't be a separate top-level item)
3. Need explicit "Borrow" and "Return" entries

**Hypothesis:**
- Active state uses prefix-match (`startsWith`) where exact match is needed for parent items, OR Reservation is a separate item that overlaps with My Books path
- Borrow/Return missing from nav config

**Files to investigate:**
- `app/ui/` — sidebar / nav component (likely `app/ui/dashboard/sidenav.tsx` or similar)
- Nav config (whatever defines link list)

---

### 🟣 Profile avatar

#### Student #9 — Avatar fails to load

**Hypothesis options:**
- Avatar URL is from Azure AD / Microsoft Graph (`https://graph.microsoft.com/...`) and not whitelisted in `next.config.ts` `images.remotePatterns`
- Avatar URL is from Supabase storage with broken signed URL
- Avatar URL is null / empty and there's no fallback rendering

**Files to investigate:**
- `app/dashboard/profile/page.tsx`
- `app/profile/page.tsx`
- `next.config.ts` `images` config
- Profile UI component

---

### 🟢 Staff UX — preset notes (Staff #2)

**Request (not a bug):** Add quick-pick buttons for common condition notes (e.g., "Water damage", "Torn pages") so staff don't have to type every time.

**Files to investigate:**
- `app/ui/dashboard/damageReportModal.tsx`

---

## Out-of-scope (this branch)

- Admin #1 — `/dashboard/admin/overdue` doesn't exist (new feature)
- Admin #2 — "Full history" route under Recent Activity doesn't exist (new feature)
- Admin #3 — Add-book page doesn't exist (new feature)

These will be brainstormed + designed on a separate branch.

## Reference

### DB Enums (from `README.md`)
```sql
CREATE TYPE public.copy_status AS ENUM (
  'AVAILABLE','ON_LOAN','LOST','DAMAGED','PROCESSING','HOLD_SHELF'
);
```

### Damage severity values (from migration)
```sql
severity TEXT NOT NULL CHECK (severity IN ('damaged','lost','needs_inspection'))
```

### Code-level severity type
```ts
// app/lib/supabase/queries.ts:1161
export type DamageSeverity = 'damaged' | 'lost' | 'needs_inspection';
```
