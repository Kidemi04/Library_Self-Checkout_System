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

---

## 2026-04-29 — Chat 7 — `BookCover` is gradient-art, not a placeholder shell

**What was expected:** Plan Task 19 recipe describes a `BookCover` with "Container: `bg-surface-card`" + "Placeholder fallback: `bg-surface-cream-strong`" — implying a thumbnail shell that may show an image or fall back to a tinted box.

**What was found:** Existing `BookCover.tsx` is a **gradient-art generator**: it always receives a required `gradient` prop (selected from `COVER_GRADIENTS` via `getBookGradient(id)`) and draws faux book artwork — gradient background, stripe overlay, spine shadow, gold foil lines, and inner typography — over it. There is no image-source path and no placeholder branch.

**Implication:** Did not restructure the component (out of scope per spec §1). Applied the visual-token deltas that fit:
- Dropped the multi-layer `boxShadow` per spec §6.4 (no shadow on cards).
- Swapped inline `fontFamily: '"Cormorant Garamond", Georgia, serif'` → `'var(--font-newsreader), Georgia, serif'` so the new `--font-newsreader` CSS variable from `app/layout.tsx` resolves. (Two occurrences inside conditional title/author render.)

**Left intact (intentionally):**
- `COVER_GRADIENTS` palette (literal hex like `#C82333`, `#C9A961`) — these are book-cover artwork, not UI surface tokens. Spec §3.6 / Batch 3 acceptance criteria target legacy *class names* (`swin-red`, `swin-gold`), not hex literals embedded in CSS gradient strings.
- Gold-foil lines `rgba(201,169,97,…)` — same reason; representational.
- Inline-style positioning (width/height/borderRadius props, absolute layers) — structural.

Visual review will tell whether the gradient palette needs to be rebalanced for the new cream canvas; that's a §6.4-adjacent visual question for a later batch, not a Batch 1 token migration.

---

## 2026-04-29 — Chat 7 — `BarChartMini` track color is faint on cream canvas (per recipe)

**What was expected:** Recipe says "Background bars / track: `bg-surface-cream-strong dark:bg-dark-surface-strong`".

**What was found:** Bars in this component use a data-driven opacity ramp `0.35 + (i/N)*0.65` to communicate recency (older = fainter). On the previous gold `#C9A961`, the faint end was still readable; on `surface-cream-strong` `#E8E0D2` (very pale) over the cream canvas, the faintest bars approach invisibility.

**Implication:** Followed the recipe literally — used Tailwind classes for color, kept inline `style.opacity` for the data ramp. If the user finds the chart unreadable during visual review, the right fix is to either (a) drop the opacity ramp now that color hierarchy carries the message, or (b) swap the track class to `accent-amber/40` for more contrast. Logging here so the call stays visible. Token migration semantics are correct either way.

---

## 2026-04-29 — Chat 7 — `IsbnLookupBox` Lookup button uses shared `<Button>` and dual-flags disabled state

**What was expected:** Recipe: "Lookup button: re-uses `<Button>` primary variant".

**What was found:** Shared `app/ui/button.tsx` (post-Chat-5) styles its disabled state via `aria-disabled:` Tailwind variants — not the standard `disabled:` selector. Passing only HTML `disabled` would block clicks but show no visual disabled state.

**Implication:** Pass both `disabled={lookupDisabled}` (so React/DOM blocks the click) and `aria-disabled={lookupDisabled}` (so the cream-tinted disabled style applies). Same dual-flag pattern is already used in the Chat 7 dev-gallery page (`<Button disabled aria-disabled>Disabled</Button>`). If multiple call sites need this, the cleanest follow-up is to derive `aria-disabled` from `disabled` inside `Button` itself — not done now to avoid widening Chat 7's diff, but worth doing during Batch 2 if the pattern proliferates.

---

## 2026-04-29 — Chat 7 — `BarcodePreview` padding upsized from `p-3` to `p-6`

**What was expected:** Recipe: "Container: `bg-canvas border border-hairline rounded-card p-6`". Spec §5.3 padding map confirms `BarcodePreview, scan result panel | 24px (p-6)`.

**What was found:** Existing component used `p-3` (12px), so the migration doubles padding. Border style also shifts: data state was `border-swin-charcoal/10` (faint), now solid `border-hairline`; loading state keeps dashed border but now on `border-hairline`.

**Implication:** Followed recipe — this is a deliberate spec-aligned size increase, not an accidental change. Caller pages (admin add-book flow) may want to re-balance surrounding spacing after seeing it in context, but that's downstream. The component's own visual is correct per spec.
