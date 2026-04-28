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

---

## 2026-04-29 — Chat 8 — `dashboardShell` `useTheme`/`mounted` apparatus retired

**What was expected:** Plan Task 23 says "Replace only the className branch" but also notes "with `darkMode: 'class'`, the conditional becomes unnecessary… if not [needed elsewhere], this simplifies to a plain JSX block".

**What was found:** The `useTheme()` call, `isDark` derivation, `mounted` `useState`, and the `useEffect`-gated `if (!mounted) return null` apparatus existed solely to support the conditional className `isDark ? 'bg-swin-dark-bg …' : 'bg-slate-50 …'`. With the className now static (`bg-canvas text-ink dark:bg-dark-canvas dark:text-on-dark`), nothing in the file consumes `theme`. The mounted gate also stops being load-bearing — it only protected against the SSR/CSR mismatch on the *dynamic* className.

**Implication:** Dropped `useTheme`, `useEffect`, `useState`, `mounted`, and the `return null` gate per the plan's "simplifies to a plain JSX block" branch. `'use client'` retained (cheap, signals child components are interactive — no behavior change). One side effect: `dashboardShell` now renders during SSR, removing the brief blank flash that the gate previously caused. The system-wide "wrong-theme flash" exists at the html-class level (ThemeProvider applies `dark` class via post-hydration `useEffect`, no pre-hydration script) and is unchanged by this refactor — fixing it is out of scope for Batch 1 and would belong to a ThemeProvider-side cookie-read SSR path per Chat 1's earlier finding.

---

## 2026-04-29 — Chat 8 — `signOutButton` secondary CTA pattern baked as default; callers untouched

**What was expected:** Plan Task 25 lists `signOutButton.tsx` and provides a class recipe (`bg-surface-card border border-hairline text-ink rounded-btn px-4 h-10 …`) but does NOT include `sidenav.tsx` / `mobileMenu.tsx` (the actual callers).

**What was found:** Both callers pass a fully overriding `className` prop — `sidenav.tsx:228` (a 28×28 round icon-only variant in the user footer) and `mobileMenu.tsx:139` (a full-width drawer-footer button on a dark band). Their classNames carry the visual chrome; the button file itself had only `transition disabled:cursor-not-allowed` as intrinsic style. Applying the recipe wholesale would visually break both call sites. Migrating those callers' classNames is Batch 2/3 territory (they consume `swin-charcoal`, `swin-red`, etc. that aren't on the Batch 1 grep audit list).

**Implication:** Wrapped the recipe in a `DEFAULT_CLASS_NAME` constant and used `className ?? DEFAULT_CLASS_NAME` — the prop continues to win whenever passed (today, always). The new default kicks in only for callers that *omit* `className`, which is exactly the migration path Batch 2/3 will take when they drop their override. Non-breaking today, recipe is in place for tomorrow.

---

## 2026-04-29 — Chat 8 — `themeToggle` redesigned pill→icon-button; dead `context='sidebar'` prop removed

**What was expected:** Plan Task 25 recipe for `themeToggle`: `Container button: bg-surface-card border border-hairline rounded-full p-2 …`, `Icon color: text-ink dark:text-on-dark`, `Hover: hover:bg-surface-cream-strong …`, `Focus: standard primary focus ring`.

**What was found:** Existing component was a horizontal **sliding-knob pill toggle** showing both sun + moon icons with a position-based knob (`h-10 w-[5.5rem]` default; `h-8 w-16` for `sm`). It also accepted `context='sidebar'` for a full-width pill variant — but a `Grep` of the codebase showed only two callers (`mobileNav.tsx:139` `<ThemeToggle size="sm" />` and an unused import in `sidenav.tsx:28`), neither uses `context='sidebar'`. That branch is entirely dead code.

**Implication:** Rewrote to a single round icon button per the plan recipe — current-mode icon (sun in dark mode → click to go light; moon in light mode → click to go dark). Sizes: `h-10 w-10` default, `h-8 w-8` for `sm` (replaces the pill widths). Removed the `context` prop from the type and the `isSidebar` branch entirely (dead code clean-up; TS would have caught any consumer trying to pass it — none today). Hover, focus, and dark variants follow the recipe verbatim. This is a visible UX change beyond pure token swap; flagged here so visual review can validate the new chrome works in the mobile-nav tray. The Newsreader+cream aesthetic favours quieter chrome over the previous animated pill, which fits §6.4 (no shadows, surface hierarchy carries differentiation).

---

## 2026-04-29 — Chat 8 — bell notification dot in `adminShell` / `dashboardTitleBar` is `bg-primary`, not `bg-swin-red-brand`

**What was expected:** Plan Task 24 reminds: "Logo / Swinburne brand mark — ensure any usage uses `text-swin-red-brand`, NOT `text-primary`. This is the brand-bearing position per spec Q3."

**What was found:** Neither file references the Swinburne logo — the only red element is the absolute-positioned 6×6 bell-icon dot (`bg-swin-red ring-2 ring-white dark:ring-swin-dark-bg`). It's an alert indicator (means "you have unread notifications"), not a brand mark. Same precedent applies as Chat 6's `HoldCardReady` decision: alert reds use `bg-primary`, brand reds keep `bg-swin-red-brand`.

**Implication:** Migrated to `bg-primary ring-2 ring-canvas dark:ring-dark-canvas`. Genuine brand-mark usage (logo, login splash) is in `acmeLogo.tsx` and login surfaces, both Batch 2 territory — they'll be checked then. Plan note re-read as a *reminder* applicable when relevant, not a requirement that these files contain a logo today (they don't).
