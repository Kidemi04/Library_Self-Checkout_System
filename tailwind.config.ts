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
        pill: '9999px',
      },
      spacing: {
        section: '96px',
      },
      colors: {
        // Legacy Swinburne tokens — Batch 3 cleanup retained `red` (used by
        // bg-swin-red/text-swin-red across surfaces still showing brand red)
        // and `black` (tooling). Charcoal/ivory/gold/dark-bg/dark-surface
        // dropped per spec §7 acceptance criterion (Chat 16 Task 30).
        swin: {
          red: '#C82333',
          black: '#000000',
        },

        // Brand: dual-track Swinburne red
        'swin-red-brand': '#C82333',          // logo / brand-mark only
        primary:          '#B83A35',          // UI CTA, links, focus rings
        'primary-active': '#9A2D29',
        'primary-disabled': '#E2E2E7',
        'dark-primary':   '#CC4640',          // dark-mode primary

        // Surface — light (neutral white/grey, no warm tint)
        canvas:                 '#FAFAFA',
        'surface-soft':         '#F5F5F6',
        'surface-card':         '#EDEDED',
        'surface-cream-strong': '#E5E5E5',
        hairline:               '#E2E2E2',
        'hairline-soft':        '#EBEBEB',

        // Surface — dark (neutral zinc-grey, no brown/warm tint)
        'dark-canvas':          '#18181B',
        'dark-surface-soft':    '#1F1F23',
        'dark-surface-card':    '#27272A',
        'dark-surface-strong':  '#2E2E32',
        'dark-hairline':        '#3F3F46',

        // Text (neutral zinc, no warm tint)
        ink:           '#18181B',
        'body-strong': '#27272A',
        body:          '#3F3F46',
        muted:         '#71717A',
        'muted-soft':  '#A1A1AA',
        'on-primary':  '#FFFFFF',
        'on-dark':     '#FAFAFA',
        'on-dark-soft':'#A1A1AA',

        // Accent
        'accent-teal':  '#5DB8A6',
        'accent-amber': '#E8A55A',

        // Semantic
        success: '#5DB872',
        warning: '#D4A017',
        error:   '#C64545',
      },
    },
    keyframes: {
      shimmer: {
        '100%': {
          transform: 'translateX(100%)',
        },
      },
      "border-beam": {
        "100%": {
          "offset-distance": "100%",
        },
      },
      "spin-around": {
        "0%": {
          transform: "translateZ(0) rotate(0)",
        },
        "100%": {
          transform: "translateZ(0) rotate(360deg)",
        },
      },
      "shimmer-slide": {
        to: {
          transform: "translate(calc(100cqw - 100%), 0)",
        },
      },
    },
    animation: {
      "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
      "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
      "shimmer-slide": "shimmer-slide var(--speed) ease-in-out infinite alternate",
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
