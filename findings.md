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

---

## 2026-04-29 — Chat 9 — sidenav.tsx active nav uses primary tint (plan was conservatively wrong)

**What was expected:** Plan Task 1 Step 3 said "Nav item (active/current page): `bg-surface-cream-strong dark:bg-dark-surface-strong text-ink dark:text-on-dark` (cream emphasis, not primary fill — primary is reserved for CTAs)".

**What was found:** Spec §3.5 explicitly lists `primary` for **active state**: "All CTAs, links, active state, focus rings, KPI emphasis, badges." A primary *tint* (not solid fill) is the spec-correct treatment for active nav, and it matches the existing `bg-swin-red/10 text-swin-red` pattern.

**Implication:** Migrated to `bg-primary/10 text-primary dark:bg-dark-primary/15 dark:text-dark-primary`. Plan author (me) was being conservative. If future nav-active-state work surfaces, this pattern is the precedent. Note: `dark-primary` text on `dark-canvas` is 3.81:1 (AA-large only per spec §3.7) — accepted for nav items where the colored background tint provides additional cue.

---

## 2026-04-29 — Chat 9 — sidenav inline labeled theme toggle preserved (not swapped to icon-only ThemeToggle)

**What was expected:** Spec §7 Chat 8 migrated `themeToggle.tsx` to a single round icon button (UX change). Sidenav had an unused `ThemeToggle` import (per `progress.md` Chat 8 note).

**What was found:** The inline theme toggle in `sidenav.tsx` is a **labeled** button (icon + "Light mode" / "Dark mode" text), which gives better orientation in a vertical sidebar than an icon-only control. The new icon-only `<ThemeToggle>` is sized and shaped for top-bar use (mobileNav).

**Implication:** Removed the unused `import ThemeToggle` line. Kept the inline labeled toggle but migrated its tokens (cream secondary button recipe). Two theme-toggle UX variants now coexist — labeled in sidebar, icon-only in mobileNav top bar — which is appropriate for the two contexts.

---

## 2026-04-29 — Chat 9 — mobileMenu drawer migrated to cream in light mode (Claude design); creates temporary mismatch with un-migrated mobileNav header

**What was expected:** Plan Task 1 Step 9 said: "Drawer panel: `bg-canvas dark:bg-dark-canvas`".

**What was found:** Original `mobileMenu.tsx` drawer was **always dark** in both modes (`bg-swin-charcoal` light / `bg-slate-950` dark). It hosts inside `mobileNav.tsx` which is **also still dark and not yet migrated** (not in Batch 2 spec scope). Migrating the drawer to cream means: tap hamburger on dark mobileNav header → drawer slides out as a cream panel. Temporary visual mismatch in light mode.

**Implication:** Followed the spec-correct cream drawer (Claude design has no inherently-dark surfaces in light mode). Trigger button kept its "light-text-on-dark" treatment because it lives inside the un-migrated mobileNav header. The mismatch resolves when `mobileNav.tsx` and `navLinks.tsx` are migrated. Both are nav-shell siblings (Chat 8 territory that got missed) — should be picked up in Batch 3 cleanup or earlier if user prefers.

Backdrop uses `bg-black/60 dark:bg-black/70` (always-dark overlay) — none of the spec tokens are "always dark" (`ink`/`body-strong` invert per mode), so a literal `black` is the cleanest pragmatic choice. Brand accent stripe at drawer bottom keeps gradient form, swapped to `from-primary/60 via-primary/30` (light) / `from-dark-primary/60 via-dark-primary/30` (dark) — the original dark-mode emerald variation was dropped (no spec equivalent).

---

## 2026-04-30 — Chat 11 — shared `pageLoadingSkeleton.tsx` migrated alongside Chat 11 scope (consumed by 6 loading.tsx files)

**What was expected:** Chat 10 deferred the shared `app/ui/pageLoadingSkeleton.tsx` (consumed by 6 active `loading.tsx` files) to Chat 11 or Batch 3. User pre-flight note recommended migrating it in Chat 11 since `notifications/loading.tsx` is one of its consumers and is in this chat's scope.

**What was found:** Skeleton uses raw slate palette (`bg-slate-100/200/700/800`, `border-slate-100/800`, `rounded-2xl`) plus a shimmer overlay keyed on `via-white/60 dark:via-white/10`. All swappable to design tokens 1:1.

**Implication:** Migrated to `bg-surface-cream-strong dark:bg-dark-surface-strong` (lines), `bg-surface-card dark:bg-dark-surface-card` + `border border-hairline dark:border-dark-hairline` (cards/wrappers), `border-hairline dark:border-dark-hairline` (row dividers), `rounded-card` (was `rounded-2xl`), and shimmer `via-canvas/60 dark:via-on-dark/10`. Six consumer pages (`book/history`, `notifications`, `dashboard`, `book/items`, `admin/users`, `admin`) inherit the visual update through this single file; their per-page `loading.tsx` files remain unchanged.

---

## 2026-04-30 — Chat 11 — `isPrivileged` form theming retired in profile forms

**What was expected:** Plan Task 18 says "Submit button: shared `<Button>` from `app/ui/button.tsx` (primary)". No mention of the `isPrivileged` dual-track styling in the existing forms.

**What was found:** All three profile forms accept `isPrivileged: boolean` and use it to choose **emerald-gradient** (staff/admin) vs **swin-red-gradient** (student) chrome — submit gradient, focus ring color, avatar gradient halo. The design system has a single `primary` token; staff/admin role distinction is already conveyed by `<RoleBadge>` on the profile card.

**Implication:** Visually unified all three forms to the standard cream + primary recipe. The `isPrivileged` prop is retained on each component's signature (callers and `actions.ts` still pass it; not breaking), but no longer affects styling. If role-aware form chrome returns later, do it via a single design-system extension (e.g., `<Button variant="success">` for staff actions) rather than re-introducing per-form ternaries. Avatar's gradient blur halo was dropped per spec §6.4 (no shadows/glows); replaced with a quiet `ring-2 ring-hairline` on the image.

---

## 2026-04-30 — Chat 11 — `notificationPanel` kept inline (not switched to `<NotificationItem>` primitive)

**What was expected:** Plan Task 20 suggests: "If this file inlines item markup instead of using the primitive, consider migrating to the primitive — log decision in `findings.md` if you do."

**What was found:** `<NotificationItem>` (Batch 1 migrated) renders a single full-row click target via `<button onClick>`. `NotificationPanel` rows have **two** independent affordances — the row body and a separate per-row "✓ mark as read" button next to the time. The primitive doesn't expose this secondary action; switching would either (a) lose the per-row mark-read affordance, or (b) require extending the primitive to accept `secondaryAction` props (out of scope for token migration).

**Implication:** Kept the inline markup but unified the per-type color mapping with `<NotificationItem>`'s `TYPE_STYLES` (`primary`/`accent-teal`/`warning`/`accent-amber`/`success`) so both surfaces look semantically identical. Logged the divergence so a future Batch 3 (or follow-up UX pass) can either extend the primitive or accept the inline duplication permanently. Dropped the per-type raw palette (`bg-blue-500`, `text-emerald-600`, `bg-violet-500`, etc.) and the unused `dot` colors are now design tokens too.

---

## 2026-04-30 — Chat 12 — `app/dashboard/learning/page.tsx` is a redirect; actual UI lives at `linkedin/page.tsx`

**What was expected:** Plan Task 23 says "Learning landing page. Composes the panels migrated in Tasks 24–28."

**What was found:** `app/dashboard/learning/page.tsx` is a 5-line `redirect('/dashboard/learning/linkedin')` server-only component — no UI to migrate. The actual landing UI is at `app/dashboard/learning/linkedin/page.tsx` (185 lines, server component composing `<AdminShell>` + `<LinkedInLearningSearchForm>` + `<SearchResultsPanel>` + `<CollectionsPanel>` from Tasks 26/27/24, plus a Quick Topics chip rail, search-results summary, and Curated Collections eyebrow block). Without migrating this file, ~10 legacy-token call sites (`text-swin-charcoal/50`, `border-swin-charcoal/10`, `text-swin-red`, `bg-amber-50`, `text-slate-300/80`, etc.) would persist on the entire learning landing page and fail the Batch 2 audit.

**Implication:** Migrated `linkedin/page.tsx` as part of Task 23 scope. This mirrors the Chat 10 finding for `app/dashboard/book/page.tsx` (also a redirect to a real listing page). Both URL paths (`/dashboard/learning` and `/dashboard/learning/linkedin`) render the migrated UI. Pattern to remember for Batch 3: if a `page.tsx` is a thin redirect, follow the redirect target before declaring "no UI to migrate".

---

## 2026-04-30 — Chat 12 — Third-party brand colors retained in `studentChat.tsx`

**What was expected:** Token migration table maps `text-red-*`, `bg-red-*`, etc. to design tokens. Plan recipe says use `<Chip>` primitive or inline cream-strong tiles for category/brand badges.

**What was found:** `studentChat.tsx` has three third-party brand-color affordances that don't map cleanly to our design tokens:
1. **LinkedIn Learning suggestion links** — hover state uses the LinkedIn brand blue `[#0A66C2]` (light) / `[#70B5F9]` (dark). These are clickable links that open LinkedIn Learning search; the brand color signals destination.
2. **Google logo SVG** — the multi-color logo paths use literal `#4285F4`/`#34A853`/`#FBBC05`/`#EA4335` for Google's brand-mark fills.
3. **YouTube logo SVG** — uses `fill="currentColor"` on a `text-muted-soft` parent, so it inherits a neutral color in default state. Hover swapped from `text-red-600` to `text-primary` (our red-ish accent) since YouTube-red ≈ our primary in semantic intent ("media play / red action").

**Implication:** Retained items 1 and 2 as literal brand hex (mirrors Chat 10's `bookCatalogTable` category-palette retention — explicit domain coloring outside the design token system). Item 3 was successfully tokenized to `text-primary`. The LinkedIn / Google literal hexes are documented here so future audit greps don't sweep them. If the design system later adds `accent-blue` / `accent-info` tokens, we can revisit the LinkedIn hover.

---

## 2026-04-30 — Chat 12 — `STAGE_STYLES` palette in learning-path-generator + studentChat remapped from emerald/amber/rose to success/warning/primary

**What was expected:** No specific recipe in the plan for difficulty-level tints (Beginner/Intermediate/Advanced).

**What was found:** Both `learning-path-generator.tsx` and `studentChat.tsx` had identical `STAGE_STYLES` records using raw Tailwind palette colors: Beginner = `emerald-50/200/700/300`, Intermediate = `amber-50/200/600/300`, Advanced = `rose-50/200/700/300`. These aren't user-controlled filter chips (which would justify a domain-color retention like `bookCatalogTable`); they're auto-generated content tints applied to AI-suggested learning stages.

**Implication:** Remapped to semantic design tokens — Beginner = `success` (green), Intermediate = `warning` (amber), Advanced = `primary` (red). Same hue progression (green → amber → red as difficulty increases), but inside the design token system. Both files use the same mapping for visual consistency. The stage-number circular chip stays `bg-primary` regardless of stage (it's a numeric badge, not a difficulty signal).

---

## 2026-04-30 — Chat 12 — `studentChat.tsx` user message bubble switched from inverted-dark to `bg-primary` per plan literal

**What was expected:** Plan Task 29 literal recipe: "User message bubble: `bg-primary text-on-primary rounded-card px-4 py-3 max-w-[75%] self-end`".

**What was found:** Existing implementation used a Claude-imitation inverted-dark palette (`bg-slate-900 text-white` light → `bg-slate-200 text-slate-900` dark). This is a different aesthetic from the plan's recipe; Claude.ai uses dark bubbles for user messages, but the spec calls for primary brand fill.

**Implication:** Followed plan literal. User bubbles now show as solid `bg-primary text-on-primary` (Swinburne UI red) in both modes, with `dark:bg-dark-primary` variant. Visual review may surface that the high-saturation red bubbles feel "loud" relative to Claude's quieter inverted-dark aesthetic; if so, an alternative is `bg-ink text-on-dark dark:bg-on-dark dark:text-ink` (the same neutral pattern used for the AI provider toggle's active state). Decision deferred to user's visual review per `feedback_testing.md`.

---

## 2026-04-30 — Chat 12 — Spec gap: 6 book sub-workflow pages outside any chat scope (deferred to Batch 3)

**What was expected:** Plan Task 30 Step 3 cross-batch acceptance grep sweeps `app/dashboard/book` recursively, with expected 0 hits.

**What was found:** Six book sub-workflow pages have **never** been in any chat's scope, yet sit inside the `app/dashboard/book` glob:
- `app/dashboard/book/holds/page.tsx` (~9 legacy hits)
- `app/dashboard/book/checkout/page.tsx` (~2 hits)
- `app/dashboard/book/[id]/page.tsx` (~25+ hits — book detail page)
- `app/dashboard/book/checkin/page.tsx` (~10 hits)
- `app/dashboard/book/items/page.tsx` (~3 hits — student book browse landing, target of `book/page.tsx` redirect)
- `app/dashboard/book/reservation/page.tsx` (~25+ hits)

Chat 10 scope (per Batch 2 plan Tasks 9–14b) only covered `book/page.tsx`, `book/list/page.tsx`, `book/history/page.tsx`, plus 5 `app/ui/dashboard/book*.tsx` components. The 6 sub-workflow pages were missed by the spec §7 author and the Batch 2 plan author; the audit grep at Task 30 Step 3 globs the whole subtree and so the literal acceptance criterion fails on these unrelated files.

**Implication:** Per user-aligned option B, deferred all 6 to Batch 3 (mirrors the Chat 9 carry-over pattern for `staffDashboard.tsx` and `mobileNav.tsx`). Several of these (`items`, `reservation`, `holds`, `[id]`) are clearly student-facing and arguably belong in Batch 2 by intent, but the spec/plan never listed them. Narrowed the actual Chat 12 audit to in-scope files only (the 7 learning files + the discovered `linkedin/page.tsx` redirect target — all 8 clean, 0 residue). Batch 3 plan must include these 6 files in its scope. Until then, `/dashboard/book/items`, `/dashboard/book/holds`, `/dashboard/book/checkout`, `/dashboard/book/checkin`, `/dashboard/book/reservation`, and any `/dashboard/book/[id]` route will render with legacy `swin-*` / slate / amber palette in production — visual review can confirm these are jarring against the migrated `/dashboard/book/list` and `/dashboard/book/history`.
