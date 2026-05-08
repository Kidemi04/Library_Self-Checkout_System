# Engagement Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a system-wide motion vocabulary across the Library Self-Checkout System — shared tokens, semantic atomic primitives, and consistent integrations across all student-facing surfaces — so every interaction speaks one motion language and reinforces engagement through Pavlovian consistency.

**Architecture:** Two-layer motion system. `app/lib/motion/` holds typed numeric tokens (durations, easings, springs, distances, stagger). `app/ui/motion/` holds 8 semantic primitive components that consume only tokens. Pages consume only primitives — never `framer-motion` directly. Server-action `ActionState` extended with a `milestone` field; pure server-side milestone detection runs after each circulation mutation, no DB schema changes.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 3, Motion (framer-motion v12 already installed), canvas-confetti (new), Jest 30 + Testing Library + jsdom (already installed). ESLint flat config (new — repo currently has no project-level ESLint).

**Spec:** `docs/superpowers/specs/2026-05-08-engagement-motion-design.md`

---

## File Structure

### New files

```
app/lib/motion/
├── tokens.ts                      # duration, ease, spring, tap, hover, distance, stagger
├── presets.ts                     # named animation recipes built from tokens
├── reduced-motion.ts              # usePrefersReducedMotion hook
├── resolveColorToken.ts           # reads Tailwind config to give actual hex values for canvas-confetti
└── index.ts

app/ui/motion/
├── MotionButton.tsx               # universal button feedback (primary/secondary/icon/destructive × idle/pending/success/error)
├── StampReveal.tsx                # 5 kinds: borrowed/returned/renewed/reserved/reported
├── InkLine.tsx                    # SVG path stroke-dashoffset writer
├── PaperEnter.tsx                 # paper-style entrance wrapper
├── MilestoneBurst.tsx             # B-tier celebration overlay
├── StreakFlame.tsx                # flame icon with idle wiggle + scale on increment
├── XPCounter.tsx                  # number ticker
├── BookCardLift.tsx               # book card hover lift
├── RootMotionLayer.tsx            # singleton confetti host mounted in dashboard layout
└── index.ts

app/dashboard/
└── detectMilestone.ts             # pure server function, derives milestones from existing tables

eslint.config.mjs                  # flat-config root, registers motion plugin
eslint-rules/motion/
├── no-linear-easing.js
├── no-layout-animation.js
└── index.js                       # plugin barrel

__tests__/motion/
├── MotionButton.test.tsx
├── StampReveal.test.tsx
├── PaperEnter.test.tsx
├── MilestoneBurst.test.tsx
├── reducedMotion.test.tsx
└── tokens.test.ts

__tests__/dashboard/
├── detectMilestone.test.ts
└── actions.milestone.test.ts
```

### Modified files

```
app/dashboard/actionState.ts                 # add milestone field
app/dashboard/actions.ts                     # call detectMilestone, return milestone
app/dashboard/layout.tsx                     # mount RootMotionLayer
app/ui/dashboard/checkOutForm.tsx            # render StampReveal on success
app/ui/dashboard/checkInForm.tsx             # render StampReveal on success
app/ui/dashboard/cancelHoldButton.tsx        # MotionButton variant="destructive"
app/ui/dashboard/cameraScanner.tsx           # InkLine sweep + StampReveal on capture
app/ui/dashboard/cameraScannerButton.tsx     # MotionButton
app/ui/dashboard/sidenav.tsx                 # active-link transition
app/ui/dashboard/desktopTopBar.tsx           # MotionButton
app/ui/dashboard/confirmModal.tsx            # PaperEnter wrapper
app/ui/dashboard/damageReportModal.tsx       # StampReveal on submit
app/ui/dashboard/createBookForm.tsx          # MotionButton
app/ui/dashboard/searchForm.tsx              # MotionButton + InkLine
app/ui/dashboard/bookCatalogTable.tsx        # MotionButton
app/ui/dashboard/bookList.tsx                # BookCardLift
app/ui/dashboard/bookListMobile.tsx          # BookCardLift
app/ui/dashboard/bookRecommendations.tsx     # cards stagger + BookCardLift
app/ui/dashboard/borrowingHistoryFilter.tsx  # MotionButton
app/ui/dashboard/admin/*.tsx                 # MotionButton baseline only — no surface animation
app/ui/magicUi/shimmerButton.tsx             # internal MotionButton baseline
app/dashboard/book/page.tsx                  # renew + hold StampReveal
app/dashboard/book/holds/page.tsx            # MotionButton
app/dashboard/my-books/page.tsx              # Reorder + PaperEnter
app/dashboard/notifications/page.tsx         # PaperEnter stagger
app/dashboard/recommendations/page.tsx       # cards stagger entrance
app/dashboard/profile/page.tsx               # XPCounter total borrowed
app/dashboard/learning/* (existing motion)   # refactor literals → tokens
app/dashboard/faq/page.tsx                   # AnimatePresence accordion
app/dashboard/help/page.tsx                  # AnimatePresence accordion
package.json                                 # add canvas-confetti, eslint deps, lint script
```

---

## Phase 0 · Foundation (tokens, hooks, deps, ESLint)

### Task 0.1: Install canvas-confetti and ESLint dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime deps**

```bash
pnpm add canvas-confetti
pnpm add -D @types/canvas-confetti
```

- [ ] **Step 2: Install ESLint + Next.js plugin (flat config)**

```bash
pnpm add -D eslint@^9 @eslint/js typescript-eslint @next/eslint-plugin-next
```

- [ ] **Step 3: Add lint script to package.json**

In `package.json` under `"scripts"`, add:

```json
    "lint": "eslint app eslint-rules"
```

- [ ] **Step 4: Verify install**

Run: `pnpm test --listTests | head -3`
Expected: lists existing test files without error (sanity check that node_modules still resolves).

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(motion): add canvas-confetti and eslint v9 flat-config deps"
```

### Task 0.2: Motion tokens module with test

**Files:**
- Create: `app/lib/motion/tokens.ts`
- Create: `__tests__/motion/tokens.test.ts`

- [ ] **Step 1: Write the failing test**

`__tests__/motion/tokens.test.ts`:

```ts
import {
  motionDuration,
  motionEase,
  motionSpring,
  motionTap,
  motionHover,
  motionDistance,
  motionStagger,
  milestoneColors,
} from '@/app/lib/motion/tokens';

describe('motion tokens', () => {
  test('duration values are seconds and monotonically increase', () => {
    expect(motionDuration.instant).toBe(0.1);
    expect(motionDuration.quick).toBe(0.2);
    expect(motionDuration.base).toBe(0.35);
    expect(motionDuration.paper).toBe(0.5);
    expect(motionDuration.slow).toBe(0.8);
    expect(motionDuration.dramatic).toBe(1.2);
  });

  test('eases are non-linear cubic-bezier tuples', () => {
    expect(motionEase.out).toEqual([0.4, 0, 0.2, 1]);
    expect(motionEase.inOut).toEqual([0.4, 0, 0.6, 1]);
    expect(motionEase.inkWrite).toEqual([0.7, 0, 0.3, 1]);
  });

  test('springs declare type spring with stiffness and damping', () => {
    expect(motionSpring.paper).toMatchObject({ type: 'spring', stiffness: 220, damping: 24 });
    expect(motionSpring.stamp).toMatchObject({ type: 'spring', stiffness: 280, damping: 18 });
    expect(motionSpring.milestone).toMatchObject({ type: 'spring', stiffness: 350, damping: 12 });
  });

  test('tap and hover values', () => {
    expect(motionTap).toEqual({ scale: 0.96, duration: 0.12 });
    expect(motionHover).toEqual({ lift: 2, cardLift: 4, duration: 0.18 });
  });

  test('distance and stagger values', () => {
    expect(motionDistance.paperRise).toBe(8);
    expect(motionDistance.popUp).toBe(12);
    expect(motionStagger.list).toBe(0.04);
    expect(motionStagger.cards).toBe(0.08);
  });

  test('milestoneColors references Tailwind token names only', () => {
    expect(milestoneColors).toEqual(['primary', 'accent-teal', 'accent-amber', 'success']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/motion/tokens.test.ts`
Expected: FAIL — `Cannot find module '@/app/lib/motion/tokens'`

- [ ] **Step 3: Write minimal implementation**

`app/lib/motion/tokens.ts`:

```ts
export const motionDuration = {
  instant: 0.1,
  quick: 0.2,
  base: 0.35,
  paper: 0.5,
  slow: 0.8,
  dramatic: 1.2,
} as const;

export const motionEase = {
  out: [0.4, 0, 0.2, 1] as const,
  inOut: [0.4, 0, 0.6, 1] as const,
  inkWrite: [0.7, 0, 0.3, 1] as const,
} as const;

export const motionSpring = {
  paper: { type: 'spring', stiffness: 220, damping: 24 } as const,
  stamp: { type: 'spring', stiffness: 280, damping: 18 } as const,
  milestone: { type: 'spring', stiffness: 350, damping: 12 } as const,
} as const;

export const motionTap = { scale: 0.96, duration: 0.12 } as const;

export const motionHover = {
  lift: 2,
  cardLift: 4,
  duration: 0.18,
} as const;

export const motionDistance = {
  paperRise: 8,
  popUp: 12,
} as const;

export const motionStagger = {
  list: 0.04,
  cards: 0.08,
} as const;

export const milestoneColors = ['primary', 'accent-teal', 'accent-amber', 'success'] as const;
export type MilestoneColorToken = (typeof milestoneColors)[number];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/motion/tokens.test.ts`
Expected: PASS — 6 tests passing

- [ ] **Step 5: Commit**

```bash
git add app/lib/motion/tokens.ts __tests__/motion/tokens.test.ts
git commit -m "feat(motion): add motion tokens (duration, ease, spring, tap, hover, distance, stagger)"
```

### Task 0.3: usePrefersReducedMotion hook with test

**Files:**
- Create: `app/lib/motion/reduced-motion.ts`
- Create: `__tests__/motion/reducedMotion.test.tsx`

- [ ] **Step 1: Write the failing test**

`__tests__/motion/reducedMotion.test.tsx`:

```tsx
import { renderHook, act } from '@testing-library/react';
import { usePrefersReducedMotion } from '@/app/lib/motion/reduced-motion';

function setMediaQueryMock(matches: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  const mql = {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_: string, cb: any) => listeners.add(cb),
    removeEventListener: (_: string, cb: any) => listeners.delete(cb),
    dispatchEvent: (e: MediaQueryListEvent) => {
      listeners.forEach((cb) => cb(e));
      return true;
    },
  } as unknown as MediaQueryList;
  window.matchMedia = jest.fn().mockReturnValue(mql);
  return mql;
}

describe('usePrefersReducedMotion', () => {
  test('returns false when system prefers default motion', () => {
    setMediaQueryMock(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  test('returns true when system prefers reduced motion', () => {
    setMediaQueryMock(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  test('updates when media query change event fires', () => {
    const mql = setMediaQueryMock(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    act(() => {
      (mql as any).matches = true;
      (mql as any).dispatchEvent({ matches: true } as MediaQueryListEvent);
    });
    expect(result.current).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/motion/reducedMotion.test.tsx`
Expected: FAIL — `Cannot find module`.

- [ ] **Step 3: Write implementation**

`app/lib/motion/reduced-motion.ts`:

```ts
'use client';
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(QUERY);
    setPrefers(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefers(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return prefers;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/motion/reducedMotion.test.tsx`
Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add app/lib/motion/reduced-motion.ts __tests__/motion/reducedMotion.test.tsx
git commit -m "feat(motion): add usePrefersReducedMotion hook"
```

### Task 0.4: resolveColorToken helper

**Files:**
- Create: `app/lib/motion/resolveColorToken.ts`

- [ ] **Step 1: Write implementation**

This is a build-time-resolved hex map. We hardcode the values from `tailwind.config.ts` here so canvas-confetti has real strings. The `tokens.test.ts` covers naming; this file is pure data + types.

`app/lib/motion/resolveColorToken.ts`:

```ts
import type { MilestoneColorToken } from './tokens';

const TOKEN_TO_HEX: Record<MilestoneColorToken, string> = {
  primary: '#C62828',
  'accent-teal': '#8FAF87',
  'accent-amber': '#D4A017',
  success: '#8FAF87',
};

export function resolveColorToken(name: MilestoneColorToken): string {
  return TOKEN_TO_HEX[name];
}

export function resolveAllMilestoneColors(): string[] {
  return Object.values(TOKEN_TO_HEX);
}
```

> **Maintenance note:** if `tailwind.config.ts` colors change, update `TOKEN_TO_HEX` to match. Place a comment at the top of `tailwind.config.ts` flagging this dependency in Task 4.7.

- [ ] **Step 2: Commit**

```bash
git add app/lib/motion/resolveColorToken.ts
git commit -m "feat(motion): add resolveColorToken for runtime color access (canvas-confetti)"
```

### Task 0.5: Motion lib barrel

**Files:**
- Create: `app/lib/motion/index.ts`

- [ ] **Step 1: Write barrel**

`app/lib/motion/index.ts`:

```ts
export * from './tokens';
export * from './reduced-motion';
export * from './resolveColorToken';
```

- [ ] **Step 2: Commit**

```bash
git add app/lib/motion/index.ts
git commit -m "feat(motion): barrel export for app/lib/motion"
```

### Task 0.6: ESLint flat config + custom motion plugin

**Files:**
- Create: `eslint.config.mjs`
- Create: `eslint-rules/motion/no-linear-easing.js`
- Create: `eslint-rules/motion/no-layout-animation.js`
- Create: `eslint-rules/motion/index.js`

- [ ] **Step 1: Write `no-linear-easing` rule**

`eslint-rules/motion/no-linear-easing.js`:

```js
'use strict';

/**
 * Bans `linear` easing in motion code. The motion system requires non-linear
 * easings (bezier or spring). Linear feels mechanical and breaks the
 * Pavlovian-consistency rule.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: { description: "Disallow 'linear' easing in motion code" },
    schema: [],
    messages: {
      banned: "Linear easing is banned. Use a token from motionEase (out, inOut, inkWrite) or a spring.",
    },
  },
  create(context) {
    function checkValue(node, value) {
      if (typeof value === 'string' && value.toLowerCase() === 'linear') {
        context.report({ node, messageId: 'banned' });
      }
    }
    return {
      Property(node) {
        const key = node.key && (node.key.name || node.key.value);
        if (key !== 'ease' && key !== 'easing' && key !== 'transitionTimingFunction') return;
        if (node.value.type === 'Literal') checkValue(node.value, node.value.value);
      },
      // CSS-in-JS / template literal e.g. `transition: all 0.2s linear`
      TemplateLiteral(node) {
        node.quasis.forEach((q) => {
          if (/\blinear\b/.test(q.value.raw)) {
            context.report({ node: q, messageId: 'banned' });
          }
        });
      },
    };
  },
};
```

- [ ] **Step 2: Write `no-layout-animation` rule**

`eslint-rules/motion/no-layout-animation.js`:

```js
'use strict';

const BANNED_PROPS = new Set([
  'width', 'height', 'top', 'left', 'right', 'bottom',
  'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
  'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
]);

/**
 * Inside framer-motion `animate={...}` and `initial={...}` and `exit={...}`,
 * disallow animating layout-triggering properties — only transform/opacity
 * are permitted (compositor-accelerated).
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow animating layout-triggering CSS properties in framer-motion' },
    schema: [],
    messages: {
      banned: "Animating '{{prop}}' triggers layout. Use transform (x, y, scale) or opacity instead.",
    },
  },
  create(context) {
    function isMotionAnimateAttr(name) {
      return name === 'animate' || name === 'initial' || name === 'exit' || name === 'whileHover' || name === 'whileTap';
    }
    return {
      JSXAttribute(node) {
        if (!isMotionAnimateAttr(node.name && node.name.name)) return;
        const expr = node.value && node.value.expression;
        if (!expr || expr.type !== 'ObjectExpression') return;
        expr.properties.forEach((prop) => {
          if (prop.type !== 'Property') return;
          const key = prop.key.name || prop.key.value;
          if (BANNED_PROPS.has(key)) {
            context.report({ node: prop, messageId: 'banned', data: { prop: key } });
          }
        });
      },
    };
  },
};
```

- [ ] **Step 3: Plugin barrel**

`eslint-rules/motion/index.js`:

```js
'use strict';

module.exports = {
  rules: {
    'no-linear-easing': require('./no-linear-easing'),
    'no-layout-animation': require('./no-layout-animation'),
  },
};
```

- [ ] **Step 4: Flat ESLint config**

`eslint.config.mjs`:

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import motion from './eslint-rules/motion/index.js';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['app/**/*.{ts,tsx}', 'eslint-rules/**/*.js'],
    plugins: {
      '@next/next': nextPlugin,
      motion,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      'motion/no-linear-easing': 'error',
      'motion/no-layout-animation': 'error',
      // existing project conventions tolerate any in places
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', '.worktrees/**', '.superpowers/**', 'mcp/**'],
  },
];
```

- [ ] **Step 5: Run lint to verify rules execute**

Run: `pnpm lint`
Expected: completes (may report existing issues) — the motion rules should at minimum NOT crash. If there are pre-existing lint findings unrelated to motion, leave them; this PR's scope is motion-only.

- [ ] **Step 6: Commit**

```bash
git add eslint.config.mjs eslint-rules
git commit -m "feat(lint): flat ESLint config + custom motion rules (no-linear, no-layout)"
```

---

## Phase 1 · Atomic primitive components

### Task 1.1: MotionButton — base + primary variant + tests

**Files:**
- Create: `app/ui/motion/MotionButton.tsx`
- Create: `__tests__/motion/MotionButton.test.tsx`

- [ ] **Step 1: Write failing tests**

`__tests__/motion/MotionButton.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MotionButton } from '@/app/ui/motion/MotionButton';

describe('MotionButton', () => {
  test('renders children', () => {
    render(<MotionButton variant="primary">Borrow</MotionButton>);
    expect(screen.getByRole('button', { name: 'Borrow' })).toBeInTheDocument();
  });

  test('primary variant applies primary classes', () => {
    render(<MotionButton variant="primary">A</MotionButton>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/bg-primary/);
    expect(btn.className).toMatch(/text-on-primary/);
  });

  test('secondary variant applies secondary classes', () => {
    render(<MotionButton variant="secondary">A</MotionButton>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/bg-canvas/);
    expect(btn.className).toMatch(/text-ink/);
  });

  test('icon variant uses circular shape', () => {
    render(<MotionButton variant="icon" aria-label="x">x</MotionButton>);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/rounded-pill|rounded-full/);
  });

  test('destructive variant uses error color', () => {
    render(<MotionButton variant="destructive">Del</MotionButton>);
    expect(screen.getByRole('button').className).toMatch(/bg-error|text-error/);
  });

  test('disabled state when state="pending"', () => {
    render(<MotionButton variant="primary" state="pending">Save</MotionButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('onClick fires when clicked', () => {
    const onClick = jest.fn();
    render(<MotionButton variant="primary" onClick={onClick}>A</MotionButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('focus-visible class is present (a11y)', () => {
    render(<MotionButton variant="primary">A</MotionButton>);
    expect(screen.getByRole('button').className).toMatch(/focus-visible:/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test -- __tests__/motion/MotionButton.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write implementation**

`app/ui/motion/MotionButton.tsx`:

```tsx
'use client';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import { motionTap, motionHover, motionSpring } from '@/app/lib/motion/tokens';
import { usePrefersReducedMotion } from '@/app/lib/motion/reduced-motion';

export type MotionButtonVariant = 'primary' | 'secondary' | 'icon' | 'destructive';
export type MotionButtonState = 'idle' | 'pending' | 'success' | 'error';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  variant?: MotionButtonVariant;
  state?: MotionButtonState;
  type?: 'button' | 'submit' | 'reset';
  children: ReactNode;
};

const VARIANT_CLASSES: Record<MotionButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:shadow-md',
  secondary: 'bg-canvas text-ink border border-hairline hover:border-ink',
  icon: 'bg-transparent text-ink rounded-pill h-9 w-9',
  destructive: 'bg-error text-on-primary hover:bg-error/90',
};

const BASE_CLASSES =
  'relative inline-flex items-center justify-center gap-2 rounded-btn px-5 h-10 text-button font-medium ' +
  'transition-colors duration-[180ms] outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

export const MotionButton = forwardRef<HTMLButtonElement, Props>(function MotionButton(
  { variant = 'primary', state = 'idle', className, children, type = 'button', disabled, ...rest },
  ref,
) {
  const reduced = usePrefersReducedMotion();
  const isPending = state === 'pending';
  const isDisabled = disabled || isPending;

  const tapScale = variant === 'icon' ? 0.92 : variant === 'secondary' ? 0.97 : motionTap.scale;
  const hoverY = variant === 'icon' ? 0 : -motionHover.lift;

  const motionProps: HTMLMotionProps<'button'> = reduced
    ? {}
    : {
        whileTap: { scale: tapScale, transition: motionSpring.stamp },
        whileHover: isDisabled ? undefined : { y: hoverY, transition: { duration: motionHover.duration } },
      };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={clsx(BASE_CLASSES, VARIANT_CLASSES[variant], className)}
      data-state={state}
      {...motionProps}
      {...rest}
    >
      {children}
    </motion.button>
  );
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test -- __tests__/motion/MotionButton.test.tsx`
Expected: PASS — 8 tests passing.

- [ ] **Step 5: Commit**

```bash
git add app/ui/motion/MotionButton.tsx __tests__/motion/MotionButton.test.tsx
git commit -m "feat(motion): add MotionButton primitive (4 variants, 4 states, focus-visible, reduced-motion)"
```

### Task 1.2: StampReveal — 5 kinds with test

**Files:**
- Create: `app/ui/motion/StampReveal.tsx`
- Create: `__tests__/motion/StampReveal.test.tsx`

- [ ] **Step 1: Write failing test**

`__tests__/motion/StampReveal.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { StampReveal } from '@/app/ui/motion/StampReveal';

describe('StampReveal', () => {
  test.each([
    ['borrowed', 'BORROWED', /text-primary/, /border-primary/, false],
    ['returned', 'RETURNED', /text-success/, /border-success/, false],
    ['renewed',  'RENEWED',  /text-accent-amber/, /border-accent-amber/, false],
    ['reserved', 'RESERVED', /text-accent-teal/,  /border-accent-teal/,  false],
    ['reported', 'REPORTED', /text-error/, /border-error/, true],
  ] as const)('kind=%s renders %s with correct classes (hollow=%s)', (kind, label, textRe, borderRe, hollow) => {
    const { container } = render(<StampReveal kind={kind as any} />);
    expect(container.textContent).toMatch(label);
    const stamp = container.querySelector('[data-testid="stamp"]') as HTMLElement;
    expect(stamp.className).toMatch(textRe);
    expect(stamp.className).toMatch(borderRe);
    if (hollow) expect(stamp.className).toMatch(/bg-transparent|bg-canvas/);
  });

  test('is aria-hidden by default (decorative)', () => {
    const { container } = render(<StampReveal kind="borrowed" />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/motion/StampReveal.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write implementation**

`app/ui/motion/StampReveal.tsx`:

```tsx
'use client';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { motionSpring, motionDuration } from '@/app/lib/motion/tokens';
import { usePrefersReducedMotion } from '@/app/lib/motion/reduced-motion';

export type StampKind = 'borrowed' | 'returned' | 'renewed' | 'reserved' | 'reported';

const KIND_CONFIG: Record<StampKind, { label: string; icon: string; classes: string }> = {
  borrowed: { label: 'BORROWED', icon: '✓', classes: 'text-primary border-primary bg-primary/5' },
  returned: { label: 'RETURNED', icon: '✓', classes: 'text-success border-success bg-success/5' },
  renewed:  { label: 'RENEWED',  icon: '↻', classes: 'text-accent-amber border-accent-amber bg-accent-amber/5' },
  reserved: { label: 'RESERVED', icon: '🔖', classes: 'text-accent-teal border-accent-teal bg-accent-teal/5' },
  reported: { label: 'REPORTED', icon: '⚠', classes: 'text-error border-error bg-transparent' },
};

export function StampReveal({ kind, className }: { kind: StampKind; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const cfg = KIND_CONFIG[kind];

  const initial = reduced ? { opacity: 0 } : { opacity: 0, scale: 2, rotate: 22 };
  const animate = reduced ? { opacity: 0.95 } : { opacity: 0.95, scale: 1, rotate: 8 };
  const transition = reduced ? { duration: motionDuration.instant } : motionSpring.stamp;

  return (
    <motion.div
      data-testid="stamp"
      aria-hidden="true"
      className={clsx(
        'inline-flex items-center gap-2 border-2 rounded-md px-3 py-1.5',
        'font-display font-bold text-caption-uppercase tracking-[0.12em]',
        cfg.classes,
        className,
      )}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      <span aria-hidden="true">{cfg.icon}</span>
      <span>{cfg.label}</span>
    </motion.div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/motion/StampReveal.test.tsx`
Expected: PASS — 6 tests passing.

- [ ] **Step 5: Commit**

```bash
git add app/ui/motion/StampReveal.tsx __tests__/motion/StampReveal.test.tsx
git commit -m "feat(motion): add StampReveal (5 kinds, spring stamp, reduced-motion fallback)"
```

### Task 1.3: InkLine — SVG path stroke writer

**Files:**
- Create: `app/ui/motion/InkLine.tsx`

- [ ] **Step 1: Write implementation**

`app/ui/motion/InkLine.tsx`:

```tsx
'use client';
import { motion } from 'framer-motion';
import { motionDuration, motionEase } from '@/app/lib/motion/tokens';
import { usePrefersReducedMotion } from '@/app/lib/motion/reduced-motion';

type Props = {
  d: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  duration?: keyof typeof motionDuration;
  className?: string;
};

export function InkLine({
  d,
  width = 200,
  height = 14,
  strokeWidth = 1.5,
  duration = 'paper',
  className,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const dur = reduced ? motionDuration.instant : motionDuration[duration];

  return (
    <svg width={width} height={height} className={className} aria-hidden="true">
      <motion.path
        d={d}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: reduced ? 1 : 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: dur, ease: motionEase.inkWrite }}
      />
    </svg>
  );
}
```

> **Note:** framer-motion exposes `pathLength` directly on `motion.path`, animating `stroke-dasharray`/`stroke-dashoffset` under the hood. No manual dashoffset math needed.

- [ ] **Step 2: Commit**

```bash
git add app/ui/motion/InkLine.tsx
git commit -m "feat(motion): add InkLine SVG path stroke-write primitive"
```

### Task 1.4: PaperEnter — entrance wrapper with test

**Files:**
- Create: `app/ui/motion/PaperEnter.tsx`
- Create: `__tests__/motion/PaperEnter.test.tsx`

- [ ] **Step 1: Write failing test**

`__tests__/motion/PaperEnter.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { PaperEnter } from '@/app/ui/motion/PaperEnter';

describe('PaperEnter', () => {
  test('renders children', () => {
    render(<PaperEnter><span>hello</span></PaperEnter>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  test('wraps with motion.div (data attribute)', () => {
    const { container } = render(<PaperEnter><div /></PaperEnter>);
    expect(container.querySelector('[data-motion="paper-enter"]')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/motion/PaperEnter.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write implementation**

`app/ui/motion/PaperEnter.tsx`:

```tsx
'use client';
import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { motionSpring, motionDistance, motionDuration } from '@/app/lib/motion/tokens';
import { usePrefersReducedMotion } from '@/app/lib/motion/reduced-motion';

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function PaperEnter({ children, delay = 0, className }: Props) {
  const reduced = usePrefersReducedMotion();
  const initial = reduced ? { opacity: 0 } : { opacity: 0, y: motionDistance.paperRise };
  const animate = reduced ? { opacity: 1 } : { opacity: 1, y: 0 };
  const transition = reduced
    ? { duration: motionDuration.instant, delay }
    : { ...motionSpring.paper, delay };

  return (
    <motion.div
      data-motion="paper-enter"
      className={className}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/motion/PaperEnter.test.tsx`
Expected: PASS — 2 tests passing.

- [ ] **Step 5: Commit**

```bash
git add app/ui/motion/PaperEnter.tsx __tests__/motion/PaperEnter.test.tsx
git commit -m "feat(motion): add PaperEnter entrance wrapper"
```

### Task 1.5: BookCardLift — hover wrapper

**Files:**
- Create: `app/ui/motion/BookCardLift.tsx`

- [ ] **Step 1: Write implementation**

`app/ui/motion/BookCardLift.tsx`:

```tsx
'use client';
import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { motionHover } from '@/app/lib/motion/tokens';
import { usePrefersReducedMotion } from '@/app/lib/motion/reduced-motion';

export function BookCardLift({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      className={className}
      whileHover={reduced ? undefined : { y: -motionHover.cardLift, transition: { duration: motionHover.duration } }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/ui/motion/BookCardLift.tsx
git commit -m "feat(motion): add BookCardLift hover wrapper"
```

### Task 1.6: XPCounter — number ticker

**Files:**
- Create: `app/ui/motion/XPCounter.tsx`

- [ ] **Step 1: Write implementation**

`app/ui/motion/XPCounter.tsx`:

```tsx
'use client';
import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/app/lib/motion/reduced-motion';

type Props = { from?: number; to: number; durationMs?: number; className?: string };

export function XPCounter({ from = 0, to, durationMs = 700, className }: Props) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(reduced ? to : from);

  useEffect(() => {
    if (reduced) {
      setValue(to);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, durationMs, reduced]);

  return <span className={className}>{value}</span>;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/ui/motion/XPCounter.tsx
git commit -m "feat(motion): add XPCounter number ticker"
```

### Task 1.7: StreakFlame

**Files:**
- Create: `app/ui/motion/StreakFlame.tsx`

- [ ] **Step 1: Write implementation**

`app/ui/motion/StreakFlame.tsx`:

```tsx
'use client';
import { motion } from 'framer-motion';
import { motionSpring } from '@/app/lib/motion/tokens';
import { usePrefersReducedMotion } from '@/app/lib/motion/reduced-motion';

export function StreakFlame({ days, className }: { days: number; className?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <span className={className} aria-label={`Streak: ${days} days`}>
      <motion.span
        aria-hidden="true"
        style={{ display: 'inline-block', transformOrigin: 'bottom center', marginRight: 6 }}
        animate={
          reduced
            ? undefined
            : { rotate: [-5, 5, -5], scale: [1, 1.12, 1] }
        }
        transition={reduced ? undefined : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        key={days}  // re-mounts on increment to retrigger spring
        initial={reduced ? false : { scale: 0 }}
        whileInView={{ scale: 1, transition: motionSpring.milestone }}
      >
        🔥
      </motion.span>
      <span>{days} days</span>
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/ui/motion/StreakFlame.tsx
git commit -m "feat(motion): add StreakFlame (idle wiggle + scale-in on increment)"
```

### Task 1.8: MilestoneBurst — overlay celebration

**Files:**
- Create: `app/ui/motion/MilestoneBurst.tsx`
- Create: `__tests__/motion/MilestoneBurst.test.tsx`

- [ ] **Step 1: Write failing test**

`__tests__/motion/MilestoneBurst.test.tsx`:

```tsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MilestoneBurst } from '@/app/ui/motion/MilestoneBurst';

jest.mock('canvas-confetti', () => ({ __esModule: true, default: jest.fn() }));

describe('MilestoneBurst', () => {
  test('does not render when trigger is false', () => {
    render(<MilestoneBurst trigger={false} milestone={undefined} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('renders with role=status when trigger=true', () => {
    render(
      <MilestoneBurst
        trigger={true}
        milestone={{ kind: 'first_borrow', display: 'Your first borrow!' }}
      />,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Your first borrow!')).toBeInTheDocument();
  });

  test('clicking overlay closes it', () => {
    const onClose = jest.fn();
    render(
      <MilestoneBurst
        trigger={true}
        milestone={{ kind: 'first_borrow', display: 'X' }}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByTestId('milestone-overlay'));
    expect(onClose).toHaveBeenCalled();
  });

  test('ESC key closes it', () => {
    const onClose = jest.fn();
    render(
      <MilestoneBurst
        trigger={true}
        milestone={{ kind: 'first_borrow', display: 'X' }}
        onClose={onClose}
      />,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  test('auto-closes after 1.2s', () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    render(
      <MilestoneBurst
        trigger={true}
        milestone={{ kind: 'first_borrow', display: 'X' }}
        onClose={onClose}
      />,
    );
    act(() => { jest.advanceTimersByTime(1300); });
    expect(onClose).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/motion/MilestoneBurst.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write implementation**

`app/ui/motion/MilestoneBurst.tsx`:

```tsx
'use client';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { motionSpring, motionDuration } from '@/app/lib/motion/tokens';
import { resolveAllMilestoneColors } from '@/app/lib/motion/resolveColorToken';
import { usePrefersReducedMotion } from '@/app/lib/motion/reduced-motion';

export type MilestonePayload = {
  kind:
    | 'first_borrow'
    | 'first_on_time_return'
    | 'books_milestone_5'
    | 'books_milestone_10'
    | 'books_milestone_25'
    | 'books_milestone_50'
    | 'all_overdues_cleared';
  display: string;
};

type Props = {
  trigger: boolean;
  milestone?: MilestonePayload;
  onClose?: () => void;
};

export function MilestoneBurst({ trigger, milestone, onClose }: Props) {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!trigger || !milestone) return;
    if (!reduced) {
      confetti({
        particleCount: 65,
        spread: 85,
        startVelocity: 32,
        gravity: 0.8,
        ticks: 200,
        origin: { x: 0.5, y: 0.55 },
        colors: resolveAllMilestoneColors(),
      });
    }
    const t = setTimeout(() => onClose?.(), 1200);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [trigger, milestone, onClose, reduced]);

  return (
    <AnimatePresence>
      {trigger && milestone && (
        <motion.div
          role="status"
          aria-live="polite"
          data-testid="milestone-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 cursor-pointer"
          onClick={() => onClose?.()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: motionDuration.quick } }}
          transition={{ duration: motionDuration.quick }}
        >
          <motion.div
            className="bg-canvas border border-hairline rounded-hero px-12 py-10 shadow-2xl text-center max-w-md"
            initial={reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { scale: 1, opacity: 1 }}
            transition={reduced ? { duration: motionDuration.instant } : motionSpring.milestone}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-display-md font-display text-primary mb-2">✓</div>
            <p className="text-display-sm font-display text-ink">{milestone.display}</p>
            <p className="text-caption text-muted mt-3">tap anywhere to dismiss</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/motion/MilestoneBurst.test.tsx`
Expected: PASS — 5 tests passing.

- [ ] **Step 5: Commit**

```bash
git add app/ui/motion/MilestoneBurst.tsx __tests__/motion/MilestoneBurst.test.tsx
git commit -m "feat(motion): add MilestoneBurst overlay (confetti + spring + 3 dismissal paths)"
```

### Task 1.9: RootMotionLayer — singleton mount point

**Files:**
- Create: `app/ui/motion/RootMotionLayer.tsx`

- [ ] **Step 1: Write implementation**

`app/ui/motion/RootMotionLayer.tsx`:

```tsx
'use client';
import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { MilestoneBurst, type MilestonePayload } from './MilestoneBurst';

type Ctx = {
  fireMilestone: (m: MilestonePayload) => void;
};

const MotionLayerContext = createContext<Ctx | null>(null);

export function useMotionLayer(): Ctx {
  const ctx = useContext(MotionLayerContext);
  if (!ctx) throw new Error('useMotionLayer must be inside <RootMotionLayer>');
  return ctx;
}

export function RootMotionLayer({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<MilestonePayload | null>(null);

  return (
    <MotionLayerContext.Provider value={{ fireMilestone: setActive }}>
      {children}
      <MilestoneBurst
        trigger={active !== null}
        milestone={active ?? undefined}
        onClose={() => setActive(null)}
      />
    </MotionLayerContext.Provider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/ui/motion/RootMotionLayer.tsx
git commit -m "feat(motion): add RootMotionLayer + useMotionLayer context"
```

### Task 1.10: motion barrel

**Files:**
- Create: `app/ui/motion/index.ts`

- [ ] **Step 1: Write barrel**

`app/ui/motion/index.ts`:

```ts
export * from './MotionButton';
export * from './StampReveal';
export * from './InkLine';
export * from './PaperEnter';
export * from './MilestoneBurst';
export * from './StreakFlame';
export * from './XPCounter';
export * from './BookCardLift';
export * from './RootMotionLayer';
```

- [ ] **Step 2: Commit**

```bash
git add app/ui/motion/index.ts
git commit -m "feat(motion): barrel export for app/ui/motion"
```

---

## Phase 2 · Server-side milestone detection

### Task 2.1: Extend ActionState with milestone field

**Files:**
- Modify: `app/dashboard/actionState.ts`

- [ ] **Step 1: Update type**

Replace contents of `app/dashboard/actionState.ts` with:

```ts
import type { MilestonePayload } from '@/app/ui/motion/MilestoneBurst';

export type ActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  milestone?: MilestonePayload;
};

export const initialActionState: ActionState = {
  status: 'idle',
  message: '',
};
```

- [ ] **Step 2: Run existing tests to confirm no regressions**

Run: `pnpm test`
Expected: existing tests pass; the new field is optional, so existing `success()` / `failure()` callers compile unchanged.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/actionState.ts
git commit -m "feat(actions): extend ActionState with optional milestone payload"
```

### Task 2.2: detectMilestone pure function with tests

**Files:**
- Create: `app/dashboard/detectMilestone.ts`
- Create: `__tests__/dashboard/detectMilestone.test.ts`

- [ ] **Step 1: Write failing tests**

`__tests__/dashboard/detectMilestone.test.ts`:

```ts
import { detectMilestone } from '@/app/dashboard/detectMilestone';

describe('detectMilestone', () => {
  test('first_borrow when total loans count goes from 0 to 1', () => {
    const m = detectMilestone({
      action: 'checkout',
      before: { totalLoans: 0, onTimeReturns: 0, hasOverdue: false },
      after:  { totalLoans: 1, onTimeReturns: 0, hasOverdue: false },
    });
    expect(m?.kind).toBe('first_borrow');
  });

  test('does not fire first_borrow on second loan', () => {
    const m = detectMilestone({
      action: 'checkout',
      before: { totalLoans: 1, onTimeReturns: 0, hasOverdue: false },
      after:  { totalLoans: 2, onTimeReturns: 0, hasOverdue: false },
    });
    expect(m?.kind).not.toBe('first_borrow');
  });

  test('first_on_time_return when onTimeReturns goes 0 to 1', () => {
    const m = detectMilestone({
      action: 'checkin',
      before: { totalLoans: 1, onTimeReturns: 0, hasOverdue: false },
      after:  { totalLoans: 1, onTimeReturns: 1, hasOverdue: false },
    });
    expect(m?.kind).toBe('first_on_time_return');
  });

  test.each([5, 10, 25, 50] as const)('books_milestone_%i when crossing threshold', (n) => {
    const m = detectMilestone({
      action: 'checkout',
      before: { totalLoans: n - 1, onTimeReturns: 0, hasOverdue: false },
      after:  { totalLoans: n,     onTimeReturns: 0, hasOverdue: false },
    });
    expect(m?.kind).toBe(`books_milestone_${n}`);
  });

  test('does not fire books_milestone if not exactly crossing', () => {
    const m = detectMilestone({
      action: 'checkout',
      before: { totalLoans: 5, onTimeReturns: 0, hasOverdue: false },
      after:  { totalLoans: 6, onTimeReturns: 0, hasOverdue: false },
    });
    expect(m).toBeNull();
  });

  test('all_overdues_cleared when hasOverdue goes true to false on checkin', () => {
    const m = detectMilestone({
      action: 'checkin',
      before: { totalLoans: 3, onTimeReturns: 1, hasOverdue: true },
      after:  { totalLoans: 3, onTimeReturns: 1, hasOverdue: false },
    });
    expect(m?.kind).toBe('all_overdues_cleared');
  });

  test('returns null when no threshold crossed', () => {
    const m = detectMilestone({
      action: 'checkout',
      before: { totalLoans: 7, onTimeReturns: 3, hasOverdue: false },
      after:  { totalLoans: 8, onTimeReturns: 3, hasOverdue: false },
    });
    expect(m).toBeNull();
  });

  test('first_borrow takes precedence over books_milestone_5 (first_borrow can only ever fire once)', () => {
    // hypothetical edge: first_borrow if totalLoans went 0 → 1; books_milestone_5 cannot trigger here
    const m = detectMilestone({
      action: 'checkout',
      before: { totalLoans: 0, onTimeReturns: 0, hasOverdue: false },
      after:  { totalLoans: 1, onTimeReturns: 0, hasOverdue: false },
    });
    expect(m?.kind).toBe('first_borrow');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/dashboard/detectMilestone.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write implementation**

`app/dashboard/detectMilestone.ts`:

```ts
import type { MilestonePayload } from '@/app/ui/motion/MilestoneBurst';

export type CirculationAction = 'checkout' | 'checkin' | 'renew' | 'placeHold' | 'damageReport';

export type UserMilestoneCounts = {
  totalLoans: number;       // count(*) from Loans where user_id = X
  onTimeReturns: number;    // count(*) from Loans where user_id = X and return_date <= due_date
  hasOverdue: boolean;      // exists row in OverdueLoan view for user
};

export type DetectInput = {
  action: CirculationAction;
  before: UserMilestoneCounts;
  after:  UserMilestoneCounts;
};

const BOOK_THRESHOLDS = [5, 10, 25, 50] as const;

export function detectMilestone(input: DetectInput): MilestonePayload | null {
  const { action, before, after } = input;

  // first_borrow — checkout only, totalLoans 0 → 1
  if (action === 'checkout' && before.totalLoans === 0 && after.totalLoans === 1) {
    return { kind: 'first_borrow', display: 'Your first borrow! Welcome to the library.' };
  }

  // first_on_time_return — checkin only, onTimeReturns 0 → 1
  if (action === 'checkin' && before.onTimeReturns === 0 && after.onTimeReturns === 1) {
    return { kind: 'first_on_time_return', display: 'First on-time return — well done!' };
  }

  // books_milestone_N — exactly crossing 5/10/25/50 on checkout
  if (action === 'checkout') {
    for (const n of BOOK_THRESHOLDS) {
      if (before.totalLoans < n && after.totalLoans === n) {
        return {
          kind: `books_milestone_${n}` as MilestonePayload['kind'],
          display: `${n} books borrowed!`,
        };
      }
    }
  }

  // all_overdues_cleared — checkin only, hasOverdue true → false
  if (action === 'checkin' && before.hasOverdue && !after.hasOverdue) {
    return { kind: 'all_overdues_cleared', display: 'All overdues cleared!' };
  }

  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/dashboard/detectMilestone.test.ts`
Expected: PASS — 8 tests passing.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/detectMilestone.ts __tests__/dashboard/detectMilestone.test.ts
git commit -m "feat(milestone): add detectMilestone pure function (4 milestone kinds, no DB)"
```

### Task 2.3: Wire milestone detection into circulation actions

**Files:**
- Modify: `app/dashboard/actions.ts`

- [ ] **Step 1: Read current actions.ts**

Run: `pnpm test -- --listTests | grep actions || true`
Then open `app/dashboard/actions.ts` to understand existing structure (checkout / checkin / renew / damageReport / placeHold). The pattern: each action does auth, SIP2, Supabase mutate, audit log, return `success(msg)`.

- [ ] **Step 2: Add a helper that fetches counts and detects**

In `app/dashboard/actions.ts`, add (near the top, after existing imports):

```ts
import { detectMilestone, type CirculationAction, type UserMilestoneCounts } from './detectMilestone';

async function fetchCounts(supabase: ReturnType<typeof getSupabaseServerClient>, userId: string): Promise<UserMilestoneCounts> {
  const [{ count: totalLoans }, { count: onTimeReturns }, { count: overdueCount }] = await Promise.all([
    supabase.from('Loans').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase
      .from('Loans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('return_date', 'is', null)
      .filter('return_date', 'lte', 'due_date'),
    supabase.from('OverdueLoan').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ]);
  return {
    totalLoans: totalLoans ?? 0,
    onTimeReturns: onTimeReturns ?? 0,
    hasOverdue: (overdueCount ?? 0) > 0,
  };
}

async function withMilestone(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  userId: string,
  action: CirculationAction,
  result: ActionState,
  before: UserMilestoneCounts,
): Promise<ActionState> {
  if (result.status !== 'success') return result;
  const after = await fetchCounts(supabase, userId);
  const milestone = detectMilestone({ action, before, after });
  return milestone ? { ...result, milestone } : result;
}
```

- [ ] **Step 3: Wrap each circulation action**

For each of `checkoutAction`, `checkinAction`, `renewAction`, `placeHoldAction`, `damageReportAction`, modify the function so that:

1. Before the Supabase mutation: `const before = await fetchCounts(supabase, userId);`
2. After the existing logic produces a `result: ActionState`: `return withMilestone(supabase, userId, '<action>', result, before);`

Example for `checkoutAction`:

```ts
export async function checkoutAction(/* existing args */): Promise<ActionState> {
  // ...existing auth + SIP2 setup...
  const userId = session.user.id;
  const supabase = getSupabaseServerClient();
  const before = await fetchCounts(supabase, userId);

  // ...existing mutate + audit log...
  const result = success('Checkout complete');

  return withMilestone(supabase, userId, 'checkout', result, before);
}
```

Apply the same pattern to all five circulation actions.

- [ ] **Step 4: Add an integration test**

`__tests__/dashboard/actions.milestone.test.ts`:

```ts
import { detectMilestone } from '@/app/dashboard/detectMilestone';

// Smoke-level integration: verify the contract — detectMilestone integrates with action result shape.
// Full server-action E2E is out of scope for unit tests; manual flow validation in PR.
describe('actions milestone contract', () => {
  test('detectMilestone result extends ActionState shape', () => {
    const m = detectMilestone({
      action: 'checkout',
      before: { totalLoans: 0, onTimeReturns: 0, hasOverdue: false },
      after:  { totalLoans: 1, onTimeReturns: 0, hasOverdue: false },
    });
    expect(m).toMatchObject({ kind: expect.any(String), display: expect.any(String) });
  });
});
```

- [ ] **Step 5: Run all tests**

Run: `pnpm test`
Expected: PASS — all existing + new tests pass. If any existing action test asserts the exact return shape, update assertions to allow optional `milestone`.

- [ ] **Step 6: Commit**

```bash
git add app/dashboard/actions.ts __tests__/dashboard/actions.milestone.test.ts
git commit -m "feat(actions): integrate detectMilestone into circulation actions (returns milestone in ActionState)"
```

### Task 2.4: Mount RootMotionLayer at dashboard layout

**Files:**
- Modify: `app/dashboard/layout.tsx`

- [ ] **Step 1: Wrap dashboard children**

In `app/dashboard/layout.tsx`, import and wrap the children inside `<RootMotionLayer>`:

```tsx
import { RootMotionLayer } from '@/app/ui/motion';
// ...existing imports...

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // ...existing session/redirect logic...
  return (
    <RootMotionLayer>
      {/* existing layout JSX */}
    </RootMotionLayer>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: build succeeds. Check no SSR errors from `'use client'` boundary (RootMotionLayer is client; mounting it inside a server layout is supported by Next.js as a client component island).

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/layout.tsx
git commit -m "feat(motion): mount RootMotionLayer in dashboard layout for global milestone overlay"
```

---

## Phase 3 · Tier 3 system-wide infrastructure (button swap + nav + modal + toast)

### Task 3.1: Replace shimmerButton internals with MotionButton

**Files:**
- Modify: `app/ui/magicUi/shimmerButton.tsx`

- [ ] **Step 1: Read current shimmerButton**

The component currently combines its own framer-motion logic with shimmer overlay. Refactor so the base interaction (tap, hover, focus, disabled) comes from `MotionButton variant="primary"` and the shimmer remains as a decorative overlay layer.

- [ ] **Step 2: Replace implementation**

Update `app/ui/magicUi/shimmerButton.tsx` to:

```tsx
'use client';
import { type ReactNode } from 'react';
import { MotionButton } from '@/app/ui/motion/MotionButton';
import clsx from 'clsx';

type Props = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

export function ShimmerButton({ children, className, ...rest }: Props) {
  return (
    <MotionButton
      variant="primary"
      className={clsx('relative overflow-hidden isolate', className)}
      {...rest}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10
        bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.35)_50%,transparent_70%)]
        bg-[length:200%_100%] animate-[shimmer_2.5s_ease-in-out_infinite]" />
      <span className="relative">{children}</span>
    </MotionButton>
  );
}
```

> The `animate-shimmer` keyframe already exists in `tailwind.config.ts`. Confirm and align if the keyframe name differs.

- [ ] **Step 3: Verify visually**

Run: `pnpm dev` and exercise any page that uses ShimmerButton. The shimmer overlay should still animate; tap and hover now come from MotionButton.

- [ ] **Step 4: Commit**

```bash
git add app/ui/magicUi/shimmerButton.tsx
git commit -m "refactor(magicUi): shimmerButton uses MotionButton baseline + shimmer overlay"
```

### Task 3.2: Replace primary buttons in checkOutForm and checkInForm

**Files:**
- Modify: `app/ui/dashboard/checkOutForm.tsx`
- Modify: `app/ui/dashboard/checkInForm.tsx`

- [ ] **Step 1: Swap buttons**

In each form, replace the existing `<button type="submit">...</button>` with:

```tsx
import { MotionButton } from '@/app/ui/motion';

<MotionButton
  type="submit"
  variant="primary"
  state={isPending ? 'pending' : 'idle'}
>
  {isPending ? 'Processing…' : 'Borrow this book'}
</MotionButton>
```

Match the same pattern for the cancel button as `variant="secondary"`.

- [ ] **Step 2: Run tests**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/ui/dashboard/checkOutForm.tsx app/ui/dashboard/checkInForm.tsx
git commit -m "refactor(circulation): checkOut/checkIn forms use MotionButton"
```

### Task 3.3: Sweep MotionButton across remaining surfaces (excluding admin/staff for now)

**Files:**
- Modify: each file in this list, replacing `<button>` with `<MotionButton>` where appropriate (icon vs primary vs secondary by visual context):
  - `app/ui/dashboard/cancelHoldButton.tsx` → `variant="destructive"`
  - `app/ui/dashboard/cameraScannerButton.tsx` → `variant="icon"`
  - `app/ui/dashboard/searchForm.tsx` → submit `variant="primary"`, optional clear `variant="secondary"`
  - `app/ui/dashboard/borrowingHistoryFilter.tsx` → `variant="secondary"`
  - `app/ui/dashboard/bookCatalogTable.tsx` → `variant="primary"` for borrow/return CTAs
  - `app/ui/dashboard/desktopTopBar.tsx` → `variant="icon"` for icon buttons
  - `app/ui/dashboard/createBookForm.tsx` → submit `variant="primary"`
  - `app/dashboard/book/holds/page.tsx` → `variant="primary"`

- [ ] **Step 1: Replace one file at a time**

For each file: import `MotionButton` from `@/app/ui/motion`, swap the button JSX, preserve all existing class names by passing through the `className` prop.

- [ ] **Step 2: Run tests + dev server smoke after each batch of 3 files**

Run: `pnpm test && pnpm build`
Expected: PASS, build succeeds.

- [ ] **Step 3: Commit per logical group (3 files per commit)**

```bash
git add <files>
git commit -m "refactor(<area>): MotionButton swap (<files>)"
```

### Task 3.4: Sidenav active-link transition

**Files:**
- Modify: `app/ui/dashboard/sidenav.tsx`

- [ ] **Step 1: Wrap active state with motion**

Locate where the active link is rendered. Wrap the active indicator (background or pill) with `<motion.div>` and use Motion's `layoutId` to animate the indicator between active links:

```tsx
import { motion } from 'framer-motion';
import { motionSpring } from '@/app/lib/motion';

// inside the link rendering loop:
<div className="relative">
  {isActive && (
    <motion.div
      layoutId="sidenav-active-indicator"
      className="absolute inset-0 bg-primary/10 rounded-md"
      transition={motionSpring.paper}
    />
  )}
  <span className="relative">{label}</span>
</div>
```

- [ ] **Step 2: Verify**

Run: `pnpm dev`. Click between sidenav items; the active background should slide between items with a soft spring.

- [ ] **Step 3: Commit**

```bash
git add app/ui/dashboard/sidenav.tsx
git commit -m "feat(sidenav): motion layoutId active-link indicator"
```

### Task 3.5: Modal entrance via PaperEnter

**Files:**
- Modify: `app/ui/dashboard/confirmModal.tsx`
- Modify: `app/ui/dashboard/damageReportModal.tsx`

- [ ] **Step 1: Wrap modal content**

In each modal, replace the manual entrance animation (or static render) with:

```tsx
import { PaperEnter } from '@/app/ui/motion';

<div className="modal-backdrop">
  <PaperEnter className="modal-card">
    {/* existing modal body */}
  </PaperEnter>
</div>
```

- [ ] **Step 2: Verify**

Run: `pnpm dev`. Open the confirm modal — content rises from below with the paper spring.

- [ ] **Step 3: Commit**

```bash
git add app/ui/dashboard/confirmModal.tsx app/ui/dashboard/damageReportModal.tsx
git commit -m "feat(modal): PaperEnter wrapper on confirm + damageReport modals"
```

---

## Phase 4 · Tier 1 circulation flow integrations (StampReveal)

### Task 4.1: checkOutForm renders StampReveal on success

**Files:**
- Modify: `app/ui/dashboard/checkOutForm.tsx`

- [ ] **Step 1: Hook into action state + milestone**

Inside the form component, after `useActionState`:

```tsx
import { StampReveal } from '@/app/ui/motion';
import { useMotionLayer } from '@/app/ui/motion/RootMotionLayer';
import { useEffect } from 'react';

const layer = useMotionLayer();

useEffect(() => {
  if (state.status === 'success' && state.milestone) {
    layer.fireMilestone(state.milestone);
  }
}, [state, layer]);

// ...in JSX, near the result area:
{state.status === 'success' && (
  <div className="mt-4">
    <StampReveal kind="borrowed" />
  </div>
)}
```

- [ ] **Step 2: Verify**

Run `pnpm dev`, perform a checkout (use dev bypass auth per CLAUDE.md). The stamp should drop into place; if a milestone fires, the overlay should appear.

- [ ] **Step 3: Commit**

```bash
git add app/ui/dashboard/checkOutForm.tsx
git commit -m "feat(circulation): checkOut shows StampReveal borrowed + fires milestone"
```

### Task 4.2: checkInForm renders StampReveal returned

**Files:**
- Modify: `app/ui/dashboard/checkInForm.tsx`

- [ ] **Step 1: Same pattern as 4.1**

Render `<StampReveal kind="returned" />` on `state.status === 'success'`. Wire `useMotionLayer().fireMilestone` for `state.milestone`.

- [ ] **Step 2: Commit**

```bash
git add app/ui/dashboard/checkInForm.tsx
git commit -m "feat(circulation): checkIn shows StampReveal returned + fires milestone"
```

### Task 4.3: Renew flow stamp

**Files:**
- Modify: `app/dashboard/book/page.tsx` (and any sub-component that handles renewal UI)

- [ ] **Step 1: Add stamp on renew success**

When the renew action returns `success`, render `<StampReveal kind="renewed" />` near the loan info row.

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/book/page.tsx
git commit -m "feat(circulation): renew shows StampReveal renewed"
```

### Task 4.4: Hold flow stamp

**Files:**
- Modify: `app/dashboard/book/page.tsx` (or hold UI component)

- [ ] **Step 1: Add stamp on hold success**

`<StampReveal kind="reserved" />` after `placeHold` succeeds.

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/book/page.tsx
git commit -m "feat(circulation): placeHold shows StampReveal reserved"
```

### Task 4.5: Damage report stamp

**Files:**
- Modify: `app/ui/dashboard/damageReportModal.tsx`

- [ ] **Step 1: Add stamp on submit success**

`<StampReveal kind="reported" />` after damage report submission.

- [ ] **Step 2: Commit**

```bash
git add app/ui/dashboard/damageReportModal.tsx
git commit -m "feat(circulation): damageReport shows StampReveal reported"
```

### Task 4.6: cameraScan ink sweep + stamp

**Files:**
- Modify: `app/ui/dashboard/cameraScanner.tsx`

- [ ] **Step 1: Render InkLine across detection box on barcode capture**

When the scanner reports a successful read:

```tsx
import { InkLine, StampReveal } from '@/app/ui/motion';

{lastScannedAt && (
  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-primary">
    <InkLine d="M0,7 Q100,2 200,7 T400,7" width={400} duration="quick" />
  </div>
)}

{captured && <StampReveal kind="borrowed" />}
```

- [ ] **Step 2: Commit**

```bash
git add app/ui/dashboard/cameraScanner.tsx
git commit -m "feat(scan): cameraScanner shows InkLine sweep + StampReveal on capture"
```

### Task 4.7: my-books list — Reorder + PaperEnter

**Files:**
- Modify: `app/dashboard/my-books/page.tsx`

- [ ] **Step 1: Wrap list with framer Reorder**

```tsx
'use client';
import { Reorder } from 'framer-motion';
import { PaperEnter } from '@/app/ui/motion';
import { motionStagger } from '@/app/lib/motion';

<Reorder.Group axis="y" values={items} onReorder={() => { /* read-only */ }}>
  {items.map((item, i) => (
    <Reorder.Item key={item.id} value={item} drag={false}>
      <PaperEnter delay={i * motionStagger.list}>{/* item card */}</PaperEnter>
    </Reorder.Item>
  ))}
</Reorder.Group>
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/my-books/page.tsx
git commit -m "feat(my-books): Reorder + PaperEnter stagger for loan list"
```

### Task 4.8: Tailwind config maintenance comment

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Add maintenance comment**

At the top of `tailwind.config.ts`, before `const config: Config = {`, add:

```ts
// NOTE: motion system reads color tokens at runtime via
// app/lib/motion/resolveColorToken.ts. When changing values for
// `primary`, `accent-teal`, `accent-amber`, or `success`, also
// update the TOKEN_TO_HEX map in that file.
```

- [ ] **Step 2: Commit**

```bash
git add tailwind.config.ts
git commit -m "docs(tailwind): flag color-token dependency on motion resolveColorToken"
```

---

## Phase 5 · Tier 2 engagement loops

### Task 5.1: notifications PaperEnter stagger

**Files:**
- Modify: `app/dashboard/notifications/page.tsx`

- [ ] **Step 1: Wrap each notification with PaperEnter and stagger**

```tsx
import { PaperEnter } from '@/app/ui/motion';
import { motionStagger } from '@/app/lib/motion';

{notifications.map((n, i) => (
  <PaperEnter key={n.id} delay={i * motionStagger.list}>
    {/* notification card */}
  </PaperEnter>
))}
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/notifications/page.tsx
git commit -m "feat(notifications): PaperEnter stagger entrance"
```

### Task 5.2: recommendations cards stagger + BookCardLift

**Files:**
- Modify: `app/dashboard/recommendations/page.tsx` (and `app/ui/dashboard/bookRecommendations.tsx` if relevant)

- [ ] **Step 1: Wrap each book card**

```tsx
import { PaperEnter, BookCardLift } from '@/app/ui/motion';
import { motionStagger } from '@/app/lib/motion';

{books.map((b, i) => (
  <PaperEnter key={b.id} delay={i * motionStagger.cards}>
    <BookCardLift>
      {/* existing card content */}
    </BookCardLift>
  </PaperEnter>
))}
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/recommendations/page.tsx app/ui/dashboard/bookRecommendations.tsx
git commit -m "feat(recommendations): stagger entrance + BookCardLift hover"
```

### Task 5.3: profile total borrowed XPCounter

**Files:**
- Modify: `app/dashboard/profile/page.tsx`

- [ ] **Step 1: Replace static count with XPCounter**

Where the profile shows total borrowed:

```tsx
import { XPCounter } from '@/app/ui/motion';

<span className="text-display-md font-display text-primary">
  <XPCounter to={totalBorrowed} />
</span>
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/profile/page.tsx
git commit -m "feat(profile): XPCounter for total borrowed"
```

### Task 5.4: learning page motion refactor (literals → tokens)

**Files:**
- Modify: any file under `app/dashboard/learning/` and `app/ui/dashboard/learning/` that uses framer-motion with hardcoded values (e.g., `transition={{ duration: 0.3 }}`)

- [ ] **Step 1: Replace literal durations and easings with tokens**

Each occurrence:

```tsx
// before
transition={{ duration: 0.3, ease: 'easeOut' }}
// after
import { motionDuration, motionEase } from '@/app/lib/motion';
transition={{ duration: motionDuration.base, ease: motionEase.out }}
```

- [ ] **Step 2: Run lint to confirm no `linear` violations**

Run: `pnpm lint`
Expected: clean for motion rules.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/learning app/ui/dashboard/learning
git commit -m "refactor(learning): motion uses tokens (literal durations and eases removed)"
```

---

## Phase 6 · Tier 4 restraint zones

### Task 6.1: faq + help accordions use AnimatePresence

**Files:**
- Modify: `app/dashboard/faq/page.tsx`
- Modify: `app/dashboard/help/page.tsx`

- [ ] **Step 1: Wrap accordion content**

```tsx
'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { motionDuration, motionEase } from '@/app/lib/motion';

<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: motionDuration.base, ease: motionEase.inOut }}
    >
      {answer}
    </motion.div>
  )}
</AnimatePresence>
```

> **Note:** `height: auto` with framer-motion is one of the rare allowed cases since the alternative (`max-height`) has its own pitfalls. The ESLint rule `no-layout-animation` will flag `height` — add an inline `// eslint-disable-next-line motion/no-layout-animation` with a brief justification comment for these two files only.

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/faq/page.tsx app/dashboard/help/page.tsx
git commit -m "feat(faq+help): AnimatePresence accordion entrance/exit"
```

### Task 6.2: admin / staff button sweep

**Files:**
- Modify: each `app/ui/dashboard/admin/*.tsx` button instance — minimal changes, only swap `<button>` → `<MotionButton variant="primary"|"secondary"|"icon"|"destructive">`. NO surface-level animation beyond the button feedback.

- [ ] **Step 1: Replace buttons file by file**

Sweep through:
- `addBookForm.tsx`, `addUserDialog.tsx`, `adminDashboard.tsx`
- `cameraScanModal.tsx`, `overdueViewer.tsx`, `roleTabs.tsx`
- `userDetailForm.tsx`, `usersList.tsx`

- [ ] **Step 2: Run tests**

Run: `pnpm test && pnpm build`

- [ ] **Step 3: Commit**

```bash
git add app/ui/dashboard/admin
git commit -m "refactor(admin): MotionButton swap (no surface-level animation)"
```

---

## Phase 7 · A11y & polish verification

### Task 7.1: Reduced-motion path verification (manual checklist)

**Files:**
- Verify against running dev server.

- [ ] **Step 1: Enable reduced-motion in OS**

On Windows: Settings → Accessibility → Visual effects → Animation effects → Off.

- [ ] **Step 2: Walk these surfaces and verify ALL have only opacity transitions and no movement:**

  - Dashboard home
  - book/[id] borrow / renew / hold flows
  - my-books list
  - notifications
  - recommendations
  - cameraScan
  - profile
  - faq / help accordions
  - All `MotionButton` interactions (hover, tap)
  - MilestoneBurst (should show static check + headline, no confetti)

- [ ] **Step 3: Document outcome**

Append a short report to the spec under a new "Manual A11y verification" section noting which surfaces passed; if any failed, file a follow-up task in the same PR.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-05-08-engagement-motion-design.md
git commit -m "docs(spec): manual reduced-motion verification report"
```

### Task 7.2: Focus & ARIA verification

**Files:**
- Verify against running dev server.

- [ ] **Step 1: Tab through every interactive surface**

Confirm every button shows the `focus-visible` ring (primary color, 2px). No browser-default ring.

- [ ] **Step 2: Verify screen reader announcements**

With NVDA / Narrator running:
- StampReveal must NOT be announced (decorative)
- MilestoneBurst MUST be announced as e.g. "Your first borrow! Welcome to the library, status"

- [ ] **Step 3: Confirm color contrast in browser devtools accessibility audit**

For `text-accent-teal`-on-canvas stamps in the reserved variant: the inspector should show ≥ 4.5:1 OR the stamp's filled-with-accent-teal-background-and-on-primary-text fallback applies.

- [ ] **Step 4: Commit any tweaks**

If contrast issues found, switch the failing stamp from `text-accent-teal bg-accent-teal/5` to `text-on-primary bg-accent-teal` (filled stamp).

```bash
git add <fixed-files>
git commit -m "fix(motion): stamp contrast fallback for text-accent-teal variant"
```

### Task 7.3: Final test sweep

- [ ] **Step 1: Run full test suite**

Run: `pnpm test`
Expected: ALL tests pass, no skipped tests.

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: zero motion-rule violations across `app/`. Existing pre-rule unrelated lint output is acceptable.

- [ ] **Step 3: Run build**

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 4: Final commit**

If any clean-up needed:

```bash
git add .
git commit -m "chore(motion): final lint + test sweep before review"
```

---

## Self-Review Checklist

Before handing off:

- [ ] Spec coverage: every section of `2026-05-08-engagement-motion-design.md` maps to at least one task above
- [ ] No placeholders: all code blocks contain real, runnable code
- [ ] Type consistency: `MotionButtonVariant`, `MotionButtonState`, `StampKind`, `MilestonePayload` are spelled the same in every reference
- [ ] Test commands use `pnpm test -- <path>` per CLAUDE.md
- [ ] All commits use conventional-commit prefixes consistent with existing repo history
- [ ] `pnpm lint` works (script was added in Task 0.1)
- [ ] `pnpm build` succeeds end-to-end
