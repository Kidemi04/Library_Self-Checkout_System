# UI Claude-Style Redesign — Batch 1 (Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the new design-system foundation — Tailwind tokens, fonts, global CSS, and migrated primitives + shell — so that any new component automatically inherits the cream-canvas + warmed-red + Newsreader visual language defined in the spec.

**Architecture:** Token-first refactor. New tokens are added to `tailwind.config.ts` alongside legacy tokens (kept as aliases until Batch 3 cleanup). Components are migrated one file at a time using a deterministic className-replacement recipe. Each component swap is a self-contained commit that compiles, lints, and renders correctly in both light and dark modes.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS 3.4, `next/font/google`, custom `ThemeProvider` (not `next-themes`), TypeScript, pnpm.

**Spec reference:** `docs/superpowers/specs/2026-04-29-ui-claude-style-redesign-design.md`

---

## Prerequisites

Before starting any task, the engineer must have:

- [ ] Read `docs/superpowers/specs/2026-04-29-ui-claude-style-redesign-design.md` end-to-end
- [ ] Read `DESIGN.md` (project root) for visual context
- [ ] Confirmed current branch is `Kelvin-v3.0.4-EnhanceUIColour` (`git branch --show-current`)
- [ ] Confirmed `pnpm install` has been run and `pnpm dev` boots (`http://localhost:3000` returns 200)

## Codebase facts that inform this plan

- Theme switching uses a **custom `ThemeProvider`** at `app/ui/theme/themeProvider.tsx` — not `next-themes`. It toggles `dark` / `light` classes on `<html>` and persists choice in `localStorage` + cookie. **Do not introduce `next-themes`** — Tailwind `dark:` prefix already works against the custom provider's class.
- Tailwind config at `tailwind.config.ts` has `darkMode: 'class'` already. ✓
- Body fonts loaded today via `<link>` tag in `app/layout.tsx` head (Google Fonts CDN). This plan replaces that with `next/font/google` for self-host.
- Current legacy tokens to preserve as aliases in Batch 1: `swin-red`, `swin-charcoal`, `swin-ivory`, `swin-gold`, `swin-dark-bg`, `swin-dark-surface`. They will be **deleted in Batch 3** after all consumers are migrated.

## File Structure

### Files Modified

| Path | Purpose |
|---|---|
| `tailwind.config.ts` | Add new color/typography/radius/spacing tokens; keep legacy as aliases |
| `app/ui/global.css` | Remove Apple-system font override; rely on Tailwind font-sans |
| `app/layout.tsx` | Replace `<link>` Google Fonts with `next/font/google`; set root `bg-canvas dark:bg-dark-canvas` |
| `app/ui/button.tsx` | Migrate Button to new primary tokens |
| `app/ui/dashboard/primitives/*.tsx` (18 files) | Migrate each primitive to new tokens |
| `app/ui/dashboard/dashboardShell.tsx` | Replace `swin-dark-bg`/`swin-charcoal` with new tokens |
| `app/ui/dashboard/adminShell.tsx` | Same as dashboardShell |
| `app/ui/dashboard/dashboardTitleBar.tsx` | Update typography to `font-display text-display-lg`; logo retains `swin-red-brand` |
| `app/ui/dashboard/signOutButton.tsx` | Migrate to new tokens |
| `app/ui/theme/themeToggle.tsx` | Migrate to new tokens (icon colors) |

### Files Created

| Path | Purpose |
|---|---|
| `app/dev/primitives/page.tsx` | Temporary dev gallery showing every primitive in light + dark; **removed in Batch 3** |
| `app/dev/layout.tsx` | Layout for `/dev/*` routes (dev-only — NODE_ENV check) |

### Files Deleted (in Batch 3, NOT this batch)

`tailwind.config.ts` legacy `swin-*` tokens — Batch 1 keeps them all.

---

## Token Migration Reference Table

This is the canonical replacement map used by Tasks 7–32. Apply these substitutions to each component file when migrating.

### Class-level replacements

| Find | Replace with |
|---|---|
| `bg-white` | `bg-canvas` |
| `bg-slate-50` | `bg-canvas` |
| `bg-swin-dark-bg` | `bg-dark-canvas` |
| `bg-swin-dark-surface` | `bg-dark-surface-card` |
| `bg-swin-charcoal` | `bg-body-strong` |
| `bg-swin-ivory` | `bg-canvas` |
| `bg-swin-red` | `bg-primary` |
| `bg-swin-gold` | `bg-accent-amber` |
| `bg-blue-500` (button.tsx) | `bg-primary` |
| `bg-green-500` (StatusBadge AVAILABLE) | `bg-surface-card` (with leading `success` dot) |
| `bg-green-100` | `bg-surface-card` |
| `bg-amber-100` / `bg-orange-500` | `bg-surface-cream-strong` |
| `bg-slate-300` / `bg-slate-400` | `bg-surface-card` |
| `text-white` (on primary CTA) | `text-on-primary` |
| `text-white` (on dark bg) | `text-on-dark` |
| `text-swin-charcoal` | `text-ink` |
| `text-swin-charcoal/40` | `text-muted-soft` |
| `text-swin-charcoal/70` | `text-muted` |
| `text-swin-red` | `text-primary` |
| `text-swin-gold` | `text-accent-amber` |
| `text-slate-600` | `text-body` |
| `text-green-600` / `text-green-400` | `text-success` |
| `text-red-300` / `text-red-700` | `text-primary` |
| `border-swin-charcoal/10` | `border-hairline` |
| `border-white/10` | `dark:border-dark-hairline` |
| `border-gray-200` | `border-hairline` |
| `dark:bg-swin-dark-surface` | `dark:bg-dark-surface-card` |
| `dark:bg-swin-dark-bg` | `dark:bg-dark-canvas` |
| `dark:text-white` | `dark:text-on-dark` |
| `dark:text-white/40` | `dark:text-muted-soft` |
| `dark:text-white/60` | `dark:text-muted` |
| `dark:border-white/10` | `dark:border-dark-hairline` |
| `rounded-2xl` (cards) | `rounded-card` |
| `rounded-lg` (buttons in button.tsx) | `rounded-btn` |
| `rounded-full` (badges, chips) | `rounded-pill` |
| `font-display` class name | unchanged (now points to Newsreader, not Cormorant) |
| `font-mono` | unchanged (still JetBrains Mono) |

### Special cases

- **`StatusBadge` AVAILABLE/READY/QUEUED variants** — switch from full-block colored fills to `bg-surface-card text-ink` + leading `<span>` colored dot (`bg-success` / `bg-primary` / `bg-accent-teal`). Only `OVERDUE` retains solid `bg-primary text-on-primary` per spec §6.2.
- **Logo / brand mark elements** — preserve `swin-red-brand` (new alias of `#C82333`). Currently any `text-swin-red` inside `app/ui/acmeLogo.tsx` or login brand mark stays as `swin-red-brand` after migration.
- **Focus rings** — replace any custom `focus-visible:outline*` with the unified `focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas`.

---

## Tasks

### Task 1: Add new color tokens to `tailwind.config.ts`

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Open the file and locate the `theme.extend.colors` block**

Current state (lines 30–40 approx):
```ts
colors: {
  swin: {
    red: '#C82333',
    charcoal: '#343642',
    black: '#000000',
    ivory: '#FEFDFD',
    gold: '#C9A961',
    'dark-bg': '#0F1115',
    'dark-surface': '#181B21',
  },
},
```

- [ ] **Step 2: Replace the `colors` block with the new token system (legacy kept as aliases)**

```ts
colors: {
  // Legacy Swinburne tokens (RETAINED in Batch 1; deleted in Batch 3)
  swin: {
    red: '#C82333',
    charcoal: '#343642',
    black: '#000000',
    ivory: '#FEFDFD',
    gold: '#C9A961',
    'dark-bg': '#0F1115',
    'dark-surface': '#181B21',
  },

  // Brand: dual-track Swinburne red
  'swin-red-brand': '#C82333',          // logo / brand-mark only
  primary:          '#B83A35',          // UI CTA, links, focus rings
  'primary-active': '#9A2D29',
  'primary-disabled': '#E6DFD8',
  'dark-primary':   '#CC4640',          // dark-mode primary

  // Surface — light
  canvas:                 '#FAF9F5',
  'surface-soft':         '#F5F0E8',
  'surface-card':         '#EFE9DE',
  'surface-cream-strong': '#E8E0D2',
  hairline:               '#E6DFD8',
  'hairline-soft':        '#EBE6DF',

  // Surface — dark
  'dark-canvas':          '#181715',
  'dark-surface-soft':    '#1F1E1B',
  'dark-surface-card':    '#252320',
  'dark-surface-strong':  '#2D2B27',
  'dark-hairline':        '#3A3733',

  // Text
  ink:           '#141413',
  'body-strong': '#252523',
  body:          '#3D3D3A',
  muted:         '#6C6A64',
  'muted-soft':  '#8E8B82',
  'on-primary':  '#FFFFFF',
  'on-dark':     '#FAF9F5',
  'on-dark-soft':'#A09D96',

  // Accent
  'accent-teal':  '#5DB8A6',
  'accent-amber': '#E8A55A',

  // Semantic
  success: '#5DB872',
  warning: '#D4A017',
  error:   '#C64545',
},
```

- [ ] **Step 3: Run typecheck to ensure the config still parses**

Run: `pnpm tsc --noEmit`
Expected: 0 errors. If errors mention `tailwind.config.ts`, re-check syntax (trailing commas, quotes).

- [ ] **Step 4: Commit (color tokens only)**

```bash
git add tailwind.config.ts
git commit -m "feat(tokens): add Claude-style color palette (light + dark)

Adds canvas/surface/ink/primary/accent/semantic tokens per design spec.
Legacy swin-* tokens retained as aliases; will be removed in Batch 3
once all consumers are migrated.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Add typography token scale to `tailwind.config.ts`

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Locate the `theme.extend` block; remove the existing `fontFamily.display` (Cormorant) entry**

Current `fontFamily` block:
```ts
fontFamily: {
  display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
  sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
  mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'monospace'],
},
```

- [ ] **Step 2: Replace with CSS-variable-driven font families (variables come from Task 4 `next/font` setup)**

```ts
fontFamily: {
  display: ['var(--font-newsreader)', 'Georgia', 'serif'],
  sans:    ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
  mono:    ['var(--font-jetbrains-mono)', '"SF Mono"', 'Menlo', 'monospace'],
},
```

- [ ] **Step 3: Add `fontSize` map directly under `extend` (sibling of `fontFamily`)**

```ts
fontSize: {
  'display-xl': ['64px', { lineHeight: '1.05', letterSpacing: '-1.5px', fontWeight: '400' }],
  'display-lg': ['48px', { lineHeight: '1.10', letterSpacing: '-1px',   fontWeight: '400' }],
  'display-md': ['36px', { lineHeight: '1.15', letterSpacing: '-0.5px', fontWeight: '400' }],
  'display-sm': ['28px', { lineHeight: '1.20', letterSpacing: '-0.3px', fontWeight: '400' }],
  'title-lg':   ['22px', { lineHeight: '1.30', letterSpacing: '0',      fontWeight: '500' }],
  'title-md':   ['18px', { lineHeight: '1.40', letterSpacing: '0',      fontWeight: '500' }],
  'title-sm':   ['16px', { lineHeight: '1.40', letterSpacing: '0',      fontWeight: '500' }],
  'body-md':    ['16px', { lineHeight: '1.55', letterSpacing: '0',      fontWeight: '400' }],
  'body-sm':    ['14px', { lineHeight: '1.55', letterSpacing: '0',      fontWeight: '400' }],
  caption:      ['13px', { lineHeight: '1.40', letterSpacing: '0',      fontWeight: '500' }],
  'caption-uppercase': ['12px', { lineHeight: '1.40', letterSpacing: '1.5px', fontWeight: '500' }],
  code:         ['14px', { lineHeight: '1.60', letterSpacing: '0',      fontWeight: '400' }],
  button:       ['14px', { lineHeight: '1',    letterSpacing: '0',      fontWeight: '500' }],
  'nav-link':   ['14px', { lineHeight: '1.40', letterSpacing: '0',      fontWeight: '500' }],
},
```

- [ ] **Step 4: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat(tokens): add typography scale + variable-driven font families

Replaces Cormorant Garamond display font with Newsreader (via CSS var
populated by next/font in Task 4). Adds 14-token type scale matching
DESIGN.md.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Add radius + spacing tokens to `tailwind.config.ts`

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Add `borderRadius` map under `theme.extend`**

```ts
borderRadius: {
  btn: '8px',
  card: '12px',
  hero: '16px',
},
```

(Leaves Tailwind defaults `rounded-md`/`rounded-lg`/etc. untouched per conservative strategy.)

- [ ] **Step 2: Add `spacing` extension for `section`**

```ts
spacing: {
  section: '96px',
},
```

- [ ] **Step 3: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat(tokens): add radius and spacing tokens

rounded-btn (8px), rounded-card (12px), rounded-hero (16px) — semantic
tokens that don't override Tailwind defaults. spacing.section = 96px.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Configure `next/font/google` for Newsreader, Inter, JetBrains Mono

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Read the current file**

Current `app/layout.tsx`:
```tsx
import '@/app/ui/global.css';
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-white dark:bg-swin-dark-bg"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Replace the entire file with `next/font/google` setup**

```tsx
import '@/app/ui/global.css';
import { Newsreader, Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-newsreader',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-canvas font-sans text-ink dark:bg-dark-canvas dark:text-on-dark"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Boot dev server and verify font loads**

Run: `pnpm dev`
Expected: server boots; `http://localhost:3000` returns 200; in DevTools Network tab, **no requests to `fonts.googleapis.com` or `fonts.gstatic.com`**; fonts served from `_next/static/media/*.woff2`.

(User performs the browser check — note in the chat hand-off if visual confirmation is pending.)

- [ ] **Step 4: Run lint + typecheck**

Run: `pnpm lint && pnpm tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(fonts): self-host Newsreader/Inter/JetBrains Mono via next/font

Removes <link> to Google Fonts CDN; fonts now downloaded at build time
and served from _next/static/media. Adds CSS variables consumed by
tailwind config fontFamily definitions.

Body root now uses bg-canvas / dark:bg-dark-canvas (from new tokens).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Update `app/ui/global.css` (remove Apple-system override)

**Files:**
- Modify: `app/ui/global.css`

- [ ] **Step 1: Read current file**

Current content:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Apple system font stack — SF Pro on Apple, Segoe UI on Windows */
html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', Arial, sans-serif;
}

input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-none::-webkit-scrollbar {
  display: none;
}
```

- [ ] **Step 2: Replace with new content (drops `html, body` font override; relies on Tailwind `font-sans` from `<body>`)**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Hide native number-input spinners across browsers */
input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Utility: hide custom scrollbars while keeping scroll functionality */
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-none::-webkit-scrollbar {
  display: none;
}
```

- [ ] **Step 3: Run lint + typecheck**

Run: `pnpm lint && pnpm tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add app/ui/global.css
git commit -m "chore(css): drop Apple-system font override in global.css

Body className font-sans (set in Task 4) now drives default font,
sourced from tailwind fontFamily.sans which resolves to Inter via
CSS variable.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Final Tailwind config sanity (config block re-formatted, full file shown)

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Open file and confirm full state matches the target below**

Target full file content:
```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bottom-[68px]',
    'bottom-[70px]',
    'bottom-[72px]',
    'px-8',
    'px-12',
    'px-14',
    'px-16',
    'bottom-[calc(env(safe-area-inset-bottom)+68px)]',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      fontFamily: {
        display: ['var(--font-newsreader)', 'Georgia', 'serif'],
        sans:    ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
        mono:    ['var(--font-jetbrains-mono)', '"SF Mono"', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-xl': ['64px', { lineHeight: '1.05', letterSpacing: '-1.5px', fontWeight: '400' }],
        'display-lg': ['48px', { lineHeight: '1.10', letterSpacing: '-1px',   fontWeight: '400' }],
        'display-md': ['36px', { lineHeight: '1.15', letterSpacing: '-0.5px', fontWeight: '400' }],
        'display-sm': ['28px', { lineHeight: '1.20', letterSpacing: '-0.3px', fontWeight: '400' }],
        'title-lg':   ['22px', { lineHeight: '1.30', letterSpacing: '0',      fontWeight: '500' }],
        'title-md':   ['18px', { lineHeight: '1.40', letterSpacing: '0',      fontWeight: '500' }],
        'title-sm':   ['16px', { lineHeight: '1.40', letterSpacing: '0',      fontWeight: '500' }],
        'body-md':    ['16px', { lineHeight: '1.55', letterSpacing: '0',      fontWeight: '400' }],
        'body-sm':    ['14px', { lineHeight: '1.55', letterSpacing: '0',      fontWeight: '400' }],
        caption:      ['13px', { lineHeight: '1.40', letterSpacing: '0',      fontWeight: '500' }],
        'caption-uppercase': ['12px', { lineHeight: '1.40', letterSpacing: '1.5px', fontWeight: '500' }],
        code:         ['14px', { lineHeight: '1.60', letterSpacing: '0',      fontWeight: '400' }],
        button:       ['14px', { lineHeight: '1',    letterSpacing: '0',      fontWeight: '500' }],
        'nav-link':   ['14px', { lineHeight: '1.40', letterSpacing: '0',      fontWeight: '500' }],
      },
      borderRadius: {
        btn: '8px',
        card: '12px',
        hero: '16px',
      },
      spacing: {
        section: '96px',
      },
      colors: {
        swin: {
          red: '#C82333',
          charcoal: '#343642',
          black: '#000000',
          ivory: '#FEFDFD',
          gold: '#C9A961',
          'dark-bg': '#0F1115',
          'dark-surface': '#181B21',
        },
        'swin-red-brand': '#C82333',
        primary: '#B83A35',
        'primary-active': '#9A2D29',
        'primary-disabled': '#E6DFD8',
        'dark-primary': '#CC4640',
        canvas: '#FAF9F5',
        'surface-soft': '#F5F0E8',
        'surface-card': '#EFE9DE',
        'surface-cream-strong': '#E8E0D2',
        hairline: '#E6DFD8',
        'hairline-soft': '#EBE6DF',
        'dark-canvas': '#181715',
        'dark-surface-soft': '#1F1E1B',
        'dark-surface-card': '#252320',
        'dark-surface-strong': '#2D2B27',
        'dark-hairline': '#3A3733',
        ink: '#141413',
        'body-strong': '#252523',
        body: '#3D3D3A',
        muted: '#6C6A64',
        'muted-soft': '#8E8B82',
        'on-primary': '#FFFFFF',
        'on-dark': '#FAF9F5',
        'on-dark-soft': '#A09D96',
        'accent-teal': '#5DB8A6',
        'accent-amber': '#E8A55A',
        success: '#5DB872',
        warning: '#D4A017',
        error: '#C64545',
      },
    },
    keyframes: {
      shimmer: { '100%': { transform: 'translateX(100%)' } },
      'border-beam': { '100%': { 'offset-distance': '100%' } },
      'spin-around': {
        '0%':   { transform: 'translateZ(0) rotate(0)' },
        '100%': { transform: 'translateZ(0) rotate(360deg)' },
      },
      'shimmer-slide': {
        to: { transform: 'translate(calc(100cqw - 100%), 0)' },
      },
    },
    animation: {
      'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
      'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
      'shimmer-slide': 'shimmer-slide var(--speed) ease-in-out infinite alternate',
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
```

- [ ] **Step 2: Run lint + typecheck + build smoke test**

Run: `pnpm lint && pnpm tsc --noEmit`
Expected: 0 errors.

(Optional: `pnpm build` to verify production bundle compiles. ~30 seconds.)

- [ ] **Step 3: No new commit needed if Tasks 1–3 already produced the target state.** If diff is non-empty (formatting only), commit:

```bash
git add tailwind.config.ts
git commit -m "chore(tokens): consolidate tailwind config formatting

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Chat 5: Primitives A — Interactive Elements

Components: `Button` (`app/ui/button.tsx`), `Chip`, `StatusBadge`, `FilterPills`, `ScanCtaButton`, `ReminderButton`, `DueDatePicker`, `RoleBadge`.

For each component below, the workflow is the same 5-step recipe:

1. Read the file
2. Apply the **Token Migration Reference Table** (above) to every className
3. Verify type-correct: `pnpm tsc --noEmit`
4. Verify lints clean: `pnpm lint`
5. Stage the file (commit happens at the end of chat 5 covering all of Chat 5's primitives)

Each task below shows the exact target post-migration state for that file.

### Task 7: Migrate `app/ui/button.tsx`

**Files:**
- Modify: `app/ui/button.tsx`

- [ ] **Step 1: Replace file content with target state**

```tsx
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        'flex h-10 items-center rounded-btn bg-primary px-5 font-sans text-button text-on-primary transition-colors',
        'hover:bg-primary-active active:bg-primary-active active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'dark:focus-visible:ring-offset-dark-canvas',
        'aria-disabled:cursor-not-allowed aria-disabled:bg-primary-disabled aria-disabled:text-muted',
        'dark:bg-dark-primary dark:hover:bg-primary-active',
        className,
      )}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Run lint + typecheck**

Run: `pnpm lint && pnpm tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Stage**

```bash
git add app/ui/button.tsx
```

(Do not commit yet. All Chat 5 primitives are committed together at Task 14.)

---

### Task 8: Migrate `app/ui/dashboard/primitives/Chip.tsx`

**Files:**
- Modify: `app/ui/dashboard/primitives/Chip.tsx`

- [ ] **Step 1: Replace file content with target state**

```tsx
import clsx from 'clsx';

type ChipTone = 'default' | 'danger' | 'gold' | 'success' | 'warn';

type ChipProps = {
  children: React.ReactNode;
  tone?: ChipTone;
  mono?: boolean;
  className?: string;
};

const toneClasses: Record<ChipTone, string> = {
  default: 'bg-surface-card text-muted dark:bg-dark-surface-card dark:text-on-dark-soft',
  danger:  'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary',
  gold:    'bg-accent-amber/15 text-accent-amber dark:bg-accent-amber/20 dark:text-accent-amber',
  success: 'bg-success/15 text-success dark:bg-success/20 dark:text-success',
  warn:    'bg-warning/15 text-warning dark:bg-warning/20 dark:text-warning',
};

export default function Chip({ children, tone = 'default', mono = false, className }: ChipProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-pill px-3 py-1 font-sans text-caption leading-none whitespace-nowrap',
        toneClasses[tone],
        mono && 'font-mono tracking-wide',
        className,
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Run lint + typecheck**

Run: `pnpm lint && pnpm tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Stage**

```bash
git add app/ui/dashboard/primitives/Chip.tsx
```

---

### Task 9: Migrate `app/ui/dashboard/primitives/StatusBadge.tsx`

**Files:**
- Modify: `app/ui/dashboard/primitives/StatusBadge.tsx`

Per spec §6.2: shift from full-block colored fills to "cream surface + leading colored dot" pattern. Only `OVERDUE` retains solid primary fill.

- [ ] **Step 1: Replace file content with target state**

```tsx
import clsx from 'clsx';

type BadgeVariant =
  | 'READY'
  | 'QUEUED'
  | 'AVAILABLE'
  | 'ON_LOAN'
  | 'OVERDUE'
  | 'RETURNED'
  | 'CANCELLED'
  | 'DAMAGED'
  | 'BORROWED';

type VariantStyle = {
  container: string;
  dot: string | null;
};

const variantStyles: Record<BadgeVariant, VariantStyle> = {
  READY:     { container: 'bg-surface-card text-ink dark:bg-dark-surface-card dark:text-on-dark', dot: 'bg-accent-teal' },
  QUEUED:    { container: 'bg-surface-card text-ink dark:bg-dark-surface-card dark:text-on-dark', dot: 'bg-accent-amber' },
  AVAILABLE: { container: 'bg-surface-card text-ink dark:bg-dark-surface-card dark:text-on-dark', dot: 'bg-success' },
  ON_LOAN:   { container: 'bg-surface-card text-ink dark:bg-dark-surface-card dark:text-on-dark', dot: 'bg-accent-amber' },
  OVERDUE:   { container: 'bg-primary text-on-primary dark:bg-dark-primary',                       dot: null },
  RETURNED:  { container: 'bg-surface-soft text-muted dark:bg-dark-surface-soft dark:text-on-dark-soft', dot: null },
  CANCELLED: { container: 'bg-surface-soft text-muted dark:bg-dark-surface-soft dark:text-on-dark-soft', dot: null },
  DAMAGED:   { container: 'bg-surface-cream-strong text-ink dark:bg-dark-surface-strong dark:text-on-dark', dot: 'bg-warning' },
  BORROWED:  { container: 'bg-surface-card text-ink dark:bg-dark-surface-card dark:text-on-dark', dot: 'bg-accent-teal' },
};

type StatusBadgeProps = {
  status: BadgeVariant;
  className?: string;
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const { container, dot } = variantStyles[status];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-pill px-3 py-1 font-sans text-caption-uppercase whitespace-nowrap',
        container,
        className,
      )}
    >
      {dot && <span className={clsx('inline-block h-1.5 w-1.5 rounded-full', dot)} aria-hidden />}
      {status.replace('_', ' ')}
    </span>
  );
}
```

- [ ] **Step 2: Run lint + typecheck**

Run: `pnpm lint && pnpm tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Stage**

```bash
git add app/ui/dashboard/primitives/StatusBadge.tsx
```

---

### Task 10: Migrate `app/ui/dashboard/primitives/FilterPills.tsx`

**Files:**
- Modify: `app/ui/dashboard/primitives/FilterPills.tsx`

- [ ] **Step 1: Read the current file** (`Read app/ui/dashboard/primitives/FilterPills.tsx`)

- [ ] **Step 2: Apply the Token Migration Reference Table** to every className. Specifically:
  - Inactive pill: `bg-surface-card text-muted dark:bg-dark-surface-card dark:text-on-dark-soft`
  - Active pill: `bg-surface-cream-strong text-ink dark:bg-dark-surface-strong dark:text-on-dark`
  - Container: `rounded-pill` (already pill); padding `px-3 py-1.5`
  - Typography: `font-sans text-nav-link`
  - Hover: `hover:bg-surface-cream-strong dark:hover:bg-dark-surface-strong`
  - Focus: standard `focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas`

- [ ] **Step 3: Run lint + typecheck**

Run: `pnpm lint && pnpm tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Stage**

```bash
git add app/ui/dashboard/primitives/FilterPills.tsx
```

---

### Task 11: Migrate `app/ui/dashboard/primitives/ScanCtaButton.tsx`

**Files:**
- Modify: `app/ui/dashboard/primitives/ScanCtaButton.tsx`

- [ ] **Step 1: Read current file**

- [ ] **Step 2: Apply Token Migration Reference Table; specifically:**
  - Container: `bg-primary text-on-primary rounded-btn px-5 h-10 font-sans text-button` (or larger if it's the hero CTA — keep current size class)
  - Hover: `hover:bg-primary-active`
  - Active: `active:bg-primary-active active:scale-[0.98]`
  - Focus: standard primary focus ring
  - Disabled: `disabled:bg-primary-disabled disabled:text-muted disabled:cursor-not-allowed`
  - Dark: `dark:bg-dark-primary`

- [ ] **Step 3: Run lint + typecheck**

Run: `pnpm lint && pnpm tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Stage**

```bash
git add app/ui/dashboard/primitives/ScanCtaButton.tsx
```

---

### Task 12: Migrate `app/ui/dashboard/primitives/ReminderButton.tsx`

**Files:**
- Modify: `app/ui/dashboard/primitives/ReminderButton.tsx`

- [ ] **Step 1: Read current file**

- [ ] **Step 2: Apply Token Migration Reference Table.** ReminderButton is a secondary CTA (per spec §6.3 "Disabled" rule for throttled state):
  - Default: `bg-surface-card border border-hairline text-ink rounded-btn px-4 h-10 font-sans text-button hover:bg-surface-cream-strong`
  - Throttled (disabled): `bg-primary-disabled text-muted cursor-not-allowed border-transparent`
  - Dark: `dark:bg-dark-surface-card dark:border-dark-hairline dark:text-on-dark dark:hover:bg-dark-surface-strong`

- [ ] **Step 3: Run lint + typecheck**

- [ ] **Step 4: Stage**

```bash
git add app/ui/dashboard/primitives/ReminderButton.tsx
```

---

### Task 13: Migrate `app/ui/dashboard/primitives/DueDatePicker.tsx` and `RoleBadge.tsx`

**Files:**
- Modify: `app/ui/dashboard/primitives/DueDatePicker.tsx`
- Modify: `app/ui/dashboard/primitives/RoleBadge.tsx`

- [ ] **Step 1: For each file, read it then apply Token Migration Reference Table**

- [ ] **Step 2: For RoleBadge specifically, follow the same "container + dot" pattern as StatusBadge** if visually a status indicator; otherwise treat as a Chip variant.

- [ ] **Step 3: For DueDatePicker, the date input uses `bg-canvas border border-hairline rounded-btn px-3 h-10 font-sans text-body-md text-ink focus-visible:ring-2 focus-visible:ring-primary/40 dark:bg-dark-surface-soft dark:border-dark-hairline dark:text-on-dark`**

- [ ] **Step 4: Run lint + typecheck**

- [ ] **Step 5: Stage**

```bash
git add app/ui/dashboard/primitives/DueDatePicker.tsx app/ui/dashboard/primitives/RoleBadge.tsx
```

---

### Task 14: Commit Chat 5 (all interactive primitives)

- [ ] **Step 1: Verify all Chat 5 files are staged**

Run: `git status`
Expected: 8 files staged: `button.tsx`, `Chip.tsx`, `StatusBadge.tsx`, `FilterPills.tsx`, `ScanCtaButton.tsx`, `ReminderButton.tsx`, `DueDatePicker.tsx`, `RoleBadge.tsx`.

- [ ] **Step 2: Run final lint + typecheck**

Run: `pnpm lint && pnpm tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Verify no legacy token residue in this batch's files**

Run:
```bash
git diff --cached -- app/ui/button.tsx app/ui/dashboard/primitives/{Chip,StatusBadge,FilterPills,ScanCtaButton,ReminderButton,DueDatePicker,RoleBadge}.tsx | grep -E "swin-(red|charcoal|gold|ivory|dark-bg|dark-surface)" || echo "no residue"
```
Expected: `no residue`. (The negative grep returns no matches.)

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(ui): migrate Batch 1 primitives A — interactive elements

Button, Chip, StatusBadge, FilterPills, ScanCtaButton, ReminderButton,
DueDatePicker, RoleBadge — all migrated to new design tokens
(canvas/surface/primary/ink) with paired dark variants.

StatusBadge restructured to 'cream surface + leading colored dot'
pattern per spec §6.2; only OVERDUE retains solid primary fill.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 5: Update progress.md** (see project root) — set "Last completed: Chat 5 — Primitives A"; "Next: Chat 6 — Primitives B (content cards)".

---

## Chat 6: Primitives B — Content Cards

Components: `KpiCard`, `SectionCard`, `LoanCard`, `HoldCard`, `NotificationItem`, `TransactionReceipt`, `UserAvatar`.

### Task 15: Migrate `app/ui/dashboard/primitives/KpiCard.tsx`

**Files:**
- Modify: `app/ui/dashboard/primitives/KpiCard.tsx`

- [ ] **Step 1: Replace file content with target state**

```tsx
import clsx from 'clsx';

type KpiCardProps = {
  label: string;
  value: string | number;
  delta?: string;
  positive?: boolean;
  danger?: boolean;
  footer?: string;
  className?: string;
};

export default function KpiCard({
  label,
  value,
  delta,
  positive,
  danger,
  footer = 'this week',
  className,
}: KpiCardProps) {
  return (
    <div
      className={clsx(
        'rounded-card border border-hairline bg-surface-card px-8 pb-6 pt-7',
        'dark:border-dark-hairline dark:bg-dark-surface-card',
        className,
      )}
    >
      <p className="mb-3 font-sans text-caption-uppercase text-muted-soft dark:text-on-dark-soft">
        {label}
      </p>
      <p className="font-display text-display-sm text-ink dark:text-on-dark">
        {value}
      </p>
      {delta && (
        <p
          className={clsx(
            'mt-3 font-mono text-caption font-semibold',
            danger ? 'text-primary' : positive ? 'text-success' : 'text-primary',
          )}
        >
          {delta}{' '}
          <span className="font-medium text-muted-soft dark:text-on-dark-soft">
            {footer}
          </span>
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run lint + typecheck**

Run: `pnpm lint && pnpm tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Stage**

```bash
git add app/ui/dashboard/primitives/KpiCard.tsx
```

---

### Task 16: Migrate `SectionCard.tsx`, `LoanCard.tsx`, `HoldCard.tsx`

**Files:**
- Modify: `app/ui/dashboard/primitives/SectionCard.tsx`
- Modify: `app/ui/dashboard/primitives/LoanCard.tsx`
- Modify: `app/ui/dashboard/primitives/HoldCard.tsx`

For each: read current file, apply Token Migration Reference Table. Target visual recipe:

**SectionCard** (large content panel):
- Container: `bg-surface-card border border-hairline rounded-card p-8 dark:bg-dark-surface-card dark:border-dark-hairline`
- Title: `font-display text-display-sm text-ink dark:text-on-dark`
- Subtitle: `font-sans text-body-md text-body dark:text-on-dark-soft`

**LoanCard / HoldCard** (list-row card):
- Container: `bg-surface-card border border-hairline rounded-card p-5 dark:bg-dark-surface-card dark:border-dark-hairline`
- Hover: `hover:border-primary/20 dark:hover:border-dark-primary/30`
- Book name: `font-sans text-title-md text-ink dark:text-on-dark`
- Author: `font-sans text-body-sm text-muted dark:text-on-dark-soft`
- Due date: `font-sans text-caption text-muted dark:text-on-dark-soft`; when due in <3 days, swap to `text-warning`
- Barcode: `font-mono text-code text-muted dark:text-on-dark-soft`

- [ ] **Step 1: Read each file**
- [ ] **Step 2: Apply migration; show new file content; save**
- [ ] **Step 3: Run lint + typecheck**

Run: `pnpm lint && pnpm tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Stage**

```bash
git add app/ui/dashboard/primitives/SectionCard.tsx app/ui/dashboard/primitives/LoanCard.tsx app/ui/dashboard/primitives/HoldCard.tsx
```

---

### Task 17: Migrate `NotificationItem.tsx`, `TransactionReceipt.tsx`, `UserAvatar.tsx`

**Files:**
- Modify: `app/ui/dashboard/primitives/NotificationItem.tsx`
- Modify: `app/ui/dashboard/primitives/TransactionReceipt.tsx`
- Modify: `app/ui/dashboard/primitives/UserAvatar.tsx`

Migration recipes:

**NotificationItem:**
- Container: `bg-surface-card border-b border-hairline px-5 py-4 dark:bg-dark-surface-card dark:border-dark-hairline`
- Unread state: prepend `bg-primary/5 border-l-4 border-l-primary` instead of border-b
- Title: `font-sans text-title-sm text-ink dark:text-on-dark`
- Body: `font-sans text-body-sm text-body dark:text-on-dark-soft`
- Timestamp: `font-sans text-caption text-muted-soft dark:text-on-dark-soft`

**TransactionReceipt:**
- Container: `bg-canvas border border-hairline rounded-card p-6 dark:bg-dark-canvas dark:border-dark-hairline`
- Section heading: `font-sans text-caption-uppercase text-muted dark:text-on-dark-soft`
- Receipt rows: `font-mono text-code text-ink dark:text-on-dark`
- Total row: `font-display text-display-sm text-ink dark:text-on-dark`

**UserAvatar:**
- Container: `rounded-full` (no change to round-full); fallback bg from `bg-swin-charcoal` → `bg-surface-cream-strong text-ink dark:bg-dark-surface-strong dark:text-on-dark`
- Border: `border-2 border-hairline dark:border-dark-hairline`

- [ ] **Step 1: Read each file**
- [ ] **Step 2: Apply migrations**
- [ ] **Step 3: Run lint + typecheck**
- [ ] **Step 4: Stage**

```bash
git add app/ui/dashboard/primitives/NotificationItem.tsx app/ui/dashboard/primitives/TransactionReceipt.tsx app/ui/dashboard/primitives/UserAvatar.tsx
```

---

### Task 18: Commit Chat 6

- [ ] **Step 1: `git status` — confirm 7 files staged**

- [ ] **Step 2: Run lint + typecheck**

Run: `pnpm lint && pnpm tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Verify no residue**

```bash
git diff --cached -- app/ui/dashboard/primitives/{KpiCard,SectionCard,LoanCard,HoldCard,NotificationItem,TransactionReceipt,UserAvatar}.tsx | grep -E "swin-(red|charcoal|gold|ivory|dark-bg|dark-surface)" || echo "no residue"
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(ui): migrate Batch 1 primitives B — content cards

KpiCard, SectionCard, LoanCard, HoldCard, NotificationItem,
TransactionReceipt, UserAvatar — all migrated to surface-card +
hairline + new typography tokens.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 5: Update progress.md** — "Last completed: Chat 6 — Primitives B"; "Next: Chat 7 — Primitives C + dev gallery".

---

## Chat 7: Primitives C — Supporting Components + Dev Gallery

Components: `BookCover`, `BarChartMini`, `IsbnLookupBox`, `BarcodePreview`. Plus new file: `app/dev/primitives/page.tsx` + `app/dev/layout.tsx`.

### Task 19: Migrate `BookCover.tsx`, `BarChartMini.tsx`

**Files:**
- Modify: `app/ui/dashboard/primitives/BookCover.tsx`
- Modify: `app/ui/dashboard/primitives/BarChartMini.tsx`

Recipes:

**BookCover:**
- Container: `bg-surface-card rounded-card overflow-hidden dark:bg-dark-surface-card`
- Placeholder fallback: `bg-surface-cream-strong text-muted dark:bg-dark-surface-strong dark:text-on-dark-soft`
- Aspect ratio: keep current (`aspect-[2/3]` typical for book cover)
- No shadow per spec §6.4

**BarChartMini:**
- Bars: `fill-primary` (or via inline style with `bg-primary` if HTML bars)
- Background bars / track: `bg-surface-cream-strong dark:bg-dark-surface-strong`
- Axis labels: `font-mono text-caption text-muted dark:text-on-dark-soft`

- [ ] **Step 1: Read each file**
- [ ] **Step 2: Apply migrations**
- [ ] **Step 3: Run lint + typecheck**
- [ ] **Step 4: Stage**

```bash
git add app/ui/dashboard/primitives/BookCover.tsx app/ui/dashboard/primitives/BarChartMini.tsx
```

---

### Task 20: Migrate `IsbnLookupBox.tsx`, `BarcodePreview.tsx`

**Files:**
- Modify: `app/ui/dashboard/primitives/IsbnLookupBox.tsx`
- Modify: `app/ui/dashboard/primitives/BarcodePreview.tsx`

Recipes:

**IsbnLookupBox** (text input + Lookup + Scan buttons):
- Wrapper: `flex gap-2 items-center`
- Input: `flex-1 bg-canvas border border-hairline rounded-btn px-3 h-10 font-sans text-body-md text-ink placeholder:text-muted-soft focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary dark:bg-dark-surface-soft dark:border-dark-hairline dark:text-on-dark`
- Lookup button: re-uses `<Button>` primary variant
- Scan button: `bg-surface-card text-ink border border-hairline rounded-btn px-4 h-10 font-sans text-button hover:bg-surface-cream-strong dark:bg-dark-surface-card dark:border-dark-hairline dark:text-on-dark`

**BarcodePreview** (shows barcode as monospace text + visual barcode):
- Container: `bg-canvas border border-hairline rounded-card p-6 dark:bg-dark-canvas dark:border-dark-hairline`
- Barcode digits: `font-mono text-code text-ink dark:text-on-dark`
- Helper text: `font-sans text-caption text-muted dark:text-on-dark-soft`
- Visual barcode bars: keep current SVG/CSS, but if any color: use `bg-ink dark:bg-on-dark`

- [ ] **Step 1: Read each file**
- [ ] **Step 2: Apply migrations**
- [ ] **Step 3: Run lint + typecheck**
- [ ] **Step 4: Stage**

```bash
git add app/ui/dashboard/primitives/IsbnLookupBox.tsx app/ui/dashboard/primitives/BarcodePreview.tsx
```

---

### Task 21: Create `/dev/primitives` gallery page

**Files:**
- Create: `app/dev/layout.tsx`
- Create: `app/dev/primitives/page.tsx`

The gallery shows every migrated primitive in both light and dark contexts so you (the user) can visually verify Batch 1 in one place. Removed in Batch 3 final cleanup.

- [ ] **Step 1: Create `app/dev/layout.tsx`**

```tsx
import { notFound } from 'next/navigation';

export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }
  return <>{children}</>;
}
```

- [ ] **Step 2: Create `app/dev/primitives/page.tsx`**

```tsx
import { Button } from '@/app/ui/button';
import Chip from '@/app/ui/dashboard/primitives/Chip';
import StatusBadge from '@/app/ui/dashboard/primitives/StatusBadge';
import KpiCard from '@/app/ui/dashboard/primitives/KpiCard';

export default function PrimitivesGalleryPage() {
  return (
    <div className="min-h-screen">
      <Section title="Light theme" themeClass="bg-canvas text-ink">
        <Gallery />
      </Section>
      <Section title="Dark theme" themeClass="dark bg-dark-canvas text-on-dark">
        <Gallery />
      </Section>
    </div>
  );
}

function Section({
  title,
  themeClass,
  children,
}: {
  title: string;
  themeClass: string;
  children: React.ReactNode;
}) {
  return (
    <div className={themeClass}>
      <div className="mx-auto max-w-6xl px-8 py-section">
        <h1 className="font-display text-display-lg mb-12">{title}</h1>
        {children}
      </div>
    </div>
  );
}

function Gallery() {
  return (
    <div className="space-y-12">
      {/* Buttons */}
      <div>
        <h2 className="font-sans text-caption-uppercase text-muted mb-4">Buttons</h2>
        <div className="flex gap-3">
          <Button>Primary action</Button>
          <Button disabled aria-disabled>Disabled</Button>
        </div>
      </div>

      {/* Chips */}
      <div>
        <h2 className="font-sans text-caption-uppercase text-muted mb-4">Chips</h2>
        <div className="flex gap-2 flex-wrap">
          <Chip>default</Chip>
          <Chip tone="danger">danger</Chip>
          <Chip tone="gold">gold</Chip>
          <Chip tone="success">success</Chip>
          <Chip tone="warn">warn</Chip>
          <Chip mono>BARCODE-123</Chip>
        </div>
      </div>

      {/* Status badges */}
      <div>
        <h2 className="font-sans text-caption-uppercase text-muted mb-4">Status badges</h2>
        <div className="flex gap-2 flex-wrap">
          <StatusBadge status="READY" />
          <StatusBadge status="QUEUED" />
          <StatusBadge status="AVAILABLE" />
          <StatusBadge status="ON_LOAN" />
          <StatusBadge status="OVERDUE" />
          <StatusBadge status="RETURNED" />
          <StatusBadge status="CANCELLED" />
          <StatusBadge status="DAMAGED" />
          <StatusBadge status="BORROWED" />
        </div>
      </div>

      {/* KPI cards */}
      <div>
        <h2 className="font-sans text-caption-uppercase text-muted mb-4">KPI cards</h2>
        <div className="grid grid-cols-3 gap-4">
          <KpiCard label="BORROWED" value="42" delta="+5" positive />
          <KpiCard label="OVERDUE" value="3" delta="−2" danger />
          <KpiCard label="AVAILABLE" value="187" />
        </div>
      </div>

      {/* Typography ladder */}
      <div>
        <h2 className="font-sans text-caption-uppercase text-muted mb-4">Typography</h2>
        <div className="space-y-4">
          <p className="font-display text-display-xl">display-xl 64</p>
          <p className="font-display text-display-lg">display-lg 48</p>
          <p className="font-display text-display-md">display-md 36</p>
          <p className="font-display text-display-sm">display-sm 28</p>
          <p className="font-sans text-title-lg">title-lg 22</p>
          <p className="font-sans text-title-md">title-md 18</p>
          <p className="font-sans text-title-sm">title-sm 16</p>
          <p className="font-sans text-body-md">body-md 16 — running text default. The quick brown fox jumps over the lazy dog.</p>
          <p className="font-sans text-body-sm">body-sm 14 — secondary running text.</p>
          <p className="font-sans text-caption">caption 13</p>
          <p className="font-sans text-caption-uppercase">caption-uppercase 12</p>
          <p className="font-mono text-code">code 14 — 9780134685991</p>
        </div>
      </div>

      {/* Color tokens swatch */}
      <div>
        <h2 className="font-sans text-caption-uppercase text-muted mb-4">Color tokens</h2>
        <div className="grid grid-cols-6 gap-2 text-caption">
          <Swatch className="bg-canvas border border-hairline" label="canvas" />
          <Swatch className="bg-surface-soft" label="surface-soft" />
          <Swatch className="bg-surface-card" label="surface-card" />
          <Swatch className="bg-surface-cream-strong" label="cream-strong" />
          <Swatch className="bg-primary text-on-primary" label="primary" />
          <Swatch className="bg-primary-active text-on-primary" label="primary-active" />
          <Swatch className="bg-success text-on-primary" label="success" />
          <Swatch className="bg-warning text-ink" label="warning" />
          <Swatch className="bg-error text-on-primary" label="error" />
          <Swatch className="bg-accent-teal text-on-primary" label="accent-teal" />
          <Swatch className="bg-accent-amber text-ink" label="accent-amber" />
          <Swatch className="bg-ink text-on-dark" label="ink" />
        </div>
      </div>
    </div>
  );
}

function Swatch({ className, label }: { className: string; label: string }) {
  return (
    <div className={`${className} rounded-btn h-16 flex items-end p-2 font-sans text-caption`}>
      {label}
    </div>
  );
}
```

- [ ] **Step 3: Boot dev server, navigate to `http://localhost:3000/dev/primitives`**

Run: `pnpm dev`
User performs visual review. Both light and dark sections render side by side; all primitives readable, contrasts pass, fonts loaded (Newsreader on display, Inter on body, JetBrains Mono on code/barcode).

- [ ] **Step 4: Run lint + typecheck**

Run: `pnpm lint && pnpm tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Stage**

```bash
git add app/dev/layout.tsx app/dev/primitives/page.tsx
```

---

### Task 22: Commit Chat 7

- [ ] **Step 1: `git status` — confirm 4 primitive files + 2 new dev files staged (6 total)**

- [ ] **Step 2: Run lint + typecheck**

Run: `pnpm lint && pnpm tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(ui): migrate Batch 1 primitives C + add dev gallery

BookCover, BarChartMini, IsbnLookupBox, BarcodePreview migrated to
new tokens.

Adds /dev/primitives gallery page (dev-only, NODE_ENV gated) showing
all migrated primitives in light and dark variants for visual review.
Page will be removed during Batch 3 cleanup.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 4: Update progress.md** — "Last completed: Chat 7 — Primitives C + dev gallery"; "Next: Chat 8 — Shell + chrome".

---

## Chat 8: Shell + Global Chrome + Final Batch 1 QA

Components: `dashboardShell`, `adminShell`, `dashboardTitleBar`, `signOutButton`, `themeToggle`. Then Batch 1 grep audit + commit.

### Task 23: Migrate `dashboardShell.tsx`

**Files:**
- Modify: `app/ui/dashboard/dashboardShell.tsx`

- [ ] **Step 1: Read current file fully** (this plan saw the first 40 lines)

- [ ] **Step 2: Apply Token Migration Reference Table; specifically:**

The current root `<div>` has `bg-swin-dark-bg text-white` / `bg-slate-50 text-swin-charcoal` based on `isDark` boolean. Replace:

```tsx
// before
<div className={isDark ? 'bg-swin-dark-bg text-white' : 'bg-slate-50 text-swin-charcoal'}>

// after
<div className="bg-canvas text-ink dark:bg-dark-canvas dark:text-on-dark">
```

Note: with `darkMode: 'class'` and `<html className="dark">` toggled by `ThemeProvider`, the conditional becomes unnecessary. The `useTheme()` hook usage in `dashboardShell` may still be needed if other branches depend on `theme`; if not, this simplifies to a plain JSX block — but **don't remove `useTheme()` calls if other code in the file depends on them**. Replace only the className branch.

- [ ] **Step 3: Run lint + typecheck**

Run: `pnpm lint && pnpm tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Stage**

```bash
git add app/ui/dashboard/dashboardShell.tsx
```

---

### Task 24: Migrate `adminShell.tsx`, `dashboardTitleBar.tsx`

**Files:**
- Modify: `app/ui/dashboard/adminShell.tsx`
- Modify: `app/ui/dashboard/dashboardTitleBar.tsx`

Recipes:

**adminShell:** mirror `dashboardShell` migration. Apply table-replacements verbatim.

**dashboardTitleBar:**
- Container: `bg-canvas border-b border-hairline px-6 py-5 dark:bg-dark-canvas dark:border-dark-hairline`
- H1: `font-display text-display-lg text-ink tracking-tight dark:text-on-dark`
- Subtitle: `font-sans text-body-md text-body dark:text-on-dark-soft`
- **Logo / Swinburne brand mark**: ensure any usage uses `text-swin-red-brand` (the new alias of `#C82333`), NOT `text-primary`. This is the brand-bearing position per spec Q3.

- [ ] **Step 1: Read both files**
- [ ] **Step 2: Apply migrations; verify logo retains `swin-red-brand`**
- [ ] **Step 3: Run lint + typecheck**
- [ ] **Step 4: Stage**

```bash
git add app/ui/dashboard/adminShell.tsx app/ui/dashboard/dashboardTitleBar.tsx
```

---

### Task 25: Migrate `signOutButton.tsx`, `themeToggle.tsx`

**Files:**
- Modify: `app/ui/dashboard/signOutButton.tsx`
- Modify: `app/ui/theme/themeToggle.tsx`

Recipes:

**signOutButton:** secondary CTA pattern:
- `bg-surface-card border border-hairline text-ink rounded-btn px-4 h-10 font-sans text-button hover:bg-surface-cream-strong dark:bg-dark-surface-card dark:border-dark-hairline dark:text-on-dark dark:hover:bg-dark-surface-strong`

**themeToggle:**
- Container button: `bg-surface-card border border-hairline rounded-full p-2 dark:bg-dark-surface-card dark:border-dark-hairline`
- Icon color: `text-ink dark:text-on-dark`
- Hover: `hover:bg-surface-cream-strong dark:hover:bg-dark-surface-strong`
- Focus: standard primary focus ring

- [ ] **Step 1: Read both files**
- [ ] **Step 2: Apply migrations**
- [ ] **Step 3: Run lint + typecheck**
- [ ] **Step 4: Stage**

```bash
git add app/ui/dashboard/signOutButton.tsx app/ui/theme/themeToggle.tsx
```

---

### Task 26: Final Batch 1 quality gate

- [ ] **Step 1: Run full project lint + typecheck**

Run: `pnpm lint && pnpm tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Verify Cormorant fully removed**

Run:
```bash
grep -rn "Cormorant" app/ tailwind.config.ts || echo "Cormorant removed"
```
Expected: `Cormorant removed`.

- [ ] **Step 3: Verify all Batch 1 files are migrated (no stale legacy tokens in just-migrated files)**

Run:
```bash
grep -rn "swin-charcoal\|swin-ivory\|swin-gold\|swin-dark-bg\|swin-dark-surface" \
  app/ui/button.tsx \
  app/ui/dashboard/primitives/ \
  app/ui/dashboard/dashboardShell.tsx \
  app/ui/dashboard/adminShell.tsx \
  app/ui/dashboard/dashboardTitleBar.tsx \
  app/ui/dashboard/signOutButton.tsx \
  app/ui/theme/themeToggle.tsx \
  || echo "no residue in Batch 1 files"
```
Expected: `no residue in Batch 1 files`.

(`swin-red` may still appear elsewhere — that's OK, it's used by non-Batch-1 files and will be migrated in Batch 2/3.)

- [ ] **Step 4: User performs visual smoke test**

User boots `pnpm dev`, opens `http://localhost:3000/dev/primitives`, toggles theme, verifies:
- Light section: cream canvas; primary buttons in warmed red; Newsreader serif on display text; sans on body
- Dark section: warm dark canvas (#181715); dark-primary brighter than light primary; all text legible
- No FOUT/font flash on first load

- [ ] **Step 5: Commit Chat 8**

```bash
git commit -m "feat(ui): migrate Batch 1 shell + chrome; complete Batch 1

dashboardShell, adminShell, dashboardTitleBar, signOutButton,
themeToggle migrated. Logo retains official swin-red-brand
(#C82333) per dual-track decision.

Batch 1 complete: token system + fonts + 18 primitives + shell
all on the new design language. Legacy swin-* tokens retained as
aliases; non-Batch-1 files (student/admin pages) still consume them
and will be migrated in Batches 2/3.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 6: Update progress.md** — "Batch 1 COMPLETE. Next chat starts Batch 2 (student-facing pages). Plan for Batch 2 to be generated in a fresh session by invoking writing-plans against the spec batch-2 section."

---

## Batch 1 Acceptance Summary

After Task 26, all of these MUST be true:

- [ ] `bg-canvas` renders `#FAF9F5` in light, `#181715` in dark
- [ ] Toggling dark/light correctly switches all tokenized elements
- [ ] All primitives render correctly at `/dev/primitives` in both modes
- [ ] Newsreader self-hosted; DevTools shows zero `fonts.googleapis.com` requests
- [ ] Cormorant Garamond fully removed (grep returns no results)
- [ ] `swin-red-brand` alias resolves to `#C82333` and is consumable by logo components
- [ ] Legacy `swin-charcoal`/`swin-ivory`/`swin-gold`/`swin-dark-bg`/`swin-dark-surface` removed from Batch 1 files (still allowed elsewhere pending Batches 2/3)
- [ ] `pnpm lint && pnpm tsc --noEmit` clean
- [ ] All commits are local; user has not been asked to push

---

## Notes for Subsequent Batches

- Batch 2 (student-facing pages) and Batch 3 (admin/staff pages) will be planned in their own sessions. Do not pre-write those plans here.
- The Token Migration Reference Table at the top of this document is the canonical recipe; Batch 2/3 plans will reference it and add page-specific patterns as needed.
- Legacy `swin-*` tokens (besides `swin-red-brand`) can only be deleted from `tailwind.config.ts` after **all** consumers across all batches are migrated — that deletion is the final step of Batch 3.
