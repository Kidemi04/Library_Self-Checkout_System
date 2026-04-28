# Findings — Unexpected Discoveries During Execution

> Log non-obvious observations made while executing the plan. These help future chats and may inform Batch 2/3 plans.

Format:
```
## YYYY-MM-DD — Chat N — short title

What was expected: ...
What was found: ...
Implication: ...
```

---

## 2026-04-29 — Chat 1 — Additional primitives discovered beyond spec

**What was expected:** Spec §7 listed 11 primitives in `app/ui/dashboard/primitives/`.

**What was found:** Glob returned 18 primitives — additional 7 not in spec: `BarcodePreview`, `BookCover`, `DueDatePicker`, `IsbnLookupBox`, `NotificationItem`, `ReminderButton`, `RoleBadge`, `TransactionReceipt`, `UserAvatar`.

**Implication:** Plan tasks were extended to cover all 18. No spec change needed — spec was directional, not exhaustive.

---

## 2026-04-29 — Chat 1 — ThemeProvider is custom, not `next-themes`

**What was expected:** Spec §8.1 risk mitigation referenced `next-themes` `disableTransitionOnChange`.

**What was found:** Project uses a custom `ThemeProvider` at `app/ui/theme/themeProvider.tsx`. It already toggles `dark`/`light` classes on `<html>` with localStorage + cookie persistence.

**Implication:** Tailwind `dark:` prefix works as-is against this custom provider. **Do not introduce `next-themes`** during migration. If hydration flash becomes a problem, fix within the existing provider's SSR cookie-read path rather than swapping libraries.

---

## 2026-04-29 — Chat 2 — No ESLint setup in this project

**What was expected:** Plan's per-chat quality gate calls `pnpm lint && pnpm tsc --noEmit`.

**What was found:** `package.json` has scripts `build`/`dev`/`start`/`test`/`test:watch` only — no `lint` script, no `.eslintrc*` / `eslint.config.*` file, and no ESLint packages in `devDependencies`.

**Implication:** Per-task quality gate for Batch 1 onwards uses `pnpm tsc --noEmit` only. Do not chase a missing lint setup — the plan's lint expectation was aspirational. If lint discipline is desired later, it's a separate task (add ESLint + Next.js config + script). Future chats: don't run `pnpm lint`; run typecheck.

---

## 2026-04-29 — Chat 5 — `rounded-pill` referenced by plan/spec but not added in Task 3

**What was expected:** Plan Task 3's `borderRadius` block adds `btn/card/hero` only. Spec §5.1 lists `rounded-pill (existing)` at 9999px as if Tailwind exposed it natively.

**What was found:** Tailwind's stock 9999px utility is `rounded-full` — there is no `rounded-pill` by default. Plan target states for Task 8 (Chip), Task 9 (StatusBadge), and Task 10 (FilterPills) use `rounded-pill` literally, so the class would resolve to nothing without a token addition.

**Implication:** Added `pill: '9999px'` to the borderRadius extension in `tailwind.config.ts` during Chat 5 to make plan output work as written and to honor spec §5.1's intent. This is a one-line consistency fix, not a design deviation — `rounded-pill` is semantically clearer than `rounded-full` for badge/chip shapes (full implies circle), so keeping both utilities is the better long-term ergonomics. The new token piggy-backed onto the Chat 5 commit alongside the primitives that consume it.
