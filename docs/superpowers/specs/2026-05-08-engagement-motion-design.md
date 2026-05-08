# Engagement Motion Design

**Date:** 2026-05-08
**Branch:** `Kelvin-v3.3.1-Animation`
**Status:** Spec — pending implementation plan

## Summary

Build a system-wide motion vocabulary so every action across the Library Self-Checkout System speaks the same animation language. The goal is Pavlovian consistency: identical motion signals (a stamp landing, an ink line writing, a button rebounding) become reliable reward cues that students learn to expect and engage with daily. The dominant register is **D · tactile/editorial** (paper, ink, stamps) for everyday flows; **B · celebratory** (confetti, oversized check) is reserved for rare milestones.

## Goals

- Every interactive moment in the student-facing app gives non-linear motion feedback
- One central motion-token layer + one set of semantic primitives — no inline animation code in pages
- Circulation flows (borrow / return / renew / hold / damage report) feel ceremonial without being slow
- Milestones derived from existing data — **no schema changes** in this iteration
- Full WCAG 2.1 AA compliance: `prefers-reduced-motion`, focus management, ARIA live regions, color contrast, anti-seizure pacing

## Non-goals

- Streak engine (`streak_7`, `streak_30`) — requires `current_streak_days` migration; deferred to a follow-up
- Scroll-triggered storytelling animations
- Visual regression testing infrastructure (Chromatic / Percy)
- Admin / staff routes get only the system-wide button feedback — no surface-specific celebrations
- Refactoring `app/ui/magicUi/*` beyond `shimmerButton` (other primitives stay as-is)

## Architecture

### Two layers, strict dependency direction

```
Pages / server components / forms
              │
              ▼
        app/ui/motion/*       ← semantic primitives
              │
              ▼
        app/lib/motion/*      ← tokens (numbers only)
              │
              ▼
        framer-motion (Motion v12 — already installed)
```

**Inviolable rules:**

1. Pages must not import `framer-motion` directly — only consume `app/ui/motion/*`
2. Components in `app/ui/motion/*` must not contain magic numbers — every duration, easing, distance, spring config comes from `app/lib/motion/tokens.ts`
3. Colors come from Tailwind tokens (`tailwind.config.ts`) — no hex literals anywhere in motion code
4. `linear` easing is banned across the system (ESLint rule); all motion must be non-linear (bezier or spring)

### File layout

```
app/lib/motion/
├── tokens.ts            # duration / ease / spring / tap / hover / distance / stagger
├── presets.ts           # named animation recipes built from tokens
└── reduced-motion.ts    # usePrefersReducedMotion hook

app/ui/motion/
├── MotionButton.tsx     # universal button feedback baseline
├── StampReveal.tsx      # 5 kinds: borrowed, returned, renewed, reserved, reported
├── InkLine.tsx          # SVG path that writes itself via stroke-dashoffset
├── PaperEnter.tsx       # paper-style entrance wrapper (fade + rise + paper spring)
├── MilestoneBurst.tsx   # B-tier celebration overlay (confetti + check + serif headline)
├── StreakFlame.tsx      # flame icon with idle wiggle + scale-in on increment
├── XPCounter.tsx        # number ticker (requestAnimationFrame, ease-out cubic)
├── BookCardLift.tsx     # book card hover (lift + shadow expansion)
└── index.ts             # barrel
```

## Motion Tokens (`app/lib/motion/tokens.ts`)

### Duration (seconds — Motion's native unit)

| Token | Value | Use |
|---|---|---|
| `instant` | 0.1 | click feedback, button press |
| `quick` | 0.2 | hover, focus, micro-interaction |
| `base` | 0.35 | standard transitions (modal, tab) |
| `paper` | 0.5 | paper-style entrance (D's signature pace) |
| `slow` | 0.8 | milestone setup |
| `dramatic` | 1.2 | full B-celebration sequence total length |

### Easing (cubic-bezier)

| Token | Value | Use |
|---|---|---|
| `out` | `[0.4, 0, 0.2, 1]` | default entrance (Material-style) |
| `inOut` | `[0.4, 0, 0.6, 1]` | in-place state change |
| `inkWrite` | `[0.7, 0, 0.3, 1]` | pen-stroke S-curve |

### Spring (physics)

| Token | stiffness | damping | Feel |
|---|---|---|---|
| `paper` | 220 | 24 | soft entrance, no overshoot |
| `stamp` | 280 | 18 | landing with slight overshoot |
| `milestone` | 350 | 12 | bouncy — only for B celebrations |

### Tap & Hover

```ts
export const motionTap = { scale: 0.96, duration: 0.12 };
export const motionHover = {
  lift: 2,         // px — buttons
  cardLift: 4,     // px — book cards
  duration: 0.18,
};
```

### Distance & Stagger

```ts
export const motionDistance = {
  paperRise: 8,    // px — paper entrance
  popUp: 12,       // px — XP counter pop
};

export const motionStagger = {
  list: 0.04,      // 40ms — notifications, my-books
  cards: 0.08,     // 80ms — recommendations grid
};
```

## Atomic Components

### `<MotionButton>` — every button's feedback baseline

```tsx
<MotionButton
  variant="primary" | "secondary" | "icon" | "destructive"
  state="idle" | "pending" | "success" | "error"
  onClick={...}
>
  Borrow
</MotionButton>
```

| Variant | Tap | Hover | Pending | Success |
|---|---|---|---|---|
| `primary` | `scale 0.96` (spring `stamp`) | `lift 2px` + shadow deepens | inner ink line sweeps left-to-right | flashes ✓ briefly, returns to idle |
| `secondary` | `scale 0.97` | text color deepens | same but more restrained | text color flashes success briefly |
| `icon` | `scale 0.92` (smaller buttons need heavier press) | circular background fades in | rotating spinner with spring start/stop | icon morph |
| `destructive` | `scale 0.96` | color deepens to dark error | inner ink line | **no celebration** — returns to idle silently |

**Focus ring:** every button has `:focus-visible` with `border-primary` and `quick` (0.2s) fade-in. Browser default focus removed. Required for WCAG 2.1.1.

### `<StampReveal>` — circulation milestone marker

```tsx
<StampReveal kind="borrowed" | "returned" | "renewed" | "reserved" | "reported" />
```

All 5 share one motion: `scale [2 → 1.15 → 1]` + `rotate [22° → 8°]` + `opacity [0 → 0.95]` over `paper` (0.5s) using spring `stamp`. Identical motion is deliberate — Pavlov's bell rings the same every time.

| Kind | Tailwind classes | Icon | Text |
|---|---|---|---|
| `borrowed` | `text-primary border-primary` solid | ✓ | BORROWED |
| `returned` | `text-success border-success` solid | ✓ | RETURNED |
| `renewed` | `text-accent-amber border-accent-amber` solid | ↻ | RENEWED |
| `reserved` | `text-accent-teal border-accent-teal` solid | 🔖 | RESERVED |
| `reported` | `text-error border-error` **outline only (hollow)** | ⚠ | REPORTED |

**Color disambiguation notes:**
- `success` and `accent-teal` resolve to the same hex (`#8FAF87`) — disambiguated by icon (✓ vs 🔖) and temporal context (returned at checkin time, reserved at hold time)
- `primary` and `error` resolve to the same hex (`#C62828`) — disambiguated by `borrowed` being solid-filled vs `reported` being outline-only

### Other primitives — interface signatures

```tsx
<InkLine d="M2,7 Q40,2 80,7 T160,7" duration="paper" />
<PaperEnter delay={0}>{children}</PaperEnter>
<MilestoneBurst trigger={state.milestone !== undefined} milestone={state.milestone} />
<StreakFlame days={7} />        // days increment triggers scale 0 → 1 spring 'milestone'
<XPCounter from={0} to={10} />  // requestAnimationFrame, ease-out cubic, 700ms
<BookCardLift>{cardContent}</BookCardLift>
```

## Surface Map (all tiers — single PR)

### Tier 1 · Core Pavlov triggers

| Surface | Components | Trigger |
|---|---|---|
| `app/ui/dashboard/checkOutForm.tsx` success | `StampReveal kind="borrowed"` + `PaperEnter` for receipt | checkout success |
| `app/ui/dashboard/checkInForm.tsx` success | `StampReveal kind="returned"` | checkin success |
| `app/dashboard/book/page.tsx` renew CTA | `StampReveal kind="renewed"` | renewal success |
| Damage report submission | `StampReveal kind="reported"` | damage report created |
| `app/dashboard/book/page.tsx` hold CTA | `StampReveal kind="reserved"` | hold placed |
| `app/dashboard/cameraScan/*` | `InkLine` swept across barcode + `StampReveal` | barcode recognized |
| `app/dashboard/my-books/page.tsx` | Motion `<Reorder>` + `PaperEnter` for new entries | loan status change |

### Tier 2 · Engagement loops

| Surface | Components |
|---|---|
| `app/dashboard/notifications/page.tsx` | `PaperEnter` with `motionStagger.list` |
| `app/dashboard/recommendations/page.tsx` | `BookCardLift` + cards stagger entrance (`motionStagger.cards`) |
| `app/dashboard/profile/page.tsx` | `XPCounter` for total borrowed; `StreakFlame` only renders if streak data ever lands (currently hidden — see Non-goals) |
| `app/dashboard/learning/*` | refactor existing `motion.X` calls to consume new tokens |
| Milestone integration | `MilestoneBurst` mounted at root layout, listens for `state.milestone` from server actions |

### Tier 3 · System-wide infrastructure (touches every page)

| Change | Scope |
|---|---|
| Replace all buttons with `<MotionButton>` | ~30+ files across app |
| `app/ui/magicUi/shimmerButton.tsx` internally wraps `<MotionButton variant="primary">` and adds shimmer decoration | 1 file |
| `app/ui/dashboard/sidenav.tsx` active-link transition | 1 file |
| Modal / dialog consistent entrance via `<PaperEnter>` or framer `<AnimatePresence>` | shared modal components |
| Global toast: card-style entrance from bottom-right with `paper` spring | toast system |
| `usePrefersReducedMotion` wired into every primitive | infrastructure |
| ESLint rules: ban `linear` easing, ban animating non-compositor properties | tooling |

### Tier 4 · Restraint zones

| Surface | Treatment |
|---|---|
| `app/dashboard/admin/*` | inherits `<MotionButton>` only — no surface-level animation |
| `app/dashboard/staff/*` | same — efficiency over delight |
| `app/dashboard/faq` / `app/dashboard/help` | accordions use framer `<AnimatePresence>`, no decoration |

## Milestones (no DB schema changes)

The 4 milestones below are derivable purely from existing tables (`Loans`, `OverdueLoan` view) and are naturally idempotent — no `milestones_fired` column required.

| Kind | Trigger | Repeat protection |
|---|---|---|
| `first_borrow` | After borrow: `count(Loans where user_id = X) == 1` | Count never returns to 1 → fires exactly once |
| `first_on_time_return` | Before this return: `count(on-time returns) == 0`; current return is on time | Count never returns to 0 → fires exactly once |
| `books_milestone_5` / `_10` / `_25` / `_50` | Before borrow: `count < N`; after: `count == N` | Crossing threshold is one-time |
| `all_overdues_cleared` | Before action: had overdue; after: no overdue | Acceptable to re-fire if user re-incurs and clears again — celebrating each clear is intended |

### Server-action contract

```ts
// app/dashboard/actionState.ts (extended)
type ActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  milestone?: {
    kind: 'first_borrow' | 'first_on_time_return' | 'books_milestone_5'
        | 'books_milestone_10' | 'books_milestone_25' | 'books_milestone_50'
        | 'all_overdues_cleared';
    display: string;  // serif headline shown in MilestoneBurst overlay
  };
};
```

Each action in `app/dashboard/actions.ts` runs `detectMilestone(userId, actionType)` after the Supabase mutation. The function is a pure function over query results — easily testable, no side effects beyond reads.

`MilestoneBurst` palette is sourced from a single typed export in `app/lib/motion/tokens.ts`:

```ts
// re-exports the four hex values from tailwind.config.ts so the runtime
// (canvas-confetti needs real strings) and the design system stay in sync
export const milestoneColors = ['primary', 'accent-teal', 'accent-amber', 'success'] as const;
// resolveColorToken(name) reads the resolved hex from tailwind config at build time
```

Motion components never embed hex literals; if Tailwind tokens change, this single export updates and confetti follows automatically.

## Accessibility

| Concern | Implementation |
|---|---|
| `prefers-reduced-motion` | `usePrefersReducedMotion` hook in every primitive. When true: opacity-only transitions, duration `instant` (0.1s), springs replaced by linear 0.1s, MilestoneBurst replaces confetti with static check + headline |
| Keyboard focus | Every `<MotionButton>` has visible `:focus-visible` ring (`border-primary`, `quick` fade-in). Browser-default ring suppressed but custom replacement always present |
| Screen readers | StampReveal / InkLine / PaperEnter are decorative → `aria-hidden="true"`; MilestoneBurst uses `role="status" aria-live="polite"` to announce e.g. "First borrow milestone reached" |
| Anti-seizure (WCAG 2.3.1) | Confetti single burst ≤ 70 particles; no flashing > 3 Hz; verified across all five `MotionButton` states |
| Dismissibility | MilestoneBurst overlay closes on (a) overlay click, (b) ESC key, (c) auto 1.2s timeout — any one of three suffices |
| Contrast (WCAG 1.4.3) | All stamp text ≥ 4.5:1 against canvas. `text-accent-teal` on `bg-canvas` measures 3.2:1 → switches to `text-on-primary` reverse pattern when used as filled stamp |

## Performance

| Rule | Enforcement |
|---|---|
| Animate only `transform` and `opacity` | ESLint custom rule: ban `width/height/top/left/margin/padding` in framer-motion `animate` props |
| No `linear` easing | ESLint rule: ban `transition-timing-function: linear` and `ease: 'linear'` |
| List staggers run only for in-viewport items | `IntersectionObserver` gating in `PaperEnter` and `BookCardLift` when used with stagger |
| `will-change` discipline | Applied only during animation runtime, removed after; never globally |
| Confetti singleton | One global `canvas-confetti` instance mounted in root motion layer; reused across all milestones |

## Testing

| File | Cases |
|---|---|
| `__tests__/motion/MotionButton.test.tsx` | Each variant renders correct classes; reduced-motion mode produces opacity-only DOM; tap fires `onClick`; focus-visible class present after Tab |
| `__tests__/motion/StampReveal.test.tsx` | All 5 kinds render correct Tailwind classes; `aria-hidden="true"` present; correct icon and text per kind |
| `__tests__/motion/MilestoneBurst.test.tsx` | Mounts when `trigger` becomes true; ESC closes; click closes; auto-timeout closes; `role="status"` present |
| `__tests__/dashboard/detectMilestone.test.ts` | Returns correct milestone for each of 4 scenarios; returns `null` when no threshold crossed; idempotent (calling twice with same inputs after a fire returns `null`) |
| `__tests__/dashboard/actions.milestone.test.ts` | Each circulation action returns extended `ActionState` with `milestone` populated when appropriate |

**Out of scope:** visual regression (project has no Chromatic/Percy); manual surface walkthrough handled by user during PR review.

## Future extensions (deferred)

- **Streak engine** (`streak_7`, `streak_30`): requires `current_streak_days` and `last_action_date` columns on `user_profiles`. Track ticket: `v3.4 streak engine`
- **Scroll-triggered storytelling**: hero-band reveals on dashboard home, recommendations parallax. Track ticket: `v3.5 scroll narrative`
- **Lottie integration**: hand-crafted stamp / paper-fold animations exported from After Effects, replacing CSS/Motion versions of `StampReveal` for premium feel. Track ticket: `v3.6 lottie polish`
- **Visual regression testing**: Chromatic or Percy integration

## Open implementation notes

- Existing `app/ui/magicUi/blurFade.tsx` is kept and continues to be used in non-receipt contexts; receipt / stamp surfaces switch to `<PaperEnter>`
- ESLint custom rules will live in a new `eslint-rules/motion/` directory; root `eslintrc` references them
- The `magicUi/shimmerButton.tsx` migration is the single trickiest refactor — verify shimmer overlay still renders on top of the new motion baseline before merging
